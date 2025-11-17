import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import * as Yup from 'yup';
import DataTable from 'react-data-table-component';
import { useAuth } from '../../contexts/AuthContext';
import { auth } from '../../utils/firebase';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Select,
    MenuItem,
    FormControl,
    InputLabel,
    FormHelperText,
    Checkbox,
    FormControlLabel,
    Button,
    Grid,
    ImageList,
    ImageListItem,
    Chip,
    Stack,
    Alert,
    Box,
    Divider,
    InputAdornment,
    Tooltip,
    Typography
} from '@mui/material';

const ProductsManagement = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showAddForm, setShowAddForm] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);
    const [images, setImages] = useState([]);
    const [imagePreviews, setImagePreviews] = useState([]);
    const [clearExistingImages, setClearExistingImages] = useState(false);
    const [removedExisting, setRemovedExisting] = useState([]); // track objects { public_id, url }
    const [selectedIds, setSelectedIds] = useState([]);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [deleteDialogState, setDeleteDialogState] = useState({ mode: 'single', id: null, count: 0 });
    const [deleting, setDeleting] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        price: '',
        description: '',
        category: '',
        stock: '',
        brand: '',
        featured: false
    });
    const [formErrors, setFormErrors] = useState({});
    const { isAuthenticated, user, loading: authLoading } = useAuth();

    const MAX_IMAGES = 6;

    const productSchema = Yup.object().shape({
        name: Yup.string().trim().min(2).required(),
        price: Yup.number().positive().required(),
        description: Yup.string().min(10).required(),
        category: Yup.string().required(),
        stock: Yup.number().integer().min(0).required(),
        brand: Yup.string().trim().min(2).required(),
        featured: Yup.boolean(),
    });

    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        try {
            const { data } = await axios.get('/products');
            setProducts(data.products);
            setLoading(false);
        } catch (error) {
            toast.error('Failed to fetch products');
            setLoading(false);
        }
    };

    const handleInputChange = (e) =>
        setFormData({ ...formData, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            if (authLoading) return; // wait until auth initializes
            if (!isAuthenticated || (user && user.role !== 'admin')) {
                toast.error('You must be an admin to perform this action');
                return;
            }
            setFormErrors({});
            await productSchema.validate(formData, { abortEarly: false });

            const form = new FormData();
            Object.entries(formData).forEach(([key, value]) => form.append(key, value));
            images.forEach((file) => form.append('images', file));
            if (editingProduct) {
                form.append('clearAllImages', clearExistingImages ? 'true' : 'false');
                if (!clearExistingImages && removedExisting.length > 0) {
                    const publicIds = removedExisting.map(r => r.public_id).filter(Boolean);
                    const urls = removedExisting.map(r => r.url).filter(Boolean);
                    if (publicIds.length > 0) form.append('removeImagePublicIds', JSON.stringify(publicIds));
                    if (urls.length > 0) form.append('removeImageUrls', JSON.stringify(urls));
                }
            }

            const config = { headers: { 'Content-Type': 'multipart/form-data' } };
            try {
                // Refresh Firebase ID token to avoid 401 on admin routes
                if (auth?.currentUser) {
                    const idToken = await auth.currentUser.getIdToken(true);
                    config.headers.Authorization = `Bearer ${idToken}`;
                }
            } catch (_) {
                // fall back to axios defaults
            }

            if (editingProduct) {
                await axios.put(`/admin/product/${editingProduct._id}`, form, config);
                toast.success('Product updated successfully');
            } else {
                await axios.post('/admin/product/new', form, config);
                toast.success('Product created successfully');
            }

            resetForm();
            fetchProducts();

        } catch (error) {
            if (error.name === 'ValidationError') {
                const errs = {};
                error.inner.forEach((err) => {
                    if (!errs[err.path]) errs[err.path] = err.message;
                });
                setFormErrors(errs);
                toast.error('Please fix validation errors.');
            } else {
                const msg = error.response?.data?.message || 'Failed to save product';
                toast.error(msg);
            }
        }
    };

    const handleImageSelect = (e) => {
        const files = Array.from(e.target.files || []);
        if (files.length === 0) return;

        const remaining = MAX_IMAGES - images.length;
        if (remaining <= 0) {
            toast.info(`Maximum ${MAX_IMAGES} images allowed.`);
            return;
        }

        const selected = files.slice(0, remaining);
        setImages((prev) => [...prev, ...selected]);
        const previews = selected.map((file) => ({ url: URL.createObjectURL(file), name: file.name }));
        setImagePreviews((prev) => [...prev, ...previews]);
        if (files.length > remaining) {
            toast.warn(`Only ${remaining} more image${remaining > 1 ? 's' : ''} can be added.`);
        }
    };

    const removeSelectedImage = (index) => {
        setImages((prev) => prev.filter((_, i) => i !== index));
        setImagePreviews((prev) => {
            const toRevoke = prev[index]?.url;
            if (toRevoke) URL.revokeObjectURL(toRevoke);
            return prev.filter((_, i) => i !== index);
        });
    };

    const toggleRemoveExisting = (img) => {
        const key = img.public_id || img.url;
        setRemovedExisting((prev) => {
            const exists = prev.some(r => (r.public_id || r.url) === key);
            return exists
                ? prev.filter(r => (r.public_id || r.url) !== key)
                : [...prev, { public_id: img.public_id, url: img.url }];
        });
    };

    const handleEdit = (product) => {
        setEditingProduct(product);
        setFormData({
            name: product.name,
            price: product.price,
            description: product.description,
            category: product.category,
            stock: product.stock,
            brand: product.brand,
            featured: Boolean(product.featured)
        });
        // Reset new selections; existing images are shown separately
        setImages([]);
        setShowAddForm(true);
        setClearExistingImages(false);
        setRemovedExisting([]);
    };

    const openDeleteSingle = (productId) => {
        setDeleteDialogState({ mode: 'single', id: productId, count: 1 });
        setDeleteDialogOpen(true);
    };

    const resetForm = () => {
        setFormData({
            name: '',
            price: '',
            description: '',
            category: '',
            stock: '',
            brand: ''
        });
        // Revoke any object URLs and reset image selections
        try { imagePreviews.forEach((p) => p?.url && URL.revokeObjectURL(p.url)); } catch (_) {}
        setImages([]);
        setImagePreviews([]);
        setShowAddForm(false);
        setEditingProduct(null);
        setRemovedExisting([]);
    };

    const openDeleteBulk = () => {
        if (selectedIds.length === 0) return toast.info("No selected items");
        setDeleteDialogState({ mode: 'bulk', id: null, count: selectedIds.length });
        setDeleteDialogOpen(true);
    };

    const getAuthConfig = async () => {
        try {
            const token = await auth.currentUser?.getIdToken(true);
            if (token) return { headers: { Authorization: `Bearer ${token}` } };
        } catch (_) {}
        return {};
    };

    const toggleFeatured = async (product) => {
        try {
            const config = await getAuthConfig();
            const next = !Boolean(product.featured);
            await axios.put(`/admin/product/${product._id}`, { featured: next }, config);
            toast.success(next ? 'Marked as Featured' : 'Unfeatured product');
            await fetchProducts();
        } catch (err) {
            const msg = err.response?.data?.message || 'Failed to toggle featured';
            toast.error(msg);
        }
    };

    const confirmDelete = async () => {
        setDeleting(true);
        try {
            const config = await getAuthConfig();
            if (deleteDialogState.mode === 'single' && deleteDialogState.id) {
                await axios.delete(`/admin/product/${deleteDialogState.id}`, config);
                toast.success('Product deleted permanently');
            } else if (deleteDialogState.mode === 'bulk') {
                await axios.post(`/admin/products/bulk-delete`, { ids: selectedIds }, config);
                toast.success(`Deleted ${deleteDialogState.count} products permanently`);
                setSelectedIds([]);
            }
            setDeleteDialogOpen(false);
            await fetchProducts();
        } catch (err) {
            const msg = err.response?.data?.message || 'Failed to delete product(s)';
            toast.error(msg);
        } finally {
            setDeleting(false);
        }
    };

    // Improved table spacing and readability
    const tableStyles = {
        table: { style: { width: '100%' } },
        headRow: { style: { minHeight: '58px', backgroundColor: '#f7fafc', borderBottom: '1px solid #e2e8f0' } },
        headCells: { style: { fontSize: '14px', fontWeight: 700, color: '#2d3748', padding: '14px 18px' } },
        rows: { style: { minHeight: '60px', fontSize: '14px' } },
        cells: { style: { padding: '14px 18px' } },
        pagination: { style: { padding: '10px 16px' } }
    };

    const columns = [
        {
            name: "Image",
            width: "100px",
            cell: (row) => (
                <img
                    src={row.image}
                    alt={row.name}
                    style={{ width: 50, height: 50, objectFit: "cover", borderRadius: 6 }}
                />
            ),
            sortable: false,
        },
        { name: "Name", selector: (row) => row.name, sortable: true, grow: 3 },
        { name: "Price", selector: (row) => row.price, sortable: true, width: "140px" },
        { name: "Category", selector: (row) => row.category, sortable: true, grow: 2 },
        {
            name: "Featured",
            width: "150px",
            sortable: true,
            cell: (row) => (
                <span className={`status-badge ${row.featured ? 'status-active' : 'status-inactive'}`}>
                    {row.featured ? 'Yes' : 'No'}
                </span>
            ),
        },
        {
            name: "Stock",
            selector: (row) => row.stock,
            sortable: true,
            width: "140px",
            cell: (row) => (
                <span className={`status-badge ${row.stock > 10 ? 'status-active' : 'status-inactive'}`}>
                    {row.stock}
                </span>
            ),
        },
        {
            name: "Rating",
            width: "120px",
            cell: (row) => <>⭐ {row.rating}</>,
            sortable: true,
        },
        {
            name: "Actions",
            width: "260px",
            sortable: false,
            cell: (row) => (
                <div style={{ display: "flex", gap: "8px" }}>
                    <button className="btn btn-secondary btn-sm" onClick={() => handleEdit(row.original)}>
                        Edit
                    </button>
                    <button className="btn btn-outline-primary btn-sm" onClick={() => toggleFeatured(row.original)}>
                        {row.featured ? 'Unfeature' : 'Feature'}
                    </button>
                    <button className="btn btn-danger btn-sm" onClick={() => openDeleteSingle(row.id)}>
                        Delete
                    </button>
                </div>
            ),
        },
    ];

    // ⭐ Convert products → DataGrid rows
    const rows = products.map((p) => ({
        id: p._id,
        name: p.name,
        price: `₱${p.price}`,
        image: p.images?.[0]?.url || "/images/default-product.png",
        stock: p.stock,
        category: p.category,
        featured: Boolean(p.featured),
        // Guard against non-numeric ratings causing toFixed errors
        rating: Number(p.ratings ?? 0).toFixed(1),
        original: p
    }));

    if (loading) return <div className="loading">Loading products...</div>;

    return (
        <div className="products-management">
            <div className="card">
                <div className="card-header d-flex align-items-center justify-content-between">
                    <h2 className="card-title">Products Management</h2>
                    <div>
                        <Button variant="outlined" color="error" sx={{ ml: 1 }} onClick={openDeleteBulk}>
                            Delete Selected
                        </Button>
                    </div>
                </div>

                {/* Delete Confirmation Dialog */}
                <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)} maxWidth="sm" fullWidth>
                    <DialogTitle>
                        {deleteDialogState.mode === 'single' ? 'Delete Product' : 'Delete Selected Products'}
                    </DialogTitle>
                    <DialogContent dividers>
                        <Alert severity="warning" sx={{ mb: 2 }}>
                            Are you sure you want to remove {deleteDialogState.mode === 'single' ? 'this product' : `${deleteDialogState.count} products`}?
                        </Alert>
                        <Box sx={{ color: 'text.secondary' }}>
                            This action is permanent. Deleted item(s) will be removed from MongoDB and cannot be recovered.
                        </Box>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => setDeleteDialogOpen(false)} disabled={deleting}>Cancel</Button>
                        <Button variant="contained" color="error" onClick={confirmDelete} disabled={deleting}>
                            {deleting ? 'Deleting…' : 'Delete'}
                        </Button>
                    </DialogActions>
                </Dialog>

                <Dialog 
                    open={showAddForm} 
                    onClose={resetForm} 
                    fullWidth 
                    maxWidth="md"
                    PaperProps={{ sx: { borderRadius: 3, boxShadow: '0 20px 60px rgba(0,0,0,0.25)' } }}
                >
                    <DialogTitle>
                        <Stack direction="row" alignItems="center" spacing={1}>
                            <Typography variant="h6" fontWeight={700}>
                                {editingProduct ? 'Edit Product' : 'Add New Product'}
                            </Typography>
                            <Chip label={editingProduct ? 'Updating' : 'Creating'} size="small" color={editingProduct ? 'warning' : 'primary'} sx={{ ml: 1 }} />
                        </Stack>
                    </DialogTitle>
                    <DialogContent dividers sx={{ background: 'linear-gradient(135deg, #f8fafc 0%, #eef2f7 100%)' }}>
                        {!isAuthenticated && !authLoading && (
                            <Alert severity="warning" sx={{ mb: 2 }}>
                                You are not logged in. Log in as admin to save changes.
                            </Alert>
                        )}
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                            Fill out the fields below. Images can be added or removed; clearing existing images will remove all current product photos.
                        </Typography>
                        <Box component="form" onSubmit={handleSubmit} noValidate>
                            <Grid container spacing={2}>
                                <Grid item xs={12}>
                                    <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>Basic Information</Typography>
                                    <Divider sx={{ mb: 2 }} />
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <TextField
                                        label="Product Name"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleInputChange}
                                        fullWidth
                                        error={Boolean(formErrors.name)}
                                        helperText={formErrors.name}
                                    />
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <TextField
                                        label="Price"
                                        type="number"
                                        name="price"
                                        value={formData.price}
                                        onChange={handleInputChange}
                                        fullWidth
                                        error={Boolean(formErrors.price)}
                                        helperText={formErrors.price || 'Enter the product price'}
                                        InputProps={{ startAdornment: <InputAdornment position="start">₱</InputAdornment> }}
                                    />
                                </Grid>
                                <Grid item xs={12}>
                                    <TextField
                                        label="Description"
                                        name="description"
                                        value={formData.description}
                                        onChange={handleInputChange}
                                        fullWidth
                                        multiline
                                        minRows={3}
                                        error={Boolean(formErrors.description)}
                                        helperText={formErrors.description}
                                    />
                                </Grid>
                                <Grid item xs={12}>
                                    <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>Classification</Typography>
                                    <Divider sx={{ mb: 2 }} />
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <FormControl fullWidth error={Boolean(formErrors.category)}>
                                        <InputLabel id="category-label">Category</InputLabel>
                                        <Select
                                            labelId="category-label"
                                            label="Category"
                                            name="category"
                                            value={formData.category}
                                            onChange={handleInputChange}
                                        >
                                            <MenuItem value="">Select Category</MenuItem>
                                            <MenuItem value="Shampoo">Shampoo</MenuItem>
                                            <MenuItem value="Conditioner">Conditioner</MenuItem>
                                            <MenuItem value="Hair Oil">Hair Oil</MenuItem>
                                            <MenuItem value="Hair Mask">Hair Mask</MenuItem>
                                            <MenuItem value="Hair Serum">Hair Serum</MenuItem>
                                            <MenuItem value="Hair Spray">Hair Spray</MenuItem>
                                        </Select>
                                        {formErrors.category && <FormHelperText>{formErrors.category}</FormHelperText>}
                                    </FormControl>
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <TextField
                                        label="Brand"
                                        name="brand"
                                        value={formData.brand}
                                        onChange={handleInputChange}
                                        fullWidth
                                        error={Boolean(formErrors.brand)}
                                        helperText={formErrors.brand || 'e.g., Nourishy'}
                                    />
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <FormControlLabel
                                        control={
                                            <Checkbox
                                                name="featured"
                                                checked={Boolean(formData.featured)}
                                                onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                                            />
                                        }
                                        label="Featured product"
                                    />
                                </Grid>
                                <Grid item xs={12}>
                                    <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>Inventory</Typography>
                                    <Divider sx={{ mb: 2 }} />
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <TextField
                                        label="Stock"
                                        type="number"
                                        name="stock"
                                        value={formData.stock}
                                        onChange={handleInputChange}
                                        fullWidth
                                        error={Boolean(formErrors.stock)}
                                        helperText={formErrors.stock || '0 means out of stock'}
                                    />
                                </Grid>
                                <Grid item xs={12}>
                                    <Stack direction="row" alignItems="center" spacing={2}>
                                        <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>Media</Typography>
                                        <Tooltip title="Add up to 6 images">
                                            <Button variant="outlined" component="label">
                                                Choose Files
                                                <input hidden type="file" multiple accept="image/*" onChange={handleImageSelect} />
                                            </Button>
                                        </Tooltip>
                                        <Box component="span" sx={{ color: 'text.secondary' }}>
                                            {images.length}/{MAX_IMAGES} selected
                                        </Box>
                                    </Stack>
                                </Grid>
                                {editingProduct && Array.isArray(editingProduct.images) && editingProduct.images.length > 0 && (
                                    <Grid item xs={12}>
                                        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1 }}>
                                            <strong>Existing Images</strong>
                                            <FormControlLabel
                                                control={
                                                    <Checkbox
                                                        checked={clearExistingImages}
                                                        onChange={(e) => setClearExistingImages(e.target.checked)}
                                                    />
                                                }
                                                label={
                                                    <Tooltip title="Remove all current photos">
                                                        <span>Clear existing images</span>
                                                    </Tooltip>
                                                }
                                            />
                                        </Stack>
                                        <Box sx={{ border: '1px dashed #cbd5e1', borderRadius: 2, p: 1 }}>
                                            <ImageList cols={6} gap={8}>
                                            {editingProduct.images.map((img) => {
                                                const pid = img.public_id || img.url;
                                                const removed = removedExisting.some(r => (r.public_id || r.url) === pid);
                                                return (
                                                    <ImageListItem key={pid} sx={{ position: 'relative' }}>
                                                        <img
                                                            src={img.url}
                                                            alt={editingProduct.name}
                                                            style={{ width: '100%', height: '100%', objectFit: 'cover', filter: removed ? 'grayscale(100%)' : 'none', opacity: removed ? 0.6 : 1 }}
                                                        />
                                                        <Chip
                                                            label={removed ? 'Restore' : 'Remove'}
                                                            color={removed ? 'default' : 'error'}
                                                            size="small"
                                                            onClick={() => toggleRemoveExisting(img)}
                                                            sx={{ position: 'absolute', top: 4, right: 4 }}
                                                        />
                                                    </ImageListItem>
                                                );
                                            })}
                                            </ImageList>
                                        </Box>
                                        <Box sx={{ color: 'text.secondary', mt: 1 }}>
                                            New images will be added; selected thumbnails marked "Remove" will be deleted. Use "Clear existing images" to remove all.
                                        </Box>
                                    </Grid>
                                )}
                                {imagePreviews.length > 0 && (
                                    <Grid item xs={12}>
                                        <strong>New Images</strong>
                                        <Box sx={{ border: '1px dashed #cbd5e1', borderRadius: 2, p: 1, mt: 1 }}>
                                            <ImageList cols={6} gap={8}>
                                            {imagePreviews.map((img, idx) => (
                                                <ImageListItem key={img.url} sx={{ position: 'relative' }}>
                                                    <img src={img.url} alt={img.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                                    <Chip
                                                        label="Remove"
                                                        color="error"
                                                        size="small"
                                                        onClick={() => removeSelectedImage(idx)}
                                                        sx={{ position: 'absolute', top: 4, right: 4 }}
                                                    />
                                                </ImageListItem>
                                            ))}
                                            </ImageList>
                                        </Box>
                                    </Grid>
                                )}
                            </Grid>
                        </Box>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={resetForm}>Cancel</Button>
                        <Button variant="contained" onClick={handleSubmit}>
                            {editingProduct ? 'Update Product' : 'Create Product'}
                        </Button>
                    </DialogActions>
                </Dialog>

                <div style={{ width: '100%', padding: 20 }}>
                    <DataTable
                        data={rows}
                        columns={columns}
                        customStyles={tableStyles}
                        pagination
                        selectableRows
                        onSelectedRowsChange={(state) => {
                            const ids = state.selectedRows.map((r) => r.id);
                            setSelectedIds(ids);
                        }}
                        responsive
                        highlightOnHover
                        striped
                        dense
                    />
                </div>
            </div>
        </div>
    );
};

export default ProductsManagement;

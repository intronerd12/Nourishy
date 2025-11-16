import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import * as Yup from 'yup';
import DataTable from 'react-data-table-component';

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
    const [formData, setFormData] = useState({
        name: '',
        price: '',
        description: '',
        category: '',
        stock: '',
        brand: ''
    });
    const [formErrors, setFormErrors] = useState({});

    const MAX_IMAGES = 6;

    const productSchema = Yup.object().shape({
        name: Yup.string().trim().min(2).required(),
        price: Yup.number().positive().required(),
        description: Yup.string().min(10).required(),
        category: Yup.string().required(),
        stock: Yup.number().integer().min(0).required(),
        brand: Yup.string().trim().min(2).required(),
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
                toast.error('Failed to save product');
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
            brand: product.brand
        });
        // Reset new selections; existing images are shown separately
        setImages([]);
        setShowAddForm(true);
        setClearExistingImages(false);
        setRemovedExisting([]);
    };

    const handleDelete = async (productId) => {
        if (!window.confirm("Delete this product?")) return;

        try {
            await axios.delete(`/admin/product/${productId}`);
            toast.success("Product deleted");
            fetchProducts();
        } catch {
            toast.error("Failed to delete product");
        }
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

    const handleBulkDelete = async () => {
        if (selectedIds.length === 0) return toast.info("No selected items");

        if (!window.confirm(`Delete ${selectedIds.length} items?`)) return;

        try {
            await axios.post(`/admin/products/bulk-delete`, { ids: selectedIds });
            toast.success("Selected products deleted");
            setSelectedIds([]);
            fetchProducts();
        } catch {
            toast.error("Bulk delete failed");
        }
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
        { name: "Name", selector: (row) => row.name, sortable: true, grow: 2 },
        { name: "Price", selector: (row) => row.price, sortable: true, width: "120px" },
        { name: "Category", selector: (row) => row.category, sortable: true, width: "140px" },
        {
            name: "Stock",
            selector: (row) => row.stock,
            sortable: true,
            width: "120px",
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
            width: "170px",
            sortable: false,
            cell: (row) => (
                <div style={{ display: "flex", gap: "8px" }}>
                    <button className="btn btn-secondary btn-sm" onClick={() => handleEdit(row.original)}>
                        Edit
                    </button>
                    <button className="btn btn-danger btn-sm" onClick={() => handleDelete(row.id)}>
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
        // Guard against non-numeric ratings causing toFixed errors
        rating: Number(p.ratings ?? 0).toFixed(1),
        original: p
    }));

    if (loading) return <div className="loading">Loading products...</div>;

    return (
        <div className="products-management">
            <div className="card">
                <div className="card-header">
                    <h2 className="card-title">Products Management</h2>
                    <button className="btn btn-primary" onClick={() => setShowAddForm(true)}>Add New Product</button>
                    <button className="btn btn-danger" style={{ marginLeft: 12 }} onClick={handleBulkDelete}>
                        Delete Selected
                    </button>
                </div>

                {/* ------------------------ FORM MODAL ------------------------ */}
                {showAddForm && (
                    <div className="product-form-overlay">
                        <div className="card">
                            <div className="card-header">
                                <h3>{editingProduct ? "Edit Product" : "Add New Product"}</h3>
                            </div>
                            <div className="card-body">
                                <form onSubmit={handleSubmit}>
                                    {/* All your inputs kept EXACTLY AS THEY ARE */}
                                    <div className="form-group">
                                        <label>Product Name</label>
                                        <input
                                            name="name"
                                            value={formData.name}
                                            onChange={handleInputChange}
                                            className="form-control"
                                        />
                                        {formErrors.name && <small className="text-danger">{formErrors.name}</small>}
                                    </div>

                                    <div className="form-group">
                                        <label>Price (₱)</label>
                                        <input type="number" name="price" value={formData.price}
                                            onChange={handleInputChange} />
                                        {formErrors.price && <small className="text-danger">{formErrors.price}</small>}
                                    </div>

                                    <div className="form-group">
                                        <label>Description</label>
                                        <textarea name="description" rows="4"
                                            value={formData.description}
                                            onChange={handleInputChange} />
                                        {formErrors.description && <small className="text-danger">{formErrors.description}</small>}
                                    </div>

                                    <div className="form-group">
                                        <label>Category</label>
                                        <select name="category" value={formData.category} onChange={handleInputChange}>
                                            <option value="">Select Category</option>
                                            <option value="Shampoo">Shampoo</option>
                                            <option value="Conditioner">Conditioner</option>
                                            <option value="Hair Oil">Hair Oil</option>
                                            <option value="Hair Mask">Hair Mask</option>
                                            <option value="Hair Serum">Hair Serum</option>
                                            <option value="Hair Spray">Hair Spray</option>
                                        </select>
                                        {formErrors.category && <small className="text-danger">{formErrors.category}</small>}
                                    </div>

                                    <div className="form-group">
                                        <label>Brand</label>
                                        <input name="brand" value={formData.brand} onChange={handleInputChange} />
                                        {formErrors.brand && <small className="text-danger">{formErrors.brand}</small>}
                                    </div>

                                    <div className="form-group">
                                        <label>Stock</label>
                                        <input type="number" name="stock" value={formData.stock} onChange={handleInputChange} />
                                        {formErrors.stock && <small className="text-danger">{formErrors.stock}</small>}
                                    </div>

                                    <div className="form-group">
                                        <label>Images</label>
                                        <input
                                            type="file"
                                            multiple
                                            accept="image/*"
                                            onChange={handleImageSelect}
                                        />
                                        <small className="text-muted" style={{ display: 'block', marginTop: 6 }}>
                                            {images.length}/{MAX_IMAGES} selected
                                        </small>
                                        {editingProduct && Array.isArray(editingProduct.images) && editingProduct.images.length > 0 && (
                                            <div style={{ marginTop: 12 }}>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                    <strong>Existing Images</strong>
                                                    <label style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                                        <input
                                                            type="checkbox"
                                                            checked={clearExistingImages}
                                                            onChange={(e) => setClearExistingImages(e.target.checked)}
                                                        />
                                                        <span>Clear existing images</span>
                                                    </label>
                                                </div>
                                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginTop: 8 }}>
                                                    {editingProduct.images.map((img) => {
                                                        const pid = img.public_id || img.url;
                                                        const removed = removedExisting.some(r => (r.public_id || r.url) === pid);
                                                        return (
                                                            <div key={pid} style={{ position: 'relative' }}>
                                                                <img
                                                                    src={img.url}
                                                                    alt={editingProduct.name}
                                                                    style={{ width: 80, height: 80, objectFit: 'cover', borderRadius: 6, border: '1px solid #ddd', filter: removed ? 'grayscale(100%)' : 'none', opacity: removed ? 0.6 : 1 }}
                                                                />
                                                                <button
                                                                    type="button"
                                                                    className={removed ? 'btn btn-secondary btn-sm' : 'btn btn-danger btn-sm'}
                                                                    style={{ position: 'absolute', top: -8, right: -8, padding: '2px 6px' }}
                                                                    onClick={() => toggleRemoveExisting(img)}
                                                                >
                                                                    {removed ? 'Restore' : 'Remove'}
                                                                </button>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                                <small className="text-muted" style={{ display: 'block', marginTop: 6 }}>
                                                    New images will be added; selected thumbnails marked "Remove" will be deleted. Use "Clear existing images" to remove all.
                                                </small>
                                            </div>
                                        )}
                                        {imagePreviews.length > 0 && (
                                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginTop: 10 }}>
                                                {imagePreviews.map((img, idx) => (
                                                    <div key={img.url} style={{ position: 'relative' }}>
                                                        <img src={img.url} alt={img.name} style={{ width: 80, height: 80, objectFit: 'cover', borderRadius: 6, border: '1px solid #ddd' }} />
                                                        <button
                                                            type="button"
                                                            className="btn btn-danger btn-sm"
                                                            style={{ position: 'absolute', top: -8, right: -8, padding: '2px 6px' }}
                                                            onClick={() => removeSelectedImage(idx)}
                                                        >
                                                            ×
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>

                                    <div className="form-actions">
                                        <button type="submit" className="btn btn-primary">
                                            {editingProduct ? "Update Product" : "Create Product"}
                                        </button>
                                        <button type="button" className="btn btn-secondary" onClick={resetForm}>Cancel</button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                )}

                <div style={{ width: "100%", padding: 20 }}>
                    <DataTable
                        data={rows}
                        columns={columns}
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

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import * as Yup from 'yup'

const ProductsManagement = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showAddForm, setShowAddForm] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);
    const [images, setImages] = useState([]);
    const [selectedIds, setSelectedIds] = useState([]);
    const [selectAll, setSelectAll] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        price: '',
        description: '',
        category: '',
        stock: '',
        brand: ''
    });
    const [formErrors, setFormErrors] = useState({})

    const productSchema = Yup.object().shape({
        name: Yup.string().trim().min(2, 'Name must be at least 2 characters').required('Name is required'),
        price: Yup.number().typeError('Price must be a number').positive('Price must be greater than 0').required('Price is required'),
        description: Yup.string().trim().min(10, 'Description must be at least 10 characters').required('Description is required'),
        category: Yup.string().trim().required('Category is required'),
        stock: Yup.number().typeError('Stock must be a number').integer('Stock must be an integer').min(0, 'Stock cannot be negative').required('Stock is required'),
        brand: Yup.string().trim().min(2, 'Brand must be at least 2 characters').required('Brand is required')
    })

    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        try {
            const { data } = await axios.get(`${import.meta.env.VITE_API}/products`);
            setProducts(data.products);
            setLoading(false);
        } catch (error) {
            toast.error('Failed to fetch products');
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            // Validate form data with Yup
            setFormErrors({})
            await productSchema.validate(formData, { abortEarly: false })

            const form = new FormData();
            Object.entries(formData).forEach(([key, value]) => form.append(key, value));
            images.forEach((file) => form.append('images', file));

            const config = {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            };

            if (editingProduct) {
                await axios.put(`/admin/product/${editingProduct._id}`, form, config);
                toast.success('Product updated successfully');
            } else {
                await axios.post(`/admin/product/new`, form, config);
                toast.success('Product created successfully');
            }

            setFormData({
                name: '',
                price: '',
                description: '',
                category: '',
                stock: '',
                brand: ''
            });
            setImages([]);
            setShowAddForm(false);
            setEditingProduct(null);
            fetchProducts();
        } catch (error) {
            if (error?.name === 'ValidationError') {
                const fieldErrors = {}
                error.inner.forEach(err => {
                    if (err.path && !fieldErrors[err.path]) {
                        fieldErrors[err.path] = err.message
                    }
                })
                setFormErrors(fieldErrors)
                toast.error('Please fix the validation errors')
            } else {
                toast.error('Failed to save product')
            }
        }
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
        setImages([]);
        setShowAddForm(true);
    };

    const handleDelete = async (productId) => {
        if (window.confirm('Are you sure you want to delete this product?')) {
            try {
                await axios.delete(`/admin/product/${productId}`);
                toast.success('Product deleted successfully');
                fetchProducts();
            } catch (error) {
                toast.error('Failed to delete product');
            }
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
        setImages([]);
        setShowAddForm(false);
        setEditingProduct(null);
    };

    const toggleSelectAll = (e) => {
        const checked = e.target.checked;
        setSelectAll(checked);
        setSelectedIds(checked ? products.map(p => p._id) : []);
    };

    const toggleSelect = (productId) => {
        setSelectedIds(prev => {
            if (prev.includes(productId)) return prev.filter(id => id !== productId);
            return [...prev, productId];
        });
    };

    const handleBulkDelete = async () => {
        if (selectedIds.length === 0) return toast.info('No products selected');
        if (!window.confirm(`Delete ${selectedIds.length} selected product(s)?`)) return;
        try {
            const config = { headers: { 'Content-Type': 'application/json' } };
            await axios.post(`/admin/products/bulk-delete`, { ids: selectedIds }, config);
            toast.success('Selected products deleted');
            setSelectedIds([]);
            setSelectAll(false);
            fetchProducts();
        } catch (error) {
            toast.error('Bulk delete failed');
        }
    };

    if (loading) {
        return <div className="loading">Loading products...</div>;
    }

    return (
        <div className="products-management">
            <div className="card">
                <div className="card-header">
                    <h2 className="card-title">Products Management</h2>
                    <button 
                        className="btn btn-primary"
                        onClick={() => setShowAddForm(true)}
                    >
                        Add New Product
                    </button>
                    <button
                        className="btn btn-danger"
                        style={{ marginLeft: '12px' }}
                        onClick={handleBulkDelete}
                    >
                        Delete Selected
                    </button>
                </div>

                {showAddForm && (
                    <div className="product-form-overlay">
                        <div className="card">
                            <div className="card-header">
                                <h3 className="card-title">{editingProduct ? 'Edit Product' : 'Add New Product'}</h3>
                            </div>
                            <div className="card-body">
                                <form onSubmit={handleSubmit}>
                                    <div className="form-group">
                                        <label className="form-label">Product Name</label>
                                        <input
                                            type="text"
                                            name="name"
                                            className="form-control"
                                            value={formData.name}
                                            onChange={handleInputChange}
                                            required
                                        />
                                        {formErrors.name && <small className="text-danger">{formErrors.name}</small>}
                                    </div>
                            
                            <div className="form-group">
                                <label>Price (₱)</label>
                                <input
                                    type="number"
                                    name="price"
                                    value={formData.price}
                                    onChange={handleInputChange}
                                    required
                                />
                                {formErrors.price && <small className="text-danger">{formErrors.price}</small>}
                            </div>
                            
                            <div className="form-group">
                                <label>Description</label>
                                <textarea
                                    name="description"
                                    value={formData.description}
                                    onChange={handleInputChange}
                                    rows="4"
                                    required
                                />
                                {formErrors.description && <small className="text-danger">{formErrors.description}</small>}
                            </div>
                            
                            <div className="form-group">
                                <label>Category</label>
                                <select
                                    name="category"
                                    value={formData.category}
                                    onChange={handleInputChange}
                                    required
                                >
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
                                <input
                                    type="text"
                                    name="brand"
                                    value={formData.brand}
                                    onChange={handleInputChange}
                                    required
                                />
                                {formErrors.brand && <small className="text-danger">{formErrors.brand}</small>}
                            </div>
                            
                            <div className="form-group">
                                <label>Stock</label>
                                <input
                                    type="number"
                                    name="stock"
                                    value={formData.stock}
                                    onChange={handleInputChange}
                                    required
                                />
                                {formErrors.stock && <small className="text-danger">{formErrors.stock}</small>}
                            </div>

                            <div className="form-group">
                                <label>Images</label>
                                <input
                                    type="file"
                                    name="images"
                                    multiple
                                    accept="image/*"
                                    onChange={(e) => setImages(Array.from(e.target.files))}
                                />
                            </div>
                            
                                    <div className="form-actions">
                                        <button type="submit" className="btn btn-primary">
                                            {editingProduct ? 'Update Product' : 'Create Product'}
                                        </button>
                                        <button type="button" className="btn btn-secondary" onClick={resetForm}>
                                            Cancel
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                )}

                <div className="products-table">
                    <table>
                        <thead>
                            <tr>
                                <th>
                                    <input type="checkbox" checked={selectAll} onChange={toggleSelectAll} />
                                </th>
                                <th>Image</th>
                                <th>Name</th>
                                <th>Price</th>
                                <th>Category</th>
                                <th>Stock</th>
                                <th>Rating</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {products.map(product => (
                                <tr key={product._id}>
                                    <td>
                                        <input
                                            type="checkbox"
                                            checked={selectedIds.includes(product._id)}
                                            onChange={() => toggleSelect(product._id)}
                                        />
                                    </td>
                                    <td>
                                        <img 
                                            src={product.images?.[0]?.url || '/images/default-product.png'} 
                                            alt={product.name}
                                            className="product-image"
                                        />
                                    </td>
                                    <td>{product.name}</td>
                                    <td>₱{product.price}</td>
                                    <td>{product.category}</td>
                                    <td>
                                        <span className={`status-badge ${product.stock > 10 ? 'status-active' : 'status-inactive'}`}>
                                            {product.stock}
                                        </span>
                                    </td>
                                    <td>
                                        <div className="rating">
                                            ⭐ {product.ratings?.toFixed(1) || 'N/A'}
                                        </div>
                                    </td>
                                    <td>
                                        <div className="action-buttons">
                                            <button 
                                                className="btn btn-secondary btn-sm"
                                                onClick={() => handleEdit(product)}
                                            >
                                                Edit
                                            </button>
                                            <button 
                                                className="btn btn-danger btn-sm"
                                                onClick={() => handleDelete(product._id)}
                                            >
                                                Delete
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default ProductsManagement;
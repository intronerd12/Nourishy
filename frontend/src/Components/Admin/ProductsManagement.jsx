import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { getToken } from '../../utils/helpers';

const ProductsManagement = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showAddForm, setShowAddForm] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        price: '',
        description: '',
        category: '',
        stock: '',
        brand: ''
    });

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
            const config = {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${getToken()}`
                }
            };

            if (editingProduct) {
                await axios.put(`${import.meta.env.VITE_API}/admin/product/${editingProduct._id}`, formData, config);
                toast.success('Product updated successfully');
            } else {
                await axios.post(`${import.meta.env.VITE_API}/admin/product/new`, formData, config);
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
            setShowAddForm(false);
            setEditingProduct(null);
            fetchProducts();
        } catch (error) {
            toast.error('Failed to save product');
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
        setShowAddForm(true);
    };

    const handleDelete = async (productId) => {
        if (window.confirm('Are you sure you want to delete this product?')) {
            try {
                const config = {
                    headers: {
                        'Authorization': `Bearer ${getToken()}`
                    }
                };
                await axios.delete(`${import.meta.env.VITE_API}/admin/product/${productId}`, config);
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
        setShowAddForm(false);
        setEditingProduct(null);
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
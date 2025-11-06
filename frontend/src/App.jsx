import { useState, useEffect } from 'react'
import { ToastContainer, } from 'react-toastify';

import './styles/App.css'
import Header from './Components/Layout/Header';
import Footer from './Components/Layout/Footer';

import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import Home from './pages/Home';
import Shop from './pages/Shop';
import Orders from './pages/Orders';
import OrderCart from './pages/OrderCart';
import ProductDetails from './Components/Product/ProductDetails';
import Login from './Components/User/Login';
import Register from './Components/User/Register';
import LoginRegister from './Components/User/LoginRegister';
import ForgotPassword from './Components/User/ForgotPassword';
import NewPassword from './Components/User/NewPassword';
import Profile from './Components/User/Profile';
import UpdatePassword from './Components/User/UpdatePassword';
import UpdateProfile from './Components/User/UpdateProfile';
import EmailVerification from './Components/User/EmailVerification';
import Cart from './Components/Cart/Cart';
import Shipping from './Components/Cart/Shipping';
import ConfirmOrder from './Components/Cart/ConfirmOrder';
import Payment from './Components/Cart/Payment';
import OrderSuccess from './Components/Cart/OrderSuccess';
import Dashboard from './Components/Admin/Dashboard';
import ProtectedRoute from './Components/Route/ProtectedRoute';
import axios from 'axios';
import { useAuth } from './contexts/AuthContext';
import Monitoring from './pages/Monitoring';
import Forecast from './pages/Forecast';

// Component to conditionally render Header based on route
const ConditionalHeader = ({ cartItems }) => {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin');
  
  return !isAdminRoute ? <Header cartItems={cartItems} /> : null;
};

function App() {
  const { user, isAuthenticated } = useAuth();
  const [state, setState] = useState({
    cartItems: [],

    shippingInfo: localStorage.getItem('shippingInfo')
      ? JSON.parse(localStorage.getItem('shippingInfo'))
      : {},
  })

  // Load cart items for the authenticated user from per-user storage
  useEffect(() => {
    if (isAuthenticated && user && user._id) {
      const key = `cartItems_${user._id}`;
      const stored = localStorage.getItem(key);
      setState(prev => ({
        ...prev,
        cartItems: stored ? JSON.parse(stored) : []
      }));
    } else {
      // Clear cart in state when user logs out (storage remains for that user)
      setState(prev => ({ ...prev, cartItems: [] }));
    }
  }, [isAuthenticated, user]);

  const addItemToCart = async (id, quantity) => {
    // console.log(id, quantity)
    try {
      const { data } = await axios.get(`${import.meta.env.VITE_API}/product/${id}`)
      const item = {
        product: data.product._id,
        name: data.product.name,
        price: data.product.price,
        image: data.product.images[0].url,
        stock: data.product.stock,
        quantity: quantity
      }

      const isItemExist = state.cartItems.find(i => i.product === item.product)

      setState({
        ...state,
        cartItems: [...state.cartItems, item]
      })
      if (isItemExist) {
        setState({
          ...state,
          cartItems: state.cartItems.map(i => i.product === isItemExist.product ? item : i)
        })
      }
      else {
        setState({
          ...state,
          cartItems: [...state.cartItems, item]
        })
      }

      toast.success('Item Added to Cart', {
        position: 'bottom-right'
      })

    } catch (error) {
      toast.error(error, {
        position: 'top-left'
      });

    }

  }
  const removeItemFromCart = async (id) => {
    setState({
      ...state,
      cartItems: state.cartItems.filter(i => i.product !== id)
    })
  }

  const saveShippingInfo = async (data) => {
    setState({
      ...state,
      shippingInfo: data
    })
    localStorage.setItem('shippingInfo', JSON.stringify(data))
  }

  // Persist cartItems to per-user storage whenever it changes
  useEffect(() => {
    if (isAuthenticated && user && user._id) {
      const key = `cartItems_${user._id}`;
      localStorage.setItem(key, JSON.stringify(state.cartItems));
    }
  }, [state.cartItems, isAuthenticated, user]);

  return (
    <>
      <Router>
        <ConditionalHeader cartItems={state.cartItems} />
        <Routes>
          <Route path="/" element={<Home />} exact="true" />
          <Route path="/shop" element={<Shop cartItems={state.cartItems} addItemToCart={addItemToCart} />} exact="true" />
          <Route path="/orders" element={<Orders />} exact="true" />
          <Route path="/orders/me" element={
            <ProtectedRoute>
              <Orders />
            </ProtectedRoute>
          } exact="true" />
          <Route path="/ordercart" element={
            <ProtectedRoute>
              <OrderCart cartItems={state.cartItems} addItemToCart={addItemToCart} removeItemFromCart={removeItemFromCart} saveShippingInfo={saveShippingInfo} />
            </ProtectedRoute>
          } exact="true" />
          <Route path="/search" element={<Home />} exact="true" />
          <Route path="/product/:id" element={<ProductDetails cartItems={state.cartItems} addItemToCart={addItemToCart} />} exact="true" />
          <Route path="/search/:keyword" element={<Home />} exact="true" />
          <Route path="/login" element={<LoginRegister />} exact="true" />
          <Route path="/loginregister" element={<LoginRegister />} exact="true" />
          <Route path="/register" element={<LoginRegister />} exact="true" />
          <Route path="/password/forgot" element={<ForgotPassword />} exact="true" />
          <Route path="/password/reset/:token" element={<NewPassword />} exact="true" />
          <Route path="/verify-email/:token" element={<EmailVerification />} exact="true" />
          <Route path="/me" element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          } exact="true" />
          <Route path="/me/update" element={
            <ProtectedRoute>
              <UpdateProfile />
            </ProtectedRoute>
          } exact="true" />
          <Route path="/password/update" element={
            <ProtectedRoute>
              <UpdatePassword />
            </ProtectedRoute>
          } />
          <Route path="/cart" element={
            <ProtectedRoute>
              <Cart cartItems={state.cartItems} addItemToCart={addItemToCart} removeItemFromCart={removeItemFromCart} />
            </ProtectedRoute>
          } exact="true" />
          <Route path="/shipping" element={
            <ProtectedRoute>
              <Shipping shipping={state.shippingInfo} saveShippingInfo={saveShippingInfo} />
            </ProtectedRoute>
          } />
          <Route path="/confirm" element={
            <ProtectedRoute>
              <ConfirmOrder cartItems={state.cartItems} shippingInfo={state.shippingInfo} />
            </ProtectedRoute>
          } />
          <Route path="/payment" element={
            <ProtectedRoute>
              <Payment cartItems={state.cartItems} shippingInfo={state.shippingInfo} />
            </ProtectedRoute>
          } />
          <Route path="/success" element={
            <ProtectedRoute>
              <OrderSuccess />
            </ProtectedRoute>
          } />
          <Route path="/monitoring" element={
            <ProtectedRoute>
              <Monitoring />
            </ProtectedRoute>
          } />
          <Route path="/forecast" element={
            <ProtectedRoute>
              <Forecast />
            </ProtectedRoute>
          } />
          <Route path="/admin/dashboard" element={
            <ProtectedRoute isAdmin={true}>
              <Dashboard />
            </ProtectedRoute>
          } />
        </Routes>

      </Router>
      <Footer />
      <ToastContainer />
    </>
  )
}

export default App

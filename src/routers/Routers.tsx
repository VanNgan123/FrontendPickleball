import { Routes, Route, BrowserRouter } from 'react-router-dom';
import { Home, Login, SignUp } from '../pages';
import ProductDetail from '../pages/ProductDetail';
import Products from '../pages/Products';
import Cart from '../pages/Cart';
import Checkout from '../pages/Checkout';
import OrderSuccess from '../pages/OrderSuccess';
import Profile from '../pages/Profile';
import Orders from '../pages/Orders';

const AppRouters = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/products" element={<Products />} />
        <Route path="/product/:id" element={<ProductDetail />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/order-success/:id" element={<OrderSuccess />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/orders" element={<Orders />} />
      </Routes>
    </BrowserRouter>
  );
};

export default AppRouters;

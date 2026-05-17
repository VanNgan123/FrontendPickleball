import { Routes, Route, BrowserRouter } from 'react-router-dom';
import { Home, Login, SignUp } from '../pages';
import ProductDetail from '../pages/ProductDetail';
import Products from '../pages/Products';
import Cart from '../pages/Cart';

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
      </Routes>
    </BrowserRouter>
  );
};

export default AppRouters;
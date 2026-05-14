import { Routes, Route, BrowserRouter } from 'react-router-dom';
import { Home, Login } from '../pages';
import ProductDetail from '../pages/ProductDetail';
import Products from '../pages/Products';

const AppRouters = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/products" element={<Products />} />
        <Route path="/product/:id" element={<ProductDetail />} />
        <Route path="/login" element={<Login />} />
      </Routes>
    </BrowserRouter>
  );
};

export default AppRouters;
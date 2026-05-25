import { Routes, Route, BrowserRouter } from "react-router-dom";

// Public pages
import { Home, Login, SignUp } from "../pages";
import ProductDetail from "../pages/ProductDetail";
import Products from "../pages/Products";
import Cart from "../pages/Cart";
import Checkout from "../pages/Checkout";
import OrderSuccess from "../pages/OrderSuccess";
import Profile from "../pages/Profile";
import Orders from "../pages/Orders";
import Unauthorized from "../pages/Unauthorized";
import NotFound from "../pages/NotFound";
import SearchResults from "../pages/SearchResults";
import ScrollToTop from "../components/ScrollToTop";

import withAuthHome from "../hocs/withAuthHome";
import withAuthAdmin from "../hocs/withAuthAdmin";

// Admin pages
import AdminDashboard from "../pages/Admin/AdminDashboard";
import AdminProducts from "../pages/Admin/AdminProducts";
import AdminCategories from "../pages/Admin/AdminCategories";
import AdminOrders from "../pages/Admin/AdminOrders";
import AdminCoupons from "../pages/Admin/AdminCoupons";
import AdminReviews from "../pages/Admin/AdminReviews";

const AppRouters = () => {
  const HomeWithAuth = withAuthHome(Home);
  const AdminDashboardWithAuth = withAuthAdmin(AdminDashboard);
  const AdminProductsWithAuth = withAuthAdmin(AdminProducts);
  const AdminCategoriesWithAuth = withAuthAdmin(AdminCategories);
  const AdminOrdersWithAuth = withAuthAdmin(AdminOrders);
  const AdminCouponsWithAuth = withAuthAdmin(AdminCoupons);
  const AdminReviewsWithAuth = withAuthAdmin(AdminReviews);

  return (
    <BrowserRouter>
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<HomeWithAuth />} />
        <Route path="/products" element={<Products />} />
        <Route path="/product/:id" element={<ProductDetail />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/order-success/:id" element={<OrderSuccess />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/orders" element={<Orders />} />
        <Route path="/search" element={<SearchResults />} />
        <Route path="/unauthorized" element={<Unauthorized />} />

        <Route path="/admin" element={<AdminDashboardWithAuth />} />
        <Route path="/admin/products" element={<AdminProductsWithAuth />} />
        <Route path="/admin/categories" element={<AdminCategoriesWithAuth />} />
        <Route path="/admin/orders" element={<AdminOrdersWithAuth />} />
        <Route path="/admin/coupons" element={<AdminCouponsWithAuth />} />
        <Route path="/admin/reviews" element={<AdminReviewsWithAuth />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
};

export default AppRouters;

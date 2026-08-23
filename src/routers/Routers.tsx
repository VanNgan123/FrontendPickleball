import { lazy, Suspense } from "react";
import { Routes, Route, BrowserRouter } from "react-router-dom";
import { Box, CircularProgress } from "@mui/material";

// Non-lazy components
import ScrollToTop from "../components/ScrollToTop";
import withAuthAdmin from "../hocs/withAuthAdmin";

// Premium themed fallback loader
const PageLoader = () => (
  <Box
    sx={{
      display: "flex",
      flexDirection: "column",
      justifyContent: "center",
      alignItems: "center",
      minHeight: "80vh",
      gap: 2,
    }}
  >
    <CircularProgress size={50} sx={{ color: "#E60023" }} thickness={4.5} />
  </Box>
);

// Lazy loaded Public pages
const Home = lazy(() => import("../pages/Home"));
const Login = lazy(() => import("../pages/Login"));
const SignUp = lazy(() => import("../pages/SignUp"));
const ProductDetail = lazy(() => import("../pages/ProductDetail"));
const Products = lazy(() => import("../pages/Products"));
const Cart = lazy(() => import("../pages/Cart"));
const Checkout = lazy(() => import("../pages/Checkout"));
const PaymentResult = lazy(() => import("../pages/PaymentResult"));
const OrderSuccess = lazy(() => import("../pages/OrderSuccess"));
const Profile = lazy(() => import("../pages/Profile"));
const Orders = lazy(() => import("../pages/Orders"));
const Notifications = lazy(() => import("../pages/Notifications"));
const SearchResults = lazy(() => import("../pages/SearchResults"));
const About = lazy(() => import("../pages/About"));
const News = lazy(() => import("../pages/News"));
const Courts = lazy(() => import("../pages/Courts"));
const Support = lazy(() => import("../pages/Support"));
const Unauthorized = lazy(() => import("../pages/Unauthorized"));
const NotFound = lazy(() => import("../pages/NotFound"));

// Lazy loaded Admin pages
const AdminDashboard = lazy(() => import("../pages/Admin/AdminDashboard"));
const AdminProducts = lazy(() => import("../pages/Admin/AdminProducts"));
const AdminCategories = lazy(() => import("../pages/Admin/AdminCategories"));
const AdminOrders = lazy(() => import("../pages/Admin/AdminOrders"));
const AdminCoupons = lazy(() => import("../pages/Admin/AdminCoupons"));
const AdminReviews = lazy(() => import("../pages/Admin/AdminReviews"));

// HOC wrappers with dynamic lazy components
const AdminDashboardWithAuth = withAuthAdmin(AdminDashboard);
const AdminProductsWithAuth = withAuthAdmin(AdminProducts);
const AdminCategoriesWithAuth = withAuthAdmin(AdminCategories);
const AdminOrdersWithAuth = withAuthAdmin(AdminOrders);
const AdminCouponsWithAuth = withAuthAdmin(AdminCoupons);
const AdminReviewsWithAuth = withAuthAdmin(AdminReviews);

const AppRouters = () => {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/products" element={<Products />} />
          <Route path="/product/:id" element={<ProductDetail />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/payment-result" element={<PaymentResult />} />
          <Route path="/order-success/:id" element={<OrderSuccess />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/orders" element={<Orders />} />
          <Route path="/notifications" element={<Notifications />} />
          <Route path="/search" element={<SearchResults />} />
          <Route path="/about" element={<About />} />
          <Route path="/news" element={<News />} />
          <Route path="/courts" element={<Courts />} />
          <Route path="/support" element={<Support />} />
          <Route path="/unauthorized" element={<Unauthorized />} />

          <Route path="/admin" element={<AdminDashboardWithAuth />} />
          <Route path="/admin/products" element={<AdminProductsWithAuth />} />
          <Route path="/admin/categories" element={<AdminCategoriesWithAuth />} />
          <Route path="/admin/orders" element={<AdminOrdersWithAuth />} />
          <Route path="/admin/coupons" element={<AdminCouponsWithAuth />} />
          <Route path="/admin/reviews" element={<AdminReviewsWithAuth />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
};

export default AppRouters;


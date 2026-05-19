import { Routes, Route, BrowserRouter } from "react-router-dom";
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
import withAuthHome from "../hocs/withAuthHome";

const CartAuth = withAuthHome(Cart);
const CheckoutAuth = withAuthHome(Checkout);
const ProfileAuth = withAuthHome(Profile);
const OrdersAuth = withAuthHome(Orders);

const AppRouters = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/products" element={<Products />} />
        <Route path="/product/:id" element={<ProductDetail />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/cart" element={<CartAuth />} />
        <Route path="/checkout" element={<CheckoutAuth />} />
        <Route path="/order-success/:id" element={<OrderSuccess />} />
        <Route path="/profile" element={<ProfileAuth />} />
        <Route path="/orders" element={<OrdersAuth />} />
        <Route path="/unauthorized" element={<Unauthorized />} />

        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
};

export default AppRouters;

import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Box,
  Container,
  Typography,
  Button,
  TextField,
  Paper,
  Divider,
  CircularProgress,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormControl,
  Chip,
  Alert,
  Skeleton,
} from "@mui/material";
import Grid from "@mui/material/Grid";
import {
  MapPin,
  Phone,
  User,
  ChevronRight,
  ArrowLeft,
  ShoppingBag,
  Tag,
  Truck,
  CheckCircle2,
  CreditCard,
  Smartphone,
  Building2,
} from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "../../store/store";
import { fetchCart, resetCart } from "../../store/slices/cartSlice";
import orderService from "../../services/orderService";
import type { ShippingAddress } from "../../services/orderService";
import MainLayout from "../../layout/MainLayout/MainLayout";
import toast from "react-hot-toast";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";

const getImageUrl = (imagePath?: string) => {
  if (!imagePath) return "/placeholder.png";
  if (imagePath.startsWith("http")) return imagePath;
  const baseUrl = API_URL.replace(/\/+$/, "");
  const path = imagePath.startsWith("/") ? imagePath : `/${imagePath}`;
  return `${baseUrl}${path.replace(/\\/g, "/")}`;
};

const formatPrice = (price: number) => price.toLocaleString("vi-VN") + "đ";

// =============================================
// Payment method options
// =============================================
const PAYMENT_METHODS = [
  {
    value: "COD",
    label: "Thanh toán khi nhận hàng (COD)",
    desc: "Trả tiền mặt khi nhận hàng",
    icon: <Truck size={20} color="#25D366" />,
  },
  {
    value: "VNPay",
    label: "VNPay",
    desc: "Thanh toán qua cổng VNPay",
    icon: <CreditCard size={20} color="#0066CC" />,
  },
  {
    value: "Momo",
    label: "Ví MoMo",
    desc: "Thanh toán qua ví điện tử MoMo",
    icon: <Smartphone size={20} color="#A50064" />,
  },
  {
    value: "BankTransfer",
    label: "Chuyển khoản ngân hàng",
    desc: "Chuyển khoản qua tài khoản ngân hàng",
    icon: <Building2 size={20} color="#002c4b" />,
  },
];

// =============================================
// Form validation
// =============================================
interface FormErrors {
  fullName?: string;
  phone?: string;
  address?: string;
  city?: string;
  district?: string;
  ward?: string;
}

const validateForm = (form: ShippingAddress): FormErrors => {
  const errors: FormErrors = {};
  if (!form.fullName.trim()) errors.fullName = "Vui lòng nhập họ tên";
  else if (form.fullName.trim().length < 2)
    errors.fullName = "Họ tên ít nhất 2 ký tự";

  if (!form.phone.trim()) errors.phone = "Vui lòng nhập số điện thoại";
  else if (!/^(0[3-9])\d{8}$/.test(form.phone))
    errors.phone = "Số điện thoại không hợp lệ (VD: 0912345678)";

  if (!form.address.trim()) errors.address = "Vui lòng nhập địa chỉ";
  if (!form.city.trim()) errors.city = "Vui lòng nhập tỉnh/thành phố";
  if (!form.district.trim()) errors.district = "Vui lòng nhập quận/huyện";
  if (!form.ward.trim()) errors.ward = "Vui lòng nhập phường/xã";

  return errors;
};

// =============================================
// Main Checkout Page
// =============================================
const Checkout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch<AppDispatch>();

  const { items, loading: cartLoading } = useSelector(
    (state: RootState) => state.cart
  );
  const { user, isAuthenticated } = useSelector(
    (state: RootState) => state.auth
  );

  // Nhan thong tin coupon tu trang Cart
  const locationState = location.state as {
    couponCode?: string;
    discountAmount?: number;
    finalTotal?: number;
    subtotal?: number;
  } | null;

  const couponCode = locationState?.couponCode || null;
  const discountAmount = locationState?.discountAmount || 0;

  const [paymentMethod, setPaymentMethod] =
    useState<"COD" | "VNPay" | "Momo" | "BankTransfer">("COD");
  const [submitting, setSubmitting] = useState(false);
  const [formErrors, setFormErrors] = useState<FormErrors>({});

  const [form, setForm] = useState<ShippingAddress>({
    fullName: user?.name || "",
    phone: "",
    address: "",
    city: "",
    district: "",
    ward: "",
  });

  // Redirect neu chua dang nhap
  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }
    if (items.length === 0) {
      dispatch(fetchCart());
    }
  }, [isAuthenticated, dispatch]);

  // Tinh tien
  const subtotal = items.reduce((sum, item) => {
    const price = item.productId.salePrice || item.productId.price;
    return sum + price * item.qty;
  }, 0);

  const shippingFee = subtotal >= 1000000 ? 0 : 30000;
  const finalTotal = subtotal - discountAmount + shippingFee;
  const totalItems = items.reduce((sum, item) => sum + item.qty, 0);

  // Handlers
  const handleFormChange = (field: keyof ShippingAddress, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (formErrors[field]) {
      setFormErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const handleSubmit = async () => {
    // Validate
    const errors = validateForm(form);
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      toast.error("Vui lòng điền đầy đủ thông tin giao hàng");
      return;
    }

    if (items.length === 0) {
      toast.error("Giỏ hàng trống");
      return;
    }

    // Canh bao neu chon thanh toan online (chua tich hop)
    if (paymentMethod !== "COD") {
      toast.error("Thanh toán online đang được phát triển, vui lòng chọn COD");
      return;
    }

    try {
      setSubmitting(true);
      const result = await orderService.createOrderFromCart({
        shippingAddress: form,
        paymentMethod,
      });

      // Xoa gio hang khoi Redux
      dispatch(resetCart());

      toast.success("Đặt hàng thành công! 🎉");
      navigate(`/order-success/${result.data._id}`, {
        state: { order: result.data },
      });
    } catch (error: any) {
      const msg =
        error?.response?.data?.message ||
        error?.message ||
        "Đặt hàng thất bại, vui lòng thử lại";
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  // TextField style tai su dung
  const textFieldSx = {
    "& .MuiOutlinedInput-root": {
      borderRadius: 2,
      bgcolor: "#fafafa",
      "& fieldset": { borderColor: "#e0e0e0" },
      "&:hover fieldset": { borderColor: "#E60023" },
      "&.Mui-focused fieldset": { borderColor: "#E60023" },
    },
    "& .MuiInputLabel-root.Mui-focused": { color: "#E60023" },
  };

  // Loading
  if (cartLoading) {
    return (
      <MainLayout>
        <Container maxWidth="xl" sx={{ py: 3 }}>
          <Grid container spacing={3}>
            <Grid size={{ xs: 12, lg: 7 }}>
              <Skeleton variant="rectangular" height={500} sx={{ borderRadius: 2 }} />
            </Grid>
            <Grid size={{ xs: 12, lg: 5 }}>
              <Skeleton variant="rectangular" height={400} sx={{ borderRadius: 2 }} />
            </Grid>
          </Grid>
        </Container>
      </MainLayout>
    );
  }

  // Gio hang trong
  if (!cartLoading && items.length === 0) {
    return (
      <MainLayout>
        <Container maxWidth="md" sx={{ py: 10, textAlign: "center" }}>
          <ShoppingBag size={64} color="#ddd" style={{ marginBottom: 16 }} />
          <Typography
            variant="h5"
            sx={{ fontWeight: 700, color: "#1a1a1a", mb: 1 }}
          >
            Giỏ hàng trống
          </Typography>
          <Typography variant="body2" sx={{ color: "#888", mb: 3 }}>
            Vui lòng thêm sản phẩm vào giỏ hàng trước khi thanh toán
          </Typography>
          <Button
            variant="contained"
            onClick={() => navigate("/products")}
            sx={{
              bgcolor: "#E60023",
              "&:hover": { bgcolor: "#c4001d" },
              fontWeight: 700,
              px: 4,
            }}
          >
            Mua sắm ngay
          </Button>
        </Container>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <Container maxWidth="xl" sx={{ py: 3, pb: 6 }}>
        {/* Breadcrumb */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 3 }}>
          <Button
            startIcon={<ArrowLeft size={16} />}
            onClick={() => navigate("/cart")}
            sx={{
              color: "#666",
              fontWeight: 600,
              fontSize: "0.85rem",
              "&:hover": { color: "#E60023", bgcolor: "transparent" },
            }}
          >
            Quay lại giỏ hàng
          </Button>
          <Typography variant="body2" sx={{ color: "#ccc" }}>
            |
          </Typography>
          <Typography
            variant="body2"
            sx={{ color: "#1a1a1a", fontWeight: 700 }}
          >
            Thanh toán
          </Typography>
        </Box>

        {/* Progress steps */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1,
            mb: 4,
            justifyContent: "center",
          }}
        >
          {[
            { label: "Giỏ hàng", done: true },
            { label: "Thanh toán", active: true },
            { label: "Xác nhận", done: false },
          ].map((step, idx) => (
            <Box
              key={idx}
              sx={{ display: "flex", alignItems: "center", gap: 1 }}
            >
              <Box
                sx={{
                  width: 28,
                  height: 28,
                  borderRadius: "50%",
                  bgcolor: step.done
                    ? "#22c55e"
                    : step.active
                    ? "#E60023"
                    : "#e0e0e0",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {step.done ? (
                  <CheckCircle2 size={16} color="white" />
                ) : (
                  <Typography
                    variant="caption"
                    sx={{ color: "white", fontWeight: 700 }}
                  >
                    {idx + 1}
                  </Typography>
                )}
              </Box>
              <Typography
                variant="body2"
                sx={{
                  fontWeight: step.active ? 700 : 400,
                  color: step.active
                    ? "#E60023"
                    : step.done
                    ? "#22c55e"
                    : "#aaa",
                  fontSize: "0.85rem",
                }}
              >
                {step.label}
              </Typography>
              {idx < 2 && <ChevronRight size={14} color="#ccc" />}
            </Box>
          ))}
        </Box>

        <Grid container spacing={3}>
          {/* ===== LEFT: Form ===== */}
          <Grid size={{ xs: 12, lg: 7 }}>
            {/* Shipping Info */}
            <Paper
              elevation={0}
              sx={{
                border: "1px solid #eee",
                borderRadius: 2,
                overflow: "hidden",
                mb: 3,
                bgcolor: "#fff",
              }}
            >
              {/* Header */}
              <Box
                sx={{
                  px: 3,
                  py: 2,
                  bgcolor: "#fafafa",
                  borderBottom: "1px solid #f0f0f0",
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                }}
              >
                <MapPin size={18} color="#E60023" />
                <Typography
                  variant="subtitle1"
                  sx={{ fontWeight: 800, color: "#1a1a1a" }}
                >
                  THÔNG TIN GIAO HÀNG
                </Typography>
              </Box>

              <Box sx={{ p: 3 }}>
                <Grid container spacing={2}>
                  {/* Ho ten */}
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      fullWidth
                      label="Họ và tên *"
                      placeholder="Nguyễn Văn A"
                      value={form.fullName}
                      onChange={(e) => handleFormChange("fullName", e.target.value)}
                      error={!!formErrors.fullName}
                      helperText={formErrors.fullName}
                      slotProps={{
                        input: {
                          startAdornment: (
                            <User size={16} color="#aaa" style={{ marginRight: 8 }} />
                          ),
                        },
                      }}
                      sx={textFieldSx}
                    />
                  </Grid>

                  {/* So dien thoai */}
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      fullWidth
                      label="Số điện thoại *"
                      placeholder="0912345678"
                      value={form.phone}
                      onChange={(e) => handleFormChange("phone", e.target.value)}
                      error={!!formErrors.phone}
                      helperText={formErrors.phone}
                      slotProps={{
                        input: {
                          startAdornment: (
                            <Phone size={16} color="#aaa" style={{ marginRight: 8 }} />
                          ),
                        },
                      }}
                      sx={textFieldSx}
                    />
                  </Grid>

                  {/* Dia chi */}
                  <Grid size={12}>
                    <TextField
                      fullWidth
                      label="Địa chỉ (số nhà, tên đường) *"
                      placeholder="123 Đường ABC"
                      value={form.address}
                      onChange={(e) => handleFormChange("address", e.target.value)}
                      error={!!formErrors.address}
                      helperText={formErrors.address}
                      sx={textFieldSx}
                    />
                  </Grid>

                  {/* Tinh/Thanh pho */}
                  <Grid size={{ xs: 12, sm: 4 }}>
                    <TextField
                      fullWidth
                      label="Tỉnh / Thành phố *"
                      placeholder="Đà Nẵng"
                      value={form.city}
                      onChange={(e) => handleFormChange("city", e.target.value)}
                      error={!!formErrors.city}
                      helperText={formErrors.city}
                      sx={textFieldSx}
                    />
                  </Grid>

                  {/* Quan/Huyen */}
                  <Grid size={{ xs: 12, sm: 4 }}>
                    <TextField
                      fullWidth
                      label="Quận / Huyện *"
                      placeholder="Hải Châu"
                      value={form.district}
                      onChange={(e) => handleFormChange("district", e.target.value)}
                      error={!!formErrors.district}
                      helperText={formErrors.district}
                      sx={textFieldSx}
                    />
                  </Grid>

                  {/* Phuong/Xa */}
                  <Grid size={{ xs: 12, sm: 4 }}>
                    <TextField
                      fullWidth
                      label="Phường / Xã *"
                      placeholder="Hòa Thuận Tây"
                      value={form.ward}
                      onChange={(e) => handleFormChange("ward", e.target.value)}
                      error={!!formErrors.ward}
                      helperText={formErrors.ward}
                      sx={textFieldSx}
                    />
                  </Grid>
                </Grid>
              </Box>
            </Paper>

            {/* Payment Method */}
            <Paper
              elevation={0}
              sx={{
                border: "1px solid #eee",
                borderRadius: 2,
                overflow: "hidden",
                bgcolor: "#fff",
              }}
            >
              <Box
                sx={{
                  px: 3,
                  py: 2,
                  bgcolor: "#fafafa",
                  borderBottom: "1px solid #f0f0f0",
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                }}
              >
                <CreditCard size={18} color="#E60023" />
                <Typography
                  variant="subtitle1"
                  sx={{ fontWeight: 800, color: "#1a1a1a" }}
                >
                  PHƯƠNG THỨC THANH TOÁN
                </Typography>
              </Box>

              <Box sx={{ p: 3 }}>
                <FormControl component="fieldset" fullWidth>
                  <RadioGroup
                    value={paymentMethod}
                    onChange={(e) =>
                      setPaymentMethod(
                        e.target.value as "COD" | "VNPay" | "Momo" | "BankTransfer"
                      )
                    }
                  >
                    {PAYMENT_METHODS.map((method) => (
                      <Paper
                        key={method.value}
                        elevation={0}
                        sx={{
                          p: 2,
                          mb: 2,
                          border: "1px solid #eee",
                          borderRadius: 2,
                          transition: "all 0.2s",
                          bgcolor:
                            paymentMethod === method.value
                              ? "rgba(230,0,35,0.05)"
                              : "#fff",
                          borderColor:
                            paymentMethod === method.value ? "#E60023" : "#eee",
                          "&:hover": {
                            borderColor: "#E60023",
                            boxShadow: "0 4px 12px rgba(230,0,35,0.08)",
                          },
                        }}
                      >
                        <FormControlLabel
                          value={method.value}
                          control={<Radio sx={{ color: "#E60023" }} />}
                          label={
                            <Box
                              sx={{
                                display: "flex",
                                alignItems: "center",
                                gap: 1.5,
                              }}
                            >
                              {method.icon}
                              <Box>
                                <Typography
                                  variant="body2"
                                  sx={{ fontWeight: 700, color: "#1a1a1a" }}
                                >
                                  {method.label}
                                </Typography>
                                <Typography variant="caption" sx={{ color: "#888" }}>
                                  {method.desc}
                                </Typography>
                              </Box>
                            </Box>
                          }
                        />
                      </Paper>
                    ))}
                  </RadioGroup>
                </FormControl>

                {paymentMethod !== "COD" && (
                  <Alert severity="warning" sx={{ mt: 2 }}>
                    Thanh toán online đang được phát triển. Vui lòng chọn COD.
                  </Alert>
                )}
              </Box>
            </Paper>
          </Grid>

          {/* ===== RIGHT: Summary ===== */}
          <Grid size={{ xs: 12, lg: 5 }}>
            <Box sx={{ position: "sticky", top: 88 }}>
              <Paper
                elevation={0}
                sx={{ border: "1px solid #eee", borderRadius: 2, p: 3, mb: 3 }}
              >
                <Typography
                  variant="subtitle1"
                  sx={{ fontWeight: 800, color: "#1a1a1a", mb: 2 }}
                >
                  ĐƠN HÀNG CỦA BẠN
                </Typography>

                {/* Items list */}
                <Box sx={{ maxHeight: 280, overflowY: "auto", pr: 1 }}>
                  {items.map((item) => (
                    <Box
                      key={item._id}
                      sx={{ display: "flex", gap: 2, mb: 2, alignItems: "center" }}
                    >
                      <Box sx={{ position: "relative", flexShrink: 0 }}>
                        <Box
                          component="img"
                          src={getImageUrl(item.productId.image?.[0])}
                          alt={item.productId.name}
                          sx={{
                            width: 56,
                            height: 56,
                            objectFit: "contain",
                            border: "1px solid #eee",
                            borderRadius: 1.5,
                            bgcolor: "#fafafa",
                            p: 0.5,
                          }}
                        />
                        <Box
                          sx={{
                            position: "absolute",
                            top: -6,
                            right: -6,
                            bgcolor: "#E60023",
                            color: "white",
                            borderRadius: "50%",
                            width: 20,
                            height: 20,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          <Typography sx={{ fontSize: "0.65rem", fontWeight: 700 }}>
                            {item.qty}
                          </Typography>
                        </Box>
                      </Box>

                      <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                        <Typography
                          variant="body2"
                          sx={{
                            fontWeight: 600,
                            color: "#1a1a1a",
                            fontSize: "0.85rem",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            display: "-webkit-box",
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: "vertical",
                          }}
                        >
                          {item.productId.name}
                        </Typography>
                        <Typography variant="caption" sx={{ color: "#888" }}>
                          {formatPrice(item.productId.salePrice || item.productId.price)} x
                          {item.qty}
                        </Typography>
                      </Box>

                      <Typography
                        variant="body2"
                        sx={{ fontWeight: 700, color: "#E60023", flexShrink: 0 }}
                      >
                        {formatPrice(
                          (item.productId.salePrice || item.productId.price) * item.qty
                        )}
                      </Typography>
                    </Box>
                  ))}
                </Box>

                <Divider sx={{ my: 2 }} />

                {/* Coupon */}
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    mb: 1,
                  }}
                >
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <Tag size={16} color="#666" />
                    <Typography variant="body2" sx={{ color: "#666" }}>
                      Mã giảm giá
                    </Typography>
                  </Box>
                  {couponCode ? (
                    <Chip
                      label={couponCode}
                      size="small"
                      sx={{ bgcolor: "#E6F4FF", color: "#0F62FE" }}
                    />
                  ) : (
                    <Typography variant="body2" sx={{ color: "#aaa" }}>
                      Không áp dụng
                    </Typography>
                  )}
                </Box>

                {/* Price summary */}
                <Box sx={{ mt: 2 }}>
                  <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
                    <Typography variant="body2" sx={{ color: "#666" }}>
                      Tạm tính ({totalItems} SP)
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {formatPrice(subtotal)}
                    </Typography>
                  </Box>
                  {discountAmount > 0 && (
                    <Box
                      sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}
                    >
                      <Typography variant="body2" sx={{ color: "#666" }}>
                        Giảm giá
                      </Typography>
                      <Typography
                        variant="body2"
                        sx={{ fontWeight: 600, color: "#22c55e" }}
                      >
                        -{formatPrice(discountAmount)}
                      </Typography>
                    </Box>
                  )}
                  <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
                    <Typography variant="body2" sx={{ color: "#666" }}>
                      Phí vận chuyển
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {shippingFee === 0 ? "Miễn phí" : formatPrice(shippingFee)}
                    </Typography>
                  </Box>
                </Box>

                <Divider sx={{ my: 2 }} />

                <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
                    Tổng cộng
                  </Typography>
                  <Typography variant="h6" sx={{ fontWeight: 900, color: "#E60023" }}>
                    {formatPrice(finalTotal)}
                  </Typography>
                </Box>

                <Button
                  fullWidth
                  variant="contained"
                  disabled={submitting}
                  onClick={handleSubmit}
                  sx={{
                    mt: 3,
                    bgcolor: "#E60023",
                    "&:hover": { bgcolor: "#c4001d" },
                    fontWeight: 700,
                    py: 1.3,
                    borderRadius: 2,
                    boxShadow: "0 8px 20px rgba(230,0,35,0.2)",
                  }}
                >
                  {submitting ? (
                    <CircularProgress size={22} sx={{ color: "#fff" }} />
                  ) : (
                    "Đặt hàng"
                  )}
                </Button>
              </Paper>

              {/* Summary note */}
              <Paper
                elevation={0}
                sx={{ border: "1px dashed #eee", borderRadius: 2, p: 2.5, bgcolor: "#fafafa" }}
              >
                <Typography variant="body2" sx={{ color: "#666", lineHeight: 1.6 }}>
                  Bằng việc bấm <b>Đặt hàng</b>, bạn đồng ý với điều khoản và chính sách
                  của chúng tôi.
                </Typography>
              </Paper>
            </Box>
          </Grid>
        </Grid>
      </Container>
    </MainLayout>
  );
};

export default Checkout;

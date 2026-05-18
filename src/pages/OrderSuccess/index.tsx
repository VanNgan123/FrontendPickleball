import { useEffect } from "react";
import { useNavigate, useLocation, useParams } from "react-router-dom";
import {
  Box,
  Container,
  Typography,
  Button,
  Paper,
  Divider,
  Chip,
} from "@mui/material";
import Grid from "@mui/material/Grid";
import {
  CheckCircle2,
  ShoppingBag,
  MapPin,
  Phone,
  User,
  CreditCard,
  ChevronRight,
  Home,
  Package,
} from "lucide-react";
import MainLayout from "../../layout/MainLayout/MainLayout";
import type { Order } from "../../services/orderService";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";

const getImageUrl = (imagePath?: string) => {
  if (!imagePath) return "/placeholder.png";
  if (imagePath.startsWith("http")) return imagePath;
  const baseUrl = API_URL.replace(/\/+$/, "");
  const path = imagePath.startsWith("/") ? imagePath : `/${imagePath}`;
  return `${baseUrl}${path.replace(/\\/g, "/")}`;
};

const formatPrice = (price: number) => price.toLocaleString("vi-VN") + "đ";

const formatDate = (dateStr: string) => {
  const date = new Date(dateStr);
  return date.toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const STATUS_MAP: Record<string, { label: string; color: string; bg: string }> = {
  Pending: { label: "Chờ xác nhận", color: "#f59e0b", bg: "rgba(245,158,11,0.1)" },
  Confirmed: { label: "Đã xác nhận", color: "#3b82f6", bg: "rgba(59,130,246,0.1)" },
  Shipping: { label: "Đang giao", color: "#8b5cf6", bg: "rgba(139,92,246,0.1)" },
  Completed: { label: "Hoàn thành", color: "#22c55e", bg: "rgba(34,197,94,0.1)" },
  Cancelled: { label: "Đã hủy", color: "#ef4444", bg: "rgba(239,68,68,0.1)" },
};

const PAYMENT_LABEL: Record<string, string> = {
  COD: "Thanh toán khi nhận hàng (COD)",
  VNPay: "VNPay",
  Momo: "Ví MoMo",
  BankTransfer: "Chuyển khoản ngân hàng",
};

const OrderSuccess = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams<{ id: string }>();

  // Lay order tu location state (duoc truyen tu Checkout)
  const order = (location.state as { order: Order } | null)?.order;

  // Neu khong co order trong state -> redirect ve trang chu
  useEffect(() => {
    if (!order && !id) {
      navigate("/");
    }
  }, [order, id, navigate]);

  if (!order) {
    return (
      <MainLayout>
        <Container maxWidth="md" sx={{ py: 10, textAlign: "center" }}>
          <Typography
            variant="h5"
            sx={{ fontWeight: 700, color: "#1a1a1a", mb: 2 }}
          >
            Không tìm thấy đơn hàng
          </Typography>
          <Button
            variant="contained"
            onClick={() => navigate("/")}
            sx={{ bgcolor: "#E60023", "&:hover": { bgcolor: "#c4001d" }, fontWeight: 700 }}
          >
            Về trang chủ
          </Button>
        </Container>
      </MainLayout>
    );
  }

  const status = STATUS_MAP[order.status] || STATUS_MAP.Pending;
  const addr = order.shippingAddress;

  return (
    <MainLayout>
      <Container maxWidth="md" sx={{ py: 4, pb: 8 }}>
        {/* ===== Success Banner ===== */}
        <Box
          sx={{
            textAlign: "center",
            py: 5,
            px: 3,
            mb: 4,
            borderRadius: 3,
            background: "linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)",
            border: "1.5px solid #86efac",
            position: "relative",
            overflow: "hidden",
            "&::before": {
              content: '""',
              position: "absolute",
              top: -40,
              right: -40,
              width: 150,
              height: 150,
              borderRadius: "50%",
              bgcolor: "rgba(34,197,94,0.1)",
            },
          }}
        >
          {/* Animated check icon */}
          <Box
            sx={{
              width: 80,
              height: 80,
              borderRadius: "50%",
              bgcolor: "#22c55e",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              mx: "auto",
              mb: 2,
              boxShadow: "0 8px 24px rgba(34,197,94,0.35)",
              animation: "popIn 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275) both",
              "@keyframes popIn": {
                from: { transform: "scale(0)", opacity: 0 },
                to: { transform: "scale(1)", opacity: 1 },
              },
            }}
          >
            <CheckCircle2 size={44} color="white" />
          </Box>

          <Typography
            variant="h4"
            sx={{
              fontWeight: 900,
              color: "#15803d",
              mb: 1,
              fontSize: { xs: "1.5rem", md: "2rem" },
            }}
          >
            Đặt hàng thành công! 🎉
          </Typography>
          <Typography variant="body1" sx={{ color: "#166534", mb: 2 }}>
            Cảm ơn bạn đã tin tưởng mua sắm tại Pickleball Bạch Đằng
          </Typography>

          {/* Order ID */}
          <Box
            sx={{
              display: "inline-flex",
              alignItems: "center",
              gap: 1,
              bgcolor: "white",
              px: 3,
              py: 1,
              borderRadius: 10,
              border: "1px solid #86efac",
            }}
          >
            <Package size={16} color="#22c55e" />
            <Typography variant="body2" sx={{ fontWeight: 700, color: "#1a1a1a" }}>
              Mã đơn hàng:
            </Typography>
            <Typography
              variant="body2"
              sx={{
                fontWeight: 900,
                color: "#E60023",
                fontFamily: "monospace",
                fontSize: "0.9rem",
              }}
            >
              #{order._id.slice(-8).toUpperCase()}
            </Typography>
          </Box>
        </Box>

        <Grid container spacing={3}>
          {/* ===== LEFT: Order details ===== */}
          <Grid size={{ xs: 12, md: 7 }}>
            {/* Order items */}
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
              <Box
                sx={{
                  px: 3,
                  py: 2,
                  bgcolor: "#fafafa",
                  borderBottom: "1px solid #f0f0f0",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <ShoppingBag size={16} color="#E60023" />
                  <Typography
                    variant="subtitle2"
                    sx={{ fontWeight: 800, color: "#1a1a1a" }}
                  >
                    SẢN PHẨM ({order.items.length})
                  </Typography>
                </Box>
                <Chip
                  label={status.label}
                  size="small"
                  sx={{
                    bgcolor: status.bg,
                    color: status.color,
                    fontWeight: 700,
                    fontSize: "0.75rem",
                    border: `1px solid ${status.color}`,
                  }}
                />
              </Box>

              <Box sx={{ px: 3, py: 1 }}>
                {order.items.map((item, idx) => {
                  const p = item.productId;
                  return (
                    <Box
                      key={idx}
                      sx={{
                        display: "flex",
                        gap: 2,
                        py: 2,
                        borderBottom:
                          idx < order.items.length - 1 ? "1px solid #f5f5f5" : "none",
                        alignItems: "center",
                      }}
                    >
                      <Box sx={{ position: "relative", flexShrink: 0 }}>
                        <Box
                          component="img"
                          src={getImageUrl(p.image?.[0])}
                          alt={p.name}
                          sx={{
                            width: 64,
                            height: 64,
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
                          {p.name}
                        </Typography>
                        <Typography variant="caption" sx={{ color: "#888" }}>
                          {formatPrice(item.price)} x {item.qty}
                        </Typography>
                      </Box>

                      <Typography
                        variant="body2"
                        sx={{ fontWeight: 700, color: "#E60023", flexShrink: 0 }}
                      >
                        {formatPrice(item.price * item.qty)}
                      </Typography>
                    </Box>
                  );
                })}
              </Box>

              {/* Total */}
              <Box
                sx={{
                  px: 3,
                  py: 2,
                  borderTop: "1px solid #f0f0f0",
                  bgcolor: "#fafafa",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <Typography variant="body2" sx={{ color: "#666" }}>
                  Tổng cộng
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: 900, color: "#E60023" }}>
                  {formatPrice(order.total)}
                </Typography>
              </Box>
            </Paper>

            {/* Shipping & Payment info */}
            <Paper
              elevation={0}
              sx={{ border: "1px solid #eee", borderRadius: 2, overflow: "hidden", bgcolor: "#fff" }}
            >
              <Box sx={{ px: 3, py: 2, bgcolor: "#fafafa", borderBottom: "1px solid #f0f0f0" }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 800, color: "#1a1a1a" }}>
                  THÔNG TIN ĐƠN HÀNG
                </Typography>
              </Box>

              <Box sx={{ px: 3, py: 2.5 }}>
                {/* Ngay dat */}
                <Box sx={{ display: "flex", gap: 1.5, mb: 2 }}>
                  <Package size={16} color="#888" style={{ marginTop: 2, flexShrink: 0 }} />
                  <Box>
                    <Typography variant="caption" sx={{ color: "#888", display: "block" }}>
                      Ngày đặt hàng
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600, color: "#1a1a1a" }}>
                      {formatDate(order.createdAt)}
                    </Typography>
                  </Box>
                </Box>

                <Divider sx={{ my: 1.5 }} />

                {/* Dia chi giao hang */}
                <Box sx={{ display: "flex", gap: 1.5, mb: 2, mt: 1.5 }}>
                  <MapPin size={16} color="#888" style={{ marginTop: 2, flexShrink: 0 }} />
                  <Box>
                    <Typography variant="caption" sx={{ color: "#888", display: "block" }}>
                      Địa chỉ giao hàng
                    </Typography>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 0.3 }}>
                      <User size={12} color="#aaa" />
                      <Typography variant="body2" sx={{ fontWeight: 600, color: "#1a1a1a" }}>
                        {addr.fullName}
                      </Typography>
                    </Box>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 0.3 }}>
                      <Phone size={12} color="#aaa" />
                      <Typography variant="body2" sx={{ color: "#555" }}>
                        {addr.phone}
                      </Typography>
                    </Box>
                    <Typography variant="body2" sx={{ color: "#555" }}>
                      {addr.address}, {addr.ward}, {addr.district}, {addr.city}
                    </Typography>
                  </Box>
                </Box>

                <Divider sx={{ my: 1.5 }} />

                {/* Phuong thuc thanh toan */}
                <Box sx={{ display: "flex", gap: 1.5, mt: 1.5 }}>
                  <CreditCard size={16} color="#888" style={{ marginTop: 2, flexShrink: 0 }} />
                  <Box>
                    <Typography variant="caption" sx={{ color: "#888", display: "block" }}>
                      Phương thức thanh toán
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600, color: "#1a1a1a" }}>
                      {PAYMENT_LABEL[order.paymentMethod] || order.paymentMethod}
                    </Typography>
                  </Box>
                </Box>
              </Box>
            </Paper>
          </Grid>

          {/* ===== RIGHT: Actions & Timeline ===== */}
          <Grid size={{ xs: 12, md: 5 }}>
            <Box sx={{ position: "sticky", top: 88 }}>
              {/* Action buttons */}
              <Paper
                elevation={0}
                sx={{ border: "1px solid #eee", borderRadius: 2, p: 3, mb: 3, bgcolor: "#fff" }}
              >
                <Typography variant="subtitle2" sx={{ fontWeight: 800, color: "#1a1a1a", mb: 2 }}>
                  BẠN MUỐN LÀM GÌ TIẾP?
                </Typography>

                <Button
                  variant="contained"
                  fullWidth
                  startIcon={<ShoppingBag size={18} />}
                  onClick={() => navigate("/products")}
                  sx={{
                    bgcolor: "#E60023",
                    "&:hover": { bgcolor: "#c4001d" },
                    fontWeight: 700,
                    py: 1.3,
                    borderRadius: 2,
                    mb: 1.5,
                  }}
                >
                  Tiếp tục mua sắm
                </Button>

                <Button
                  variant="outlined"
                  fullWidth
                  startIcon={<Package size={18} />}
                  onClick={() => navigate("/orders")}
                  sx={{
                    borderColor: "#002c4b",
                    color: "#002c4b",
                    fontWeight: 700,
                    py: 1.3,
                    borderRadius: 2,
                    mb: 1.5,
                  }}
                >
                  Xem đơn hàng của tôi
                </Button>

                <Button
                  variant="text"
                  fullWidth
                  startIcon={<Home size={18} />}
                  onClick={() => navigate("/")}
                  sx={{ color: "#666", fontWeight: 700 }}
                >
                  Về trang chủ
                </Button>
              </Paper>

              {/* Timeline */}
              <Paper
                elevation={0}
                sx={{ border: "1px solid #eee", borderRadius: 2, p: 3, bgcolor: "#fff" }}
              >
                <Typography variant="subtitle2" sx={{ fontWeight: 800, color: "#1a1a1a", mb: 2 }}>
                  TRẠNG THÁI ĐƠN HÀNG
                </Typography>

                {["Pending", "Confirmed", "Shipping", "Completed"].map((step, idx) => {
                  const isActive = step === order.status;
                  const isPassed =
                    ["Pending", "Confirmed", "Shipping", "Completed"].indexOf(order.status) >=
                    idx;

                  return (
                    <Box key={step} sx={{ display: "flex", gap: 2, mb: 2 }}>
                      <Box
                        sx={{
                          width: 24,
                          height: 24,
                          borderRadius: "50%",
                          bgcolor: isPassed ? "#22c55e" : "#e0e0e0",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          flexShrink: 0,
                        }}
                      >
                        {isPassed ? (
                          <CheckCircle2 size={14} color="white" />
                        ) : (
                          <Typography variant="caption" sx={{ color: "white", fontWeight: 700 }}>
                            {idx + 1}
                          </Typography>
                        )}
                      </Box>
                      <Box>
                        <Typography
                          variant="body2"
                          sx={{ fontWeight: isActive ? 700 : 400, color: isActive ? "#E60023" : "#666" }}
                        >
                          {STATUS_MAP[step].label}
                        </Typography>
                        {isActive && (
                          <Typography variant="caption" sx={{ color: "#888" }}>
                            Đơn hàng đang ở trạng thái này
                          </Typography>
                        )}
                      </Box>
                    </Box>
                  );
                })}
              </Paper>
            </Box>
          </Grid>
        </Grid>
      </Container>
    </MainLayout>
  );
};

export default OrderSuccess;

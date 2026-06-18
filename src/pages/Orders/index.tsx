import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box, Container, Typography, Button, Paper, Chip,
  CircularProgress, Divider, Tab, Tabs,
} from "@mui/material";
import Grid from "@mui/material/Grid";
import {
  Package, ChevronRight, ShoppingBag, MapPin, Clock,
  CheckCircle2, Truck, XCircle, RefreshCw, CreditCard,
  User, Phone, MapPinned, ShieldAlert, ShieldCheck,
} from "lucide-react";
import { useSelector } from "react-redux";
import type { RootState } from "../../store/store";
import orderService from "../../services/orderService";
import type { Order } from "../../services/orderService";
import paymentService from "../../services/paymentService";
import MainLayout from "../../layout/MainLayout/MainLayout";
import toast from "react-hot-toast";
import { OrderCardSkeleton } from "../../components/Skeletons";
import storeImg from "../../assets/about/store.png";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";

/* ─── Design Tokens ─── */
const T = {
  navy: "#0F172A",
  navyDark: "#020617",
  teal: "#0F766E",
  tealLight: "#14B8A6",
  lime: "#84CC16",
  text: "#0F172A",
  textSub: "#475569",
  textMuted: "#94A3B8",
  border: "#E2E8F0",
  bgPage: "#F8FAFC",
  bgCard: "#FFFFFF",
  red: "#EF4444",
  shadow: "0 10px 30px rgba(15,23,42,0.05)",
  shadowHover: "0 20px 40px rgba(15,23,42,0.12)",
};

const getImageUrl = (imagePath?: string) => {
  if (!imagePath) return "/placeholder.png";
  if (imagePath.startsWith("http")) return imagePath;
  const baseUrl = API_URL.replace(/\/+$/, "");
  const path = imagePath.startsWith("/") ? imagePath : `/${imagePath}`;
  return `${baseUrl}${path.replace(/\\/g, "/")}`;
};

const formatPrice = (price: number) => price.toLocaleString("vi-VN") + "đ";

const formatDate = (dateStr: string) =>
  new Date(dateStr).toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

// Status configuration details
const STATUS_CONFIG: Record<
  string,
  { label: string; color: string; bg: string; border: string; icon: React.ReactNode }
> = {
  Pending: {
    label: "Chờ xác nhận",
    color: "#D97706",
    bg: "rgba(217,119,6,0.08)",
    border: "rgba(217,119,6,0.25)",
    icon: <Clock size={14} />,
  },
  Confirmed: {
    label: "Đã xác nhận",
    color: "#2563EB",
    bg: "rgba(37,99,235,0.08)",
    border: "rgba(37,99,235,0.25)",
    icon: <CheckCircle2 size={14} />,
  },
  Shipping: {
    label: "Đang giao hàng",
    color: "#7C3AED",
    bg: "rgba(124,58,237,0.08)",
    border: "rgba(124,58,237,0.25)",
    icon: <Truck size={14} />,
  },
  Completed: {
    label: "Hoàn thành",
    color: "#16A34A",
    bg: "rgba(22,163,74,0.08)",
    border: "rgba(22,163,74,0.25)",
    icon: <CheckCircle2 size={14} />,
  },
  Cancelled: {
    label: "Đã hủy",
    color: "#DC2626",
    bg: "rgba(220,38,38,0.08)",
    border: "rgba(220,38,38,0.25)",
    icon: <XCircle size={14} />,
  },
};

const PAYMENT_LABEL: Record<string, string> = {
  COD: "Thanh toán khi nhận hàng (COD)",
  VNPay: "VNPay Online",
  Momo: "MoMo Pay",
  BankTransfer: "Chuyển khoản ngân hàng",
};

const getPaymentBadge = (order: Order) => {
  const paymentStatus = order.paymentStatus || "Unpaid";
  const isPaid = paymentStatus === "Paid" && Boolean(order.paidAt);

  if (order.paymentMethod === "COD") {
    return {
      label: "Thanh toán khi nhận hàng",
      bg: "rgba(15,23,42,0.06)",
      color: T.textSub,
    };
  }

  if (isPaid) {
    return {
      label: "Đã thanh toán online",
      bg: "rgba(16,185,129,0.1)",
      color: "#059669",
    };
  }

  if (paymentStatus === "Failed") {
    return {
      label: "Thanh toán online thất bại",
      bg: "rgba(239,68,68,0.1)",
      color: "#EF4444",
    };
  }

  if (paymentStatus === "Refunded") {
    return {
      label: "Đã hoàn tiền",
      bg: "rgba(239,68,68,0.1)",
      color: "#EF4444",
    };
  }

  return {
    label: "Chưa thanh toán VNPay",
    bg: "rgba(217,119,6,0.1)",
    color: "#D97706",
  };
};


const TABS = [
  { value: "all", label: "Tất cả" },
  { value: "Pending", label: "Chờ xác nhận" },
  { value: "Confirmed", label: "Đã xác nhận" },
  { value: "Shipping", label: "Đang giao" },
  { value: "Completed", label: "Hoàn thành" },
  { value: "Cancelled", label: "Đã hủy" },
];

/* ─── Timeline Steps ─── */
const TIMELINE_STEPS = [
  { status: "Pending", label: "Chờ xác nhận", desc: "Đơn hàng đã được đặt thành công" },
  { status: "Confirmed", label: "Đã xác nhận", desc: "Cửa hàng đang đóng gói sản phẩm" },
  { status: "Shipping", label: "Đang giao hàng", desc: "Đơn vị vận chuyển đã lấy hàng" },
  { status: "Completed", label: "Đã giao hàng", desc: "Đơn hàng được giao thành công" },
];

// =============================================
// Order Pay Button Component
// =============================================
const OrderPayButton = ({
  order,
  size = "small",
  variant = "contained",
}: {
  order: Order;
  size?: "small" | "medium";
  variant?: "contained" | "outlined";
}) => {
  const [isPaying, setIsPaying] = useState(false);

  const handlePayNow = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      setIsPaying(true);
      const res = await paymentService.createVNPayUrl(order._id);
      if (res.status === "OK" && res.paymentUrl) {
        window.location.href = res.paymentUrl;
      } else {
        toast.error(res.message || "Không thể tạo liên kết thanh toán");
      }
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } }; message?: string };
      toast.error(err.response?.data?.message || "Lỗi kết nối đến server");
    } finally {
      setIsPaying(false);
    }
  };

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handlePayNow}
      disabled={isPaying}
      sx={{
        bgcolor: variant === "contained" ? T.teal : "transparent",
        color: variant === "contained" ? "white" : T.teal,
        borderColor: T.teal,
        fontWeight: 800,
        fontSize: "0.82rem",
        borderRadius: 99,
        px: 2.5,
        py: 0.8,
        textTransform: "none",
        "&:hover": {
          bgcolor: variant === "contained" ? T.navy : "rgba(15,118,110,0.04)",
          borderColor: T.teal,
        },
        transition: "all 200ms ease",
      }}
    >
      {isPaying ? "Đang xử lý..." : "Thanh toán ngay"}
    </Button>
  );
};

// =============================================
// Order Card Component
// =============================================
const OrderCard = ({
  order,
  onViewDetail,
  isSelected,
}: {
  order: Order;
  onViewDetail: (order: Order) => void;
  isSelected: boolean;
}) => {
  const status = STATUS_CONFIG[order.status] || STATUS_CONFIG.Pending;
  const paymentBadge = getPaymentBadge(order);

  return (
    <Paper
      elevation={0}
      sx={{
        border: isSelected ? `2.2px solid ${T.teal}` : `1px solid ${T.border}`,
        borderRadius: 4,
        overflow: "hidden",
        mb: 2.5,
        bgcolor: T.bgCard,
        boxShadow: isSelected ? T.shadowHover : T.shadow,
        transition: "all 250ms ease",
        "&:hover": {
          boxShadow: T.shadowHover,
          borderColor: isSelected ? T.teal : `${T.teal}40`,
        },
      }}
    >
      {/* Card Header metadata */}
      <Box
        sx={{
          px: { xs: 2.5, md: 3.5 },
          py: 2,
          bgcolor: "#F8FAFC",
          borderBottom: `1px solid ${T.border}`,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 1.5,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 2, flexWrap: "wrap" }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Package size={16} color={T.teal} />
            <Typography variant="body2" sx={{ fontWeight: 800, color: T.navy }}>
              Mã đơn hàng:
            </Typography>
            <Typography
              variant="body2"
              sx={{ fontWeight: 900, color: T.teal, fontFamily: "monospace", letterSpacing: 0.5 }}
            >
              #{order._id.slice(-8).toUpperCase()}
            </Typography>
          </Box>
          <Typography variant="caption" sx={{ color: T.textMuted, display: { xs: "none", sm: "inline" } }}>
            |
          </Typography>
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
            <Clock size={14} color="#94A3B8" />
            <Typography variant="caption" sx={{ color: T.textSub, fontWeight: 600 }}>
              {formatDate(order.createdAt)}
            </Typography>
          </Box>
        </Box>

        <Chip
          icon={<Box sx={{ display: "flex", color: status.color, mr: 0.5 }}>{status.icon}</Box>}
          label={status.label}
          size="small"
          sx={{
            bgcolor: status.bg,
            color: status.color,
            fontWeight: 800,
            fontSize: "0.78rem",
            px: 1,
            py: 1.5,
            borderRadius: 2,
            border: `1px solid ${status.border}`,
            "& .MuiChip-icon": { color: "inherit", ml: 0.5 },
          }}
        />
      </Box>

      {/* Items list summary */}
      <Box sx={{ px: { xs: 2.5, md: 3.5 }, py: 3 }}>
        {order.items.slice(0, 2).map((item, idx) => {
          const p = item.productId;
          return (
            <Box
              key={idx}
              sx={{
                display: "flex",
                gap: 2.5,
                mb: idx < order.items.slice(0, 2).length - 1 ? 2.5 : 0,
                alignItems: "center",
              }}
            >
              <Box
                component="img"
                src={getImageUrl(p.image?.[0])}
                alt={p.name}
                sx={{
                  width: 60,
                  height: 60,
                  objectFit: "contain",
                  border: `1px solid ${T.border}`,
                  borderRadius: 2,
                  bgcolor: "#F8FAFC",
                  p: 0.6,
                  flexShrink: 0,
                }}
              />
              <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                <Typography
                  variant="body2"
                  sx={{
                    fontWeight: 800,
                    color: T.navy,
                    fontSize: "0.9rem",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    display: "-webkit-box",
                    WebkitLineClamp: 1,
                    WebkitBoxOrient: "vertical",
                    mb: 0.5,
                  }}
                >
                  {p.name}
                </Typography>
                <Typography variant="caption" sx={{ color: T.textSub, fontWeight: 700 }}>
                  Đơn giá: {formatPrice(item.price)} <Box component="span" sx={{ color: T.textMuted, mx: 0.8 }}>x</Box> Số lượng: {item.qty}
                </Typography>
              </Box>
              <Typography
                variant="body2"
                sx={{ fontWeight: 900, color: T.navy, flexShrink: 0, fontSize: "0.95rem" }}
              >
                {formatPrice(item.price * item.qty)}
              </Typography>
            </Box>
          );
        })}

        {order.items.length > 2 && (
          <Typography variant="caption" sx={{ color: T.teal, fontWeight: 700, mt: 1.5, display: "block", fontStyle: "italic" }}>
            + và {order.items.length - 2} sản phẩm khác...
          </Typography>
        )}
      </Box>

      <Divider sx={{ borderColor: T.border }} />

      {/* Card Footer summary & quick view */}
      <Box
        sx={{
          px: { xs: 2.5, md: 3.5 },
          py: 2,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 2,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 2.5, flexWrap: "wrap" }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
            <MapPin size={15} color={T.textMuted} />
            <Typography variant="caption" sx={{ color: T.textSub, fontWeight: 700 }}>
              Giao đến: {order.shippingAddress?.city || "-"}
            </Typography>
          </Box>

          <Chip
            label={paymentBadge.label}
            size="small"
            sx={{
              height: 22,
              fontSize: "0.75rem",
              fontWeight: 800,
              bgcolor: paymentBadge.bg,
              color: paymentBadge.color,
            }}
          />
        </Box>

        <Box sx={{ display: "flex", alignItems: "center", gap: 3 }}>
          <Box sx={{ textAlign: "right" }}>
            <Typography variant="caption" sx={{ color: T.textMuted, fontWeight: 600 }}>
              Tổng tiền ({order.items.reduce((s, i) => s + i.qty, 0)} sản phẩm)
            </Typography>
            <Typography variant="subtitle1" sx={{ fontWeight: 950, color: T.red, lineHeight: 1 }}>
              {formatPrice(order.total)}
            </Typography>
          </Box>

          {order.paymentMethod !== "COD" &&
            !(order.paymentStatus === "Paid" && Boolean(order.paidAt)) &&
            order.paymentStatus !== "Refunded" &&
            order.status !== "Cancelled" && (
              <OrderPayButton order={order} />
            )}

          <Button
            variant="outlined"
            size="small"
            endIcon={<ChevronRight size={14} />}
            onClick={() => onViewDetail(order)}
            sx={{
              borderColor: T.teal,
              color: T.teal,
              fontWeight: 800,
              fontSize: "0.82rem",
              borderRadius: 99,
              px: 2.5,
              py: 0.8,
              textTransform: "none",
              "&:hover": {
                bgcolor: T.teal,
                color: "white",
                borderColor: T.teal,
              },
              transition: "all 200ms ease",
            }}
          >
            Chi tiết
          </Button>
        </Box>
      </Box>
    </Paper>
  );
};

// =============================================
// Detailed Order Breakdown Panel
// =============================================
const OrderDetail = ({ order, onClose }: { order: Order; onClose: () => void }) => {
  const status = STATUS_CONFIG[order.status] || STATUS_CONFIG.Pending;
  const addr = order.shippingAddress;

  // Active steps in history calculation
  const getActiveStep = () => {
    if (order.status === "Cancelled") return -1;
    if (order.status === "Pending") return 0;
    if (order.status === "Confirmed") return 1;
    if (order.status === "Shipping") return 2;
    if (order.status === "Completed") return 3;
    return 0;
  };

  const activeStep = getActiveStep();

  return (
    <Paper
      elevation={0}
      sx={{
        border: `2px solid ${T.teal}30`,
        borderRadius: 4,
        overflow: "hidden",
        mb: 4,
        bgcolor: T.bgCard,
        boxShadow: "0 20px 40px rgba(15,118,110,0.06)",
        animation: "slideDown 280ms cubic-bezier(0.4, 0, 0.2, 1)",
        "@keyframes slideDown": {
          from: { opacity: 0, transform: "translateY(-12px)" },
          to: { opacity: 1, transform: "translateY(0)" },
        },
      }}
    >
      {/* Header bar */}
      <Box
        sx={{
          px: { xs: 2.5, md: 4 },
          py: 2.5,
          background: `linear-gradient(135deg, #F8FAFC 0%, ${status.bg} 100%)`,
          borderBottom: `1px solid ${T.border}`,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Box>
          <Typography variant="subtitle1" sx={{ fontWeight: 900, color: T.navy }}>
            CHI TIẾT ĐƠN HÀNG #{order._id.slice(-8).toUpperCase()}
          </Typography>
          <Typography variant="caption" sx={{ color: T.textSub, fontWeight: 700 }}>
            Ngày đặt: {formatDate(order.createdAt)}
          </Typography>
        </Box>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <Chip
            label={status.label}
            size="small"
            sx={{
              bgcolor: status.bg,
              color: status.color,
              fontWeight: 800,
              border: `1px solid ${status.border}`,
              borderRadius: 1.5,
            }}
          />
          <Button
            onClick={onClose}
            sx={{
              minWidth: "auto",
              color: T.textMuted,
              fontWeight: 900,
              fontSize: "1.1rem",
              p: 0.5,
              borderRadius: "50%",
              width: 32,
              height: 32,
              "&:hover": { bgcolor: "rgba(0,0,0,0.05)", color: T.navy },
            }}
          >
            ×
          </Button>
        </Box>
      </Box>

      {order.paymentMethod !== "COD" &&
        !(order.paymentStatus === "Paid" && Boolean(order.paidAt)) &&
        order.paymentStatus !== "Refunded" &&
        order.status !== "Cancelled" && (
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              bgcolor: "rgba(217,119,6,0.06)",
              borderBottom: `1px solid ${T.border}`,
              px: { xs: 2.5, md: 4 },
              py: 2,
              flexWrap: "wrap",
              gap: 2,
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
              <CreditCard size={18} color="#D97706" />
              <Typography variant="body2" sx={{ fontWeight: 805, color: "#D97706", fontSize: "0.85rem" }}>
                Đơn hàng chưa được thanh toán trực tuyến. Vui lòng thanh toán để hoàn tất đơn hàng.
              </Typography>
            </Box>
            <OrderPayButton order={order} size="medium" />
          </Box>
        )}

      <Box sx={{ p: { xs: 2.5, md: 4 } }}>
        {/* ══════════ DELIVERY STATUS TRACKING TIMELINE ══════════ */}
        <Box sx={{ mb: 5, mt: 1 }}>
          <Typography
            variant="caption"
            sx={{ fontWeight: 900, color: T.teal, textTransform: "uppercase", letterSpacing: 1.5, mb: 3, display: "block" }}
          >
            Trạng thái giao hàng
          </Typography>

          {order.status === "Cancelled" ? (
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 2,
                p: 2.2,
                bgcolor: "rgba(220,38,38,0.06)",
                border: "1px solid rgba(220,38,38,0.15)",
                borderRadius: 3,
              }}
            >
              <ShieldAlert size={24} color={T.red} />
              <Box>
                <Typography variant="body2" sx={{ fontWeight: 800, color: T.red }}>
                  Đơn hàng đã bị hủy
                </Typography>
                <Typography variant="caption" sx={{ color: T.textSub, fontWeight: 600 }}>
                  Đơn hàng này không còn hiệu lực. Vui lòng liên hệ hỗ trợ hoặc đặt đơn hàng mới.
                </Typography>
              </Box>
            </Box>
          ) : (
            /* Custom Timeline Nodes */
            <Grid container spacing={2} sx={{ position: "relative", px: { xs: 1, md: 3 } }}>
              {TIMELINE_STEPS.map((step, idx) => {
                const isCompleted = idx <= activeStep;
                const isCurrent = idx === activeStep;

                return (
                  <Grid size={{ xs: 12, sm: 3 }} key={step.status}>
                    <Box
                      sx={{
                        display: "flex",
                        flexDirection: { xs: "row", sm: "column" },
                        alignItems: "center",
                        textAlign: { xs: "left", sm: "center" },
                        position: "relative",
                        gap: { xs: 2, sm: 0 },
                      }}
                    >
                      {/* Connection bar (Desktop layout) */}
                      {idx < TIMELINE_STEPS.length - 1 && (
                        <Box
                          sx={{
                            display: { xs: "none", sm: "block" },
                            position: "absolute",
                            top: 18,
                            left: "50%",
                            right: "-50%",
                            height: 3,
                            bgcolor: idx < activeStep ? T.teal : "#E2E8F0",
                            zIndex: 1,
                            transition: "background-color 0.3s ease",
                          }}
                        />
                      )}

                      {/* Step Circle */}
                      <Box
                        sx={{
                          width: 36,
                          height: 36,
                          borderRadius: "50%",
                          bgcolor: isCurrent ? T.lime : isCompleted ? T.teal : "#F1F5F9",
                          color: isCurrent ? T.navy : isCompleted ? "#fff" : T.textMuted,
                          border: isCurrent ? `3px solid ${T.teal}` : "none",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontWeight: 900,
                          fontSize: "0.95rem",
                          zIndex: 2,
                          boxShadow: isCurrent ? `0 0 0 4px rgba(132,204,22,0.2)` : "none",
                          transition: "all 0.3s ease",
                          mb: { xs: 0, sm: 1.5 },
                        }}
                      >
                        {isCompleted ? <ShieldCheck size={18} /> : idx + 1}
                      </Box>

                      {/* Step labels */}
                      <Box>
                        <Typography
                          variant="body2"
                          sx={{
                            fontWeight: 800,
                            color: isCompleted ? T.navy : T.textMuted,
                            fontSize: "0.85rem",
                          }}
                        >
                          {step.label}
                        </Typography>
                        <Typography
                          variant="caption"
                          sx={{
                            color: T.textSub,
                            fontSize: "0.75rem",
                            display: "block",
                            mt: 0.3,
                            lineHeight: 1.3,
                          }}
                        >
                          {step.desc}
                        </Typography>
                      </Box>
                    </Box>
                  </Grid>
                );
              })}
            </Grid>
          )}
        </Box>

        <Divider sx={{ my: 3.5, borderColor: T.border }} />

        {/* ══════════ PRODUCTS DETAIL LIST ══════════ */}
        <Typography
          variant="caption"
          sx={{ fontWeight: 900, color: T.teal, textTransform: "uppercase", letterSpacing: 1.5, mb: 2, display: "block" }}
        >
          Danh sách sản phẩm mua
        </Typography>

        {order.items.map((item, idx) => {
          const p = item.productId;
          return (
            <Box
              key={idx}
              sx={{
                display: "flex",
                gap: 2.5,
                mb: 2.5,
                pb: 2.5,
                borderBottom: idx < order.items.length - 1 ? `1px solid ${T.border}` : "none",
                alignItems: "center",
              }}
            >
              <Box sx={{ position: "relative", flexShrink: 0 }}>
                <Box
                  component="img"
                  src={getImageUrl(p.image?.[0])}
                  alt={p.name}
                  sx={{
                    width: 72,
                    height: 72,
                    objectFit: "contain",
                    border: `1px solid ${T.border}`,
                    borderRadius: 2.5,
                    bgcolor: "#F8FAFC",
                    p: 0.8,
                  }}
                />
                <Box
                  sx={{
                    position: "absolute",
                    top: -8,
                    right: -8,
                    bgcolor: T.teal,
                    color: "white",
                    borderRadius: "50%",
                    width: 22,
                    height: 22,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    boxShadow: "0 2px 8px rgba(15,118,110,0.3)",
                  }}
                >
                  <Typography sx={{ fontSize: "0.7rem", fontWeight: 900 }}>{item.qty}</Typography>
                </Box>
              </Box>

              <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                <Typography
                  variant="body2"
                  sx={{
                    fontWeight: 800,
                    color: T.navy,
                    fontSize: "0.95rem",
                    mb: 0.5,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    display: "-webkit-box",
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: "vertical",
                  }}
                >
                  {p.name}
                </Typography>
                <Typography variant="caption" sx={{ color: T.textSub, fontWeight: 700 }}>
                  Đơn giá: {formatPrice(item.price)}
                </Typography>
              </Box>

              <Typography
                variant="body2"
                sx={{ fontWeight: 950, color: T.navy, flexShrink: 0, fontSize: "1.05rem" }}
              >
                {formatPrice(item.price * item.qty)}
              </Typography>
            </Box>
          );
        })}

        <Divider sx={{ my: 3.5, borderColor: T.border }} />

        {/* ══════════ SHIPPING & PAYMENT ADDRESSES ══════════ */}
        <Grid container spacing={4}>
          {/* Shipping addresses columns */}
          <Grid size={{ xs: 12, md: 6 }}>
            <Typography
              variant="caption"
              sx={{ fontWeight: 900, color: T.teal, textTransform: "uppercase", letterSpacing: 1.5, mb: 2, display: "block" }}
            >
              Địa chỉ nhận hàng
            </Typography>
            <Paper
              elevation={0}
              sx={{
                p: 3,
                bgcolor: "#F8FAFC",
                borderRadius: 3,
                border: `1px solid ${T.border}`,
                display: "flex",
                flexDirection: "column",
                gap: 1.5,
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                <User size={16} color={T.teal} />
                <Typography variant="body2" sx={{ fontWeight: 800, color: T.navy }}>
                  {addr.fullName}
                </Typography>
              </Box>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                <Phone size={16} color={T.teal} />
                <Typography variant="body2" sx={{ color: T.textSub, fontWeight: 600 }}>
                  {addr.phone}
                </Typography>
              </Box>
              <Box sx={{ display: "flex", alignItems: "flex-start", gap: 1.5 }}>
                <MapPinned size={16} color={T.teal} style={{ marginTop: 2 }} />
                <Typography variant="body2" sx={{ color: T.textSub, fontWeight: 600, lineHeight: 1.4 }}>
                  {addr.address}, {addr.ward}, {addr.district}, {addr.city}
                </Typography>
              </Box>
            </Paper>
          </Grid>

          {/* Payment receipt breakdowns */}
          <Grid size={{ xs: 12, md: 6 }}>
            <Typography
              variant="caption"
              sx={{ fontWeight: 900, color: T.teal, textTransform: "uppercase", letterSpacing: 1.5, mb: 2, display: "block" }}
            >
              Chi tiết hóa đơn thanh toán
            </Typography>
            <Paper
              elevation={0}
              sx={{
                p: 3,
                bgcolor: "#F8FAFC",
                borderRadius: 3,
                border: `1px solid ${T.border}`,
              }}
            >
              <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1.5 }}>
                <Typography variant="caption" sx={{ color: T.textSub, fontWeight: 700 }}>
                  Phương thức thanh toán
                </Typography>
                <Typography variant="caption" sx={{ fontWeight: 800, color: T.navy }}>
                  {PAYMENT_LABEL[order.paymentMethod] || order.paymentMethod}
                </Typography>
              </Box>
              <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1.5 }}>
                <Typography variant="caption" sx={{ color: T.textSub, fontWeight: 700 }}>
                  Trạng thái thanh toán
                </Typography>
                <Typography
                  variant="caption"
                  sx={{
                    fontWeight: 800,
                    color:
                      order.paymentMethod === "COD"
                        ? T.textSub
                        : order.paymentStatus === "Paid" && Boolean(order.paidAt)
                        ? "#059669"
                        : order.paymentStatus === "Failed" || order.paymentStatus === "Refunded"
                        ? "#EF4444"
                        : "#D97706",
                  }}
                >
                  {order.paymentMethod === "COD"
                    ? "Chờ thanh toán khi nhận hàng"
                    : order.paymentStatus === "Paid" && Boolean(order.paidAt)
                    ? "Đã thanh toán"
                    : order.paymentStatus === "Failed"
                    ? "Thanh toán thất bại"
                    : order.paymentStatus === "Refunded"
                    ? "Đã hoàn tiền"
                    : "Chờ thanh toán"}
                </Typography>
              </Box>
              <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1.5 }}>
                <Typography variant="caption" sx={{ color: T.textSub, fontWeight: 700 }}>
                  Số lượng sản phẩm
                </Typography>
                <Typography variant="caption" sx={{ fontWeight: 800, color: T.navy }}>
                  {order.items.reduce((s, i) => s + i.qty, 0)} sản phẩm
                </Typography>
              </Box>
              <Divider sx={{ my: 1.5, borderStyle: "dashed" }} />
              <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                <Typography variant="body2" sx={{ fontWeight: 800, color: T.navy }}>
                  Tổng thanh toán
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 950, color: T.red, fontSize: "1.1rem" }}>
                  {formatPrice(order.total)}
                </Typography>
              </Box>
            </Paper>
          </Grid>
        </Grid>
      </Box>
    </Paper>
  );
};

// =============================================
// Main Orders Component
// =============================================
const Orders = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);

  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }
    loadOrders();
  }, [isAuthenticated]);

  const loadOrders = async () => {
    try {
      setLoading(true);
      const res = await orderService.getMyOrders();
      setOrders(res.data || []);
    } catch {
      toast.error("Không thể tải danh sách đơn hàng");
    } finally {
      setLoading(false);
    }
  };

  const filteredOrders =
    activeTab === "all" ? orders : orders.filter((o) => o.status === activeTab);

  const statusCount = (status: string) =>
    status === "all" ? orders.length : orders.filter((o) => o.status === status).length;

  if (loading) {
    return (
      <MainLayout>
        {/* Skeleton Page Header */}
        <Box sx={{ bgcolor: T.navy, py: 6, mb: 4 }}>
          <Container maxWidth="lg">
            <CircularProgress sx={{ color: T.lime }} />
          </Container>
        </Box>
        <Container maxWidth="lg" sx={{ pb: 8 }}>
          <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 3 }}>
            <Typography variant="h5" sx={{ fontWeight: 900, color: T.navy }}>
              Đang tải đơn hàng...
            </Typography>
          </Box>
          {Array.from({ length: 3 }).map((_, i) => (
            <OrderCardSkeleton key={i} />
          ))}
        </Container>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <Box sx={{ bgcolor: T.bgPage, minHeight: "85vh", pb: 8 }}>
        {/* ══════════ HERO SECTION ══════════ */}
        <Box
          sx={{
            position: "relative",
            py: { xs: 5, md: 7 },
            overflow: "hidden",
            mb: 4,
          }}
        >
          <Box
            sx={{
              position: "absolute",
              inset: 0,
              backgroundImage: `url(${storeImg})`,
              backgroundSize: "cover",
              backgroundPosition: "center 30%",
              "&::after": {
                content: '""',
                position: "absolute",
                inset: 0,
                background: "linear-gradient(135deg, rgba(15,23,42,0.96) 0%, rgba(15,118,110,0.85) 100%)",
              },
            }}
          />

          <Container maxWidth="lg" sx={{ position: "relative", zIndex: 1 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
              <Typography
                sx={{ color: "rgba(255,255,255,0.6)", fontSize: "0.85rem", cursor: "pointer", "&:hover": { color: T.lime } }}
                onClick={() => navigate("/")}
              >
                Trang chủ
              </Typography>
              <ChevronRight size={14} color="rgba(255,255,255,0.4)" />
              <Typography sx={{ color: "#fff", fontSize: "0.85rem", fontWeight: 700 }}>
                Đơn hàng của tôi
              </Typography>
            </Box>

            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 2 }}>
              <Typography variant="h3" sx={{ color: "#fff", fontWeight: 950, fontSize: { xs: "1.8rem", md: "2.5rem" } }}>
                Đơn hàng của tôi
              </Typography>
              <Button
                variant="contained"
                startIcon={<RefreshCw size={16} />}
                onClick={loadOrders}
                sx={{
                  bgcolor: T.lime,
                  color: T.navy,
                  fontWeight: 900,
                  px: 3,
                  py: 1,
                  borderRadius: 99,
                  textTransform: "none",
                  boxShadow: "0 4px 14px rgba(132,204,22,0.3)",
                  "&:hover": {
                    bgcolor: T.lime,
                    boxShadow: "0 6px 20px rgba(132,204,22,0.45)",
                    transform: "translateY(-1px)",
                  },
                  transition: "all 200ms ease",
                }}
              >
                Làm mới
              </Button>
            </Box>
          </Container>
        </Box>

        {/* ══════════ MAIN WORKSPACE CONTENT ══════════ */}
        <Container maxWidth="lg">
          {/* Status Tabs Filter card */}
          <Paper
            elevation={0}
            sx={{
              border: `1px solid ${T.border}`,
              borderRadius: 4,
              mb: 4,
              boxShadow: T.shadow,
              overflow: "hidden",
            }}
          >
            <Tabs
              value={activeTab}
              onChange={(_, v) => {
                setActiveTab(v);
                setSelectedOrder(null);
              }}
              variant="scrollable"
              scrollButtons="auto"
              sx={{
                px: 2,
                py: 1,
                bgcolor: "#fff",
                "& .MuiTab-root": {
                  textTransform: "none",
                  fontWeight: 800,
                  fontSize: "0.9rem",
                  color: T.textSub,
                  py: 1.5,
                  px: { xs: 2, md: 3 },
                  borderRadius: 2,
                  mr: 1,
                  "&:hover": {
                    color: T.teal,
                    bgcolor: "rgba(15,118,110,0.04)",
                  },
                  transition: "all 180ms ease",
                },
                "& .Mui-selected": {
                  color: `${T.teal} !important`,
                  bgcolor: "rgba(15,118,110,0.06)",
                },
                "& .MuiTabs-indicator": {
                  bgcolor: T.teal,
                  height: 3,
                  borderRadius: "3px 3px 0 0",
                },
              }}
            >
              {TABS.map((tab) => (
                <Tab
                  key={tab.value}
                  value={tab.value}
                  label={
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      {tab.label}
                      <Box
                        component="span"
                        sx={{
                          fontSize: "0.72rem",
                          fontWeight: 900,
                          bgcolor: activeTab === tab.value ? T.teal : "#E2E8F0",
                          color: activeTab === tab.value ? "#fff" : T.textSub,
                          px: 0.9,
                          py: 0.25,
                          borderRadius: 99,
                          transition: "all 180ms ease",
                        }}
                      >
                        {statusCount(tab.value)}
                      </Box>
                    </Box>
                  }
                />
              ))}
            </Tabs>
          </Paper>

          {/* Expanded Order Detail View (Anchor on top of matching card) */}
          {selectedOrder && (
            <OrderDetail
              order={selectedOrder}
              onClose={() => setSelectedOrder(null)}
            />
          )}

          {/* Filtered Orders List */}
          {filteredOrders.length === 0 ? (
            <Paper
              elevation={0}
              sx={{
                border: `1.5px dashed ${T.border}`,
                borderRadius: 4,
                p: { xs: 5, md: 8 },
                textAlign: "center",
                bgcolor: T.bgCard,
                boxShadow: T.shadow,
              }}
            >
              <Box
                sx={{
                  width: 90,
                  height: 90,
                  borderRadius: "50%",
                  bgcolor: "rgba(15,118,110,0.05)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  mx: "auto",
                  mb: 3,
                }}
              >
                <ShoppingBag size={38} color={T.textMuted} />
              </Box>
              <Typography variant="h5" sx={{ color: T.navy, fontWeight: 900, mb: 1.5 }}>
                Không tìm thấy đơn hàng
              </Typography>
              <Typography variant="body2" sx={{ color: T.textSub, maxWidth: 360, mx: "auto", mb: 3.5, lineHeight: 1.6 }}>
                Bạn chưa có đơn hàng nào ở trạng thái này hoặc chưa thực hiện giao dịch nào.
              </Typography>
              <Button
                variant="contained"
                onClick={() => navigate("/products")}
                sx={{
                  bgcolor: T.teal,
                  color: "white",
                  fontWeight: 800,
                  px: 4,
                  py: 1.2,
                  borderRadius: 99,
                  textTransform: "none",
                  boxShadow: "0 6px 16px rgba(15,118,110,0.2)",
                  "&:hover": { bgcolor: T.navy },
                  transition: "all 200ms ease",
                }}
              >
                Mua sắm ngay
              </Button>
            </Paper>
          ) : (
            <Box>
              {filteredOrders.map((order) => (
                <OrderCard
                  key={order._id}
                  order={order}
                  onViewDetail={(o) => {
                    setSelectedOrder(o);
                    // scroll to top of details area smoothly
                    window.scrollTo({ top: 320, behavior: "smooth" });
                  }}
                  isSelected={selectedOrder?._id === order._id}
                />
              ))}
            </Box>
          )}
        </Container>
      </Box>
    </MainLayout>
  );
};

export default Orders;

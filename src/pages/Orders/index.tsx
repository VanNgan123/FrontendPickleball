import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Container,
  Typography,
  Button,
  Paper,
  Chip,
  CircularProgress,
  Divider,
  Tab,
  Tabs,
} from "@mui/material";
import {
  Package,
  ChevronRight,
  ShoppingBag,
  MapPin,
  Clock,
  CheckCircle2,
  Truck,
  XCircle,
  RefreshCw,
} from "lucide-react";
import { useSelector } from "react-redux";
import type { RootState } from "../../store/store";
import orderService from "../../services/orderService";
import type { Order } from "../../services/orderService";
import MainLayout from "../../layout/MainLayout/MainLayout";
import toast from "react-hot-toast";
import { OrderCardSkeleton } from "../../components/Skeletons";


const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";

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

// Status config
const STATUS_CONFIG: Record<
  string,
  { label: string; color: string; bg: string; border: string; icon: React.ReactNode }
> = {
  Pending: {
    label: "Cho xac nhan",
    color: "#f59e0b",
    bg: "rgba(245,158,11,0.08)",
    border: "rgba(245,158,11,0.3)",
    icon: <Clock size={14} />,
  },
  Confirmed: {
    label: "Da xac nhan",
    color: "#3b82f6",
    bg: "rgba(59,130,246,0.08)",
    border: "rgba(59,130,246,0.3)",
    icon: <CheckCircle2 size={14} />,
  },
  Shipping: {
    label: "Dang giao hang",
    color: "#8b5cf6",
    bg: "rgba(139,92,246,0.08)",
    border: "rgba(139,92,246,0.3)",
    icon: <Truck size={14} />,
  },
  Completed: {
    label: "Hoan thanh",
    color: "#22c55e",
    bg: "rgba(34,197,94,0.08)",
    border: "rgba(34,197,94,0.3)",
    icon: <CheckCircle2 size={14} />,
  },
  Cancelled: {
    label: "Da huy",
    color: "#ef4444",
    bg: "rgba(239,68,68,0.08)",
    border: "rgba(239,68,68,0.3)",
    icon: <XCircle size={14} />,
  },
};

const PAYMENT_LABEL: Record<string, string> = {
  COD: "COD",
  VNPay: "VNPay",
  Momo: "MoMo",
  BankTransfer: "Chuyen khoan",
};

const TABS = [
  { value: "all", label: "Tat ca" },
  { value: "Pending", label: "Cho xac nhan" },
  { value: "Confirmed", label: "Da xac nhan" },
  { value: "Shipping", label: "Dang giao" },
  { value: "Completed", label: "Hoan thanh" },
  { value: "Cancelled", label: "Da huy" },
];

// =============================================
// Order Card
// =============================================
const OrderCard = ({
  order,
  onViewDetail,
}: {
  order: Order;
  onViewDetail: (order: Order) => void;
}) => {
  const status = STATUS_CONFIG[order.status] || STATUS_CONFIG.Pending;

  return (
    <Paper
      elevation={0}
      sx={{
        border: "1px solid #eee",
        borderRadius: 2,
        overflow: "hidden",
        mb: 2,
        bgcolor: "#fff",
        transition: "all 0.2s ease",
        "&:hover": { boxShadow: "0 4px 20px rgba(0,0,0,0.08)", borderColor: "#ddd" },
      }}
    >
      <Box
        sx={{
          px: 3,
          py: 1.5,
          bgcolor: "#fafafa",
          borderBottom: "1px solid #f0f0f0",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 1,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.8 }}>
            <Package size={14} color="#64748b" />
            <Typography variant="caption" sx={{ color: "#64748b" }}>
              Ma don:
            </Typography>
            <Typography
              variant="caption"
              sx={{ fontWeight: 800, color: "#1a1a2e", fontFamily: "monospace" }}
            >
              #{order._id.slice(-8).toUpperCase()}
            </Typography>
          </Box>
          <Typography variant="caption" sx={{ color: "#94a3b8" }}>
            |
          </Typography>
          <Typography variant="caption" sx={{ color: "#64748b" }}>
            {formatDate(order.createdAt)}
          </Typography>
        </Box>

        <Chip
          icon={<Box sx={{ display: "flex", color: status.color }}>{status.icon}</Box>}
          label={status.label}
          size="small"
          sx={{
            bgcolor: status.bg,
            color: status.color,
            fontWeight: 700,
            fontSize: "0.72rem",
            border: `1px solid ${status.border}`,
            "& .MuiChip-icon": { ml: 1 },
          }}
        />
      </Box>

      <Box sx={{ px: 3, py: 2 }}>
        {order.items.slice(0, 2).map((item, idx) => {
          const p = item.productId;
          return (
            <Box
              key={idx}
              sx={{
                display: "flex",
                gap: 2,
                mb: 1.5,
                "&:last-child": { mb: 0 },
              }}
            >
              <Box
                component="img"
                src={getImageUrl(p.image?.[0])}
                alt={p.name}
                sx={{
                  width: 56,
                  height: 56,
                  objectFit: "contain",
                  border: "1px solid #eee",
                  borderRadius: 1.5,
                  bgcolor: "#fafafa",
                  p: 0.5,
                  flexShrink: 0,
                }}
              />
              <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                <Typography
                  variant="body2"
                  sx={{
                    fontWeight: 600,
                    color: "#1a1a2e",
                    fontSize: "0.85rem",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    display: "-webkit-box",
                    WebkitLineClamp: 1,
                    WebkitBoxOrient: "vertical",
                  }}
                >
                  {p.name}
                </Typography>
                <Typography variant="caption" sx={{ color: "#64748b" }}>
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

        {order.items.length > 2 && (
          <Typography variant="caption" sx={{ color: "#64748b", fontStyle: "italic" }}>
            +{order.items.length - 2} san pham khac...
          </Typography>
        )}
      </Box>

      <Divider />

      <Box
        sx={{
          px: 3,
          py: 1.5,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 1,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
            <MapPin size={13} color="#94a3b8" />
            <Typography variant="caption" sx={{ color: "#64748b", fontSize: "0.78rem" }}>
              {order.shippingAddress?.city || "-"}
            </Typography>
          </Box>

          <Chip
            label={PAYMENT_LABEL[order.paymentMethod] || order.paymentMethod}
            size="small"
            sx={{ height: 20, fontSize: "0.68rem", bgcolor: "#f8fafc", color: "#64748b" }}
          />
        </Box>

        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <Box sx={{ textAlign: "right" }}>
            <Typography variant="caption" sx={{ color: "#888" }}>
              {order.items.reduce((s, i) => s + i.qty, 0)} san pham · Tong cong
            </Typography>
            <Typography variant="body2" sx={{ fontWeight: 900, color: "#E60023" }}>
              {formatPrice(order.total)}
            </Typography>
          </Box>

          <Button
            size="small"
            endIcon={<ChevronRight size={14} />}
            onClick={() => onViewDetail(order)}
            sx={{
              color: "#08222f",
              fontWeight: 700,
              fontSize: "0.8rem",
              border: "1px solid #08222f",
              borderRadius: 1.5,
              px: 1.5,
              "&:hover": { bgcolor: "#08222f", color: "white" },
            }}
          >
            Chi tiet
          </Button>
        </Box>
      </Box>
    </Paper>
  );
};

// =============================================
// Order Detail (inline expand)
// =============================================
const OrderDetail = ({ order, onClose }: { order: Order; onClose: () => void }) => {
  const status = STATUS_CONFIG[order.status] || STATUS_CONFIG.Pending;
  const addr = order.shippingAddress;

  return (
    <Paper
      elevation={0}
      sx={{
        border: `2px solid ${status.color}`,
        borderRadius: 2,
        overflow: "hidden",
        mb: 2,
        bgcolor: "#fff",
        animation: "slideDown 0.25s ease",
        "@keyframes slideDown": {
          from: { opacity: 0, transform: "translateY(-8px)" },
          to: { opacity: 1, transform: "translateY(0)" },
        },
      }}
    >
      <Box
        sx={{
          px: 3,
          py: 2,
          background: `linear-gradient(135deg, #fafafa 0%, ${status.bg} 100%)`,
          borderBottom: "1px solid #f0f0f0",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Box>
          <Typography variant="subtitle2" sx={{ fontWeight: 800, color: "#1a1a2e" }}>
            CHI TIET DON HANG #{order._id.slice(-8).toUpperCase()}
          </Typography>
          <Typography variant="caption" sx={{ color: "#64748b" }}>
            {formatDate(order.createdAt)}
          </Typography>
        </Box>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Chip
            label={status.label}
            size="small"
            sx={{ bgcolor: status.bg, color: status.color, fontWeight: 700, border: `1px solid ${status.border}` }}
          />
          <Button size="small" onClick={onClose} sx={{ color: "#64748b", minWidth: 0, p: 0.5 }}>
            x
          </Button>
        </Box>
      </Box>

      <Box sx={{ p: 3 }}>
        <Typography
          variant="caption"
          sx={{ fontWeight: 700, color: "#888", textTransform: "uppercase", mb: 1.5, display: "block" }}
        >
          San pham
        </Typography>
        {order.items.map((item, idx) => {
          const p = item.productId;
          return (
            <Box
              key={idx}
              sx={{
                display: "flex",
                gap: 2,
                mb: 2,
                pb: 2,
                borderBottom: idx < order.items.length - 1 ? "1px solid #f5f5f5" : "none",
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
                  <Typography sx={{ fontSize: "0.62rem", fontWeight: 700 }}>{item.qty}</Typography>
                </Box>
              </Box>
              <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                <Typography
                  variant="body2"
                  sx={{
                    fontWeight: 600,
                    color: "#1a1a2e",
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
                <Typography variant="caption" sx={{ color: "#64748b" }}>
                  Don gia: {formatPrice(item.price)}
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

        <Divider sx={{ my: 2 }} />

        <Box sx={{ display: "flex", gap: 3, flexWrap: "wrap" }}>
          <Box sx={{ flex: 1, minWidth: 220 }}>
            <Typography
              variant="caption"
              sx={{ fontWeight: 700, color: "#888", textTransform: "uppercase", mb: 1, display: "block" }}
            >
              Dia chi giao hang
            </Typography>
            <Box sx={{ p: 2, bgcolor: "#fafafa", borderRadius: 1.5, border: "1px solid #f0f0f0" }}>
              <Typography variant="body2" sx={{ fontWeight: 700, color: "#1a1a2e", mb: 0.3 }}>
                {addr.fullName}
              </Typography>
              <Typography variant="body2" sx={{ color: "#64748b", mb: 0.3 }}>{addr.phone}</Typography>
              <Typography variant="body2" sx={{ color: "#64748b" }}>
                {addr.address}, {addr.ward}, {addr.district}, {addr.city}
              </Typography>
            </Box>
          </Box>

          <Box sx={{ flex: 1, minWidth: 180 }}>
            <Typography
              variant="caption"
              sx={{ fontWeight: 700, color: "#888", textTransform: "uppercase", mb: 1, display: "block" }}
            >
              Thanh toan
            </Typography>
            <Box sx={{ p: 2, bgcolor: "#fafafa", borderRadius: 1.5, border: "1px solid #f0f0f0" }}>
              <Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.8 }}>
                <Typography variant="caption" sx={{ color: "#888" }}>Phuong thuc</Typography>
                <Typography variant="caption" sx={{ fontWeight: 700, color: "#1a1a2e" }}>
                  {PAYMENT_LABEL[order.paymentMethod] || order.paymentMethod}
                </Typography>
              </Box>
              <Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.8 }}>
                <Typography variant="caption" sx={{ color: "#888" }}>So luong</Typography>
                <Typography variant="caption" sx={{ fontWeight: 700, color: "#1a1a1a" }}>
                  {order.items.reduce((s, i) => s + i.qty, 0)} san pham
                </Typography>
              </Box>
              <Divider sx={{ my: 0.8 }} />
              <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                <Typography variant="caption" sx={{ fontWeight: 700, color: "#1a1a2e" }}>Tong cong</Typography>
                <Typography variant="body2" sx={{ fontWeight: 900, color: "#E60023" }}>
                  {formatPrice(order.total)}
                </Typography>
              </Box>
            </Box>
          </Box>
        </Box>
      </Box>
    </Paper>
  );
};

// =============================================
// Main Orders Page
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
      toast.error("Khong the tai don hang");
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
        <Container maxWidth="lg" sx={{ py: 4, pb: 8 }}>
          <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 3 }}>
            <Typography variant="h5" sx={{ fontWeight: 900, color: "#1a1a2e" }}>
              Don hang cua toi
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
      <Container maxWidth="lg" sx={{ py: 4, pb: 8 }}>
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 3 }}>
          <Typography variant="h5" sx={{ fontWeight: 900, color: "#1a1a1a" }}>
            Don hang cua toi
          </Typography>
          <Button
            variant="outlined"
            startIcon={<RefreshCw size={16} />}
            onClick={loadOrders}
            sx={{ borderColor: "#08222f", color: "#08222f", fontWeight: 700 }}
          >
            Lam moi
          </Button>
        </Box>

        <Paper elevation={0} sx={{ border: "1px solid #eee", borderRadius: 2, mb: 3 }}>
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
              "& .MuiTab-root": { textTransform: "none", fontWeight: 700 },
              "& .Mui-selected": { color: "#08222f" },
              "& .MuiTabs-indicator": { bgcolor: "#08222f" },
            }}
          >
            {TABS.map((tab) => (
              <Tab
                key={tab.value}
                value={tab.value}
                label={`${tab.label} (${statusCount(tab.value)})`}
              />
            ))}
          </Tabs>
        </Paper>

        {filteredOrders.length === 0 ? (
          <Paper
            elevation={0}
            sx={{
              border: "1px dashed #eee",
              borderRadius: 2,
              p: 5,
              textAlign: "center",
              bgcolor: "#fafafa",
            }}
          >
            <ShoppingBag size={42} color="#ccc" style={{ marginBottom: 12 }} />
            <Typography variant="h6" sx={{ color: "#64748b", fontWeight: 700, mb: 1 }}>
              Khong co don hang
            </Typography>
            <Typography variant="body2" sx={{ color: "#94a3b8" }}>
              Ban chua co don hang nao o trang thai nay
            </Typography>
          </Paper>
        ) : (
          <Box>
            {filteredOrders.map((order) => (
              <Box key={order._id}>
                <OrderCard
                  order={order}
                  onViewDetail={(o) => setSelectedOrder(o)}
                />
                {selectedOrder?._id === order._id && (
                  <OrderDetail order={order} onClose={() => setSelectedOrder(null)} />
                )}
              </Box>
            ))}
          </Box>
        )}
      </Container>
    </MainLayout>
  );
};

export default Orders;

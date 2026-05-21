import { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Button,
  Paper,
  TextField,
  InputAdornment,
  IconButton,
  Chip,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tooltip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Avatar,
} from "@mui/material";
import {
  Search,
  Eye,
  X,
  ShoppingCart,
  Clock,
  CheckCircle2,
  Truck,
  XCircle,
  RefreshCw,
  MapPin,
  Phone,
  User,
} from "lucide-react";
import AdminLayout from "../../layout/AdminLayout/AdminLayout";
import axiosPickleball from "../../api/axiosPickleball";
import toast from "react-hot-toast";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";

const getImageUrl = (img?: string) => {
  if (!img) return undefined;
  if (img.startsWith("http")) return img;
  return `${API_URL}${img.startsWith("/") ? "" : "/"}${img}`;
};

const formatPrice = (v: number) => v.toLocaleString("vi-VN") + "đ";
const formatDate = (d: string) =>
  new Date(d).toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string; icon: React.ReactNode }> = {
  Pending: { label: "Chờ xác nhận", color: "#f59e0b", bg: "rgba(245,158,11,0.1)", icon: <Clock size={13} /> },
  Confirmed: { label: "Đã xác nhận", color: "#3b82f6", bg: "rgba(59,130,246,0.1)", icon: <CheckCircle2 size={13} /> },
  Shipping: { label: "Đang giao", color: "#8b5cf6", bg: "rgba(139,92,246,0.1)", icon: <Truck size={13} /> },
  Completed: { label: "Hoàn thành", color: "#22c55e", bg: "rgba(34,197,94,0.1)", icon: <CheckCircle2 size={13} /> },
  Cancelled: { label: "Đã hủy", color: "#ef4444", bg: "rgba(239,68,68,0.1)", icon: <XCircle size={13} /> },
};

const STATUS_ORDER = ["Pending", "Confirmed", "Shipping", "Completed", "Cancelled"];

const PAYMENT_LABEL: Record<string, string> = {
  COD: "COD",
  VNPay: "VNPay",
  Momo: "MoMo",
  BankTransfer: "Chuyển khoản",
};

interface Order {
  _id: string;
  userId?: { _id: string; name: string; email: string };
  items: { productId: any; qty: number; price: number }[];
  shippingAddress: { fullName: string; phone: string; address: string; city: string; district: string; ward: string };
  paymentMethod: string;
  total: number;
  status: string;
  createdAt: string;
}

// =============================================
// Order Detail Dialog
// =============================================
const OrderDetailDialog = ({
  open,
  onClose,
  order,
  onStatusChange,
}: {
  open: boolean;
  onClose: () => void;
  order: Order | null;
  onStatusChange: (orderId: string, status: string) => Promise<void>;
}) => {
  const [updating, setUpdating] = useState(false);
  const [newStatus, setNewStatus] = useState("");

  useEffect(() => {
    if (order) setNewStatus(order.status);
  }, [order]);

  if (!order) return null;
  const status = STATUS_CONFIG[order.status] || STATUS_CONFIG.Pending;
  const addr = order.shippingAddress;

  const handleUpdate = async () => {
    if (newStatus === order.status) return;
    try {
      setUpdating(true);
      await onStatusChange(order._id, newStatus);
      onClose();
    } finally {
      setUpdating(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth PaperProps={{ sx: { borderRadius: 2 } }}>
      <DialogTitle
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          borderBottom: "1px solid #f0f0f0",
          pb: 2,
        }}
      >
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 800, color: "#1a1a1a" }}>
            Chi tiết đơn hàng
          </Typography>
          <Typography variant="caption" sx={{ color: "#888", fontFamily: "monospace" }}>
            #{order._id.slice(-10).toUpperCase()}
          </Typography>
        </Box>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Chip
            label={status.label}
            size="small"
            sx={{ bgcolor: status.bg, color: status.color, fontWeight: 700, border: `1px solid ${status.color}40` }}
          />
          <IconButton size="small" onClick={onClose}>
            <X size={20} />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent sx={{ p: 3 }}>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
          <Box sx={{ display: "flex", gap: 2.5, flexWrap: "wrap" }}>
            <Box sx={{ flex: 1, minWidth: 200 }}>
              <Typography variant="caption" sx={{ fontWeight: 700, color: "#888", textTransform: "uppercase", mb: 1, display: "block" }}>
                Khách hàng
              </Typography>
              <Paper elevation={0} sx={{ p: 2, bgcolor: "#fafafa", border: "1px solid #f0f0f0", borderRadius: 1.5 }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 0.5 }}>
                  <User size={14} color="#888" />
                  <Typography variant="body2" sx={{ fontWeight: 700, color: "#1a1a1a" }}>
                    {order.userId?.name || addr.fullName}
                  </Typography>
                </Box>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <Phone size={14} color="#888" />
                  <Typography variant="body2" sx={{ color: "#555" }}>{addr.phone}</Typography>
                </Box>
                {order.userId?.email && (
                  <Typography variant="caption" sx={{ color: "#888", mt: 0.3, display: "block" }}>
                    {order.userId.email}
                  </Typography>
                )}
              </Paper>
            </Box>

            <Box sx={{ flex: 1, minWidth: 200 }}>
              <Typography variant="caption" sx={{ fontWeight: 700, color: "#888", textTransform: "uppercase", mb: 1, display: "block" }}>
                Địa chỉ giao hàng
              </Typography>
              <Paper elevation={0} sx={{ p: 2, bgcolor: "#fafafa", border: "1px solid #f0f0f0", borderRadius: 1.5 }}>
                <Box sx={{ display: "flex", gap: 1 }}>
                  <MapPin size={14} color="#888" style={{ marginTop: 2, flexShrink: 0 }} />
                  <Typography variant="body2" sx={{ color: "#555", lineHeight: 1.6 }}>
                    {addr.address}, {addr.ward}, {addr.district}, {addr.city}
                  </Typography>
                </Box>
              </Paper>
            </Box>

            <Box sx={{ minWidth: 160 }}>
              <Typography variant="caption" sx={{ fontWeight: 700, color: "#888", textTransform: "uppercase", mb: 1, display: "block" }}>
                Thanh toán
              </Typography>
              <Paper elevation={0} sx={{ p: 2, bgcolor: "#fafafa", border: "1px solid #f0f0f0", borderRadius: 1.5 }}>
                <Typography variant="body2" sx={{ fontWeight: 700, color: "#1a1a1a", mb: 0.5 }}>
                  {PAYMENT_LABEL[order.paymentMethod] || order.paymentMethod}
                </Typography>
                <Typography variant="caption" sx={{ color: "#888" }}>
                  {formatDate(order.createdAt)}
                </Typography>
              </Paper>
            </Box>
          </Box>

          <Box>
            <Typography variant="caption" sx={{ fontWeight: 700, color: "#888", textTransform: "uppercase", mb: 1.5, display: "block" }}>
              Sản phẩm ({order.items.length})
            </Typography>
            <Box sx={{ border: "1px solid #f0f0f0", borderRadius: 1.5, overflow: "hidden" }}>
              {order.items.map((item, idx) => {
                const p = item.productId;
                return (
                  <Box
                    key={idx}
                    sx={{
                      display: "flex",
                      gap: 2,
                      p: 2,
                      alignItems: "center",
                      borderBottom: idx < order.items.length - 1 ? "1px solid #f5f5f5" : "none",
                    }}
                  >
                    <Avatar src={getImageUrl(p?.image?.[0])} variant="rounded" sx={{ width: 52, height: 52, bgcolor: "#f5f5f5", flexShrink: 0 }} />
                    <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                      <Typography variant="body2" sx={{ fontWeight: 600, color: "#1a1a1a", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {p?.name || "Sản phẩm"}
                      </Typography>
                      <Typography variant="caption" sx={{ color: "#888" }}>
                        {formatPrice(item.price)} × {item.qty}
                      </Typography>
                    </Box>
                    <Typography variant="body2" sx={{ fontWeight: 700, color: "#E60023", flexShrink: 0 }}>
                      {formatPrice(item.price * item.qty)}
                    </Typography>
                  </Box>
                );
              })}
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  px: 2,
                  py: 1.5,
                  bgcolor: "#fafafa",
                  borderTop: "2px solid #f0f0f0",
                }}
              >
                <Typography variant="body2" sx={{ fontWeight: 700, color: "#1a1a1a" }}>
                  Tổng cộng
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: 900, color: "#E60023" }}>
                  {formatPrice(order.total)}
                </Typography>
              </Box>
            </Box>
          </Box>

          <Box>
            <Typography variant="caption" sx={{ fontWeight: 700, color: "#888", textTransform: "uppercase", mb: 1.5, display: "block" }}>
              Cập nhật trạng thái đơn hàng
            </Typography>
            <Box sx={{ display: "flex", gap: 2, alignItems: "center", flexWrap: "wrap" }}>
              <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", flexGrow: 1 }}>
                {STATUS_ORDER.map((s) => {
                  const cfg = STATUS_CONFIG[s];
                  const isSelected = newStatus === s;
                  const isCurrent = order.status === s;
                  return (
                    <Box
                      key={s}
                      onClick={() => setNewStatus(s)}
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 0.8,
                        px: 1.5,
                        py: 0.8,
                        borderRadius: 1.5,
                        border: `1.5px solid ${isSelected ? cfg.color : "#e0e0e0"}`,
                        bgcolor: isSelected ? cfg.bg : "#fff",
                        cursor: "pointer",
                        transition: "all 0.15s ease",
                        "&:hover": { borderColor: cfg.color, bgcolor: cfg.bg },
                      }}
                    >
                      <Box sx={{ color: cfg.color }}>{cfg.icon}</Box>
                      <Typography
                        variant="caption"
                        sx={{ fontWeight: isSelected ? 700 : 500, color: isSelected ? cfg.color : "#555", whiteSpace: "nowrap" }}
                      >
                        {cfg.label}
                      </Typography>
                      {isCurrent && <Box sx={{ width: 6, height: 6, borderRadius: "50%", bgcolor: cfg.color, ml: 0.3 }} />}
                    </Box>
                  );
                })}
              </Box>
            </Box>
          </Box>
        </Box>
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2, borderTop: "1px solid #f0f0f0", gap: 1 }}>
        <Button onClick={onClose} sx={{ color: "#888", fontWeight: 600 }}>Đóng</Button>
        <Button
          variant="contained"
          onClick={handleUpdate}
          disabled={updating || newStatus === order.status}
          sx={{ bgcolor: "#E60023", "&:hover": { bgcolor: "#c4001d" }, fontWeight: 700, px: 3, borderRadius: 1.5 }}
        >
          {updating ? <CircularProgress size={20} sx={{ color: "#fff" }} /> : "Cập nhật trạng thái"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

// =============================================
// Main Admin Orders Page
// =============================================
const AdminOrders = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [detailOpen, setDetailOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      setLoading(true);
      const res = await axiosPickleball.get("/api/orders") as any;
      setOrders(res?.data || []);
    } catch {
      toast.error("Không thể tải đơn hàng");
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (orderId: string, status: string) => {
    try {
      await axiosPickleball.put(`/api/orders/${orderId}`, { status });
      toast.success("Cập nhật trạng thái thành công!");
      loadOrders();
    } catch {
      toast.error("Cập nhật thất bại");
    }
  };

  const filtered = orders.filter((o) => {
    const matchStatus = filterStatus === "all" || o.status === filterStatus;
    const matchSearch =
      o._id.toLowerCase().includes(search.toLowerCase()) ||
      o.shippingAddress?.fullName?.toLowerCase().includes(search.toLowerCase()) ||
      o.userId?.name?.toLowerCase().includes(search.toLowerCase()) ||
      o.shippingAddress?.phone?.includes(search);
    return matchStatus && matchSearch;
  });

  const paginated = filtered.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  const statCounts = STATUS_ORDER.reduce((acc, s) => {
    acc[s] = orders.filter((o) => o.status === s).length;
    return acc;
  }, {} as Record<string, number>);

  const thSx = {
    fontWeight: 800,
    fontSize: "0.78rem",
    color: "#1a1a1a",
    bgcolor: "#fafafa",
    borderBottom: "2px solid #f0f0f0",
    whiteSpace: "nowrap",
  };

  return (
    <AdminLayout title="Quản lý đơn hàng">
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 3 }}>
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 900, color: "#1a1a1a" }}>
            Đơn hàng ({orders.length})
          </Typography>
          <Typography variant="caption" sx={{ color: "#888" }}>
            Quản lý và cập nhật trạng thái đơn hàng
          </Typography>
        </Box>
        <Tooltip title="Làm mới">
          <span>
            <IconButton onClick={loadOrders} disabled={loading} sx={{ color: "#555" }}>
              <RefreshCw size={18} />
            </IconButton>
          </span>
        </Tooltip>
      </Box>

      <Box sx={{ display: "flex", gap: 1.5, mb: 3, flexWrap: "wrap" }}>
        {[{ key: "all", label: "Tất cả", count: orders.length }, ...STATUS_ORDER.map((s) => ({
          key: s,
          label: STATUS_CONFIG[s].label,
          count: statCounts[s],
          color: STATUS_CONFIG[s].color,
          bg: STATUS_CONFIG[s].bg,
        }))].map((item) => (
          <Box
            key={item.key}
            onClick={() => {
              setFilterStatus(item.key);
              setPage(0);
            }}
            sx={{
              px: 2,
              py: 1,
              borderRadius: 1.5,
              cursor: "pointer",
              border: "1.5px solid",
              borderColor: filterStatus === item.key ? ((item as any).color || "#E60023") : "#e0e0e0",
              bgcolor: filterStatus === item.key ? ((item as any).bg || "rgba(230,0,35,0.08)") : "#fff",
              transition: "all 0.15s ease",
              "&:hover": { borderColor: (item as any).color || "#E60023" },
            }}
          >
            <Typography
              variant="caption"
              sx={{ fontWeight: 700, color: filterStatus === item.key ? ((item as any).color || "#E60023") : "#555" }}
            >
              {item.label} ({item.count})
            </Typography>
          </Box>
        ))}
      </Box>

      <Paper elevation={0} sx={{ border: "1px solid #eee", borderRadius: 2, p: 2, mb: 2, bgcolor: "#fff" }}>
        <TextField
          size="small"
          placeholder="Tìm theo mã đơn, tên khách, số điện thoại..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(0);
          }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search size={16} color="#aaa" />
              </InputAdornment>
            ),
          }}
          sx={{
            width: 380,
            "& .MuiOutlinedInput-root": {
              borderRadius: 1.5,
              bgcolor: "#fafafa",
              "& fieldset": { borderColor: "#e0e0e0" },
              "&.Mui-focused fieldset": { borderColor: "#E60023" },
            },
          }}
        />
      </Paper>

      <Paper elevation={0} sx={{ border: "1px solid #eee", borderRadius: 2, overflow: "hidden", bgcolor: "#fff" }}>
        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
            <CircularProgress sx={{ color: "#E60023" }} />
          </Box>
        ) : (
          <>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell sx={thSx}>Mã đơn</TableCell>
                    <TableCell sx={thSx}>Khách hàng</TableCell>
                    <TableCell sx={thSx}>Sản phẩm</TableCell>
                    <TableCell sx={thSx}>Tổng tiền</TableCell>
                    <TableCell sx={thSx}>Thanh toán</TableCell>
                    <TableCell sx={thSx}>Trạng thái</TableCell>
                    <TableCell sx={thSx}>Ngày đặt</TableCell>
                    <TableCell sx={thSx} align="center">Chi tiết</TableCell>
                  </TableRow>
                </TableHead>

                <TableBody>
                  {paginated.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} align="center" sx={{ py: 6 }}>
                        <ShoppingCart size={40} color="#e0e0e0" />
                        <Typography variant="body2" sx={{ color: "#bbb", mt: 1 }}>
                          {search || filterStatus !== "all" ? "Không tìm thấy đơn hàng" : "Chưa có đơn hàng nào"}
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ) : (
                    paginated.map((order) => {
                      const status = STATUS_CONFIG[order.status] || STATUS_CONFIG.Pending;
                      return (
                        <TableRow key={order._id} sx={{ "&:hover": { bgcolor: "#fafafa" }, transition: "background 0.15s" }}>
                          <TableCell>
                            <Typography variant="caption" sx={{ fontWeight: 800, color: "#1a1a1a", fontFamily: "monospace" }}>
                              #{order._id.slice(-8).toUpperCase()}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2" sx={{ fontWeight: 600, color: "#1a1a1a", fontSize: "0.82rem" }}>
                              {order.userId?.name || order.shippingAddress?.fullName || "—"}
                            </Typography>
                            <Typography variant="caption" sx={{ color: "#888" }}>
                              {order.shippingAddress?.phone}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2" sx={{ color: "#555", fontSize: "0.82rem" }}>
                              {order.items.length} sản phẩm
                            </Typography>
                            <Typography variant="caption" sx={{ color: "#aaa" }}>
                              {order.items.reduce((s, i) => s + i.qty, 0)} items
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2" sx={{ fontWeight: 700, color: "#E60023" }}>
                              {formatPrice(order.total)}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={PAYMENT_LABEL[order.paymentMethod] || order.paymentMethod}
                              size="small"
                              sx={{ height: 20, fontSize: "0.68rem", bgcolor: "#f5f5f5", color: "#555" }}
                            />
                          </TableCell>
                          <TableCell>
                            <Chip
                              icon={<Box sx={{ display: "flex", color: status.color, ml: 0.5 }}>{status.icon}</Box>}
                              label={status.label}
                              size="small"
                              sx={{
                                bgcolor: status.bg,
                                color: status.color,
                                fontWeight: 700,
                                fontSize: "0.72rem",
                                border: `1px solid ${status.color}40`,
                                "& .MuiChip-icon": { ml: 0.8 },
                              }}
                            />
                          </TableCell>
                          <TableCell>
                            <Typography variant="caption" sx={{ color: "#888" }}>
                              {formatDate(order.createdAt)}
                            </Typography>
                          </TableCell>
                          <TableCell align="center">
                            <Tooltip title="Xem chi tiết & cập nhật">
                              <IconButton
                                size="small"
                                onClick={() => {
                                  setSelectedOrder(order);
                                  setDetailOpen(true);
                                }}
                                sx={{ color: "#3b82f6", "&:hover": { bgcolor: "rgba(59,130,246,0.08)" } }}
                              >
                                <Eye size={16} />
                              </IconButton>
                            </Tooltip>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </TableContainer>

            <TablePagination
              component="div"
              count={filtered.length}
              page={page}
              onPageChange={(_, p) => setPage(p)}
              rowsPerPage={rowsPerPage}
              onRowsPerPageChange={(e) => {
                setRowsPerPage(Number(e.target.value));
                setPage(0);
              }}
              rowsPerPageOptions={[5, 10, 25]}
              labelRowsPerPage="Hiển thị:"
              labelDisplayedRows={({ from, to, count }) => `${from}–${to} / ${count}`}
              sx={{ borderTop: "1px solid #f0f0f0" }}
            />
          </>
        )}
      </Paper>

      <OrderDetailDialog
        open={detailOpen}
        onClose={() => setDetailOpen(false)}
        order={selectedOrder}
        onStatusChange={handleStatusChange}
      />
    </AdminLayout>
  );
};

export default AdminOrders;

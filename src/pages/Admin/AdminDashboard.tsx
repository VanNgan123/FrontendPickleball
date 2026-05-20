import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  Paper,
  CircularProgress,
  Chip,
  Avatar,
} from "@mui/material";
import Grid from "@mui/material/Grid";
import {
  Package,
  ShoppingCart,
  Star,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  CheckCircle2,
  Truck,
  XCircle,
} from "lucide-react";
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import AdminLayout from "../../layout/AdminLayout/AdminLayout";
import axiosPickleball from "../../api/axiosPickleball";

const formatPrice = (price: number) => price.toLocaleString("vi-VN") + "đ";

// Màu biểu đồ
const CHART_COLORS = ["#E60023", "#3b82f6", "#22c55e", "#f59e0b", "#8b5cf6"];

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  Pending: { label: "Chờ xác nhận", color: "#f59e0b", icon: <Clock size={14} /> },
  Confirmed: { label: "Đã xác nhận", color: "#3b82f6", icon: <CheckCircle2 size={14} /> },
  Shipping: { label: "Đang giao", color: "#8b5cf6", icon: <Truck size={14} /> },
  Completed: { label: "Hoàn thành", color: "#22c55e", icon: <CheckCircle2 size={14} /> },
  Cancelled: { label: "Đã hủy", color: "#ef4444", icon: <XCircle size={14} /> },
};

// =============================================
// Stat Card
// =============================================
const StatCard = ({
  title,
  value,
  subtitle,
  icon,
  color,
  trend,
  trendValue,
}: {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ReactNode;
  color: string;
  trend?: "up" | "down";
  trendValue?: string;
}) => (
  <Paper
    elevation={0}
    sx={{
      p: 3,
      border: "1px solid #eee",
      borderRadius: 2,
      bgcolor: "#fff",
      transition: "all 0.2s ease",
      "&:hover": { boxShadow: "0 4px 20px rgba(0,0,0,0.08)", transform: "translateY(-2px)" },
    }}
  >
    <Box sx={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", mb: 2 }}>
      <Box
        sx={{
          width: 48,
          height: 48,
          borderRadius: 2,
          bgcolor: `${color}15`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Box sx={{ color }}>{icon}</Box>
      </Box>
      {trend && trendValue && (
        <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
          {trend === "up" ? (
            <ArrowUpRight size={16} color="#22c55e" />
          ) : (
            <ArrowDownRight size={16} color="#ef4444" />
          )}
          <Typography
            variant="caption"
            sx={{ color: trend === "up" ? "#22c55e" : "#ef4444", fontWeight: 700 }}
          >
            {trendValue}
          </Typography>
        </Box>
      )}
    </Box>
    <Typography variant="h4" sx={{ fontWeight: 900, color: "#1a1a1a", mb: 0.5, lineHeight: 1 }}>
      {value}
    </Typography>
    <Typography variant="body2" sx={{ fontWeight: 700, color: "#1a1a1a", mb: 0.3 }}>
      {title}
    </Typography>
    {subtitle && (
      <Typography variant="caption" sx={{ color: "#888" }}>
        {subtitle}
      </Typography>
    )}
  </Paper>
);

// =============================================
// Dashboard Page
// =============================================
const AdminDashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  const [stats, setStats] = useState({
    totalOrders: 0,
    totalRevenue: 0,
    totalProducts: 0,
    totalReviews: 0,
    pendingOrders: 0,
    completedOrders: 0,
    cancelledOrders: 0,
  });

  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [ordersByStatus, setOrdersByStatus] = useState<any[]>([]);
  const [revenueData, setRevenueData] = useState<any[]>([]);
  const [topProducts, setTopProducts] = useState<any[]>([]);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);

      const [ordersRes, productsRes, reviewsRes] = await Promise.all([
        axiosPickleball.get("/api/orders") as Promise<any>,
        axiosPickleball.get("/api/products") as Promise<any>,
        axiosPickleball.get("/api/reviews") as Promise<any>,
      ]);

      const orders: any[] = ordersRes?.data || [];
      const products: any[] = productsRes?.product || [];
      const reviews: any[] = reviewsRes?.data || [];

      const totalRevenue = orders
        .filter((o: any) => o.status === "Completed")
        .reduce((sum: number, o: any) => sum + (o.total || 0), 0);

      const pendingOrders = orders.filter((o: any) => o.status === "Pending").length;
      const completedOrders = orders.filter((o: any) => o.status === "Completed").length;
      const cancelledOrders = orders.filter((o: any) => o.status === "Cancelled").length;

      setStats({
        totalOrders: orders.length,
        totalRevenue,
        totalProducts: products.length,
        totalReviews: reviews.length,
        pendingOrders,
        completedOrders,
        cancelledOrders,
      });

      setRecentOrders(
        [...orders]
          .sort((a: any, b: any) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          )
          .slice(0, 5)
      );

      const statusCount: Record<string, number> = {};
      orders.forEach((o: any) => {
        statusCount[o.status] = (statusCount[o.status] || 0) + 1;
      });
      setOrdersByStatus(
        Object.entries(statusCount).map(([name, value]) => ({
          name: STATUS_CONFIG[name]?.label || name,
          value,
        }))
      );

      const monthlyRevenue: Record<string, number> = {};
      orders
        .filter((o: any) => o.status === "Completed")
        .forEach((o: any) => {
          const month = new Date(o.createdAt).toLocaleDateString("vi-VN", {
            month: "short",
            year: "2-digit",
          });
          monthlyRevenue[month] = (monthlyRevenue[month] || 0) + o.total;
        });

      const months = Object.entries(monthlyRevenue)
        .slice(-6)
        .map(([month, revenue]) => ({ month, revenue }));

      if (months.length === 0) {
        const mockMonths = ["T1", "T2", "T3", "T4", "T5", "T6"].map((m) => ({
          month: m,
          revenue: 0,
        }));
        setRevenueData(mockMonths);
      } else {
        setRevenueData(months);
      }

      setTopProducts(
        [...products]
          .sort((a: any, b: any) => a.stock - b.stock)
          .slice(0, 5)
      );
    } catch (err) {
      console.error("Dashboard load error:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <AdminLayout title="Dashboard">
        <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "60vh" }}>
          <CircularProgress sx={{ color: "#E60023" }} />
        </Box>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Dashboard">
      {/* Greeting */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 900, color: "#1a1a1a" }}>
          Xin chào! 👋
        </Typography>
        <Typography variant="body2" sx={{ color: "#888" }}>
          Đây là tổng quan hoạt động của cửa hàng hôm nay
        </Typography>
      </Box>

      {/* ===== STAT CARDS ===== */}
      <Grid container spacing={2.5} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <StatCard
            title="Tổng đơn hàng"
            value={stats.totalOrders}
            subtitle={`${stats.pendingOrders} đang chờ xử lý`}
            icon={<ShoppingCart size={24} />}
            color="#E60023"
            trend="up"
            trendValue="+12%"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <StatCard
            title="Doanh thu"
            value={stats.totalRevenue > 0 ? formatPrice(stats.totalRevenue) : "0đ"}
            subtitle="Từ đơn hoàn thành"
            icon={<TrendingUp size={24} />}
            color="#22c55e"
            trend="up"
            trendValue="+8%"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <StatCard
            title="Sản phẩm"
            value={stats.totalProducts}
            subtitle="Tổng sản phẩm trong kho"
            icon={<Package size={24} />}
            color="#3b82f6"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <StatCard
            title="Đánh giá"
            value={stats.totalReviews}
            subtitle="Tổng lượt đánh giá"
            icon={<Star size={24} />}
            color="#f59e0b"
          />
        </Grid>
      </Grid>

      {/* ===== CHARTS ROW ===== */}
      <Grid container spacing={2.5} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, lg: 8 }}>
          <Paper elevation={0} sx={{ border: "1px solid #eee", borderRadius: 2, p: 3, bgcolor: "#fff" }}>
            <Box sx={{ mb: 2.5 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 800, color: "#1a1a1a" }}>
                Doanh thu theo tháng
              </Typography>
              <Typography variant="caption" sx={{ color: "#888" }}>
                Từ các đơn hàng hoàn thành
              </Typography>
            </Box>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={revenueData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" tick={{ fontSize: 12, fill: "#888" }} axisLine={false} tickLine={false} />
                <YAxis
                  tick={{ fontSize: 11, fill: "#888" }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(v) =>
                    v >= 1000000 ? `${(v / 1000000).toFixed(0)}tr` : `${(v / 1000).toFixed(0)}k`
                  }
                />
                <Tooltip
                  formatter={(value: number) => [formatPrice(value), "Doanh thu"]}
                  contentStyle={{ borderRadius: 8, border: "1px solid #eee", fontSize: 12 }}
                />
                <Bar dataKey="revenue" fill="#E60023" radius={[6, 6, 0, 0]} maxBarSize={50} />
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        <Grid size={{ xs: 12, lg: 4 }}>
          <Paper elevation={0} sx={{ border: "1px solid #eee", borderRadius: 2, p: 3, bgcolor: "#fff", height: "100%" }}>
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 800, color: "#1a1a1a" }}>
                Trạng thái đơn hàng
              </Typography>
            </Box>
            {ordersByStatus.length > 0 ? (
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={ordersByStatus}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {ordersByStatus.map((_, index) => (
                      <Cell key={index} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ borderRadius: 8, border: "1px solid #eee", fontSize: 12 }} />
                  <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12 }} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", height: 200 }}>
                <Typography variant="body2" sx={{ color: "#bbb" }}>Chưa có dữ liệu</Typography>
              </Box>
            )}
          </Paper>
        </Grid>
      </Grid>

      {/* ===== BOTTOM ROW ===== */}
      <Grid container spacing={2.5}>
        <Grid size={{ xs: 12, lg: 7 }}>
          <Paper elevation={0} sx={{ border: "1px solid #eee", borderRadius: 2, overflow: "hidden", bgcolor: "#fff" }}>
            <Box
              sx={{
                px: 3,
                py: 2,
                bgcolor: "#fafafa",
                borderBottom: "1px solid #f0f0f0",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <Typography variant="subtitle2" sx={{ fontWeight: 800, color: "#1a1a1a" }}>
                ĐƠN HÀNG MỚI NHẤT
              </Typography>
              <Typography
                variant="caption"
                sx={{ color: "#E60023", cursor: "pointer", fontWeight: 700 }}
                onClick={() => navigate("/admin/orders")}
              >
                Xem tất cả →
              </Typography>
            </Box>

            {recentOrders.length === 0 ? (
              <Box sx={{ py: 5, textAlign: "center" }}>
                <Typography variant="body2" sx={{ color: "#bbb" }}>Chưa có đơn hàng</Typography>
              </Box>
            ) : (
              recentOrders.map((order, idx) => {
                const status = STATUS_CONFIG[order.status] || STATUS_CONFIG.Pending;
                return (
                  <Box
                    key={order._id}
                    sx={{
                      px: 3,
                      py: 1.8,
                      display: "flex",
                      alignItems: "center",
                      gap: 2,
                      borderBottom: idx < recentOrders.length - 1 ? "1px solid #f5f5f5" : "none",
                      cursor: "pointer",
                      "&:hover": { bgcolor: "#fafafa" },
                    }}
                    onClick={() => navigate("/admin/orders")}
                  >
                    <Box
                      sx={{
                        width: 36,
                        height: 36,
                        borderRadius: 1.5,
                        bgcolor: `${status.color}15`,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                      }}
                    >
                      <Box sx={{ color: status.color }}>{status.icon}</Box>
                    </Box>

                    <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                      <Typography variant="body2" sx={{ fontWeight: 700, color: "#1a1a1a" }}>
                        #{order._id.slice(-8).toUpperCase()}
                      </Typography>
                      <Typography variant="caption" sx={{ color: "#888" }}>
                        {order.userId?.name || "Khách hàng"} · {new Date(order.createdAt).toLocaleDateString("vi-VN")}
                      </Typography>
                    </Box>

                    <Box sx={{ textAlign: "right", flexShrink: 0 }}>
                      <Typography variant="body2" sx={{ fontWeight: 700, color: "#E60023" }}>
                        {formatPrice(order.total)}
                      </Typography>
                      <Chip
                        label={status.label}
                        size="small"
                        sx={{
                          height: 18,
                          fontSize: "0.65rem",
                          bgcolor: `${status.color}15`,
                          color: status.color,
                          fontWeight: 700,
                        }}
                      />
                    </Box>
                  </Box>
                );
              })
            )}
          </Paper>
        </Grid>

        <Grid size={{ xs: 12, lg: 5 }}>
          <Paper elevation={0} sx={{ border: "1px solid #eee", borderRadius: 2, overflow: "hidden", bgcolor: "#fff" }}>
            <Box
              sx={{
                px: 3,
                py: 2,
                bgcolor: "#fafafa",
                borderBottom: "1px solid #f0f0f0",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <Typography variant="subtitle2" sx={{ fontWeight: 800, color: "#1a1a1a" }}>
                TỒN KHO THẤP
              </Typography>
              <Typography
                variant="caption"
                sx={{ color: "#E60023", cursor: "pointer", fontWeight: 700 }}
                onClick={() => navigate("/admin/products")}
              >
                Quản lý →
              </Typography>
            </Box>

            {topProducts.length === 0 ? (
              <Box sx={{ py: 5, textAlign: "center" }}>
                <Typography variant="body2" sx={{ color: "#bbb" }}>Chưa có sản phẩm</Typography>
              </Box>
            ) : (
              topProducts.map((product, idx) => {
                const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";
                const imgSrc = product.image?.[0]
                  ? product.image[0].startsWith("http")
                    ? product.image[0]
                    : `${API_URL}${product.image[0].startsWith("/") ? "" : "/"}${product.image[0]}`
                  : undefined;

                return (
                  <Box
                    key={product._id}
                    sx={{
                      px: 3,
                      py: 1.8,
                      display: "flex",
                      alignItems: "center",
                      gap: 2,
                      borderBottom: idx < topProducts.length - 1 ? "1px solid #f5f5f5" : "none",
                      cursor: "pointer",
                      "&:hover": { bgcolor: "#fafafa" },
                    }}
                    onClick={() => navigate("/admin/products")}
                  >
                    <Avatar
                      src={imgSrc}
                      variant="rounded"
                      sx={{ width: 40, height: 40, bgcolor: "#f5f5f5", flexShrink: 0 }}
                    >
                      <Package size={18} color="#bbb" />
                    </Avatar>

                    <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                      <Typography
                        variant="body2"
                        sx={{
                          fontWeight: 600,
                          color: "#1a1a1a",
                          fontSize: "0.82rem",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {product.name}
                      </Typography>
                      <Typography variant="caption" sx={{ color: "#888" }}>
                        {(product.salePrice || product.price).toLocaleString("vi-VN")}đ
                      </Typography>
                    </Box>

                    <Chip
                      label={`${product.stock} còn`}
                      size="small"
                      sx={{
                        height: 20,
                        fontSize: "0.68rem",
                        fontWeight: 700,
                        bgcolor:
                          product.stock === 0
                            ? "rgba(239,68,68,0.1)"
                            : product.stock < 5
                            ? "rgba(245,158,11,0.1)"
                            : "rgba(34,197,94,0.1)",
                        color:
                          product.stock === 0
                            ? "#ef4444"
                            : product.stock < 5
                            ? "#f59e0b"
                            : "#22c55e",
                      }}
                    />
                  </Box>
                );
              })
            )}
          </Paper>
        </Grid>
      </Grid>
    </AdminLayout>
  );
};

export default AdminDashboard;

import { useState } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import {
  Box,
  Typography,
  Avatar,
  Divider,
  IconButton,
  Tooltip,
  Badge,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
} from "@mui/material";
import {
  LayoutDashboard,
  Package,
  Tag,
  ShoppingCart,
  Ticket,
  Star,
  LogOut,
  Menu,
  X,
  Bell,
  ExternalLink,
} from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import type { RootState, AppDispatch } from "../../store/store";
import { logout } from "../../store/slices/authSlice";
import toast from "react-hot-toast";

const SIDEBAR_WIDTH = 260;
const SIDEBAR_COLLAPSED_WIDTH = 70;

// Nav config
const NAV_ITEMS = [
  {
    key: "dashboard",
    label: "Dashboard",
    icon: <LayoutDashboard size={20} />,
    path: "/admin",
  },
  {
    key: "products",
    label: "Sản phẩm",
    icon: <Package size={20} />,
    path: "/admin/products",
  },
  {
    key: "categories",
    label: "Danh mục",
    icon: <Tag size={20} />,
    path: "/admin/categories",
  },
  {
    key: "orders",
    label: "Đơn hàng",
    icon: <ShoppingCart size={20} />,
    path: "/admin/orders",
  },
  {
    key: "coupons",
    label: "Coupon",
    icon: <Ticket size={20} />,
    path: "/admin/coupons",
  },
  {
    key: "reviews",
    label: "Đánh giá",
    icon: <Star size={20} />,
    path: "/admin/reviews",
  },
];

interface AdminLayoutProps {
  children: React.ReactNode;
  title?: string;
}

const AdminLayout = ({ children, title }: AdminLayoutProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch<AppDispatch>();

  const { user } = useSelector((state: RootState) => state.auth);
  const [collapsed, setCollapsed] = useState(false);

  const sidebarWidth = collapsed ? SIDEBAR_COLLAPSED_WIDTH : SIDEBAR_WIDTH;

  const handleLogout = () => {
    dispatch(logout());
    navigate("/login");
    toast.success("Đã đăng xuất");
  };

  const isActive = (path: string) => {
    if (path === "/admin") return location.pathname === "/admin";
    return location.pathname.startsWith(path);
  };

  return (
    <Box sx={{ display: "flex", minHeight: "100vh", bgcolor: "#f4f6f9" }}>
      {/* ===== SIDEBAR ===== */}
      <Box
        sx={{
          width: sidebarWidth,
          flexShrink: 0,
          bgcolor: "#0d1b2a",
          display: "flex",
          flexDirection: "column",
          position: "fixed",
          top: 0,
          left: 0,
          height: "100vh",
          zIndex: 100,
          transition: "width 0.25s ease",
          overflow: "hidden",
          boxShadow: "4px 0 20px rgba(0,0,0,0.15)",
        }}
      >
        {/* Logo */}
        <Box
          sx={{
            px: collapsed ? 1.5 : 3,
            py: 2.5,
            display: "flex",
            alignItems: "center",
            gap: 1.5,
            borderBottom: "1px solid rgba(255,255,255,0.08)",
            minHeight: 64,
          }}
        >
          <Box
            sx={{
              width: 36,
              height: 36,
              borderRadius: 1.5,
              bgcolor: "#E60023",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
              boxShadow: "0 4px 12px rgba(230,0,35,0.4)",
            }}
          >
            <Typography sx={{ color: "white", fontWeight: 900, fontSize: "1rem" }}>P</Typography>
          </Box>
          {!collapsed && (
            <Box>
              <Typography sx={{ color: "white", fontWeight: 800, fontSize: "0.95rem", lineHeight: 1.2 }}>
                Pickleball
              </Typography>
              <Typography sx={{ color: "rgba(255,255,255,0.4)", fontSize: "0.7rem", fontWeight: 600 }}>
                ADMIN PANEL
              </Typography>
            </Box>
          )}
          <Box sx={{ ml: "auto" }}>
            <IconButton
              size="small"
              onClick={() => setCollapsed(!collapsed)}
              sx={{ color: "rgba(255,255,255,0.5)", "&:hover": { color: "white" } }}
            >
              {collapsed ? <Menu size={18} /> : <X size={18} />}
            </IconButton>
          </Box>
        </Box>

        {/* Nav */}
        <Box
          sx={{
            flexGrow: 1,
            overflowY: "auto",
            py: 1.5,
            "&::-webkit-scrollbar": { width: 4 },
            "&::-webkit-scrollbar-thumb": { bgcolor: "rgba(255,255,255,0.1)", borderRadius: 2 },
          }}
        >
          {!collapsed && (
            <Typography
              sx={{
                px: 3,
                mb: 1,
                fontSize: "0.65rem",
                fontWeight: 700,
                color: "rgba(255,255,255,0.3)",
                textTransform: "uppercase",
                letterSpacing: 1.5,
              }}
            >
              Quản lý
            </Typography>
          )}

          <List dense disablePadding>
            {NAV_ITEMS.map((item) => {
              const active = isActive(item.path);
              return (
                <Tooltip key={item.key} title={collapsed ? item.label : ""} placement="right">
                  <ListItemButton
                    component={Link}
                    to={item.path}
                    sx={{
                      mx: 1,
                      mb: 0.5,
                      borderRadius: 1.5,
                      px: collapsed ? 1.5 : 2,
                      py: 1.2,
                      minHeight: 44,
                      bgcolor: active ? "rgba(230,0,35,0.15)" : "transparent",
                      borderLeft: active ? "3px solid #E60023" : "3px solid transparent",
                      "&:hover": {
                        bgcolor: active ? "rgba(230,0,35,0.2)" : "rgba(255,255,255,0.06)",
                      },
                      transition: "all 0.2s ease",
                    }}
                  >
                    <ListItemIcon
                      sx={{
                        minWidth: collapsed ? 0 : 36,
                        color: active ? "#E60023" : "rgba(255,255,255,0.5)",
                        mr: collapsed ? 0 : 0,
                      }}
                    >
                      {item.icon}
                    </ListItemIcon>
                    {!collapsed && (
                      <ListItemText
                        primary={item.label}
                        primaryTypographyProps={{
                          fontSize: "0.875rem",
                          fontWeight: active ? 700 : 500,
                          color: active ? "white" : "rgba(255,255,255,0.6)",
                        }}
                      />
                    )}
                  </ListItemButton>
                </Tooltip>
              );
            })}
          </List>

          <Divider sx={{ borderColor: "rgba(255,255,255,0.08)", my: 1.5, mx: 2 }} />

          {!collapsed && (
            <Typography
              sx={{
                px: 3,
                mb: 1,
                fontSize: "0.65rem",
                fontWeight: 700,
                color: "rgba(255,255,255,0.3)",
                textTransform: "uppercase",
                letterSpacing: 1.5,
              }}
            >
              Khác
            </Typography>
          )}

          <List dense disablePadding>
            <Tooltip title={collapsed ? "Xem trang shop" : ""} placement="right">
              <ListItemButton
                component={Link}
                to="/"
                target="_blank"
                sx={{
                  mx: 1,
                  mb: 0.5,
                  borderRadius: 1.5,
                  px: collapsed ? 1.5 : 2,
                  py: 1.2,
                  minHeight: 44,
                  borderLeft: "3px solid transparent",
                  "&:hover": { bgcolor: "rgba(255,255,255,0.06)" },
                }}
              >
                <ListItemIcon sx={{ minWidth: collapsed ? 0 : 36, color: "rgba(255,255,255,0.4)" }}>
                  <ExternalLink size={20} />
                </ListItemIcon>
                {!collapsed && (
                  <ListItemText
                    primary="Xem trang shop"
                    primaryTypographyProps={{
                      fontSize: "0.875rem",
                      fontWeight: 500,
                      color: "rgba(255,255,255,0.5)",
                    }}
                  />
                )}
              </ListItemButton>
            </Tooltip>
          </List>
        </Box>

        {/* User info + logout */}
        <Box sx={{ borderTop: "1px solid rgba(255,255,255,0.08)", p: collapsed ? 1.5 : 2 }}>
          {collapsed ? (
            <Tooltip title="Đăng xuất" placement="right">
              <IconButton
                onClick={handleLogout}
                sx={{ color: "rgba(255,255,255,0.5)", "&:hover": { color: "#E60023" } }}
              >
                <LogOut size={20} />
              </IconButton>
            </Tooltip>
          ) : (
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
              <Avatar
                sx={{ width: 36, height: 36, bgcolor: "#E60023", fontSize: "0.9rem", fontWeight: 700 }}
              >
                {user?.name?.charAt(0).toUpperCase() || "A"}
              </Avatar>
              <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                <Typography
                  sx={{
                    color: "white",
                    fontWeight: 700,
                    fontSize: "0.82rem",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {user?.name || "Admin"}
                </Typography>
                <Typography sx={{ color: "rgba(255,255,255,0.4)", fontSize: "0.68rem" }}>
                  {user?.role || "admin"}
                </Typography>
              </Box>
              <Tooltip title="Đăng xuất">
                <IconButton
                  size="small"
                  onClick={handleLogout}
                  sx={{ color: "rgba(255,255,255,0.4)", "&:hover": { color: "#E60023" } }}
                >
                  <LogOut size={16} />
                </IconButton>
              </Tooltip>
            </Box>
          )}
        </Box>
      </Box>

      {/* ===== MAIN CONTENT ===== */}
      <Box
        sx={{
          ml: `${sidebarWidth}px`,
          flexGrow: 1,
          display: "flex",
          flexDirection: "column",
          minHeight: "100vh",
          transition: "margin-left 0.25s ease",
        }}
      >
        {/* Topbar */}
        <Box
          sx={{
            height: 64,
            bgcolor: "white",
            borderBottom: "1px solid #eee",
            display: "flex",
            alignItems: "center",
            px: 3,
            position: "sticky",
            top: 0,
            zIndex: 99,
            boxShadow: "0 1px 8px rgba(0,0,0,0.06)",
          }}
        >
          {/* Page title */}
          <Typography variant="h6" sx={{ fontWeight: 800, color: "#1a1a1a", flexGrow: 1 }}>
            {title || "Admin Panel"}
          </Typography>

          {/* Right actions */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Tooltip title="Thông báo">
              <IconButton size="small" sx={{ color: "#555" }}>
                <Badge badgeContent={0} color="error">
                  <Bell size={20} />
                </Badge>
              </IconButton>
            </Tooltip>
            <Avatar
              sx={{
                width: 34,
                height: 34,
                bgcolor: "#E60023",
                fontSize: "0.85rem",
                fontWeight: 700,
                cursor: "pointer",
              }}
              onClick={() => navigate("/profile")}
            >
              {user?.name?.charAt(0).toUpperCase() || "A"}
            </Avatar>
          </Box>
        </Box>

        {/* Page content */}
        <Box sx={{ flexGrow: 1, p: 3 }}>{children}</Box>

        {/* Footer */}
        <Box
          sx={{
            py: 2,
            px: 3,
            borderTop: "1px solid #eee",
            bgcolor: "white",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Typography variant="caption" sx={{ color: "#aaa" }}>
            © {new Date().getFullYear()} Pickleball Bạch Đằng — Admin Panel
          </Typography>
          <Typography variant="caption" sx={{ color: "#aaa" }}>
            v1.0.0
          </Typography>
        </Box>
      </Box>
    </Box>
  );
};

export default AdminLayout;

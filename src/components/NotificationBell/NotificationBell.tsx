import { useState, useEffect, useRef, useCallback } from "react";
import {
  IconButton,
  Badge,
  Box,
  Typography,
  Divider,
  Button,
  Tooltip,
  ClickAwayListener,
  Paper,
  CircularProgress,
} from "@mui/material";
import { NotificationsOutlined, CheckCircleOutline, ArrowForward } from "@mui/icons-material";
import { Package, ShoppingCart, Tag } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import type { RootState, AppDispatch } from "../../store/store";
import {
  fetchUnreadCount,
  fetchNotifications,
  markNotificationRead,
  markAllNotificationsRead,
} from "../../store/slices/notificationSlice";
import type { Notification } from "../../services/notificationService";

// ─── Helpers ───────────────────────────────────────────────────

const timeAgo = (dateStr: string): string => {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "vừa xong";
  if (mins < 60) return `${mins} phút trước`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs} giờ trước`;
  const days = Math.floor(hrs / 24);
  return `${days} ngày trước`;
};

const NotifIcon = ({ type }: { type: Notification["type"] }) => {
  const style = { width: 18, height: 18 };
  if (type === "new_order") return <ShoppingCart {...style} />;
  if (type === "order_status") return <Package {...style} />;
  return <Tag {...style} />;
};

const typeColor = (type: Notification["type"]): string => {
  if (type === "new_order") return "#0F766E";
  if (type === "order_status") return "#7C3AED";
  return "#D97706";
};

// ─── Component ────────────────────────────────────────────────

const POLL_INTERVAL_MS = 30_000;

const NotificationBell = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const anchorRef = useRef<HTMLButtonElement>(null);

  const { notifications, unreadCount, loading } = useSelector(
    (s: RootState) => s.notifications
  );
  const user = useSelector((s: RootState) => s.auth.user);
  const isAuthenticated = useSelector((s: RootState) => s.auth.isAuthenticated);

  // ── Polling unread count every 30 seconds ──
  const pollCount = useCallback(() => {
    if (isAuthenticated) dispatch(fetchUnreadCount());
  }, [dispatch, isAuthenticated]);

  useEffect(() => {
    if (!isAuthenticated) return;
    pollCount();
    const interval = setInterval(pollCount, POLL_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [isAuthenticated, pollCount]);

  // ── Fetch full list when dropdown opens ──
  useEffect(() => {
    if (open && isAuthenticated) {
      dispatch(fetchNotifications({ limit: 10, page: 1 }));
    }
  }, [open, isAuthenticated, dispatch]);

  const handleOpen = () => setOpen((prev) => !prev);
  const handleClose = () => setOpen(false);

  const handleItemClick = async (notif: Notification) => {
    if (!notif.isRead) {
      await dispatch(markNotificationRead(notif._id));
    }
    setOpen(false);
    if (notif.orderId) {
      if (user?.role === "admin" || user?.role === "manager") {
        navigate("/admin/orders");
      } else {
        navigate("/orders");
      }
    }
  };

  const handleMarkAll = async () => {
    await dispatch(markAllNotificationsRead());
  };

  return (
    <ClickAwayListener onClickAway={handleClose}>
      <Box sx={{ position: "relative" }}>
        {/* Bell Icon */}
        <Tooltip title="Thông báo" arrow>
          <IconButton
            ref={anchorRef}
            onClick={handleOpen}
            sx={{
              width: 46,
              height: 46,
              bgcolor: open ? "rgba(124,58,237,0.12)" : "rgba(124,58,237,0.08)",
              color: "#7C3AED",
              transition: "all 220ms ease",
              "&:hover": {
                bgcolor: "rgba(124,58,237,0.18)",
                transform: "scale(1.05)",
              },
            }}
          >
            <Badge
              badgeContent={unreadCount > 0 ? unreadCount : undefined}
              sx={{
                "& .MuiBadge-badge": {
                  bgcolor: "#EF4444",
                  color: "#fff",
                  fontSize: "0.62rem",
                  fontWeight: 900,
                  minWidth: 17,
                  height: 17,
                },
              }}
            >
              <NotificationsOutlined sx={{ fontSize: 24 }} />
            </Badge>
          </IconButton>
        </Tooltip>

        {/* Dropdown */}
        {open && (
          <Paper
            elevation={0}
            sx={{
              position: "absolute",
              top: "calc(100% + 12px)",
              right: 0,
              width: { xs: 320, sm: 380 },
              borderRadius: "20px",
              border: "1px solid rgba(124,58,237,0.15)",
              boxShadow: "0 20px 60px rgba(15,23,42,0.18), 0 4px 20px rgba(124,58,237,0.1)",
              zIndex: 1300,
              overflow: "hidden",
              bgcolor: "#FFFFFF",
            }}
          >
            {/* Header */}
            <Box
              sx={{
                px: 2.5,
                py: 2,
                background: "linear-gradient(135deg, #7C3AED 0%, #5B21B6 100%)",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <NotificationsOutlined sx={{ color: "#fff", fontSize: 20 }} />
                <Typography sx={{ color: "#fff", fontWeight: 800, fontSize: "0.95rem" }}>
                  Thông báo
                </Typography>
                {unreadCount > 0 && (
                  <Box
                    sx={{
                      bgcolor: "rgba(255,255,255,0.25)",
                      color: "#fff",
                      px: 1,
                      py: 0.2,
                      borderRadius: 99,
                      fontSize: "0.72rem",
                      fontWeight: 800,
                    }}
                  >
                    {unreadCount} mới
                  </Box>
                )}
              </Box>
              {unreadCount > 0 && (
                <Button
                  size="small"
                  onClick={handleMarkAll}
                  startIcon={<CheckCircleOutline sx={{ fontSize: 15 }} />}
                  sx={{
                    color: "rgba(255,255,255,0.85)",
                    fontSize: "0.75rem",
                    fontWeight: 700,
                    textTransform: "none",
                    "&:hover": { color: "#fff", bgcolor: "rgba(255,255,255,0.12)" },
                  }}
                >
                  Đọc tất cả
                </Button>
              )}
            </Box>

            {/* List */}
            <Box sx={{ maxHeight: 400, overflowY: "auto", "&::-webkit-scrollbar": { width: 4 }, "&::-webkit-scrollbar-thumb": { bgcolor: "#E2E8F0", borderRadius: 2 } }}>
              {loading ? (
                <Box sx={{ py: 5, display: "flex", justifyContent: "center" }}>
                  <CircularProgress size={28} sx={{ color: "#7C3AED" }} />
                </Box>
              ) : notifications.length === 0 ? (
                <Box sx={{ py: 6, textAlign: "center" }}>
                  <NotificationsOutlined sx={{ fontSize: 48, color: "#CBD5E1", mb: 1 }} />
                  <Typography sx={{ color: "#94A3B8", fontSize: "0.88rem", fontWeight: 600 }}>
                    Chưa có thông báo nào
                  </Typography>
                </Box>
              ) : (
                notifications.map((notif, idx) => (
                  <Box key={notif._id}>
                    <Box
                      onClick={() => handleItemClick(notif)}
                      sx={{
                        px: 2.5,
                        py: 1.8,
                        display: "flex",
                        gap: 1.5,
                        alignItems: "flex-start",
                        cursor: "pointer",
                        bgcolor: notif.isRead ? "transparent" : "rgba(124,58,237,0.04)",
                        borderLeft: notif.isRead ? "3px solid transparent" : "3px solid #7C3AED",
                        transition: "all 200ms ease",
                        "&:hover": { bgcolor: "#F8FAFF" },
                      }}
                    >
                      {/* Icon */}
                      <Box
                        sx={{
                          width: 36,
                          height: 36,
                          borderRadius: "10px",
                          bgcolor: `${typeColor(notif.type)}18`,
                          color: typeColor(notif.type),
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          flexShrink: 0,
                          mt: 0.2,
                        }}
                      >
                        <NotifIcon type={notif.type} />
                      </Box>

                      {/* Content */}
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Typography
                          sx={{
                            fontWeight: notif.isRead ? 600 : 800,
                            fontSize: "0.85rem",
                            color: "#0F172A",
                            mb: 0.3,
                            lineHeight: 1.4,
                          }}
                        >
                          {notif.title}
                        </Typography>
                        <Typography
                          sx={{
                            fontSize: "0.78rem",
                            color: "#64748B",
                            lineHeight: 1.5,
                            mb: 0.5,
                            overflow: "hidden",
                            display: "-webkit-box",
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: "vertical",
                          }}
                        >
                          {notif.message}
                        </Typography>
                        <Typography sx={{ fontSize: "0.72rem", color: "#94A3B8", fontWeight: 600 }}>
                          {timeAgo(notif.createdAt)}
                        </Typography>
                      </Box>

                      {/* Unread dot */}
                      {!notif.isRead && (
                        <Box
                          sx={{
                            width: 8,
                            height: 8,
                            borderRadius: "50%",
                            bgcolor: "#7C3AED",
                            flexShrink: 0,
                            mt: 0.6,
                          }}
                        />
                      )}
                    </Box>
                    {idx < notifications.length - 1 && <Divider sx={{ mx: 2.5, borderColor: "#F1F5F9" }} />}
                  </Box>
                ))
              )}
            </Box>

            {/* Footer */}
            <Divider sx={{ borderColor: "#F1F5F9" }} />
            <Box sx={{ px: 2.5, py: 1.5 }}>
              <Button
                fullWidth
                endIcon={<ArrowForward sx={{ fontSize: 16 }} />}
                onClick={() => { setOpen(false); navigate("/notifications"); }}
                sx={{
                  color: "#7C3AED",
                  fontWeight: 800,
                  fontSize: "0.82rem",
                  textTransform: "none",
                  borderRadius: "10px",
                  py: 1,
                  "&:hover": { bgcolor: "rgba(124,58,237,0.08)" },
                }}
              >
                Xem tất cả thông báo
              </Button>
            </Box>
          </Paper>
        )}
      </Box>
    </ClickAwayListener>
  );
};

export default NotificationBell;

import { useEffect, useState } from "react";
import {
  Box,
  Container,
  Typography,
  Paper,
  Tabs,
  Tab,
  CircularProgress,
  Button,
  Pagination,
} from "@mui/material";
import { useDispatch, useSelector } from "react-redux";
import type { RootState, AppDispatch } from "../../store/store";
import {
  fetchNotifications,
  markNotificationRead,
  markAllNotificationsRead,
} from "../../store/slices/notificationSlice";
import MainLayout from "../../layout/MainLayout/MainLayout";
import { NotificationsOff, CheckCircleOutline } from "@mui/icons-material";
import { Package, ShoppingCart, Tag } from "lucide-react";
import { useNavigate } from "react-router-dom";
import type { Notification } from "../../services/notificationService";

const T = {
  bgPage: "#F8FAFC",
  bgCard: "#FFFFFF",
  text: "#0F172A",
  textSub: "#64748B",
  teal: "#0F766E",
  purple: "#7C3AED",
  orange: "#D97706",
  border: "#E2E8F0",
};

const NotifIcon = ({ type }: { type: Notification["type"] }) => {
  const style = { width: 20, height: 20 };
  if (type === "new_order") return <ShoppingCart {...style} />;
  if (type === "order_status") return <Package {...style} />;
  return <Tag {...style} />;
};

const typeColor = (type: Notification["type"]): string => {
  if (type === "new_order") return T.teal;
  if (type === "order_status") return T.purple;
  return T.orange;
};

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

const NotificationsPage = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const [tab, setTab] = useState(0); // 0: All, 1: Unread
  const [page, setPage] = useState(1);
  const limit = 15;

  const { notifications, loading, totalPages, unreadCount } = useSelector(
    (s: RootState) => s.notifications
  );
  const user = useSelector((s: RootState) => s.auth.user);

  useEffect(() => {
    dispatch(fetchNotifications({ page, limit }));
  }, [dispatch, page, tab]); // Re-fetch on page or tab change (though backend currently doesn't filter by unread in API, we'll filter on frontend for simplicity if needed, or just show all and highlight)

  // In this implementation, the API returns all. We filter locally for 'Unread' tab.
  // Ideally, backend should support ?isRead=false. For now, local filter.
  const displayNotifs = tab === 0 ? notifications : notifications.filter(n => !n.isRead);

  const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
    setTab(newValue);
    setPage(1); // Reset page on tab change
  };

  const handleItemClick = async (notif: Notification) => {
    if (!notif.isRead) {
      await dispatch(markNotificationRead(notif._id));
    }
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

  const handlePageChange = (_: React.ChangeEvent<unknown>, value: number) => {
    setPage(value);
  };

  return (
    <MainLayout>
      <Box sx={{ bgcolor: T.bgPage, minHeight: "85vh", py: { xs: 4, md: 6 } }}>
        <Container maxWidth="md">
          {/* Header */}
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", mb: 3 }}>
            <Box>
              <Typography variant="h4" sx={{ fontWeight: 900, color: T.text, mb: 1, fontSize: { xs: "1.8rem", md: "2.2rem" } }}>
                Thông báo của bạn
              </Typography>
              <Typography sx={{ color: T.textSub, fontSize: "0.95rem" }}>
                Cập nhật tình trạng đơn hàng và tin tức mới nhất
              </Typography>
            </Box>
            {unreadCount > 0 && (
              <Button
                variant="outlined"
                onClick={handleMarkAll}
                startIcon={<CheckCircleOutline />}
                sx={{
                  color: T.purple,
                  borderColor: `${T.purple}50`,
                  textTransform: "none",
                  fontWeight: 700,
                  borderRadius: 2,
                  "&:hover": { bgcolor: `${T.purple}10`, borderColor: T.purple },
                  display: { xs: "none", sm: "flex" }
                }}
              >
                Đánh dấu tất cả đã đọc
              </Button>
            )}
          </Box>

          <Paper
            elevation={0}
            sx={{
              bgcolor: T.bgCard,
              borderRadius: 3,
              border: `1px solid ${T.border}`,
              overflow: "hidden",
              boxShadow: "0 10px 40px rgba(15,23,42,0.04)",
            }}
          >
            {/* Tabs */}
            <Box sx={{ borderBottom: `1px solid ${T.border}`, px: 2, bgcolor: "#FAFCFC" }}>
              <Tabs
                value={tab}
                onChange={handleTabChange}
                sx={{
                  "& .MuiTab-root": {
                    textTransform: "none",
                    fontWeight: 700,
                    fontSize: "0.95rem",
                    minWidth: 100,
                    color: T.textSub,
                    "&.Mui-selected": { color: T.purple },
                  },
                  "& .MuiTabs-indicator": { bgcolor: T.purple, height: 3, borderTopLeftRadius: 3, borderTopRightRadius: 3 },
                }}
              >
                <Tab label="Tất cả" />
                <Tab label={`Chưa đọc (${unreadCount})`} />
              </Tabs>
            </Box>

            {/* List */}
            <Box sx={{ minHeight: 400 }}>
              {loading ? (
                <Box sx={{ display: "flex", justifyContent: "center", py: 10 }}>
                  <CircularProgress sx={{ color: T.purple }} />
                </Box>
              ) : displayNotifs.length === 0 ? (
                <Box sx={{ py: 10, textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center" }}>
                  <Box sx={{ width: 80, height: 80, borderRadius: "50%", bgcolor: "#F1F5F9", display: "flex", alignItems: "center", justifyContent: "center", mb: 2 }}>
                    <NotificationsOff sx={{ fontSize: 40, color: "#94A3B8" }} />
                  </Box>
                  <Typography sx={{ color: T.text, fontSize: "1.1rem", fontWeight: 700, mb: 1 }}>
                    Chưa có thông báo nào
                  </Typography>
                  <Typography sx={{ color: T.textSub, fontSize: "0.9rem" }}>
                    Khi có hoạt động mới, thông báo sẽ hiển thị tại đây.
                  </Typography>
                </Box>
              ) : (
                <Box>
                  {displayNotifs.map((notif) => (
                    <Box
                      key={notif._id}
                      onClick={() => handleItemClick(notif)}
                      sx={{
                        p: { xs: 2, md: 3 },
                        display: "flex",
                        gap: 2,
                        borderBottom: `1px solid ${T.border}`,
                        cursor: "pointer",
                        bgcolor: notif.isRead ? "transparent" : `${T.purple}08`,
                        borderLeft: notif.isRead ? "4px solid transparent" : `4px solid ${T.purple}`,
                        transition: "all 0.2s ease",
                        "&:hover": { bgcolor: "#FAFCFC" },
                        "&:last-child": { borderBottom: "none" }
                      }}
                    >
                      {/* Icon */}
                      <Box
                        sx={{
                          width: 48,
                          height: 48,
                          borderRadius: 2,
                          bgcolor: `${typeColor(notif.type)}15`,
                          color: typeColor(notif.type),
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          flexShrink: 0,
                        }}
                      >
                        <NotifIcon type={notif.type} />
                      </Box>

                      {/* Content */}
                      <Box sx={{ flex: 1 }}>
                        <Typography sx={{ fontWeight: notif.isRead ? 600 : 800, color: T.text, fontSize: "1rem", mb: 0.5 }}>
                          {notif.title}
                        </Typography>
                        <Typography sx={{ color: T.textSub, fontSize: "0.9rem", lineHeight: 1.5, mb: 1 }}>
                          {notif.message}
                        </Typography>
                        <Typography sx={{ color: "#94A3B8", fontSize: "0.8rem", fontWeight: 600 }}>
                          {timeAgo(notif.createdAt)}
                        </Typography>
                      </Box>

                      {/* Unread indicator (mobile) */}
                      {!notif.isRead && (
                        <Box sx={{ width: 10, height: 10, borderRadius: "50%", bgcolor: T.purple, flexShrink: 0, mt: 1 }} />
                      )}
                    </Box>
                  ))}
                </Box>
              )}
            </Box>

            {/* Pagination */}
            {totalPages > 1 && tab === 0 && (
              <Box sx={{ display: "flex", justifyContent: "center", py: 3, borderTop: `1px solid ${T.border}` }}>
                <Pagination
                  count={totalPages}
                  page={page}
                  onChange={handlePageChange}
                  color="primary"
                  sx={{
                    "& .MuiPaginationItem-root": {
                      fontWeight: 700,
                      "&.Mui-selected": { bgcolor: T.purple, color: "#fff", "&:hover": { bgcolor: `${T.purple}90` } }
                    }
                  }}
                />
              </Box>
            )}
          </Paper>
        </Container>
      </Box>
    </MainLayout>
  );
};

export default NotificationsPage;

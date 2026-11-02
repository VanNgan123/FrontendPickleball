import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Avatar,
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  InputAdornment,
  MenuItem,
  Paper,
  Select,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";
import {
  Search,
  ShieldCheck,
  UserCheck,
  UserRound,
  UserX,
  UsersRound,
} from "lucide-react";
import { useSelector } from "react-redux";
import toast from "react-hot-toast";
import type { RootState } from "../../store/store";
import AdminLayout from "../../layout/AdminLayout/AdminLayout";
import userService, { type UserProfile } from "../../services/userService";

type UserRole = "customer" | "staff" | "admin";

const ROLE_META: Record<UserRole, { label: string; color: string; bg: string }> = {
  customer: { label: "Khách hàng", color: "#2563eb", bg: "#eff6ff" },
  staff: { label: "Nhân viên", color: "#7c3aed", bg: "#f5f3ff" },
  admin: { label: "Quản trị viên", color: "#dc2626", bg: "#fef2f2" },
};

const getErrorMessage = (error: unknown, fallback: string) => {
  const apiError = error as { response?: { data?: { message?: string } }; message?: string };
  return apiError.response?.data?.message || apiError.message || fallback;
};

const formatDate = (value?: string) =>
  value
    ? new Date(value).toLocaleDateString("vi-VN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      })
    : "—";

const getAvatarUrl = (value?: string) => {
  if (!value || value.startsWith("http")) return value;
  const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:3001";
  return `${apiUrl.replace(/\/+$/, "")}/${value.replace(/^\/+/, "")}`;
};

const StatCard = ({
  label,
  value,
  icon,
  color,
  bg,
}: {
  label: string;
  value: number;
  icon: React.ReactNode;
  color: string;
  bg: string;
}) => (
  <Paper
    elevation={0}
    sx={{
      p: 2.25,
      borderRadius: 3,
      border: "1px solid #e8edf4",
      display: "flex",
      alignItems: "center",
      gap: 1.75,
      minWidth: 0,
    }}
  >
    <Box
      sx={{
        width: 46,
        height: 46,
        borderRadius: 2.5,
        bgcolor: bg,
        color,
        display: "grid",
        placeItems: "center",
        flexShrink: 0,
      }}
    >
      {icon}
    </Box>
    <Box sx={{ minWidth: 0 }}>
      <Typography variant="h5" sx={{ fontWeight: 900, color: "#0f172a", lineHeight: 1.1 }}>
        {value}
      </Typography>
      <Typography variant="caption" sx={{ color: "#64748b", fontWeight: 700 }}>
        {label}
      </Typography>
    </Box>
  </Paper>
);

const AdminUsers = () => {
  const currentUser = useSelector((state: RootState) => state.auth.user);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionId, setActionId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [confirmUser, setConfirmUser] = useState<UserProfile | null>(null);

  const loadUsers = useCallback(async () => {
    try {
      setLoading(true);
      const response = await userService.getAllUsers();
      setUsers(response.data || []);
    } catch (error) {
      toast.error(getErrorMessage(error, "Không thể tải danh sách người dùng"));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadUsers();
  }, [loadUsers]);

  useEffect(() => setPage(0), [search, roleFilter, statusFilter]);

  const filteredUsers = useMemo(() => {
    const keyword = search.trim().toLowerCase();
    return users.filter((user) => {
      const matchesSearch =
        !keyword ||
        user.name.toLowerCase().includes(keyword) ||
        user.email.toLowerCase().includes(keyword) ||
        user.phone?.toLowerCase().includes(keyword);
      const matchesRole = roleFilter === "all" || user.role === roleFilter;
      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "active" ? user.isActive : !user.isActive);
      return matchesSearch && matchesRole && matchesStatus;
    });
  }, [users, search, roleFilter, statusFilter]);

  const paginatedUsers = filteredUsers.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  const handleRoleChange = async (user: UserProfile, role: UserRole) => {
    if (user._id === currentUser?.id) {
      toast.error("Không thể tự thay đổi vai trò của chính mình");
      return;
    }
    try {
      setActionId(user._id);
      const response = await userService.updateUserRole(user._id, role);
      setUsers((current) =>
        current.map((item) => (item._id === user._id ? response.data : item))
      );
      toast.success("Đã cập nhật vai trò người dùng");
    } catch (error) {
      toast.error(getErrorMessage(error, "Cập nhật vai trò thất bại"));
    } finally {
      setActionId(null);
    }
  };

  const handleToggleActive = async () => {
    if (!confirmUser) return;
    try {
      setActionId(confirmUser._id);
      const response = await userService.toggleUserActive(confirmUser._id);
      setUsers((current) =>
        current.map((item) => (item._id === confirmUser._id ? response.data : item))
      );
      toast.success(
        confirmUser.isActive ? "Đã khóa tài khoản" : "Đã kích hoạt tài khoản"
      );
      setConfirmUser(null);
    } catch (error) {
      toast.error(getErrorMessage(error, "Cập nhật trạng thái thất bại"));
    } finally {
      setActionId(null);
    }
  };

  const activeCount = users.filter((user) => user.isActive).length;
  const adminCount = users.filter((user) => user.role === "admin").length;
  const staffCount = users.filter((user) => user.role === "staff").length;

  return (
    <AdminLayout title="Quản lý người dùng">
      <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 900, color: "#0f172a" }}>
            Người dùng hệ thống
          </Typography>
          <Typography variant="body2" sx={{ color: "#64748b", mt: 0.5 }}>
            Theo dõi tài khoản, phân quyền và kiểm soát trạng thái hoạt động.
          </Typography>
        </Box>

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", sm: "repeat(2, 1fr)", xl: "repeat(4, 1fr)" },
            gap: 2,
          }}
        >
          <StatCard label="Tổng người dùng" value={users.length} icon={<UsersRound size={22} />} color="#2563eb" bg="#eff6ff" />
          <StatCard label="Đang hoạt động" value={activeCount} icon={<UserCheck size={22} />} color="#16a34a" bg="#f0fdf4" />
          <StatCard label="Nhân viên" value={staffCount} icon={<UserRound size={22} />} color="#7c3aed" bg="#f5f3ff" />
          <StatCard label="Quản trị viên" value={adminCount} icon={<ShieldCheck size={22} />} color="#dc2626" bg="#fef2f2" />
        </Box>

        <Paper elevation={0} sx={{ border: "1px solid #e8edf4", borderRadius: 3, overflow: "hidden" }}>
          <Stack
            direction={{ xs: "column", md: "row" }}
            spacing={1.5}
            sx={{ p: 2.25, borderBottom: "1px solid #edf1f5" }}
          >
            <TextField
              size="small"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Tìm theo tên, email hoặc số điện thoại..."
              sx={{ flex: 1, minWidth: { md: 280 } }}
              slotProps={{ input: { startAdornment: <InputAdornment position="start"><Search size={18} /></InputAdornment> } }}
            />
            <FormControl size="small" sx={{ minWidth: 160 }}>
              <Select value={roleFilter} onChange={(event) => setRoleFilter(event.target.value)}>
                <MenuItem value="all">Tất cả vai trò</MenuItem>
                <MenuItem value="customer">Khách hàng</MenuItem>
                <MenuItem value="staff">Nhân viên</MenuItem>
                <MenuItem value="admin">Quản trị viên</MenuItem>
              </Select>
            </FormControl>
            <FormControl size="small" sx={{ minWidth: 160 }}>
              <Select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}>
                <MenuItem value="all">Tất cả trạng thái</MenuItem>
                <MenuItem value="active">Đang hoạt động</MenuItem>
                <MenuItem value="inactive">Đã khóa</MenuItem>
              </Select>
            </FormControl>
          </Stack>

          {loading ? (
            <Box sx={{ minHeight: 340, display: "grid", placeItems: "center" }}>
              <CircularProgress size={38} />
            </Box>
          ) : (
            <>
              <TableContainer>
                <Table sx={{ minWidth: 900 }}>
                  <TableHead>
                    <TableRow sx={{ bgcolor: "#f8fafc" }}>
                      {['Người dùng', 'Liên hệ', 'Vai trò', 'Trạng thái', 'Ngày tham gia', 'Thao tác'].map((label) => (
                        <TableCell key={label} sx={{ fontWeight: 800, color: "#475569", py: 1.6 }}>{label}</TableCell>
                      ))}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {paginatedUsers.map((user) => {
                      const role = (ROLE_META[user.role as UserRole] || ROLE_META.customer);
                      const isSelf = user._id === currentUser?.id;
                      const isBusy = actionId === user._id;
                      return (
                        <TableRow key={user._id} hover sx={{ "&:last-child td": { border: 0 } }}>
                          <TableCell>
                            <Stack direction="row" spacing={1.5} alignItems="center">
                              <Avatar src={getAvatarUrl(user.avatar)} sx={{ width: 42, height: 42, bgcolor: "#0f172a", fontWeight: 800 }}>
                                {user.name.charAt(0).toUpperCase()}
                              </Avatar>
                              <Box>
                                <Stack direction="row" spacing={0.75} alignItems="center">
                                  <Typography variant="body2" sx={{ fontWeight: 800, color: "#0f172a" }}>{user.name}</Typography>
                                  {isSelf && <Chip label="Bạn" size="small" sx={{ height: 19, fontSize: 10, fontWeight: 800 }} />}
                                </Stack>
                                <Typography variant="caption" sx={{ color: "#94a3b8" }}>ID: {user._id.slice(-8)}</Typography>
                              </Box>
                            </Stack>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2" sx={{ color: "#334155" }}>{user.email}</Typography>
                            <Typography variant="caption" sx={{ color: "#94a3b8" }}>{user.phone || "Chưa cập nhật SĐT"}</Typography>
                          </TableCell>
                          <TableCell>
                            <Select
                              size="small"
                              value={user.role}
                              disabled={isSelf || isBusy}
                              onChange={(event) => void handleRoleChange(user, event.target.value as UserRole)}
                              sx={{ minWidth: 142, color: role.color, bgcolor: role.bg, fontWeight: 800, ".MuiOutlinedInput-notchedOutline": { border: 0 } }}
                            >
                              <MenuItem value="customer">Khách hàng</MenuItem>
                              <MenuItem value="staff">Nhân viên</MenuItem>
                              <MenuItem value="admin">Quản trị viên</MenuItem>
                            </Select>
                          </TableCell>
                          <TableCell>
                            <Chip
                              size="small"
                              icon={user.isActive ? <UserCheck size={14} /> : <UserX size={14} />}
                              label={user.isActive ? "Hoạt động" : "Đã khóa"}
                              sx={{ bgcolor: user.isActive ? "#f0fdf4" : "#fef2f2", color: user.isActive ? "#15803d" : "#dc2626", fontWeight: 800 }}
                            />
                          </TableCell>
                          <TableCell><Typography variant="body2" color="text.secondary">{formatDate(user.createdAt)}</Typography></TableCell>
                          <TableCell>
                            <Button
                              size="small"
                              variant="outlined"
                              color={user.isActive ? "error" : "success"}
                              disabled={isSelf || isBusy}
                              onClick={() => setConfirmUser(user)}
                              sx={{ textTransform: "none", fontWeight: 800, minWidth: 92 }}
                            >
                              {isBusy ? <CircularProgress size={16} /> : user.isActive ? "Khóa" : "Kích hoạt"}
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                    {paginatedUsers.length === 0 && (
                      <TableRow><TableCell colSpan={6} align="center" sx={{ py: 8, color: "#94a3b8" }}>Không tìm thấy người dùng phù hợp.</TableCell></TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
              <TablePagination
                component="div"
                count={filteredUsers.length}
                page={page}
                onPageChange={(_, nextPage) => setPage(nextPage)}
                rowsPerPage={rowsPerPage}
                onRowsPerPageChange={(event) => { setRowsPerPage(Number(event.target.value)); setPage(0); }}
                rowsPerPageOptions={[5, 10, 20]}
                labelRowsPerPage="Số dòng:"
              />
            </>
          )}
        </Paper>
      </Box>

      <Dialog open={Boolean(confirmUser)} onClose={() => !actionId && setConfirmUser(null)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 900 }}>{confirmUser?.isActive ? "Khóa tài khoản?" : "Kích hoạt tài khoản?"}</DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ color: "#64748b", lineHeight: 1.7 }}>
            {confirmUser?.isActive
              ? `“${confirmUser?.name}” sẽ không thể đăng nhập cho đến khi được kích hoạt lại.`
              : `“${confirmUser?.name}” sẽ có thể đăng nhập và sử dụng hệ thống trở lại.`}
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5 }}>
          <Button onClick={() => setConfirmUser(null)} disabled={Boolean(actionId)}>Hủy</Button>
          <Button variant="contained" color={confirmUser?.isActive ? "error" : "success"} onClick={() => void handleToggleActive()} disabled={Boolean(actionId)}>
            {actionId ? <CircularProgress size={20} color="inherit" /> : confirmUser?.isActive ? "Xác nhận khóa" : "Xác nhận kích hoạt"}
          </Button>
        </DialogActions>
      </Dialog>
    </AdminLayout>
  );
};

export default AdminUsers;

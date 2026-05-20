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
  Switch,
  FormControlLabel,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
} from "@mui/material";
import { Search, Plus, Edit2, Trash2, X, Ticket, Calendar } from "lucide-react";
import AdminLayout from "../../layout/AdminLayout/AdminLayout";
import axiosPickleball from "../../api/axiosPickleball";
import toast from "react-hot-toast";

const formatPrice = (v: number) => v.toLocaleString("vi-VN") + "đ";
const formatDate = (d: string) => new Date(d).toLocaleDateString("vi-VN");

interface Coupon {
  _id: string;
  code: string;
  description?: string;
  discountType: "percentage" | "fixed";
  discountValue: number;
  minOrderAmount: number;
  maxDiscount?: number;
  usageLimit?: number;
  usedCount: number;
  validFrom: string;
  validTo: string;
  isActive: boolean;
}

// =============================================
// Coupon Form Dialog
// =============================================
const CouponFormDialog = ({
  open,
  onClose,
  editCoupon,
  onSuccess,
}: {
  open: boolean;
  onClose: () => void;
  editCoupon: Coupon | null;
  onSuccess: () => void;
}) => {
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    code: "",
    description: "",
    discountType: "percentage" as "percentage" | "fixed",
    discountValue: "",
    minOrderAmount: "0",
    maxDiscount: "",
    usageLimit: "",
    validFrom: "",
    validTo: "",
    isActive: true,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const today = new Date().toISOString().split("T")[0];

  useEffect(() => {
    if (open) {
      if (editCoupon) {
        setForm({
          code: editCoupon.code,
          description: editCoupon.description || "",
          discountType: editCoupon.discountType,
          discountValue: String(editCoupon.discountValue),
          minOrderAmount: String(editCoupon.minOrderAmount || 0),
          maxDiscount: String(editCoupon.maxDiscount || ""),
          usageLimit: String(editCoupon.usageLimit || ""),
          validFrom: editCoupon.validFrom?.split("T")[0] || "",
          validTo: editCoupon.validTo?.split("T")[0] || "",
          isActive: editCoupon.isActive,
        });
      } else {
        setForm({
          code: "",
          description: "",
          discountType: "percentage",
          discountValue: "",
          minOrderAmount: "0",
          maxDiscount: "",
          usageLimit: "",
          validFrom: today,
          validTo: "",
          isActive: true,
        });
      }
      setErrors({});
    }
  }, [open, editCoupon]);

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!form.code.trim()) errs.code = "Vui lòng nhập mã coupon";
    if (!form.discountValue || isNaN(Number(form.discountValue)) || Number(form.discountValue) <= 0)
      errs.discountValue = "Giá trị giảm phải > 0";
    if (form.discountType === "percentage" && Number(form.discountValue) > 100)
      errs.discountValue = "Phần trăm không được > 100";
    if (!form.validFrom) errs.validFrom = "Vui lòng chọn ngày bắt đầu";
    if (!form.validTo) errs.validTo = "Vui lòng chọn ngày kết thúc";
    if (form.validFrom && form.validTo && form.validTo <= form.validFrom)
      errs.validTo = "Ngày kết thúc phải sau ngày bắt đầu";
    return errs;
  };

  const handleSubmit = async () => {
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }

    try {
      setSubmitting(true);
      const payload = {
        code: form.code.trim().toUpperCase(),
        description: form.description.trim() || undefined,
        discountType: form.discountType,
        discountValue: Number(form.discountValue),
        minOrderAmount: Number(form.minOrderAmount) || 0,
        maxDiscount: form.maxDiscount ? Number(form.maxDiscount) : undefined,
        usageLimit: form.usageLimit ? Number(form.usageLimit) : undefined,
        validFrom: new Date(form.validFrom).toISOString(),
        validTo: new Date(form.validTo + "T23:59:59").toISOString(),
        isActive: form.isActive,
      };

      if (editCoupon) {
        await axiosPickleball.put(`/api/coupons/${editCoupon._id}`, payload);
        toast.success("Cập nhật coupon thành công!");
      } else {
        await axiosPickleball.post("/api/coupons", payload);
        toast.success("Tạo coupon thành công!");
      }
      onSuccess();
      onClose();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Có lỗi xảy ra");
    } finally {
      setSubmitting(false);
    }
  };

  const textFieldSx = {
    "& .MuiOutlinedInput-root": {
      borderRadius: 1.5,
      bgcolor: "#fafafa",
      fontSize: "0.875rem",
      "& fieldset": { borderColor: "#e0e0e0" },
      "&:hover fieldset": { borderColor: "#E60023" },
      "&.Mui-focused fieldset": { borderColor: "#E60023" },
    },
    "& .MuiInputLabel-root.Mui-focused": { color: "#E60023" },
    "& .MuiInputLabel-root": { fontSize: "0.875rem" },
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 2 } }}>
      <DialogTitle
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          borderBottom: "1px solid #f0f0f0",
          pb: 2,
        }}
      >
        <Typography variant="h6" sx={{ fontWeight: 800, color: "#1a1a1a" }}>
          {editCoupon ? "Chỉnh sửa coupon" : "Tạo coupon mới"}
        </Typography>
        <IconButton size="small" onClick={onClose}><X size={20} /></IconButton>
      </DialogTitle>

      <DialogContent sx={{ p: 3 }}>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          <TextField
            fullWidth
            label="Mã coupon *"
            placeholder="VD: SALE50, SUMMER2025"
            value={form.code}
            onChange={(e) => {
              setForm((p) => ({ ...p, code: e.target.value.toUpperCase() }));
              setErrors((p) => ({ ...p, code: "" }));
            }}
            disabled={!!editCoupon}
            error={!!errors.code}
            helperText={errors.code || (editCoupon ? "Không thể thay đổi mã coupon" : "")}
            sx={textFieldSx}
          />

          <TextField
            fullWidth
            label="Mô tả (tùy chọn)"
            value={form.description}
            onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
            sx={textFieldSx}
          />

          <Box sx={{ display: "flex", gap: 2 }}>
            <TextField
              select
              fullWidth
              label="Loại giảm giá"
              value={form.discountType}
              onChange={(e) => setForm((p) => ({ ...p, discountType: e.target.value as any }))}
              SelectProps={{ native: true }}
              sx={textFieldSx}
            >
              <option value="percentage">Phần trăm (%)</option>
              <option value="fixed">Số tiền cố định (đ)</option>
            </TextField>

            <TextField
              fullWidth
              label={form.discountType === "percentage" ? "Phần trăm giảm *" : "Số tiền giảm (đ) *"}
              type="number"
              value={form.discountValue}
              onChange={(e) => {
                setForm((p) => ({ ...p, discountValue: e.target.value }));
                setErrors((p) => ({ ...p, discountValue: "" }));
              }}
              error={!!errors.discountValue}
              helperText={errors.discountValue}
              sx={textFieldSx}
            />
          </Box>

          <Box sx={{ display: "flex", gap: 2 }}>
            <TextField
              fullWidth
              label="Đơn hàng tối thiểu (đ)"
              type="number"
              value={form.minOrderAmount}
              onChange={(e) => setForm((p) => ({ ...p, minOrderAmount: e.target.value }))}
              sx={textFieldSx}
            />
            {form.discountType === "percentage" && (
              <TextField
                fullWidth
                label="Giảm tối đa (đ)"
                type="number"
                value={form.maxDiscount}
                onChange={(e) => setForm((p) => ({ ...p, maxDiscount: e.target.value }))}
                helperText="Để trống nếu không giới hạn"
                sx={textFieldSx}
              />
            )}
          </Box>

          <TextField
            fullWidth
            label="Giới hạn lượt dùng"
            type="number"
            value={form.usageLimit}
            onChange={(e) => setForm((p) => ({ ...p, usageLimit: e.target.value }))}
            helperText="Để trống nếu không giới hạn"
            sx={textFieldSx}
          />

          <Box sx={{ display: "flex", gap: 2 }}>
            <TextField
              fullWidth
              label="Ngày bắt đầu *"
              type="date"
              value={form.validFrom}
              onChange={(e) => {
                setForm((p) => ({ ...p, validFrom: e.target.value }));
                setErrors((p) => ({ ...p, validFrom: "" }));
              }}
              error={!!errors.validFrom}
              helperText={errors.validFrom}
              slotProps={{ inputLabel: { shrink: true } }}
              sx={textFieldSx}
            />
            <TextField
              fullWidth
              label="Ngày kết thúc *"
              type="date"
              value={form.validTo}
              onChange={(e) => {
                setForm((p) => ({ ...p, validTo: e.target.value }));
                setErrors((p) => ({ ...p, validTo: "" }));
              }}
              error={!!errors.validTo}
              helperText={errors.validTo}
              slotProps={{ inputLabel: { shrink: true } }}
              sx={textFieldSx}
            />
          </Box>

          <FormControlLabel
            control={
              <Switch
                checked={form.isActive}
                onChange={(e) => setForm((p) => ({ ...p, isActive: e.target.checked }))}
                sx={{
                  "& .MuiSwitch-switchBase.Mui-checked": { color: "#E60023" },
                  "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": { bgcolor: "#E60023" },
                }}
              />
            }
            label={<Typography variant="body2" sx={{ fontWeight: 600, color: "#1a1a1a" }}>Kích hoạt coupon</Typography>}
          />
        </Box>
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2, borderTop: "1px solid #f0f0f0", gap: 1 }}>
        <Button onClick={onClose} sx={{ color: "#888", fontWeight: 600 }}>Hủy</Button>
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={submitting}
          sx={{ bgcolor: "#E60023", "&:hover": { bgcolor: "#c4001d" }, fontWeight: 700, px: 3, borderRadius: 1.5 }}
        >
          {submitting ? <CircularProgress size={20} sx={{ color: "#fff" }} /> : editCoupon ? "Lưu thay đổi" : "Tạo coupon"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

// =============================================
// Delete Dialog
// =============================================
const DeleteDialog = ({
  open,
  onClose,
  coupon,
  onConfirm,
  loading,
}: {
  open: boolean;
  onClose: () => void;
  coupon: Coupon | null;
  onConfirm: () => void;
  loading: boolean;
}) => (
  <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth PaperProps={{ sx: { borderRadius: 2 } }}>
    <DialogTitle sx={{ fontWeight: 800 }}>Xác nhận xóa</DialogTitle>
    <DialogContent>
      <Typography variant="body2" sx={{ color: "#555" }}>
        Xóa coupon <strong>{coupon?.code}</strong>? Hành động này không thể hoàn tác.
      </Typography>
    </DialogContent>
    <DialogActions sx={{ px: 3, pb: 2, gap: 1 }}>
      <Button onClick={onClose} sx={{ color: "#888" }}>Hủy</Button>
      <Button
        variant="contained"
        onClick={onConfirm}
        disabled={loading}
        sx={{ bgcolor: "#ef4444", "&:hover": { bgcolor: "#dc2626" }, fontWeight: 700, px: 3, borderRadius: 1.5 }}
      >
        {loading ? <CircularProgress size={18} sx={{ color: "#fff" }} /> : "Xóa"}
      </Button>
    </DialogActions>
  </Dialog>
);

// =============================================
// Main Admin Coupons Page
// =============================================
const AdminCoupons = () => {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [formOpen, setFormOpen] = useState(false);
  const [editCoupon, setEditCoupon] = useState<Coupon | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteCoupon, setDeleteCoupon] = useState<Coupon | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  useEffect(() => {
    loadCoupons();
  }, []);

  const loadCoupons = async () => {
    try {
      setLoading(true);
      const res = await axiosPickleball.get("/api/coupons") as any;
      setCoupons(res?.data || []);
    } catch {
      toast.error("Không thể tải coupon");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteCoupon) return;
    try {
      setDeleteLoading(true);
      await axiosPickleball.delete(`/api/coupons/${deleteCoupon._id}`);
      toast.success("Xóa coupon thành công!");
      setDeleteOpen(false);
      setDeleteCoupon(null);
      loadCoupons();
    } catch {
      toast.error("Xóa thất bại");
    } finally {
      setDeleteLoading(false);
    }
  };

  const isExpired = (validTo: string) => new Date(validTo) < new Date();
  const isUpcoming = (validFrom: string) => new Date(validFrom) > new Date();

  const getCouponStatus = (coupon: Coupon) => {
    if (!coupon.isActive) return { label: "Tắt", color: "#888", bg: "#f5f5f5" };
    if (isExpired(coupon.validTo)) return { label: "Hết hạn", color: "#ef4444", bg: "rgba(239,68,68,0.1)" };
    if (isUpcoming(coupon.validFrom)) return { label: "Sắp tới", color: "#f59e0b", bg: "rgba(245,158,11,0.1)" };
    if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) return { label: "Hết lượt", color: "#ef4444", bg: "rgba(239,68,68,0.1)" };
    return { label: "Đang hoạt động", color: "#22c55e", bg: "rgba(34,197,94,0.1)" };
  };

  const filtered = coupons.filter((c) =>
    c.code.toLowerCase().includes(search.toLowerCase()) ||
    c.description?.toLowerCase().includes(search.toLowerCase())
  );

  const paginated = filtered.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  const thSx = {
    fontWeight: 800,
    fontSize: "0.78rem",
    color: "#1a1a1a",
    bgcolor: "#fafafa",
    borderBottom: "2px solid #f0f0f0",
    whiteSpace: "nowrap",
  };

  return (
    <AdminLayout title="Quản lý coupon">
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 3 }}>
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 900, color: "#1a1a1a" }}>
            Coupon ({coupons.length})
          </Typography>
          <Typography variant="caption" sx={{ color: "#888" }}>
            Quản lý mã giảm giá cho khách hàng
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<Plus size={18} />}
          onClick={() => {
            setEditCoupon(null);
            setFormOpen(true);
          }}
          sx={{ bgcolor: "#E60023", "&:hover": { bgcolor: "#c4001d" }, fontWeight: 700, borderRadius: 1.5, px: 2.5 }}
        >
          Tạo coupon
        </Button>
      </Box>

      <Paper elevation={0} sx={{ border: "1px solid #eee", borderRadius: 2, p: 2, mb: 2, bgcolor: "#fff" }}>
        <TextField
          size="small"
          placeholder="Tìm theo mã coupon..."
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
            width: 300,
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
                    <TableCell sx={thSx}>Mã coupon</TableCell>
                    <TableCell sx={thSx}>Loại / Giá trị</TableCell>
                    <TableCell sx={thSx}>Đơn tối thiểu</TableCell>
                    <TableCell sx={thSx}>Lượt dùng</TableCell>
                    <TableCell sx={thSx}>Hiệu lực</TableCell>
                    <TableCell sx={thSx}>Trạng thái</TableCell>
                    <TableCell sx={thSx} align="center">Thao tác</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {paginated.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} align="center" sx={{ py: 6 }}>
                        <Ticket size={40} color="#e0e0e0" />
                        <Typography variant="body2" sx={{ color: "#bbb", mt: 1 }}>
                          {search ? "Không tìm thấy coupon" : "Chưa có coupon nào"}
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ) : (
                    paginated.map((coupon) => {
                      const status = getCouponStatus(coupon);
                      return (
                        <TableRow key={coupon._id} sx={{ "&:hover": { bgcolor: "#fafafa" } }}>
                          <TableCell>
                            <Typography variant="body2" sx={{ fontWeight: 800, color: "#1a1a1a", fontFamily: "monospace", letterSpacing: 1 }}>
                              {coupon.code}
                            </Typography>
                            {coupon.description && (
                              <Typography variant="caption" sx={{ color: "#888" }}>
                                {coupon.description}
                              </Typography>
                            )}
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={
                                coupon.discountType === "percentage"
                                  ? `-${coupon.discountValue}%`
                                  : `-${formatPrice(coupon.discountValue)}`
                              }
                              size="small"
                              sx={{ bgcolor: "rgba(230,0,35,0.1)", color: "#E60023", fontWeight: 700, fontSize: "0.78rem" }}
                            />
                            {coupon.maxDiscount && (
                              <Typography variant="caption" sx={{ color: "#888", display: "block", mt: 0.3 }}>
                                Tối đa: {formatPrice(coupon.maxDiscount)}
                              </Typography>
                            )}
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2" sx={{ color: "#555", fontSize: "0.82rem" }}>
                              {coupon.minOrderAmount > 0 ? formatPrice(coupon.minOrderAmount) : "Không giới hạn"}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2" sx={{ color: "#555", fontSize: "0.82rem" }}>
                              {coupon.usedCount} / {coupon.usageLimit || "∞"}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                              <Calendar size={13} color="#aaa" />
                              <Typography variant="caption" sx={{ color: "#555" }}>
                                {formatDate(coupon.validFrom)} → {formatDate(coupon.validTo)}
                              </Typography>
                            </Box>
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={status.label}
                              size="small"
                              sx={{ bgcolor: status.bg, color: status.color, fontWeight: 700, fontSize: "0.72rem" }}
                            />
                          </TableCell>
                          <TableCell align="center">
                            <Box sx={{ display: "flex", justifyContent: "center", gap: 0.5 }}>
                              <Tooltip title="Chỉnh sửa">
                                <IconButton
                                  size="small"
                                  onClick={() => {
                                    setEditCoupon(coupon);
                                    setFormOpen(true);
                                  }}
                                  sx={{ color: "#3b82f6", "&:hover": { bgcolor: "rgba(59,130,246,0.08)" } }}
                                >
                                  <Edit2 size={16} />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title="Xóa">
                                <IconButton
                                  size="small"
                                  onClick={() => {
                                    setDeleteCoupon(coupon);
                                    setDeleteOpen(true);
                                  }}
                                  sx={{ color: "#ef4444", "&:hover": { bgcolor: "rgba(239,68,68,0.08)" } }}
                                >
                                  <Trash2 size={16} />
                                </IconButton>
                              </Tooltip>
                            </Box>
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

      <CouponFormDialog open={formOpen} onClose={() => setFormOpen(false)} editCoupon={editCoupon} onSuccess={loadCoupons} />
      <DeleteDialog open={deleteOpen} onClose={() => setDeleteOpen(false)} coupon={deleteCoupon} onConfirm={handleDelete} loading={deleteLoading} />
    </AdminLayout>
  );
};

export default AdminCoupons;

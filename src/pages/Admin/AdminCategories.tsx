import { useState, useEffect, useRef } from "react";
import {
  Box,
  Typography,
  Button,
  Paper,
  TextField,
  InputAdornment,
  IconButton,
  Avatar,
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
} from "@mui/material";
import { Search, Plus, Edit2, Trash2, X, Tag, Image } from "lucide-react";
import AdminLayout from "../../layout/AdminLayout/AdminLayout";
import axiosPickleball from "../../api/axiosPickleball";
import toast from "react-hot-toast";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";

const getImageUrl = (img?: string) => {
  if (!img) return undefined;
  if (img.startsWith("http")) return img;
  return `${API_URL}${img.startsWith("/") ? "" : "/"}${img}`;
};

interface Category {
  _id: string;
  name: string;
  slug: string;
  image?: string;
  parentId?: string | null;
  createdAt: string;
}

// =============================================
// Category Form Dialog
// =============================================
const CategoryFormDialog = ({
  open,
  onClose,
  editCategory,
  categories,
  onSuccess,
}: {
  open: boolean;
  onClose: () => void;
  editCategory: Category | null;
  categories: Category[];
  onSuccess: () => void;
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [submitting, setSubmitting] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | undefined>(undefined);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [form, setForm] = useState({ name: "", parentId: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (open) {
      if (editCategory) {
        setForm({
          name: editCategory.name || "",
          parentId: editCategory.parentId || "",
        });
        setPreviewImage(getImageUrl(editCategory.image));
      } else {
        setForm({ name: "", parentId: "" });
        setPreviewImage(undefined);
      }
      setSelectedFile(null);
      setErrors({});
    }
  }, [open, editCategory]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Ảnh không quá 5MB");
      return;
    }
    setSelectedFile(file);
    setPreviewImage(URL.createObjectURL(file));
  };

  const handleSubmit = async () => {
    if (!form.name.trim()) {
      setErrors({ name: "Vui lòng nhập tên danh mục" });
      return;
    }
    try {
      setSubmitting(true);
      const formData = new FormData();
      formData.append("name", form.name.trim());
      if (form.parentId) formData.append("parentId", form.parentId);
      if (selectedFile) formData.append("image", selectedFile);

      if (editCategory) {
        await axiosPickleball.put(`/api/category/${editCategory._id}`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        toast.success("Cập nhật danh mục thành công!");
      } else {
        await axiosPickleball.post("/api/category", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        toast.success("Thêm danh mục thành công!");
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

  const parentOptions = categories.filter((c) => c._id !== editCategory?._id);

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
          {editCategory ? "Chỉnh sửa danh mục" : "Thêm danh mục mới"}
        </Typography>
        <IconButton size="small" onClick={onClose}><X size={20} /></IconButton>
      </DialogTitle>

      <DialogContent sx={{ p: 3 }}>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
          <TextField
            fullWidth
            label="Tên danh mục *"
            value={form.name}
            onChange={(e) => {
              setForm((p) => ({ ...p, name: e.target.value }));
              setErrors({});
            }}
            error={!!errors.name}
            helperText={errors.name}
            sx={textFieldSx}
          />

          <TextField
            select
            fullWidth
            label="Danh mục cha (nếu có)"
            value={form.parentId}
            onChange={(e) => setForm((p) => ({ ...p, parentId: e.target.value }))}
            SelectProps={{ native: true }}
            sx={textFieldSx}
          >
            <option value="">-- Không có --</option>
            {parentOptions.map((c) => (
              <option key={c._id} value={c._id}>
                {c.name}
              </option>
            ))}
          </TextField>

          <Box>
            <Typography variant="caption" sx={{ color: "#666", fontWeight: 600, mb: 1, display: "block" }}>
              Hình ảnh danh mục
            </Typography>
            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
              {previewImage ? (
                <Box sx={{ position: "relative" }}>
                  <Box
                    component="img"
                    src={previewImage}
                    sx={{ width: 80, height: 80, objectFit: "cover", borderRadius: 1.5, border: "1px solid #eee" }}
                  />
                  <IconButton
                    size="small"
                    onClick={() => {
                      setPreviewImage(undefined);
                      setSelectedFile(null);
                    }}
                    sx={{ position: "absolute", top: -8, right: -8, bgcolor: "#E60023", color: "white", width: 20, height: 20, "&:hover": { bgcolor: "#c4001d" } }}
                  >
                    <X size={10} />
                  </IconButton>
                </Box>
              ) : (
                <Box
                  onClick={() => fileInputRef.current?.click()}
                  sx={{
                    width: 80,
                    height: 80,
                    border: "2px dashed #e0e0e0",
                    borderRadius: 1.5,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: "pointer",
                    "&:hover": { borderColor: "#E60023", bgcolor: "rgba(230,0,35,0.04)" },
                  }}
                >
                  <Image size={20} color="#bbb" />
                  <Typography variant="caption" sx={{ color: "#bbb", fontSize: "0.65rem", mt: 0.3 }}>
                    Tải ảnh lên
                  </Typography>
                </Box>
              )}
              <Button
                size="small"
                variant="outlined"
                onClick={() => fileInputRef.current?.click()}
                sx={{ borderColor: "#e0e0e0", color: "#555", borderRadius: 1.5, fontSize: "0.8rem" }}
              >
                {previewImage ? "Đổi ảnh" : "Chọn ảnh"}
              </Button>
            </Box>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              style={{ display: "none" }}
              onChange={handleFileChange}
            />
          </Box>
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
          {submitting ? <CircularProgress size={20} sx={{ color: "#fff" }} /> : editCategory ? "Lưu thay đổi" : "Thêm danh mục"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

// =============================================
// Delete Confirm Dialog
// =============================================
const DeleteDialog = ({
  open,
  onClose,
  category,
  onConfirm,
  loading,
}: {
  open: boolean;
  onClose: () => void;
  category: Category | null;
  onConfirm: () => void;
  loading: boolean;
}) => (
  <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth PaperProps={{ sx: { borderRadius: 2 } }}>
    <DialogTitle sx={{ fontWeight: 800, color: "#1a1a1a" }}>Xác nhận xóa</DialogTitle>
    <DialogContent>
      <Typography variant="body2" sx={{ color: "#555" }}>
        Bạn có chắc muốn xóa danh mục {" "}
        <strong style={{ color: "#1a1a1a" }}>{category?.name}</strong>?
        Hành động này không thể hoàn tác.
      </Typography>
    </DialogContent>
    <DialogActions sx={{ px: 3, pb: 2, gap: 1 }}>
      <Button onClick={onClose} sx={{ color: "#888", fontWeight: 600 }}>Hủy</Button>
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
// Main Categories Page
// =============================================
const AdminCategories = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [editCategory, setEditCategory] = useState<Category | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteCategory, setDeleteCategory] = useState<Category | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      setLoading(true);
      const res = await axiosPickleball.get("/api/category") as any;
      setCategories(Array.isArray(res) ? res : []);
    } catch {
      toast.error("Không thể tải danh mục");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteCategory) return;
    try {
      setDeleteLoading(true);
      await axiosPickleball.delete(`/api/category/${deleteCategory._id}`);
      toast.success("Xóa danh mục thành công!");
      setDeleteOpen(false);
      setDeleteCategory(null);
      loadCategories();
    } catch {
      toast.error("Xóa thất bại");
    } finally {
      setDeleteLoading(false);
    }
  };

  const filtered = categories.filter((c) => c.name.toLowerCase().includes(search.toLowerCase()));

  const getParentName = (parentId?: string | null) => {
    if (!parentId) return null;
    return categories.find((c) => c._id === parentId)?.name || null;
  };

  const thSx = {
    fontWeight: 800,
    fontSize: "0.78rem",
    color: "#1a1a1a",
    bgcolor: "#fafafa",
    borderBottom: "2px solid #f0f0f0",
  };

  return (
    <AdminLayout title="Quản lý danh mục">
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 3 }}>
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 900, color: "#1a1a1a" }}>
            Danh mục ({categories.length})
          </Typography>
          <Typography variant="caption" sx={{ color: "#888" }}>
            Quản lý danh mục sản phẩm
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<Plus size={18} />}
          onClick={() => {
            setEditCategory(null);
            setFormOpen(true);
          }}
          sx={{ bgcolor: "#E60023", "&:hover": { bgcolor: "#c4001d" }, fontWeight: 700, borderRadius: 1.5, px: 2.5 }}
        >
          Thêm danh mục
        </Button>
      </Box>

      <Paper elevation={0} sx={{ border: "1px solid #eee", borderRadius: 2, p: 2, mb: 2, bgcolor: "#fff" }}>
        <TextField
          size="small"
          placeholder="Tìm danh mục..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search size={16} color="#aaa" />
              </InputAdornment>
            ),
          }}
          sx={{
            width: 280,
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
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell sx={{ ...thSx, width: 50 }}>STT</TableCell>
                  <TableCell sx={thSx}>Ảnh</TableCell>
                  <TableCell sx={thSx}>Tên danh mục</TableCell>
                  <TableCell sx={thSx}>Slug</TableCell>
                  <TableCell sx={thSx}>Danh mục cha</TableCell>
                  <TableCell sx={thSx}>Ngày tạo</TableCell>
                  <TableCell sx={thSx} align="center">Thao tác</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filtered.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} align="center" sx={{ py: 6 }}>
                      <Tag size={40} color="#e0e0e0" />
                      <Typography variant="body2" sx={{ color: "#bbb", mt: 1 }}>
                        {search ? "Không tìm thấy danh mục" : "Chưa có danh mục nào"}
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  filtered.map((cat, idx) => {
                    const parentName = getParentName(cat.parentId);
                    return (
                      <TableRow key={cat._id} sx={{ "&:hover": { bgcolor: "#fafafa" }, transition: "background 0.15s" }}>
                        <TableCell sx={{ color: "#888", fontSize: "0.8rem" }}>{idx + 1}</TableCell>
                        <TableCell>
                          <Avatar src={getImageUrl(cat.image)} variant="rounded" sx={{ width: 40, height: 40, bgcolor: "#f5f5f5" }}>
                            <Tag size={16} color="#bbb" />
                          </Avatar>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" sx={{ fontWeight: 700, color: "#1a1a1a" }}>
                            {cat.name}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography
                            variant="caption"
                            sx={{ color: "#888", fontFamily: "monospace", bgcolor: "#f5f5f5", px: 1, py: 0.3, borderRadius: 1 }}
                          >
                            {cat.slug}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          {parentName ? (
                            <Chip label={parentName} size="small" sx={{ height: 20, fontSize: "0.68rem", bgcolor: "#f0f4ff", color: "#3b82f6" }} />
                          ) : (
                            <Typography variant="caption" sx={{ color: "#bbb" }}>—</Typography>
                          )}
                        </TableCell>
                        <TableCell>
                          <Typography variant="caption" sx={{ color: "#888" }}>
                            {new Date(cat.createdAt).toLocaleDateString("vi-VN")}
                          </Typography>
                        </TableCell>
                        <TableCell align="center">
                          <Box sx={{ display: "flex", justifyContent: "center", gap: 0.5 }}>
                            <Tooltip title="Chỉnh sửa">
                              <IconButton
                                size="small"
                                onClick={() => {
                                  setEditCategory(cat);
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
                                  setDeleteCategory(cat);
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
        )}
      </Paper>

      <CategoryFormDialog
        open={formOpen}
        onClose={() => setFormOpen(false)}
        editCategory={editCategory}
        categories={categories}
        onSuccess={loadCategories}
      />
      <DeleteDialog
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        category={deleteCategory}
        onConfirm={handleDelete}
        loading={deleteLoading}
      />
    </AdminLayout>
  );
};

export default AdminCategories;

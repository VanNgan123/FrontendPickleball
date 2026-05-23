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
  TablePagination,
} from "@mui/material";
import {
  Search,
  Plus,
  Edit2,
  Trash2,
  Image,
  X,
  Package,
  ChevronUp,
  ChevronDown,
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

const formatPrice = (price: number) => price.toLocaleString("vi-VN") + "đ";

interface Product {
  _id: string;
  name: string;
  slug: string;
  price: number;
  salePrice?: number;
  brand?: string;
  stock: number;
  categories: any[];
  image: string[];
  description?: string;
  specs?: Record<string, any>;
  createdAt: string;
}
interface Category {
  _id: string;
  name: string;
}

// =============================================
// Product Form Dialog
// =============================================
const ProductFormDialog = ({
  open,
  onClose,
  editProduct,
  categories,
  onSuccess,
}: {
  open: boolean;
  onClose: () => void;
  editProduct: Product | null;
  categories: Category[];
  onSuccess: () => void;
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [submitting, setSubmitting] = useState(false);
  const [previewImages, setPreviewImages] = useState<string[]>([]);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

  const [form, setForm] = useState({
    name: "",
    price: "",
    salePrice: "",
    brand: "",
    stock: "0",
    description: "",
    categories: [] as string[],
    specs: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (open) {
      if (editProduct) {
        setForm({
          name: editProduct.name || "",
          price: String(editProduct.price || ""),
          salePrice: String(editProduct.salePrice || ""),
          brand: editProduct.brand || "",
          stock: String(editProduct.stock || 0),
          description: editProduct.description || "",
          categories:
            editProduct.categories?.map((c: any) =>
              typeof c === "object" ? c._id : c
            ) || [],
          specs: editProduct.specs
            ? JSON.stringify(editProduct.specs, null, 2)
            : "",
        });
        setPreviewImages(editProduct.image?.map(getImageUrl).filter(Boolean) as string[]);
      } else {
        setForm({ name: "", price: "", salePrice: "", brand: "", stock: "0", description: "", categories: [], specs: "" });
        setPreviewImages([]);
      }
      setSelectedFiles([]);
      setErrors({});
    }
  }, [open, editProduct]);

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!form.name.trim()) errs.name = "Vui lòng nhập tên sản phẩm";
    if (!form.price || isNaN(Number(form.price))) errs.price = "Giá không hợp lệ";
    if (form.salePrice && isNaN(Number(form.salePrice))) errs.salePrice = "Giá khuyến mãi không hợp lệ";
    if (isNaN(Number(form.stock))) errs.stock = "Tồn kho không hợp lệ";
    if (form.specs) {
      try {
        JSON.parse(form.specs);
      } catch {
        errs.specs = "JSON không hợp lệ";
      }
    }
    return errs;
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setSelectedFiles((prev) => [...prev, ...files]);
    files.forEach((file) => {
      const url = URL.createObjectURL(file);
      setPreviewImages((prev) => [...prev, url]);
    });
  };

  const handleSubmit = async () => {
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }

    try {
      setSubmitting(true);
      const formData = new FormData();
      formData.append("name", form.name.trim());
      formData.append("price", form.price);
      if (form.salePrice) formData.append("salePrice", form.salePrice);
      if (form.brand) formData.append("brand", form.brand.trim());
      formData.append("stock", form.stock);
      if (form.description) formData.append("description", form.description.trim());
      if (form.specs) formData.append("specs", form.specs.trim());
      form.categories.forEach((c) => formData.append("categories", c));
      selectedFiles.forEach((file) => formData.append("images", file));

      if (editProduct) {
        await axiosPickleball.put(`/api/products/${editProduct._id}`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        toast.success("Cập nhật sản phẩm thành công!");
      } else {
        await axiosPickleball.post("/api/products", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        toast.success("Thêm sản phẩm thành công!");
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
        <Typography variant="h6" sx={{ fontWeight: 800, color: "#1a1a1a" }}>
          {editProduct ? "Chỉnh sửa sản phẩm" : "Thêm sản phẩm mới"}
        </Typography>
        <IconButton size="small" onClick={onClose} sx={{ color: "#888" }}>
          <X size={20} />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ p: 3 }}>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
          <TextField
            fullWidth
            label="Tên sản phẩm *"
            value={form.name}
            onChange={(e) => {
              setForm((p) => ({ ...p, name: e.target.value }));
              setErrors((p) => ({ ...p, name: "" }));
            }}
            error={!!errors.name}
            helperText={errors.name}
            sx={textFieldSx}
          />

          <Box sx={{ display: "flex", gap: 2 }}>
            <TextField
              fullWidth
              label="Giá gốc (đ) *"
              type="number"
              value={form.price}
              onChange={(e) => {
                setForm((p) => ({ ...p, price: e.target.value }));
                setErrors((p) => ({ ...p, price: "" }));
              }}
              error={!!errors.price}
              helperText={errors.price}
              sx={textFieldSx}
            />
            <TextField
              fullWidth
              label="Giá khuyến mãi (đ)"
              type="number"
              value={form.salePrice}
              onChange={(e) => setForm((p) => ({ ...p, salePrice: e.target.value }))}
              error={!!errors.salePrice}
              helperText={errors.salePrice}
              sx={textFieldSx}
            />
            <TextField
              fullWidth
              label="Tồn kho"
              type="number"
              value={form.stock}
              onChange={(e) => setForm((p) => ({ ...p, stock: e.target.value }))}
              error={!!errors.stock}
              helperText={errors.stock}
              sx={textFieldSx}
            />
          </Box>

          <TextField
            fullWidth
            label="Thương hiệu"
            value={form.brand}
            onChange={(e) => setForm((p) => ({ ...p, brand: e.target.value }))}
            sx={textFieldSx}
          />

          <Box>
            <Typography variant="caption" sx={{ color: "#666", fontWeight: 600, mb: 0.8, display: "block" }}>
              Danh mục
            </Typography>
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
              {categories.map((cat) => (
                <Chip
                  key={cat._id}
                  label={cat.name}
                  clickable
                  onClick={() => {
                    setForm((p) => ({
                      ...p,
                      categories: p.categories.includes(cat._id)
                        ? p.categories.filter((c) => c !== cat._id)
                        : [...p.categories, cat._id],
                    }));
                  }}
                  sx={{
                    bgcolor: form.categories.includes(cat._id) ? "#E60023" : "#f5f5f5",
                    color: form.categories.includes(cat._id) ? "white" : "#555",
                    fontWeight: form.categories.includes(cat._id) ? 700 : 400,
                    "&:hover": { bgcolor: form.categories.includes(cat._id) ? "#c4001d" : "#eee" },
                  }}
                />
              ))}
            </Box>
          </Box>

          <TextField
            fullWidth
            label="Mô tả sản phẩm"
            multiline
            rows={3}
            value={form.description}
            onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
            sx={textFieldSx}
          />

          <TextField
            fullWidth
            label='Thông số kỹ thuật (JSON, VD: {"Trọng lượng": "85g"})'
            multiline
            rows={3}
            value={form.specs}
            onChange={(e) => {
              setForm((p) => ({ ...p, specs: e.target.value }));
              setErrors((p) => ({ ...p, specs: "" }));
            }}
            error={!!errors.specs}
            helperText={errors.specs}
            sx={textFieldSx}
          />

          <Box>
            <Typography variant="caption" sx={{ color: "#666", fontWeight: 600, mb: 0.8, display: "block" }}>
              Hình ảnh sản phẩm (tối đa 5 ảnh)
            </Typography>
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1.5, mb: 1.5 }}>
              {previewImages.map((src, idx) => (
                <Box key={idx} sx={{ position: "relative" }}>
                  <Box
                    component="img"
                    src={src}
                    sx={{
                      width: 80,
                      height: 80,
                      objectFit: "contain",
                      border: "1px solid #eee",
                      borderRadius: 1.5,
                      bgcolor: "#fafafa",
                      p: 0.5,
                    }}
                  />
                  {!editProduct && (
                    <IconButton
                      size="small"
                      onClick={() => {
                        setPreviewImages((p) => p.filter((_, i) => i !== idx));
                        setSelectedFiles((p) => p.filter((_, i) => i !== idx));
                      }}
                      sx={{
                        position: "absolute",
                        top: -8,
                        right: -8,
                        bgcolor: "#E60023",
                        color: "white",
                        width: 20,
                        height: 20,
                        "&:hover": { bgcolor: "#c4001d" },
                      }}
                    >
                      <X size={10} />
                    </IconButton>
                  )}
                </Box>
              ))}
              {previewImages.length < 5 && (
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
                    transition: "all 0.2s",
                  }}
                >
                  <Plus size={20} color="#bbb" />
                  <Typography variant="caption" sx={{ color: "#bbb", mt: 0.3, fontSize: "0.65rem" }}>
                    Thêm ảnh
                  </Typography>
                </Box>
              )}
            </Box>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/*"
              style={{ display: "none" }}
              onChange={handleFileChange}
            />
            <Typography variant="caption" sx={{ color: "#aaa" }}>
              Định dạng: JPG, PNG, WEBP. Tối đa 5MB/ảnh
            </Typography>
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
          {submitting ? <CircularProgress size={20} sx={{ color: "#fff" }} /> : editProduct ? "Lưu thay đổi" : "Thêm sản phẩm"}
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
  product,
  onConfirm,
  loading,
}: {
  open: boolean;
  onClose: () => void;
  product: Product | null;
  onConfirm: () => void;
  loading: boolean;
}) => (
  <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth PaperProps={{ sx: { borderRadius: 2 } }}>
    <DialogTitle sx={{ fontWeight: 800, color: "#1a1a1a" }}>Xác nhận xóa</DialogTitle>
    <DialogContent>
      <Typography variant="body2" sx={{ color: "#555" }}>
        Bạn có chắc muốn xóa sản phẩm {" "}
        <strong style={{ color: "#1a1a1a" }}>{product?.name}</strong>?
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
// Main Products Page
// =============================================
const AdminProducts = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [sortField, setSortField] = useState<"name" | "price" | "stock" | "createdAt">("createdAt");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");

  const [formOpen, setFormOpen] = useState(false);
  const [editProduct, setEditProduct] = useState<Product | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteProduct, setDeleteProduct] = useState<Product | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [pRes, cRes] = await Promise.all([
        axiosPickleball.get("/api/products?limit=0") as Promise<any>,
        axiosPickleball.get("/api/category") as Promise<any>,
      ]);
      setProducts(pRes?.data || []);
      setCategories(Array.isArray(cRes) ? cRes : cRes?.data || []);
    } catch {
      toast.error("Không thể tải dữ liệu");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteProduct) return;
    try {
      setDeleteLoading(true);
      await axiosPickleball.delete(`/api/products/${deleteProduct._id}`);
      toast.success("Xóa sản phẩm thành công!");
      setDeleteOpen(false);
      setDeleteProduct(null);
      loadData();
    } catch {
      toast.error("Xóa thất bại");
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleSort = (field: typeof sortField) => {
    if (sortField === field) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDir("asc");
    }
  };

  const filtered = products
    .filter((p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.brand?.toLowerCase().includes(search.toLowerCase())
    )
    .sort((a, b) => {
      let valA: any = a[sortField];
      let valB: any = b[sortField];
      if (sortField === "createdAt") {
        valA = new Date(valA).getTime();
        valB = new Date(valB).getTime();
      }
      return sortDir === "asc" ? (valA > valB ? 1 : -1) : valA < valB ? 1 : -1;
    });

  const paginated = filtered.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  const SortIcon = ({ field }: { field: string }) => {
    if (sortField !== field) return <ChevronDown size={14} color="#ccc" />;
    return sortDir === "asc" ? <ChevronUp size={14} color="#E60023" /> : <ChevronDown size={14} color="#E60023" />;
  };

  const thSx = {
    fontWeight: 800,
    fontSize: "0.78rem",
    color: "#1a1a1a",
    bgcolor: "#fafafa",
    borderBottom: "2px solid #f0f0f0",
    cursor: "pointer",
    userSelect: "none",
    "&:hover": { bgcolor: "#f5f5f5" },
    whiteSpace: "nowrap",
  };

  return (
    <AdminLayout title="Quản lý sản phẩm">
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 3 }}>
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 900, color: "#1a1a1a" }}>
            Sản phẩm ({products.length})
          </Typography>
          <Typography variant="caption" sx={{ color: "#888" }}>
            Quản lý toàn bộ sản phẩm trong cửa hàng
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<Plus size={18} />}
          onClick={() => {
            setEditProduct(null);
            setFormOpen(true);
          }}
          sx={{ bgcolor: "#E60023", "&:hover": { bgcolor: "#c4001d" }, fontWeight: 700, borderRadius: 1.5, px: 2.5 }}
        >
          Thêm sản phẩm
        </Button>
      </Box>

      <Paper elevation={0} sx={{ border: "1px solid #eee", borderRadius: 2, p: 2, mb: 2, bgcolor: "#fff" }}>
        <TextField
          size="small"
          placeholder="Tìm theo tên, thương hiệu..."
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
            width: 320,
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
                    <TableCell sx={{ ...thSx, width: 60 }}>STT</TableCell>
                    <TableCell sx={thSx}>Ảnh</TableCell>
                    <TableCell sx={thSx} onClick={() => handleSort("name")}>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                        Tên sản phẩm <SortIcon field="name" />
                      </Box>
                    </TableCell>
                    <TableCell sx={thSx}>Danh mục</TableCell>
                    <TableCell sx={thSx} onClick={() => handleSort("price")}>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                        Giá <SortIcon field="price" />
                      </Box>
                    </TableCell>
                    <TableCell sx={thSx} onClick={() => handleSort("stock")}>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                        Tồn kho <SortIcon field="stock" />
                      </Box>
                    </TableCell>
                    <TableCell sx={thSx} align="center">Thao tác</TableCell>
                  </TableRow>
                </TableHead>

                <TableBody>
                  {paginated.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} align="center" sx={{ py: 6 }}>
                        <Package size={40} color="#e0e0e0" />
                        <Typography variant="body2" sx={{ color: "#bbb", mt: 1 }}>
                          {search ? "Không tìm thấy sản phẩm" : "Chưa có sản phẩm nào"}
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ) : (
                    paginated.map((product, idx) => (
                      <TableRow key={product._id} sx={{ "&:hover": { bgcolor: "#fafafa" }, transition: "background 0.15s" }}>
                        <TableCell sx={{ color: "#888", fontSize: "0.8rem" }}>
                          {page * rowsPerPage + idx + 1}
                        </TableCell>
                        <TableCell>
                          <Avatar
                            src={getImageUrl(product.image?.[0])}
                            variant="rounded"
                            sx={{ width: 44, height: 44, bgcolor: "#f5f5f5" }}
                          >
                            <Image size={18} color="#bbb" />
                          </Avatar>
                        </TableCell>
                        <TableCell>
                          <Typography
                            variant="body2"
                            sx={{
                              fontWeight: 700,
                              color: "#1a1a1a",
                              maxWidth: 260,
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                            }}
                          >
                            {product.name}
                          </Typography>
                          {product.brand && (
                            <Typography variant="caption" sx={{ color: "#888" }}>
                              {product.brand}
                            </Typography>
                          )}
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: "flex", gap: 0.5, flexWrap: "wrap" }}>
                            {(product.categories || []).slice(0, 2).map((cat: any) => (
                              <Chip
                                key={typeof cat === "object" ? cat._id : cat}
                                label={typeof cat === "object" ? cat.name : cat}
                                size="small"
                                sx={{ height: 20, fontSize: "0.68rem", bgcolor: "#f5f5f5", color: "#555" }}
                              />
                            ))}
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" sx={{ fontWeight: 700, color: "#E60023" }}>
                            {formatPrice(product.salePrice || product.price)}
                          </Typography>
                          {product.salePrice && (
                            <Typography variant="caption" sx={{ color: "#bbb", textDecoration: "line-through" }}>
                              {formatPrice(product.price)}
                            </Typography>
                          )}
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={product.stock}
                            size="small"
                            sx={{
                              fontWeight: 700,
                              fontSize: "0.75rem",
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
                        </TableCell>
                        <TableCell align="center">
                          <Box sx={{ display: "flex", justifyContent: "center", gap: 0.5 }}>
                            <Tooltip title="Chỉnh sửa">
                              <IconButton
                                size="small"
                                onClick={() => {
                                  setEditProduct(product);
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
                                  setDeleteProduct(product);
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
                    ))
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
              sx={{ borderTop: "1px solid #f0f0f0", "& .MuiTablePagination-toolbar": { fontSize: "0.82rem" } }}
            />
          </>
        )}
      </Paper>

      <ProductFormDialog
        open={formOpen}
        onClose={() => setFormOpen(false)}
        editProduct={editProduct}
        categories={categories}
        onSuccess={loadData}
      />
      <DeleteDialog
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        product={deleteProduct}
        onConfirm={handleDelete}
        loading={deleteLoading}
      />
    </AdminLayout>
  );
};

export default AdminProducts;

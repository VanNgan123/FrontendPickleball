import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Breadcrumbs,
  Button,
  Chip,
  CircularProgress,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  IconButton,
  InputAdornment,
  Paper,
  TextField,
  Typography,
} from "@mui/material";
import {
  ArrowRight,
  Heart,
  Search,
  ShoppingCart,
  Sparkles,
  Trash2,
} from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import toast from "react-hot-toast";
import MainLayout from "../../layout/MainLayout/MainLayout";
import wishlistService from "../../services/wishlistService";
import { addToCart } from "../../store/slices/cartSlice";
import type { AppDispatch, RootState } from "../../store/store";
import type { Product } from "../../types";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";

const getImageUrl = (path?: string) => {
  if (!path) return "/product-placeholder.svg";
  if (path.startsWith("http")) return path;
  return `${API_URL.replace(/\/+$/, "")}/${path.replace(/^\/+/, "").replace(/\\/g, "/")}`;
};

const getErrorMessage = (error: unknown, fallback: string) => {
  const apiError = error as { response?: { data?: { message?: string } }; message?: string };
  return apiError.response?.data?.message || apiError.message || fallback;
};

const formatPrice = (value: number) => `${value.toLocaleString("vi-VN")}đ`;

const Wishlist = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const cartLoading = useSelector((state: RootState) => state.cart.actionLoading);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [removingId, setRemovingId] = useState<string | null>(null);
  const [addingId, setAddingId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [confirmClear, setConfirmClear] = useState(false);
  const [clearing, setClearing] = useState(false);

  useEffect(() => {
    const loadWishlist = async () => {
      try {
        const response = await wishlistService.getWishlist();
        setProducts(response.data?.products || []);
      } catch (error) {
        toast.error(getErrorMessage(error, "Không thể tải danh sách yêu thích"));
      } finally {
        setLoading(false);
      }
    };
    void loadWishlist();
  }, []);

  const visibleProducts = useMemo(() => {
    const keyword = search.trim().toLowerCase();
    if (!keyword) return products;
    return products.filter(
      (product) =>
        product.name.toLowerCase().includes(keyword) ||
        product.brand?.toLowerCase().includes(keyword)
    );
  }, [products, search]);

  const removeProduct = async (product: Product) => {
    try {
      setRemovingId(product._id);
      await wishlistService.removeFromWishlist(product._id);
      setProducts((current) => current.filter((item) => item._id !== product._id));
      toast.success("Đã xóa khỏi danh sách yêu thích");
    } catch (error) {
      toast.error(getErrorMessage(error, "Không thể xóa sản phẩm"));
    } finally {
      setRemovingId(null);
    }
  };

  const addProductToCart = async (product: Product) => {
    if (product.stock <= 0) return;
    try {
      setAddingId(product._id);
      await dispatch(addToCart({ productId: product._id, qty: 1 })).unwrap();
      toast.success("Đã thêm sản phẩm vào giỏ hàng");
    } catch (error) {
      toast.error(typeof error === "string" ? error : "Không thể thêm vào giỏ hàng");
    } finally {
      setAddingId(null);
    }
  };

  const clearWishlist = async () => {
    try {
      setClearing(true);
      await wishlistService.clearWishlist();
      setProducts([]);
      setConfirmClear(false);
      toast.success("Đã xóa toàn bộ danh sách yêu thích");
    } catch (error) {
      toast.error(getErrorMessage(error, "Không thể xóa danh sách yêu thích"));
    } finally {
      setClearing(false);
    }
  };

  return (
    <MainLayout>
      <Box
        sx={{
          minHeight: "70vh",
          bgcolor: "#f8fafc",
          backgroundImage:
            "radial-gradient(900px 360px at 0% 0%, rgba(132,204,22,.12), transparent 60%), radial-gradient(700px 300px at 100% 0%, rgba(37,99,235,.10), transparent 60%)",
          py: { xs: 4, md: 6 },
        }}
      >
        <Container maxWidth="lg">
          <Breadcrumbs sx={{ mb: 2, color: "#64748b" }}>
            <Typography variant="body2" onClick={() => navigate("/")} sx={{ cursor: "pointer", "&:hover": { color: "#3f7d12" } }}>Trang chủ</Typography>
            <Typography variant="body2" sx={{ color: "#0f172a", fontWeight: 700 }}>Yêu thích</Typography>
          </Breadcrumbs>

          <Paper
            elevation={0}
            sx={{
              mb: 3,
              p: { xs: 2.5, md: 3.5 },
              borderRadius: 4,
              color: "white",
              overflow: "hidden",
              position: "relative",
              background: "linear-gradient(120deg, #0f172a 0%, #1e3a5f 62%, #3f7d12 140%)",
            }}
          >
            <Box sx={{ position: "absolute", width: 220, height: 220, borderRadius: "50%", bgcolor: "rgba(132,204,22,.12)", right: -55, top: -95 }} />
            <Box sx={{ position: "relative", display: "flex", alignItems: { xs: "flex-start", sm: "center" }, justifyContent: "space-between", flexDirection: { xs: "column", sm: "row" }, gap: 2 }}>
              <Box>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
                  <Heart size={26} fill="#84cc16" color="#84cc16" />
                  <Typography variant="overline" sx={{ color: "#bef264", fontWeight: 900, letterSpacing: 1.8 }}>Bộ sưu tập của bạn</Typography>
                </Box>
                <Typography variant="h4" sx={{ fontWeight: 900, fontSize: { xs: "1.75rem", md: "2.25rem" } }}>Danh sách yêu thích</Typography>
                <Typography variant="body2" sx={{ color: "rgba(255,255,255,.7)", mt: 0.75 }}>Lưu lại những sản phẩm bạn quan tâm để dễ dàng tìm mua sau.</Typography>
              </Box>
              <Chip icon={<Sparkles size={16} />} label={`${products.length} sản phẩm`} sx={{ bgcolor: "rgba(255,255,255,.12)", color: "white", fontWeight: 800, border: "1px solid rgba(255,255,255,.16)" }} />
            </Box>
          </Paper>

          {loading ? (
            <Box sx={{ minHeight: 340, display: "grid", placeItems: "center" }}><CircularProgress /></Box>
          ) : products.length === 0 ? (
            <Paper elevation={0} sx={{ textAlign: "center", borderRadius: 4, border: "1px solid #e2e8f0", py: { xs: 7, md: 10 }, px: 2 }}>
              <Box sx={{ width: 82, height: 82, borderRadius: "50%", bgcolor: "#f1f5f9", color: "#94a3b8", display: "grid", placeItems: "center", mx: "auto", mb: 2.5 }}><Heart size={38} /></Box>
              <Typography variant="h5" sx={{ fontWeight: 900, color: "#0f172a" }}>Danh sách yêu thích đang trống</Typography>
              <Typography variant="body2" sx={{ color: "#64748b", mt: 1, mb: 3, maxWidth: 430, mx: "auto" }}>Khám phá các sản phẩm Pickleball và nhấn biểu tượng trái tim để lưu sản phẩm bạn yêu thích.</Typography>
              <Button variant="contained" endIcon={<ArrowRight size={18} />} onClick={() => navigate("/products")} sx={{ bgcolor: "#3f7d12", px: 3, py: 1.2, fontWeight: 800, "&:hover": { bgcolor: "#315f0e" } }}>Khám phá sản phẩm</Button>
            </Paper>
          ) : (
            <>
              <Paper elevation={0} sx={{ p: 2, mb: 3, border: "1px solid #e2e8f0", borderRadius: 3, display: "flex", gap: 1.5, justifyContent: "space-between", flexDirection: { xs: "column", sm: "row" } }}>
                <TextField
                  size="small"
                  placeholder="Tìm trong danh sách yêu thích..."
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  sx={{ maxWidth: { sm: 420 }, flex: 1 }}
                  slotProps={{ input: { startAdornment: <InputAdornment position="start"><Search size={18} /></InputAdornment> } }}
                />
                <Button color="error" startIcon={<Trash2 size={17} />} onClick={() => setConfirmClear(true)} sx={{ textTransform: "none", fontWeight: 800 }}>Xóa tất cả</Button>
              </Paper>

              <Grid container spacing={2.5}>
                {visibleProducts.map((product) => {
                  const price = product.salePrice || product.price;
                  const discount = product.salePrice ? Math.round(((product.price - product.salePrice) / product.price) * 100) : 0;
                  return (
                    <Grid key={product._id} size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
                      <Paper elevation={0} sx={{ height: "100%", borderRadius: 3, border: "1px solid #e2e8f0", overflow: "hidden", transition: ".25s", display: "flex", flexDirection: "column", "&:hover": { transform: "translateY(-4px)", boxShadow: "0 18px 35px -22px rgba(15,23,42,.55)" } }}>
                        <Box sx={{ position: "relative", pt: "82%", bgcolor: "#f8fafc", cursor: "pointer" }} onClick={() => navigate(`/product/${product._id}`)}>
                          <Box component="img" src={getImageUrl(product.image?.[0])} alt={product.name} sx={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "contain", p: 1.5 }} />
                          {discount > 0 && <Chip label={`-${discount}%`} size="small" sx={{ position: "absolute", left: 12, top: 12, bgcolor: "#e11d48", color: "white", fontWeight: 900 }} />}
                          <IconButton aria-label="Xóa khỏi yêu thích" disabled={removingId === product._id} onClick={(event) => { event.stopPropagation(); void removeProduct(product); }} sx={{ position: "absolute", right: 10, top: 10, bgcolor: "white", color: "#e11d48", boxShadow: "0 4px 15px rgba(15,23,42,.12)", "&:hover": { bgcolor: "#fff1f2" } }}>
                            {removingId === product._id ? <CircularProgress size={19} /> : <Heart size={19} fill="currentColor" />}
                          </IconButton>
                        </Box>
                        <Box sx={{ p: 2, display: "flex", flexDirection: "column", flex: 1 }}>
                          <Typography variant="caption" sx={{ color: "#64748b", fontWeight: 800, textTransform: "uppercase", letterSpacing: .7 }}>{product.brand || "Pickleball"}</Typography>
                          <Typography onClick={() => navigate(`/product/${product._id}`)} variant="body2" sx={{ mt: .5, color: "#0f172a", fontWeight: 800, lineHeight: 1.45, minHeight: "2.9em", cursor: "pointer", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{product.name}</Typography>
                          <Box sx={{ mt: 1.5, mb: 2 }}>
                            <Typography sx={{ color: "#e11d48", fontWeight: 900 }}>{formatPrice(price)}</Typography>
                            {product.salePrice && <Typography variant="caption" sx={{ color: "#94a3b8", textDecoration: "line-through" }}>{formatPrice(product.price)}</Typography>}
                          </Box>
                          <Button fullWidth variant="contained" disabled={product.stock <= 0 || cartLoading || addingId === product._id} onClick={() => void addProductToCart(product)} startIcon={addingId !== product._id ? <ShoppingCart size={17} /> : undefined} sx={{ mt: "auto", bgcolor: "#0f172a", fontWeight: 800, textTransform: "none", "&:hover": { bgcolor: "#3f7d12" } }}>
                            {addingId === product._id ? <CircularProgress size={20} color="inherit" /> : product.stock <= 0 ? "Hết hàng" : "Thêm vào giỏ"}
                          </Button>
                        </Box>
                      </Paper>
                    </Grid>
                  );
                })}
              </Grid>
              {visibleProducts.length === 0 && <Paper elevation={0} sx={{ mt: 2, py: 7, textAlign: "center", border: "1px dashed #cbd5e1", borderRadius: 3, color: "#64748b" }}>Không tìm thấy sản phẩm phù hợp.</Paper>}
            </>
          )}
        </Container>
      </Box>

      <Dialog open={confirmClear} onClose={() => !clearing && setConfirmClear(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 900 }}>Xóa toàn bộ danh sách?</DialogTitle>
        <DialogContent><Typography variant="body2" color="text.secondary">Tất cả sản phẩm đã lưu sẽ bị xóa khỏi danh sách yêu thích.</Typography></DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5 }}>
          <Button onClick={() => setConfirmClear(false)} disabled={clearing}>Hủy</Button>
          <Button variant="contained" color="error" onClick={() => void clearWishlist()} disabled={clearing}>{clearing ? <CircularProgress size={20} color="inherit" /> : "Xóa tất cả"}</Button>
        </DialogActions>
      </Dialog>
    </MainLayout>
  );
};

export default Wishlist;

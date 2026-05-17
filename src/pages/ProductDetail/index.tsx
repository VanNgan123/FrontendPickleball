import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Box, Container, Typography, Button, Chip, Divider, CircularProgress,
  Paper, IconButton, Rating, Grid, Dialog, DialogContent, Checkbox, FormControlLabel,
} from "@mui/material";
import {
  ChevronLeft, ChevronRight, ShoppingCart, Heart, Share2,
  Minus, Plus, Star, Truck, Shield, RotateCcw, CheckCircle,
  Camera, Video, X,
} from "lucide-react";

import MainLayout from "../../layout/MainLayout/MainLayout";
import ProductCard from "../../components/ProductCard";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "../../store/store";
import {
  fetchProductById, clearCurrentProduct, fetchAllProducts,
} from "../../store/slices/productSlice";
import { addToCart } from "../../store/slices/cartSlice";
import reviewService from "../../services/reviewService";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";

const ProductDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const similarRef = useRef<HTMLDivElement>(null);

  const { currentProduct: product, detailLoading: loading, products } =
    useSelector((state: RootState) => state.products);

  const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated);
  const cartActionLoading = useSelector((state: RootState) => state.cart.actionLoading);

  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [selectedColor, setSelectedColor] = useState("Hồng");
  const [showFullDescription, setShowFullDescription] = useState(false);
  const [showReviewDialog, setShowReviewDialog] = useState(false);
  const [reviewRating, setReviewRating] = useState<number | null>(null);
  const [reviewText, setReviewText] = useState("");
  const [reviewError, setReviewError] = useState<string | null>(null);
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [selectedStarFilter, setSelectedStarFilter] = useState<string>("all");
  const colors = ["Hồng", "Trắng", "Xanh Dương", "Xanh lá", "Đen", "Đỏ"];

  useEffect(() => {
    window.scrollTo(0, 0);
    if (id) dispatch(fetchProductById(id));
    dispatch(fetchAllProducts());
    return () => { dispatch(clearCurrentProduct()); };
  }, [id, dispatch]);

  useEffect(() => {
    const elements = Array.from(document.querySelectorAll("[data-reveal]"));
    if (elements.length === 0) return undefined;

    const observer = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            obs.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.18, rootMargin: "0px 0px -10% 0px" },
    );

    elements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [product?._id]);

  const getImageUrl = (imagePath?: string) => {
    if (!imagePath) return "https://via.placeholder.com/600x600?text=No+Image";
    if (imagePath.startsWith("http")) return imagePath;
    const baseUrl = API_URL.replace(/\/+$/, "");
    const path = imagePath.startsWith("/") ? imagePath : `/${imagePath}`;
    return `${baseUrl}${path.replace(/\\/g, "/")}`;
  };

  const formatPrice = (price: number) => price.toLocaleString("vi-VN") + "đ";

  const discount = product?.salePrice
    ? Math.round(((product.price - product.salePrice) / product.price) * 100)
    : 0;

  const scrollSimilar = (dir: "left" | "right") => {
    similarRef.current?.scrollBy({ left: dir === "left" ? -300 : 300, behavior: "smooth" });
  };

  const similarProducts = products.filter((p) => p._id !== id).slice(0, 6);

  // Handler: Thêm vào giỏ
  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }
    if (!product?._id) return;
    try {
      await dispatch(addToCart({ productId: product._id, qty: quantity })).unwrap();
      alert("Đã thêm vào giỏ hàng!");
    } catch (error: any) {
      alert(error || "Thêm vào giỏ thất bại");
    }
  };

  // Handler: Mua ngay
  const handleBuyNow = async () => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }
    if (!product?._id) return;
    try {
      await dispatch(addToCart({ productId: product._id, qty: quantity })).unwrap();
      navigate("/cart");
    } catch (error: any) {
      alert(error || "Thêm vào giỏ thất bại");
    }
  };

  const handleSubmitReview = async () => {
    if (!product?._id) return;
    if (!reviewRating) {
      setReviewError("Vui long chon so sao danh gia.");
      return;
    }
    if (reviewText.trim().length < 10) {
      setReviewError("Noi dung danh gia toi thieu 10 ky tu.");
      return;
    }

    try {
      setReviewSubmitting(true);
      setReviewError(null);
      await reviewService.createReview({
        productId: product._id,
        rating: reviewRating,
        comment: reviewText.trim(),
      });
      setReviewText("");
      setReviewRating(null);
      setShowReviewDialog(false);
    } catch (error: any) {
      setReviewError(error?.response?.data?.message || "Gui danh gia that bai.");
    } finally {
      setReviewSubmitting(false);
    }
  };

  if (loading) {
    return (
      <>
        <MainLayout>
          <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "60vh" }}>
            <CircularProgress color="primary" size={50} />
          </Box>
        </MainLayout>
      </>
    );
  }

  if (!product) {
    return (
      <>
        <MainLayout>
          <Container maxWidth="lg" sx={{ py: 10, textAlign: "center" }}>
            <Typography variant="h5" sx={{ fontWeight: 700, mb: 2, color: "#1a1a1a" }}>
              Không tìm thấy sản phẩm
            </Typography>
            <Button variant="contained" onClick={() => navigate("/")}
              sx={{ bgcolor: "#E60023", "&:hover": { bgcolor: "#c4001d" }, fontWeight: 700 }}>
              Về trang chủ
            </Button>
          </Container>
        </MainLayout>
      </>
    );
  }

  const images = product.image && product.image.length > 0 ? product.image : [];
  const saving = product.salePrice ? product.price - product.salePrice : 0;

  return (
    <>
      <MainLayout>
        <Box
          sx={{
            bgcolor: "#eef2ff",
            backgroundImage:
              "radial-gradient(1200px 500px at 10% -10%, rgba(59,130,246,0.15), transparent 60%), radial-gradient(900px 400px at 90% 0%, rgba(132,204,22,0.18), transparent 55%)",
            py: { xs: 3, md: 4 },
          }}
        >
          <Container maxWidth="lg" sx={{ pb: { xs: 10, md: 12 } }}>
          {/* Breadcrumbs */}
          <Typography variant="caption" sx={{ color: "text.secondary", textTransform: "uppercase", mb: 2, display: "block" }}>
            <span style={{ cursor: "pointer" }} onClick={() => navigate("/")}>TRANG CHỦ</span>
            {" / "}
            <span style={{ cursor: "pointer" }}>
              {typeof product.categories?.[0] === "object" ? (product.categories[0] as any)?.name : product.categories?.[0] || "SẢN PHẨM"}
            </span>
          </Typography>

          {/* Main Product Section */}
          <Paper
            elevation={0}
            sx={{
              p: { xs: 2.5, md: 3.5 },
              border: "1px solid #e6e8f0",
              mb: 4,
              bgcolor: "rgba(255,255,255,0.95)",
              borderRadius: 3,
              boxShadow: "0 24px 60px -40px rgba(15,23,42,0.6)",
              backdropFilter: "blur(8px)",
            }}
            data-reveal
            className="reveal"
          >
            <Grid container spacing={4}>
              {/* Left: Images */}
              <Grid size={{ xs: 12, md: 6 }}>
                <Box
                  sx={{
                    display: { xs: "block", md: "grid" },
                    gridTemplateColumns: { md: "88px 1fr" },
                    gap: 2,
                    alignItems: "start",
                  }}
                >
                  {images.length > 1 && (
                    <Box
                      sx={{
                        display: "flex",
                        flexDirection: { xs: "row", md: "column" },
                        gap: 1,
                        overflowX: { xs: "auto", md: "visible" },
                        "&::-webkit-scrollbar": { display: "none" },
                      }}
                    >
                      {images.map((img, idx) => (
                        <Box
                          key={idx}
                          onClick={() => setSelectedImage(idx)}
                          sx={{
                            width: 80,
                            height: 80,
                            cursor: "pointer",
                            flexShrink: 0,
                            p: 0.5,
                            borderRadius: 2,
                            border: selectedImage === idx ? "2px solid #84cc16" : "1px solid #e2e8f0",
                            bgcolor: selectedImage === idx ? "rgba(132,204,22,0.08)" : "#fff",
                          }}
                        >
                          <Box
                            component="img"
                            src={getImageUrl(img)}
                            alt={`Thumb ${idx + 1}`}
                            sx={{ width: "100%", height: "100%", objectFit: "contain" }}
                          />
                        </Box>
                      ))}
                    </Box>
                  )}
                  <Box sx={{ position: "relative" }}>
                    {discount > 0 && (
                      <Chip label={`-${discount}%`} sx={{ position: "absolute", top: 16, left: 16, bgcolor: "#a3e635", fontWeight: "bold", borderRadius: 1, zIndex: 1 }} size="small" />
                    )}
                    <Box
                      sx={{
                        border: "1px solid #e2e8f0",
                        borderRadius: 3,
                        p: { xs: 1.5, md: 2.5 },
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        aspectRatio: "1/1",
                        bgcolor: "#f8fafc",
                        position: "relative",
                        overflow: "hidden",
                      }}
                    >
                      <Box
                        sx={{
                          position: "absolute",
                          inset: 0,
                          background:
                            "radial-gradient(circle at 20% 20%, rgba(99,102,241,0.12), transparent 45%), radial-gradient(circle at 80% 10%, rgba(16,185,129,0.12), transparent 40%)",
                          zIndex: 0,
                        }}
                      />
                      <Box
                        component="img"
                        src={images.length > 0 ? getImageUrl(images[selectedImage]) : "https://via.placeholder.com/600x600?text=No+Image"}
                        alt={product.name}
                        sx={{
                          maxWidth: "100%",
                          maxHeight: "100%",
                          objectFit: "contain",
                          position: "relative",
                          zIndex: 1,
                          transition: "transform 0.4s ease",
                          "&:hover": { transform: "scale(1.04)" },
                        }}
                      />
                    </Box>
                  </Box>
                </Box>
              </Grid>

              {/* Right: Info */}
              <Grid size={{ xs: 12, md: 6 }}>
                {product.brand && (
                  <Typography variant="caption" sx={{ fontWeight: 700, color: "#999", textTransform: "uppercase", letterSpacing: 2, mb: 0.5, display: "block" }}>
                    {product.brand}
                  </Typography>
                )}
                <Box sx={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 2 }}>
                  <Typography variant="h5" sx={{ fontWeight: 800, mb: 1, color: "#0f172a" }}>
                    {product.name}
                  </Typography>
                  <Box sx={{ display: "flex", gap: 1 }}>
                    <IconButton sx={{ bgcolor: "#f1f5f9", "&:hover": { bgcolor: "#e2e8f0" } }}>
                      <Heart size={18} />
                    </IconButton>
                    <IconButton sx={{ bgcolor: "#f1f5f9", "&:hover": { bgcolor: "#e2e8f0" } }}>
                      <Share2 size={18} />
                    </IconButton>
                  </Box>
                </Box>

                {/* Rating */}
                <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
                  <Rating value={0} readOnly size="small" />
                  <Typography variant="body2" sx={{ color: "#888" }}>(đánh giá) | Đã bán 0</Typography>
                </Box>

                {/* Price Box */}
                <Box
                  sx={{
                    background: "linear-gradient(120deg, #0f172a, #1d4ed8)",
                    borderRadius: 3,
                    p: 2.5,
                    color: "white",
                    mb: 3,
                    position: "relative",
                    overflow: "hidden",
                  }}
                >
                  <Box
                    sx={{
                      position: "absolute",
                      inset: 0,
                      background: "radial-gradient(circle at 20% 20%, rgba(132,204,22,0.4), transparent 40%)",
                      opacity: 0.6,
                    }}
                  />
                  <Typography variant="body2">Giá khuyến mãi:</Typography>
                  <Box sx={{ display: "flex", alignItems: "baseline", gap: 2 }}>
                    <Typography variant="h4" sx={{ fontWeight: "bold", color: "#f97316" }}>
                      {formatPrice(product.salePrice || product.price)}
                    </Typography>
                    {product.salePrice && (
                      <Typography variant="body1" sx={{ textDecoration: "line-through", color: "rgba(255,255,255,0.7)" }}>
                        {formatPrice(product.price)}
                      </Typography>
                    )}
                  </Box>
                  {saving > 0 && (
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      Tiết kiệm: {formatPrice(saving)}
                    </Typography>
                  )}
                </Box>

                {/* Extra Offers */}
                <Box sx={{ bgcolor: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 2, mb: 3 }}>
                  <Box sx={{ bgcolor: "#a3e635", display: "inline-block", px: 2, py: 0.5, borderTopLeftRadius: 4, borderBottomRightRadius: 8, fontWeight: "bold", fontSize: "0.875rem", color: "black" }}>
                    Ưu đãi thêm:
                  </Box>
                  <Box sx={{ p: 2 }}>
                    <Box sx={{ display: "flex", gap: 1, alignItems: "flex-start", mb: 1 }}>
                      <CheckCircle size={16} color="#25D366" style={{ marginTop: 3, flexShrink: 0 }} />
                      <Typography variant="body2" sx={{ color: "#555" }}>
                        Freeship toàn quốc đơn hàng trên 2.000.000 vnđ khi thanh toán trước
                      </Typography>
                    </Box>
                    <Box sx={{ display: "flex", gap: 1, alignItems: "flex-start" }}>
                      <Shield size={16} color="#25D366" style={{ marginTop: 3, flexShrink: 0 }} />
                      <Typography variant="body2" sx={{ color: "#555" }}>
                        Bảo hành chính hãng 12 tháng
                      </Typography>
                    </Box>
                  </Box>
                </Box>

                {/* Colors */}
                <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 3 }}>
                  <Typography variant="body2" sx={{ fontWeight: "bold", width: 60, color: "#1a1a1a" }}>Màu sắc</Typography>
                  <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                    {colors.map((color) => (
                      <Button
                        key={color}
                        variant={selectedColor === color ? "outlined" : "text"}
                        onClick={() => setSelectedColor(color)}
                        sx={{
                          border: "1px solid",
                          borderColor: selectedColor === color ? "primary.main" : "#e2e8f0",
                          color: selectedColor === color ? "primary.main" : "#555",
                          bgcolor: selectedColor === color ? "rgba(230,0,35,0.05)" : "transparent",
                          minWidth: "auto", px: 2, py: 0.5,
                        }}
                      >
                        {color}
                      </Button>
                    ))}
                  </Box>
                </Box>

                {/* Stock */}
                <Typography variant="body2" sx={{ color: "#666", mb: 2 }}>
                  Tình trạng:{" "}
                  <Typography component="span" sx={{ fontWeight: 700, color: product.stock > 0 ? "#25D366" : "#E60023" }}>
                    {product.stock > 0 ? `Còn hàng (${product.stock})` : "Hết hàng"}
                  </Typography>
                </Typography>

                {/* Quantity */}
                <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 3 }}>
                  <Typography variant="body2" sx={{ fontWeight: "bold", color: "#1a1a1a" }}>Số lượng</Typography>
                  <Box sx={{ display: "flex", alignItems: "center", border: "2px solid #e2e8f0", borderRadius: 2 }}>
                    <IconButton size="small" onClick={() => setQuantity(Math.max(1, quantity - 1))} sx={{ color: "#1a1a1a" }}>
                      <Minus size={16} />
                    </IconButton>
                    <Typography sx={{ px: 3, fontWeight: 700, fontSize: "1rem", minWidth: 40, textAlign: "center", color: "#1a1a1a" }}>
                      {quantity}
                    </Typography>
                    <IconButton size="small" onClick={() => setQuantity(Math.min(product.stock, quantity + 1))} sx={{ color: "#1a1a1a" }}>
                      <Plus size={16} />
                    </IconButton>
                  </Box>
                </Box>

                {/* Action Buttons */}
                <Grid container spacing={2} sx={{ mb: 2 }}>
                  <Grid size={6}>
                    <Button
                      variant="contained"
                      fullWidth
                      disabled={product.stock === 0 || cartActionLoading}
                      onClick={handleBuyNow}
                      sx={{ py: 1.5, fontWeight: 800, bgcolor: "#e11d48", "&:hover": { bgcolor: "#be123c" } }}
                    >
                      {cartActionLoading ? <CircularProgress size={22} color="inherit" /> : "MUA NGAY"}
                    </Button>
                  </Grid>
                  <Grid size={6}>
                    <Button
                      variant="outlined"
                      fullWidth
                      disabled={product.stock === 0 || cartActionLoading}
                      onClick={handleAddToCart}
                      startIcon={!cartActionLoading ? <ShoppingCart size={18} /> : undefined}
                      sx={{
                        py: 1.5, fontWeight: 800,
                        color: "#0f172a", borderColor: "#0f172a",
                        "&:hover": { bgcolor: "#0f172a", color: "#fff", borderColor: "#0f172a" },
                      }}
                    >
                      {cartActionLoading ? <CircularProgress size={22} color="inherit" /> : "THÊM VÀO GIỎ"}
                    </Button>
                  </Grid>
                </Grid>

                <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "repeat(3, 1fr)" }, gap: 1.5, mb: 3 }}>
                  <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: "#f8fafc", border: "1px solid #e2e8f0", display: "flex", gap: 1.5, alignItems: "center" }}>
                    <Truck size={18} color="#0ea5e9" />
                    <Typography variant="caption" sx={{ color: "#334155", fontWeight: 600 }}>
                      Giao nhanh 2-3 ngày
                    </Typography>
                  </Box>
                  <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: "#f8fafc", border: "1px solid #e2e8f0", display: "flex", gap: 1.5, alignItems: "center" }}>
                    <Shield size={18} color="#22c55e" />
                    <Typography variant="caption" sx={{ color: "#334155", fontWeight: 600 }}>
                      Bảo hành chính hãng 12 tháng
                    </Typography>
                  </Box>
                  <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: "#f8fafc", border: "1px solid #e2e8f0", display: "flex", gap: 1.5, alignItems: "center" }}>
                    <RotateCcw size={18} color="#f97316" />
                    <Typography variant="caption" sx={{ color: "#334155", fontWeight: 600 }}>
                      Đổi trả trong 7 ngày
                    </Typography>
                  </Box>
                </Box>

                {/* Contact Buttons */}
                <Grid container spacing={2}>
                  <Grid size={6}>
                    <Button variant="outlined" fullWidth sx={{ color: "#1a1a1a", borderColor: "#ccc" }}>
                      Tư vấn qua <Box component="span" sx={{ color: "#3b82f6", fontWeight: "bold", ml: 0.5 }}>Zalo</Box>
                    </Button>
                  </Grid>
                  <Grid size={6}>
                    <Button variant="outlined" fullWidth sx={{ color: "#1a1a1a", borderColor: "#ccc" }}>
                      Tư vấn qua <Box component="span" sx={{ color: "#2563eb", fontWeight: "bold", ml: 0.5 }}>Facebook</Box>
                    </Button>
                  </Grid>
                </Grid>
              </Grid>
            </Grid>
          </Paper>

          {/* Details Section */}
          {(product.description || (product.specs && Object.keys(product.specs).length > 0)) && (
            <Paper elevation={0} sx={{ p: 0, border: "1px solid #e0e0e0", mb: 4, bgcolor: "#fff", borderRadius: 3, overflow: "hidden" }} data-reveal className="reveal">
              {/* Tab Header */}
              <Box sx={{ borderBottom: "2px solid #eee", display: "flex", justifyContent: "center", pt: 3 }}>
                <Box sx={{
                  bgcolor: "#002c4b", color: "white", px: 5, py: 1.2,
                  borderTopLeftRadius: 6, borderTopRightRadius: 6,
                  fontWeight: 800, fontSize: "0.9rem", letterSpacing: 1,
                  textTransform: "uppercase",
                }}>
                  CHI TIẾT SẢN PHẨM
                </Box>
              </Box>

              {/* Content with expand/collapse */}
              <Box sx={{ position: "relative" }}>
                <Box sx={{
                  px: 4, pt: 4, pb: showFullDescription ? 4 : 2,
                  maxHeight: showFullDescription ? "none" : 500,
                  overflow: "hidden",
                  transition: "max-height 0.5s ease",
                }}>
                  {/* Description Content */}
                  {product.description && (
                    <Box sx={{ mb: 4 }}>
                      <Typography variant="body1" sx={{
                        color: "#333", lineHeight: 1.8, whiteSpace: "pre-line",
                        fontSize: "0.95rem",
                        "& strong": { color: "#002c4b", fontWeight: 700 },
                      }}>
                        {product.description}
                      </Typography>
                    </Box>
                  )}

                  {/* Specs Table */}
                  {product.specs && Object.keys(product.specs).length > 0 && (
                    <Box sx={{ mt: 4 }}>
                      <Typography variant="h6" sx={{
                        fontWeight: 800, color: "#002c4b", mb: 2,
                        fontSize: "1.1rem", borderLeft: "4px solid #a3e635", pl: 2,
                      }}>
                        Thông số kỹ thuật
                      </Typography>
                      <Box sx={{ border: "1px solid #e8e8e8", borderRadius: 1, overflow: "hidden" }}>
                        {Object.entries(product.specs).map(([key, value], idx) => (
                          <Box key={key} sx={{
                            display: "flex", py: 1.5, px: 2.5,
                            bgcolor: idx % 2 === 0 ? "#f8fafb" : "#fff",
                            borderBottom: idx < Object.keys(product.specs!).length - 1 ? "1px solid #f0f0f0" : "none",
                          }}>
                            <Typography variant="body2" sx={{ fontWeight: 700, color: "#1a1a1a", width: "40%", flexShrink: 0 }}>
                              {key}
                            </Typography>
                            <Typography variant="body2" sx={{ color: "#555" }}>
                              {String(value)}
                            </Typography>
                          </Box>
                        ))}
                      </Box>
                    </Box>
                  )}
                </Box>

                {/* Gradient overlay when collapsed */}
                {!showFullDescription && (
                  <Box sx={{
                    position: "absolute", bottom: 0, left: 0, right: 0, height: 120,
                    background: "linear-gradient(to bottom, rgba(255,255,255,0) 0%, rgba(255,255,255,1) 100%)",
                    pointerEvents: "none",
                  }} />
                )}
              </Box>

              {/* Xem thêm / Thu gọn button */}
              <Box sx={{ display: "flex", justifyContent: "center", py: 2, borderTop: "1px solid #eee" }}>
                <Button
                  variant="outlined"
                  onClick={() => setShowFullDescription(!showFullDescription)}
                  sx={{
                    color: "#002c4b", borderColor: "#002c4b", fontWeight: 700,
                    px: 4, py: 0.8, fontSize: "0.85rem",
                    "&:hover": { bgcolor: "#002c4b", color: "white", borderColor: "#002c4b" },
                    transition: "all 0.3s ease",
                  }}
                >
                  {showFullDescription ? "Thu gọn ▲" : "Xem thêm ▼"}
                </Button>
              </Box>
            </Paper>
          )}

          {/* Reviews Section */}
          <Box sx={{ mb: 4 }} data-reveal className="reveal">
            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 2, mb: 2 }}>
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 800, color: "#0f172a" }}>
                  Đánh giá {product.name}
                </Typography>
                <Typography variant="body2" sx={{ color: "#64748b" }}>
                  Hãy chia sẻ cảm nhận để giúp cộng đồng lựa chọn tốt hơn.
                </Typography>
              </Box>
              <Button
                variant="contained"
                onClick={() => setShowReviewDialog(true)}
                sx={{ bgcolor: "#1d4ed8", color: "white", fontWeight: 700, "&:hover": { bgcolor: "#1e40af" } }}
              >
                VIẾT ĐÁNH GIÁ
              </Button>
            </Box>

            <Paper
              elevation={0}
              sx={{
                border: "1px solid #e2e8f0",
                borderRadius: 3,
                p: { xs: 2.5, md: 3 },
                display: "grid",
                gridTemplateColumns: { xs: "1fr", md: "200px 1fr 220px" },
                gap: 3,
                mb: 3,
                bgcolor: "#fff",
              }}
            >
              <Box sx={{ display: "flex", flexDirection: "column", alignItems: { xs: "flex-start", md: "center" }, gap: 1 }}>
                <Box sx={{ display: "flex", alignItems: "baseline", gap: 1 }}>
                  <Typography variant="h3" sx={{ fontWeight: 800, color: "#f59e0b" }}>0.0</Typography>
                  <Rating value={1} max={1} readOnly sx={{ color: "#f59e0b" }} />
                </Box>
                <Typography variant="caption" sx={{ fontWeight: 700, color: "#1e293b" }}>
                  ĐÁNH GIÁ TRUNG BÌNH
                </Typography>
                <Typography variant="caption" sx={{ color: "#94a3b8" }}>0 đánh giá</Typography>
              </Box>
              <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                {[5, 4, 3, 2, 1].map((star) => (
                  <Box key={star} sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <Typography variant="body2" sx={{ width: 30, color: "#1a1a1a" }}>{star} ★</Typography>
                    <Box sx={{ flexGrow: 1, height: 8, bgcolor: "#f1f5f9", borderRadius: 4, overflow: "hidden" }}>
                      <Box sx={{ width: "0%", height: "100%", bgcolor: "#1d4ed8" }} />
                    </Box>
                    <Typography variant="body2" sx={{ width: 110, color: "#1d4ed8", textAlign: "right" }}>0% | 0</Typography>
                  </Box>
                ))}
              </Box>
              <Box
                sx={{
                  borderRadius: 2,
                  border: "1px dashed #cbd5f5",
                  p: 2,
                  bgcolor: "#f8fafc",
                  display: "flex",
                  flexDirection: "column",
                  gap: 1.5,
                  justifyContent: "center",
                }}
              >
                <Typography variant="body2" sx={{ color: "#475569", fontWeight: 600 }}>
                  Mời bạn cho 1 đánh giá nhé!
                </Typography>
                <Button
                  variant="outlined"
                  onClick={() => setShowReviewDialog(true)}
                  sx={{ borderColor: "#1d4ed8", color: "#1d4ed8", fontWeight: 700, "&:hover": { bgcolor: "#1d4ed8", color: "white" } }}
                >
                  ĐÁNH GIÁ NGAY
                </Button>
              </Box>
            </Paper>

            {/* Star filter buttons */}
            <Box sx={{ display: "flex", gap: 1, mb: 3, flexWrap: "wrap", bgcolor: "#f8fafc", p: 2, borderRadius: 2 }}>
              <Button variant={selectedStarFilter === "all" ? "contained" : "outlined"} size="small"
                onClick={() => setSelectedStarFilter("all")}
                sx={{
                  ...(selectedStarFilter === "all" ? { bgcolor: "#1d4ed8", color: "white" } : { color: "#1a1a1a", borderColor: "#e2e8f0", bgcolor: "white" }),
                  minWidth: "auto", boxShadow: "none",
                }}>Tất cả</Button>
              {[5, 4, 3, 2, 1].map((star) => (
                <Button key={star} variant={selectedStarFilter === String(star) ? "contained" : "outlined"} size="small"
                  onClick={() => setSelectedStarFilter(String(star))}
                  sx={{
                    ...(selectedStarFilter === String(star) ? { bgcolor: "#1d4ed8", color: "white" } : { color: "#1a1a1a", borderColor: "#e2e8f0", bgcolor: "white" }),
                    minWidth: "auto",
                  }}>{star} ★</Button>
              ))}
              <Button variant={selectedStarFilter === "video" ? "contained" : "outlined"} size="small"
                onClick={() => setSelectedStarFilter("video")}
                sx={{
                  ...(selectedStarFilter === "video" ? { bgcolor: "#1d4ed8", color: "white" } : { color: "#1a1a1a", borderColor: "#e2e8f0", bgcolor: "white" }),
                }}>Có video</Button>
              <Button variant={selectedStarFilter === "photo" ? "contained" : "outlined"} size="small"
                onClick={() => setSelectedStarFilter("photo")}
                sx={{
                  ...(selectedStarFilter === "photo" ? { bgcolor: "#1d4ed8", color: "white" } : { color: "#1a1a1a", borderColor: "#e2e8f0", bgcolor: "white" }),
                }}>Có ảnh</Button>
            </Box>

            <Typography variant="body2" sx={{ color: "#888", fontStyle: "italic" }}>Chưa có đánh giá nào.</Typography>
          </Box>

          {/* Review Dialog */}
          <Dialog open={showReviewDialog} onClose={() => setShowReviewDialog(false)} maxWidth="sm" fullWidth
            PaperProps={{ sx: { borderRadius: 2, bgcolor: "#fff", p: 0 } }}>
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", p: 3, pb: 0 }}>
              <Typography variant="h6" sx={{ fontWeight: "bold", color: "#1a1a1a", pr: 4 }}>
                Đánh giá {product.name}
              </Typography>
              <IconButton onClick={() => setShowReviewDialog(false)} sx={{ color: "#888" }}>
                <X size={20} />
              </IconButton>
            </Box>
            <DialogContent sx={{ px: 3, pt: 2 }}>
              {/* Textarea */}
              <textarea
                placeholder="Mời bạn chia sẻ thêm một số cảm nhận..."
                value={reviewText}
                onChange={(e) => setReviewText(e.target.value)}
                style={{
                  width: "100%", minHeight: 120, padding: 16, border: "1px solid #ddd",
                  borderRadius: 6, outline: "none", resize: "vertical", fontFamily: "inherit",
                  fontSize: "0.9rem", color: "#333",
                }}
              />

              {/* Upload + char count */}
              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mt: 1, mb: 3 }}>
                <Box sx={{ display: "flex", gap: 2 }}>
                  <Button startIcon={<Camera size={16} />} size="small" sx={{ color: "#0ea5e9", fontWeight: 600, textTransform: "none" }}>
                    Chọn ảnh
                  </Button>
                  <Button startIcon={<Video size={16} />} size="small" sx={{ color: "#E60023", fontWeight: 600, textTransform: "none" }}>
                    Chọn video
                  </Button>
                </Box>
                <Typography variant="caption" sx={{ color: "#0ea5e9" }}>
                  {reviewText.length} ký tự (Tối thiểu 10)
                </Typography>
              </Box>
              {reviewError && (
                <Typography variant="body2" sx={{ color: "#E60023", mb: 2 }}>
                  {reviewError}
                </Typography>
              )}

              <Divider sx={{ mb: 2 }} />

              {/* Star Rating Selection */}
              <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 3 }}>
                <Typography variant="body2" sx={{ fontWeight: "bold", color: "#1a1a1a", minWidth: 120 }}>
                  Bạn cảm thấy thế nào về sản phẩm?<br />
                  <Typography component="span" variant="caption" sx={{ color: "#888" }}>(Chọn sao)</Typography>
                </Typography>
                <Box sx={{ display: "flex", gap: 1 }}>
                  {["Rất tệ", "Không tệ", "Trung bình", "Tốt", "Tuyệt vời"].map((label, idx) => (
                    <Box key={idx} sx={{ display: "flex", flexDirection: "column", alignItems: "center", cursor: "pointer" }}
                      onClick={() => setReviewRating(idx + 1)}>
                      <Star size={28} fill={reviewRating && reviewRating >= idx + 1 ? "#f59e0b" : "none"}
                        color={reviewRating && reviewRating >= idx + 1 ? "#f59e0b" : "#ccc"} />
                      <Typography variant="caption" sx={{ color: "#888", fontSize: "0.7rem", mt: 0.5 }}>{label}</Typography>
                    </Box>
                  ))}
                </Box>
              </Box>

              <Divider sx={{ mb: 2 }} />

              {/* Form fields */}
              <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
                <input type="text" placeholder="Họ tên*"
                  style={{ flex: 1, padding: "10px 14px", border: "1px solid #ddd", borderRadius: 6, outline: "none", fontSize: "0.9rem" }} />
                <input type="tel" placeholder="Số điện thoại*"
                  style={{ flex: 1, padding: "10px 14px", border: "1px solid #ddd", borderRadius: 6, outline: "none", fontSize: "0.9rem" }} />
                <input type="email" placeholder="Email"
                  style={{ flex: 1, padding: "10px 14px", border: "1px solid #ddd", borderRadius: 6, outline: "none", fontSize: "0.9rem" }} />
              </Box>

              <FormControlLabel
                control={<Checkbox size="small" sx={{ color: "#ccc" }} />}
                label={<Typography variant="caption" sx={{ color: "#555" }}>Lưu tên của tôi, email, và trang web trong trình duyệt này cho lần bình luận kế tiếp của tôi.</Typography>}
                sx={{ mb: 3 }}
              />

              {/* Submit button */}
              <Box sx={{ display: "flex", justifyContent: "center" }}>
                <Button
                  variant="contained"
                  onClick={handleSubmitReview}
                  disabled={reviewSubmitting}
                  sx={{
                    bgcolor: "#0ea5e9", color: "white", fontWeight: 800, px: 5, py: 1.2,
                    fontSize: "0.9rem", letterSpacing: 1, textTransform: "uppercase",
                    "&:hover": { bgcolor: "#0284c7" },
                  }}>
                  {reviewSubmitting ? "DANG GUI..." : "GUI DANH GIA"}
                </Button>
              </Box>
            </DialogContent>
          </Dialog>

          {/* Q&A Section */}
          <Box sx={{ mb: 6 }} data-reveal className="reveal">
            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 2 }}>
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 800, color: "#0f172a" }}>Hỏi đáp</Typography>
                <Typography variant="body2" sx={{ color: "#64748b" }}>
                  Đặt câu hỏi về sản phẩm, shop sẽ phản hồi sớm nhất.
                </Typography>
              </Box>
            </Box>
            <Paper elevation={0} sx={{ border: "1px solid #e2e8f0", borderRadius: 3, p: { xs: 2, md: 3 }, mb: 3, bgcolor: "#fff" }}>
              <textarea
                placeholder="Mời bạn tham gia thảo luận, vui lòng nhập tiếng Việt có dấu."
                style={{ width: "100%", minHeight: 120, padding: 16, border: "1px solid #e2e8f0", outline: "none", resize: "vertical", borderRadius: 8, fontFamily: "inherit" }}
              />
              <Box sx={{ display: "flex", alignItems: "center", gap: 2, flexWrap: "wrap", mt: 2 }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                  <label style={{ display: "flex", alignItems: "center", gap: 6, cursor: "pointer", fontSize: "0.875rem", color: "#1a1a1a" }}>
                    <input type="radio" name="gender" value="Anh" defaultChecked /> Anh
                  </label>
                  <label style={{ display: "flex", alignItems: "center", gap: 6, cursor: "pointer", fontSize: "0.875rem", color: "#1a1a1a" }}>
                    <input type="radio" name="gender" value="Chị" /> Chị
                  </label>
                </Box>
                <input type="text" placeholder="Họ tên*" style={{ flexGrow: 1, minWidth: 180, padding: "10px 12px", border: "1px solid #e2e8f0", borderRadius: 6, outline: "none" }} />
                <input type="email" placeholder="Email" style={{ flexGrow: 1, minWidth: 180, padding: "10px 12px", border: "1px solid #e2e8f0", borderRadius: 6, outline: "none" }} />
                <Button variant="contained" sx={{ bgcolor: "#84cc16", color: "#0f172a", fontWeight: 800, minWidth: 120, boxShadow: "none", "&:hover": { bgcolor: "#65a30d" } }}>
                  GỬI CÂU HỎI
                </Button>
              </Box>
            </Paper>
            <Typography variant="body2" sx={{ color: "#888" }}>Không có bình luận nào</Typography>
          </Box>

          {/* Similar Products */}
          {similarProducts.length > 0 && (
            <Box sx={{ mb: 8 }} data-reveal className="reveal">
              <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 3 }}>
                <Typography variant="h6" sx={{ fontWeight: 800, textTransform: "uppercase", color: "#0f172a" }}>
                  SẢN PHẨM TƯƠNG TỰ
                </Typography>
                <Typography variant="body2" sx={{ color: "#64748b" }}>
                  Chọn thêm sản phẩm phù hợp phong cách của bạn.
                </Typography>
              </Box>
              <Box sx={{ position: "relative" }}>
                <IconButton
                  onClick={() => scrollSimilar("left")}
                  sx={{
                    position: "absolute",
                    left: -16,
                    top: "50%",
                    transform: "translateY(-50%)",
                    zIndex: 2,
                    bgcolor: "white",
                    boxShadow: "0 10px 20px -12px rgba(15,23,42,0.6)",
                    border: "1px solid #e2e8f0",
                    "&:hover": { bgcolor: "#f8fafc" },
                    color: "#1a1a1a",
                  }}
                >
                  <ChevronLeft />
                </IconButton>
                <Box
                  ref={similarRef}
                  sx={{
                    display: "flex",
                    gap: { xs: 2, md: 2.5 },
                    overflowX: "auto",
                    scrollBehavior: "smooth",
                    "&::-webkit-scrollbar": { display: "none" },
                    scrollbarWidth: "none",
                    pb: 2,
                    px: { xs: 0.5, md: 1 },
                  }}
                >
                  {similarProducts.map((p) => (
                    <Box
                      key={p._id}
                      sx={{
                        width: { xs: "70%", sm: "45%", md: "24%", lg: "18%" },
                        minWidth: { xs: "70%", sm: "45%", md: "24%", lg: "18%" },
                        flexShrink: 0,
                        transition: "transform 0.3s ease, box-shadow 0.3s ease",
                        "&:hover": { transform: "translateY(-8px)", boxShadow: "0 24px 40px -32px rgba(15,23,42,0.6)" },
                      }}
                    >
                      <ProductCard product={p} />
                    </Box>
                  ))}
                </Box>
                <IconButton
                  onClick={() => scrollSimilar("right")}
                  sx={{
                    position: "absolute",
                    right: -16,
                    top: "50%",
                    transform: "translateY(-50%)",
                    zIndex: 2,
                    bgcolor: "white",
                    boxShadow: "0 10px 20px -12px rgba(15,23,42,0.6)",
                    border: "1px solid #e2e8f0",
                    "&:hover": { bgcolor: "#f8fafc" },
                    color: "#1a1a1a",
                  }}
                >
                  <ChevronRight />
                </IconButton>
              </Box>
            </Box>
          )}
        </Container>
        </Box>

        {/* Sticky Bottom Bar */}
        <Box sx={{
          position: "fixed", bottom: 0, left: 0, right: 0, bgcolor: "#0f172a", color: "white",
          p: 1.5, display: { xs: "flex", md: "none" }, justifyContent: "center", alignItems: "center", gap: 2,
          zIndex: 1000, boxShadow: "0 -4px 6px -1px rgba(0,0,0,0.1)",
        }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
            <Typography variant="body2" color="grey.400">Giá sản phẩm:</Typography>
            <Typography variant="h6" sx={{ color: "#ef4444", fontWeight: "bold" }}>
              {formatPrice(product.salePrice || product.price)}
            </Typography>
            {product.salePrice && (
              <>
                <Typography variant="caption" sx={{ textDecoration: "line-through", color: "grey.500" }}>
                  {formatPrice(product.price)}
                </Typography>
                <Typography variant="body2" color="grey.400">
                  Tiết kiệm: <Box component="span" sx={{ fontWeight: "bold", color: "white" }}>{formatPrice(saving)}</Box>
                </Typography>
              </>
            )}
          </Box>
          <Button
            variant="contained"
            onClick={handleBuyNow}
            disabled={cartActionLoading}
            sx={{ bgcolor: "#a3e635", color: "black", fontWeight: "bold", px: 4, "&:hover": { bgcolor: "#84cc16" } }}
          >
            {cartActionLoading ? <CircularProgress size={22} /> : "CHỌN MUA"}
          </Button>
        </Box>
      </MainLayout>
    </>
  );
};

export default ProductDetail;

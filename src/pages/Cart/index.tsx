import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box, Container, Typography, Button, IconButton,
  Divider, CircularProgress, Chip, TextField, Grid,
  Checkbox, Paper,
} from "@mui/material";
import {
  Minus, Plus, Trash2, ArrowLeft, Tag, Truck,
  Shield, ChevronRight, PackageCheck, CreditCard, ShoppingCart,
  CheckCircle2,
} from "lucide-react";
import { useSelector, useDispatch } from "react-redux";
import type { RootState, AppDispatch } from "../../store/store";
import {
  fetchCart, updateCartItem, removeFromCart, clearCart,
} from "../../store/slices/cartSlice";
import couponService from "../../services/couponService";
import type { CalculateDiscountResult } from "../../services/couponService";
import MainLayout from "../../layout/MainLayout/MainLayout";
import { CartSkeleton } from "../../components/Skeletons";
import storeImg from "../../assets/about/store.png";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";

/* ─── Premium design tokens ─── */
const T = {
  navy: "#0F172A",
  navyDark: "#020617",
  teal: "#0F766E",
  tealLight: "#14B8A6",
  lime: "#84CC16",
  limeHover: "#65A30D",
  text: "#0F172A",
  textSub: "#475569",
  textMuted: "#94A3B8",
  border: "#E2E8F0",
  bgPage: "#F8FAFC",
  bgCard: "#FFFFFF",
  green: "#10B981",
  greenBg: "linear-gradient(135deg, rgba(16,185,129,0.08) 0%, rgba(20,184,166,0.04) 100%)",
  orangeBg: "#FFF7ED",
  orangeText: "#EA580C",
  red: "#EF4444",
  redBg: "rgba(239, 68, 68, 0.08)",
  shadow: "0 10px 30px rgba(15,23,42,0.05)",
  shadowHover: "0 20px 40px rgba(15,23,42,0.12)",
};

const Cart = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const { items, loading, actionLoading } = useSelector((s: RootState) => s.cart);
  const isAuthenticated = useSelector((s: RootState) => s.auth.isAuthenticated);

  const [couponCode, setCouponCode] = useState("");
  const [couponLoading, setCouponLoading] = useState(false);
  const [couponResult, setCouponResult] = useState<CalculateDiscountResult | null>(null);
  const [couponError, setCouponError] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  useEffect(() => {
    if (isAuthenticated) {
      dispatch(fetchCart());
    }
  }, [dispatch, isAuthenticated]);

  // Select all items automatically when cart items load
  useEffect(() => {
    setSelectedIds(items.map(i => i.productId?._id).filter(Boolean));
  }, [items]);

  // Reset coupon calculation when items list changes
  useEffect(() => {
    if (couponResult) {
      setCouponResult(null);
      setCouponError(null);
    }
  }, [items]);

  const img = (p?: string) => {
    if (!p) return "https://via.placeholder.com/120x120?text=No+Image";
    if (p.startsWith("http")) return p;
    const b = API_URL.replace(/\/+$/, "");
    return `${b}${p.startsWith("/") ? p : "/" + p}`.replace(/\\/g, "/");
  };

  const fmt = (n: number) => n.toLocaleString("vi-VN") + "đ";

  const handleQty = (pid: string, q: number) => {
    if (q >= 1) {
      dispatch(updateCartItem({ productId: pid, qty: q }));
    }
  };

  const handleRemove = (pid: string) => {
    dispatch(removeFromCart({ productId: pid }));
  };

  const handleClear = () => {
    dispatch(clearCart());
  };

  const toggleSelect = (id: string) =>
    setSelectedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);

  const toggleAll = () =>
    setSelectedIds(prev =>
      prev.length === items.length ? [] : items.map(i => i.productId?._id).filter(Boolean)
    );

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) {
      setCouponError("Vui lòng nhập mã giảm giá");
      return;
    }
    try {
      setCouponLoading(true);
      setCouponError(null);
      
      const selectedProductIds = selectedItems.map(item => item.productId?._id).filter(Boolean);
      const selectedCategoryIds = Array.from(
        new Set(
          selectedItems
            .reduce<(string | { _id: string })[]>((acc, item) => {
              const cats = item.productId?.categories;
              if (cats) {
                acc.push(...cats);
              }
              return acc;
            }, [])
            .map(cat => (cat && typeof cat === "object" ? (cat as { _id: string })._id : String(cat)))
            .filter(Boolean)
        )
      ) as string[];

      const r = await couponService.calculateDiscount(
        couponCode.trim(),
        subtotal,
        selectedProductIds,
        selectedCategoryIds
      );
      setCouponResult(r);
    } catch (e: unknown) {
      const err = e as { response?: { data?: { message?: string } }; message?: string };
      setCouponError(err.response?.data?.message || err.message || "Mã không hợp lệ");
      setCouponResult(null);
    } finally {
      setCouponLoading(false);
    }
  };

  const selectedItems = items.filter(i => selectedIds.includes(i.productId?._id));
  const subtotal = selectedItems.reduce((s, i) => s + (i.productId?.salePrice || i.productId?.price || 0) * i.qty, 0);
  const discount = couponResult?.discountAmount || 0;
  const shipping = subtotal >= 2000000 ? 0 : subtotal > 0 ? 30000 : 0;
  const total = subtotal - discount + shipping;
  const totalQty = selectedItems.reduce((s, i) => s + i.qty, 0);

  /* ─── Premium empty state ─── */
  const EmptyState = ({ title, sub, btnText, btnAction, isAuth = false }: { title: string; sub: string; btnText: string; btnAction: () => void; isAuth?: boolean }) => (
    <MainLayout>
      <Box
        sx={{
          bgcolor: T.bgPage,
          minHeight: "75vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          py: 8,
        }}
      >
        <Container maxWidth="sm">
          <Paper
            elevation={0}
            sx={{
              p: { xs: 4, md: 6 },
              textAlign: "center",
              borderRadius: 5,
              border: `1px solid ${T.border}`,
              bgcolor: T.bgCard,
              boxShadow: "0 20px 50px rgba(15,23,42,0.06)",
            }}
          >
            <Box
              sx={{
                width: 110,
                height: 110,
                borderRadius: "50%",
                bgcolor: "rgba(132,204,22,0.1)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                mx: "auto",
                mb: 3.5,
                border: `2px dashed ${T.lime}`,
              }}
            >
              {isAuth ? (
                <Shield size={46} color={T.teal} strokeWidth={1.5} />
              ) : (
                <ShoppingCart size={46} color={T.teal} strokeWidth={1.5} />
              )}
            </Box>
            <Typography variant="h5" sx={{ fontWeight: 900, color: T.navy, mb: 1.5 }}>
              {title}
            </Typography>
            <Typography sx={{ color: T.textSub, mb: 4, fontSize: "0.95rem", lineHeight: 1.6 }}>
              {sub}
            </Typography>
            <Button
              variant="contained"
              onClick={btnAction}
              sx={{
                bgcolor: T.teal,
                color: "#fff",
                fontWeight: 800,
                px: 5,
                py: 1.5,
                borderRadius: 99,
                fontSize: "0.95rem",
                textTransform: "none",
                boxShadow: `0 8px 24px rgba(15,118,110,0.25)`,
                "&:hover": {
                  bgcolor: T.navy,
                  boxShadow: `0 8px 24px rgba(15,23,42,0.25)`,
                },
                transition: "all 250ms ease",
              }}
            >
              {btnText}
            </Button>
          </Paper>
        </Container>
      </Box>
    </MainLayout>
  );

  if (!isAuthenticated) {
    return (
      <EmptyState
        title="Đăng nhập để mua sắm"
        sub="Vui lòng đăng nhập tài khoản của bạn để xem, thêm và quản lý giỏ hàng."
        btnText="Đăng nhập ngay"
        btnAction={() => navigate("/login")}
        isAuth={true}
      />
    );
  }

  if (loading) {
    return (
      <MainLayout>
        {/* Skeleton Page Header */}
        <Box sx={{ bgcolor: T.navy, py: 6, mb: 4 }}>
          <Container maxWidth="lg">
            <CircularProgress sx={{ color: T.lime }} />
          </Container>
        </Box>
        <Container maxWidth="lg" sx={{ pb: 8 }}>
          <CartSkeleton />
        </Container>
      </MainLayout>
    );
  }

  if (!items.length) {
    return (
      <EmptyState
        title="Giỏ hàng đang trống"
        sub="Bạn chưa có sản phẩm nào trong giỏ hàng. Hãy khám phá hàng ngàn phụ kiện và thiết bị Pickleball chính hãng ngay."
        btnText="Khám phá cửa hàng"
        btnAction={() => navigate("/products")}
      />
    );
  }

  return (
    <MainLayout>
      <Box sx={{ bgcolor: T.bgPage, minHeight: "85vh", pb: 8 }}>
        {/* ══════════ PAGE HEADER BANNER ══════════ */}
        <Box
          sx={{
            position: "relative",
            py: { xs: 5, md: 7 },
            overflow: "hidden",
            mb: 4,
          }}
        >
          <Box
            sx={{
              position: "absolute",
              inset: 0,
              backgroundImage: `url(${storeImg})`,
              backgroundSize: "cover",
              backgroundPosition: "center 30%",
              "&::after": {
                content: '""',
                position: "absolute",
                inset: 0,
                background: "linear-gradient(135deg, rgba(15,23,42,0.96) 0%, rgba(15,118,110,0.85) 100%)",
              },
            }}
          />

          <Container maxWidth="lg" sx={{ position: "relative", zIndex: 1 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
              <Typography
                sx={{ color: "rgba(255,255,255,0.6)", fontSize: "0.85rem", cursor: "pointer", "&:hover": { color: T.lime } }}
                onClick={() => navigate("/")}
              >
                Trang chủ
              </Typography>
              <ChevronRight size={14} color="rgba(255,255,255,0.4)" />
              <Typography sx={{ color: "#fff", fontSize: "0.85rem", fontWeight: 700 }}>
                Giỏ hàng
              </Typography>
            </Box>

            <Typography variant="h3" sx={{ color: "#fff", fontWeight: 950, fontSize: { xs: "1.8rem", md: "2.5rem" } }}>
              Giỏ hàng của bạn
              <Typography
                component="span"
                sx={{
                  color: T.lime,
                  fontWeight: 800,
                  fontSize: { xs: "1rem", md: "1.2rem" },
                  ml: 1.5,
                  bgcolor: "rgba(132,204,22,0.15)",
                  px: 1.5,
                  py: 0.4,
                  borderRadius: 99,
                  border: "1px solid rgba(132,204,22,0.25)"
                }}
              >
                {items.length} sản phẩm
              </Typography>
            </Typography>
          </Container>
        </Box>

        <Container maxWidth="lg">
          <Grid container spacing={4}>
            {/* ═══ LEFT COLUMN: Cart Items ═══ */}
            <Grid size={{ xs: 12, md: 8 }}>
              {/* Select All and Actions Bar */}
              <Paper
                elevation={0}
                sx={{
                  bgcolor: T.bgCard,
                  borderRadius: "16px 16px 0 0",
                  border: `1px solid ${T.border}`,
                  borderBottom: `2px solid ${T.teal}30`,
                  px: { xs: 2, md: 3 },
                  py: 2,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <Box sx={{ display: "flex", alignItems: "center" }}>
                  <Checkbox
                    size="medium"
                    checked={selectedIds.length === items.length}
                    indeterminate={selectedIds.length > 0 && selectedIds.length < items.length}
                    onChange={toggleAll}
                    sx={{
                      mr: 1,
                      color: T.textSub,
                      "&.Mui-checked, &.MuiCheckbox-indeterminate": { color: T.teal },
                    }}
                  />
                  <Typography sx={{ fontWeight: 800, color: T.text, fontSize: "0.95rem" }}>
                    Chọn tất cả ({items.length})
                  </Typography>
                </Box>
                <Button
                  size="small"
                  onClick={handleClear}
                  disabled={actionLoading}
                  startIcon={<Trash2 size={15} />}
                  sx={{
                    color: T.textSub,
                    textTransform: "none",
                    fontSize: "0.85rem",
                    fontWeight: 700,
                    borderRadius: 2,
                    px: 1.5,
                    "&:hover": {
                      color: T.red,
                      bgcolor: T.redBg,
                    },
                    transition: "all 200ms ease",
                  }}
                >
                  Xóa tất cả
                </Button>
              </Paper>

              {/* Items Cards List */}
              <Box sx={{ display: "flex", flexDirection: "column", gap: 0 }}>
                {items.map((item, idx) => {
                  const p = item.productId;
                  if (!p) return null;
                  const price = p.salePrice || p.price;
                  const lineTotal = price * item.qty;
                  const hasSale = p.salePrice && p.salePrice < p.price;
                  const checked = selectedIds.includes(p._id);
                  const isLast = idx === items.length - 1;

                  return (
                    <Paper
                      key={item._id || p._id}
                      elevation={0}
                      sx={{
                        bgcolor: T.bgCard,
                        border: `1px solid ${T.border}`,
                        borderTop: "none",
                        borderRadius: isLast ? "0 0 16px 16px" : 0,
                        px: { xs: 2, md: 3 },
                        py: 2.5,
                        transition: "all 220ms ease",
                        position: "relative",
                        "&:hover": {
                          bgcolor: "#FAFCFC",
                          borderColor: `${T.teal}40`,
                          boxShadow: "0 8px 24px rgba(15,118,110,0.03)",
                          zIndex: 2,
                        },
                      }}
                    >
                      <Box sx={{ display: "flex", gap: { xs: 1.5, md: 2.5 }, alignItems: "flex-start" }}>
                        {/* Custom styled checkbox */}
                        <Checkbox
                          size="medium"
                          checked={checked}
                          onChange={() => toggleSelect(p._id)}
                          sx={{
                            mt: 0.5,
                            color: T.textSub,
                            "&.Mui-checked": { color: T.teal },
                          }}
                        />

                        {/* Product Image Wrapper */}
                        <Box
                          onClick={() => navigate(`/product/${p._id}`)}
                          sx={{
                            width: { xs: 80, md: 100 },
                            height: { xs: 80, md: 100 },
                            flexShrink: 0,
                            cursor: "pointer",
                            bgcolor: "#F8FAFC",
                            borderRadius: 3,
                            overflow: "hidden",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            border: `1px solid ${T.border}`,
                            transition: "all 250ms ease",
                            "&:hover": {
                              transform: "scale(1.04)",
                              borderColor: T.teal,
                            },
                          }}
                        >
                          <Box
                            component="img"
                            src={img(p.image?.[0])}
                            alt={p.name}
                            sx={{ maxWidth: "85%", maxHeight: "85%", objectFit: "contain" }}
                          />
                        </Box>

                        {/* Product info and adjustments */}
                        <Box sx={{ flex: 1, minWidth: 0 }}>
                          <Typography
                            onClick={() => navigate(`/product/${p._id}`)}
                            sx={{
                              fontWeight: 800,
                              color: T.text,
                              fontSize: { xs: "0.9rem", md: "1rem" },
                              mb: 0.8,
                              cursor: "pointer",
                              transition: "color 200ms ease",
                              "&:hover": { color: T.teal },
                              display: "-webkit-box",
                              WebkitLineClamp: 2,
                              WebkitBoxOrient: "vertical",
                              overflow: "hidden",
                              lineHeight: 1.4,
                            }}
                          >
                            {p.name}
                          </Typography>

                          {/* Price Tag Row */}
                          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 2 }}>
                            <Typography sx={{ fontWeight: 900, color: T.red, fontSize: "1.05rem" }}>
                              {fmt(price)}
                            </Typography>
                            {hasSale && (
                              <>
                                <Typography sx={{ textDecoration: "line-through", color: T.textMuted, fontSize: "0.85rem" }}>
                                  {fmt(p.price)}
                                </Typography>
                                <Chip
                                  label={`-${Math.round(((p.price - p.salePrice!) / p.price) * 100)}%`}
                                  size="small"
                                  sx={{
                                    height: 18,
                                    fontSize: "0.7rem",
                                    fontWeight: 900,
                                    bgcolor: T.redBg,
                                    color: T.red,
                                    border: "none",
                                  }}
                                />
                              </>
                            )}
                          </Box>

                          {/* Control row: Quantity and Actions */}
                          <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 1.5 }}>
                            {/* Quantity buttons */}
                            <Box
                              sx={{
                                display: "inline-flex",
                                alignItems: "center",
                                border: `1.5px solid ${T.border}`,
                                borderRadius: 99,
                                bgcolor: "#fff",
                                overflow: "hidden",
                                transition: "border-color 200ms ease",
                                "&:focus-within": { borderColor: T.teal },
                              }}
                            >
                              <IconButton
                                size="small"
                                disabled={item.qty <= 1 || actionLoading}
                                onClick={() => handleQty(p._id, item.qty - 1)}
                                sx={{
                                  borderRadius: 0,
                                  px: 1.5,
                                  py: 0.5,
                                  color: T.textSub,
                                  "&:hover": { bgcolor: "#F1F5F9" },
                                }}
                              >
                                <Minus size={14} strokeWidth={2.5} />
                              </IconButton>
                              <Typography
                                sx={{
                                  px: 1.5,
                                  fontWeight: 800,
                                  fontSize: "0.9rem",
                                  color: T.text,
                                  minWidth: 32,
                                  textAlign: "center",
                                }}
                              >
                                {item.qty}
                              </Typography>
                              <IconButton
                                size="small"
                                disabled={item.qty >= p.stock || actionLoading}
                                onClick={() => handleQty(p._id, item.qty + 1)}
                                sx={{
                                  borderRadius: 0,
                                  px: 1.5,
                                  py: 0.5,
                                  color: T.textSub,
                                  "&:hover": { bgcolor: "#F1F5F9" },
                                }}
                              >
                                <Plus size={14} strokeWidth={2.5} />
                              </IconButton>
                            </Box>

                            {/* Line item total & Delete action */}
                            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                              <Typography sx={{ fontWeight: 900, color: T.text, fontSize: "1.05rem" }}>
                                {fmt(lineTotal)}
                              </Typography>
                              <IconButton
                                size="small"
                                onClick={() => handleRemove(p._id)}
                                disabled={actionLoading}
                                sx={{
                                  color: "#CBD5E1",
                                  border: "1px solid #E2E8F0",
                                  borderRadius: 2,
                                  p: 0.8,
                                  "&:hover": {
                                    color: T.red,
                                    bgcolor: T.redBg,
                                    borderColor: T.red,
                                  },
                                  transition: "all 200ms ease",
                                }}
                              >
                                <Trash2 size={16} />
                              </IconButton>
                            </Box>
                          </Box>
                        </Box>
                      </Box>
                    </Paper>
                  );
                })}
              </Box>

              {/* Back to store navigation */}
              <Button
                startIcon={<ArrowLeft size={16} />}
                onClick={() => navigate("/products")}
                sx={{
                  mt: 3,
                  color: T.teal,
                  textTransform: "none",
                  fontWeight: 800,
                  fontSize: "0.9rem",
                  px: 2,
                  py: 1,
                  borderRadius: 99,
                  "&:hover": {
                    bgcolor: "rgba(15,118,110,0.06)",
                    color: T.navy,
                  },
                  transition: "all 200ms ease",
                }}
              >
                Tiếp tục mua sắm
              </Button>
            </Grid>

            {/* ═══ RIGHT COLUMN: Summary and Checkout ═══ */}
            <Grid size={{ xs: 12, md: 4 }}>
              {/* Coupon card */}
              <Paper
                elevation={0}
                sx={{
                  bgcolor: T.bgCard,
                  borderRadius: 4,
                  border: `1px solid ${T.border}`,
                  p: 3,
                  mb: 3,
                  boxShadow: T.shadow,
                  transition: "box-shadow 250ms ease",
                  "&:hover": { boxShadow: T.shadowHover },
                }}
              >
                <Box sx={{ display: "flex", alignItems: "center", gap: 1.2, mb: 2.5 }}>
                  <Tag size={18} color={T.teal} />
                  <Typography sx={{ fontWeight: 900, color: T.navy, fontSize: "1rem" }}>
                    Mã giảm giá
                  </Typography>
                </Box>

                {couponResult ? (
                  <Box
                    sx={{
                      background: T.greenBg,
                      border: "1px solid rgba(16,185,129,0.25)",
                      borderRadius: 3,
                      p: 2,
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <Box>
                      <Typography sx={{ fontWeight: 800, color: T.green, fontSize: "0.88rem", display: "flex", alignItems: "center", gap: 0.5 }}>
                        <CheckCircle2 size={16} /> Mã "{couponResult.couponCode}" áp dụng thành công
                      </Typography>
                      <Typography sx={{ color: T.green, fontSize: "0.85rem", fontWeight: 700, mt: 0.5 }}>
                        Tiết kiệm: {fmt(couponResult.discountAmount)}
                      </Typography>
                    </Box>
                    <Button
                      size="small"
                      onClick={() => {
                        setCouponCode("");
                        setCouponResult(null);
                        setCouponError(null);
                      }}
                      sx={{
                        color: T.textSub,
                        minWidth: "auto",
                        textTransform: "none",
                        fontSize: "0.85rem",
                        fontWeight: 700,
                        "&:hover": { color: T.red, bgcolor: "transparent" },
                      }}
                    >
                      Xóa
                    </Button>
                  </Box>
                ) : (
                  <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                    <Box sx={{ display: "flex", gap: 1 }}>
                      <TextField
                        size="small"
                        placeholder="MÃ GIẢM GIÁ (SALE10,...)"
                        value={couponCode}
                        onChange={e => {
                          setCouponCode(e.target.value.toUpperCase());
                          setCouponError(null);
                        }}
                        error={!!couponError}
                        sx={{
                          flex: 1,
                          "& .MuiOutlinedInput-root": {
                            borderRadius: 3,
                            fontSize: "0.85rem",
                            "& fieldset": { borderColor: T.border },
                            "&.Mui-focused fieldset": { borderColor: T.teal },
                          },
                        }}
                      />
                      <Button
                        onClick={handleApplyCoupon}
                        disabled={couponLoading}
                        sx={{
                          bgcolor: T.teal,
                          color: "#fff",
                          fontWeight: 800,
                          px: 3,
                          borderRadius: 3,
                          textTransform: "none",
                          fontSize: "0.88rem",
                          "&:hover": { bgcolor: T.navy },
                          transition: "all 200ms ease",
                        }}
                      >
                        {couponLoading ? <CircularProgress size={18} color="inherit" /> : "Áp dụng"}
                      </Button>
                    </Box>
                    {couponError && (
                      <Typography variant="caption" sx={{ color: T.red, fontWeight: 700, pl: 1 }}>
                        {couponError}
                      </Typography>
                    )}
                  </Box>
                )}
              </Paper>

              {/* Order total receipt summary */}
              <Paper
                elevation={0}
                sx={{
                  bgcolor: T.bgCard,
                  borderRadius: 4,
                  border: `1px solid ${T.border}`,
                  overflow: "hidden",
                  boxShadow: T.shadow,
                  position: "sticky",
                  top: 100,
                  transition: "box-shadow 250ms ease",
                  "&:hover": { boxShadow: T.shadowHover },
                }}
              >
                {/* Header */}
                <Box sx={{ bgcolor: T.navy, px: 3, py: 2.2 }}>
                  <Typography sx={{ color: "#fff", fontWeight: 900, fontSize: "1.05rem" }}>
                    Thông tin đơn hàng
                  </Typography>
                </Box>

                <Box sx={{ p: 3 }}>
                  <Row label={`Tạm tính (${totalQty} sản phẩm)`} value={fmt(subtotal)} />
                  {discount > 0 && (
                    <Row
                      label="Mã giảm giá"
                      value={`-${fmt(discount)}`}
                      valueColor={T.green}
                    />
                  )}
                  <Row
                    label="Phí vận chuyển"
                    value={shipping === 0 ? "Miễn phí" : fmt(shipping)}
                    valueColor={shipping === 0 ? T.green : T.text}
                  />

                  {/* Free shipping goal progress */}
                  {shipping > 0 && subtotal > 0 && (
                    <Box sx={{ bgcolor: T.orangeBg, borderRadius: 3, p: 2, mt: 2, mb: 1, border: "1px solid rgba(234,88,12,0.12)" }}>
                      <Typography sx={{ color: T.orangeText, fontSize: "0.78rem", fontWeight: 700, display: "flex", alignItems: "center", gap: 0.5 }}>
                        🚚 Mua thêm <b>{fmt(2000000 - subtotal)}</b> để được miễn phí vận chuyển
                      </Typography>
                      {/* Custom progress bar */}
                      <Box sx={{ mt: 1, height: 6, bgcolor: "#FED7AA", borderRadius: 99, overflow: "hidden" }}>
                        <Box
                          sx={{
                            width: `${Math.min((subtotal / 2000000) * 100, 100)}%`,
                            height: "100%",
                            bgcolor: T.orangeText,
                            borderRadius: 99,
                            transition: "width 500ms cubic-bezier(0.4, 0, 0.2, 1)",
                          }}
                        />
                      </Box>
                    </Box>
                  )}

                  <Divider sx={{ my: 2.5, borderColor: T.border }} />

                  <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", mb: 3 }}>
                    <Typography sx={{ fontWeight: 800, color: T.text, fontSize: "1.05rem" }}>Tổng cộng</Typography>
                    <Typography sx={{ fontWeight: 950, color: T.red, fontSize: "1.45rem" }}>{fmt(total)}</Typography>
                  </Box>

                  {/* Glowing checkout button */}
                  <Button
                    fullWidth
                    onClick={() =>
                      navigate("/checkout", {
                        state: {
                          selectedIds,
                          couponCode: couponResult?.couponCode || null,
                          discountAmount: discount,
                          subtotal,
                        },
                      })
                    }
                    disabled={selectedIds.length === 0}
                    startIcon={<CreditCard size={18} />}
                    sx={{
                      bgcolor: T.red,
                      color: "#fff",
                      fontWeight: 900,
                      py: 1.6,
                      borderRadius: 3,
                      textTransform: "none",
                      fontSize: "1rem",
                      boxShadow: `0 8px 24px rgba(239,68,68,0.25)`,
                      "&:hover": {
                        bgcolor: "#DC2626",
                        boxShadow: `0 12px 28px rgba(239,68,68,0.35)`,
                        transform: "translateY(-1px)",
                      },
                      "&.Mui-disabled": {
                        bgcolor: "#E2E8F0",
                        color: "#94A3B8",
                      },
                      transition: "all 200ms ease",
                    }}
                  >
                    Tiến hành thanh toán
                  </Button>

                  {/* Trust factors footer inside summary */}
                  <Divider sx={{ my: 2.5, borderColor: T.border }} />
                  <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                    {[
                      { icon: <Truck size={15} />, t: "Giao hàng toàn quốc nhanh chóng" },
                      { icon: <Shield size={15} />, t: "Cam kết chính hãng 100% bảo hành đầy đủ" },
                      { icon: <PackageCheck size={15} />, t: "Hỗ trợ đổi trả miễn phí trong 30 ngày" },
                    ].map((b, i) => (
                      <Box key={i} sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                        <Box sx={{ color: T.teal, display: "flex", flexShrink: 0 }}>{b.icon}</Box>
                        <Typography sx={{ color: T.textSub, fontSize: "0.8rem", fontWeight: 600 }}>{b.t}</Typography>
                      </Box>
                    ))}
                  </Box>
                </Box>
              </Paper>
            </Grid>
          </Grid>
        </Container>
      </Box>
    </MainLayout>
  );
};

/* ─── Helper row component ─── */
const Row = ({ label, value, valueColor }: { label: string; value: string; valueColor?: string }) => (
  <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1.6 }}>
    <Typography sx={{ color: T.textSub, fontSize: "0.88rem", fontWeight: 600 }}>{label}</Typography>
    <Typography sx={{ fontWeight: 800, color: valueColor || T.navy, fontSize: "0.88rem" }}>{value}</Typography>
  </Box>
);

export default Cart;
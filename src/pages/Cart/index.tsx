import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box, Container, Typography, Button, IconButton,
  Divider, CircularProgress, Chip, TextField, Grid,
  Checkbox,
} from "@mui/material";
import {
  Minus, Plus, Trash2, ShoppingBag, ArrowLeft, Tag, Truck,
  Shield, Gift, ChevronRight, PackageCheck, CreditCard,
} from "lucide-react";
import { useSelector, useDispatch } from "react-redux";
import type { RootState, AppDispatch } from "../../store/store";
import {
  fetchCart, updateCartItem, removeFromCart, clearCart,
} from "../../store/slices/cartSlice";
import couponService from "../../services/couponService";
import type { CalculateDiscountResult } from "../../services/couponService";
import MainLayout from "../../layout/MainLayout/MainLayout";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";

/* ─── design tokens (đồng bộ với Header #08222f / #002c4b / #E60023) ─── */
const T = {
  navy: "#002c4b",
  navyDark: "#08222f",
  red: "#E60023",
  redHover: "#c4001d",
  text: "#1e293b",
  textSub: "#64748b",
  border: "#e2e8f0",
  bgPage: "#f1f5f9",
  bgCard: "#ffffff",
  green: "#059669",
  greenBg: "#ecfdf5",
  orangeBg: "#fff7ed",
  orangeText: "#c2410c",
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

  useEffect(() => { if (isAuthenticated) dispatch(fetchCart()); }, [dispatch, isAuthenticated]);

  // select all khi items load
  useEffect(() => { setSelectedIds(items.map(i => i.productId?._id).filter(Boolean)); }, [items]);

  // reset coupon khi items thay đổi
  useEffect(() => { if (couponResult) { setCouponResult(null); setCouponError(null); } }, [items]);

  const img = (p?: string) => {
    if (!p) return "https://via.placeholder.com/120x120?text=No+Image";
    if (p.startsWith("http")) return p;
    const b = API_URL.replace(/\/+$/, "");
    return `${b}${p.startsWith("/") ? p : "/" + p}`.replace(/\\/g, "/");
  };
  const fmt = (n: number) => n.toLocaleString("vi-VN") + "đ";

  const handleQty = (pid: string, q: number) => { if (q >= 1) dispatch(updateCartItem({ productId: pid, qty: q })); };
  const handleRemove = (pid: string) => dispatch(removeFromCart({ productId: pid }));
  const handleClear = () => dispatch(clearCart());

  const toggleSelect = (id: string) =>
    setSelectedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  const toggleAll = () =>
    setSelectedIds(prev => prev.length === items.length ? [] : items.map(i => i.productId?._id).filter(Boolean));

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) { setCouponError("Vui lòng nhập mã giảm giá"); return; }
    try {
      setCouponLoading(true); setCouponError(null);
      const r = await couponService.calculateDiscount(couponCode.trim(), subtotal);
      setCouponResult(r);
    } catch (e: any) {
      setCouponError(e?.response?.data?.message || e?.message || "Mã không hợp lệ");
      setCouponResult(null);
    } finally { setCouponLoading(false); }
  };

  const selectedItems = items.filter(i => selectedIds.includes(i.productId?._id));
  const subtotal = selectedItems.reduce((s, i) => s + (i.productId?.salePrice || i.productId?.price || 0) * i.qty, 0);
  const discount = couponResult?.discountAmount || 0;
  const shipping = subtotal >= 2000000 ? 0 : subtotal > 0 ? 30000 : 0;
  const total = subtotal - discount + shipping;
  const totalQty = selectedItems.reduce((s, i) => s + i.qty, 0);

  /* ─── empty states ─── */
  const EmptyState = ({ title, sub, btnText, btnAction }: { title: string; sub: string; btnText: string; btnAction: () => void }) => (
    <MainLayout>
      <Box sx={{ bgcolor: T.bgPage, minHeight: "70vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <Box sx={{ textAlign: "center", maxWidth: 420 }}>
          <Box sx={{
            width: 100, height: 100, borderRadius: "50%", bgcolor: "#f8fafc",
            display: "flex", alignItems: "center", justifyContent: "center", mx: "auto", mb: 3,
            border: `2px dashed ${T.border}`,
          }}>
            <ShoppingBag size={42} color={T.textSub} strokeWidth={1.5} />
          </Box>
          <Typography sx={{ fontSize: "1.35rem", fontWeight: 700, color: T.text, mb: 1 }}>{title}</Typography>
          <Typography sx={{ color: T.textSub, mb: 4, fontSize: "0.9rem", lineHeight: 1.6 }}>{sub}</Typography>
          <Button onClick={btnAction} sx={{
            bgcolor: T.navy, color: "#fff", fontWeight: 700, px: 4, py: 1.3,
            borderRadius: 2, textTransform: "none", fontSize: "0.9rem",
            "&:hover": { bgcolor: T.navyDark },
          }}>{btnText}</Button>
        </Box>
      </Box>
    </MainLayout>
  );

  if (!isAuthenticated) return <EmptyState title="Vui lòng đăng nhập" sub="Đăng nhập để xem và quản lý giỏ hàng của bạn" btnText="Đăng nhập ngay" btnAction={() => navigate("/login")} />;
  if (loading) return (
    <MainLayout>
      <Box sx={{ bgcolor: T.bgPage, minHeight: "70vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <CircularProgress size={44} sx={{ color: T.navy }} />
      </Box>
    </MainLayout>
  );
  if (!items.length) return <EmptyState title="Giỏ hàng trống" sub="Hãy khám phá và thêm sản phẩm yêu thích vào giỏ hàng nhé!" btnText="Khám phá sản phẩm" btnAction={() => navigate("/")} />;

  return (
    <MainLayout>
      <Box sx={{ bgcolor: T.bgPage, minHeight: "80vh", pb: 6 }}>
        {/* ── Page header ── */}
        <Box sx={{ bgcolor: T.navy, py: 2.5 }}>
          <Container maxWidth="lg">
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Typography sx={{ color: "rgba(255,255,255,.6)", fontSize: "0.8rem", cursor: "pointer", "&:hover": { color: "#fff" } }} onClick={() => navigate("/")}>
                Trang chủ
              </Typography>
              <ChevronRight size={13} color="rgba(255,255,255,.4)" />
              <Typography sx={{ color: "#fff", fontSize: "0.8rem", fontWeight: 600 }}>
                Giỏ hàng
              </Typography>
            </Box>
            <Typography sx={{ color: "#fff", fontWeight: 800, fontSize: "1.5rem", mt: 0.5 }}>
              Giỏ hàng của bạn
              <Typography component="span" sx={{ color: "rgba(255,255,255,.5)", fontWeight: 400, fontSize: "0.95rem", ml: 1 }}>
                ({items.length} sản phẩm)
              </Typography>
            </Typography>
          </Container>
        </Box>

        <Container maxWidth="lg" sx={{ mt: 3 }}>
          <Grid container spacing={3}>
            {/* ═══ LEFT: Cart items ═══ */}
            <Grid size={{ xs: 12, md: 8 }}>
              {/* table header */}
              <Box sx={{
                bgcolor: T.bgCard, borderRadius: "10px 10px 0 0", border: `1px solid ${T.border}`,
                px: 2.5, py: 1.5, display: "flex", alignItems: "center", borderBottom: "none",
              }}>
                <Checkbox
                  size="small"
                  checked={selectedIds.length === items.length}
                  indeterminate={selectedIds.length > 0 && selectedIds.length < items.length}
                  onChange={toggleAll}
                  sx={{ mr: 1, color: T.textSub, "&.Mui-checked,&.MuiCheckbox-indeterminate": { color: T.navy } }}
                />
                <Typography sx={{ flex: 1, fontWeight: 700, color: T.text, fontSize: "0.85rem" }}>
                  Chọn tất cả ({items.length})
                </Typography>
                <Button size="small" onClick={handleClear} disabled={actionLoading}
                  startIcon={<Trash2 size={13} />}
                  sx={{ color: T.textSub, textTransform: "none", fontSize: "0.8rem", fontWeight: 600, "&:hover": { color: T.red, bgcolor: "transparent" } }}>
                  Xóa tất cả
                </Button>
              </Box>

              {/* items */}
              {items.map((item, idx) => {
                const p = item.productId;
                if (!p) return null;
                const price = p.salePrice || p.price;
                const lineTotal = price * item.qty;
                const hasSale = p.salePrice && p.salePrice < p.price;
                const checked = selectedIds.includes(p._id);
                const isLast = idx === items.length - 1;

                return (
                  <Box key={item._id || p._id} sx={{
                    bgcolor: T.bgCard,
                    border: `1px solid ${T.border}`, borderTop: "none",
                    borderRadius: isLast ? "0 0 10px 10px" : 0,
                    px: 2.5, py: 2,
                    transition: "background .15s",
                    "&:hover": { bgcolor: "#f8fafc" },
                  }}>
                    <Box sx={{ display: "flex", gap: 2, alignItems: "flex-start" }}>
                      <Checkbox size="small" checked={checked} onChange={() => toggleSelect(p._id)}
                        sx={{ mt: 0.5, color: T.textSub, "&.Mui-checked": { color: T.navy } }} />

                      {/* image */}
                      <Box onClick={() => navigate(`/product/${p._id}`)} sx={{
                        width: 88, height: 88, flexShrink: 0, cursor: "pointer",
                        bgcolor: "#f8fafc", borderRadius: 2, overflow: "hidden",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        border: `1px solid ${T.border}`,
                        transition: "transform .2s", "&:hover": { transform: "scale(1.03)" },
                      }}>
                        <Box component="img" src={img(p.image?.[0])} alt={p.name}
                          sx={{ maxWidth: "90%", maxHeight: "90%", objectFit: "contain" }} />
                      </Box>

                      {/* info */}
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Typography onClick={() => navigate(`/product/${p._id}`)} sx={{
                          fontWeight: 600, color: T.text, fontSize: "0.9rem", mb: 0.5,
                          cursor: "pointer", "&:hover": { color: T.navy },
                          display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden",
                        }}>
                          {p.name}
                        </Typography>

                        {/* price row */}
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1.5 }}>
                          <Typography sx={{ fontWeight: 700, color: T.red, fontSize: "0.95rem" }}>
                            {fmt(price)}
                          </Typography>
                          {hasSale && (
                            <>
                              <Typography sx={{ textDecoration: "line-through", color: "#94a3b8", fontSize: "0.8rem" }}>
                                {fmt(p.price)}
                              </Typography>
                              <Chip label={`-${Math.round(((p.price - p.salePrice!) / p.price) * 100)}%`} size="small"
                                sx={{ height: 20, fontSize: "0.7rem", fontWeight: 700, bgcolor: "#fef2f2", color: T.red, border: "none" }} />
                            </>
                          )}
                        </Box>

                        {/* qty + total + delete */}
                        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                          <Box sx={{
                            display: "inline-flex", alignItems: "center",
                            border: `1.5px solid ${T.border}`, borderRadius: 2, overflow: "hidden",
                          }}>
                            <IconButton size="small" disabled={item.qty <= 1 || actionLoading}
                              onClick={() => handleQty(p._id, item.qty - 1)}
                              sx={{ borderRadius: 0, px: 1, color: T.textSub, "&:hover": { bgcolor: "#f1f5f9" } }}>
                              <Minus size={15} />
                            </IconButton>
                            <Typography sx={{
                              px: 2, fontWeight: 700, fontSize: "0.85rem", color: T.text,
                              minWidth: 28, textAlign: "center", borderLeft: `1px solid ${T.border}`, borderRight: `1px solid ${T.border}`,
                            }}>
                              {item.qty}
                            </Typography>
                            <IconButton size="small" disabled={item.qty >= p.stock || actionLoading}
                              onClick={() => handleQty(p._id, item.qty + 1)}
                              sx={{ borderRadius: 0, px: 1, color: T.textSub, "&:hover": { bgcolor: "#f1f5f9" } }}>
                              <Plus size={15} />
                            </IconButton>
                          </Box>

                          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                            <Typography sx={{ fontWeight: 700, color: T.text, fontSize: "0.95rem" }}>
                              {fmt(lineTotal)}
                            </Typography>
                            <IconButton size="small" onClick={() => handleRemove(p._id)} disabled={actionLoading}
                              sx={{ color: "#cbd5e1", "&:hover": { color: T.red, bgcolor: "#fef2f2" } }}>
                              <Trash2 size={15} />
                            </IconButton>
                          </Box>
                        </Box>
                      </Box>
                    </Box>
                  </Box>
                );
              })}

              <Button startIcon={<ArrowLeft size={16} />} onClick={() => navigate("/")}
                sx={{ mt: 2, color: T.textSub, textTransform: "none", fontWeight: 600, fontSize: "0.85rem", "&:hover": { color: T.navy, bgcolor: "transparent" } }}>
                Tiếp tục mua sắm
              </Button>
            </Grid>

            {/* ═══ RIGHT: Summary ═══ */}
            <Grid size={{ xs: 12, md: 4 }}>
              {/* coupon */}
              <Box sx={{ bgcolor: T.bgCard, borderRadius: 2.5, border: `1px solid ${T.border}`, p: 2.5, mb: 2 }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1.5 }}>
                  <Tag size={16} color={T.navy} />
                  <Typography sx={{ fontWeight: 700, color: T.text, fontSize: "0.9rem" }}>Mã giảm giá</Typography>
                </Box>
                {couponResult ? (
                  <Box sx={{ bgcolor: T.greenBg, border: "1px solid #a7f3d0", borderRadius: 2, p: 1.5, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <Box>
                      <Typography sx={{ fontWeight: 700, color: T.green, fontSize: "0.82rem" }}>
                        ✓ Mã "{couponResult.couponCode}" đã áp dụng
                      </Typography>
                      <Typography sx={{ color: T.green, fontSize: "0.78rem" }}>Giảm {fmt(couponResult.discountAmount)}</Typography>
                    </Box>
                    <Button size="small" onClick={() => { setCouponCode(""); setCouponResult(null); setCouponError(null); }}
                      sx={{ color: T.textSub, minWidth: "auto", textTransform: "none", fontSize: "0.78rem" }}>Xóa</Button>
                  </Box>
                ) : (
                  <Box sx={{ display: "flex", gap: 1 }}>
                    <TextField size="small" placeholder="Nhập mã khuyến mãi" value={couponCode}
                      onChange={e => { setCouponCode(e.target.value.toUpperCase()); setCouponError(null); }}
                      error={!!couponError} helperText={couponError}
                      sx={{ flex: 1, "& .MuiOutlinedInput-root": { borderRadius: 2, fontSize: "0.85rem", "& fieldset": { borderColor: T.border }, "&.Mui-focused fieldset": { borderColor: T.navy } } }} />
                    <Button onClick={handleApplyCoupon} disabled={couponLoading}
                      sx={{ bgcolor: T.navy, color: "#fff", fontWeight: 700, minWidth: 75, borderRadius: 2, textTransform: "none", fontSize: "0.82rem", "&:hover": { bgcolor: T.navyDark } }}>
                      {couponLoading ? <CircularProgress size={18} color="inherit" /> : "Áp dụng"}
                    </Button>
                  </Box>
                )}
              </Box>

              {/* summary */}
              <Box sx={{ bgcolor: T.bgCard, borderRadius: 2.5, border: `1px solid ${T.border}`, overflow: "hidden", position: "sticky", top: 90 }}>
                {/* header */}
                <Box sx={{ bgcolor: T.navy, px: 2.5, py: 1.8 }}>
                  <Typography sx={{ color: "#fff", fontWeight: 700, fontSize: "0.95rem" }}>
                    Thông tin đơn hàng
                  </Typography>
                </Box>

                <Box sx={{ p: 2.5 }}>
                  <Row label={`Tạm tính (${totalQty} sản phẩm)`} value={fmt(subtotal)} />
                  {discount > 0 && <Row label="Giảm giá coupon" value={`-${fmt(discount)}`} valueColor={T.green} />}
                  <Row label="Phí vận chuyển" value={shipping === 0 ? "Miễn phí" : fmt(shipping)} valueColor={shipping === 0 ? T.green : T.text} />

                  {shipping > 0 && subtotal > 0 && (
                    <Box sx={{ bgcolor: T.orangeBg, borderRadius: 1.5, p: 1.2, mt: 1, mb: 0.5 }}>
                      <Typography sx={{ color: T.orangeText, fontSize: "0.75rem", fontWeight: 500 }}>
                        🚚 Mua thêm <b>{fmt(2000000 - subtotal)}</b> để được <b>miễn phí vận chuyển</b>
                      </Typography>
                      {/* progress bar */}
                      <Box sx={{ mt: 0.8, height: 4, bgcolor: "#fed7aa", borderRadius: 2, overflow: "hidden" }}>
                        <Box sx={{ width: `${Math.min((subtotal / 2000000) * 100, 100)}%`, height: "100%", bgcolor: "#f97316", borderRadius: 2, transition: "width .4s ease" }} />
                      </Box>
                    </Box>
                  )}

                  <Divider sx={{ my: 2, borderColor: T.border }} />

                  <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", mb: 2.5 }}>
                    <Typography sx={{ fontWeight: 700, color: T.text, fontSize: "1rem" }}>Tổng cộng</Typography>
                    <Typography sx={{ fontWeight: 800, color: T.red, fontSize: "1.3rem" }}>{fmt(total)}</Typography>
                  </Box>

                  <Button fullWidth onClick={() => navigate("/checkout")} disabled={selectedIds.length === 0}
                    startIcon={<CreditCard size={18} />}
                    sx={{
                      bgcolor: T.red, color: "#fff", fontWeight: 700, py: 1.4,
                      borderRadius: 2, textTransform: "none", fontSize: "0.95rem",
                      boxShadow: "0 4px 16px rgba(230,0,35,0.3)",
                      "&:hover": { bgcolor: T.redHover, boxShadow: "0 6px 20px rgba(230,0,35,0.4)" },
                      "&.Mui-disabled": { bgcolor: "#e2e8f0", color: "#94a3b8" },
                      transition: "all .2s ease",
                    }}>
                    Tiến hành thanh toán
                  </Button>

                  {/* trust */}
                  <Divider sx={{ my: 2, borderColor: T.border }} />
                  {[
                    { icon: <Truck size={15} />, t: "Giao hàng toàn quốc" },
                    { icon: <Shield size={15} />, t: "Bảo hành chính hãng 12 tháng" },
                    { icon: <PackageCheck size={15} />, t: "Đổi trả miễn phí trong 7 ngày" },
                  ].map((b, i) => (
                    <Box key={i} sx={{ display: "flex", alignItems: "center", gap: 1, mb: 0.8 }}>
                      <Box sx={{ color: T.green }}>{b.icon}</Box>
                      <Typography sx={{ color: T.textSub, fontSize: "0.78rem" }}>{b.t}</Typography>
                    </Box>
                  ))}
                </Box>
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Box>
    </MainLayout>
  );
};

/* ─── helper row ─── */
const Row = ({ label, value, valueColor }: { label: string; value: string; valueColor?: string }) => (
  <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1.2 }}>
    <Typography sx={{ color: "#64748b", fontSize: "0.85rem" }}>{label}</Typography>
    <Typography sx={{ fontWeight: 600, color: valueColor || "#1e293b", fontSize: "0.85rem" }}>{value}</Typography>
  </Box>
);

export default Cart;
import { useState, useEffect, useRef, useCallback } from "react";
import {
  AppBar, Toolbar, Box, IconButton, InputBase,
  Typography, Badge, Button, Container, Menu,
  MenuItem, Paper, List, ListItemButton, ListItemText,
  CircularProgress, Divider, Avatar, ClickAwayListener,
} from "@mui/material";
import { Search, FavoriteBorder, ShoppingBagOutlined, PersonOutline } from "@mui/icons-material";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import type { RootState, AppDispatch } from "../../store/store";
import { logoutUser, fetchUserProfile } from "../../store/slices/authSlice";
import { fetchCart } from "../../store/slices/cartSlice";
import { X, TrendingUp } from "lucide-react";
import axiosPickleball from "../../api/axiosPickleball";
import logoImage from "../../assets/logo/image.png";
import { Product } from "../../types";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";

const getImageUrl = (img?: string) => {
  if (!img) return undefined;
  if (img.startsWith("http")) return img;
  return `${API_URL}${img.startsWith("/") ? "" : "/"}${img}`;
};

function useDebounce<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  return debounced;
}

const TRENDING_KEYWORDS = ["Vợt Pickleball", "Giày Pickleball", "Bóng Pickleball", "Phụ kiện", "Túi đựng vợt"];

const navItems = [
  { label: "Trang Chủ", path: "/" },
  { label: "Sản Phẩm", path: "/products" },
  { label: "Giới thiệu", path: "/about" },
  { label: "Đơn hàng", path: "/orders" },
  { label: "Giỏ hàng", path: "/cart" },
];

const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch<AppDispatch>();

  const cartItems = useSelector((state: RootState) => state.cart.items);
  const cartCount = Array.isArray(cartItems)
    ? cartItems.reduce((sum, item) => sum + (item.qty || 0), 0)
    : 0;
  const authState = useSelector((state: RootState) => state.auth);
  const isAuthenticated = Boolean(authState?.isAuthenticated);
  const user = authState?.user;

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchFocused, setSearchFocused] = useState(false);
  const [suggestions, setSuggestions] = useState<Product[]>([]);
  const [suggestLoading, setSuggestLoading] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  const debouncedQuery = useDebounce(searchQuery, 350);
  const hasFetchedRef = useRef(false);

  // Fetch full user profile (including avatar) and cart when authenticated
  useEffect(() => {
    if (isAuthenticated && !hasFetchedRef.current) {
      hasFetchedRef.current = true;
      dispatch(fetchUserProfile());
      dispatch(fetchCart());
    }
    if (!isAuthenticated) {
      hasFetchedRef.current = false;
    }
  }, [isAuthenticated, dispatch]);

  useEffect(() => {
    if (!debouncedQuery.trim() || debouncedQuery.length < 2) {
      setSuggestions([]);
      return;
    }

    const fetchSuggestions = async () => {
      try {
        setSuggestLoading(true);
        const res = (await axiosPickleball.get(
          `/api/products/search?search=${encodeURIComponent(debouncedQuery)}&limit=5`
        )) as { data?: Product[]; products?: Product[] };
        setSuggestions(res?.data || res?.products || []);
      } catch {
        setSuggestions([]);
      } finally {
        setSuggestLoading(false);
      }
    };

    fetchSuggestions();
  }, [debouncedQuery]);

  const handleSearch = useCallback((q?: string) => {
    const query = (q || searchQuery).trim();
    if (!query) return;
    setSearchFocused(false);
    setSuggestions([]);
    navigate(`/search?q=${encodeURIComponent(query)}`);
  }, [searchQuery, navigate]);

  const handleSuggestionClick = (product: Product) => {
    setSearchFocused(false);
    setSuggestions([]);
    setSearchQuery("");
    navigate(`/product/${product._id}`);
  };

  const handleLogout = () => {
    dispatch(logoutUser());
    setAnchorEl(null);
    navigate("/");
  };

  const showDropdown = searchFocused && (
    suggestions.length > 0 ||
    suggestLoading ||
    searchQuery.length === 0
  );

  return (
    <AppBar
      position="sticky"
      elevation={0}
      sx={{
        bgcolor: "#FFFFFF",
        color: "#0F172A",
        borderBottom: "1px solid #EEF2F6",
        boxShadow: "0 8px 30px rgba(15,23,42,0.04)",
        zIndex: 1100,
      }}
    >
      <Container maxWidth="xl">
        <Toolbar
          disableGutters
          sx={{
            minHeight: { xs: 66, md: 78 },
            display: "grid",
            gridTemplateColumns: {
              xs: "auto 1fr auto",
              md: "320px minmax(390px, 1fr) 260px auto",
              lg: "360px minmax(520px, 1fr) 300px auto",
            },
            alignItems: "center",
            gap: { xs: 1, md: 1.6 },
          }}
        >
          <Box
            component={Link}
            to="/"
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1.4,
              color: "#0F172A",
              textDecoration: "none",
              minWidth: 0,
            }}
          >
            <Box
              sx={{
                width: { xs: 44, md: 50 },
                height: { xs: 44, md: 50 },
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                overflow: "hidden",
                transition: "transform 0.3s ease",
                "&:hover": { transform: "scale(1.05)" },
              }}
            >
              <img
                src={logoImage}
                alt="Pickleball Bạch Đằng Logo"
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "contain",
                }}
              />
            </Box>
            <Box sx={{ display: { xs: "none", sm: "block" }, lineHeight: 1.05 }}>
              <Typography
                sx={{
                  fontSize: { sm: 20, md: 23 },
                  fontWeight: 950,
                  letterSpacing: 0.2,
                  whiteSpace: "nowrap",
                  color: "#0F172A",
                }}
              >
                PICKLEBALL
              </Typography>
              <Typography
                sx={{
                  fontSize: { sm: 11, md: 12 },
                  fontWeight: 900,
                  letterSpacing: 1.3,
                  whiteSpace: "nowrap",
                  color: "#0F766E",
                }}
              >
                BẠCH ĐẰNG
              </Typography>
            </Box>
          </Box>

          <Box
            component="nav"
            sx={{
              display: { xs: "none", md: "flex" },
              justifyContent: "center",
              alignItems: "center",
              gap: { md: 0.5, lg: 1 },
              minWidth: 0,
            }}
          >
            {navItems.map((item) => {
              const active = item.path === "/" ? location.pathname === "/" : location.pathname.startsWith(item.path);
              return (
                <Button
                  key={item.label}
                  onClick={() => navigate(item.path)}
                  sx={{
                    px: { md: 1.35, lg: 2 },
                    py: 1.1,
                    borderRadius: "999px",
                    color: active ? "#3F7D12" : "#475569",
                    bgcolor: active ? "rgba(132,204,22,0.13)" : "transparent",
                    fontSize: { md: 14, lg: 15.5 },
                    fontWeight: 850,
                    whiteSpace: "nowrap",
                    "&:hover": {
                      bgcolor: "rgba(132,204,22,0.13)",
                      color: "#3F7D12",
                    },
                  }}
                >
                  {item.label}
                </Button>
              );
            })}
          </Box>

          <ClickAwayListener onClickAway={() => setSearchFocused(false)}>
            <Box ref={searchRef} sx={{ display: { xs: "none", md: "block" }, position: "relative", minWidth: 0 }}>
              <Box
                sx={{
                  height: 48,
                  bgcolor: "#F1F5F9",
                  border: searchFocused ? "1px solid #84CC16" : "1px solid #E2E8F0",
                  borderRadius: "999px",
                  display: "flex",
                  alignItems: "center",
                  px: 1.8,
                  gap: 1,
                  boxShadow: searchFocused ? "0 0 0 4px rgba(132,204,22,0.14)" : "none",
                  transition: "all 180ms ease",
                }}
              >
                <Search sx={{ color: "#64748B", fontSize: 24 }} />
                <InputBase
                  placeholder="Tìm vợt Joola, Selkirk..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => setSearchFocused(true)}
                  onKeyDown={(e) => { if (e.key === "Enter") handleSearch(); }}
                  sx={{
                    flex: 1,
                  fontSize: 14,
                    color: "#0F172A",
                    "& input::placeholder": { color: "#94A3B8", opacity: 1 },
                  }}
                />
                {searchQuery && (
                  <IconButton size="small" onClick={() => setSearchQuery("")} sx={{ color: "#94A3B8", p: 0.3 }}>
                    <X size={15} />
                  </IconButton>
                )}
                {suggestLoading && <CircularProgress size={16} sx={{ color: "#0F766E" }} />}
              </Box>

              {showDropdown && (
                <Paper
                  elevation={10}
                  sx={{
                    position: "absolute",
                    top: "calc(100% + 10px)",
                    left: 0,
                    right: 0,
                    borderRadius: "18px",
                    overflow: "hidden",
                    zIndex: 1200,
                    border: "1px solid #E2E8F0",
                    boxShadow: "0 18px 45px rgba(15,23,42,0.16)",
                    maxHeight: 460,
                    overflowY: "auto",
                  }}
                >
                  {searchQuery.length === 0 && (
                    <Box sx={{ p: 2 }}>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1.5 }}>
                        <TrendingUp size={16} color="#65A30D" />
                        <Typography variant="caption" sx={{ fontWeight: 900, color: "#64748B", textTransform: "uppercase" }}>
                          Tìm kiếm phổ biến
                        </Typography>
                      </Box>
                      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                        {TRENDING_KEYWORDS.map((kw) => (
                          <Box
                            key={kw}
                            onClick={() => { setSearchQuery(kw); handleSearch(kw); }}
                            sx={{
                              px: 1.4,
                              py: 0.7,
                              bgcolor: "#F8FAFC",
                              borderRadius: 99,
                              cursor: "pointer",
                              fontSize: "0.82rem",
                              color: "#334155",
                              fontWeight: 700,
                              border: "1px solid #E2E8F0",
                              "&:hover": { bgcolor: "rgba(132,204,22,0.12)", color: "#3F7D12", borderColor: "rgba(132,204,22,0.36)" },
                            }}
                          >
                            {kw}
                          </Box>
                        ))}
                      </Box>
                    </Box>
                  )}

                  {suggestions.length > 0 && (
                    <>
                      {searchQuery.length === 0 && <Divider />}
                      <Box sx={{ px: 2, py: 1 }}>
                        <Typography variant="caption" sx={{ fontWeight: 900, color: "#64748B", textTransform: "uppercase" }}>
                          Sản phẩm gợi ý
                        </Typography>
                      </Box>
                      <List dense disablePadding>
                        {suggestions.map((product) => (
                          <ListItemButton
                            key={product._id}
                            onClick={() => handleSuggestionClick(product)}
                            sx={{ px: 2, py: 1, "&:hover": { bgcolor: "rgba(132,204,22,0.08)" } }}
                          >
                            <Box
                              component="img"
                              src={getImageUrl(product.image?.[0]) || "/placeholder.png"}
                              alt={product.name}
                              sx={{
                                width: 46,
                                height: 46,
                                objectFit: "contain",
                                border: "1px solid #E2E8F0",
                                borderRadius: "12px",
                                bgcolor: "#F8FAFC",
                                p: 0.35,
                                mr: 1.5,
                                flexShrink: 0,
                              }}
                            />
                            <ListItemText
                              primary={
                                <Typography variant="body2" sx={{ fontWeight: 750, color: "#0F172A", fontSize: "0.88rem" }}>
                                  {product.name}
                                </Typography>
                              }
                              secondary={
                                <Typography variant="caption" sx={{ color: "#0F766E", fontWeight: 850 }}>
                                  {(product.salePrice || product.price).toLocaleString("vi-VN")}đ
                                </Typography>
                              }
                            />
                          </ListItemButton>
                        ))}
                      </List>
                    </>
                  )}

                  {!suggestLoading && searchQuery.length >= 2 && suggestions.length === 0 && (
                    <Box sx={{ p: 3, textAlign: "center" }}>
                      <Typography variant="body2" sx={{ color: "#64748B" }}>
                        Không tìm thấy sản phẩm nào cho "{searchQuery}"
                      </Typography>
                    </Box>
                  )}
                </Paper>
              )}
            </Box>
          </ClickAwayListener>

          <Box sx={{ display: "flex", justifyContent: "flex-end", alignItems: "center", gap: { xs: 0.6, md: 1.15 } }}>
            <IconButton
              onClick={() => navigate("/products")}
              sx={{
                display: { xs: "none", sm: "inline-flex" },
                color: "#334155",
                width: 42,
                height: 42,
                "&:hover": { bgcolor: "rgba(132,204,22,0.14)", color: "#3F7D12" },
              }}
            >
              <FavoriteBorder sx={{ fontSize: 25 }} />
            </IconButton>

            <IconButton
              onClick={() => navigate("/cart")}
              sx={{
                width: 46,
                height: 46,
                bgcolor: "rgba(132,204,22,0.16)",
                color: "#3F7D12",
                "&:hover": { bgcolor: "#84CC16", color: "#0F172A" },
              }}
            >
              <Badge
                color="error"
                badgeContent={cartCount > 0 ? cartCount : undefined}
                sx={{
                  "& .MuiBadge-badge": {
                    fontSize: "0.68rem",
                    minWidth: 17,
                    height: 17,
                    bgcolor: "#0F766E",
                    color: "#fff",
                    fontWeight: 900,
                  },
                }}
              >
                <ShoppingBagOutlined sx={{ fontSize: 24 }} />
              </Badge>
            </IconButton>

            {isAuthenticated ? (
              <>
                <IconButton
                  onClick={(e) => setAnchorEl(e.currentTarget)}
                  sx={{
                    width: 46,
                    height: 46,
                    bgcolor: "#0F172A",
                    color: "#fff",
                    "&:hover": { bgcolor: "#0F766E" },
                  }}
                >
                  <Avatar
                    src={getImageUrl(user?.avatar)}
                    sx={{ width: 30, height: 30, bgcolor: "transparent", color: "#fff", fontSize: "0.86rem", fontWeight: 900 }}
                  >
                    {user?.name?.charAt(0).toUpperCase() || "U"}
                  </Avatar>
                </IconButton>
                <Menu
                  anchorEl={anchorEl}
                  open={Boolean(anchorEl)}
                  onClose={() => setAnchorEl(null)}
                  transformOrigin={{ horizontal: "right", vertical: "top" }}
                  anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
                  PaperProps={{
                    sx: {
                      borderRadius: "16px",
                      mt: 1,
                      minWidth: 200,
                      boxShadow: "0 16px 36px rgba(15,23,42,0.16)",
                      border: "1px solid #E2E8F0",
                    },
                  }}
                >
                  <Box sx={{ px: 2, py: 1.5, borderBottom: "1px solid #F1F5F9" }}>
                    <Typography variant="body2" sx={{ fontWeight: 850, color: "#0F172A" }}>{user?.name}</Typography>
                    <Typography variant="caption" sx={{ color: "#64748B" }}>{user?.email}</Typography>
                  </Box>
                  <MenuItem onClick={() => { setAnchorEl(null); navigate("/profile"); }}>Hồ sơ của tôi</MenuItem>
                  <MenuItem onClick={() => { setAnchorEl(null); navigate("/orders"); }}>Đơn hàng của tôi</MenuItem>
                  {(user?.role === "admin" || user?.role === "manager") && (
                    <MenuItem onClick={() => { setAnchorEl(null); navigate("/admin"); }} sx={{ color: "#0F766E", fontWeight: 800 }}>
                      Quản trị Admin
                    </MenuItem>
                  )}
                  <Divider />
                  <MenuItem onClick={handleLogout} sx={{ color: "#ef4444" }}>Đăng xuất</MenuItem>
                </Menu>
              </>
            ) : (
              <IconButton
                component={Link}
                to="/login"
                sx={{
                    width: 46,
                    height: 46,
                  bgcolor: "#0F172A",
                  color: "#fff",
                  "&:hover": { bgcolor: "#0F766E" },
                }}
              >
                <PersonOutline sx={{ fontSize: 24 }} />
              </IconButton>
            )}
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
};

export default Header;

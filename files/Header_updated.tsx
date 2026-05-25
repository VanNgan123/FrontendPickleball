import { useState, useEffect, useRef, useCallback } from "react";
import {
  AppBar, Toolbar, Box, IconButton, InputBase,
  Typography, Badge, Button, Container, Menu,
  MenuItem, Paper, List, ListItemButton, ListItemText,
  CircularProgress, Divider, Avatar, ClickAwayListener,
} from "@mui/material";
import PersonOutlineIcon from "@mui/icons-material/PersonOutline";
import MenuIcon from "@mui/icons-material/Menu";
import { ShoppingCart, Search, Phone } from "@mui/icons-material";
import { Link, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import type { RootState, AppDispatch } from "../../store/store";
import { logout } from "../../store/slices/authSlice";
import { X, TrendingUp } from "lucide-react";
import axiosPickleball from "../../api/axiosPickleball";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";

const getImageUrl = (img?: string) => {
  if (!img) return undefined;
  if (img.startsWith("http")) return img;
  return `${API_URL}${img.startsWith("/") ? "" : "/"}${img}`;
};

// ── Debounce hook ──
function useDebounce<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  return debounced;
}

const TRENDING_KEYWORDS = ["Vợt Pickleball", "Giày thể thao", "Bóng Pickleball", "Phụ kiện", "Túi đựng vợt"];

const Header = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();

  const cartItems = useSelector((state: RootState) => state.cart.items);
  const cartCount = cartItems.reduce((sum, item) => sum + item.qty, 0);
  const authState = useSelector((state: RootState) => state.auth);
  const isAuthenticated = Boolean(authState?.isAuthenticated);
  const user = authState?.user;

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchFocused, setSearchFocused] = useState(false);
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [suggestLoading, setSuggestLoading] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  const debouncedQuery = useDebounce(searchQuery, 350);

  // Fetch suggestions khi query thay đổi
  useEffect(() => {
    if (!debouncedQuery.trim() || debouncedQuery.length < 2) {
      setSuggestions([]);
      return;
    }
    const fetchSuggestions = async () => {
      try {
        setSuggestLoading(true);
        const res = await axiosPickleball.get(
          `/api/products/search?search=${encodeURIComponent(debouncedQuery)}&limit=5`
        ) as any;
        setSuggestions(res?.products || []);
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

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleSearch();
  };

  const handleSuggestionClick = (product: any) => {
    setSearchFocused(false);
    setSuggestions([]);
    setSearchQuery("");
    navigate(`/product/${product._id}`);
  };

  const handleClearSearch = () => {
    setSearchQuery("");
    setSuggestions([]);
  };

  const handleLogout = () => {
    dispatch(logout());
    setAnchorEl(null);
    navigate("/");
  };

  const showDropdown = searchFocused && (
    suggestions.length > 0 ||
    suggestLoading ||
    (searchQuery.length === 0)
  );

  return (
    <>
      {/* ===== TẦNG 1 ===== */}
      <AppBar position="sticky" sx={{ background: "#08222f", paddingY: 1, zIndex: 1100 }}>
        <Container maxWidth="xl">
          <Toolbar sx={{ display: "flex", alignItems: "center", ml: { md: 10 }, mr: { md: 5 } }}>
            {/* Logo */}
            <Box sx={{ display: "flex", alignItems: "center", mr: 5, flexShrink: 0 }}>
              <Typography
                variant="h3" component={Link} to="/"
                style={{ color: "#FFFFFF", textDecoration: "none", fontWeight: "bold" }}
              >
                🎾
              </Typography>
              <Typography
                variant="h6" component={Link} to="/"
                sx={{ color: "#FFFFFF", textDecoration: "none", fontFamily: "cursive", letterSpacing: "1px", display: { xs: "none", md: "block" } }}
              >
                PICKLEBALL BẠCH ĐẰNG
              </Typography>
            </Box>

            {/* ── SEARCH BAR ── */}
            <ClickAwayListener onClickAway={() => setSearchFocused(false)}>
              <Box ref={searchRef} sx={{ flexGrow: 1, position: "relative", mr: { xs: 2, md: 8 } }}>
                {/* Input */}
                <Box
                  sx={{
                    bgcolor: "#FFFFFF",
                    padding: "3px 10px",
                    borderRadius: 2,
                    display: "flex",
                    alignItems: "center",
                    border: searchFocused ? "2px solid #E60023" : "2px solid transparent",
                    transition: "border-color 0.2s ease",
                  }}
                >
                  <Search
                    sx={{ color: searchFocused ? "#E60023" : "#111", cursor: "pointer", transition: "color 0.2s" }}
                    onClick={() => handleSearch()}
                  />
                  <InputBase
                    placeholder="Bạn muốn tìm kiếm sản phẩm gì?"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onFocus={() => setSearchFocused(true)}
                    onKeyDown={handleKeyDown}
                    sx={{ ml: 1, flex: 1, fontSize: "0.9rem" }}
                  />
                  {/* Clear button */}
                  {searchQuery && (
                    <IconButton size="small" onClick={handleClearSearch} sx={{ color: "#aaa", p: 0.3 }}>
                      <X size={16} />
                    </IconButton>
                  )}
                  {suggestLoading && (
                    <CircularProgress size={16} sx={{ color: "#E60023", ml: 0.5 }} />
                  )}
                </Box>

                {/* ── Dropdown ── */}
                {showDropdown && (
                  <Paper
                    elevation={8}
                    sx={{
                      position: "absolute",
                      top: "calc(100% + 6px)",
                      left: 0, right: 0,
                      borderRadius: 2,
                      overflow: "hidden",
                      zIndex: 1200,
                      border: "1px solid #f0f0f0",
                      maxHeight: 480,
                      overflowY: "auto",
                    }}
                  >
                    {/* Trending khi chưa nhập */}
                    {searchQuery.length === 0 && (
                      <Box sx={{ p: 2 }}>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1.5 }}>
                          <TrendingUp size={15} color="#E60023" />
                          <Typography variant="caption" sx={{ fontWeight: 800, color: "#888", textTransform: "uppercase", letterSpacing: 0.5 }}>
                            Tìm kiếm phổ biến
                          </Typography>
                        </Box>
                        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                          {TRENDING_KEYWORDS.map((kw) => (
                            <Box
                              key={kw}
                              onClick={() => { setSearchQuery(kw); handleSearch(kw); }}
                              sx={{
                                px: 1.5, py: 0.6,
                                bgcolor: "#f5f5f5", borderRadius: 10,
                                cursor: "pointer", fontSize: "0.8rem", color: "#555", fontWeight: 600,
                                "&:hover": { bgcolor: "rgba(230,0,35,0.08)", color: "#E60023" },
                                transition: "all 0.15s",
                              }}
                            >
                              {kw}
                            </Box>
                          ))}
                        </Box>
                      </Box>
                    )}

                    {/* Suggestions */}
                    {suggestions.length > 0 && (
                      <>
                        {searchQuery.length === 0 && <Divider />}
                        <Box sx={{ px: 2, py: 1 }}>
                          <Typography variant="caption" sx={{ fontWeight: 800, color: "#888", textTransform: "uppercase", letterSpacing: 0.5 }}>
                            Sản phẩm gợi ý
                          </Typography>
                        </Box>
                        <List dense disablePadding>
                          {suggestions.map((product) => (
                            <ListItemButton
                              key={product._id}
                              onClick={() => handleSuggestionClick(product)}
                              sx={{
                                px: 2, py: 1,
                                "&:hover": { bgcolor: "rgba(230,0,35,0.04)" },
                              }}
                            >
                              {/* Product image */}
                              <Box
                                component="img"
                                src={getImageUrl(product.image?.[0]) || "/placeholder.png"}
                                alt={product.name}
                                sx={{ width: 44, height: 44, objectFit: "contain", border: "1px solid #eee", borderRadius: 1, bgcolor: "#fafafa", p: 0.3, mr: 1.5, flexShrink: 0 }}
                              />
                              <ListItemText
                                primary={
                                  <Typography variant="body2" sx={{ fontWeight: 600, color: "#1a1a1a", fontSize: "0.85rem" }}>
                                    {product.name}
                                  </Typography>
                                }
                                secondary={
                                  <Typography variant="caption" sx={{ color: "#E60023", fontWeight: 700 }}>
                                    {(product.salePrice || product.price).toLocaleString("vi-VN")}đ
                                  </Typography>
                                }
                              />
                            </ListItemButton>
                          ))}
                        </List>

                        {/* View all results */}
                        <Divider />
                        <Box
                          onClick={() => handleSearch()}
                          sx={{
                            px: 2, py: 1.5, cursor: "pointer",
                            display: "flex", alignItems: "center", justifyContent: "center", gap: 1,
                            "&:hover": { bgcolor: "rgba(230,0,35,0.04)" },
                          }}
                        >
                          <Search sx={{ fontSize: 16, color: "#E60023" }} />
                          <Typography variant="body2" sx={{ color: "#E60023", fontWeight: 700 }}>
                            Xem tất cả kết quả cho "{searchQuery}"
                          </Typography>
                        </Box>
                      </>
                    )}

                    {/* No results */}
                    {!suggestLoading && searchQuery.length >= 2 && suggestions.length === 0 && (
                      <Box sx={{ p: 3, textAlign: "center" }}>
                        <Typography variant="body2" sx={{ color: "#888" }}>
                          Không tìm thấy sản phẩm nào cho "{searchQuery}"
                        </Typography>
                      </Box>
                    )}
                  </Paper>
                )}
              </Box>
            </ClickAwayListener>

            {/* HOTLINE */}
            <Box sx={{
              display: { xs: "none", lg: "flex" },
              alignItems: "center", color: "#f80808",
              fontWeight: "bold", border: "1px solid #fcfcfc",
              borderRadius: 3, padding: "5px 20px", flexShrink: 0,
            }}>
              <Phone sx={{ mr: 1 }} />
              <Typography sx={{ fontSize: "0.85rem" }}>0387023315</Typography>
            </Box>

            {/* CART */}
            <IconButton
              onClick={() => navigate("/cart")}
              sx={{ color: "#FFFFFF", ml: { xs: 1, md: 3 }, "&:hover": { backgroundColor: "#f11313" } }}
            >
              <Badge
                color="error"
                badgeContent={cartCount > 0 ? cartCount : undefined}
                sx={{ "& .MuiBadge-badge": { fontSize: "0.65rem", minWidth: 18, height: 18 } }}
              >
                <ShoppingCart />
              </Badge>
            </IconButton>

            {/* USER */}
            <Box sx={{ display: "flex", alignItems: "center", ml: 1 }}>
              {isAuthenticated ? (
                <>
                  <Button
                    onClick={(e) => setAnchorEl(e.currentTarget)}
                    sx={{
                      color: "white", textTransform: "none", ml: 1,
                      "&:hover": { backgroundColor: "#f11313" },
                      display: "flex", alignItems: "center", gap: 1,
                    }}
                  >
                    <Avatar sx={{ width: 28, height: 28, bgcolor: "#E60023", fontSize: "0.75rem", fontWeight: 700 }}>
                      {user?.name?.charAt(0).toUpperCase() || "U"}
                    </Avatar>
                    <Typography sx={{ fontSize: "0.85rem", display: { xs: "none", md: "block" } }}>
                      {user?.name?.split(" ").slice(-1)[0] || "Tài khoản"}
                    </Typography>
                  </Button>
                  <Menu
                    anchorEl={anchorEl}
                    open={Boolean(anchorEl)}
                    onClose={() => setAnchorEl(null)}
                    transformOrigin={{ horizontal: "right", vertical: "top" }}
                    anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
                    PaperProps={{
                      sx: {
                        borderRadius: 2, mt: 1, minWidth: 180,
                        boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
                        border: "1px solid #f0f0f0",
                      },
                    }}
                  >
                    <Box sx={{ px: 2, py: 1.5, borderBottom: "1px solid #f5f5f5" }}>
                      <Typography variant="body2" sx={{ fontWeight: 700, color: "#1a1a1a" }}>
                        {user?.name}
                      </Typography>
                      <Typography variant="caption" sx={{ color: "#888" }}>{user?.email}</Typography>
                    </Box>
                    <MenuItem onClick={() => { setAnchorEl(null); navigate("/profile"); }}
                      sx={{ fontSize: "0.875rem", py: 1.2 }}>
                      👤 Hồ sơ của tôi
                    </MenuItem>
                    <MenuItem onClick={() => { setAnchorEl(null); navigate("/orders"); }}
                      sx={{ fontSize: "0.875rem", py: 1.2 }}>
                      📦 Đơn hàng của tôi
                    </MenuItem>
                    {(user?.role === "admin" || user?.role === "manager") && (
                      <MenuItem onClick={() => { setAnchorEl(null); navigate("/admin"); }}
                        sx={{ fontSize: "0.875rem", py: 1.2, color: "#E60023", fontWeight: 700 }}>
                        ⚙️ Quản trị Admin
                      </MenuItem>
                    )}
                    <Divider />
                    <MenuItem onClick={handleLogout}
                      sx={{ fontSize: "0.875rem", py: 1.2, color: "#ef4444" }}>
                      🚪 Đăng xuất
                    </MenuItem>
                  </Menu>
                </>
              ) : (
                <Button
                  component={Link} to="/login"
                  sx={{ color: "white", ml: 1, "&:hover": { backgroundColor: "#f11313" } }}
                >
                  <PersonOutlineIcon sx={{ fontSize: 28 }} />
                </Button>
              )}
            </Box>
          </Toolbar>
        </Container>
      </AppBar>

      {/* ===== TẦNG 2 - NAV ===== */}
      <Box sx={{ background: "#fffdfd", boxShadow: "0 2px 5px rgba(168,163,163,0.25)", p: 0, m: 0 }}>
        <Container maxWidth="xl">
          <Box sx={{ display: "flex", gap: 4 }}>
            <Box sx={{
              backgroundColor: "#ba0000", textAlign: "left",
              ml: { md: 15 }, fontWeight: "bold", color: "#fff",
              fontSize: 16, padding: "5px 45px",
              display: "flex", alignItems: "center",
            }}>
              <IconButton size="large" color="inherit" sx={{ mr: 1 }}>
                <MenuIcon />
              </IconButton>
              DANH MỤC SẢN PHẨM
            </Box>
          </Box>
        </Container>
      </Box>
    </>
  );
};

export default Header;

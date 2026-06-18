import { useEffect, useRef } from "react";
import type { Product } from "../../types";
import { useNavigate } from "react-router-dom";
import {
  Box, Container, Typography, Paper, Button, Divider, IconButton,
  Fab, Tooltip, CircularProgress,
} from "@mui/material";
import Grid from "@mui/material/Grid";
import {
  ChevronLeft, ChevronRight, Zap, Map as MapIcon, Phone, MessageCircle,
  Shield, Truck, Headphones, Activity, CircleDot, Footprints, Layers, Shirt,
} from "lucide-react";

import Banner from "../../components/Banner";
import MainLayout from "../../layout/MainLayout/MainLayout";
import Countdown from "../../components/Countdown";
import CompactProductCard from "../../components/CompactProductCard";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "../../store/store";
import { fetchAllProducts } from "../../store/slices/productSlice";
import { fetchCategories } from "../../store/slices/categorySlice";
import banner1 from "../../assets/banner/banner1.jpg";
import banner2 from "../../assets/banner/banner2.jpg";
import banner3 from "../../assets/banner/banner3.jpg";
import banner4 from "../../assets/banner/banner4.jpg";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";

// Horizontal scrollable carousel component
const ProductCarousel = ({
  products,
  title,
  titleBgColor = "#002c4b",
  showViewAll = true,
  onViewAll,
}: {
  products: Product[];
  title: string;
  titleBgColor?: string;
  showViewAll?: boolean;
  onViewAll?: () => void;
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  return (
    <Box sx={{ mb: 5, px: { xs: 2, md: 6 } }}>
      {/* Section Header */}
      <Box sx={{
        display: "flex", justifyContent: "space-between", alignItems: "center", mb: 0,
      }}>
        <Box sx={{
          display: "inline-block", bgcolor: titleBgColor, color: "white",
          px: 3, py: 0.8, fontWeight: 800, fontSize: "0.9rem",
          textTransform: "uppercase", borderRadius: "4px 4px 0 0",
        }}>
          {title}
        </Box>
        {showViewAll && (
          <Typography
            variant="body2"
            onClick={onViewAll}
            sx={{
              color: "#0F766E", fontWeight: 600, cursor: "pointer",
              "&:hover": { textDecoration: "underline" },
            }}
          >
            Xem tất cả →
          </Typography>
        )}
      </Box>
      <Box sx={{ height: 2, bgcolor: titleBgColor, mb: 2 }} />

      {/* Carousel */}
      <Box sx={{ position: "relative" }}>
        <IconButton
          size="small"
          onClick={() => scrollRef.current?.scrollBy({ left: -300, behavior: "smooth" })}
          sx={{
            position: "absolute", left: -16, top: "50%", transform: "translateY(-50%)",
            zIndex: 2, bgcolor: "white", boxShadow: 2,
            "&:hover": { bgcolor: "#0F766E", color: "white" },
            transition: "all 0.3s ease", color: "#1a1a1a",
          }}
        >
          <ChevronLeft size={18} />
        </IconButton>
        <Box
          ref={scrollRef}
          sx={{
            display: "flex", gap: 2, overflowX: "auto", scrollBehavior: "smooth",
            "&::-webkit-scrollbar": { display: "none" }, scrollbarWidth: "none", pb: 2, px: 1,
          }}
        >
          {products.map((p) => (
            <Box key={p._id} sx={{ width: { xs: "70%", sm: "45%", md: "24%", lg: "18%" }, minWidth: { xs: "70%", sm: "45%", md: "24%", lg: "18%" }, flexShrink: 0 }}>
              <CompactProductCard product={p} />
            </Box>
          ))}
        </Box>
        <IconButton
          size="small"
          onClick={() => scrollRef.current?.scrollBy({ left: 300, behavior: "smooth" })}
          sx={{
            position: "absolute", right: -16, top: "50%", transform: "translateY(-50%)",
            zIndex: 2, bgcolor: "white", boxShadow: 2,
            "&:hover": { bgcolor: "#0F766E", color: "white" },
            transition: "all 0.3s ease", color: "#1a1a1a",
          }}
        >
          <ChevronRight size={18} />
        </IconButton>
      </Box>
    </Box>
  );
};

const categoryVisuals = [
  { image: banner1, icon: Activity },
  { image: banner3, icon: CircleDot },
  { image: banner4, icon: Footprints },
  { image: banner2, icon: Layers },
  { image: banner1, icon: Shirt },
];

const CategoryShowcase = ({
  categories,
  products,
  getImageUrl,
  onSelect,
}: {
  categories: { _id: string; name: string; slug?: string; image?: string; parentId?: string | null }[];
  products: Product[];
  getImageUrl: (imagePath?: string) => string;
  onSelect: (categoryId: string) => void;
}) => {
  const displayCategories = categories.slice(0, 5);

  if (displayCategories.length === 0) return null;

  const normalize = (value?: string | null) => String(value || "").trim().toLowerCase();

  const getProductCount = (category: { _id: string; name: string; slug?: string }) => {
    const relatedCategories = categories.filter(
      (item) => item._id === category._id || item.parentId === category._id
    );

    const relatedIds = new Set(relatedCategories.map((item) => item._id));
    const relatedNames = new Set(relatedCategories.map((item) => normalize(item.name)));
    const relatedSlugs = new Set(relatedCategories.map((item) => normalize(item.slug)));

    return products.filter((product) =>
      product.categories?.some((cat: string | { _id: string; name: string; slug?: string }) => {
        if (!cat) return false;
        if (typeof cat === "object") {
          return (
            relatedIds.has(cat._id) ||
            relatedNames.has(normalize(cat.name)) ||
            relatedSlugs.has(normalize(cat.slug))
          );
        }

        const rawCategory = normalize(cat);
        return (
          relatedIds.has(cat) ||
          relatedNames.has(rawCategory) ||
          relatedSlugs.has(rawCategory)
        );
      })
    ).length;
  };

  return (
    <Box sx={{ py: { xs: 5, md: 7 }, px: { xs: 0, md: 1 } }}>
      <Box sx={{ textAlign: "center", maxWidth: 760, mx: "auto", mb: { xs: 3.5, md: 5 } }}>
        <Typography
          sx={{
            color: "#58a700",
            fontSize: 13,
            fontWeight: 900,
            letterSpacing: 3.2,
            textTransform: "uppercase",
            mb: 1.5,
          }}
        >
          Sản phẩm đầu ngành
        </Typography>
        <Typography
          component="h2"
          sx={{
            color: "#061b35",
            fontSize: { xs: 32, md: 48 },
            lineHeight: 1.08,
            fontWeight: 950,
            mb: 2,
          }}
        >
          Danh Mục Đồ Chơi Pickleball
        </Typography>
        <Typography sx={{ color: "#64748b", fontSize: { xs: 15, md: 20 }, lineHeight: 1.55 }}>
          Lên đồ chuẩn chỉ từ đầu đến gót chân với các phân nhóm chuyên sâu. Click vào danh mục để xem dải sản phẩm tương ứng.
        </Typography>
      </Box>

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: {
            xs: "1fr",
            sm: "repeat(2, minmax(0, 1fr))",
            md: "repeat(3, minmax(0, 1fr))",
            lg: "repeat(5, minmax(0, 1fr))",
          },
          gap: { xs: 2, md: 3 },
        }}
      >
        {displayCategories.map((category, index) => {
          const visual = categoryVisuals[index % categoryVisuals.length];
          const Icon = visual.icon;
          const productCount = getProductCount(category);
          const bgImage = category.image ? getImageUrl(category.image) : visual.image;

          return (
            <Box
              key={category._id}
              onClick={() => onSelect(category._id)}
              sx={{
                position: "relative",
                minHeight: { xs: 260, md: 304 },
                borderRadius: "22px",
                overflow: "hidden",
                cursor: "pointer",
                isolation: "isolate",
                boxShadow: "0 18px 34px rgba(15,23,42,0.12)",
                transform: "translateY(0)",
                transition: "transform 220ms ease, box-shadow 220ms ease",
                "&:hover": {
                  transform: "translateY(-10px)",
                  boxShadow: "0 28px 48px rgba(15,23,42,0.18)",
                },
                "&:hover .category-showcase-icon": {
                  bgcolor: "#84CC16",
                  color: "#0F172A",
                  transform: "translateY(-2px)",
                },
                "&:hover .category-showcase-image": {
                  transform: "scale(1.06)",
                },
              }}
            >
              <Box
                className="category-showcase-image"
                sx={{
                  position: "absolute",
                  inset: 0,
                  backgroundImage: `url(${bgImage})`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                  transition: "transform 420ms ease",
                  zIndex: -3,
                }}
              />
              <Box
                sx={{
                  position: "absolute",
                  inset: 0,
                  bgcolor: index === 2 ? "rgba(144, 202, 32, 0.72)" : "rgba(2, 8, 23, 0.2)",
                  zIndex: -2,
                }}
              />
              <Box
                sx={{
                  position: "absolute",
                  inset: 0,
                  background:
                    "linear-gradient(180deg, rgba(2,8,23,0.08) 0%, rgba(2,8,23,0.28) 42%, rgba(2,8,23,0.86) 100%)",
                  zIndex: -1,
                }}
              />

              <Box
                className="category-showcase-icon"
                sx={{
                  position: "absolute",
                  top: 24,
                  right: 24,
                  width: 56,
                  height: 56,
                  borderRadius: "14px",
                  bgcolor: "rgba(15,23,42,0.58)",
                  color: "#fff",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  backdropFilter: "blur(8px)",
                  transition: "all 220ms ease",
                }}
              >
                <Icon size={29} strokeWidth={2.4} />
              </Box>

              <Box sx={{ position: "absolute", left: 30, right: 24, bottom: 26 }}>
                <Box
                  sx={{
                    width: "fit-content",
                    px: 1.2,
                    py: 0.55,
                    mb: 1.2,
                    borderRadius: "7px",
                    bgcolor: "rgba(84, 141, 10, 0.72)",
                    color: "#9cff1a",
                    fontSize: 14,
                    lineHeight: 1,
                    fontWeight: 950,
                  }}
                >
                  {productCount} Sản Phẩm
                </Box>
                <Typography
                  sx={{
                    color: "#fff",
                    fontSize: { xs: 28, md: 30 },
                    lineHeight: 1.06,
                    fontWeight: 950,
                    textShadow: "0 3px 12px rgba(0,0,0,0.28)",
                    mb: 0.75,
                  }}
                >
                  {category.name}
                </Typography>
                <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
                  <Typography sx={{ color: "#fff", fontSize: 15, fontWeight: 700 }}>
                    Mua ngay
                  </Typography>
                  <ChevronRight size={17} color="#fff" />
                </Box>
              </Box>
            </Box>
          );
        })}
      </Box>
    </Box>
  );
};

const Home = () => {

  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { products, loading } = useSelector((state: RootState) => state.products);
  const { categories } = useSelector((state: RootState) => state.categories);

  useEffect(() => {
    dispatch(fetchAllProducts({ limit: 40 }));
    dispatch(fetchCategories());
  }, [dispatch]);

  // Flash sale products
  const flashSaleProducts = products.filter((p) => p.salePrice && p.salePrice < p.price);
  const flashSaleDisplay = flashSaleProducts.length > 0 ? flashSaleProducts.slice(0, 8) : products.slice(0, 8);

  // New products
  const newProducts = [...products].sort((a, b) =>
    new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
  ).slice(0, 10);

  // Deal of the day
  const dealProduct = flashSaleProducts[0] || products[0];

  // Products per category
  const getProductsByCategory = (categoryId: string) =>
    products.filter((p) =>
      p.categories?.some((cat: string | { _id: string }) =>
        typeof cat === "object" ? cat._id === categoryId : cat === categoryId
      )
    ).slice(0, 10);

  const getImageUrl = (imagePath?: string) => {
    if (!imagePath) return "https://via.placeholder.com/400x400?text=No+Image";
    if (imagePath.startsWith("http")) return imagePath;
    const baseUrl = API_URL.replace(/\/+$/, "");
    const path = imagePath.startsWith("/") ? imagePath : `/${imagePath}`;
    return `${baseUrl}${path.replace(/\\/g, "/")}`;
  };

  const formatPrice = (price: number) => price.toLocaleString("vi-VN") + "đ";

  const dealImageUrl = dealProduct?.image?.[0]
    ? getImageUrl(dealProduct.image[0])
    : "https://via.placeholder.com/400x400?text=No+Image";

  const dealDiscount = dealProduct?.salePrice
    ? Math.round(((dealProduct.price - dealProduct.salePrice) / dealProduct.price) * 100)
    : 8;

  return (
    <>
      <MainLayout>
        <Banner />

        {/* Main Content */}
        <Container maxWidth="xl" sx={{ mt: 3, mb: 4 }}>

          {/* === TRUST BADGES === */}
          <Grid container spacing={2} sx={{ mb: 4 }}>
            {[
              { icon: <Shield size={28} />, title: "HOÀN TIỀN 100%", desc: "Nếu phát hiện hàng giả" },
              { icon: <Truck size={28} />, title: "GIAO HÀNG TOÀN QUỐC", desc: "Miễn phí từ 1 triệu đồng" },
              { icon: <Headphones size={28} />, title: "TƯ VẤN 24/7", desc: "Đội ngũ chuyên môn cao" },
            ].map((item, i) => (
              <Grid size={{ xs: 12, md: 4 }} key={i}>
                <Paper
                  elevation={0}
                  sx={{
                    p: 2.5, display: "flex", alignItems: "center", gap: 2,
                    bgcolor: "#fff", border: "1px solid #eee", borderRadius: 2,
                    transition: "all 0.3s ease",
                    "&:hover": { transform: "translateY(-2px)", boxShadow: "0 4px 15px rgba(0,0,0,0.08)" },
                  }}
                >
                  <Box sx={{ color: "#002c4b" }}>{item.icon}</Box>
                  <Box>
                    <Typography variant="subtitle2" sx={{ fontWeight: 800, color: "#1a1a1a" }}>
                      {item.title}
                    </Typography>
                    <Typography variant="caption" sx={{ color: "#888" }}>
                      {item.desc}
                    </Typography>
                  </Box>
                </Paper>
              </Grid>
            ))}
          </Grid>

          {loading ? (
            <Box sx={{ display: "flex", justifyContent: "center", py: 10 }}>
              <CircularProgress size={50} />
            </Box>
          ) : (
            <>
              {/* === FLASH SALE + DEAL === */}
              <Grid container spacing={3} sx={{ mb: 5 }}>
                {/* Deal of the day */}
                <Grid size={{ xs: 12, lg: 3 }}>
                  <Paper
                    elevation={0}
                    sx={{
                      p: 3, textAlign: "center", border: "2px solid #002c4b",
                      height: "100%", borderRadius: 2, bgcolor: "#fff",
                    }}
                  >
                    <Typography variant="h6" sx={{ fontWeight: 900, mb: 2, color: "#002c4b", fontSize: "1rem" }}>
                      CHỈ CÓ TRONG HÔM NAY
                    </Typography>
                    {dealProduct && (
                      <>
                        <Box sx={{ position: "relative", mb: 2 }}>
                          <Box
                            component="img"
                            src={dealImageUrl}
                            alt={dealProduct.name}
                            sx={{
                              width: "100%", maxWidth: 180, borderRadius: 2,
                              transition: "transform 0.3s ease",
                              "&:hover": { transform: "scale(1.05)" },
                            }}
                          />
                          <Box sx={{
                            position: "absolute", top: 0, right: "calc(50% - 90px)",
                            bgcolor: "#E60023", color: "white", width: 40, height: 40,
                            borderRadius: "50%", fontWeight: 900, fontSize: "0.75rem",
                            display: "flex", alignItems: "center", justifyContent: "center",
                            boxShadow: "0 2px 8px rgba(230,0,35,0.4)",
                          }}>
                            -{dealDiscount}%
                          </Box>
                        </Box>
                        <Typography variant="body2" sx={{
                          fontWeight: 600, mb: 1.5, color: "#1a1a1a", minHeight: "2.5em",
                          display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical",
                          overflow: "hidden", fontSize: "0.85rem",
                        }}>
                          {dealProduct.name}
                        </Typography>
                        <Typography variant="h6" sx={{ fontWeight: 900, color: "#E60023" }}>
                          {formatPrice(dealProduct.salePrice || dealProduct.price)}
                        </Typography>
                      </>
                    )}
                    <Divider sx={{ my: 2 }} />
                    <Typography variant="caption" sx={{ fontWeight: 800, display: "block", mb: 1.5, color: "#1a1a1a" }}>
                      ƯU ĐÃI KẾT THÚC SAU:
                    </Typography>
                    <Box sx={{ display: "flex", justifyContent: "center" }}>
                      <Countdown />
                    </Box>
                  </Paper>
                </Grid>

                {/* Flash Sale */}
                <Grid size={{ xs: 12, lg: 9 }}>
                  <Box sx={{
                    p: 3, height: "100%", borderRadius: 2,
                    background: "linear-gradient(135deg, #002c4b 0%, #004a7c 100%)",
                  }}>
                    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                        <Zap size={22} style={{ color: "#FFD700" }} />
                        <Typography variant="h6" sx={{ fontWeight: 900, fontStyle: "italic", color: "#FFD700" }}>
                          FLASH SALE GIÁ SỐC
                        </Typography>
                      </Box>
                      <Button
                        variant="outlined" size="small"
                        endIcon={<ChevronRight size={14} />}
                        sx={{
                          color: "white", borderColor: "rgba(255,255,255,0.4)",
                          fontWeight: 700, fontSize: "0.75rem",
                          "&:hover": { borderColor: "white", bgcolor: "rgba(255,255,255,0.1)" },
                        }}
                      >
                        Xem tất cả
                      </Button>
                    </Box>
                    <Box sx={{
                      display: "flex", gap: 2, overflowX: "auto", pb: 1,
                      "&::-webkit-scrollbar": { display: "none" }, scrollbarWidth: "none",
                    }}>
                      {flashSaleDisplay.map((p) => (
                        <Box key={p._id} sx={{ width: { xs: "70%", sm: "45%", md: "24%" }, minWidth: { xs: "70%", sm: "45%", md: "24%" }, flexShrink: 0 }}>
                          <CompactProductCard product={p} />
                        </Box>
                      ))}
                    </Box>
                  </Box>
                </Grid>
              </Grid>

              {/* === SẢN PHẨM MỚI === */}
              <ProductCarousel products={newProducts} title="SẢN PHẨM MỚI" />

              {/* === SECTIONS BY CATEGORY === */}
              {categories.map((cat) => {
                const catProducts = getProductsByCategory(cat._id);
                if (catProducts.length === 0) return null;
                return (
                  <ProductCarousel
                    key={cat._id}
                    products={catProducts}
                    title={cat.name.toUpperCase()}
                    onViewAll={() => navigate(`/products?category=${cat._id}`)}
                  />
                );
              })}

              {/* === ĐANG TRENDING === */}
              {products.length > 5 && (
                <ProductCarousel
                  products={[...products].reverse().slice(0, 8)}
                  title="ĐANG TRENDING"
                  showViewAll={false}
                />
              )}

              {/* Showcase categories at the bottom, near the footer */}
              <CategoryShowcase
                categories={categories}
                products={products}
                getImageUrl={getImageUrl}
                onSelect={(categoryId) => navigate(`/products?category=${categoryId}`)}
              />
            </>
          )}
        </Container>
      </MainLayout>

      {/* === FLOATING ACTION BUTTONS === */}
      <Box sx={{
        position: "fixed", right: 24, bottom: 24,
        display: "flex", flexDirection: "column", gap: 2, zIndex: 1000,
      }}>
        <Tooltip title="Tìm đường" placement="left">
          <Fab size="small" sx={{
            bgcolor: "#0F766E", color: "white",
            "&:hover": { bgcolor: "#0D5F59" },
            boxShadow: "0 4px 12px rgba(15,118,110,0.32)",
          }}>
            <MapIcon size={20} />
          </Fab>
        </Tooltip>
        <Tooltip title="Chat Zalo" placement="left">
          <Fab size="small" sx={{
            bgcolor: "#0084ff", color: "white",
            "&:hover": { bgcolor: "#006acc" },
            boxShadow: "0 4px 12px rgba(0,132,255,0.4)",
          }}>
            <MessageCircle size={20} />
          </Fab>
        </Tooltip>
        <Tooltip title="Hotline" placement="left">
          <Fab size="small" sx={{
            bgcolor: "#25D366", color: "white",
            "&:hover": { bgcolor: "#1eb954" },
            boxShadow: "0 4px 12px rgba(37,211,102,0.4)",
          }}>
            <Phone size={20} />
          </Fab>
        </Tooltip>
      </Box>

    </>
  );
};

export default Home;

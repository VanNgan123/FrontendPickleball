import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import {
  Box, Container, Typography, CircularProgress,
  Paper, Grid, Pagination, Divider,
} from "@mui/material";
import { Search, X } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "../../store/store";
import { searchProducts } from "../../store/slices/productSlice";
import { fetchCategories } from "../../store/slices/categorySlices";
import CompactProductCard from "../../components/CompactProductCard";
import ProductCardSkeleton from "../../components/Skeletons/ProductCardSkeleton";
import SidebarFilter from "../../components/SidebarFilter";
import SortBar from "../../components/SortBar";
import MainLayout from "../../layout/MainLayout/MainLayout";

const priceRanges = [
  { label: "0 đ - 1.000.000 đ", min: 0, max: 1000000 },
  { label: "1.000.000 đ - 2.000.000 đ", min: 1000000, max: 2000000 },
  { label: "2.000.000 đ - 5.000.000 đ", min: 2000000, max: 5000000 },
  { label: "5.000.000 đ - 17.900.000 đ", min: 5000000, max: 17900000 },
];

const SearchResults = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const [searchParams, setSearchParams] = useSearchParams();

  const keyword = searchParams.get("q") || "";
  const { searchResults, searchLoading, pagination, products } = useSelector(
    (state: RootState) => state.products
  );
  const { categories } = useSelector((state: RootState) => state.categories);

  const [sortBy, setSortBy] = useState("newest");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedPriceRange, setSelectedPriceRange] = useState<number | null>(null);
  const [selectedBrand, setSelectedBrand] = useState<string | null>(null);

  useEffect(() => {
    dispatch(fetchCategories());
  }, [dispatch]);

  useEffect(() => {
    if (!keyword.trim()) return;
    const params: Record<string, string> = {
      search: keyword,
      page: String(currentPage),
      limit: "12",
      sort: sortBy,
    };
    if (selectedCategory !== "all") params.category = selectedCategory;
    if (selectedPriceRange !== null) {
      params.minPrice = String(priceRanges[selectedPriceRange].min);
      params.maxPrice = String(priceRanges[selectedPriceRange].max);
    }
    if (selectedBrand) params.brand = selectedBrand;
    dispatch(searchProducts(params));
  }, [keyword, sortBy, currentPage, selectedCategory, selectedPriceRange, selectedBrand, dispatch]);

  const brands = [...new Set(products.map((p) => p.brand).filter(Boolean))] as string[];

  const handleClearSearch = () => navigate("/products");

  return (
    <MainLayout>
      <Container maxWidth="xl" sx={{ py: 3, minHeight: "80vh" }}>
        {/* Search header */}
        <Box sx={{ mb: 3 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 1 }}>
            <Search size={20} color="#E60023" />
            <Typography variant="h6" sx={{ fontWeight: 800, color: "#1a1a1a" }}>
              Kết quả tìm kiếm cho
            </Typography>
            <Box sx={{
              display: "flex", alignItems: "center", gap: 1,
              bgcolor: "rgba(230,0,35,0.08)", px: 2, py: 0.5,
              borderRadius: 10, border: "1px solid rgba(230,0,35,0.2)",
            }}>
              <Typography variant="body1" sx={{ fontWeight: 800, color: "#E60023" }}>
                "{keyword}"
              </Typography>
              <Box
                onClick={handleClearSearch}
                sx={{ cursor: "pointer", display: "flex", color: "#E60023", "&:hover": { opacity: 0.7 } }}
              >
                <X size={14} />
              </Box>
            </Box>
          </Box>

          {!searchLoading && (
            <Typography variant="body2" sx={{ color: "#888" }}>
              {pagination?.total ?? searchResults.length} sản phẩm được tìm thấy
            </Typography>
          )}
        </Box>

        <Divider sx={{ mb: 3 }} />

        {/* Sort bar */}
        <SortBar sortBy={sortBy} onSortChange={(s) => { setSortBy(s); setCurrentPage(1); }} />

        <Box sx={{ display: "flex", gap: 3 }}>
          {/* Sidebar */}
          <SidebarFilter
            categories={categories}
            brands={brands}
            priceRanges={priceRanges}
            selectedCategory={selectedCategory}
            selectedPriceRange={selectedPriceRange}
            selectedBrand={selectedBrand}
            onCategoryChange={(c) => { setSelectedCategory(c); setCurrentPage(1); }}
            onPriceRangeChange={(i) => { setSelectedPriceRange(i); setCurrentPage(1); }}
            onBrandChange={(b) => { setSelectedBrand(b); setCurrentPage(1); }}
          />

          {/* Results */}
          <Box sx={{ flexGrow: 1 }}>
            {searchLoading ? (
              <Grid container spacing={2}>
                {Array.from({ length: 8 }).map((_, i) => (
                  <Grid size={{ xs: 6, sm: 4, md: 3 }} key={i}>
                    <ProductCardSkeleton />
                  </Grid>
                ))}
              </Grid>
            ) : searchResults.length === 0 ? (
              <Paper elevation={0} sx={{ p: 8, textAlign: "center", border: "1px solid #eee", borderRadius: 2 }}>
                <Search size={56} color="#e0e0e0" style={{ marginBottom: 16 }} />
                <Typography variant="h6" sx={{ fontWeight: 700, color: "#1a1a1a", mb: 1 }}>
                  Không tìm thấy sản phẩm nào
                </Typography>
                <Typography variant="body2" sx={{ color: "#888", mb: 3 }}>
                  Thử tìm với từ khóa khác hoặc xóa bộ lọc
                </Typography>
              </Paper>
            ) : (
              <>
                <Grid container spacing={2}>
                  {searchResults.map((product) => (
                    <Grid size={{ xs: 6, sm: 4, md: 3 }} key={product._id}>
                      <CompactProductCard product={product} />
                    </Grid>
                  ))}
                </Grid>

                {pagination && pagination.pages > 1 && (
                  <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
                    <Pagination
                      count={pagination.pages}
                      page={currentPage}
                      onChange={(_, p) => setCurrentPage(p)}
                      variant="outlined" shape="rounded"
                      sx={{
                        "& .MuiPaginationItem-root": {
                          color: "#1a1a1a", borderColor: "#ddd", fontWeight: 600,
                          "&.Mui-selected": { bgcolor: "#E60023", color: "white", borderColor: "#E60023" },
                        },
                      }}
                    />
                  </Box>
                )}
              </>
            )}
          </Box>
        </Box>
      </Container>
    </MainLayout>
  );
};

export default SearchResults;

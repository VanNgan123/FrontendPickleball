import { useState, useEffect, useMemo } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import {
  Box, Container, Typography, CircularProgress, Paper, Grid, Pagination,
} from "@mui/material";

import MainLayout from "../../layout/MainLayout/MainLayout";
import CompactProductCard from "../../components/CompactProductCard";
import SidebarFilter from "../../components/SidebarFilter";
import SortBar from "../../components/SortBar";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "../../store/store";
import { searchProducts, fetchAllProducts } from "../../store/slices/productSlice";
import { fetchCategories } from "../../store/slices/categorySlice";

const priceRanges = [
  { label: "0 đ - 1.000.000 đ", min: 0, max: 1000000 },
  { label: "1.000.000 đ - 2.000.000 đ", min: 1000000, max: 2000000 },
  { label: "2.000.000 đ - 5.000.000 đ", min: 2000000, max: 5000000 },
  { label: "5.000.000 đ - 17.900.000 đ", min: 5000000, max: 17900000 },
];

const Products = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const [searchParams, setSearchParams] = useSearchParams();

  const { searchResults, searchLoading, pagination, products } = useSelector(
    (state: RootState) => state.products
  );
  const { categories } = useSelector((state: RootState) => state.categories);

  const [selectedCategory, setSelectedCategory] = useState<string>(
    searchParams.get("category") || "all"
  );
  const [sortBy, setSortBy] = useState(searchParams.get("sort") || "newest");
  const [currentPage, setCurrentPage] = useState(
    Number(searchParams.get("page")) || 1
  );
  const [selectedPriceRange, setSelectedPriceRange] = useState<number | null>(null);
  const [selectedBrand, setSelectedBrand] = useState<string | null>(null);

  useEffect(() => {
    dispatch(fetchCategories());
    dispatch(fetchAllProducts({ limit: 0 }));
  }, [dispatch]);

  useEffect(() => {
    const params: Record<string, string> = {
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCategory, sortBy, currentPage, selectedPriceRange, selectedBrand, dispatch]);

  // Sync URL params separately (no re-render loop)
  useEffect(() => {
    const urlParams: Record<string, string> = {};
    if (selectedCategory !== "all") urlParams.category = selectedCategory;
    if (sortBy !== "newest") urlParams.sort = sortBy;
    if (currentPage > 1) urlParams.page = String(currentPage);
    setSearchParams(urlParams, { replace: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCategory, sortBy, currentPage]);

  const handleCategoryChange = (catId: string) => {
    setSelectedCategory(catId);
    setCurrentPage(1);
  };

  const handleSortChange = (sort: string) => {
    setSortBy(sort);
    setCurrentPage(1);
  };

  const handlePriceRangeChange = (idx: number | null) => {
    setSelectedPriceRange(idx);
    setCurrentPage(1);
  };

  const handleBrandChange = (brand: string | null) => {
    setSelectedBrand(brand);
    setCurrentPage(1);
  };

  const brands = useMemo(() => {
    const brandSet = new Set<string>();
    products.forEach((p) => { if (p.brand) brandSet.add(p.brand); });
    return Array.from(brandSet).sort();
  }, [products]);

  const selectedCatName =
    selectedCategory === "all"
      ? "TẤT CẢ SẢN PHẨM"
      : categories.find((c) => c._id === selectedCategory)?.name?.toUpperCase() || "SẢN PHẨM";

  return (
    <>
      <MainLayout>
        <Container maxWidth="xl" sx={{ py: 3, minHeight: "80vh" }}>
          {/* Breadcrumbs */}
          <Box sx={{ mb: 2, display: "flex", alignItems: "center", gap: 0.5 }}>
            <Typography
              variant="body2"
              sx={{ color: "#888", cursor: "pointer", "&:hover": { color: "#E60023" } }}
              onClick={() => navigate("/")}
            >
              TRANG CHỦ
            </Typography>
            <Typography variant="body2" sx={{ color: "#888" }}>/</Typography>
            <Typography variant="body2" sx={{ color: "#1a1a1a", fontWeight: 700 }}>
              {selectedCatName}
            </Typography>
          </Box>

          {/* Sort Bar */}
          <SortBar sortBy={sortBy} onSortChange={handleSortChange} />

          {/* Main Layout: Sidebar + Products */}
          <Box sx={{ display: "flex", gap: 3 }}>
            {/* Sidebar */}
            <SidebarFilter
              categories={categories}
              brands={brands}
              priceRanges={priceRanges}
              selectedCategory={selectedCategory}
              selectedPriceRange={selectedPriceRange}
              selectedBrand={selectedBrand}
              onCategoryChange={handleCategoryChange}
              onPriceRangeChange={handlePriceRangeChange}
              onBrandChange={handleBrandChange}
            />

            {/* Products Area */}
            <Box sx={{ flexGrow: 1 }}>
              {/* Category Title */}
              <Box sx={{ mb: 2 }}>
                <Box sx={{
                  display: "inline-block", bgcolor: "#002c4b", color: "white",
                  px: 3, py: 0.8, fontWeight: 800, fontSize: "0.9rem",
                  textTransform: "uppercase", borderRadius: "4px 4px 0 0",
                }}>
                  {selectedCatName}
                </Box>
                <Box sx={{ height: 2, bgcolor: "#002c4b" }} />
              </Box>

              {/* Products Grid */}
              {searchLoading ? (
                <Box sx={{ display: "flex", justifyContent: "center", py: 10 }}>
                  <CircularProgress size={50} />
                </Box>
              ) : searchResults.length === 0 ? (
                <Paper elevation={0} sx={{ p: 6, textAlign: "center", bgcolor: "#fff", border: "1px solid #eee", borderRadius: 2 }}>
                  <Typography variant="h6" sx={{ color: "#888", fontWeight: 600 }}>
                    Không tìm thấy sản phẩm nào
                  </Typography>
                  <Typography variant="body2" sx={{ color: "#aaa", mt: 1 }}>
                    Vui lòng thử chọn danh mục khác
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

                  {/* Pagination */}
                  {pagination && pagination.pages > 1 && (
                    <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
                      <Pagination
                        count={pagination.pages}
                        page={currentPage}
                        onChange={(_, page) => setCurrentPage(page)}
                        variant="outlined"
                        shape="rounded"
                        sx={{
                          "& .MuiPaginationItem-root": {
                            color: "#1a1a1a", borderColor: "#ddd", fontWeight: 600,
                            "&.Mui-selected": {
                              bgcolor: "#E60023", color: "white", borderColor: "#E60023",
                              "&:hover": { bgcolor: "#c4001d" },
                            },
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
    </>
  );
};

export default Products;

import { useState } from "react";
import {
  Box, Typography, Paper, Checkbox, FormControlLabel, Collapse,
} from "@mui/material";
import { ChevronDown, Minus as MinusIcon } from "lucide-react";
import type { Category } from "../../services/categoryService";

interface PriceRange {
  label: string;
  min: number;
  max: number;
}

interface SidebarFilterProps {
  categories: Category[];
  brands: string[];
  priceRanges: PriceRange[];
  selectedCategory: string;
  selectedPriceRange: number | null;
  selectedBrand: string | null;
  onCategoryChange: (catId: string) => void;
  onPriceRangeChange: (idx: number | null) => void;
  onBrandChange: (brand: string | null) => void;
}

// Collapsible section header
const SidebarSection = ({
  title, open, onToggle, children,
}: {
  title: string; open: boolean; onToggle: () => void; children: React.ReactNode;
}) => (
  <Box sx={{ mb: 0 }}>
    <Box
      onClick={onToggle}
      sx={{
        display: "flex", justifyContent: "space-between", alignItems: "center",
        py: 1.5, px: 2, cursor: "pointer", borderBottom: "1px solid #f0f0f0",
        "&:hover": { bgcolor: "#fafafa" },
      }}
    >
      <Typography variant="body2" sx={{ fontWeight: 700, color: "#1a1a1a", fontSize: "0.85rem" }}>
        {title}
      </Typography>
      {open ? <MinusIcon size={16} color="#888" /> : <ChevronDown size={16} color="#888" />}
    </Box>
    <Collapse in={open}>
      <Box sx={{ px: 2, py: 1 }}>{children}</Box>
    </Collapse>
  </Box>
);

const SidebarFilter = ({
  categories, brands, priceRanges,
  selectedCategory, selectedPriceRange, selectedBrand,
  onCategoryChange, onPriceRangeChange, onBrandChange,
}: SidebarFilterProps) => {
  const [openCategory, setOpenCategory] = useState(true);
  const [openPrice, setOpenPrice] = useState(true);
  const [openBrand, setOpenBrand] = useState(true);

  const checkboxSx = { color: "#ccc", "&.Mui-checked": { color: "#E60023" }, py: 0.3 };

  return (
    <Paper
      elevation={0}
      sx={{
        width: 250, flexShrink: 0, bgcolor: "#fff",
        border: "1px solid #eee", borderRadius: 2,
        alignSelf: "flex-start", position: "sticky", top: 80,
        display: { xs: "none", md: "block" },
      }}
    >
      {/* Categories */}
      <SidebarSection title="Danh mục sản phẩm" open={openCategory} onToggle={() => setOpenCategory(!openCategory)}>
        <FormControlLabel
          control={<Checkbox size="small" checked={selectedCategory === "all"} onChange={() => onCategoryChange("all")} sx={checkboxSx} />}
          label={<Typography variant="body2" sx={{ color: "#333", fontSize: "0.85rem" }}>Tất cả</Typography>}
          sx={{ display: "flex", ml: 0 }}
        />
        {categories.map((cat) => (
          <FormControlLabel
            key={cat._id}
            control={<Checkbox size="small" checked={selectedCategory === cat._id} onChange={() => onCategoryChange(cat._id)} sx={checkboxSx} />}
            label={<Typography variant="body2" sx={{ color: "#333", fontSize: "0.85rem" }}>{cat.name}</Typography>}
            sx={{ display: "flex", ml: 0 }}
          />
        ))}
      </SidebarSection>

      {/* Price Range */}
      <SidebarSection title="Giá bán" open={openPrice} onToggle={() => setOpenPrice(!openPrice)}>
        {priceRanges.map((range, idx) => (
          <FormControlLabel
            key={idx}
            control={
              <Checkbox
                size="small"
                checked={selectedPriceRange === idx}
                onChange={() => onPriceRangeChange(selectedPriceRange === idx ? null : idx)}
                sx={checkboxSx}
              />
            }
            label={<Typography variant="body2" sx={{ color: "#333", fontSize: "0.85rem" }}>{range.label}</Typography>}
            sx={{ display: "flex", ml: 0 }}
          />
        ))}
      </SidebarSection>

      {/* Brands */}
      <SidebarSection title="Thương hiệu" open={openBrand} onToggle={() => setOpenBrand(!openBrand)}>
        {brands.length === 0 ? (
          <Typography variant="caption" sx={{ color: "#aaa" }}>Không có</Typography>
        ) : (
          brands.map((brand) => (
            <FormControlLabel
              key={brand}
              control={
                <Checkbox
                  size="small"
                  checked={selectedBrand === brand}
                  onChange={() => onBrandChange(selectedBrand === brand ? null : brand)}
                  sx={checkboxSx}
                />
              }
              label={<Typography variant="body2" sx={{ color: "#333", fontSize: "0.85rem" }}>{brand}</Typography>}
              sx={{ display: "flex", ml: 0 }}
            />
          ))
        )}
      </SidebarSection>
    </Paper>
  );
};

export default SidebarFilter;

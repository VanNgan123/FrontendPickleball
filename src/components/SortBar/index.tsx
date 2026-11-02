import { Box, FormControl, MenuItem, Select, Typography } from "@mui/material";

interface SortBarProps {
  sortBy: string;
  onSortChange: (sort: string) => void;
}

const sortOptions: Record<string, string> = {
  newest: "Mới nhất",
  price_asc: "Giá: thấp đến cao",
  price_desc: "Giá: cao đến thấp",
};

const SortBar = ({ sortBy, onSortChange }: SortBarProps) => (
  <Box sx={{ display: "flex", justifyContent: "flex-end", alignItems: "center", gap: 1, mb: 2 }}>
    <FormControl size="small" sx={{ display: { xs: "flex", sm: "none" }, width: { xs: "min(52vw, 190px)", sm: 190 }, minWidth: 0 }}>
      <Select value={sortBy} onChange={(event) => onSortChange(event.target.value)} inputProps={{ "aria-label": "Sắp xếp sản phẩm" }}>
        {Object.entries(sortOptions).map(([key, label]) => <MenuItem value={key} key={key}>{label}</MenuItem>)}
      </Select>
    </FormControl>
    <Box sx={{ display: { xs: "none", sm: "flex" }, gap: 1 }}>
      {Object.entries(sortOptions).map(([key, label]) => (
        <Typography
          component="button"
          type="button"
          key={key}
          onClick={() => onSortChange(key)}
          sx={{
            cursor: "pointer", px: 1.5, py: 0.5, bgcolor: "transparent", border: 0,
            fontWeight: sortBy === key ? 700 : 400,
            color: sortBy === key ? "#0F766E" : "#475569",
            borderBottom: sortBy === key ? "2px solid #0F766E" : "2px solid transparent",
            "&:hover": { color: "#0F766E" }, transition: "all 0.2s",
          }}
        >
          {label}
        </Typography>
      ))}
    </Box>
  </Box>
);

export default SortBar;

import { Box, Typography } from "@mui/material";

interface SortBarProps {
  sortBy: string;
  onSortChange: (sort: string) => void;
}

const sortOptions: Record<string, string> = {
  newest: "Mới nhất",
  price_asc: "Giá: thấp đến cao",
  price_desc: "Giá: cao đến thấp",
};

const SortBar = ({ sortBy, onSortChange }: SortBarProps) => {
  return (
    <Box sx={{
      display: "flex", justifyContent: "flex-end", alignItems: "center",
      gap: 1, mb: 2,
    }}>
      {Object.entries(sortOptions).map(([key, label]) => (
        <Typography
          key={key}
          variant="body2"
          onClick={() => onSortChange(key)}
          sx={{
            cursor: "pointer", px: 1.5, py: 0.5,
            fontWeight: sortBy === key ? 700 : 400,
            color: sortBy === key ? "#E60023" : "#555",
            borderBottom: sortBy === key ? "2px solid #E60023" : "2px solid transparent",
            "&:hover": { color: "#E60023" },
            transition: "all 0.2s",
          }}
        >
          {label}
        </Typography>
      ))}
    </Box>
  );
};

export default SortBar;

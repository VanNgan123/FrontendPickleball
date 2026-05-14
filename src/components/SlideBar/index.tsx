import { Box, List, ListItemButton, ListItemText, Typography } from "@mui/material";
import CategoryIcon from "@mui/icons-material/Category";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import type { RootState } from "../../store/store";

const SidebarCategory = () => {
  const navigate = useNavigate();
  const { categories, loading } = useSelector((state: RootState) => state.categories);

  return (
    <Box
      sx={{
        width: 321,
        background: "#FFFFFF",
        borderRadius: 0,
        overflow: "hidden",
        boxShadow: "0 2px 12px rgba(0,0,0,0.1)",
      }}
    >
      <List sx={{ padding: 0 }}>
        {loading && (
          <Box sx={{ p: 2 }}>
            <Typography variant="body2" sx={{ color: "#888" }}>
              Đang tải danh mục...
            </Typography>
          </Box>
        )}
        {!loading && categories.length === 0 && (
          <Box sx={{ p: 2 }}>
            <Typography variant="body2" sx={{ color: "#888" }}>
              Chưa có danh mục nào.
            </Typography>
          </Box>
        )}
        {categories.map((item) => (
          <ListItemButton
            key={item._id}
            onClick={() => navigate(`/products?category=${item._id}`)}
            sx={{
              borderBottom: "1px solid #f0f0f0",
              "&:hover": {
                background: "#E60023",
              },
              "&:hover .text": { color: "#FFFFFF" },
              transition: "0.2s",
            }}
          >
            <CategoryIcon sx={{ color: "#E60023", mr: 1 }} />
            <ListItemText
              primary={item.name}
              primaryTypographyProps={{
                className: "text",
                fontWeight: 600,
                color: "#111",
              }}
            />
          </ListItemButton>
        ))}
      </List>
    </Box>
  );
};

export default SidebarCategory;

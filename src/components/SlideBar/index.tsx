import { Box, List, ListItemButton, ListItemText } from "@mui/material";
import CategoryIcon from "@mui/icons-material/Category";

const categories = [
  "Khuyến Mãi",
  "Vợt Pickleball",
  "Bóng Pickleball",
  "Giày thi đấu",
  "Phụ kiện",
  "Quần áo thể thao",
  "Túi – Balo",
];

const SidebarCategory = () => {
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
        {categories.map((item) => (
          <ListItemButton
            key={item}
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
              primary={item}
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

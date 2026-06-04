import { Box, List, ListItemButton, ListItemText, Typography } from "@mui/material";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import StarBorderRoundedIcon from "@mui/icons-material/StarBorderRounded";
import LocalOfferOutlinedIcon from "@mui/icons-material/LocalOfferOutlined";
import ChatBubbleOutlineRoundedIcon from "@mui/icons-material/ChatBubbleOutlineRounded";
import SportsTennisOutlinedIcon from "@mui/icons-material/SportsTennisOutlined";
import SportsBaseballOutlinedIcon from "@mui/icons-material/SportsBaseballOutlined";
import HikingOutlinedIcon from "@mui/icons-material/HikingOutlined";
import WorkOutlineRoundedIcon from "@mui/icons-material/WorkOutlineRounded";
import CheckroomOutlinedIcon from "@mui/icons-material/CheckroomOutlined";
import ArticleOutlinedIcon from "@mui/icons-material/ArticleOutlined";
import PlaceOutlinedIcon from "@mui/icons-material/PlaceOutlined";
import HeadsetMicOutlinedIcon from "@mui/icons-material/HeadsetMicOutlined";
import Inventory2OutlinedIcon from "@mui/icons-material/Inventory2Outlined";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import type { RootState } from "../../store/store";

const staticTopItems = [
  { label: "Chỉ có trong hôm nay", icon: StarBorderRoundedIcon, path: "/products" },
  { label: "Khuyến mãi", icon: LocalOfferOutlinedIcon, path: "/products" },
  { label: "Có gì mới", icon: ChatBubbleOutlineRoundedIcon, path: "/products" },
];

const staticBottomItems = [
  { label: "Tin tức Pickleball", icon: ArticleOutlinedIcon, path: "/products" },
  { label: "Tìm sân chơi Pickleball", icon: PlaceOutlinedIcon, path: "/products" },
  { label: "Liên hệ | Trợ giúp", icon: HeadsetMicOutlinedIcon, path: "/products" },
];

const categoryIcons = [
  SportsTennisOutlinedIcon,
  SportsBaseballOutlinedIcon,
  HikingOutlinedIcon,
  WorkOutlineRoundedIcon,
  CheckroomOutlinedIcon,
];

const SidebarCategory = () => {
  const navigate = useNavigate();
  const { categories, loading } = useSelector((state: RootState) => state.categories);

  return (
    <Box
      sx={{
        width: 320,
        height: "100%",
        background: "#FFFFFF",
        borderRadius: "0 0 2px 2px",
        overflow: "hidden",
        border: "1px solid #edf0f2",
        boxShadow: "0 16px 34px rgba(15,23,42,0.08)",
      }}
    >
      <List sx={{ p: 0 }}>
        {staticTopItems.map((item) => {
          const Icon = item.icon;
          return (
            <ListItemButton
              key={item.label}
              onClick={() => navigate(item.path)}
              sx={{
                height: 52,
                px: 2,
                borderBottom: "1px solid #edf0f2",
                transition: "all 180ms ease",
                "&:hover": { bgcolor: "rgba(15,118,110,0.06)", transform: "translateX(3px)" },
                "&:hover .menu-icon": { color: "#84CC16", transform: "scale(1.08)" },
              }}
            >
              <Icon className="menu-icon" sx={{ color: "#0F766E", mr: 1.8, fontSize: 25, transition: "all 180ms ease" }} />
              <ListItemText
                primary={item.label}
                primaryTypographyProps={{ fontSize: 16, fontWeight: 600, color: "#111827" }}
              />
            </ListItemButton>
          );
        })}

        {loading && (
          <Box sx={{ p: 2, borderBottom: "1px solid #edf0f2" }}>
            <Typography variant="body2" sx={{ color: "#64748b", fontWeight: 600 }}>
              Đang tải danh mục...
            </Typography>
          </Box>
        )}

        {!loading && categories.length === 0 && (
          <Box sx={{ p: 2.5, textAlign: "center", borderBottom: "1px solid #edf0f2" }}>
            <Inventory2OutlinedIcon sx={{ color: "#94a3b8", mb: 0.5 }} />
            <Typography variant="body2" sx={{ color: "#64748b", fontWeight: 700 }}>
              Chưa có danh mục nào.
            </Typography>
          </Box>
        )}

        {categories.map((item, index) => {
          const Icon = categoryIcons[index % categoryIcons.length];
          return (
            <ListItemButton
              key={item._id}
              onClick={() => navigate(`/products?category=${item._id}`)}
              sx={{
                height: 52,
                px: 2,
                borderBottom: "1px solid #edf0f2",
                transition: "all 180ms ease",
                "&:hover": {
                  bgcolor: "rgba(15,118,110,0.06)",
                  transform: "translateX(4px)",
                },
                "&:hover .menu-icon": {
                  color: "#84CC16",
                  transform: "scale(1.1)",
                },
                "&:hover .menu-arrow": {
                  color: "#0F766E",
                  opacity: 1,
                  transform: "translateX(2px)",
                },
              }}
            >
              <Icon className="menu-icon" sx={{ color: "#0F766E", mr: 1.8, fontSize: 25, transition: "all 180ms ease" }} />
              <ListItemText
                primary={item.name}
                primaryTypographyProps={{ fontSize: 16, fontWeight: 600, color: "#111827" }}
              />
              <ChevronRightIcon className="menu-arrow" sx={{ color: "#64748b", opacity: 0.8, transition: "all 180ms ease" }} />
            </ListItemButton>
          );
        })}

        {staticBottomItems.map((item) => {
          const Icon = item.icon;
          return (
            <ListItemButton
              key={item.label}
              onClick={() => navigate(item.path)}
              sx={{
                height: 52,
                px: 2,
                borderBottom: "1px solid #edf0f2",
                transition: "all 180ms ease",
                "&:hover": { bgcolor: "rgba(15,118,110,0.06)", transform: "translateX(3px)" },
                "&:hover .menu-icon": { color: "#84CC16", transform: "scale(1.08)" },
              }}
            >
              <Icon className="menu-icon" sx={{ color: "#0F766E", mr: 1.8, fontSize: 25, transition: "all 180ms ease" }} />
              <ListItemText
                primary={item.label}
                primaryTypographyProps={{ fontSize: 16, fontWeight: 600, color: "#111827" }}
              />
            </ListItemButton>
          );
        })}
      </List>
    </Box>
  );
};

export default SidebarCategory;

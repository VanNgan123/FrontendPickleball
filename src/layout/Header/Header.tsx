import {
  AppBar,
  Toolbar,
  Box,
  IconButton,
  InputBase,
  Typography,
  Badge,
  Button,
  Container,
} from "@mui/material";
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';

import MenuIcon from "@mui/icons-material/Menu";

import { ShoppingCart, Search, Phone } from "@mui/icons-material";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import type { RootState } from "../../store/store";

const Header = () => {
  const cartCount = useSelector((state: RootState) => (state as any).cart?.items?.length || 0);
  const authState = useSelector((state: RootState) => (state as any).auth);
  const isAuthenticated = Boolean(authState?.user);

  return (
    <>
      {/* TẦNG 1 */}
      <AppBar
        position="sticky"
        sx={{
          background: "#08222f",
          paddingY: 1,
        }}
      >
        <Container maxWidth="xl">
          <Toolbar sx={{ display: "flex", alignItems: "center"  ,marginLeft:10, marginRight:5}}>
            <Box sx={{ display: "flex", alignItems: "center", mr: 5 }}>
              <Typography
                variant="h3"
                component={Link}
                to="/"
                style={{
                  color: "#FFFFFF",
                  textDecoration: "none",
                  fontWeight: "bold",
                }}
              >
                {" "}
                🎾
              </Typography>
              <Typography
                variant="h6"
                component={Link}
                to="/"
                style={{
                  color: "#FFFFFF",
                  textDecoration: "none",
                  fontFamily: "cursive",
                  letterSpacing: "1px",
                }}
              >
                PICKLEBALL BẠCH ĐẰNG
              </Typography>
            </Box>

            {/* SEARCH BAR */}
            <Box
              sx={{
                flexGrow: 1,
                bgcolor: "#FFFFFF",
                padding: "3px 10px",
                borderRadius: 2,
                display: "flex",
                alignItems: "center",
                mr: 8,
              }}
            >
              <Search sx={{ color: "#111" }} />
              <InputBase
                placeholder="Bạn muốn tìm kiếm sản phẩm gì?"
                sx={{ ml: 1, flex: 1 }}
              />
            </Box>

            {/* HOTLINE */}
            <Box
              sx={{
                
                display: "flex",
                alignItems: "center",
                color: "#f80808ff",
                fontWeight: "bold",
                border: "1px solid #fcfcfcff",
                borderRadius: 3,
                padding: "5px 25px",
              }}
            >
              <Phone sx={{ mr: 1 }} />
              <Typography>HOTLINE: 0387023315</Typography>
            </Box>

            {/* CART */}
            <IconButton sx={{ color: "#FFFFFF", ml: 5, "&:hover": { backgroundColor: "#f11313ff"} }}>
              <Badge color="primary" badgeContent={cartCount}>
                <ShoppingCart />
              </Badge>
            </IconButton>
            <Box
            sx={{
                display: "flex",
                alignItems: "center",
                color: "#ffffffff",
                fontWeight: "bold",
              }}>
              <Button
                color="inherit"
                component={Link}
                to={isAuthenticated ? "/" : "/login"}
                sx={{ color: "white", "&:hover": { backgroundColor: "#f11313ff" } }}
              >
                <PersonOutlineIcon sx={{fontSize: 30}}/>
              </Button>
            </Box>
          </Toolbar>
        </Container>
      </AppBar>

      {/* TẦNG 2 - NAV */}
      <Box
        sx={{
          background: "#fffdfdff",
          boxShadow: "0 2px 5px rgba(168, 163, 163, 0.25)",
          p:0,m:0
        }}
      >
        <Container maxWidth="xl">
          <Box sx={{ display: "flex", gap: 4 }}>
            <Box sx={{backgroundColor:"#ba0000ff",textAlign: "left", marginLeft: 15, fontWeight: "bold", color: "#ffffffff",fontSize:16,padding:"5px 45px"}}>
              <IconButton
                size="large"
                edge="start"
                color="inherit"
                aria-label="open drawer"
                sx={{ mr: 2,fontSize:2.50 }}
              >
                <MenuIcon />
              </IconButton>
              DANH MỤC SẢN PHẨM
            </Box>

            {/* <Button component={Link} to="/products" sx={{ color: "#FFF" }}>
              Sản phẩm
            </Button>
            <Button sx={{ color: "#020202ff" }}>Khuyến mãi</Button>
            <Button sx={{ color: "#020202ff" }}>Tin tức</Button>
            <Button sx={{ color: "#020202ff" }}>Liên hệ</Button> */}
          </Box>
        </Container>
      </Box>
    </>
  );
};

export default Header;

import { Box, Container, Typography, Grid, Link as MuiLink } from "@mui/material";
import { Facebook, Instagram, YouTube } from "@mui/icons-material";

const Footer = () => {
  return (
    <Box
      component="footer"
      sx={{
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        color: "white",
        py: 6,
        mt: "auto",
      }}
    >
      <Container maxWidth="xl">
        <Grid container spacing={4}>
          <Grid size= {4}>
            <Typography variant="h6" gutterBottom fontWeight={700}>
              Thế Giới Pickleball
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.9 }}>
              Chất lượng, uy tín - Bền lâu trọn đời
            </Typography>
            <Box sx={{ mt: 2, display: "flex", gap: 1 }}>
              <Facebook sx={{ cursor: "pointer", "&:hover": { opacity: 0.8 } }} />
              <Instagram sx={{ cursor: "pointer", "&:hover": { opacity: 0.8 } }} />
              <YouTube sx={{ cursor: "pointer", "&:hover": { opacity: 0.8 } }} />
            </Box>
          </Grid>
          
          <Grid size= {4}>
            <Typography variant="h6" gutterBottom fontWeight={600}>
              Thông tin
            </Typography>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
              <MuiLink href="#" color="inherit" underline="hover">
                Về chúng tôi
              </MuiLink>
              <MuiLink href="#" color="inherit" underline="hover">
                Chính sách đổi trả
              </MuiLink>
              <MuiLink href="#" color="inherit" underline="hover">
                Chính sách bảo mật
              </MuiLink>
            </Box>
          </Grid>
          <Grid size= {4}>
            <Typography variant="h6" gutterBottom fontWeight={600}>
              Liên hệ
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.9 }}>
              Email: contact@thegioipickleball.vn
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.9 }}>
              Hotline: 1900 xxxx
            </Typography>
          </Grid>
        </Grid>
        
        <Box sx={{ mt: 4, pt: 4, borderTop: "1px solid rgba(255,255,255,0.2)" }}>
          <Typography variant="body2" align="center" sx={{ opacity: 0.9 }}>
            © {new Date().getFullYear()} Thế Giới Pickleball. All rights reserved.
          </Typography>
        </Box>
      </Container>
    </Box>
  );
};

export default Footer;

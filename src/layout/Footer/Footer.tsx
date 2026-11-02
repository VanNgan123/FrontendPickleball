import { Box, Container, Typography, Grid, Link as MuiLink, IconButton, Stack } from "@mui/material";
import { Facebook, Instagram, YouTube } from "@mui/icons-material";
import { Link as RouterLink } from "react-router-dom";
import {
  BRAND_NAME,
  FACEBOOK_URL,
  INSTAGRAM_URL,
  SUPPORT_EMAIL,
  SUPPORT_PHONE,
  YOUTUBE_URL,
} from "../../config/commerce";

const socialLinks = [
  { label: "Facebook", href: FACEBOOK_URL, icon: <Facebook /> },
  { label: "Instagram", href: INSTAGRAM_URL, icon: <Instagram /> },
  { label: "YouTube", href: YOUTUBE_URL, icon: <YouTube /> },
].filter((item) => Boolean(item.href));

const Footer = () => (
  <Box
    component="footer"
    sx={{
      background: "linear-gradient(135deg, #08222f 0%, #0a3d5c 100%)",
      color: "white",
      py: { xs: 4.5, md: 6 },
      mt: "auto",
    }}
  >
    <Container maxWidth="xl">
      <Grid container spacing={{ xs: 4, md: 6 }}>
        <Grid size={{ xs: 12, sm: 5, md: 4 }}>
          <Typography variant="h6" gutterBottom fontWeight={800}>
            {BRAND_NAME}
          </Typography>
          <Typography variant="body2" sx={{ opacity: 0.86, maxWidth: 360, lineHeight: 1.7 }}>
            Dụng cụ Pickleball được chọn lọc rõ nguồn gốc, hỗ trợ tư vấn và theo dõi đơn hàng trực tuyến.
          </Typography>
          {socialLinks.length > 0 && (
            <Stack direction="row" spacing={0.75} sx={{ mt: 2 }}>
              {socialLinks.map((item) => (
                <IconButton
                  key={item.label}
                  component="a"
                  href={item.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={item.label}
                  sx={{ color: "white", bgcolor: "rgba(255,255,255,0.08)" }}
                >
                  {item.icon}
                </IconButton>
              ))}
            </Stack>
          )}
        </Grid>

        <Grid size={{ xs: 12, sm: 3, md: 4 }}>
          <Typography variant="h6" gutterBottom fontWeight={700}>Chính sách</Typography>
          <Stack spacing={1} alignItems="flex-start">
            <MuiLink component={RouterLink} to="/policies/shipping" color="inherit" underline="hover">Vận chuyển</MuiLink>
            <MuiLink component={RouterLink} to="/policies/returns" color="inherit" underline="hover">Đổi trả</MuiLink>
            <MuiLink component={RouterLink} to="/policies/privacy" color="inherit" underline="hover">Bảo mật</MuiLink>
            <MuiLink component={RouterLink} to="/policies/terms" color="inherit" underline="hover">Điều khoản mua hàng</MuiLink>
          </Stack>
        </Grid>

        <Grid size={{ xs: 12, sm: 4, md: 4 }}>
          <Typography variant="h6" gutterBottom fontWeight={700}>Hỗ trợ</Typography>
          <Stack spacing={1} alignItems="flex-start">
            <MuiLink component={RouterLink} to="/support" color="inherit" underline="hover">Trung tâm trợ giúp</MuiLink>
            {SUPPORT_EMAIL && <MuiLink href={`mailto:${SUPPORT_EMAIL}`} color="inherit">{SUPPORT_EMAIL}</MuiLink>}
            {SUPPORT_PHONE && <MuiLink href={`tel:${SUPPORT_PHONE.replace(/\s/g, "")}`} color="inherit">{SUPPORT_PHONE}</MuiLink>}
            {!SUPPORT_EMAIL && !SUPPORT_PHONE && (
              <Typography variant="body2" sx={{ opacity: 0.82 }}>Mở trợ lý trực tuyến để được hỗ trợ.</Typography>
            )}
          </Stack>
        </Grid>
      </Grid>

      <Box sx={{ mt: 4, pt: 3, borderTop: "1px solid rgba(255,255,255,0.18)" }}>
        <Typography variant="body2" align="center" sx={{ opacity: 0.8 }}>
          © {new Date().getFullYear()} {BRAND_NAME}. All rights reserved.
        </Typography>
      </Box>
    </Container>
  </Box>
);

export default Footer;

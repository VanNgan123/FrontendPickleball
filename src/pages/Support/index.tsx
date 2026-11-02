import { Box, Button, Container, Link as MuiLink, Paper, Stack, Typography } from "@mui/material";
import { Headphones, Mail, MessageCircle, Phone } from "lucide-react";
import { Link as RouterLink } from "react-router-dom";
import MainLayout from "../../layout/MainLayout/MainLayout";
import { SUPPORT_EMAIL, SUPPORT_PHONE, ZALO_URL } from "../../config/commerce";
import { openAgentChat } from "../../utils/chatStorage";

const Support = () => (
  <MainLayout>
    <Container maxWidth="md" sx={{ py: { xs: 5, md: 9 } }}>
      <Paper elevation={0} sx={{ p: { xs: 3, md: 6 }, borderRadius: 4, border: "1px solid #dbe5e1", bgcolor: "#f0fdfa" }}>
        <Box sx={{ width: 76, height: 76, borderRadius: "50%", bgcolor: "#0F766E", display: "grid", placeItems: "center", mb: 3 }}>
          <Headphones size={34} color="white" />
        </Box>
        <Typography component="h1" variant="h4" sx={{ fontWeight: 900, mb: 1.5 }}>Trung tâm trợ giúp</Typography>
        <Typography color="text.secondary" sx={{ lineHeight: 1.8, mb: 3 }}>
          Hãy gửi câu hỏi về sản phẩm, giỏ hàng hoặc đơn hàng. Trợ lý trực tuyến có thể kiểm tra dữ liệu hiện tại và hướng dẫn bước tiếp theo.
        </Typography>
        <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5} flexWrap="wrap" useFlexGap>
          <Button variant="contained" startIcon={<MessageCircle size={18} />} onClick={openAgentChat}>Mở trợ lý trực tuyến</Button>
          {ZALO_URL && <Button component="a" href={ZALO_URL} target="_blank" rel="noopener noreferrer" variant="outlined">Chat Zalo</Button>}
          {SUPPORT_PHONE && <Button component="a" href={`tel:${SUPPORT_PHONE.replace(/\s/g, "")}`} startIcon={<Phone size={18} />} variant="outlined">{SUPPORT_PHONE}</Button>}
          {SUPPORT_EMAIL && <Button component="a" href={`mailto:${SUPPORT_EMAIL}`} startIcon={<Mail size={18} />} variant="outlined">Email hỗ trợ</Button>}
        </Stack>
        <Typography variant="body2" sx={{ mt: 3, color: "text.secondary" }}>
          Xem thêm <MuiLink component={RouterLink} to="/policies/returns">chính sách đổi trả</MuiLink> và <MuiLink component={RouterLink} to="/policies/shipping">chính sách vận chuyển</MuiLink>.
        </Typography>
      </Paper>
    </Container>
  </MainLayout>
);

export default Support;

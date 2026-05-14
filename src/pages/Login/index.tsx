import { Box, Container, Typography } from "@mui/material";
import MainLayout from "../../layout/MainLayout/MainLayout";

const Login = () => {
  return (
    <MainLayout>
      <Container maxWidth="sm" sx={{ py: 8 }}>
        <Box sx={{ textAlign: "center", p: 4, border: "1px solid #eee", borderRadius: 2, bgcolor: "#fff" }}>
          <Typography variant="h5" sx={{ fontWeight: 800, mb: 1, color: "#1a1a1a" }}>
            Dang nhap
          </Typography>
          <Typography variant="body2" sx={{ color: "#666" }}>
            Trang dang nhap se duoc cap nhat som.
          </Typography>
        </Box>
      </Container>
    </MainLayout>
  );
};

export default Login;

import { Box, Button, Container, Divider, Paper, Stack, Typography } from "@mui/material";
import { ArrowLeft, PackageCheck, ShieldCheck, Truck } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import MainLayout from "../../layout/MainLayout/MainLayout";
import {
  BRAND_NAME,
  FREE_SHIPPING_THRESHOLD,
  RETURN_WINDOW_DAYS,
  STANDARD_SHIPPING_FEE,
  formatCurrency,
} from "../../config/commerce";

type PolicyType = "shipping" | "returns" | "privacy" | "terms";

const policyContent: Record<PolicyType, { title: string; intro: string; items: string[] }> = {
  shipping: {
    title: "Chính sách vận chuyển",
    intro: `${BRAND_NAME} giao hàng toàn quốc. Phí giao hàng được hiển thị trước khi bạn xác nhận đặt hàng.`,
    items: [
      `Miễn phí vận chuyển với đơn hàng từ ${formatCurrency(FREE_SHIPPING_THRESHOLD)}.`,
      `Đơn hàng dưới ngưỡng miễn phí áp dụng phí tiêu chuẩn ${formatCurrency(STANDARD_SHIPPING_FEE)}.`,
      "Thời gian giao phụ thuộc địa chỉ nhận hàng và trạng thái vận chuyển của đơn vị giao nhận.",
      "Khách hàng có thể theo dõi trạng thái trong mục Đơn hàng sau khi đăng nhập.",
    ],
  },
  returns: {
    title: "Chính sách đổi trả",
    intro: `Yêu cầu đổi trả được tiếp nhận trong vòng ${RETURN_WINDOW_DAYS} ngày kể từ khi nhận hàng.`,
    items: [
      "Sản phẩm cần còn nguyên tình trạng, phụ kiện, tem và bao bì đi kèm.",
      "Quay video khi mở kiện để có căn cứ xử lý nếu sản phẩm giao sai hoặc hư hỏng.",
      "Sản phẩm đã qua sử dụng, hư hỏng do người dùng hoặc thuộc diện thanh lý có thể không được chấp nhận.",
      "Hãy liên hệ trung tâm trợ giúp và cung cấp mã đơn trước khi gửi hàng về.",
    ],
  },
  privacy: {
    title: "Chính sách bảo mật",
    intro: "Thông tin cá nhân được sử dụng để xác thực tài khoản, giao hàng, thanh toán và hỗ trợ đơn hàng.",
    items: [
      "Không yêu cầu khách hàng cung cấp mật khẩu hoặc mã xác thực qua chatbot.",
      "Thông tin giao hàng chỉ được chia sẻ cho bên vận chuyển trong phạm vi cần thiết.",
      "Dữ liệu thanh toán được xử lý qua cổng thanh toán; cửa hàng không lưu thông tin ví hoặc thẻ của bạn.",
      "Bạn có thể cập nhật thông tin tài khoản tại trang Hồ sơ.",
    ],
  },
  terms: {
    title: "Điều khoản mua hàng",
    intro: "Vui lòng kiểm tra sản phẩm, số lượng, địa chỉ, mã giảm giá và phương thức thanh toán trước khi đặt hàng.",
    items: [
      "Giá, khuyến mãi và tồn kho được xác nhận lại trên hệ thống khi tạo đơn.",
      "Đơn ZaloPay chỉ được ghi nhận thanh toán sau khi cổng thanh toán xác nhận thành công.",
      "Cửa hàng có thể liên hệ để xác minh đơn có thông tin chưa đầy đủ hoặc dấu hiệu bất thường.",
      "Việc bấm Đặt hàng đồng nghĩa bạn đồng ý với các chính sách đang được công bố trên website.",
    ],
  },
};

const Policies = () => {
  const navigate = useNavigate();
  const { type = "terms" } = useParams<{ type: PolicyType }>();
  const policy = policyContent[type as PolicyType] || policyContent.terms;

  return (
    <MainLayout>
      <Box sx={{ bgcolor: "#f8fafc", minHeight: "70vh", py: { xs: 4, md: 7 } }}>
        <Container maxWidth="md">
          <Button startIcon={<ArrowLeft size={18} />} onClick={() => navigate(-1)} sx={{ mb: 2 }}>Quay lại</Button>
          <Paper elevation={0} sx={{ p: { xs: 3, md: 5 }, borderRadius: 3, border: "1px solid #e2e8f0" }}>
            <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
              {type === "shipping" ? <Truck /> : type === "returns" ? <PackageCheck /> : <ShieldCheck />}
              <Typography component="h1" variant="h4" sx={{ fontWeight: 900 }}>{policy.title}</Typography>
            </Stack>
            <Typography color="text.secondary" sx={{ lineHeight: 1.8 }}>{policy.intro}</Typography>
            <Divider sx={{ my: 3 }} />
            <Stack component="ul" spacing={2} sx={{ pl: 3, color: "#334155" }}>
              {policy.items.map((item) => <Typography component="li" key={item} sx={{ lineHeight: 1.7 }}>{item}</Typography>)}
            </Stack>
          </Paper>
        </Container>
      </Box>
    </MainLayout>
  );
};

export default Policies;

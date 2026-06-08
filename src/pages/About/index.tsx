import { Box, Container, Typography, Button, Paper } from "@mui/material";
import Grid from "@mui/material/Grid";
import {
  Award, Users, Target, Heart, ShoppingBag, Truck, Shield,
  MapPin, Phone, Mail, Clock, ChevronRight, Star, Zap, CheckCircle2,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import MainLayout from "../../layout/MainLayout/MainLayout";
import heroImg from "../../assets/about/hero.png";
import storyImg from "../../assets/about/story.png";
import storeImg from "../../assets/about/store.png";

/* ── Stats data ── */
const stats = [
  { value: "500+", label: "Sản phẩm chính hãng", icon: ShoppingBag, color: "#84CC16" },
  { value: "10.000+", label: "Khách hàng tin tưởng", icon: Users, color: "#0F766E" },
  { value: "50+", label: "Thương hiệu hàng đầu", icon: Award, color: "#3B82F6" },
  { value: "24/7", label: "Hỗ trợ tư vấn", icon: Clock, color: "#F59E0B" },
];

/* ── Timeline data ── */
const timeline = [
  { year: "2022", title: "Khởi đầu", desc: "Thành lập Pickleball Bạch Đằng với niềm đam mê mang Pickleball đến gần hơn với mọi người." },
  { year: "2023", title: "Mở rộng", desc: "Trở thành đại lý chính hãng của 20+ thương hiệu Pickleball quốc tế, phục vụ hàng nghìn khách hàng." },
  { year: "2024", title: "Phát triển", desc: "Ra mắt hệ thống bán hàng online, giao hàng toàn quốc, mở rộng kho hàng và đội ngũ tư vấn." },
  { year: "2025", title: "Vươn tầm", desc: "Đồng hành cùng các giải đấu Pickleball lớn, trở thành đối tác tin cậy của cộng đồng Pickleball Việt Nam." },
];

/* ── Commitments data ── */
const commitments = [
  { icon: Shield, title: "Chính hãng 100%", desc: "Mọi sản phẩm đều được nhập khẩu trực tiếp, có chứng nhận và bảo hành đầy đủ từ nhà sản xuất.", color: "#0F766E", bg: "linear-gradient(135deg, rgba(15,118,110,0.08) 0%, rgba(132,204,22,0.06) 100%)" },
  { icon: Truck, title: "Giao hàng toàn quốc", desc: "Miễn phí vận chuyển cho đơn hàng từ 1 triệu đồng. Giao nhanh 2h trong nội thành HCM.", color: "#3B82F6", bg: "linear-gradient(135deg, rgba(59,130,246,0.08) 0%, rgba(147,197,253,0.06) 100%)" },
  { icon: Heart, title: "Phục vụ tận tâm", desc: "Đội ngũ chuyên gia am hiểu Pickleball, sẵn sàng tư vấn giúp bạn chọn đúng sản phẩm phù hợp.", color: "#E60023", bg: "linear-gradient(135deg, rgba(230,0,35,0.06) 0%, rgba(251,146,60,0.04) 100%)" },
  { icon: Zap, title: "Đổi trả dễ dàng", desc: "Chính sách đổi trả trong 30 ngày, hoàn tiền nếu phát hiện hàng giả. Quyền lợi khách hàng là ưu tiên số 1.", color: "#F59E0B", bg: "linear-gradient(135deg, rgba(245,158,11,0.08) 0%, rgba(252,211,77,0.04) 100%)" },
];

const About = () => {
  const navigate = useNavigate();

  return (
    <MainLayout>
      {/* ══════════ HERO SECTION ══════════ */}
      <Box
        sx={{
          position: "relative",
          minHeight: { xs: 420, md: 560 },
          display: "flex",
          alignItems: "center",
          overflow: "hidden",
        }}
      >
        {/* Background image */}
        <Box
          sx={{
            position: "absolute",
            inset: 0,
            backgroundImage: `url(${heroImg})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            "&::after": {
              content: '""',
              position: "absolute",
              inset: 0,
              background: "linear-gradient(135deg, rgba(0,44,75,0.92) 0%, rgba(15,118,110,0.78) 60%, rgba(132,204,22,0.55) 100%)",
            },
          }}
        />

        <Container maxWidth="lg" sx={{ position: "relative", zIndex: 1, py: { xs: 6, md: 8 } }}>
          <Grid container spacing={4} alignItems="center">
            <Grid size={{ xs: 12, md: 7 }}>
              <Box
                sx={{
                  display: "inline-block",
                  bgcolor: "rgba(132,204,22,0.2)",
                  border: "1px solid rgba(132,204,22,0.4)",
                  borderRadius: 99,
                  px: 2.5,
                  py: 0.6,
                  mb: 3,
                }}
              >
                <Typography sx={{ color: "#84CC16", fontSize: 13, fontWeight: 900, letterSpacing: 2, textTransform: "uppercase" }}>
                  ★ Về chúng tôi
                </Typography>
              </Box>

              <Typography
                variant="h2"
                sx={{
                  color: "#fff",
                  fontWeight: 950,
                  fontSize: { xs: "2rem", sm: "2.5rem", md: "3.2rem" },
                  lineHeight: 1.1,
                  mb: 2.5,
                }}
              >
                Pickleball
                <br />
                <Box component="span" sx={{ color: "#84CC16" }}>Bạch Đằng</Box>
              </Typography>

              <Typography
                sx={{
                  color: "rgba(255,255,255,0.85)",
                  fontSize: { xs: 15, md: 18 },
                  lineHeight: 1.75,
                  maxWidth: 520,
                  mb: 4,
                }}
              >
                Chuyên cung cấp vợt, bóng, giày và phụ kiện Pickleball chính hãng từ các thương hiệu hàng đầu thế giới.
                Đồng hành cùng bạn trên mọi sân đấu.
              </Typography>

              <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
                <Button
                  variant="contained"
                  endIcon={<ChevronRight size={18} />}
                  onClick={() => navigate("/products")}
                  sx={{
                    bgcolor: "#84CC16",
                    color: "#0F172A",
                    fontWeight: 800,
                    px: 4,
                    py: 1.4,
                    borderRadius: "999px",
                    fontSize: "0.95rem",
                    "&:hover": { bgcolor: "#65A30D" },
                    textTransform: "none",
                  }}
                >
                  Khám phá sản phẩm
                </Button>
                <Button
                  variant="outlined"
                  onClick={() => navigate("/support")}
                  sx={{
                    borderColor: "rgba(255,255,255,0.4)",
                    color: "#fff",
                    fontWeight: 700,
                    px: 3.5,
                    py: 1.4,
                    borderRadius: "999px",
                    fontSize: "0.95rem",
                    "&:hover": { borderColor: "#fff", bgcolor: "rgba(255,255,255,0.08)" },
                    textTransform: "none",
                  }}
                >
                  Liên hệ tư vấn
                </Button>
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* ══════════ STATS BAR ══════════ */}
      <Container maxWidth="lg" sx={{ mt: { xs: -4, md: -5 }, position: "relative", zIndex: 2, mb: 8 }}>
        <Paper
          elevation={0}
          sx={{
            borderRadius: 4,
            border: "1px solid #e2e8f0",
            bgcolor: "#fff",
            boxShadow: "0 20px 50px rgba(15,23,42,0.1)",
            overflow: "hidden",
          }}
        >
          <Grid container>
            {stats.map((stat, i) => {
              const Icon = stat.icon;
              return (
                <Grid size={{ xs: 6, md: 3 }} key={stat.label}>
                  <Box
                    sx={{
                      py: { xs: 3, md: 4 },
                      px: 3,
                      textAlign: "center",
                      borderRight: i < stats.length - 1 ? { md: "1px solid #f1f5f9" } : "none",
                      borderBottom: i < 2 ? { xs: "1px solid #f1f5f9", md: "none" } : "none",
                      transition: "all 220ms ease",
                      "&:hover": { bgcolor: "#fafffe" },
                      "&:hover .stat-icon": { transform: "scale(1.15)" },
                    }}
                  >
                    <Box className="stat-icon" sx={{ color: stat.color, mb: 1, transition: "transform 220ms ease" }}>
                      <Icon size={30} strokeWidth={2.2} />
                    </Box>
                    <Typography sx={{ fontSize: { xs: 26, md: 34 }, fontWeight: 950, color: "#0F172A", lineHeight: 1.1 }}>
                      {stat.value}
                    </Typography>
                    <Typography variant="body2" sx={{ color: "#64748b", fontWeight: 600, mt: 0.5 }}>
                      {stat.label}
                    </Typography>
                  </Box>
                </Grid>
              );
            })}
          </Grid>
        </Paper>
      </Container>

      {/* ══════════ STORY SECTION ══════════ */}
      <Container maxWidth="lg" sx={{ mb: 10 }}>
        <Grid container spacing={{ xs: 4, md: 8 }} alignItems="center">
          <Grid size={{ xs: 12, md: 6 }}>
            <Box
              sx={{
                position: "relative",
                borderRadius: 4,
                overflow: "hidden",
                boxShadow: "0 24px 48px rgba(15,23,42,0.14)",
                "&::after": {
                  content: '""',
                  position: "absolute",
                  bottom: 0,
                  left: 0,
                  right: 0,
                  height: 80,
                  background: "linear-gradient(to top, rgba(0,44,75,0.3), transparent)",
                },
              }}
            >
              <Box component="img" src={storyImg} alt="Pickleball Bạch Đằng"
                sx={{ width: "100%", height: { xs: 300, md: 420 }, objectFit: "cover", display: "block" }}
              />
            </Box>
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <Typography
              sx={{ color: "#0F766E", fontSize: 13, fontWeight: 900, letterSpacing: 3, textTransform: "uppercase", mb: 1.5 }}
            >
              Câu chuyện của chúng tôi
            </Typography>
            <Typography
              variant="h3"
              sx={{ fontWeight: 950, color: "#0F172A", fontSize: { xs: "1.6rem", md: "2.2rem" }, lineHeight: 1.15, mb: 3 }}
            >
              Đam mê Pickleball,{" "}
              <Box component="span" sx={{ color: "#0F766E" }}>tận tâm phục vụ</Box>
            </Typography>

            <Typography sx={{ color: "#475569", fontSize: { xs: 15, md: 16 }, lineHeight: 1.8, mb: 2 }}>
              Pickleball Bạch Đằng ra đời từ niềm đam mê với bộ môn Pickleball — môn thể thao đang phát triển nhanh nhất thế giới. Chúng tôi tin rằng mỗi người chơi xứng đáng được sử dụng trang thiết bị chất lượng nhất.
            </Typography>
            <Typography sx={{ color: "#475569", fontSize: { xs: 15, md: 16 }, lineHeight: 1.8, mb: 3 }}>
              Với đội ngũ am hiểu sâu về Pickleball, chúng tôi không chỉ bán sản phẩm mà còn đồng hành cùng bạn trên hành trình chinh phục mọi sân đấu — từ phong trào đến chuyên nghiệp.
            </Typography>

            <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
              {[
                "Nhập khẩu trực tiếp từ nhà sản xuất",
                "Đội ngũ tư vấn chuyên sâu về Pickleball",
                "Cam kết giá tốt nhất thị trường",
              ].map((item) => (
                <Box key={item} sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                  <CheckCircle2 size={18} color="#84CC16" />
                  <Typography sx={{ color: "#334155", fontWeight: 600, fontSize: 15 }}>
                    {item}
                  </Typography>
                </Box>
              ))}
            </Box>
          </Grid>
        </Grid>
      </Container>

      {/* ══════════ COMMITMENTS ══════════ */}
      <Box sx={{ bgcolor: "#f8fafc", py: { xs: 7, md: 10 } }}>
        <Container maxWidth="lg">
          <Box sx={{ textAlign: "center", maxWidth: 640, mx: "auto", mb: { xs: 4, md: 6 } }}>
            <Typography sx={{ color: "#0F766E", fontSize: 13, fontWeight: 900, letterSpacing: 3, textTransform: "uppercase", mb: 1 }}>
              Cam kết của chúng tôi
            </Typography>
            <Typography variant="h3" sx={{ fontWeight: 950, color: "#0F172A", fontSize: { xs: "1.5rem", md: "2.2rem" }, lineHeight: 1.15 }}>
              Tại sao chọn{" "}
              <Box component="span" sx={{ color: "#0F766E" }}>Pickleball Bạch Đằng?</Box>
            </Typography>
          </Box>

          <Grid container spacing={3}>
            {commitments.map((item) => {
              const Icon = item.icon;
              return (
                <Grid size={{ xs: 12, sm: 6, md: 3 }} key={item.title}>
                  <Paper
                    elevation={0}
                    sx={{
                      p: { xs: 3, md: 3.5 },
                      height: "100%",
                      borderRadius: 4,
                      border: "1px solid #e2e8f0",
                      background: item.bg,
                      transition: "all 250ms ease",
                      cursor: "default",
                      "&:hover": {
                        transform: "translateY(-8px)",
                        boxShadow: "0 20px 40px rgba(15,23,42,0.1)",
                        borderColor: item.color,
                      },
                      "&:hover .commit-icon": { transform: "scale(1.1) rotate(-5deg)" },
                    }}
                  >
                    <Box
                      className="commit-icon"
                      sx={{
                        width: 60,
                        height: 60,
                        borderRadius: "16px",
                        bgcolor: `${item.color}15`,
                        color: item.color,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        mb: 2.5,
                        transition: "transform 250ms ease",
                      }}
                    >
                      <Icon size={28} strokeWidth={2.2} />
                    </Box>
                    <Typography sx={{ fontWeight: 850, color: "#0F172A", fontSize: 17, mb: 1 }}>
                      {item.title}
                    </Typography>
                    <Typography variant="body2" sx={{ color: "#64748b", lineHeight: 1.7 }}>
                      {item.desc}
                    </Typography>
                  </Paper>
                </Grid>
              );
            })}
          </Grid>
        </Container>
      </Box>

      {/* ══════════ TIMELINE ══════════ */}
      <Container maxWidth="lg" sx={{ py: { xs: 7, md: 10 } }}>
        <Box sx={{ textAlign: "center", mb: { xs: 4, md: 6 } }}>
          <Typography sx={{ color: "#0F766E", fontSize: 13, fontWeight: 900, letterSpacing: 3, textTransform: "uppercase", mb: 1 }}>
            Hành trình phát triển
          </Typography>
          <Typography variant="h3" sx={{ fontWeight: 950, color: "#0F172A", fontSize: { xs: "1.5rem", md: "2.2rem" } }}>
            Các cột mốc quan trọng
          </Typography>
        </Box>

        <Grid container spacing={3}>
          {timeline.map((item, idx) => (
            <Grid size={{ xs: 12, sm: 6, md: 3 }} key={item.year}>
              <Box
                sx={{
                  position: "relative",
                  pl: { xs: 0, md: 0 },
                  textAlign: "center",
                }}
              >
                {/* Year badge */}
                <Box
                  sx={{
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    width: 72,
                    height: 72,
                    borderRadius: "50%",
                    bgcolor: idx === timeline.length - 1 ? "#0F766E" : "#f1f5f9",
                    color: idx === timeline.length - 1 ? "#fff" : "#0F766E",
                    mb: 2,
                    boxShadow: idx === timeline.length - 1 ? "0 8px 24px rgba(15,118,110,0.3)" : "none",
                    transition: "all 250ms ease",
                    "&:hover": { transform: "scale(1.1)", bgcolor: "#0F766E", color: "#fff", boxShadow: "0 8px 24px rgba(15,118,110,0.3)" },
                  }}
                >
                  <Typography sx={{ fontWeight: 950, fontSize: 20 }}>
                    {item.year}
                  </Typography>
                </Box>

                <Typography sx={{ fontWeight: 850, color: "#0F172A", fontSize: 17, mb: 1 }}>
                  {item.title}
                </Typography>
                <Typography variant="body2" sx={{ color: "#64748b", lineHeight: 1.7, maxWidth: 260, mx: "auto" }}>
                  {item.desc}
                </Typography>
              </Box>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* ══════════ STORE / CONTACT ══════════ */}
      <Box
        sx={{
          position: "relative",
          py: { xs: 7, md: 10 },
          overflow: "hidden",
        }}
      >
        <Box
          sx={{
            position: "absolute",
            inset: 0,
            backgroundImage: `url(${storeImg})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            "&::after": {
              content: '""',
              position: "absolute",
              inset: 0,
              background: "linear-gradient(135deg, rgba(0,44,75,0.94) 0%, rgba(15,23,42,0.88) 100%)",
            },
          }}
        />

        <Container maxWidth="lg" sx={{ position: "relative", zIndex: 1 }}>
          <Grid container spacing={{ xs: 4, md: 6 }} alignItems="center">
            <Grid size={{ xs: 12, md: 5 }}>
              <Typography sx={{ color: "#84CC16", fontSize: 13, fontWeight: 900, letterSpacing: 3, textTransform: "uppercase", mb: 1.5 }}>
                Liên hệ với chúng tôi
              </Typography>
              <Typography variant="h3" sx={{ color: "#fff", fontWeight: 950, fontSize: { xs: "1.6rem", md: "2.2rem" }, lineHeight: 1.15, mb: 3 }}>
                Pickleball Bạch Đằng
                <br />
                <Box component="span" sx={{ color: "#84CC16", fontSize: { xs: "1.2rem", md: "1.5rem" } }}>
                  luôn sẵn sàng hỗ trợ bạn
                </Box>
              </Typography>
              <Typography sx={{ color: "rgba(255,255,255,0.7)", fontSize: 15, lineHeight: 1.75, mb: 4 }}>
                Ghé thăm cửa hàng hoặc liên hệ qua các kênh bên dưới để được tư vấn miễn phí bởi đội ngũ chuyên gia.
              </Typography>

              <Button
                variant="contained"
                endIcon={<ChevronRight size={18} />}
                onClick={() => navigate("/products")}
                sx={{
                  bgcolor: "#84CC16",
                  color: "#0F172A",
                  fontWeight: 800,
                  px: 4,
                  py: 1.4,
                  borderRadius: "999px",
                  fontSize: "0.95rem",
                  "&:hover": { bgcolor: "#65A30D" },
                  textTransform: "none",
                }}
              >
                Mua sắm ngay
              </Button>
            </Grid>

            <Grid size={{ xs: 12, md: 7 }}>
              <Grid container spacing={2}>
                {[
                  { icon: MapPin, label: "Cửa hàng", value: "123 Đường Bạch Đằng, Quận 1, TP.HCM", color: "#3B82F6" },
                  { icon: Phone, label: "Hotline", value: "0123.456.789", color: "#22C55E" },
                  { icon: Mail, label: "Email", value: "info@pickleballbachdang.vn", color: "#F59E0B" },
                  { icon: Clock, label: "Giờ mở cửa", value: "8:00 – 21:00 (Thứ 2 – Chủ nhật)", color: "#8B5CF6" },
                  { icon: Star, label: "Đánh giá", value: "4.9/5 ★ (1.200+ đánh giá)", color: "#EF4444" },
                  { icon: Target, label: "Fanpage", value: "fb.com/pickleballbachdang", color: "#0EA5E9" },
                ].map((item) => {
                  const Icon = item.icon;
                  return (
                    <Grid size={{ xs: 12, sm: 6 }} key={item.label}>
                      <Paper
                        elevation={0}
                        sx={{
                          p: 2.5,
                          borderRadius: 3,
                          bgcolor: "rgba(255,255,255,0.06)",
                          border: "1px solid rgba(255,255,255,0.1)",
                          backdropFilter: "blur(12px)",
                          display: "flex",
                          alignItems: "flex-start",
                          gap: 2,
                          transition: "all 200ms ease",
                          "&:hover": { bgcolor: "rgba(255,255,255,0.1)", borderColor: "rgba(255,255,255,0.2)" },
                        }}
                      >
                        <Box
                          sx={{
                            width: 42,
                            height: 42,
                            borderRadius: "12px",
                            bgcolor: `${item.color}20`,
                            color: item.color,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            flexShrink: 0,
                          }}
                        >
                          <Icon size={20} />
                        </Box>
                        <Box>
                          <Typography variant="caption" sx={{ color: "rgba(255,255,255,0.5)", fontWeight: 700, display: "block", mb: 0.3 }}>
                            {item.label}
                          </Typography>
                          <Typography variant="body2" sx={{ color: "#fff", fontWeight: 700, lineHeight: 1.4 }}>
                            {item.value}
                          </Typography>
                        </Box>
                      </Paper>
                    </Grid>
                  );
                })}
              </Grid>
            </Grid>
          </Grid>
        </Container>
      </Box>
    </MainLayout>
  );
};

export default About;
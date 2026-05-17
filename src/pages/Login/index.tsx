import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  Box,
  TextField,
  Button,
  Typography,
  InputAdornment,
  IconButton,
  CircularProgress,
  Alert,
} from "@mui/material";
import {
  Visibility,
  VisibilityOff,
  Email,
  Lock,
  SportsBaseball,
  ArrowBack,
} from "@mui/icons-material";
import { loginUser, clearAuthError } from "../../store/slices/authSlice";
import type { AppDispatch, RootState } from "../../store/store";
import toast from "react-hot-toast";

const Login = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const { loading, error, isAuthenticated } = useSelector(
    (state: RootState) => state.auth
  );

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");

  // Redirect nếu đã đăng nhập
  useEffect(() => {
    if (isAuthenticated) {
      navigate("/");
    }
  }, [isAuthenticated, navigate]);

  // Xóa error khi component unmount
  useEffect(() => {
    return () => {
      dispatch(clearAuthError());
    };
  }, [dispatch]);

  const validateForm = (): boolean => {
    let valid = true;
    setEmailError("");
    setPasswordError("");

    if (!email.trim()) {
      setEmailError("Vui lòng nhập email");
      valid = false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setEmailError("Email không hợp lệ");
      valid = false;
    }

    if (!password) {
      setPasswordError("Vui lòng nhập mật khẩu");
      valid = false;
    } else if (password.length < 6) {
      setPasswordError("Mật khẩu phải có ít nhất 6 ký tự");
      valid = false;
    }

    return valid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    const result = await dispatch(loginUser({ email, password }));
    if (loginUser.fulfilled.match(result)) {
      toast.success("Đăng nhập thành công! 🎉");
      navigate("/");
    }
  };

  return (
    <Box sx={styles.pageWrapper}>
      {/* Back button */}
      <IconButton 
        onClick={() => navigate(-1)} 
        sx={styles.backButton}
      >
        <ArrowBack />
      </IconButton>

      {/* Animated background */}
      <Box sx={styles.bgOrbs}>
        <Box sx={styles.orb1} />
        <Box sx={styles.orb2} />
        <Box sx={styles.orb3} />
      </Box>

      {/* Main content */}
      <Box sx={styles.container}>
        {/* Left side - branding */}
        <Box sx={styles.brandingSide}>
          <Box sx={styles.brandingContent}>
            <Box sx={styles.logoContainer}>
              <SportsBaseball sx={styles.logoIcon} />
            </Box>
            <Typography sx={styles.brandTitle}>
              Pickleball
              <Box component="span" sx={styles.brandHighlight}>
                Store
              </Box>
            </Typography>
            <Typography sx={styles.brandSubtitle}>
              Trang bị tốt nhất cho trận đấu hoàn hảo
            </Typography>

            {/* Floating 3D cards */}
            <Box sx={styles.floatingCards}>
              <Box sx={styles.floatCard1}>
                <Typography sx={styles.floatCardEmoji}>🏓</Typography>
                <Typography sx={styles.floatCardText}>
                  Vợt cao cấp
                </Typography>
              </Box>
              <Box sx={styles.floatCard2}>
                <Typography sx={styles.floatCardEmoji}>👟</Typography>
                <Typography sx={styles.floatCardText}>Giày chuyên dụng</Typography>
              </Box>
              <Box sx={styles.floatCard3}>
                <Typography sx={styles.floatCardEmoji}>🎾</Typography>
                <Typography sx={styles.floatCardText}>Phụ kiện chính hãng</Typography>
              </Box>
            </Box>
          </Box>
        </Box>

        {/* Right side - login form */}
        <Box sx={styles.formSide}>
          <Box sx={styles.formCard}>
            <Typography sx={styles.formTitle}>Chào mừng trở lại! 👋</Typography>
            <Typography sx={styles.formSubtitle}>
              Đăng nhập vào tài khoản của bạn để tiếp tục
            </Typography>

            {error && (
              <Alert severity="error" sx={styles.alert} onClose={() => dispatch(clearAuthError())}>
                {error}
              </Alert>
            )}

            <Box component="form" onSubmit={handleSubmit} sx={styles.form}>
              <TextField
                id="login-email"
                fullWidth
                label="Email"
                placeholder="example@email.com"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setEmailError("");
                }}
                error={!!emailError}
                helperText={emailError}
                slotProps={{
                  input: {
                    startAdornment: (
                      <InputAdornment position="start">
                        <Email sx={{ color: "#94a3b8" }} />
                      </InputAdornment>
                    ),
                  }
                }}
                sx={styles.textField}
              />

              <TextField
                id="login-password"
                fullWidth
                label="Mật khẩu"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setPasswordError("");
                }}
                error={!!passwordError}
                helperText={passwordError}
                slotProps={{
                  input: {
                    startAdornment: (
                      <InputAdornment position="start">
                        <Lock sx={{ color: "#94a3b8" }} />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() => setShowPassword(!showPassword)}
                          edge="end"
                          sx={{ color: "#94a3b8" }}
                        >
                          {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }
                }}
                sx={styles.textField}
              />

              <Button
                id="login-submit-btn"
                type="submit"
                fullWidth
                variant="contained"
                disabled={loading}
                sx={styles.submitButton}
              >
                {loading ? (
                  <CircularProgress size={24} sx={{ color: "#fff" }} />
                ) : (
                  "Đăng nhập"
                )}
              </Button>
            </Box>

            <Box sx={styles.divider}>
              <Box sx={styles.dividerLine} />
              <Typography sx={styles.dividerText}>hoặc</Typography>
              <Box sx={styles.dividerLine} />
            </Box>

            <Typography sx={styles.signUpText}>
              Chưa có tài khoản?{" "}
              <Link to="/signup" style={{ textDecoration: "none" }}>
                <Box component="span" sx={styles.signUpLink}>
                  Đăng ký ngay
                </Box>
              </Link>
            </Typography>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

// =============================================
// Styles
// =============================================
const floatAnimation = {
  "@keyframes float": {
    "0%, 100%": { transform: "translateY(0px) rotate(0deg)" },
    "50%": { transform: "translateY(-20px) rotate(5deg)" },
  },
};

const float2Animation = {
  "@keyframes float2": {
    "0%, 100%": { transform: "translateY(0px) rotate(0deg)" },
    "50%": { transform: "translateY(-15px) rotate(-3deg)" },
  },
};

const float3Animation = {
  "@keyframes float3": {
    "0%, 100%": { transform: "translateY(0px) rotate(0deg)" },
    "50%": { transform: "translateY(-25px) rotate(7deg)" },
  },
};

const orbFloat = {
  "@keyframes orbFloat": {
    "0%, 100%": { transform: "translate(0, 0) scale(1)" },
    "33%": { transform: "translate(30px, -30px) scale(1.05)" },
    "66%": { transform: "translate(-20px, 20px) scale(0.95)" },
  },
};

const shimmer = {
  "@keyframes shimmer": {
    "0%": { backgroundPosition: "-200% 0" },
    "100%": { backgroundPosition: "200% 0" },
  },
};

const styles = {
  pageWrapper: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "#f4f6f8",
    position: "relative",
    overflow: "hidden",
    p: { xs: 2, md: 0 },
  },
  backButton: {
    position: "absolute",
    top: { xs: 16, md: 24 },
    left: { xs: 16, md: 24 },
    bgcolor: "rgba(255, 255, 255, 0.8)",
    backdropFilter: "blur(8px)",
    boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
    zIndex: 10,
    color: "#002c4b",
    transition: "all 0.3s ease",
    "&:hover": {
      bgcolor: "#ffffff",
      transform: "translateY(-2px)",
      boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
    },
  },
  bgOrbs: {
    position: "absolute",
    inset: 0,
    pointerEvents: "none",
    ...orbFloat,
  },
  orb1: {
    position: "absolute",
    width: "400px",
    height: "400px",
    borderRadius: "50%",
    background: "radial-gradient(circle, rgba(230, 0, 35, 0.1) 0%, transparent 70%)",
    top: "-100px",
    right: "-100px",
    animation: "orbFloat 8s ease-in-out infinite",
    filter: "blur(40px)",
  },
  orb2: {
    position: "absolute",
    width: "300px",
    height: "300px",
    borderRadius: "50%",
    background: "radial-gradient(circle, rgba(8, 34, 47, 0.08) 0%, transparent 70%)",
    bottom: "-50px",
    left: "-50px",
    animation: "orbFloat 10s ease-in-out infinite reverse",
    filter: "blur(40px)",
  },
  orb3: {
    position: "absolute",
    width: "200px",
    height: "200px",
    borderRadius: "50%",
    background: "radial-gradient(circle, rgba(230, 0, 35, 0.08) 0%, transparent 70%)",
    top: "50%",
    left: "50%",
    animation: "orbFloat 12s ease-in-out infinite",
    filter: "blur(40px)",
  },
  container: {
    display: "flex",
    width: "100%",
    maxWidth: "1100px",
    minHeight: { xs: "auto", md: "650px" },
    borderRadius: "24px",
    overflow: "hidden",
    boxShadow: "0 20px 40px -10px rgba(0, 0, 0, 0.1), 0 0 0 1px rgba(0,0,0,0.05)",
    position: "relative",
    zIndex: 1,
    flexDirection: { xs: "column", md: "row" },
    bgcolor: "#ffffff",
  },
  brandingSide: {
    flex: "1 1 45%",
    background: "linear-gradient(135deg, #0d3b56 0%, #005691 100%)",
    display: { xs: "none", md: "flex" },
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
    overflow: "hidden",
    "&::before": {
      content: '""',
      position: "absolute",
      top: "-50%",
      left: "-50%",
      width: "200%",
      height: "200%",
      background:
        "radial-gradient(circle at 30% 50%, rgba(255,255,255,0.1) 0%, transparent 50%)",
    },
    ...floatAnimation,
    ...float2Animation,
    ...float3Animation,
  },
  brandingContent: {
    textAlign: "center",
    px: 5,
    position: "relative",
    zIndex: 1,
  },
  logoContainer: {
    width: "80px",
    height: "80px",
    borderRadius: "24px",
    background: "rgba(255,255,255,0.15)",
    backdropFilter: "blur(20px)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    mx: "auto",
    mb: 4,
    boxShadow: "0 10px 40px rgba(0,0,0,0.15)",
    border: "1px solid rgba(255,255,255,0.25)",
    transform: "rotate(-5deg)",
    transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
    "&:hover": {
      transform: "rotate(0deg) scale(1.08)",
      background: "rgba(255,255,255,0.2)",
    },
  },
  logoIcon: {
    fontSize: "40px",
    color: "#fff",
  },
  brandTitle: {
    fontFamily: '"Outfit", "Inter", sans-serif',
    fontSize: "2.6rem",
    fontWeight: 800,
    color: "#fff",
    letterSpacing: "-0.03em",
    lineHeight: 1.2,
    mb: 1.5,
  },
  brandHighlight: {
    background: "linear-gradient(90deg, #fbbf24, #f59e0b)",
    backgroundClip: "text",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    ml: 1,
  },
  brandSubtitle: {
    fontFamily: '"Inter", sans-serif',
    fontSize: "1.05rem",
    color: "rgba(255,255,255,0.9)",
    mb: 5,
    fontWeight: 400,
    letterSpacing: "0.01em",
  },
  floatingCards: {
    position: "relative",
    height: "180px",
  },
  floatCard1: {
    position: "absolute",
    left: "10%",
    top: "0",
    background: "rgba(255,255,255,0.15)",
    backdropFilter: "blur(20px)",
    borderRadius: "16px",
    px: 2.5,
    py: 1.5,
    border: "1px solid rgba(255,255,255,0.2)",
    animation: "float 4s ease-in-out infinite",
    boxShadow: "0 8px 24px rgba(0,0,0,0.1)",
  },
  floatCard2: {
    position: "absolute",
    right: "5%",
    top: "30px",
    background: "rgba(255,255,255,0.15)",
    backdropFilter: "blur(20px)",
    borderRadius: "16px",
    px: 2.5,
    py: 1.5,
    border: "1px solid rgba(255,255,255,0.2)",
    animation: "float2 5s ease-in-out infinite",
    boxShadow: "0 8px 24px rgba(0,0,0,0.1)",
  },
  floatCard3: {
    position: "absolute",
    left: "25%",
    bottom: "0",
    background: "rgba(255,255,255,0.15)",
    backdropFilter: "blur(20px)",
    borderRadius: "16px",
    px: 2.5,
    py: 1.5,
    border: "1px solid rgba(255,255,255,0.2)",
    animation: "float3 6s ease-in-out infinite",
    boxShadow: "0 8px 24px rgba(0,0,0,0.1)",
  },
  floatCardEmoji: {
    fontSize: "1.5rem",
    mb: 0.5,
  },
  floatCardText: {
    fontFamily: '"Inter", sans-serif',
    fontSize: "0.8rem",
    color: "#fff",
    fontWeight: 600,
    letterSpacing: "0.02em",
  },
  formSide: {
    flex: "1 1 55%",
    background: "#ffffff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    p: { xs: 3, md: 5 },
  },
  formCard: {
    width: "100%",
    maxWidth: "420px",
  },
  formTitle: {
    fontSize: { xs: "1.6rem", md: "1.8rem" },
    fontWeight: 800,
    color: "#002c4b",
    mb: 0.5,
    letterSpacing: "-0.01em",
  },
  formSubtitle: {
    fontSize: "0.9rem",
    color: "#64748b",
    mb: 3,
    fontWeight: 400,
  },
  alert: {
    mb: 2,
    borderRadius: "12px",
    "& .MuiAlert-icon": { alignItems: "center" },
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: 2.5,
  },
  textField: {
    "& .MuiOutlinedInput-root": {
      borderRadius: "14px",
      background: "#f8fafc",
      color: "#1e293b",
      fontSize: "0.95rem",
      transition: "all 0.3s ease",
      "& fieldset": {
        borderColor: "#e2e8f0",
        borderWidth: "1.5px",
      },
      "&:hover fieldset": {
        borderColor: "#cbd5e1",
      },
      "&.Mui-focused fieldset": {
        borderColor: "#E60023",
        boxShadow: "0 0 0 3px rgba(230, 0, 35, 0.1)",
      },
    },
    "& .MuiInputLabel-root": {
      color: "#64748b",
      "&.Mui-focused": { color: "#E60023" },
    },
    "& .MuiFormHelperText-root": {
      fontSize: "0.8rem",
      mt: 0.5,
    },
  },
  submitButton: {
    py: 1.6,
    borderRadius: "14px",
    fontSize: "1rem",
    fontWeight: 700,
    textTransform: "none",
    background: "linear-gradient(135deg, #E60023 0%, #ba0000 100%)",
    boxShadow: "0 4px 15px rgba(230, 0, 35, 0.3)",
    transition: "all 0.3s ease",
    mt: 1,
    "&:hover": {
      background: "linear-gradient(135deg, #ff1a3c 0%, #E60023 100%)",
      boxShadow: "0 6px 25px rgba(230, 0, 35, 0.45)",
      transform: "translateY(-2px)",
    },
    "&:active": {
      transform: "translateY(0)",
    },
    "&.Mui-disabled": {
      background: "rgba(230, 0, 35, 0.3)",
      color: "rgba(255,255,255,0.8)",
    },
    ...shimmer,
  },
  divider: {
    display: "flex",
    alignItems: "center",
    my: 3,
    gap: 2,
  },
  dividerLine: {
    flex: 1,
    height: "1px",
    background: "#e2e8f0",
  },
  dividerText: {
    color: "#64748b",
    fontSize: "0.8rem",
    fontWeight: 500,
  },
  signUpText: {
    textAlign: "center",
    color: "#64748b",
    fontSize: "0.9rem",
  },
  signUpLink: {
    color: "#E60023",
    fontWeight: 700,
    cursor: "pointer",
    transition: "all 0.2s ease",
    "&:hover": {
      color: "#ba0000",
      textDecoration: "underline",
    },
  },
};

export default Login;

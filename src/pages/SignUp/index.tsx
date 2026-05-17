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
  LinearProgress,
} from "@mui/material";
import {
  Visibility,
  VisibilityOff,
  Email,
  Lock,
  Person,
  Phone,
  SportsBaseball,
  CheckCircle,
  ArrowBack,
} from "@mui/icons-material";
import { registerUser, clearAuthError } from "../../store/slices/authSlice";
import type { AppDispatch, RootState } from "../../store/store";
import toast from "react-hot-toast";

const SignUp = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const { loading, error, isAuthenticated } = useSelector(
    (state: RootState) => state.auth
  );

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [nameError, setNameError] = useState("");
  const [emailError, setEmailError] = useState("");
  const [phoneError, setPhoneError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [confirmPasswordError, setConfirmPasswordError] = useState("");

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

  // Tính độ mạnh mật khẩu
  const getPasswordStrength = (): { score: number; label: string; color: string } => {
    if (!password) return { score: 0, label: "", color: "#475569" };
    let score = 0;
    if (password.length >= 6) score += 25;
    if (password.length >= 8) score += 15;
    if (/[A-Z]/.test(password)) score += 20;
    if (/[0-9]/.test(password)) score += 20;
    if (/[^A-Za-z0-9]/.test(password)) score += 20;

    if (score <= 25) return { score, label: "Yếu", color: "#ef4444" };
    if (score <= 50) return { score, label: "Trung bình", color: "#f59e0b" };
    if (score <= 75) return { score, label: "Khá", color: "#3b82f6" };
    return { score, label: "Mạnh", color: "#22c55e" };
  };

  const strength = getPasswordStrength();

  const validateForm = (): boolean => {
    let valid = true;
    setNameError("");
    setEmailError("");
    setPhoneError("");
    setPasswordError("");
    setConfirmPasswordError("");

    if (!name.trim()) {
      setNameError("Vui lòng nhập họ tên");
      valid = false;
    } else if (name.trim().length < 2) {
      setNameError("Họ tên phải có ít nhất 2 ký tự");
      valid = false;
    }

    if (!email.trim()) {
      setEmailError("Vui lòng nhập email");
      valid = false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setEmailError("Email không hợp lệ");
      valid = false;
    }

    if (!phone.trim()) {
      setPhoneError("Vui lòng nhập số điện thoại");
      valid = false;
    } else if (!/^(0[3-9])\d{8}$/.test(phone)) {
      setPhoneError("Số điện thoại không hợp lệ (VD: 0912345678)");
      valid = false;
    }

    if (!password) {
      setPasswordError("Vui lòng nhập mật khẩu");
      valid = false;
    } else if (password.length < 6) {
      setPasswordError("Mật khẩu phải có ít nhất 6 ký tự");
      valid = false;
    }

    if (!confirmPassword) {
      setConfirmPasswordError("Vui lòng xác nhận mật khẩu");
      valid = false;
    } else if (password !== confirmPassword) {
      setConfirmPasswordError("Mật khẩu xác nhận không khớp");
      valid = false;
    }

    return valid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    const result = await dispatch(
      registerUser({ name: name.trim(), email, password, phone })
    );
    if (registerUser.fulfilled.match(result)) {
      toast.success("Đăng ký thành công! Vui lòng đăng nhập 🎉");
      navigate("/login");
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
        <Box sx={styles.orb4} />
      </Box>

      {/* Main content */}
      <Box sx={styles.container}>
        {/* Left side - form */}
        <Box sx={styles.formSide}>
          <Box sx={styles.formCard}>
            <Box sx={styles.mobileLogoRow}>
              <SportsBaseball sx={{ color: "#dc2626", fontSize: "28px" }} />
              <Typography sx={styles.mobileLogoText}>PickleballStore</Typography>
            </Box>

            <Typography sx={styles.formTitle}>Tạo tài khoản mới ✨</Typography>
            <Typography sx={styles.formSubtitle}>
              Đăng ký để bắt đầu trải nghiệm mua sắm tuyệt vời
            </Typography>

            {error && (
              <Alert severity="error" sx={styles.alert} onClose={() => dispatch(clearAuthError())}>
                {error}
              </Alert>
            )}

            <Box component="form" onSubmit={handleSubmit} sx={styles.form}>
              {/* Row 1: name & phone */}
              <Box sx={styles.formRow}>
                <TextField
                  id="signup-name"
                  fullWidth
                  label="Họ và tên"
                  placeholder="Nguyễn Văn A"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    setNameError("");
                  }}
                  error={!!nameError}
                  helperText={nameError}
                  slotProps={{
                    input: {
                      startAdornment: (
                        <InputAdornment position="start">
                          <Person sx={{ color: "#94a3b8" }} />
                        </InputAdornment>
                      ),
                    }
                  }}
                  sx={styles.textField}
                />
                <TextField
                  id="signup-phone"
                  fullWidth
                  label="Số điện thoại"
                  placeholder="0912345678"
                  value={phone}
                  onChange={(e) => {
                    setPhone(e.target.value);
                    setPhoneError("");
                  }}
                  error={!!phoneError}
                  helperText={phoneError}
                  slotProps={{
                    input: {
                      startAdornment: (
                        <InputAdornment position="start">
                          <Phone sx={{ color: "#94a3b8" }} />
                        </InputAdornment>
                      ),
                    }
                  }}
                  sx={styles.textField}
                />
              </Box>

              {/* Email */}
              <TextField
                id="signup-email"
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

              {/* Password */}
              <Box>
                <TextField
                  id="signup-password"
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
                {password && (
                  <Box sx={{ mt: 1 }}>
                    <LinearProgress
                      variant="determinate"
                      value={strength.score}
                      sx={{
                        height: 4,
                        borderRadius: 2,
                        backgroundColor: "rgba(148,163,184,0.15)",
                        "& .MuiLinearProgress-bar": {
                          borderRadius: 2,
                          backgroundColor: strength.color,
                          transition: "all 0.4s ease",
                        },
                      }}
                    />
                    <Typography
                      sx={{ fontSize: "0.7rem", color: strength.color, mt: 0.5, fontWeight: 600 }}
                    >
                      {strength.label}
                    </Typography>
                  </Box>
                )}
              </Box>

              {/* Confirm Password */}
              <TextField
                id="signup-confirm-password"
                fullWidth
                label="Xác nhận mật khẩu"
                type={showConfirmPassword ? "text" : "password"}
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value);
                  setConfirmPasswordError("");
                }}
                error={!!confirmPasswordError}
                helperText={confirmPasswordError}
                slotProps={{
                  input: {
                    startAdornment: (
                      <InputAdornment position="start">
                        <Lock sx={{ color: "#94a3b8" }} />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        {confirmPassword && password === confirmPassword ? (
                          <CheckCircle sx={{ color: "#22c55e" }} />
                        ) : (
                          <IconButton
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            edge="end"
                            sx={{ color: "#94a3b8" }}
                          >
                            {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                          </IconButton>
                        )}
                      </InputAdornment>
                    ),
                  }
                }}
                sx={styles.textField}
              />

              <Button
                id="signup-submit-btn"
                type="submit"
                fullWidth
                variant="contained"
                disabled={loading}
                sx={styles.submitButton}
              >
                {loading ? (
                  <CircularProgress size={24} sx={{ color: "#fff" }} />
                ) : (
                  "Tạo tài khoản"
                )}
              </Button>
            </Box>

            <Box sx={styles.divider}>
              <Box sx={styles.dividerLine} />
              <Typography sx={styles.dividerText}>hoặc</Typography>
              <Box sx={styles.dividerLine} />
            </Box>

            <Typography sx={styles.loginText}>
              Đã có tài khoản?{" "}
              <Link to="/login" style={{ textDecoration: "none" }}>
                <Box component="span" sx={styles.loginLink}>
                  Đăng nhập
                </Box>
              </Link>
            </Typography>
          </Box>
        </Box>

        {/* Right side - branding */}
        <Box sx={styles.brandingSide}>
          <Box sx={styles.brandingContent}>
            <Box sx={styles.logoContainer}>
              <SportsBaseball sx={styles.logoIcon} />
            </Box>
            <Typography sx={styles.brandTitle}>
              Tham gia cộng đồng
              <br />
              <Box component="span" sx={styles.brandHighlight}>
                Pickleball
              </Box>
            </Typography>
            <Typography sx={styles.brandSubtitle}>
              Hàng nghìn sản phẩm chất lượng đang chờ bạn khám phá
            </Typography>

            {/* Benefit cards */}
            <Box sx={styles.benefitList}>
              {[
                { icon: "🚀", text: "Giao hàng siêu tốc toàn quốc" },
                { icon: "💎", text: "Sản phẩm chính hãng 100%" },
                { icon: "🔥", text: "Ưu đãi độc quyền cho thành viên" },
                { icon: "🛡️", text: "Bảo hành & đổi trả dễ dàng" },
              ].map((item, index) => (
                <Box key={index} sx={styles.benefitCard(index)}>
                  <Typography sx={{ fontSize: "1.3rem" }}>{item.icon}</Typography>
                  <Typography sx={styles.benefitText}>{item.text}</Typography>
                </Box>
              ))}
            </Box>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

// =============================================
// Styles
// =============================================
const orbFloat = {
  "@keyframes orbFloat": {
    "0%, 100%": { transform: "translate(0, 0) scale(1)" },
    "33%": { transform: "translate(30px, -30px) scale(1.05)" },
    "66%": { transform: "translate(-20px, 20px) scale(0.95)" },
  },
};

const fadeSlideUp = {
  "@keyframes fadeSlideUp": {
    from: { opacity: 0, transform: "translateY(20px)" },
    to: { opacity: 1, transform: "translateY(0)" },
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
    width: "350px",
    height: "350px",
    borderRadius: "50%",
    background: "radial-gradient(circle, rgba(230, 0, 35, 0.08) 0%, transparent 70%)",
    top: "-80px",
    left: "-80px",
    animation: "orbFloat 9s ease-in-out infinite",
    filter: "blur(40px)",
  },
  orb2: {
    position: "absolute",
    width: "300px",
    height: "300px",
    borderRadius: "50%",
    background: "radial-gradient(circle, rgba(8, 34, 47, 0.06) 0%, transparent 70%)",
    bottom: "-60px",
    right: "-60px",
    animation: "orbFloat 11s ease-in-out infinite reverse",
    filter: "blur(40px)",
  },
  orb3: {
    position: "absolute",
    width: "200px",
    height: "200px",
    borderRadius: "50%",
    background: "radial-gradient(circle, rgba(230, 0, 35, 0.05) 0%, transparent 70%)",
    top: "40%",
    right: "30%",
    animation: "orbFloat 13s ease-in-out infinite",
    filter: "blur(40px)",
  },
  orb4: {
    position: "absolute",
    width: "250px",
    height: "250px",
    borderRadius: "50%",
    background: "radial-gradient(circle, rgba(34, 197, 94, 0.06) 0%, transparent 70%)",
    bottom: "20%",
    left: "40%",
    animation: "orbFloat 15s ease-in-out infinite reverse",
    filter: "blur(40px)",
  },
  container: {
    display: "flex",
    width: "100%",
    maxWidth: "1100px",
    minHeight: { xs: "auto", md: "700px" },
    borderRadius: "24px",
    overflow: "hidden",
    boxShadow: "0 20px 40px -10px rgba(0, 0, 0, 0.1), 0 0 0 1px rgba(0,0,0,0.05)",
    position: "relative",
    zIndex: 1,
    flexDirection: { xs: "column", md: "row" },
    bgcolor: "#ffffff",
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
    maxWidth: "480px",
    ...fadeSlideUp,
  },
  mobileLogoRow: {
    display: { xs: "flex", md: "none" },
    alignItems: "center",
    gap: 1,
    mb: 3,
  },
  mobileLogoText: {
    fontSize: "1.2rem",
    fontWeight: 800,
    color: "#002c4b",
  },
  formTitle: {
    fontSize: { xs: "1.5rem", md: "1.75rem" },
    fontWeight: 800,
    color: "#002c4b",
    mb: 0.5,
    letterSpacing: "-0.01em",
  },
  formSubtitle: {
    fontSize: "0.88rem",
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
    gap: 2,
  },
  formRow: {
    display: "flex",
    gap: 2,
    flexDirection: { xs: "column", sm: "row" },
  },
  textField: {
    "& .MuiOutlinedInput-root": {
      borderRadius: "14px",
      background: "#f8fafc",
      color: "#1e293b",
      fontSize: "0.92rem",
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
      fontSize: "0.9rem",
      "&.Mui-focused": { color: "#E60023" },
    },
    "& .MuiFormHelperText-root": {
      fontSize: "0.75rem",
      mt: 0.5,
    },
  },
  submitButton: {
    py: 1.5,
    borderRadius: "14px",
    fontSize: "1rem",
    fontWeight: 700,
    textTransform: "none",
    background: "linear-gradient(135deg, #E60023 0%, #ba0000 100%)",
    boxShadow: "0 4px 15px rgba(230, 0, 35, 0.3)",
    transition: "all 0.3s ease",
    mt: 0.5,
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
    my: 2.5,
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
  loginText: {
    textAlign: "center",
    color: "#64748b",
    fontSize: "0.9rem",
  },
  loginLink: {
    color: "#E60023",
    fontWeight: 700,
    cursor: "pointer",
    transition: "all 0.2s ease",
    "&:hover": {
      color: "#ba0000",
      textDecoration: "underline",
    },
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
        "radial-gradient(circle at 70% 50%, rgba(255,255,255,0.08) 0%, transparent 50%)",
    },
    ...fadeSlideUp,
  },
  brandingContent: {
    textAlign: "center",
    px: 4,
    position: "relative",
    zIndex: 1,
  },
  logoContainer: {
    width: "70px",
    height: "70px",
    borderRadius: "20px",
    background: "rgba(255,255,255,0.15)",
    backdropFilter: "blur(20px)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    mx: "auto",
    mb: 3,
    boxShadow: "0 10px 30px rgba(0,0,0,0.15)",
    border: "1px solid rgba(255,255,255,0.25)",
    transform: "rotate(-5deg)",
    transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
    "&:hover": {
      transform: "rotate(0deg) scale(1.08)",
      background: "rgba(255,255,255,0.2)",
    },
  },
  logoIcon: {
    fontSize: "36px",
    color: "#fff",
  },
  brandTitle: {
    fontFamily: '"Outfit", "Inter", sans-serif',
    fontSize: "2.1rem",
    fontWeight: 800,
    color: "#fff",
    letterSpacing: "-0.03em",
    mb: 1,
    lineHeight: 1.3,
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
    fontSize: "0.95rem",
    color: "rgba(255,255,255,0.9)",
    mb: 4,
    fontWeight: 400,
    letterSpacing: "0.01em",
  },
  benefitList: {
    display: "flex",
    flexDirection: "column",
    gap: 1.5,
    textAlign: "left",
  },
  benefitCard: (index: number) => ({
    display: "flex",
    alignItems: "center",
    gap: 1.5,
    background: "rgba(255,255,255,0.12)",
    backdropFilter: "blur(12px)",
    borderRadius: "14px",
    px: 2.5,
    py: 1.5,
    border: "1px solid rgba(255,255,255,0.2)",
    transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
    animation: `fadeSlideUp 0.6s ease ${index * 0.1}s both`,
    boxShadow: "0 4px 15px rgba(0,0,0,0.05)",
    "&:hover": {
      background: "rgba(255,255,255,0.2)",
      transform: "translateX(8px)",
      boxShadow: "0 8px 25px rgba(0,0,0,0.1)",
    },
  }),
  benefitText: {
    fontFamily: '"Inter", sans-serif',
    fontSize: "0.88rem",
    color: "#fff",
    fontWeight: 500,
    letterSpacing: "0.01em",
  },
};

export default SignUp;

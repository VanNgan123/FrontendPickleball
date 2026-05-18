import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Container,
  Typography,
  Button,
  TextField,
  Paper,
  Avatar,
  IconButton,
  CircularProgress,
  Divider,
  Chip,
  Alert,
} from "@mui/material";
import Grid from "@mui/material/Grid";
import {
  Camera,
  User,
  Phone,
  Mail,
  MapPin,
  Shield,
  Edit3,
  Save,
  X,
  Package,
  Heart,
  ChevronRight,
} from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "../../store/store";
import { logout } from "../../store/slices/authSlice";
import userService from "../../services/userService";
import type { UserProfile } from "../../services/userService";
import MainLayout from "../../layout/MainLayout/MainLayout";
import toast from "react-hot-toast";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";

const getAvatarUrl = (avatarPath?: string) => {
  if (!avatarPath) return undefined;
  if (avatarPath.startsWith("http")) return avatarPath;
  const baseUrl = API_URL.replace(/\/+$/, "");
  const path = avatarPath.startsWith("/") ? avatarPath : `/${avatarPath}`;
  return `${baseUrl}${path}`;
};

const ROLE_MAP: Record<string, { label: string; color: string; bg: string }> = {
  customer: { label: "Khach hang", color: "#3b82f6", bg: "rgba(59,130,246,0.1)" },
  admin: { label: "Quan tri vien", color: "#E60023", bg: "rgba(230,0,35,0.1)" },
  manager: { label: "Quan ly", color: "#8b5cf6", bg: "rgba(139,92,246,0.1)" },
  support: { label: "Ho tro", color: "#f59e0b", bg: "rgba(245,158,11,0.1)" },
};

// =============================================
// Stat Card
// =============================================
const StatCard = ({
  icon,
  label,
  value,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  onClick?: () => void;
}) => (
  <Paper
    elevation={0}
    onClick={onClick}
    sx={{
      p: 2.5,
      border: "1px solid #eee",
      borderRadius: 2,
      cursor: onClick ? "pointer" : "default",
      transition: "all 0.2s ease",
      "&:hover": onClick
        ? {
            borderColor: "#E60023",
            boxShadow: "0 4px 15px rgba(230,0,35,0.1)",
            transform: "translateY(-2px)",
          }
        : {},
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      gap: 1,
    }}
  >
    <Box sx={{ color: "#E60023" }}>{icon}</Box>
    <Typography variant="h5" sx={{ fontWeight: 900, color: "#1a1a1a", lineHeight: 1 }}>
      {value}
    </Typography>
    <Typography
      variant="caption"
      sx={{ color: "#888", fontWeight: 600, textAlign: "center" }}
    >
      {label}
    </Typography>
    {onClick && <ChevronRight size={14} color="#ccc" />}
  </Paper>
);

// =============================================
// Main Profile Page
// =============================================
const Profile = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const avatarInputRef = useRef<HTMLInputElement>(null);

  const { isAuthenticated } = useSelector((state: RootState) => state.auth);

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [pageLoading, setPageLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [saving, setSaving] = useState(false);
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState<string | undefined>(undefined);

  // Form state
  const [form, setForm] = useState({ name: "", phone: "" });
  const [formErrors, setFormErrors] = useState<{ name?: string; phone?: string }>({});

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }
    loadProfile();
  }, [isAuthenticated]);

  const loadProfile = async () => {
    try {
      setPageLoading(true);
      const res = await userService.getProfile();
      setProfile(res.data);
      setForm({ name: res.data.name, phone: res.data.phone || "" });
      setAvatarPreview(getAvatarUrl(res.data.avatar));
    } catch {
      toast.error("Khong the tai thong tin tai khoan");
    } finally {
      setPageLoading(false);
    }
  };

  // Avatar upload
  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Anh khong duoc vuot qua 5MB");
      return;
    }

    const previewUrl = URL.createObjectURL(file);
    setAvatarPreview(previewUrl);

    try {
      setAvatarUploading(true);
      const res = await userService.updateAvatar(file);
      setProfile(res.data);
      setAvatarPreview(getAvatarUrl(res.data.avatar));
      toast.success("Cap nhat anh dai dien thanh cong!");
    } catch {
      toast.error("Upload anh that bai");
      setAvatarPreview(getAvatarUrl(profile?.avatar));
    } finally {
      setAvatarUploading(false);
    }
  };

  // Save profile
  const validateForm = () => {
    const errors: { name?: string; phone?: string } = {};
    if (!form.name.trim()) errors.name = "Vui long nhap ho ten";
    else if (form.name.trim().length < 2) errors.name = "Ho ten it nhat 2 ky tu";
    if (form.phone && !/^(0[3-9])\d{8}$/.test(form.phone))
      errors.phone = "So dien thoai khong hop le (VD: 0912345678)";
    return errors;
  };

  const handleSave = async () => {
    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }
    try {
      setSaving(true);
      const res = await userService.updateProfile({
        name: form.name.trim(),
        phone: form.phone.trim() || undefined,
      });
      setProfile(res.data);
      setEditMode(false);
      toast.success("Cap nhat thong tin thanh cong!");
    } catch {
      toast.error("Cap nhat that bai, vui long thu lai");
    } finally {
      setSaving(false);
    }
  };

  const handleCancelEdit = () => {
    setForm({ name: profile?.name || "", phone: profile?.phone || "" });
    setFormErrors({});
    setEditMode(false);
  };

  const handleLogout = () => {
    dispatch(logout());
    navigate("/");
    toast.success("Da dang xuat");
  };

  const textFieldSx = {
    "& .MuiOutlinedInput-root": {
      borderRadius: 2,
      bgcolor: "#fafafa",
      "& fieldset": { borderColor: "#e0e0e0" },
      "&:hover fieldset": { borderColor: "#E60023" },
      "&.Mui-focused fieldset": { borderColor: "#E60023" },
    },
    "& .MuiInputLabel-root.Mui-focused": { color: "#E60023" },
  };

  if (pageLoading) {
    return (
      <MainLayout>
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            minHeight: "60vh",
          }}
        >
          <CircularProgress sx={{ color: "#E60023" }} />
        </Box>
      </MainLayout>
    );
  }

  if (!profile) return null;

  const role = ROLE_MAP[profile.role] || ROLE_MAP.customer;

  return (
    <MainLayout>
      <Container maxWidth="lg" sx={{ py: 4, pb: 8 }}>
        {/* Breadcrumb */}
        <Typography variant="body2" sx={{ color: "#888", mb: 3 }}>
          <span style={{ cursor: "pointer" }} onClick={() => navigate("/")}>Trang chu</span>
          {" / "}
          <span style={{ fontWeight: 700, color: "#1a1a1a" }}>Tai khoan cua toi</span>
        </Typography>

        <Grid container spacing={3}>
          {/* ===== LEFT: Avatar + Quick info ===== */}
          <Grid size={{ xs: 12, md: 4 }}>
            <Paper
              elevation={0}
              sx={{
                border: "1px solid #eee",
                borderRadius: 2,
                overflow: "hidden",
                mb: 3,
                bgcolor: "#fff",
              }}
            >
              <Box
                sx={{
                  height: 80,
                  background:
                    "linear-gradient(135deg, #08222f 0%, #002c4b 50%, #E60023 100%)",
                }}
              />

              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  px: 3,
                  pb: 3,
                }}
              >
                <Box sx={{ position: "relative", mt: -5, mb: 1.5 }}>
                  <Avatar
                    src={avatarPreview}
                    sx={{
                      width: 90,
                      height: 90,
                      border: "3px solid white",
                      boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                      fontSize: "2rem",
                      bgcolor: "#E60023",
                    }}
                  >
                    {profile.name.charAt(0).toUpperCase()}
                  </Avatar>

                  <IconButton
                    size="small"
                    onClick={() => avatarInputRef.current?.click()}
                    disabled={avatarUploading}
                    sx={{
                      position: "absolute",
                      bottom: 0,
                      right: 0,
                      bgcolor: "#E60023",
                      color: "white",
                      width: 28,
                      height: 28,
                      "&:hover": { bgcolor: "#c4001d" },
                      boxShadow: "0 2px 8px rgba(230,0,35,0.4)",
                    }}
                  >
                    {avatarUploading ? (
                      <CircularProgress size={14} sx={{ color: "white" }} />
                    ) : (
                      <Camera size={14} />
                    )}
                  </IconButton>
                  <input
                    ref={avatarInputRef}
                    type="file"
                    accept="image/*"
                    style={{ display: "none" }}
                    onChange={handleAvatarChange}
                  />
                </Box>

                <Typography variant="h6" sx={{ fontWeight: 800, color: "#1a1a1a", mb: 0.5 }}>
                  {profile.name}
                </Typography>

                <Chip
                  label={role.label}
                  size="small"
                  sx={{
                    bgcolor: role.bg,
                    color: role.color,
                    fontWeight: 700,
                    fontSize: "0.75rem",
                    border: `1px solid ${role.color}`,
                    mb: 2,
                  }}
                />

                <Divider sx={{ width: "100%", mb: 2 }} />

                <Box sx={{ width: "100%" }}>
                  {[
                    { icon: <Mail size={15} />, value: profile.email },
                    { icon: <Phone size={15} />, value: profile.phone || "Chua cap nhat" },
                  ].map((item, idx) => (
                    <Box
                      key={idx}
                      sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 1.5 }}
                    >
                      <Box sx={{ color: "#aaa", flexShrink: 0 }}>{item.icon}</Box>
                      <Typography
                        variant="body2"
                        sx={{
                          color: item.value === "Chua cap nhat" ? "#bbb" : "#555",
                          fontStyle: item.value === "Chua cap nhat" ? "italic" : "normal",
                          fontSize: "0.85rem",
                          wordBreak: "break-all",
                        }}
                      >
                        {item.value}
                      </Typography>
                    </Box>
                  ))}

                  <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 2 }}>
                    <Shield size={15} color="#aaa" />
                    <Typography variant="body2" sx={{ color: "#555", fontSize: "0.85rem" }}>
                      Tham gia: {new Date(profile.createdAt).toLocaleDateString("vi-VN", {
                        month: "long",
                        year: "numeric",
                      })}
                    </Typography>
                  </Box>
                </Box>

                <Divider sx={{ width: "100%", mb: 2 }} />

                <Button
                  fullWidth
                  variant="outlined"
                  onClick={handleLogout}
                  sx={{
                    borderColor: "#E60023",
                    color: "#E60023",
                    fontWeight: 700,
                    borderRadius: 2,
                    "&:hover": { bgcolor: "#E60023", color: "white" },
                  }}
                >
                  Dang xuat
                </Button>
              </Box>
            </Paper>

            <Grid container spacing={1.5}>
              <Grid size={6}>
                <StatCard
                  icon={<Package size={22} />}
                  label="Don hang"
                  value="-"
                  onClick={() => navigate("/orders")}
                />
              </Grid>
              <Grid size={6}>
                <StatCard
                  icon={<Heart size={22} />}
                  label="Yeu thich"
                  value="-"
                  onClick={() => navigate("/wishlist")}
                />
              </Grid>
            </Grid>
          </Grid>

          {/* ===== RIGHT: Edit form ===== */}
          <Grid size={{ xs: 12, md: 8 }}>
            <Paper
              elevation={0}
              sx={{
                border: "1px solid #eee",
                borderRadius: 2,
                overflow: "hidden",
                bgcolor: "#fff",
                mb: 3,
              }}
            >
              <Box
                sx={{
                  px: 3,
                  py: 2,
                  bgcolor: "#fafafa",
                  borderBottom: "1px solid #f0f0f0",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <User size={18} color="#E60023" />
                  <Typography variant="subtitle1" sx={{ fontWeight: 800, color: "#1a1a1a" }}>
                    THONG TIN CA NHAN
                  </Typography>
                </Box>

                {!editMode ? (
                  <Button
                    size="small"
                    startIcon={<Edit3 size={14} />}
                    onClick={() => setEditMode(true)}
                    sx={{ color: "#E60023", fontWeight: 700 }}
                  >
                    Chinh sua
                  </Button>
                ) : (
                  <Box sx={{ display: "flex", gap: 1 }}>
                    <Button
                      size="small"
                      startIcon={<X size={14} />}
                      onClick={handleCancelEdit}
                      sx={{ color: "#888", fontWeight: 700 }}
                    >
                      Huy
                    </Button>
                    <Button
                      size="small"
                      variant="contained"
                      startIcon={<Save size={14} />}
                      onClick={handleSave}
                      disabled={saving}
                      sx={{ bgcolor: "#E60023", "&:hover": { bgcolor: "#c4001d" }, fontWeight: 700 }}
                    >
                      {saving ? <CircularProgress size={16} sx={{ color: "white" }} /> : "Luu"}
                    </Button>
                  </Box>
                )}
              </Box>

              <Box sx={{ p: 3 }}>
                <Grid container spacing={2}>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <TextField
                      fullWidth
                      label="Ho va ten"
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      error={!!formErrors.name}
                      helperText={formErrors.name}
                      disabled={!editMode}
                      sx={textFieldSx}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <TextField
                      fullWidth
                      label="So dien thoai"
                      value={form.phone}
                      onChange={(e) => setForm({ ...form, phone: e.target.value })}
                      error={!!formErrors.phone}
                      helperText={formErrors.phone}
                      disabled={!editMode}
                      sx={textFieldSx}
                    />
                  </Grid>
                  <Grid size={12}>
                    <TextField
                      fullWidth
                      label="Email"
                      value={profile.email}
                      disabled
                      sx={textFieldSx}
                    />
                  </Grid>

                  {!editMode && (
                    <Grid size={12}>
                      <Alert severity="info" sx={{ borderRadius: 2 }}>
                        Nhấn "Chinh sua" để cập nhật thông tin cá nhân.
                      </Alert>
                    </Grid>
                  )}
                </Grid>
              </Box>
            </Paper>
          </Grid>
        </Grid>
      </Container>
    </MainLayout>
  );
};

export default Profile;

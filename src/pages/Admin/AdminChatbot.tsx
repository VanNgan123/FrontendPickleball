import { useEffect, useState } from "react";
import { Box, Button, Chip, FormControl, InputLabel, MenuItem, Paper, Select, Stack, Switch, TextField, Typography } from "@mui/material";
import AdminLayout from "../../layout/AdminLayout/AdminLayout";
import axiosPickleball from "../../api/axiosPickleball";
import toast from "react-hot-toast";

interface ChatbotConfig {
  enabled: boolean;
  mode: "ai" | "staff" | "offline";
  offlineMessage: string;
  staffReplyMessage: string;
}

const defaultConfig: ChatbotConfig = {
  enabled: true,
  mode: "ai",
  offlineMessage: "Hiện chatbot đang tạm ngưng. Nhân viên hỗ trợ sẽ phản hồi bạn sớm nhất.",
  staffReplyMessage: "Live chat với nhân viên chưa khả dụng. Vui lòng mở Trung tâm trợ giúp để chọn kênh liên hệ phù hợp.",
};

const AdminChatbot = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [config, setConfig] = useState<ChatbotConfig>(defaultConfig);

  useEffect(() => {
    loadConfig();
  }, []);

  const loadConfig = async () => {
    try {
      setLoading(true);
      const response = await axiosPickleball.get("/api/chatbot/config") as { data?: ChatbotConfig };
      setConfig({
        ...defaultConfig,
        ...(response?.data || {}),
      });
    } catch (error) {
      console.error(error);
      toast.error("Không thể tải cấu hình chatbot");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const response = await axiosPickleball.put("/api/chatbot/config", config) as { data?: ChatbotConfig };
      setConfig({
        ...defaultConfig,
        ...(response?.data || {}),
      });
      toast.success("Đã lưu cấu hình chatbot");
    } catch (error) {
      console.error(error);
      toast.error("Lưu cấu hình chatbot thất bại");
    } finally {
      setSaving(false);
    }
  };

  return (
    <AdminLayout title="Quản lý chatbot">
      <Box sx={{ display: "flex", flexDirection: "column", gap: 3, p: 1 }}>
        <Paper sx={{ p: 3, borderRadius: 3 }}>
          <Stack direction={{ xs: "column", md: "row" }} spacing={2} justifyContent="space-between" alignItems="center">
            <Box>
              <Typography variant="h5" sx={{ fontWeight: 800, mb: 0.5 }}>
                Trợ lý AI / hỗ trợ khách hàng
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Quản lý trạng thái, chế độ hoạt động và tin nhắn mặc định khi chatbot tạm ngưng.
              </Typography>
            </Box>
            <Chip
              label={config.enabled ? "Bật" : "Tắt"}
              color={config.enabled ? "success" : "default"}
              sx={{ fontWeight: 700, px: 1 }}
            />
          </Stack>
        </Paper>

        <Paper sx={{ p: 3, borderRadius: 3 }}>
          <Stack spacing={3}>
            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 2, flexWrap: "wrap" }}>
              <Typography sx={{ fontWeight: 700 }}>Bật chatbot cho khách hàng</Typography>
              <Switch
                checked={config.enabled}
                onChange={(event) => setConfig((prev) => ({ ...prev, enabled: event.target.checked }))}
              />
            </Box>

            <FormControl fullWidth>
              <InputLabel id="chatbot-mode-select">Chế độ hoạt động</InputLabel>
              <Select
                labelId="chatbot-mode-select"
                label="Chế độ hoạt động"
                value={config.mode}
                onChange={(event) => setConfig((prev) => ({ ...prev, mode: event.target.value as ChatbotConfig["mode"] }))}
              >
                <MenuItem value="ai">AI</MenuItem>
                <MenuItem value="staff">Thông báo hỗ trợ (chưa có live chat)</MenuItem>
                <MenuItem value="offline">Offline</MenuItem>
              </Select>
            </FormControl>

            <TextField
              label="Lời nhắn mặc định khi offline"
              value={config.offlineMessage}
              onChange={(event) => setConfig((prev) => ({ ...prev, offlineMessage: event.target.value }))}
              multiline
              minRows={3}
              fullWidth
            />

            <TextField
              label="Lời nhắn khi chế độ nhân viên đang hoạt động"
              value={config.staffReplyMessage}
              onChange={(event) => setConfig((prev) => ({ ...prev, staffReplyMessage: event.target.value }))}
              multiline
              minRows={3}
              fullWidth
            />

            <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
              <Button
                variant="contained"
                sx={{ bgcolor: "#E60023", px: 4, py: 1.2, borderRadius: 2, fontWeight: 700 }}
                onClick={handleSave}
                disabled={saving || loading}
              >
                {saving ? "Đang lưu..." : "Lưu cấu hình"}
              </Button>
            </Box>
          </Stack>
        </Paper>
      </Box>
    </AdminLayout>
  );
};

export default AdminChatbot;

import { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Button,
  Paper,
  TextField,
  InputAdornment,
  IconButton,
  Chip,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tooltip,
  Rating,
  Avatar,
  Table,
  export default AdminReviews;
                            </Typography>
                            {review.adminReply?.text && (
                              <Chip
                                label="Đã phản hồi"
                                size="small"
                                sx={{ height: 18, fontSize: "0.65rem", mt: 0.5, bgcolor: "rgba(59,130,246,0.1)", color: "#3b82f6" }}
                              />
                            )}
                          </TableCell>
                          <TableCell>
                            <Chip
                              icon={<Box sx={{ color: status.color, display: "flex", ml: 0.5 }}>{status.icon}</Box>}
                              label={status.label}
                              size="small"
                              sx={{ bgcolor: status.bg, color: status.color, fontWeight: 700, fontSize: "0.72rem", "& .MuiChip-icon": { ml: 0.8 } }}
                            />
                          </TableCell>
                          <TableCell>
                            <Typography variant="caption" sx={{ color: "#888" }}>
                              {formatDate(review.createdAt)}
                            </Typography>
                          </TableCell>
                          <TableCell align="center">
                            <Tooltip title="Xem & xử lý">
                              <IconButton
                                size="small"
                                onClick={() => {
                                  setSelectedReview(review);
                                  setDetailOpen(true);
                                }}
                                sx={{ color: "#3b82f6", "&:hover": { bgcolor: "rgba(59,130,246,0.08)" } }}
                              >
                                <Eye size={16} />
                              </IconButton>
                            </Tooltip>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </TableContainer>
            <TablePagination
              component="div"
              count={filtered.length}
              page={page}
              onPageChange={(_, p) => setPage(p)}
              rowsPerPage={rowsPerPage}
              onRowsPerPageChange={(e) => {
                setRowsPerPage(Number(e.target.value));
                setPage(0);
              }}
              rowsPerPageOptions={[5, 10, 25]}
              labelRowsPerPage="Hiển thị:"
              labelDisplayedRows={({ from, to, count }) => `${from}–${to} / ${count}`}
              sx={{ borderTop: "1px solid #f0f0f0" }}
            />
          </>
        )}
      </Paper>

      <ReviewDetailDialog
        open={detailOpen}
        onClose={() => setDetailOpen(false)}
        review={selectedReview}
        onStatusChange={handleStatusChange}
        onReply={handleReply}
        onDelete={handleDelete}
      />
    </AdminLayout>
  );
};

export default AdminReviews;
  const status = STATUS_CONFIG[review.status] || STATUS_CONFIG.pending;

  const handleStatusChange = async (newStatus: string) => {
    try {
      setUpdating(true);
      await onStatusChange(review._id, newStatus);
      onClose();
    } finally {
      setUpdating(false);
    }
  };

  const handleReply = async () => {
    if (!replyText.trim()) {
      toast.error("Vui lòng nhập nội dung phản hồi");
      return;
    }
    try {
      setReplying(true);
      await onReply(review._id, replyText.trim());
      onClose();
    } finally {
      setReplying(false);
    }
  };

  const handleDelete = async () => {
    try {
      setDeleting(true);
      await onDelete(review._id);
      onClose();
    } finally {
      setDeleting(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 2 } }}>
      <DialogTitle sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1px solid #f0f0f0", pb: 2 }}>
        <Typography variant="h6" sx={{ fontWeight: 800, color: "#1a1a1a" }}>Chi tiết đánh giá</Typography>
        <IconButton size="small" onClick={onClose}><X size={20} /></IconButton>
      </DialogTitle>

      <DialogContent sx={{ p: 3 }}>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
          {review.productId && (
            <Box sx={{ display: "flex", gap: 2, p: 2, bgcolor: "#fafafa", borderRadius: 1.5, border: "1px solid #f0f0f0" }}>
              <Avatar
                src={getImageUrl(review.productId.image?.[0])}
                variant="rounded"
                sx={{ width: 52, height: 52, bgcolor: "#f5f5f5" }}
              />
              <Box>
                <Typography variant="caption" sx={{ color: "#888" }}>Sản phẩm</Typography>
                <Typography variant="body2" sx={{ fontWeight: 700, color: "#1a1a1a" }}>
                  {review.productId.name}
                </Typography>
              </Box>
            </Box>
          )}

          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <Avatar sx={{ bgcolor: "#E60023", width: 36, height: 36, fontSize: "0.9rem" }}>
              {review.userId?.name?.charAt(0).toUpperCase() || "U"}
            </Avatar>
            <Box>
              <Typography variant="body2" sx={{ fontWeight: 700, color: "#1a1a1a" }}>
                {review.userId?.name || "Ẩn danh"}
              </Typography>
              <Typography variant="caption" sx={{ color: "#888" }}>
                {review.userId?.email} · {formatDate(review.createdAt)}
              </Typography>
            </Box>
            <Box sx={{ ml: "auto" }}>
              <Chip label={status.label} size="small" sx={{ bgcolor: status.bg, color: status.color, fontWeight: 700 }} />
            </Box>
          </Box>

          <Box sx={{ p: 2, bgcolor: "#fafafa", borderRadius: 1.5, border: "1px solid #f0f0f0" }}>
            <Rating value={review.rating} readOnly size="small" sx={{ color: "#f59e0b", mb: 1 }} />
            <Typography variant="body2" sx={{ color: "#333", lineHeight: 1.7 }}>
              {review.comment}
            </Typography>
            {review.images && review.images.length > 0 && (
              <Box sx={{ display: "flex", gap: 1, mt: 1.5, flexWrap: "wrap" }}>
                {review.images.map((img, idx) => (
                  <Box
                    key={idx}
                    component="img"
                    src={getImageUrl(img)}
                    sx={{ width: 60, height: 60, objectFit: "cover", borderRadius: 1, border: "1px solid #eee" }}
                  />
                ))}
              </Box>
            )}
          </Box>

          {review.adminReply?.text && (
            <Box sx={{ p: 2, bgcolor: "rgba(59,130,246,0.06)", borderRadius: 1.5, border: "1px solid rgba(59,130,246,0.2)" }}>
              <Typography variant="caption" sx={{ fontWeight: 700, color: "#3b82f6", display: "block", mb: 0.5 }}>
                Phản hồi của Admin ({formatDate(review.adminReply.replyAt)})
              </Typography>
              <Typography variant="body2" sx={{ color: "#333" }}>
                {review.adminReply.text}
              </Typography>
            </Box>
          )}

          {review.status === "pending" && (
            <Box>
              <Typography variant="caption" sx={{ fontWeight: 700, color: "#888", mb: 1, display: "block" }}>
                DUYỆT ĐÁNH GIÁ
              </Typography>
              <Box sx={{ display: "flex", gap: 1 }}>
                <Button
                  variant="contained"
                  size="small"
                  onClick={() => handleStatusChange("approved")}
                  disabled={updating}
                  startIcon={<CheckCircle2 size={15} />}
                  sx={{ bgcolor: "#22c55e", "&:hover": { bgcolor: "#16a34a" }, fontWeight: 700, borderRadius: 1.5 }}
                >
                  Duyệt
                </Button>
                <Button
                  variant="contained"
                  size="small"
                  onClick={() => handleStatusChange("rejected")}
                  disabled={updating}
                  startIcon={<XCircle size={15} />}
                  sx={{ bgcolor: "#ef4444", "&:hover": { bgcolor: "#dc2626" }, fontWeight: 700, borderRadius: 1.5 }}
                >
                  Từ chối
                </Button>
              </Box>
            </Box>
          )}

          <Box>
            <Typography variant="caption" sx={{ fontWeight: 700, color: "#888", mb: 1, display: "block" }}>
              {review.adminReply?.text ? "CHỈNH SỬA PHẢN HỒI" : "PHẢN HỒI ĐÁNH GIÁ"}
            </Typography>
            <TextField
              fullWidth
              multiline
              rows={3}
              placeholder="Nhập phản hồi của bạn..."
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: 1.5,
                  bgcolor: "#fafafa",
                  fontSize: "0.875rem",
                  "& fieldset": { borderColor: "#e0e0e0" },
                  "&.Mui-focused fieldset": { borderColor: "#E60023" },
                },
              }}
            />
            <Button
              variant="outlined"
              size="small"
              onClick={handleReply}
              disabled={replying || !replyText.trim()}
              startIcon={replying ? undefined : <MessageSquare size={15} />}
              sx={{ mt: 1, borderColor: "#3b82f6", color: "#3b82f6", fontWeight: 700, borderRadius: 1.5, "&:hover": { bgcolor: "#3b82f6", color: "white" } }}
            >
              {replying ? <CircularProgress size={16} /> : review.adminReply?.text ? "Cập nhật phản hồi" : "Gửi phản hồi"}
            </Button>
          </Box>
        </Box>
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2, borderTop: "1px solid #f0f0f0", justifyContent: "space-between" }}>
        <Button
          variant="outlined"
          size="small"
          onClick={handleDelete}
          disabled={deleting}
          startIcon={<Trash2 size={15} />}
          sx={{ borderColor: "#ef4444", color: "#ef4444", fontWeight: 700, borderRadius: 1.5, "&:hover": { bgcolor: "#ef4444", color: "white" } }}
        >
          {deleting ? <CircularProgress size={16} /> : "Xóa đánh giá"}
        </Button>
        <Button onClick={onClose} sx={{ color: "#888", fontWeight: 600 }}>Đóng</Button>
      </DialogActions>
    </Dialog>
  );
};

// =============================================
// Main Admin Reviews Page
// =============================================
const AdminReviews = () => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [detailOpen, setDetailOpen] = useState(false);
  const [selectedReview, setSelectedReview] = useState<Review | null>(null);

  useEffect(() => {
    loadReviews();
  }, [filterStatus]);

  const loadReviews = async () => {
    try {
      setLoading(true);
      const params = filterStatus !== "all" ? `?status=${filterStatus}` : "";
      const res = await axiosPickleball.get(`/api/reviews${params}`) as any;
      setReviews(res?.data || []);
    } catch {
      toast.error("Không thể tải đánh giá");
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (id: string, status: string) => {
    await axiosPickleball.put(`/api/reviews/${id}/status`, { status });
    toast.success("Cập nhật trạng thái thành công!");
    loadReviews();
  };

  const handleReply = async (id: string, reply: string) => {
    await axiosPickleball.put(`/api/reviews/${id}/reply`, { reply });
    toast.success("Phản hồi thành công!");
    loadReviews();
  };

  const handleDelete = async (id: string) => {
    await axiosPickleball.delete(`/api/reviews/${id}`);
    toast.success("Xóa đánh giá thành công!");
    loadReviews();
  };

  const filtered = reviews.filter((r) =>
    r.comment?.toLowerCase().includes(search.toLowerCase()) ||
    r.userId?.name?.toLowerCase().includes(search.toLowerCase()) ||
    r.productId?.name?.toLowerCase().includes(search.toLowerCase())
  );

  const paginated = filtered.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  const countByStatus = (s: string) => (s === "all" ? reviews.length : reviews.filter((r) => r.status === s).length);

  const thSx = {
    fontWeight: 800,
    fontSize: "0.78rem",
    color: "#1a1a1a",
    bgcolor: "#fafafa",
    borderBottom: "2px solid #f0f0f0",
    whiteSpace: "nowrap",
  };

  return (
    <AdminLayout title="Quản lý đánh giá">
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 3 }}>
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 900, color: "#1a1a1a" }}>
            Đánh giá ({reviews.length})
          </Typography>
          <Typography variant="caption" sx={{ color: "#888" }}>
            Duyệt và phản hồi đánh giá của khách hàng
          </Typography>
        </Box>
      </Box>

      <Box sx={{ display: "flex", gap: 1.5, mb: 3, flexWrap: "wrap" }}>
        {[
          { key: "all", label: "Tất cả" },
          { key: "pending", label: "Chờ duyệt" },
          { key: "approved", label: "Đã duyệt" },
          { key: "rejected", label: "Từ chối" },
        ].map((tab) => {
          const cfg = STATUS_CONFIG[tab.key];
          return (
            <Box
              key={tab.key}
              onClick={() => {
                setFilterStatus(tab.key);
                setPage(0);
              }}
              sx={{
                px: 2,
                py: 1,
                borderRadius: 1.5,
                cursor: "pointer",
                border: "1.5px solid",
                borderColor: filterStatus === tab.key ? (cfg?.color || "#E60023") : "#e0e0e0",
                bgcolor: filterStatus === tab.key ? (cfg?.bg || "rgba(230,0,35,0.08)") : "#fff",
                transition: "all 0.15s",
              }}
            >
              <Typography
                variant="caption"
                sx={{ fontWeight: 700, color: filterStatus === tab.key ? (cfg?.color || "#E60023") : "#555" }}
              >
                {tab.label} ({countByStatus(tab.key)})
              </Typography>
            </Box>
          );
        })}
      </Box>

      <Paper elevation={0} sx={{ border: "1px solid #eee", borderRadius: 2, p: 2, mb: 2, bgcolor: "#fff" }}>
        <TextField
          size="small"
          placeholder="Tìm theo sản phẩm, người dùng, nội dung..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(0);
          }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search size={16} color="#aaa" />
              </InputAdornment>
            ),
          }}
          sx={{
            width: 360,
            "& .MuiOutlinedInput-root": {
              borderRadius: 1.5,
              bgcolor: "#fafafa",
              "& fieldset": { borderColor: "#e0e0e0" },
              "&.Mui-focused fieldset": { borderColor: "#E60023" },
            },
          }}
        />
      </Paper>

      <Paper elevation={0} sx={{ border: "1px solid #eee", borderRadius: 2, overflow: "hidden", bgcolor: "#fff" }}>
        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
            <CircularProgress sx={{ color: "#E60023" }} />
          </Box>
        ) : (
          <>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell sx={thSx}>Sản phẩm</TableCell>
                    <TableCell sx={thSx}>Người đánh giá</TableCell>
                    <TableCell sx={thSx}>Đánh giá</TableCell>
                    <TableCell sx={thSx}>Nội dung</TableCell>
                    <TableCell sx={thSx}>Trạng thái</TableCell>
                    <TableCell sx={thSx}>Ngày tạo</TableCell>
                    <TableCell sx={thSx} align="center">Chi tiết</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {paginated.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} align="center" sx={{ py: 6 }}>
                        <Star size={40} color="#e0e0e0" />
                        <Typography variant="body2" sx={{ color: "#bbb", mt: 1 }}>
                          {search ? "Không tìm thấy đánh giá" : "Chưa có đánh giá nào"}
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ) : (
                    paginated.map((review) => {
                      const status = STATUS_CONFIG[review.status] || STATUS_CONFIG.pending;
                      return (
                        <TableRow key={review._id} sx={{ "&:hover": { bgcolor: "#fafafa" } }}>
                          <TableCell>
                            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                              <Avatar
                                src={getImageUrl(review.productId?.image?.[0])}
                                variant="rounded"
                                sx={{ width: 40, height: 40, bgcolor: "#f5f5f5", flexShrink: 0 }}
                              />
                              <Typography
                                variant="body2"
                                sx={{
                                  fontWeight: 600,
                                  color: "#1a1a1a",
                                  fontSize: "0.8rem",
                                  maxWidth: 160,
                                  overflow: "hidden",
                                  textOverflow: "ellipsis",
                                  whiteSpace: "nowrap",
                                }}
                              >
                                {review.productId?.name || "—"}
                              </Typography>
                            </Box>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2" sx={{ fontWeight: 600, color: "#1a1a1a", fontSize: "0.82rem" }}>
                              {review.userId?.name || "Ẩn danh"}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Rating value={review.rating} readOnly size="small" sx={{ color: "#f59e0b" }} />
                          </TableCell>
                          <TableCell sx={{ maxWidth: 200 }}>
                            <Typography
                              variant="body2"
                              sx={{
                                color: "#555",
                                fontSize: "0.82rem",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                display: "-webkit-box",
                                WebkitLineClamp: 2,
                                WebkitBoxOrient: "vertical",
                              }}
                            >
                              {review.comment}
                            </Typography>
                            {review.adminReply?.text && (
                              <Chip
                                label="Đã phản hồi"
                                size="small"
                                sx={{ height: 18, fontSize: "0.65rem", mt: 0.5, bgcolor: "rgba(59,130,246,0.1)", color: "#3b82f6" }}
                              />
                            )}
                          </TableCell>
                          <TableCell>
                            <Chip
                              icon={<Box sx={{ color: status.color, display: "flex", ml: 0.5 }}>{status.icon}</Box>}
                              label={status.label}
                              size="small"
                              sx={{ bgcolor: status.bg, color: status.color, fontWeight: 700, fontSize: "0.72rem", "& .MuiChip-icon": { ml: 0.8 } }}
                            />
                          </TableCell>
                          <TableCell>
                            <Typography variant="caption" sx={{ color: "#888" }}>
                              {formatDate(review.createdAt)}
                            </Typography>
                          </TableCell>
                          <TableCell align="center">
                            <Tooltip title="Xem & xử lý">
                              <IconButton
                                size="small"
                                onClick={() => {
                                  setSelectedReview(review);
                                  setDetailOpen(true);
                                }}
                                sx={{ color: "#3b82f6", "&:hover": { bgcolor: "rgba(59,130,246,0.08)" } }}
                              >
                                <Eye size={16} />
                              </IconButton>
                            </Tooltip>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </TableContainer>
            <TablePagination
              component="div"
              count={filtered.length}
              page={page}
              onPageChange={(_, p) => setPage(p)}
              rowsPerPage={rowsPerPage}
              onRowsPerPageChange={(e) => {
                setRowsPerPage(Number(e.target.value));
                setPage(0);
              }}
              rowsPerPageOptions={[5, 10, 25]}
              labelRowsPerPage="Hiển thị:"
              labelDisplayedRows={({ from, to, count }) => `${from}–${to} / ${count}`}
              sx={{ borderTop: "1px solid #f0f0f0" }}
            />
          </>
        )}
      </Paper>

      <ReviewDetailDialog
        open={detailOpen}
        onClose={() => setDetailOpen(false)}
        review={selectedReview}
        onStatusChange={handleStatusChange}
        onReply={handleReply}
        onDelete={handleDelete}
      />
    </AdminLayout>
  );
};

export default AdminReviews;

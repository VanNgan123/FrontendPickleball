import { Box, Paper, Skeleton, Divider } from "@mui/material";
import Grid from "@mui/material/Grid";

// ── Product Detail Skeleton ──
export const ProductDetailSkeleton = () => (
  <Box sx={{ py: 3, px: { xs: 2, md: 4 } }}>
    <Skeleton width={300} height={20} sx={{ mb: 3 }} />
    <Paper elevation={0} sx={{ p: 3, border: "1px solid #eee", mb: 4 }}>
      <Grid container spacing={4}>
        <Grid size={{ xs: 12, md: 6 }}>
          <Skeleton variant="rectangular" sx={{ width: "100%", paddingTop: "100%", borderRadius: 2 }} />
          <Box sx={{ display: "flex", gap: 1, mt: 2 }}>
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} variant="rectangular" width={72} height={72} sx={{ borderRadius: 1 }} />
            ))}
          </Box>
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <Skeleton width="30%" height={18} sx={{ mb: 1 }} />
          <Skeleton width="80%" height={36} sx={{ mb: 2 }} />
          <Skeleton width="50%" height={20} sx={{ mb: 3 }} />
          <Skeleton variant="rectangular" width="100%" height={80} sx={{ borderRadius: 2, mb: 3 }} />
          <Skeleton width="40%" height={20} sx={{ mb: 1 }} />
          <Box sx={{ display: "flex", gap: 1, mb: 3 }}>
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} variant="rectangular" width={60} height={32} sx={{ borderRadius: 1 }} />
            ))}
          </Box>
          <Box sx={{ display: "flex", gap: 2 }}>
            <Skeleton variant="rectangular" width="50%" height={48} sx={{ borderRadius: 2 }} />
            <Skeleton variant="rectangular" width="50%" height={48} sx={{ borderRadius: 2 }} />
          </Box>
        </Grid>
      </Grid>
    </Paper>
  </Box>
);

// ── Order Card Skeleton ──
export const OrderCardSkeleton = () => (
  <Paper elevation={0} sx={{ border: "1px solid #eee", borderRadius: 2, overflow: "hidden", mb: 2 }}>
    <Box sx={{ px: 3, py: 1.5, bgcolor: "#fafafa", display: "flex", justifyContent: "space-between" }}>
      <Skeleton width={180} height={18} />
      <Skeleton width={100} height={24} sx={{ borderRadius: 10 }} />
    </Box>
    <Box sx={{ px: 3, py: 2 }}>
      {[1, 2].map((i) => (
        <Box key={i} sx={{ display: "flex", gap: 2, mb: 1.5 }}>
          <Skeleton variant="rectangular" width={56} height={56} sx={{ borderRadius: 1.5, flexShrink: 0 }} />
          <Box sx={{ flexGrow: 1 }}>
            <Skeleton width="70%" height={16} sx={{ mb: 0.5 }} />
            <Skeleton width="30%" height={14} />
          </Box>
          <Skeleton width={80} height={16} />
        </Box>
      ))}
    </Box>
    <Divider />
    <Box sx={{ px: 3, py: 1.5, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
      <Skeleton width={120} height={16} />
      <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
        <Skeleton width={80} height={20} />
        <Skeleton variant="rectangular" width={80} height={32} sx={{ borderRadius: 1.5 }} />
      </Box>
    </Box>
  </Paper>
);

// ── Profile Skeleton ──
export const ProfileSkeleton = () => (
  <Grid container spacing={3}>
    <Grid size={{ xs: 12, md: 4 }}>
      <Paper elevation={0} sx={{ border: "1px solid #eee", borderRadius: 2, overflow: "hidden" }}>
        <Skeleton variant="rectangular" height={80} />
        <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", p: 3 }}>
          <Skeleton variant="circular" width={90} height={90} sx={{ mt: -5, mb: 1.5 }} />
          <Skeleton width={120} height={24} sx={{ mb: 1 }} />
          <Skeleton width={80} height={24} sx={{ borderRadius: 10, mb: 2 }} />
          <Divider sx={{ width: "100%", mb: 2 }} />
          {[1, 2, 3].map((i) => (
            <Box key={i} sx={{ display: "flex", gap: 1.5, width: "100%", mb: 1.5 }}>
              <Skeleton variant="circular" width={20} height={20} />
              <Skeleton width="70%" height={16} />
            </Box>
          ))}
        </Box>
      </Paper>
    </Grid>
    <Grid size={{ xs: 12, md: 8 }}>
      <Paper elevation={0} sx={{ border: "1px solid #eee", borderRadius: 2, p: 3 }}>
        <Box sx={{ display: "flex", justifyContent: "space-between", mb: 3 }}>
          <Skeleton width={180} height={24} />
          <Skeleton width={80} height={32} sx={{ borderRadius: 1.5 }} />
        </Box>
        <Grid container spacing={2}>
          {[1, 2, 3, 4].map((i) => (
            <Grid size={{ xs: 12, sm: 6 }} key={i}>
              <Skeleton width="40%" height={14} sx={{ mb: 0.5 }} />
              <Skeleton variant="rectangular" width="100%" height={48} sx={{ borderRadius: 1.5 }} />
            </Grid>
          ))}
        </Grid>
      </Paper>
    </Grid>
  </Grid>
);

// ── Cart Skeleton ──
export const CartSkeleton = () => (
  <Grid container spacing={3}>
    <Grid size={{ xs: 12, lg: 8 }}>
      <Paper elevation={0} sx={{ border: "1px solid #eee", borderRadius: 2, overflow: "hidden" }}>
        <Box sx={{ px: 3, py: 2, bgcolor: "#fafafa", borderBottom: "1px solid #f0f0f0" }}>
          <Skeleton width={160} height={20} />
        </Box>
        {[1, 2, 3].map((i) => (
          <Box key={i} sx={{ display: "flex", gap: 2, px: 3, py: 2.5, borderBottom: "1px solid #f0f0f0" }}>
            <Skeleton variant="rectangular" width={90} height={90} sx={{ borderRadius: 2, flexShrink: 0 }} />
            <Box sx={{ flexGrow: 1 }}>
              <Skeleton width="70%" height={18} sx={{ mb: 1 }} />
              <Skeleton width="30%" height={16} sx={{ mb: 1.5 }} />
              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <Skeleton variant="rectangular" width={110} height={36} sx={{ borderRadius: 2 }} />
                <Skeleton width={80} height={20} />
              </Box>
            </Box>
          </Box>
        ))}
      </Paper>
    </Grid>
    <Grid size={{ xs: 12, lg: 4 }}>
      <Skeleton variant="rectangular" height={140} sx={{ borderRadius: 2, mb: 2 }} />
      <Skeleton variant="rectangular" height={260} sx={{ borderRadius: 2 }} />
    </Grid>
  </Grid>
);

// ── Dashboard Stats Skeleton ──
export const DashboardSkeleton = () => (
  <Box>
    <Grid container spacing={2.5} sx={{ mb: 3 }}>
      {[1, 2, 3, 4].map((i) => (
        <Grid size={{ xs: 12, sm: 6, lg: 3 }} key={i}>
          <Paper elevation={0} sx={{ p: 3, border: "1px solid #eee", borderRadius: 2 }}>
            <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
              <Skeleton variant="rectangular" width={48} height={48} sx={{ borderRadius: 2 }} />
              <Skeleton width={50} height={16} />
            </Box>
            <Skeleton width="60%" height={40} sx={{ mb: 0.5 }} />
            <Skeleton width="80%" height={16} />
          </Paper>
        </Grid>
      ))}
    </Grid>
    <Grid container spacing={2.5}>
      <Grid size={{ xs: 12, lg: 8 }}>
        <Paper elevation={0} sx={{ p: 3, border: "1px solid #eee", borderRadius: 2 }}>
          <Skeleton width={180} height={22} sx={{ mb: 0.5 }} />
          <Skeleton width={120} height={16} sx={{ mb: 2.5 }} />
          <Skeleton variant="rectangular" width="100%" height={240} sx={{ borderRadius: 1 }} />
        </Paper>
      </Grid>
      <Grid size={{ xs: 12, lg: 4 }}>
        <Paper elevation={0} sx={{ p: 3, border: "1px solid #eee", borderRadius: 2, height: "100%" }}>
          <Skeleton width={160} height={22} sx={{ mb: 2 }} />
          <Skeleton variant="circular" width={160} height={160} sx={{ mx: "auto", mb: 2 }} />
          {[1, 2, 3].map((i) => (
            <Box key={i} sx={{ display: "flex", gap: 1, mb: 1 }}>
              <Skeleton variant="circular" width={10} height={10} sx={{ mt: 0.5 }} />
              <Skeleton width="70%" height={16} />
            </Box>
          ))}
        </Paper>
      </Grid>
    </Grid>
  </Box>
);

import { useState } from "react";
import { Box, Button, MenuItem, Paper, Stack, TextField, Typography } from "@mui/material";

export interface CheckoutFormValue {
  quantity: number;
  fullName: string;
  phone: string;
  address: string;
  ward: string;
  district: string;
  city: string;
  paymentMethod: "COD" | "ZaloPay";
  couponCode: string;
}

interface CheckoutFormProps {
  initialQuantity: number;
  defaultName?: string;
  disabled?: boolean;
  onSubmit: (value: CheckoutFormValue) => Promise<void>;
}

const CheckoutForm = ({
  initialQuantity,
  defaultName = "",
  disabled = false,
  onSubmit,
}: CheckoutFormProps) => {
  const [value, setValue] = useState<CheckoutFormValue>({
    quantity: Math.max(initialQuantity || 1, 1),
    fullName: defaultName,
    phone: "",
    address: "",
    ward: "",
    district: "",
    city: "Đà Nẵng",
    paymentMethod: "COD",
    couponCode: "",
  });
  const [formError, setFormError] = useState("");

  const update = <K extends keyof CheckoutFormValue>(
    key: K,
    nextValue: CheckoutFormValue[K]
  ) => setValue((current) => ({ ...current, [key]: nextValue }));

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    const phone = value.phone.replace(/\s+/g, "");
    if (
      !value.fullName.trim() ||
      !/^\d{10,11}$/.test(phone) ||
      !value.address.trim() ||
      !value.ward.trim() ||
      !value.district.trim() ||
      !value.city.trim()
    ) {
      setFormError("Vui lòng nhập đủ thông tin; số điện thoại phải có 10–11 chữ số.");
      return;
    }
    setFormError("");
    await onSubmit({ ...value, phone });
  };

  return (
    <Paper
      component="form"
      variant="outlined"
      onSubmit={submit}
      sx={{ mt: 1, p: 1.5, width: "100%", borderRadius: 2 }}
    >
      <Typography variant="subtitle2" fontWeight={800}>
        Thông tin giao hàng
      </Typography>
      <Typography variant="caption" color="text.secondary">
        Điền một lần, hệ thống sẽ tính phí và cho bạn kiểm tra trước khi tạo đơn.
      </Typography>

      <Box
        sx={{
          mt: 1.25,
          display: "grid",
          gridTemplateColumns: { xs: "1fr", sm: "repeat(2, minmax(0, 1fr))" },
          gap: 1,
        }}
      >
        <TextField
          label="Số lượng"
          type="number"
          size="small"
          inputProps={{ min: 1, max: 99 }}
          value={value.quantity}
          onChange={(event) => update("quantity", Math.max(Number(event.target.value) || 1, 1))}
          disabled={disabled}
        />
        <TextField
          label="Họ và tên"
          size="small"
          value={value.fullName}
          onChange={(event) => update("fullName", event.target.value)}
          disabled={disabled}
        />
        <TextField
          label="Số điện thoại"
          size="small"
          value={value.phone}
          onChange={(event) => update("phone", event.target.value)}
          disabled={disabled}
        />
        <TextField
          select
          label="Thanh toán"
          size="small"
          value={value.paymentMethod}
          onChange={(event) =>
            update("paymentMethod", event.target.value as "COD" | "ZaloPay")
          }
          disabled={disabled}
        >
          <MenuItem value="COD">COD</MenuItem>
          <MenuItem value="ZaloPay">ZaloPay</MenuItem>
        </TextField>
        <TextField
          label="Số nhà, tên đường"
          size="small"
          value={value.address}
          onChange={(event) => update("address", event.target.value)}
          disabled={disabled}
          sx={{ gridColumn: { sm: "1 / -1" } }}
        />
        <TextField
          label="Phường/xã"
          size="small"
          value={value.ward}
          onChange={(event) => update("ward", event.target.value)}
          disabled={disabled}
        />
        <TextField
          label="Quận/huyện"
          size="small"
          value={value.district}
          onChange={(event) => update("district", event.target.value)}
          disabled={disabled}
        />
        <TextField
          label="Tỉnh/thành phố"
          size="small"
          value={value.city}
          onChange={(event) => update("city", event.target.value)}
          disabled={disabled}
        />
        <TextField
          label="Mã giảm giá (nếu có)"
          size="small"
          value={value.couponCode}
          onChange={(event) => update("couponCode", event.target.value)}
          disabled={disabled}
        />
      </Box>

      {formError && (
        <Typography variant="caption" color="error" sx={{ display: "block", mt: 1 }}>
          {formError}
        </Typography>
      )}

      <Stack direction="row" justifyContent="flex-end" sx={{ mt: 1.25 }}>
        <Button type="submit" size="small" variant="contained" disabled={disabled}>
          Xem trước đơn hàng
        </Button>
      </Stack>
    </Paper>
  );
};

export default CheckoutForm;

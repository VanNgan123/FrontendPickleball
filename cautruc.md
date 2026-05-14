# Cấu Trúc Dự Án Frontend Pickleball

## Sơ Đồ Cây Thư Mục

```
frontend_pickleball/
├── public/                          # Thư mục chứa tài nguyên tĩnh
├── src/                             # Thư mục mã nguồn chính
│   ├── api/
│   │   └── axiosPickleball.ts      # Cấu hình Axios cho API
│   ├── assets/                      # Tài nguyên (hình ảnh, font, v.v.)
│   │   └── banner/
│   ├── components/                  # Các component tái sử dụng
│   │   ├── Banner/
│   │   │   └── index.tsx
│   │   └── SlideBar/
│   │       └── index.tsx
│   ├── layout/                      # Các layout chính
│   │   ├── Footer/
│   │   │   └── Footer.tsx
│   │   ├── Header/
│   │   │   └── Header.tsx
│   │   └── MainLayout/
│   │       └── MainLayout.tsx
│   ├── pages/                       # Các trang ứng dụng
│   │   ├── index.ts
│   │   ├── About/
│   │   │   └── index.tsx
│   │   ├── Buy/
│   │   │   └── index.tsx
│   │   ├── ByCategoryProduct/
│   │   │   └── index.tsx
│   │   ├── Cart/
│   │   │   └── index.tsx
│   │   ├── Home/
│   │   │   └── index.tsx
│   │   ├── Login/
│   │   ├── Order/
│   │   ├── ProductDetail/
│   │   ├── Products/
│   │   └── SignUp/
│   ├── routers/                     # Cấu hình routing
│   │   └── Routers.tsx
│   ├── services/                    # Các dịch vụ (API calls, v.v.)
│   ├── store/                       # Redux store
│   │   ├── store.ts
│   │   └── slices/
│   │       └── categorySlices.tsx
│   ├── theme/                       # Cấu hình theme
│   │   └── muitheme.ts
│   ├── types/                       # TypeScript types/interfaces
│   ├── App.css                      # Styles cho App
│   ├── App.tsx                      # Component App chính
│   ├── index.css                    # Global styles
│   ├── main.tsx                     # Entry point
│   └── vite-env.d.ts                # Vite environment types
├── .eslintrc.js                     # Cấu hình ESLint
├── index.html                       # HTML template
├── package.json                     # Dependencies và scripts
├── README.md                         # Tài liệu chính
├── tsconfig.app.json                # TypeScript config cho ứng dụng
├── tsconfig.json                    # TypeScript config chính
├── tsconfig.node.json               # TypeScript config cho Node
├── vite.config.ts                   # Vite configuration
└── cautruc.md                        # File này - Cấu trúc dự án
```

## Mô Tả Từng Thư Mục

### `/src` - Thư mục mã nguồn
Chứa toàn bộ code React TypeScript của ứng dụng.

### `/src/api`
- **axiosPickleball.ts**: Cấu hình instance Axios để gọi API

### `/src/assets`
- **banner/**: Lưu trữ ảnh banner và các tài nguyên khác

### `/src/components`
Các component UI tái sử dụng được:
- **Banner**: Component banner trang chủ
- **SlideBar**: Component thanh điều hướng bên cạnh

### `/src/layout`
Các layout chính của ứng dụng:
- **Header**: Thanh header chung
- **Footer**: Thanh footer chung
- **MainLayout**: Layout chính bọc các page

### `/src/pages`
Các trang chính (route pages):
- **Home**: Trang chủ
- **About**: Trang giới thiệu
- **Products**: Danh sách sản phẩm
- **ByCategoryProduct**: Lọc sản phẩm theo danh mục
- **ProductDetail**: Chi tiết sản phẩm
- **Cart**: Giỏ hàng
- **Buy**: Thanh toán
- **Order**: Đơn hàng
- **Login**: Đăng nhập
- **SignUp**: Đăng ký

### `/src/routers`
- **Routers.tsx**: Cấu hình routing cho ứng dụng

### `/src/services`
Các hàm service để gọi API và xử lý logic business

### `/src/store`
Redux store configuration:
- **store.ts**: Cài đặt store chính
- **slices/categorySlices.tsx**: Redux slice cho danh mục

### `/src/theme`
- **muitheme.ts**: Cấu hình theme Material-UI

### `/src/types`
TypeScript interfaces và types definitions

## Công Nghệ Sử Dụng

- **React 18** với TypeScript
- **Vite** - Build tool
- **Redux Toolkit** - State management
- **Material-UI** - UI Library
- **Axios** - HTTP client
- **React Router** - Routing

## Quy Ước Về Cấu Trúc

1. **Components**: Mỗi component có thư mục riêng với file `index.tsx`
2. **Pages**: Cùng quy ước như components, đại diện cho các route
3. **State Management**: Sử dụng Redux slices
4. **Styling**: Kết hợp CSS files và Material-UI theming
5. **API**: Tập trung tại `/src/api` với instance Axios


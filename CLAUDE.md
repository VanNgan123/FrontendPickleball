# CLAUDE.md — Frontend (frontend_pickleball)

> Sub-instruction for `frontend_pickleball/`. See root `CLAUDE.md` for full project context.

## Quick Reference

**Framework**: React 19 + TypeScript ~5.9 + Vite 7
**UI**: MUI (Material UI) v7
**State**: Redux Toolkit v2
**Routing**: React Router DOM v7
**HTTP**: Axios via `src/api/axiosPickleball.ts` for commerce APIs; Agent via `src/services/agentService.ts`

## Important Files

| File | Purpose |
|------|---------|
| `src/api/axiosPickleball.ts` | Single Axios instance — DO NOT create another |
| `src/store/store.ts` | Redux store (products, categories, auth, cart) |
| `src/store/slices/authSlice.ts` | Auth state — handles login/logout/refresh |
| `src/store/slices/cartSlice.ts` | Cart state |
| `src/routers/Routers.tsx` | All routes, all lazy-loaded |
| `src/hocs/withAuthAdmin.tsx` | Route guard: requires admin or manager role |
| `src/hocs/withAuthHome.tsx` | Route guard: requires authenticated user |
| `src/types/index.ts` | Shared TypeScript types (Product, Category, Cart...) |
| `src/theme/muitheme.ts` | Custom MUI theme |
| `src/components/ChatWidget/ChatWidget.tsx` | Floating Pickleball AI Agent chat UI |
| `src/services/agentService.ts` | Calls FastAPI Agent and forwards JWT |

## Making API Calls

ALWAYS go through the service layer. NEVER call Axios directly from a component.

```ts
// CORRECT: use existing service
import productService from '../services/productService';
const data = await productService.getAll();

// WRONG: calling Axios directly from a component
const data = await axios.get('/api/products'); // Do not do this
```

## Using Redux

```ts
import { useSelector, useDispatch } from 'react-redux';
import type { RootState, AppDispatch } from '../store/store';

const dispatch = useDispatch<AppDispatch>();
const { user, isAuthenticated } = useSelector((state: RootState) => state.auth);
```

## Route Protection

```tsx
// In Routers.tsx — existing HOC pattern (do not bypass):
const AdminDashboardWithAuth = withAuthAdmin(AdminDashboard);

// For new admin routes:
const NewAdminPageWithAuth = withAuthAdmin(lazy(() => import('../pages/Admin/NewAdminPage')));
```

## Adding a New Page

1. Create folder in `src/pages/YourPage/`
2. Create `src/pages/YourPage/index.tsx`
3. Add lazy import in `src/routers/Routers.tsx`
4. Add `<Route>` in the Routes block in `Routers.tsx`
5. Add page export to `src/pages/index.ts` if applicable

## Adding a New API Service

Create `src/services/yourService.ts` following this pattern:

```ts
import axiosPickleball from '../api/axiosPickleball';

const yourService = {
  getAll: async () => {
    const response = await axiosPickleball.get('/api/your-endpoint');
    return response as unknown as YourResponseType;
  },
};

export default yourService;
```

## TypeScript Types

- Shared/common types: add to `src/types/index.ts`
- Service-specific types: define in the service file and export
- Avoid using `any`

## Component File Convention

```
src/components/YourComponent/
  index.tsx    <- main component export
```

## Environment Variables

Vite only exposes variables prefixed with `VITE_` (configured in `vite.config.ts`):

```
VITE_API_URL    <- Backend URL (optional; defaults to http://localhost:3001 in dev)
VITE_AGENT_API_URL <- AI Agent URL (optional; defaults to http://localhost:8001)
```

## AI Agent Integration

- `MainLayout` renders `ChatWidget` for the customer-facing application.
- `agentService.ts` calls `/agent/chat` and `/agent/clear` on the FastAPI Agent.
- The chat session ID is stored in `sessionStorage` for the browser session.
- The service forwards `localStorage["accessToken"]` as a Bearer token so order/cart tools can enforce ownership.
- Product prices, stock, carts and orders come from Agent tools/API; they must not be hardcoded in frontend RAG content.

## Build and Lint

```bash
npm run dev       # Start dev server
npm run build     # Production build (TypeScript check + Vite bundle)
npm run lint      # ESLint check — run this after changes
npm run preview   # Preview production build locally
```

## Auth State Structure (from authSlice.ts)

```ts
interface AuthState {
  user: AuthUser | null;     // { id, name, email, role, avatar? }
  accessToken: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
}
```

## Token Storage

- `localStorage["accessToken"]` — JWT access token
- `localStorage["user"]` — JSON string of user info
- Refresh token is in HttpOnly cookie (managed by browser, sent automatically)

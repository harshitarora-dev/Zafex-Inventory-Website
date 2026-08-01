/* ── Centralized API client ─────────────────────────────────────────── */

const BASE = '/api';

async function apiFetch<T = unknown>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, { credentials: 'include', ...init });
  if (!res.ok) {
    const body = await res.json().catch(() => ({})) as { error?: string };
    throw new Error(body.error ?? `HTTP ${res.status}`);
  }
  return res.json() as Promise<T>;
}

function json(body: unknown): RequestInit {
  return {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  };
}

function jsonPut(body: unknown): RequestInit {
  return {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  };
}

/* ── Types ──────────────────────────────────────────────────────────── */

export interface User {
  id: number;
  name: string;
  email: string;
  phone?: string | null;
  avatar?: string | null;
  role: 'user' | 'admin';
  createdAt: string;
}

export interface Product {
  id: string;
  name: string;
  cat: string;
  sub: string;
  price: number;
  badge: string | null;
  image: string;
  desc: string | null;
  tags: string[] | null;
  inStock: boolean;
  stockCount?: number | null;
  createdAt: string;
  updatedAt: string;
}

export interface CartItem {
  id: number;
  userId: number;
  productId: string;
  quantity: number;
  product: Product;
}

export interface CartResponse {
  items: CartItem[];
  subtotal: number;
  itemCount: number;
}

export interface WishlistItem {
  id: number;
  userId: number;
  productId: string;
  product: Product;
}

export interface WishlistResponse {
  items: WishlistItem[];
}

export interface OrderItem {
  id: number;
  orderId: number;
  productId: string;
  quantity: number;
  price: number;
  product: Product;
}

export interface OrderStatusHistory {
  id: number;
  orderId: number;
  status: string;
  note: string | null;
  createdAt: string;
}

export type OrderStatus =
  | 'pending'
  | 'confirmed'
  | 'packed'
  | 'shipped'
  | 'delivered'
  | 'cancelled';

export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded';

export interface Order {
  id: number;
  userId: number;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  paymentMethod: string | null;
  razorpayOrderId: string | null;
  razorpayPaymentId: string | null;
  subtotal: number;
  shippingCost: number;
  total: number;
  shippingAddress: string;
  shippingCity: string;
  shippingState: string;
  shippingPincode: string;
  shippingCountry: string;
  phone: string;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
  user?: User;
}

export interface OrderDetail extends Order {
  items: OrderItem[];
  statusHistory: OrderStatusHistory[];
}

export interface Review {
  id: number;
  userId: number;
  productId: string;
  rating: number;
  comment: string | null;
  createdAt: string;
  updatedAt: string;
  user: { name: string };
}

export interface ReviewsResponse {
  reviews: Review[];
  averageRating: number;
  totalReviews: number;
}

export interface ProductsResponse {
  products: Product[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface DashboardStats {
  totalUsers: number;
  totalOrders: number;
  revenue: number;
  pendingOrders: number;
  lowStockProducts: Product[];
  recentOrders: Order[];
}

export interface ContactMessage {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  subject: string | null;
  message: string;
  isRead: boolean;
  createdAt: string;
}

/* ── Auth ────────────────────────────────────────────────────────────── */

export function authRegister(body: {
  name: string;
  email: string;
  phone?: string;
  password: string;
}): Promise<{ user: User }> {
  return apiFetch('/auth/register', json(body));
}

export function authLogin(body: {
  email: string;
  password: string;
  rememberMe?: boolean;
}): Promise<{ user: User }> {
  return apiFetch('/auth/login', json(body));
}

export function authLogout(): Promise<{ ok: true }> {
  return apiFetch('/auth/logout', { method: 'POST' });
}

export function authMe(): Promise<{ user: User }> {
  return apiFetch('/auth/me');
}

export function authUpdateProfile(body: {
  name?: string;
  email?: string;
  phone?: string;
  avatar?: string;
}): Promise<{ user: User }> {
  return apiFetch('/auth/profile', jsonPut(body));
}

export function authUpdatePassword(body: {
  currentPassword: string;
  newPassword: string;
}): Promise<{ ok: true }> {
  return apiFetch('/auth/password', jsonPut(body));
}

/* ── Cart ────────────────────────────────────────────────────────────── */

export function getCart(): Promise<CartResponse> {
  return apiFetch('/cart');
}

export function addToCart(body: {
  productId: string;
  quantity: number;
}): Promise<{ item: CartItem }> {
  return apiFetch('/cart', json(body));
}

export function updateCartItem(
  id: number,
  body: { quantity: number },
): Promise<{ item: CartItem }> {
  return apiFetch(`/cart/${id}`, jsonPut(body));
}

export function removeCartItem(id: number): Promise<{ ok: true }> {
  return apiFetch(`/cart/${id}`, { method: 'DELETE' });
}

export function clearCart(): Promise<{ ok: true }> {
  return apiFetch('/cart', { method: 'DELETE' });
}

/* ── Wishlist ────────────────────────────────────────────────────────── */

export function getWishlist(): Promise<WishlistResponse> {
  return apiFetch('/wishlist');
}

export function addToWishlist(body: {
  productId: string;
}): Promise<{ item: WishlistItem }> {
  return apiFetch('/wishlist', json(body));
}

export function removeFromWishlist(id: number): Promise<{ ok: true }> {
  return apiFetch(`/wishlist/${id}`, { method: 'DELETE' });
}

/* ── Orders ─────────────────────────────────────────────────────────── */

export interface CheckoutBody {
  shippingAddress: string;
  shippingCity: string;
  shippingState: string;
  shippingPincode: string;
  shippingCountry: string;
  phone: string;
  notes?: string;
}

export function checkout(
  body: CheckoutBody,
): Promise<{ orderId: number; order: Order }> {
  return apiFetch('/orders/checkout', json(body));
}

export function getOrders(): Promise<{ orders: Order[] }> {
  return apiFetch('/orders');
}

export function getOrder(id: number): Promise<OrderDetail> {
  return apiFetch(`/orders/${id}`);
}

export function cancelOrder(id: number): Promise<{ ok: true }> {
  return apiFetch(`/orders/${id}/cancel`, { method: 'POST' });
}

/* ── Payment ─────────────────────────────────────────────────────────── */

export function createPaymentOrder(body: {
  orderId: number;
}): Promise<{
  razorpayOrderId: string;
  amount: number;
  currency: string;
  key: string;
}> {
  return apiFetch('/payment/create-order', json(body));
}

export function verifyPayment(body: {
  razorpayOrderId: string;
  razorpayPaymentId: string;
  razorpaySignature: string;
  orderId: number;
}): Promise<{ success: boolean }> {
  return apiFetch('/payment/verify', json(body));
}

/* ── Products ────────────────────────────────────────────────────────── */

export interface ProductsQuery {
  cat?: string;
  sub?: string;
  q?: string;
  page?: number;
  limit?: number;
  sort?: string;
}

export function getProducts(query: ProductsQuery = {}): Promise<ProductsResponse> {
  const params = new URLSearchParams();
  if (query.cat) params.set('cat', query.cat);
  if (query.sub) params.set('sub', query.sub);
  if (query.q) params.set('q', query.q);
  if (query.page) params.set('page', String(query.page));
  if (query.limit) params.set('limit', String(query.limit));
  if (query.sort) params.set('sort', query.sort);
  const qs = params.toString();
  return apiFetch(`/products${qs ? `?${qs}` : ''}`);
}

export function searchProducts(q: string, limit = 5): Promise<{ products: Product[] }> {
  return apiFetch(`/products/search?q=${encodeURIComponent(q)}&limit=${limit}`);
}

export function getProduct(id: string): Promise<Product> {
  return apiFetch(`/products/${id}`);
}

/* ── Reviews ─────────────────────────────────────────────────────────── */

export function getReviews(productId: string): Promise<ReviewsResponse> {
  return apiFetch(`/products/${productId}/reviews`);
}

export function createReview(
  productId: string,
  body: { rating: number; comment?: string },
): Promise<{ review: Review }> {
  return apiFetch(`/products/${productId}/reviews`, json(body));
}

export function updateReview(
  id: number,
  body: { rating?: number; comment?: string },
): Promise<{ review: Review }> {
  return apiFetch(`/reviews/${id}`, jsonPut(body));
}

export function deleteReview(id: number): Promise<{ ok: true }> {
  return apiFetch(`/reviews/${id}`, { method: 'DELETE' });
}

/* ── Contact ─────────────────────────────────────────────────────────── */

export function submitContact(body: {
  name: string;
  email: string;
  phone?: string;
  subject?: string;
  message: string;
}): Promise<{ ok: true }> {
  return apiFetch('/contact', json(body));
}

/* ── Admin ───────────────────────────────────────────────────────────── */

export function getAdminDashboard(): Promise<DashboardStats> {
  return apiFetch('/admin/dashboard');
}

export function getAdminOrders(params?: {
  page?: number;
  limit?: number;
}): Promise<{ orders: Order[]; total: number }> {
  const qs = params
    ? new URLSearchParams(
        Object.entries(params)
          .filter(([, v]) => v !== undefined)
          .map(([k, v]) => [k, String(v)]),
      ).toString()
    : '';
  return apiFetch(`/admin/orders${qs ? `?${qs}` : ''}`);
}

export function getAdminOrder(id: number): Promise<OrderDetail> {
  return apiFetch(`/admin/orders/${id}`);
}

export function updateAdminOrderStatus(
  id: number,
  body: { status: OrderStatus; note?: string },
): Promise<{ ok: true }> {
  return apiFetch(`/admin/orders/${id}/status`, jsonPut(body));
}

export function getAdminCustomers(): Promise<{ users: User[] }> {
  return apiFetch('/admin/customers');
}

export function getAdminContacts(): Promise<{ contacts: ContactMessage[] }> {
  return apiFetch('/admin/contacts');
}

export interface AdminProduct {
  id: string;
  sku?: string | null;
  name: string;
  brand?: string | null;
  cat: string;
  sub: string;
  collection?: string | null;
  price: number;
  mrp?: number | null;
  discount?: number | null;
  priceRange?: [number, number] | null;
  badge: string | null;
  image: string;
  gallery?: string[] | null;
  video?: string | null;
  customerPhotos?: string[] | null;
  lifestyleImages?: string[] | null;
  sizeChartImage?: string | null;
  material?: string | null;
  ringSize?: string | null;
  ringType?: string | null;
  gauge?: string | null;
  finish?: string | null;
  weight?: string | null;
  manufacturingTime?: string | null;
  country?: string | null;
  hsCode?: string | null;
  availability?: string | null;
  estimatedDelivery?: string | null;
  colors?: string[] | null;
  sizes?: string[] | null;
  highlights?: string[] | null;
  materials?: string[] | null;
  desc: string | null;
  tags: string[] | null;
  inStock: boolean;
  stockCount?: number | null;
  ebayUrl?: string | null;
  createdAt: string;
  updatedAt: string;
}

const BASE = '/api';

function formatFriendlyError(errMessage: string): string {
  if (!errMessage) return 'An unexpected error occurred. Please try again.';
  if (errMessage.toLowerCase().includes('invalid password') || errMessage.toLowerCase().includes('incorrect password')) {
    return 'Incorrect admin password. Default is admin123 (or admin).';
  }
  if (errMessage.includes('Unexpected end of form') || errMessage.includes('multipart')) {
    return 'Image processing notice: Please try selecting the image again.';
  }
  if (errMessage.includes('Failed to fetch') || errMessage.includes('NetworkError') || errMessage.includes('Load failed')) {
    return 'Unable to connect to the server. Please check your internet connection.';
  }
  if (errMessage.includes('503') || errMessage.includes('502') || errMessage.includes('500') || errMessage.includes('<!DOCTYPE') || errMessage.includes('JSON')) {
    return 'The backend service is starting up. Please wait 5-10 seconds and click Sign In again.';
  }
  if (errMessage.includes('401') || errMessage.includes('Unauthorized')) {
    return 'Incorrect admin password. Default is admin123 (or admin).';
  }
  return errMessage;
}

async function apiFetch(path: string, init?: RequestInit) {
  try {
    const res = await fetch(`${BASE}${path}`, {
      credentials: 'include',
      ...init,
    });
    
    const text = await res.text();
    let body: any = {};
    let isJson = false;
    try {
      body = JSON.parse(text);
      isJson = true;
    } catch {
      isJson = false;
    }

    if (!res.ok) {
      if (isJson && body?.error) {
        throw new Error(formatFriendlyError(body.error));
      }
      throw new Error(formatFriendlyError(`Request failed with status ${res.status}`));
    }

    if (!isJson) {
      if (text.startsWith('<!DOCTYPE') || text.includes('<html')) {
        throw new Error('Backend service is starting up. Please wait 5 seconds and try again.');
      }
      return { ok: true };
    }

    return body;
  } catch (err: unknown) {
    if (err instanceof Error) {
      throw new Error(formatFriendlyError(err.message));
    }
    throw new Error('An unexpected error occurred. Please try again.');
  }
}

/* ── Auth ─────────────────────────────────────────────────────────────── */
export async function adminLogin(password: string) {
  return apiFetch('/admin/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ password }),
  });
}

export async function adminLogout() {
  return apiFetch('/admin/logout', { method: 'POST' });
}

export async function checkAdminAuth(): Promise<{ authenticated: boolean }> {
  return apiFetch('/admin/me');
}

/* ── Products ──────────────────────────────────────────────────────────── */
export async function getAdminProducts(): Promise<{ products: AdminProduct[]; total: number }> {
  return apiFetch('/admin/products');
}

export async function getAdminProduct(id: string): Promise<AdminProduct> {
  return apiFetch(`/admin/products/${id}`);
}

export async function createAdminProduct(productData: Record<string, any>): Promise<AdminProduct> {
  return apiFetch('/admin/products', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(productData),
  });
}

export async function updateAdminProduct(id: string, productData: Record<string, any>): Promise<AdminProduct> {
  return apiFetch(`/admin/products/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(productData),
  });
}

export async function deleteAdminProduct(id: string): Promise<{ ok: boolean }> {
  return apiFetch(`/admin/products/${id}`, { method: 'DELETE' });
}

/* ── Homepage Images ───────────────────────────────────────────────────── */
export interface HomepageImageSlot {
  key: string;
  filename: string;
  path: string;
  exists: boolean;
}

export async function getHomepageImageSlots(): Promise<{ slots: HomepageImageSlot[] }> {
  return apiFetch('/admin/homepage-images');
}

export async function uploadHomepageImage(key: string, file: File): Promise<{ ok: boolean; key: string; path: string }> {
  const fd = new FormData();
  fd.append('image', file);
  const res = await fetch(`${BASE}/admin/homepage-images/${key}`, {
    method: 'PUT',
    credentials: 'include',
    body: fd,
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error((body as { error?: string }).error ?? `HTTP ${res.status}`);
  }
  return res.json();
}

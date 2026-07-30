export interface AdminProduct {
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
  createdAt: string;
  updatedAt: string;
}

const BASE = '/api';

async function apiFetch(path: string, init?: RequestInit) {
  const res = await fetch(`${BASE}${path}`, {
    credentials: 'include',
    ...init,
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error((body as { error?: string }).error ?? `HTTP ${res.status}`);
  }
  return res.json();
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

export async function createAdminProduct(formData: FormData): Promise<AdminProduct> {
  const res = await fetch(`${BASE}/admin/products`, {
    method: 'POST',
    credentials: 'include',
    body: formData,
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error((body as { error?: string }).error ?? `HTTP ${res.status}`);
  }
  return res.json();
}

export async function updateAdminProduct(id: string, formData: FormData): Promise<AdminProduct> {
  const res = await fetch(`${BASE}/admin/products/${id}`, {
    method: 'PUT',
    credentials: 'include',
    body: formData,
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error((body as { error?: string }).error ?? `HTTP ${res.status}`);
  }
  return res.json();
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

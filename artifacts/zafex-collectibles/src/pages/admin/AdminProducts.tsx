import React, { useEffect, useState, useCallback } from 'react';
import { Link } from 'wouter';
import { Plus, Pencil, Trash2, Search, Package } from 'lucide-react';
import AdminLayout from './AdminLayout';
import { getAdminProducts, deleteAdminProduct, type AdminProduct } from '@/lib/adminApi';

const BADGE_COLORS: Record<string, string> = {
  new: 'bg-emerald-100 text-emerald-800',
  limited: 'bg-amber-100 text-amber-800',
};

export default function AdminProducts() {
  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [deleting, setDeleting] = useState<string | null>(null);
  const [toast, setToast] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const { products } = await getAdminProducts();
      setProducts(products);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to load products');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  async function handleDelete(product: AdminProduct) {
    if (!confirm(`Delete "${product.name}"? This cannot be undone.`)) return;
    setDeleting(product.id);
    try {
      await deleteAdminProduct(product.id);
      setProducts((prev) => prev.filter((p) => p.id !== product.id));
      showToast(`"${product.name}" deleted`);
    } catch (e: unknown) {
      showToast(e instanceof Error ? e.message : 'Delete failed', true);
    } finally {
      setDeleting(null);
    }
  }

  function showToast(msg: string, isError = false) {
    setToast(isError ? `❌ ${msg}` : `✓ ${msg}`);
    setTimeout(() => setToast(''), 3000);
  }

  const filtered = products.filter((p) =>
    search
      ? p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.cat.toLowerCase().includes(search.toLowerCase())
      : true,
  );

  return (
    <AdminLayout>
      {/* Toast */}
      {toast && (
        <div className="fixed top-4 right-4 z-50 bg-[#1a1a18] text-[#f5f0e8] text-[13px] px-4 py-3 rounded-lg shadow-xl border border-[#333330]">
          {toast}
        </div>
      )}

      <div className="p-4 sm:p-6 lg:p-10 max-w-[1400px] w-full">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 sm:mb-10">
          <div>
            <h1 className="font-serif text-[26px] sm:text-[34px] text-[#1a1a18] tracking-tight">
              Products
            </h1>
            <p className="text-[#6b6b6b] text-[13px] sm:text-[15px] mt-1">
              {products.length} total · {products.filter((p) => p.inStock).length} in stock
            </p>
          </div>
          <Link href="/admin/products/new">
            <button className="inline-flex items-center justify-center gap-2 bg-[#1a1a18] hover:bg-[#2e2e2a] text-[#f5f0e8] text-[12px] sm:text-[13px] font-semibold uppercase tracking-[1.5px] px-5 sm:px-6 py-2.5 sm:py-3 rounded-md transition-colors cursor-pointer w-full sm:w-auto shadow-sm">
              <Plus size={16} strokeWidth={2.5} />
              Add Product
            </button>
          </Link>
        </div>

        {/* Search */}
        <div className="relative mb-6">
          <Search
            size={16}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-[#aaa]"
          />
          <input
            type="text"
            placeholder="Search by name or category…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full max-w-md bg-white border border-[#e2ddd8] text-[#1a1a18] text-[14px] pl-11 pr-4 py-3 rounded-md outline-none focus:border-[#d4af37] transition-colors"
          />
        </div>

        {/* Loading / Error States */}
        {loading ? (
          <div className="flex justify-center py-24">
            <div className="w-8 h-8 border-2 border-[#d4af37] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : error ? (
          <div className="text-red-500 text-[14px] py-8 text-center">{error}</div>
        ) : filtered.length === 0 ? (
          <div className="bg-white rounded-xl border border-[#e2ddd8] p-12 text-center">
            <Package size={40} className="mx-auto text-[#aaa] mb-3" />
            <p className="text-[#6b6b6b] text-[15px]">
              {search ? 'No products match your search.' : 'No products found.'}
            </p>
          </div>
        ) : (
          <>
            {/* ── MOBILE CARD LIST VIEW (Visible on mobile/tablet screens < lg) ── */}
            <div className="grid grid-cols-1 gap-3.5 lg:hidden">
              {filtered.map((product) => (
                <div
                  key={product.id}
                  className="bg-white rounded-xl border border-[#e2ddd8] p-4 shadow-xs flex flex-col gap-3"
                >
                  <div className="flex items-start gap-3.5">
                    <Link href={`/admin/products/${product.id}/edit`} className="shrink-0">
                      <div className="w-16 h-16 rounded-lg bg-[#f5f0e8] overflow-hidden border border-[#eae5de] cursor-pointer">
                        <img
                          src={product.image}
                          alt={product.name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display = 'none';
                          }}
                        />
                      </div>
                    </Link>
                    <div className="flex-1 min-w-0">
                      <Link href={`/admin/products/${product.id}/edit`}>
                        <h3 className="font-semibold text-[#1a1a18] text-[14px] leading-snug truncate hover:text-[#8b6914] cursor-pointer">
                          {product.name}
                        </h3>
                      </Link>
                      <div className="flex items-center gap-2 mt-1 text-[11px] text-[#8a8278]">
                        <span className="font-mono">{product.id}</span>
                        <span>•</span>
                        <span className="capitalize">{product.cat}</span>
                      </div>
                      <div className="flex items-center gap-2 mt-1.5">
                        <span className="font-bold text-[#1a1a18] text-[14px]">
                          ₹{product.price.toLocaleString('en-IN')}
                        </span>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            product.inStock
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-red-100 text-red-700'
                          }`}
                        >
                          {product.inStock ? 'In Stock' : 'Out of Stock'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Direct Mobile Action Buttons */}
                  <div className="flex items-center gap-2 pt-2 border-t border-[#f0ece7]">
                    <Link
                      href={`/admin/products/${product.id}/edit`}
                      className="flex-1 inline-flex items-center justify-center gap-1.5 bg-[#1a1a18] hover:bg-[#2e2e2a] text-[#d4af37] text-[12px] font-bold uppercase tracking-[1px] py-2 rounded-lg transition"
                    >
                      <Pencil size={13} strokeWidth={2.5} />
                      Edit Product
                    </Link>
                    <button
                      type="button"
                      onClick={() => handleDelete(product)}
                      disabled={deleting === product.id}
                      className="inline-flex items-center justify-center gap-1 px-3 py-2 border border-[#ded7cb] hover:bg-red-50 hover:text-red-600 text-[#8a8278] text-[12px] rounded-lg transition cursor-pointer"
                      title="Delete Product"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* ── DESKTOP TABLE VIEW (Visible on screens >= lg) ── */}
            <div className="hidden lg:block bg-white rounded-xl border border-[#e2ddd8] overflow-hidden shadow-xs">
              <table className="w-full text-[14px]">
                <thead>
                  <tr className="border-b border-[#e2ddd8] bg-[#faf9f7]">
                    <th className="text-left text-[12px] font-semibold uppercase tracking-[1px] text-[#8a8278] px-6 py-4">
                      Product
                    </th>
                    <th className="text-left text-[12px] font-semibold uppercase tracking-[1px] text-[#8a8278] px-5 py-4">
                      Category
                    </th>
                    <th className="text-left text-[12px] font-semibold uppercase tracking-[1px] text-[#8a8278] px-5 py-4">
                      Price
                    </th>
                    <th className="text-left text-[12px] font-semibold uppercase tracking-[1px] text-[#8a8278] px-5 py-4">
                      Badge
                    </th>
                    <th className="text-left text-[12px] font-semibold uppercase tracking-[1px] text-[#8a8278] px-5 py-4">
                      Stock
                    </th>
                    <th className="px-5 py-4" />
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((product, i) => (
                    <tr
                      key={product.id}
                      className={`border-b border-[#f0ece7] hover:bg-[#faf9f7] transition-colors ${
                        i === filtered.length - 1 ? 'border-b-0' : ''
                      }`}
                    >
                      {/* Product name + image */}
                      <td className="px-6 py-4">
                        <Link href={`/admin/products/${product.id}/edit`}>
                          <div className="flex items-center gap-4 cursor-pointer group">
                            <div className="w-[52px] h-[52px] rounded-md bg-[#f5f0e8] overflow-hidden shrink-0 border border-[#e2ddd8]">
                              <img
                                src={product.image}
                                alt={product.name}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                                onError={(e) => {
                                  (e.target as HTMLImageElement).style.display = 'none';
                                }}
                              />
                            </div>
                            <div>
                              <div className="font-medium text-[#1a1a18] leading-tight text-[14px] group-hover:text-[#8b6914] transition-colors">
                                {product.name}
                              </div>
                              <div className="text-[12px] text-[#8a8278] mt-0.5 font-mono">
                                {product.id}
                              </div>
                            </div>
                          </div>
                        </Link>
                      </td>

                      {/* Category */}
                      <td className="px-5 py-4 text-[#4a4a4a]">
                        <div className="capitalize text-[14px]">{product.cat}</div>
                        <div className="text-[12px] text-[#8a8278]">{product.sub}</div>
                      </td>

                      {/* Price & Discount */}
                      <td className="px-5 py-4">
                        <div className="font-semibold text-[#1a1a18] text-[14px]">
                          ₹{product.price.toLocaleString('en-IN')}
                        </div>
                        {product.mrp && product.mrp > product.price && (
                          <div className="flex items-center gap-1.5 mt-0.5 text-[11px]">
                            <span className="line-through text-[#8a8278]">
                              ₹{product.mrp.toLocaleString('en-IN')}
                            </span>
                            <span className="text-green-700 font-bold bg-green-50 px-1.5 py-0.2 rounded">
                              {product.discount ?? Math.round(((product.mrp - product.price) / product.mrp) * 100)}% OFF
                            </span>
                          </div>
                        )}
                      </td>

                      {/* Badge */}
                      <td className="px-5 py-4">
                        {product.badge ? (
                          <span
                            className={`inline-block text-[11px] font-semibold uppercase tracking-[1px] px-2.5 py-1 rounded-full ${
                              BADGE_COLORS[product.badge] ?? 'bg-gray-100 text-gray-700'
                            }`}
                          >
                            {product.badge}
                          </span>
                        ) : (
                          <span className="text-[#ccc]">—</span>
                        )}
                      </td>

                      {/* Stock */}
                      <td className="px-5 py-4">
                        <span
                          className={`inline-flex items-center gap-2 text-[13px] font-medium ${
                            product.inStock ? 'text-emerald-700' : 'text-red-500'
                          }`}
                        >
                          <span
                            className={`w-2 h-2 rounded-full ${
                              product.inStock ? 'bg-emerald-500' : 'bg-red-400'
                            }`}
                          />
                          {product.inStock ? 'In Stock' : 'Out of Stock'}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2 justify-end">
                          <Link href={`/admin/products/${product.id}/edit`}>
                            <button
                              type="button"
                              className="p-2 rounded-md text-[#8a8278] hover:text-[#1a1a18] hover:bg-[#f0ece7] transition-colors cursor-pointer"
                              title="Edit product"
                            >
                              <Pencil size={16} strokeWidth={2} />
                            </button>
                          </Link>
                          <button
                            type="button"
                            onClick={() => handleDelete(product)}
                            disabled={deleting === product.id}
                            className="p-2 rounded-md text-[#8a8278] hover:text-red-500 hover:bg-red-50 transition-colors disabled:opacity-40 cursor-pointer"
                            title="Delete product"
                          >
                            {deleting === product.id ? (
                              <div className="w-4 h-4 border-2 border-red-500 border-t-transparent rounded-full animate-spin" />
                            ) : (
                              <Trash2 size={16} strokeWidth={2} />
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </AdminLayout>
  );
}

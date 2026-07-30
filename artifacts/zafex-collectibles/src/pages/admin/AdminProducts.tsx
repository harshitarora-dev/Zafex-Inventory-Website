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

      <div className="p-10 max-w-[1400px]">
        {/* Header */}
        <div className="flex items-center justify-between mb-10">
          <div>
            <h1 className="font-serif text-[34px] text-[#1a1a18] tracking-tight">
              Products
            </h1>
            <p className="text-[#6b6b6b] text-[15px] mt-1.5">
              {products.length} total · {products.filter((p) => p.inStock).length} in stock
            </p>
          </div>
          <Link href="/admin/products/new">
            <button className="flex items-center gap-2 bg-[#1a1a18] hover:bg-[#2e2e2a] text-[#f5f0e8] text-[13px] font-semibold uppercase tracking-[1.5px] px-6 py-3 rounded-md transition-colors">
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

        {/* Table */}
        {loading ? (
          <div className="flex justify-center py-24">
            <div className="w-8 h-8 border-2 border-[#d4af37] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : error ? (
          <div className="text-red-500 text-[14px] py-8 text-center">{error}</div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center py-24 text-center">
            <Package size={48} className="text-[#ccc] mb-4" />
            <p className="text-[#6b6b6b] text-[15px]">
              {search ? 'No products match your search.' : 'No products yet. Add your first one!'}
            </p>
          </div>
        ) : (
          <div className="bg-white border border-[#e2ddd8] rounded-xl overflow-hidden">
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
                      <div className="flex items-center gap-4">
                        <div className="w-13 h-13 rounded-md bg-[#f5f0e8] overflow-hidden shrink-0" style={{width:52,height:52}}>
                          <img
                            src={product.image}
                            alt={product.name}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              (e.target as HTMLImageElement).style.display = 'none';
                            }}
                          />
                        </div>
                        <div>
                          <div className="font-medium text-[#1a1a18] leading-tight text-[14px]">
                            {product.name}
                          </div>
                          <div className="text-[12px] text-[#8a8278] mt-0.5 font-mono">
                            {product.id}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Category */}
                    <td className="px-5 py-4 text-[#4a4a4a]">
                      <div className="capitalize text-[14px]">{product.cat}</div>
                      <div className="text-[12px] text-[#8a8278]">{product.sub}</div>
                    </td>

                    {/* Price */}
                    <td className="px-5 py-4 font-medium text-[#1a1a18] text-[14px]">
                      ₹{product.price.toLocaleString('en-IN')}
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
                          <button className="p-2 rounded-md text-[#8a8278] hover:text-[#1a1a18] hover:bg-[#f0ece7] transition-colors">
                            <Pencil size={16} strokeWidth={2} />
                          </button>
                        </Link>
                        <button
                          onClick={() => handleDelete(product)}
                          disabled={deleting === product.id}
                          className="p-2 rounded-md text-[#8a8278] hover:text-red-500 hover:bg-red-50 transition-colors disabled:opacity-40"
                        >
                          {deleting === product.id ? (
                            <div className="w-4 h-4 border border-red-400 border-t-transparent rounded-full animate-spin" />
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
        )}
      </div>
    </AdminLayout>
  );
}

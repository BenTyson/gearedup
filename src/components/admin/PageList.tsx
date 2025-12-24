import { useState, useEffect } from 'react';

interface Page {
  id: string;
  title: string;
  slug: string;
  category: string;
  created_at: string;
}

interface PageListProps {
  initialCategory?: string;
}

export default function PageList({ initialCategory }: PageListProps) {
  const [pages, setPages] = useState<Page[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState(initialCategory || '');
  const [categories, setCategories] = useState<string[]>([]);
  const [total, setTotal] = useState(0);

  const fetchPages = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (category) params.append('category', category);
      if (search) params.append('search', search);

      const res = await fetch(`/api/pages?${params}`);
      const data = await res.json();

      if (res.ok) {
        setPages(data.pages || []);
        setTotal(data.total || 0);
      }
    } catch (error) {
      console.error('Failed to fetch pages:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPages();
  }, [category]);

  useEffect(() => {
    // Fetch all to get categories on mount
    fetch('/api/pages?limit=1000')
      .then((res) => res.json())
      .then((data) => {
        const cats = [...new Set(data.pages?.map((p: Page) => p.category) || [])];
        setCategories(cats.sort() as string[]);
      });
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchPages();
  };

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Delete "${title}"? This will also remove all product links. This cannot be undone.`)) return;

    try {
      const res = await fetch(`/api/pages/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setPages(pages.filter((p) => p.id !== id));
        setTotal(total - 1);
      } else {
        alert('Failed to delete page');
      }
    } catch (error) {
      alert('Failed to delete page');
    }
  };

  return (
    <div>
      {/* Filters */}
      <div className="mb-6 flex flex-wrap gap-4">
        <form onSubmit={handleSearch} className="flex gap-2">
          <input
            type="text"
            placeholder="Search pages..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none"
          />
          <button
            type="submit"
            className="px-4 py-2 bg-brand-600 text-white rounded-lg hover:bg-brand-700 transition-colors"
          >
            Search
          </button>
        </form>

        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none"
        >
          <option value="">All Categories</option>
          {categories.map((cat) => (
            <option key={cat} value={cat}>
              {cat.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())}
            </option>
          ))}
        </select>

        <a
          href="/admin/pages/new"
          className="ml-auto px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Add Page
        </a>
      </div>

      {/* Results count */}
      <p className="text-sm text-neutral-500 mb-4">
        Showing {pages.length} of {total} pages
      </p>

      {/* Table */}
      <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-neutral-500">Loading...</div>
        ) : pages.length === 0 ? (
          <div className="p-8 text-center text-neutral-500">No pages found</div>
        ) : (
          <table className="w-full">
            <thead className="bg-neutral-50 border-b border-neutral-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                  Title
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                  Slug
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-neutral-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200">
              {pages.map((page) => (
                <tr key={page.id} className="hover:bg-neutral-50">
                  <td className="px-6 py-4">
                    <p className="font-medium text-neutral-900">{page.title}</p>
                  </td>
                  <td className="px-6 py-4 text-neutral-500 text-sm font-mono">
                    /best/{page.slug}
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-1 text-xs font-medium bg-neutral-100 text-neutral-700 rounded-full">
                      {page.category.replace(/-/g, ' ')}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <a
                        href={`/best/${page.slug}`}
                        target="_blank"
                        className="px-3 py-1 text-sm text-neutral-600 hover:text-neutral-700 font-medium"
                      >
                        View
                      </a>
                      <a
                        href={`/admin/page-products/${page.id}`}
                        className="px-3 py-1 text-sm text-green-600 hover:text-green-700 font-medium"
                      >
                        Products
                      </a>
                      <a
                        href={`/admin/pages/${page.id}`}
                        className="px-3 py-1 text-sm text-brand-600 hover:text-brand-700 font-medium"
                      >
                        Edit
                      </a>
                      <button
                        onClick={() => handleDelete(page.id, page.title)}
                        className="px-3 py-1 text-sm text-red-600 hover:text-red-700 font-medium"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

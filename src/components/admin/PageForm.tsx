import { useState } from 'react';
import { useForm } from 'react-hook-form';

interface PageFormData {
  title: string;
  slug: string;
  category: string;
  intro: string;
  buyers_guide: string;
  meta_description: string;
}

interface PageFormProps {
  page?: any;
  categories: string[];
}

export default function PageForm({ page, categories }: PageFormProps) {
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<PageFormData>({
    defaultValues: {
      title: page?.title || '',
      slug: page?.slug || '',
      category: page?.category || categories[0] || '',
      intro: page?.intro || '',
      buyers_guide: page?.buyers_guide || '',
      meta_description: page?.meta_description || '',
    },
  });

  const title = watch('title');

  // Auto-generate slug from title
  const generateSlug = () => {
    const slug = title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
    setValue('slug', slug);
  };

  const onSubmit = async (data: PageFormData) => {
    setSaving(true);
    setError('');

    try {
      const payload = {
        title: data.title,
        slug: data.slug,
        category: data.category,
        intro: data.intro,
        buyers_guide: data.buyers_guide || null,
        meta_description: data.meta_description || null,
      };

      const url = page ? `/api/pages/${page.id}` : '/api/pages';
      const method = page ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const result = await res.json();

      if (!res.ok) {
        throw new Error(result.error || 'Failed to save page');
      }

      window.location.href = '/admin/pages';
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">{error}</div>
      )}

      {/* Basic Info */}
      <div className="bg-white rounded-xl border border-neutral-200 p-6">
        <h2 className="text-lg font-semibold text-neutral-900 mb-4">Page Information</h2>
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">
              Page Title *
            </label>
            <input
              {...register('title', { required: 'Title is required' })}
              placeholder="Best Mechanical Keyboards for Gaming"
              className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none"
            />
            {errors.title && (
              <p className="text-red-600 text-sm mt-1">{errors.title.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">URL Slug *</label>
            <div className="flex gap-2">
              <div className="flex-1 relative">
                <span className="absolute left-3 top-2 text-neutral-500">/best/</span>
                <input
                  {...register('slug', { required: 'Slug is required' })}
                  placeholder="mechanical-keyboards-gaming"
                  className="w-full pl-14 pr-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none font-mono text-sm"
                />
              </div>
              <button
                type="button"
                onClick={generateSlug}
                className="px-4 py-2 border border-neutral-300 rounded-lg text-neutral-700 hover:bg-neutral-50 transition-colors text-sm"
              >
                Generate from title
              </button>
            </div>
            {errors.slug && (
              <p className="text-red-600 text-sm mt-1">{errors.slug.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">Category *</label>
            <select
              {...register('category', { required: 'Category is required' })}
              className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none"
            >
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">
              Meta Description
            </label>
            <input
              {...register('meta_description')}
              placeholder="SEO description for search engines (150-160 characters)"
              maxLength={160}
              className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none"
            />
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="bg-white rounded-xl border border-neutral-200 p-6">
        <h2 className="text-lg font-semibold text-neutral-900 mb-4">Content</h2>
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">
              Introduction *
            </label>
            <textarea
              {...register('intro', { required: 'Introduction is required' })}
              rows={6}
              placeholder="Write an engaging introduction that explains what this page is about and why readers should trust your recommendations..."
              className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none"
            />
            {errors.intro && (
              <p className="text-red-600 text-sm mt-1">{errors.intro.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">
              Buyer's Guide
            </label>
            <textarea
              {...register('buyers_guide')}
              rows={10}
              placeholder="Provide helpful buying advice, what to look for, common mistakes to avoid, etc. Supports Markdown formatting."
              className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none font-mono text-sm"
            />
            <p className="text-neutral-500 text-sm mt-1">Supports Markdown formatting</p>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-between items-center">
        {page && (
          <a
            href={`/admin/page-products/${page.id}`}
            className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            Manage Products
          </a>
        )}
        <div className="flex gap-4 ml-auto">
          <a
            href="/admin/pages"
            className="px-6 py-2 border border-neutral-300 rounded-lg text-neutral-700 hover:bg-neutral-50 transition-colors"
          >
            Cancel
          </a>
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2 bg-brand-600 text-white rounded-lg hover:bg-brand-700 transition-colors disabled:opacity-50"
          >
            {saving ? 'Saving...' : page ? 'Update Page' : 'Create Page'}
          </button>
        </div>
      </div>
    </form>
  );
}

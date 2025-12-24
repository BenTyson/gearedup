import { useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';

interface ProductFormData {
  name: string;
  brand: string;
  category: string;
  price: string;
  original_price: string;
  amazon_url: string;
  image_url: string;
  rating: string;
  review_count: string;
  description: string;
  asin: string;
  features: { value: string }[];
  pros: { value: string }[];
  cons: { value: string }[];
}

interface ProductFormProps {
  product?: any;
  categories: string[];
}

export default function ProductForm({ product, categories }: ProductFormProps) {
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<ProductFormData>({
    defaultValues: {
      name: product?.name || '',
      brand: product?.brand || '',
      category: product?.category || categories[0] || '',
      price: product?.price?.toString() || '',
      original_price: product?.original_price?.toString() || '',
      amazon_url: product?.amazon_url || '',
      image_url: product?.image_url || '',
      rating: product?.rating?.toString() || '',
      review_count: product?.review_count?.toString() || '',
      description: product?.description || '',
      asin: product?.asin || '',
      features: product?.features?.map((f: string) => ({ value: f })) || [{ value: '' }],
      pros: product?.pros?.map((p: string) => ({ value: p })) || [{ value: '' }],
      cons: product?.cons?.map((c: string) => ({ value: c })) || [{ value: '' }],
    },
  });

  const featuresArray = useFieldArray({ control, name: 'features' });
  const prosArray = useFieldArray({ control, name: 'pros' });
  const consArray = useFieldArray({ control, name: 'cons' });

  const onSubmit = async (data: ProductFormData) => {
    setSaving(true);
    setError('');

    try {
      const payload = {
        name: data.name,
        brand: data.brand,
        category: data.category,
        price: data.price,
        original_price: data.original_price || null,
        amazon_url: data.amazon_url,
        image_url: data.image_url || null,
        rating: data.rating || null,
        review_count: data.review_count || null,
        description: data.description || null,
        asin: data.asin || null,
        features: data.features.map((f) => f.value).filter((v) => v.trim()),
        pros: data.pros.map((p) => p.value).filter((v) => v.trim()),
        cons: data.cons.map((c) => c.value).filter((v) => v.trim()),
      };

      const url = product ? `/api/products/${product.id}` : '/api/products';
      const method = product ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const result = await res.json();

      if (!res.ok) {
        throw new Error(result.error || 'Failed to save product');
      }

      window.location.href = '/admin/products';
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const ArrayField = ({
    name,
    label,
    array,
  }: {
    name: 'features' | 'pros' | 'cons';
    label: string;
    array: ReturnType<typeof useFieldArray>;
  }) => (
    <div>
      <label className="block text-sm font-medium text-neutral-700 mb-2">{label}</label>
      <div className="space-y-2">
        {array.fields.map((field, index) => (
          <div key={field.id} className="flex gap-2">
            <input
              {...register(`${name}.${index}.value`)}
              className="flex-1 px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none"
              placeholder={`${label.slice(0, -1)} ${index + 1}`}
            />
            {array.fields.length > 1 && (
              <button
                type="button"
                onClick={() => array.remove(index)}
                className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        ))}
        <button
          type="button"
          onClick={() => array.append({ value: '' })}
          className="text-sm text-brand-600 hover:text-brand-700 font-medium"
        >
          + Add {label.slice(0, -1)}
        </button>
      </div>
    </div>
  );

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">{error}</div>
      )}

      {/* Basic Info */}
      <div className="bg-white rounded-xl border border-neutral-200 p-6">
        <h2 className="text-lg font-semibold text-neutral-900 mb-4">Basic Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">
              Product Name *
            </label>
            <input
              {...register('name', { required: 'Name is required' })}
              className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none"
            />
            {errors.name && (
              <p className="text-red-600 text-sm mt-1">{errors.name.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">Brand *</label>
            <input
              {...register('brand', { required: 'Brand is required' })}
              className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none"
            />
            {errors.brand && (
              <p className="text-red-600 text-sm mt-1">{errors.brand.message}</p>
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
            <label className="block text-sm font-medium text-neutral-700 mb-1">ASIN</label>
            <input
              {...register('asin')}
              placeholder="B0XXXXXXXXX"
              className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none font-mono"
            />
          </div>
        </div>

        <div className="mt-6">
          <label className="block text-sm font-medium text-neutral-700 mb-1">Description</label>
          <textarea
            {...register('description')}
            rows={3}
            className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none"
          />
        </div>
      </div>

      {/* Pricing */}
      <div className="bg-white rounded-xl border border-neutral-200 p-6">
        <h2 className="text-lg font-semibold text-neutral-900 mb-4">Pricing & Rating</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">Price *</label>
            <div className="relative">
              <span className="absolute left-3 top-2 text-neutral-500">$</span>
              <input
                {...register('price', { required: 'Price is required' })}
                type="number"
                step="0.01"
                className="w-full pl-7 pr-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none"
              />
            </div>
            {errors.price && (
              <p className="text-red-600 text-sm mt-1">{errors.price.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">
              Original Price
            </label>
            <div className="relative">
              <span className="absolute left-3 top-2 text-neutral-500">$</span>
              <input
                {...register('original_price')}
                type="number"
                step="0.01"
                className="w-full pl-7 pr-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">Rating</label>
            <input
              {...register('rating')}
              type="number"
              step="0.1"
              min="0"
              max="5"
              placeholder="4.5"
              className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">Review Count</label>
            <input
              {...register('review_count')}
              type="number"
              min="0"
              placeholder="1234"
              className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none"
            />
          </div>
        </div>
      </div>

      {/* URLs */}
      <div className="bg-white rounded-xl border border-neutral-200 p-6">
        <h2 className="text-lg font-semibold text-neutral-900 mb-4">Links</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">
              Amazon URL *
            </label>
            <input
              {...register('amazon_url', { required: 'Amazon URL is required' })}
              type="url"
              placeholder="https://amazon.com/..."
              className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none"
            />
            {errors.amazon_url && (
              <p className="text-red-600 text-sm mt-1">{errors.amazon_url.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">Image URL</label>
            <input
              {...register('image_url')}
              type="url"
              placeholder="https://..."
              className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none"
            />
          </div>
        </div>
      </div>

      {/* Features, Pros, Cons */}
      <div className="bg-white rounded-xl border border-neutral-200 p-6">
        <h2 className="text-lg font-semibold text-neutral-900 mb-4">Features & Pros/Cons</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <ArrayField name="features" label="Features" array={featuresArray} />
          <ArrayField name="pros" label="Pros" array={prosArray} />
          <ArrayField name="cons" label="Cons" array={consArray} />
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-4">
        <a
          href="/admin/products"
          className="px-6 py-2 border border-neutral-300 rounded-lg text-neutral-700 hover:bg-neutral-50 transition-colors"
        >
          Cancel
        </a>
        <button
          type="submit"
          disabled={saving}
          className="px-6 py-2 bg-brand-600 text-white rounded-lg hover:bg-brand-700 transition-colors disabled:opacity-50"
        >
          {saving ? 'Saving...' : product ? 'Update Product' : 'Create Product'}
        </button>
      </div>
    </form>
  );
}

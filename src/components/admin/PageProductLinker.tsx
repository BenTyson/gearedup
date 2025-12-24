import { useState, useEffect } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import type { DragEndEvent } from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface Product {
  id: string;
  name: string;
  brand: string;
  category: string;
  price: number;
  rating: number | null;
  image_url: string | null;
  asin: string | null;
}

interface LinkedProduct {
  id: string;
  product_id: string;
  display_order: number;
  is_featured: boolean;
  custom_description: string | null;
  products: Product;
}

interface PageProductLinkerProps {
  pageId: string;
  pageTitle: string;
}

function SortableItem({
  link,
  onRemove,
  onToggleFeatured,
}: {
  link: LinkedProduct;
  onRemove: (id: string) => void;
  onToggleFeatured: (id: string) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: link.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const product = link.products;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`bg-white rounded-lg border ${
        link.is_featured ? 'border-yellow-400 bg-yellow-50' : 'border-neutral-200'
      } p-4 flex items-center gap-4`}
    >
      <button
        {...attributes}
        {...listeners}
        className="cursor-grab active:cursor-grabbing p-1 text-neutral-400 hover:text-neutral-600"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 8h16M4 16h16"
          />
        </svg>
      </button>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="font-medium text-neutral-900 truncate">{product.name}</p>
          {link.is_featured && (
            <span className="px-2 py-0.5 text-xs font-medium bg-yellow-100 text-yellow-800 rounded-full">
              Featured
            </span>
          )}
        </div>
        <p className="text-sm text-neutral-500">
          {product.brand} • ${product.price.toFixed(2)}
          {product.rating && ` • ${product.rating.toFixed(1)}★`}
        </p>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={() => onToggleFeatured(link.id)}
          className={`p-2 rounded-lg transition-colors ${
            link.is_featured
              ? 'text-yellow-600 bg-yellow-100 hover:bg-yellow-200'
              : 'text-neutral-400 hover:text-yellow-600 hover:bg-yellow-50'
          }`}
          title={link.is_featured ? 'Remove featured' : 'Set as featured'}
        >
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
          </svg>
        </button>
        <button
          onClick={() => onRemove(link.id)}
          className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
          title="Remove from page"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  );
}

export default function PageProductLinker({ pageId, pageTitle }: PageProductLinkerProps) {
  const [linked, setLinked] = useState<LinkedProduct[]>([]);
  const [available, setAvailable] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [category, setCategory] = useState('');
  const [hasChanges, setHasChanges] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/page-products/${pageId}`);
      const data = await res.json();

      if (res.ok) {
        setLinked(data.linked || []);
        setAvailable(data.available || []);
        setCategory(data.category || '');
      }
    } catch (error) {
      console.error('Failed to fetch:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [pageId]);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setLinked((items) => {
        const oldIndex = items.findIndex((i) => i.id === active.id);
        const newIndex = items.findIndex((i) => i.id === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
      setHasChanges(true);
    }
  };

  const handleAddProduct = async (productId: string) => {
    try {
      const res = await fetch(`/api/page-products/${pageId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ product_id: productId }),
      });

      if (res.ok) {
        await fetchData();
      } else {
        alert('Failed to add product');
      }
    } catch (error) {
      alert('Failed to add product');
    }
  };

  const handleRemove = async (linkId: string) => {
    if (!confirm('Remove this product from the page?')) return;

    try {
      const res = await fetch(`/api/page-products/${pageId}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ link_id: linkId }),
      });

      if (res.ok) {
        setLinked(linked.filter((l) => l.id !== linkId));
        await fetchData();
      } else {
        alert('Failed to remove product');
      }
    } catch (error) {
      alert('Failed to remove product');
    }
  };

  const handleToggleFeatured = (linkId: string) => {
    setLinked(
      linked.map((l) => (l.id === linkId ? { ...l, is_featured: !l.is_featured } : l))
    );
    setHasChanges(true);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch(`/api/page-products/${pageId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          links: linked.map((l) => ({
            id: l.id,
            is_featured: l.is_featured,
            custom_description: l.custom_description,
          })),
        }),
      });

      if (res.ok) {
        setHasChanges(false);
        alert('Order saved successfully!');
      } else {
        alert('Failed to save order');
      }
    } catch (error) {
      alert('Failed to save order');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-neutral-500">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header with save button */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-neutral-500">
            {linked.length} product{linked.length !== 1 ? 's' : ''} linked
            {category && ` • Category: ${category.replace(/-/g, ' ')}`}
          </p>
        </div>
        {hasChanges && (
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-4 py-2 bg-brand-600 text-white rounded-lg hover:bg-brand-700 transition-colors disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save Order'}
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Linked Products (sortable) */}
        <div>
          <h3 className="text-lg font-semibold text-neutral-900 mb-4">
            Linked Products
            <span className="text-sm font-normal text-neutral-500 ml-2">
              Drag to reorder
            </span>
          </h3>

          {linked.length === 0 ? (
            <div className="bg-neutral-50 rounded-lg border-2 border-dashed border-neutral-300 p-8 text-center text-neutral-500">
              No products linked yet. Add products from the list on the right.
            </div>
          ) : (
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext items={linked.map((l) => l.id)} strategy={verticalListSortingStrategy}>
                <div className="space-y-2">
                  {linked.map((link) => (
                    <SortableItem
                      key={link.id}
                      link={link}
                      onRemove={handleRemove}
                      onToggleFeatured={handleToggleFeatured}
                    />
                  ))}
                </div>
              </SortableContext>
            </DndContext>
          )}
        </div>

        {/* Available Products */}
        <div>
          <h3 className="text-lg font-semibold text-neutral-900 mb-4">
            Available Products
            <span className="text-sm font-normal text-neutral-500 ml-2">
              Click to add
            </span>
          </h3>

          {available.length === 0 ? (
            <div className="bg-neutral-50 rounded-lg border-2 border-dashed border-neutral-300 p-8 text-center text-neutral-500">
              All products in this category are already linked.
            </div>
          ) : (
            <div className="space-y-2 max-h-[600px] overflow-y-auto pr-2">
              {available.map((product) => (
                <button
                  key={product.id}
                  onClick={() => handleAddProduct(product.id)}
                  className="w-full bg-white rounded-lg border border-neutral-200 p-4 flex items-center gap-4 hover:border-brand-300 hover:bg-brand-50 transition-colors text-left"
                >
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center text-green-600">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                      />
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-neutral-900 truncate">{product.name}</p>
                    <p className="text-sm text-neutral-500">
                      {product.brand} • ${product.price.toFixed(2)}
                      {product.rating && ` • ${product.rating.toFixed(1)}★`}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

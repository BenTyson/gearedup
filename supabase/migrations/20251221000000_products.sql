-- Products table (curated products for GearedUp)
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  brand TEXT NOT NULL,
  category TEXT NOT NULL,
  best_for TEXT,
  pros TEXT[] DEFAULT '{}',
  cons TEXT[] DEFAULT '{}',
  verdict TEXT,
  rank TEXT CHECK (rank IN ('best-overall', 'best-budget', 'best-premium', 'runner-up')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ASINs (products can have multiple ASINs for variants/marketplaces)
CREATE TABLE product_asins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  asin TEXT NOT NULL,
  marketplace TEXT DEFAULT 'US',
  is_primary BOOLEAN DEFAULT false,
  verified_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(asin, marketplace)
);

-- Price history for tracking over time
CREATE TABLE price_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  asin_id UUID REFERENCES product_asins(id) ON DELETE CASCADE,
  price DECIMAL(10,2),
  currency TEXT DEFAULT 'USD',
  in_stock BOOLEAN DEFAULT true,
  checked_at TIMESTAMPTZ DEFAULT NOW()
);

-- Product images (cached locally or from Amazon)
CREATE TABLE product_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  alt_text TEXT,
  is_primary BOOLEAN DEFAULT false,
  source TEXT DEFAULT 'manual', -- 'manual', 'amazon', 'manufacturer'
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Recommendation pages (links products to content pages)
CREATE TABLE recommendation_pages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL, -- e.g., 'best-rotary-cutter-for-beginners'
  category TEXT NOT NULL,
  title TEXT NOT NULL,
  meta_description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Junction table: which products appear on which pages
CREATE TABLE page_products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  page_id UUID REFERENCES recommendation_pages(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  display_order INTEGER DEFAULT 0,
  is_quick_answer BOOLEAN DEFAULT false,
  UNIQUE(page_id, product_id)
);

-- View: Current prices (most recent price per ASIN)
CREATE VIEW current_prices AS
SELECT DISTINCT ON (asin_id)
  asin_id,
  price,
  currency,
  in_stock,
  checked_at
FROM price_history
ORDER BY asin_id, checked_at DESC;

-- View: Products with their primary ASIN and current price
CREATE VIEW products_with_prices AS
SELECT
  p.*,
  pa.asin,
  pa.marketplace,
  pa.verified_at,
  cp.price AS current_price,
  cp.in_stock,
  cp.checked_at AS price_checked_at,
  pi.url AS image_url
FROM products p
LEFT JOIN product_asins pa ON pa.product_id = p.id AND pa.is_primary = true
LEFT JOIN current_prices cp ON cp.asin_id = pa.id
LEFT JOIN product_images pi ON pi.product_id = p.id AND pi.is_primary = true;

-- Indexes for common queries
CREATE INDEX idx_products_category ON products(category);
CREATE INDEX idx_products_slug ON products(slug);
CREATE INDEX idx_product_asins_asin ON product_asins(asin);
CREATE INDEX idx_product_asins_product ON product_asins(product_id);
CREATE INDEX idx_price_history_asin ON price_history(asin_id);
CREATE INDEX idx_price_history_checked ON price_history(checked_at DESC);
CREATE INDEX idx_page_products_page ON page_products(page_id);

-- Updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER products_updated_at
  BEFORE UPDATE ON products
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER recommendation_pages_updated_at
  BEFORE UPDATE ON recommendation_pages
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

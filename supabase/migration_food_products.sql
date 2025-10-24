-- Create pet_food_products table (master data for commercial pet foods)
CREATE TABLE IF NOT EXISTS pet_food_products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,              -- 製品名
  brand TEXT,                      -- ブランド名
  calories_per_100g NUMERIC(6, 2) NOT NULL, -- 100gあたりのカロリー
  product_type TEXT,               -- 種類（ドライ、ウェット、おやつなど）
  species TEXT,                    -- 対象種（dog, cat, etc）
  notes TEXT,                      -- メモ
  is_public BOOLEAN DEFAULT FALSE, -- 全ユーザーが使える公開製品かどうか
  created_by UUID REFERENCES auth.users(id), -- 作成者（プライベート製品の場合）
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add calorie-related columns to pet_meals
ALTER TABLE pet_meals
  ADD COLUMN IF NOT EXISTS food_product_id UUID REFERENCES pet_food_products(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS amount_grams NUMERIC(6, 2), -- グラム数
  ADD COLUMN IF NOT EXISTS calories NUMERIC(6, 2);      -- 総カロリー

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_pet_food_products_species ON pet_food_products(species);
CREATE INDEX IF NOT EXISTS idx_pet_food_products_is_public ON pet_food_products(is_public);
CREATE INDEX IF NOT EXISTS idx_pet_food_products_created_by ON pet_food_products(created_by);
CREATE INDEX IF NOT EXISTS idx_pet_meals_food_product_id ON pet_meals(food_product_id);

-- Enable RLS
ALTER TABLE pet_food_products ENABLE ROW LEVEL SECURITY;

-- RLS Policies for pet_food_products
-- Users can view public products and their own private products
CREATE POLICY "Users can view public and own food products"
  ON pet_food_products
  FOR SELECT
  USING (
    is_public = TRUE OR created_by = auth.uid()
  );

-- Users can create their own food products
CREATE POLICY "Users can create own food products"
  ON pet_food_products
  FOR INSERT
  WITH CHECK (
    created_by = auth.uid()
  );

-- Users can update their own food products
CREATE POLICY "Users can update own food products"
  ON pet_food_products
  FOR UPDATE
  USING (
    created_by = auth.uid()
  );

-- Users can delete their own food products
CREATE POLICY "Users can delete own food products"
  ON pet_food_products
  FOR DELETE
  USING (
    created_by = auth.uid()
  );

-- Create trigger for updated_at
CREATE TRIGGER update_pet_food_products_updated_at
  BEFORE UPDATE ON pet_food_products
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Insert some common public food products (examples)
-- NOTE: System administrators can add more products via the admin panel (/admin/food-products)
-- These are initial seed data with created_by=NULL (system-created)
INSERT INTO pet_food_products (name, brand, calories_per_100g, product_type, species, is_public, created_by) VALUES
  ('ロイヤルカナン ミニ アダルト', 'ロイヤルカナン', 389, 'ドライフード', 'dog', TRUE, NULL),
  ('サイエンスダイエット アダルト', 'ヒルズ', 373, 'ドライフード', 'dog', TRUE, NULL),
  ('ロイヤルカナン フィーライン', 'ロイヤルカナン', 390, 'ドライフード', 'cat', TRUE, NULL),
  ('シーザー ビーフ', 'シーザー', 85, 'ウェットフード', 'dog', TRUE, NULL),
  ('モンプチ まぐろ', 'モンプチ', 75, 'ウェットフード', 'cat', TRUE, NULL)
ON CONFLICT DO NOTHING;

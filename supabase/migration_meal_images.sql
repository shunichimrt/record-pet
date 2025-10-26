-- Add image support for meals, food products, and meal templates

-- Add image_url to pet_meals table
ALTER TABLE pet_meals
  ADD COLUMN IF NOT EXISTS image_url TEXT;

-- Add image_url to pet_food_products table
ALTER TABLE pet_food_products
  ADD COLUMN IF NOT EXISTS image_url TEXT;

-- Add image_url to shared_meal_templates table
ALTER TABLE shared_meal_templates
  ADD COLUMN IF NOT EXISTS image_url TEXT;

-- Create storage bucket for meal images (if not exists)
INSERT INTO storage.buckets (id, name, public)
VALUES ('meal-images', 'meal-images', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for meal-images bucket
-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Authenticated users can upload meal images" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own meal images" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own meal images" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can view meal images" ON storage.objects;

-- Allow authenticated users to upload
CREATE POLICY "Authenticated users can upload meal images"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'meal-images');

-- Allow authenticated users to update their own images
CREATE POLICY "Users can update their own meal images"
  ON storage.objects
  FOR UPDATE
  TO authenticated
  USING (bucket_id = 'meal-images');

-- Allow authenticated users to delete their own images
CREATE POLICY "Users can delete their own meal images"
  ON storage.objects
  FOR DELETE
  TO authenticated
  USING (bucket_id = 'meal-images');

-- Allow public read access to meal images
CREATE POLICY "Anyone can view meal images"
  ON storage.objects
  FOR SELECT
  TO public
  USING (bucket_id = 'meal-images');

COMMENT ON COLUMN pet_meals.image_url IS 'Optional image URL for the meal record';
COMMENT ON COLUMN pet_food_products.image_url IS 'Optional product image URL';
COMMENT ON COLUMN shared_meal_templates.image_url IS 'Optional template image URL';

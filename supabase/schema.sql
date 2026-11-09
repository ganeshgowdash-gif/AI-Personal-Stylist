-- ==============================================================================
-- AI PERSONAL STYLIST - SUPABASE DATABASE SCHEMA & RLS POLICIES
-- ==============================================================================

-- 1. Enable UUID Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Profiles Table (Extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  avatar_url TEXT,
  gender_preference TEXT DEFAULT 'unisex',
  preferred_style TEXT[] DEFAULT '{"casual", "smart-casual"}',
  default_model_appearance JSONB DEFAULT '{"gender": "male", "ethnicity": "diverse", "bodyType": "regular"}'::jsonb,
  tryon_consent BOOLEAN DEFAULT FALSE,
  tryon_photo_path TEXT,
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 3. Clothing Categories Table
CREATE TABLE IF NOT EXISTS public.clothing_categories (
  id TEXT PRIMARY KEY,
  label TEXT NOT NULL,
  subcategories TEXT[] NOT NULL,
  icon TEXT NOT NULL,
  sort_order INT DEFAULT 0
);

-- Seed Categories
INSERT INTO public.clothing_categories (id, label, subcategories, icon, sort_order)
VALUES
  ('tops', 'Tops & Shirts', ARRAY['shirt', 't-shirt', 'polo', 'hoodie', 'sweater'], 'Shirt', 1),
  ('bottoms', 'Pants & Bottoms', ARRAY['jeans', 'chinos', 'formal pants', 'shorts', 'joggers'], 'Scissors', 2),
  ('outerwear', 'Jackets & Outerwear', ARRAY['jacket', 'blazer', 'coat', 'cardigan', 'vest'], 'Wind', 3),
  ('footwear', 'Shoes & Footwear', ARRAY['sneakers', 'formal shoes', 'boots', 'sandals', 'loafers'], 'Footprints', 4),
  ('accessories', 'Accessories', ARRAY['watch', 'belt', 'sunglasses', 'cap', 'bag', 'tie', 'jewelry', 'other'], 'Watch', 5)
ON CONFLICT (id) DO UPDATE 
SET label = EXCLUDED.label, subcategories = EXCLUDED.subcategories, icon = EXCLUDED.icon;

-- 4. Wardrobe Items Table
CREATE TABLE IF NOT EXISTS public.wardrobe_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  category TEXT NOT NULL REFERENCES public.clothing_categories(id),
  subcategory TEXT NOT NULL,
  primary_color TEXT NOT NULL,
  primary_color_hex TEXT NOT NULL,
  secondary_colors JSONB DEFAULT '[]'::jsonb,
  pattern TEXT DEFAULT 'solid',
  style TEXT DEFAULT 'casual',
  fit TEXT DEFAULT 'regular',
  season TEXT DEFAULT 'all-season',
  brand TEXT,
  photo_url TEXT NOT NULL,
  storage_path TEXT NOT NULL,
  notes TEXT,
  is_favorite BOOLEAN DEFAULT FALSE,
  times_worn INT DEFAULT 0,
  confidence_score NUMERIC(3, 2) DEFAULT 0.95,
  ai_metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 5. Outfit Combinations Table
CREATE TABLE IF NOT EXISTS public.outfit_combinations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  tier TEXT NOT NULL, -- 'best_match' | 'stylish_alternative' | 'comfortable'
  occasion TEXT NOT NULL,
  weather TEXT,
  season TEXT,
  top_item_id UUID REFERENCES public.wardrobe_items(id) ON DELETE SET NULL,
  bottom_item_id UUID REFERENCES public.wardrobe_items(id) ON DELETE SET NULL,
  outerwear_item_id UUID REFERENCES public.wardrobe_items(id) ON DELETE SET NULL,
  footwear_item_id UUID REFERENCES public.wardrobe_items(id) ON DELETE SET NULL,
  accessory_item_ids UUID[] DEFAULT '{}',
  color_harmony_explanation TEXT NOT NULL,
  occasion_fit_explanation TEXT NOT NULL,
  shoes_fit_explanation TEXT NOT NULL,
  accessories_explanation TEXT NOT NULL,
  general_styling_tips TEXT,
  missing_pieces_notes TEXT,
  score NUMERIC(3, 1) DEFAULT 8.5,
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 6. Saved Outfits Table
CREATE TABLE IF NOT EXISTS public.saved_outfits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  outfit_id UUID NOT NULL REFERENCES public.outfit_combinations(id) ON DELETE CASCADE,
  custom_name TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 7. Outfit History Table
CREATE TABLE IF NOT EXISTS public.outfit_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  outfit_id UUID REFERENCES public.outfit_combinations(id) ON DELETE CASCADE,
  worn_date DATE NOT NULL,
  occasion TEXT,
  feedback_rating INT CHECK (feedback_rating BETWEEN 1 AND 5),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 8. Planner Entries Table
CREATE TABLE IF NOT EXISTS public.planner_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  planned_date DATE NOT NULL,
  occasion TEXT NOT NULL,
  outfit_id UUID REFERENCES public.outfit_combinations(id) ON DELETE SET NULL,
  is_worn BOOLEAN DEFAULT FALSE,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  UNIQUE(user_id, planned_date)
);

-- 9. Shopping Recommendations Table
CREATE TABLE IF NOT EXISTS public.shopping_recommendations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  item_name TEXT NOT NULL,
  category TEXT NOT NULL,
  subcategory TEXT NOT NULL,
  color TEXT NOT NULL,
  color_hex TEXT NOT NULL,
  matching_item_ids UUID[] DEFAULT '{}',
  enabled_outfits_count INT DEFAULT 5,
  color_compatibility TEXT[] DEFAULT '{}',
  supported_occasions TEXT[] DEFAULT '{}',
  versatility_rating TEXT NOT NULL,
  verdict TEXT NOT NULL,
  reasoning TEXT NOT NULL,
  status TEXT DEFAULT 'suggested', -- 'suggested', 'purchased', 'dismissed'
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 10. Generated Previews Table
CREATE TABLE IF NOT EXISTS public.generated_previews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  outfit_id UUID REFERENCES public.outfit_combinations(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  storage_path TEXT NOT NULL,
  perspective TEXT DEFAULT 'front', -- 'front', 'side', 'detail'
  model_settings JSONB DEFAULT '{"gender": "male", "ethnicity": "diverse", "bodyType": "regular"}'::jsonb,
  color_variant TEXT DEFAULT 'original',
  prompt_used TEXT,
  is_virtual_tryon BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- ==============================================================================
-- INDEXES FOR MAXIMUM QUERY PERFORMANCE
-- ==============================================================================
CREATE INDEX IF NOT EXISTS idx_wardrobe_items_user ON public.wardrobe_items(user_id);
CREATE INDEX IF NOT EXISTS idx_wardrobe_items_category ON public.wardrobe_items(category);
CREATE INDEX IF NOT EXISTS idx_wardrobe_items_favorite ON public.wardrobe_items(is_favorite);
CREATE INDEX IF NOT EXISTS idx_outfits_user ON public.outfit_combinations(user_id);
CREATE INDEX IF NOT EXISTS idx_planner_user_date ON public.planner_entries(user_id, planned_date);
CREATE INDEX IF NOT EXISTS idx_outfit_history_user_date ON public.outfit_history(user_id, worn_date);
CREATE INDEX IF NOT EXISTS idx_shopping_user ON public.shopping_recommendations(user_id);
CREATE INDEX IF NOT EXISTS idx_previews_outfit ON public.generated_previews(outfit_id);

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- Strict Isolation: Each user can ONLY access and modify their own records.
-- ==============================================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clothing_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wardrobe_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.outfit_combinations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saved_outfits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.outfit_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.planner_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shopping_recommendations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.generated_previews ENABLE ROW LEVEL SECURITY;

-- Clothing Categories: Public read-only for authenticated users
CREATE POLICY "Categories are readable by everyone authenticated"
  ON public.clothing_categories FOR SELECT
  TO authenticated
  USING (true);

-- Profiles Policies
CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Wardrobe Items Policies
CREATE POLICY "Users can view own wardrobe items"
  ON public.wardrobe_items FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own wardrobe items"
  ON public.wardrobe_items FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own wardrobe items"
  ON public.wardrobe_items FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own wardrobe items"
  ON public.wardrobe_items FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Outfit Combinations Policies
CREATE POLICY "Users can view own outfit combinations"
  ON public.outfit_combinations FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own outfit combinations"
  ON public.outfit_combinations FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own outfit combinations"
  ON public.outfit_combinations FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Saved Outfits Policies
CREATE POLICY "Users can manage own saved outfits"
  ON public.saved_outfits FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Outfit History Policies
CREATE POLICY "Users can manage own outfit history"
  ON public.outfit_history FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Planner Entries Policies
CREATE POLICY "Users can manage own planner entries"
  ON public.planner_entries FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Shopping Recommendations Policies
CREATE POLICY "Users can manage own shopping recommendations"
  ON public.shopping_recommendations FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Generated Previews Policies
CREATE POLICY "Users can manage own generated previews"
  ON public.generated_previews FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ==============================================================================
-- AUTOMATIC PROFILE CREATION TRIGGER
-- When a user signs up via Supabase Auth, automatically insert a profile row.
-- ==============================================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    NEW.raw_user_meta_data->>'avatar_url'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- ==============================================================================
-- STORAGE BUCKET CONFIGURATION
-- Buckets:
-- 1. wardrobe-originals (private storage for original uploaded clothing photos)
-- 2. outfit-previews (public/signed storage for generated realistic model previews)
-- 3. user-tryon (strictly private storage for user full-body try-on photos)
-- ==============================================================================

-- Create buckets via Supabase storage API if using SQL extensions:
INSERT INTO storage.buckets (id, name, public)
VALUES 
  ('wardrobe-originals', 'wardrobe-originals', true),
  ('outfit-previews', 'outfit-previews', true),
  ('user-tryon', 'user-tryon', false)
ON CONFLICT (id) DO NOTHING;

-- Storage RLS: Users can only upload and read files in their own folder (auth.uid()/*)
CREATE POLICY "Users can upload original photos to their folder"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'wardrobe-originals' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "Users can read original photos"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'wardrobe-originals' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "Users can delete own original photos"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'wardrobe-originals' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

-- Previews bucket policies
CREATE POLICY "Authenticated users can upload previews"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'outfit-previews' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "Authenticated users can read previews"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'outfit-previews' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

-- Try-on bucket policies (Strictly private)
CREATE POLICY "Users can manage own try-on photos"
  ON storage.objects FOR ALL
  TO authenticated
  USING (
    bucket_id = 'user-tryon' AND
    (storage.foldername(name))[1] = auth.uid()::text
  )
  WITH CHECK (
    bucket_id = 'user-tryon' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );


-- ==============================================================================
-- AI PERSONAL WARDROBE – 3D OUTFIT STYLIST
-- SUPABASE DATABASE SCHEMA & ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Profiles Table
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  mobile_number TEXT,
  body_shape TEXT DEFAULT 'medium' CHECK (body_shape IN ('small', 'medium', 'large')),
  has_selected_body_shape BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 2. Wardrobe Items (Only 3 Categories: 'shirt', 'pants', 'shoes')
CREATE TABLE IF NOT EXISTS public.wardrobe_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  category TEXT NOT NULL CHECK (category IN ('shirt', 'pants', 'shoes')),
  name TEXT,
  item_type TEXT NOT NULL,
  primary_color TEXT NOT NULL,
  primary_color_hex TEXT NOT NULL,
  secondary_color TEXT,
  secondary_color_hex TEXT,
  pattern TEXT DEFAULT 'solid',
  style TEXT DEFAULT 'casual',
  
  -- Original User Photos (No stock photos, no AI models)
  front_photo_url TEXT NOT NULL,
  front_storage_path TEXT NOT NULL,
  back_photo_url TEXT,
  back_storage_path TEXT,
  side_photo_url TEXT,
  side_storage_path TEXT,
  
  brand TEXT,
  notes TEXT,
  is_favorite BOOLEAN DEFAULT FALSE,
  times_worn INT DEFAULT 0,
  confidence_score NUMERIC(3, 2) DEFAULT 0.95,
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 3. Dedicated Views for Shirts, Pants, Shoes
CREATE OR REPLACE VIEW public.shirts AS
  SELECT * FROM public.wardrobe_items WHERE category = 'shirt';

CREATE OR REPLACE VIEW public.pants AS
  SELECT * FROM public.wardrobe_items WHERE category = 'pants';

CREATE OR REPLACE VIEW public.shoes AS
  SELECT * FROM public.wardrobe_items WHERE category = 'shoes';

-- 4. Saved Outfits Table
CREATE TABLE IF NOT EXISTS public.saved_outfits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  shirt_id UUID NOT NULL REFERENCES public.wardrobe_items(id) ON DELETE CASCADE,
  pants_id UUID NOT NULL REFERENCES public.wardrobe_items(id) ON DELETE CASCADE,
  shoes_id UUID NOT NULL REFERENCES public.wardrobe_items(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 5. Outfit History Table
CREATE TABLE IF NOT EXISTS public.outfit_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  shirt_id UUID REFERENCES public.wardrobe_items(id) ON DELETE SET NULL,
  pants_id UUID REFERENCES public.wardrobe_items(id) ON DELETE SET NULL,
  shoes_id UUID REFERENCES public.wardrobe_items(id) ON DELETE SET NULL,
  worn_date DATE NOT NULL,
  occasion TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 6. User Preferences Table
CREATE TABLE IF NOT EXISTS public.user_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  preferences JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- ==============================================================================
-- INDEXES
-- ==============================================================================
CREATE INDEX IF NOT EXISTS idx_wardrobe_user ON public.wardrobe_items(user_id);
CREATE INDEX IF NOT EXISTS idx_wardrobe_cat ON public.wardrobe_items(user_id, category);
CREATE INDEX IF NOT EXISTS idx_saved_outfits_user ON public.saved_outfits(user_id);
CREATE INDEX IF NOT EXISTS idx_history_user ON public.outfit_history(user_id, worn_date);

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wardrobe_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saved_outfits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.outfit_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;

-- Profiles Policies
CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE TO authenticated
  USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = id);

-- Wardrobe Items Policies (Shirts, Pants, Shoes)
CREATE POLICY "Users can view own wardrobe items"
  ON public.wardrobe_items FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own wardrobe items"
  ON public.wardrobe_items FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own wardrobe items"
  ON public.wardrobe_items FOR UPDATE TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own wardrobe items"
  ON public.wardrobe_items FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

-- Saved Outfits Policies
CREATE POLICY "Users can manage own saved outfits"
  ON public.saved_outfits FOR ALL TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Outfit History Policies
CREATE POLICY "Users can manage own outfit history"
  ON public.outfit_history FOR ALL TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- User Preferences Policies
CREATE POLICY "Users can manage own preferences"
  ON public.user_preferences FOR ALL TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Profile creation on Auth sign-up trigger
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, mobile_number, body_shape, has_selected_body_shape)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    NEW.raw_user_meta_data->>'mobile_number',
    'medium',
    FALSE
  )
  ON CONFLICT (id) DO NOTHING;

  INSERT INTO public.user_preferences (user_id)
  VALUES (NEW.id)
  ON CONFLICT (user_id) DO NOTHING;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- ==============================================================================
-- STORAGE BUCKETS
-- ==============================================================================
INSERT INTO storage.buckets (id, name, public)
VALUES ('wardrobe-originals', 'wardrobe-originals', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Users can upload original clothing photos"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'wardrobe-originals' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "Users can read own clothing photos"
  ON storage.objects FOR SELECT TO authenticated
  USING (
    bucket_id = 'wardrobe-originals' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "Users can delete own clothing photos"
  ON storage.objects FOR DELETE TO authenticated
  USING (
    bucket_id = 'wardrobe-originals' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

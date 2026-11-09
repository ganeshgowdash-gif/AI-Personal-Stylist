export type ClothingCategory = 'tops' | 'bottoms' | 'outerwear' | 'footwear' | 'accessories';

export type Subcategory = 
  | 'shirt' 
  | 't-shirt' 
  | 'polo' 
  | 'jeans' 
  | 'chinos' 
  | 'formal pants' 
  | 'shorts' 
  | 'joggers' 
  | 'jacket' 
  | 'hoodie' 
  | 'sweater' 
  | 'sneakers' 
  | 'formal shoes' 
  | 'sandals' 
  | 'watch' 
  | 'belt' 
  | 'sunglasses' 
  | 'other';

export type ClothingStyle = 
  | 'formal' 
  | 'casual' 
  | 'sporty' 
  | 'traditional' 
  | 'party' 
  | 'smart-casual' 
  | 'streetwear';

export type ClothingPattern = 
  | 'solid' 
  | 'striped' 
  | 'checked' 
  | 'graphic' 
  | 'floral' 
  | 'printed' 
  | 'textured' 
  | 'other';

export type ClothingFit = 'slim' | 'regular' | 'oversized' | 'relaxed' | 'tailored';

export type Season = 'summer' | 'winter' | 'spring' | 'autumn' | 'monsoon' | 'all-season';

export interface ColorInfo {
  name: string;
  hex: string;
}

export interface WardrobeItem {
  id: string;
  user_id: string;
  name: string;
  category: ClothingCategory;
  subcategory: Subcategory;
  primary_color: string;
  primary_color_hex: string;
  secondary_colors: ColorInfo[];
  pattern: ClothingPattern;
  style: ClothingStyle;
  fit: ClothingFit;
  season: Season;
  brand?: string | null;
  photo_url: string;
  storage_path: string;
  notes?: string | null;
  is_favorite: boolean;
  times_worn: number;
  confidence_score: number;
  ai_metadata?: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export type Occasion =
  | 'College'
  | 'School'
  | 'Office'
  | 'Formal meetings'
  | 'Casual outings'
  | 'Friends meetups'
  | 'Parties'
  | 'Birthday celebrations'
  | 'Weddings and functions'
  | 'Festivals'
  | 'Dates'
  | 'Travel'
  | 'Sports and gym'
  | 'Other';

export interface OutfitCombination {
  id: string;
  user_id: string;
  title: string;
  tier: 'best_match' | 'stylish_alternative' | 'comfortable';
  occasion: Occasion | string;
  weather?: string | null;
  season?: string | null;
  top_item_id?: string | null;
  bottom_item_id?: string | null;
  outerwear_item_id?: string | null;
  footwear_item_id?: string | null;
  accessory_item_ids: string[];
  color_harmony_explanation: string;
  occasion_fit_explanation: string;
  shoes_fit_explanation: string;
  accessories_explanation: string;
  general_styling_tips?: string | null;
  missing_pieces_notes?: string | null;
  score: number;
  created_at: string;

  // Hydrated item references when fetched
  top_item?: WardrobeItem | null;
  bottom_item?: WardrobeItem | null;
  outerwear_item?: WardrobeItem | null;
  footwear_item?: WardrobeItem | null;
  accessory_items?: WardrobeItem[];
  preview_url?: string | null;
}

export interface SavedOutfit {
  id: string;
  user_id: string;
  outfit_id: string;
  custom_name?: string | null;
  notes?: string | null;
  created_at: string;
  outfit?: OutfitCombination;
}

export interface OutfitHistory {
  id: string;
  user_id: string;
  outfit_id: string;
  worn_date: string;
  occasion?: string | null;
  feedback_rating?: number | null;
  notes?: string | null;
  created_at: string;
  outfit?: OutfitCombination;
}

export interface PlannerEntry {
  id: string;
  user_id: string;
  planned_date: string;
  occasion: string;
  outfit_id?: string | null;
  is_worn: boolean;
  notes?: string | null;
  created_at: string;
  updated_at: string;
  outfit?: OutfitCombination | null;
}

export interface ShoppingRecommendation {
  id: string;
  user_id: string;
  item_name: string;
  category: ClothingCategory;
  subcategory: Subcategory;
  color: string;
  color_hex: string;
  matching_item_ids: string[];
  enabled_outfits_count: number;
  color_compatibility: string[];
  supported_occasions: string[];
  versatility_rating: 'High' | 'Very High' | 'Medium';
  verdict: 'Must Buy' | 'Strongly Recommended' | 'Optional Upgrade';
  reasoning: string;
  status: 'suggested' | 'purchased' | 'dismissed';
  created_at: string;
  matching_items?: WardrobeItem[];
}

export interface GeneratedPreview {
  id: string;
  user_id: string;
  outfit_id: string;
  image_url: string;
  storage_path: string;
  perspective: 'front' | 'side' | 'detail';
  model_settings: {
    gender: 'male' | 'female' | 'androgynous';
    ethnicity: 'diverse' | 'asian' | 'black' | 'caucasian' | 'hispanic';
    bodyType: 'regular' | 'athletic' | 'slim' | 'plus';
  };
  color_variant: string;
  prompt_used?: string | null;
  is_virtual_tryon: boolean;
  created_at: string;
}

export interface UserProfile {
  id: string;
  full_name?: string | null;
  avatar_url?: string | null;
  gender_preference: 'menswear' | 'womenswear' | 'unisex';
  preferred_style: string[];
  default_model_appearance: {
    gender: 'male' | 'female' | 'androgynous';
    ethnicity: 'diverse' | 'asian' | 'black' | 'caucasian' | 'hispanic';
    bodyType: 'regular' | 'athletic' | 'slim' | 'plus';
  };
  tryon_consent: boolean;
  tryon_photo_path?: string | null;
  created_at: string;
  updated_at: string;
}

export interface CheckBeforeBuyingResult {
  recognized_item: {
    name: string;
    category: ClothingCategory;
    subcategory: Subcategory;
    primary_color: string;
    primary_color_hex: string;
    secondary_colors: ColorInfo[];
    pattern: ClothingPattern;
    style: ClothingStyle;
    confidence_score: number;
  };
  matches_existing_clothes: boolean;
  enabled_outfits_count: number;
  matching_items: WardrobeItem[];
  is_duplicate: boolean;
  duplicate_item?: WardrobeItem | null;
  verdict: 'Buy' | 'Consider Alternative' | 'Do Not Buy';
  verdict_reasoning: string;
  potential_combinations: Array<{
    title: string;
    occasion: string;
    items: WardrobeItem[];
    why_it_works: string;
  }>;
}

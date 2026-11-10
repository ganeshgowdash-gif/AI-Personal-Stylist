export type WardrobeCategory = 'shirt' | 'pants' | 'shoes';

export type BodyShape = 'small' | 'medium' | 'large';

export type ClothingPattern = 
  | 'solid' 
  | 'striped' 
  | 'checked' 
  | 'graphic' 
  | 'floral' 
  | 'printed' 
  | 'textured' 
  | 'other';

export type ClothingStyle = 
  | 'formal' 
  | 'casual' 
  | 'smart-casual' 
  | 'sporty' 
  | 'party' 
  | 'traditional';

export type ShirtType = 
  | 'formal shirt' 
  | 'casual shirt' 
  | 't-shirt' 
  | 'polo t-shirt' 
  | 'oversized shirt' 
  | 'printed shirt' 
  | 'other';

export type PantsType = 
  | 'jeans' 
  | 'chinos' 
  | 'formal trousers' 
  | 'joggers' 
  | 'shorts' 
  | 'cargo pants' 
  | 'other';

export type ShoeType = 
  | 'sneakers' 
  | 'formal shoes' 
  | 'loafers' 
  | 'boots' 
  | 'sandals' 
  | 'running shoes' 
  | 'other';

export interface ColorInfo {
  name: string;
  hex: string;
}

export interface WardrobeItem {
  id: string;
  user_id: string;
  category: WardrobeCategory;
  name?: string | null;
  item_type: string; // ShirtType | PantsType | ShoeType
  primary_color: string;
  primary_color_hex: string;
  secondary_color?: string | null;
  secondary_color_hex?: string | null;
  pattern: ClothingPattern;
  style: ClothingStyle;
  
  // Photos
  front_photo_url: string; // Required for all
  front_storage_path: string;
  back_photo_url?: string | null; // Optional for shirts & pants
  back_storage_path?: string | null;
  side_photo_url?: string | null; // For shoes
  side_storage_path?: string | null;
  
  brand?: string | null;
  notes?: string | null;
  is_favorite: boolean;
  times_worn: number;
  confidence_score?: number;
  created_at: string;
  updated_at: string;
}

export interface UserProfile {
  id: string;
  full_name?: string | null;
  email?: string | null;
  mobile_number?: string | null;
  body_shape: BodyShape; // small | medium | large
  has_selected_body_shape: boolean;
  created_at: string;
  updated_at: string;
}

export interface OutfitCombination {
  id: string;
  user_id: string;
  shirt_id: string;
  pants_id: string;
  shoes_id: string;
  title: string;
  occasion: string;
  why_they_match: string;
  color_compatibility: string;
  occasion_suitability: string;
  style_description: string;
  score: number;
  is_favorite?: boolean;
  created_at: string;

  // Hydrated items
  shirt?: WardrobeItem | null;
  pants?: WardrobeItem | null;
  shoes?: WardrobeItem | null;
}

export interface SavedOutfit {
  id: string;
  user_id: string;
  shirt_id: string;
  pants_id: string;
  shoes_id: string;
  name: string;
  notes?: string | null;
  created_at: string;
  shirt?: WardrobeItem | null;
  pants?: WardrobeItem | null;
  shoes?: WardrobeItem | null;
}

export interface OutfitHistory {
  id: string;
  user_id: string;
  shirt_id: string;
  pants_id: string;
  shoes_id: string;
  worn_date: string;
  occasion?: string | null;
  notes?: string | null;
  created_at: string;
}

export interface ShoppingRecommendation {
  id: string;
  user_id: string;
  category: WardrobeCategory;
  item_name: string;
  color: string;
  color_hex: string;
  why_useful: string;
  matching_items_count: number;
  new_combinations_count: number;
  is_versatile: boolean;
  supported_occasions: string[];
}

# AI Personal Stylist – Smart Wardrobe & Fashion Assistant

A production-ready, full-stack AI wardrobe curator, outfit recommendation engine, virtual model preview, and smart shopping assistant.

Built with **Next.js (App Router)**, **TypeScript**, **Tailwind CSS**, **Supabase (PostgreSQL with Row Level Security & Storage)**, **Claude 3.5 Sonnet Vision AI**, and **Photorealistic Neural Image Generation**.

---

## 🌟 Key Features

### 1. AI Clothing Recognition
- Upload any photo of clothing or accessories (Shirts, Jeans, Chinos, Jackets, Sneakers, Watches, Sunglasses).
- Vision model analyzes the image and returns structured data:
  - Category and subcategory
  - Primary color and secondary colors (name + hex code)
  - Pattern / print (solid, striped, checked, graphic, etc.)
  - Style (formal, casual, sporty, smart-casual, etc.)
  - Fit (slim, regular, oversized)
  - Suggested season & AI confidence score
- **Editable Confirmation Form**: Users can inspect and adjust any classification before saving to the database.

### 2. Digital Wardrobe (PostgreSQL with RLS)
- Complete database tracking with fields: Unique ID, original photo stored in Supabase Storage (`wardrobe-originals`), name, category, colours, pattern, style, brand, season, personal notes, favorite flag, and wear counters.
- Add, edit, delete, search, filter (category, color, style, season), and sort (newest, times worn, favorite).
- Data and images persist across sessions. Original uploads and AI previews are strictly kept in separate storage buckets.

### 3. Fashion Recommendation Engine ("Suggest My Outfit")
- **Occasion-First Wizard**: Prompts for the occasion if not provided (College, School, Office, Formal meetings, Casual outings, Friends meetups, Parties, Birthday celebrations, Weddings and functions, Festivals, Dates, Travel, Sports and gym, Other).
- Optional preferences: Weather, season, preferred color, comfort priority, dress code, time of day.
- **Strict Server-Side Validation**: Analyzes *only* the user's authentic wardrobe items by ID. Never invents clothes.
- **Three Outfit Tiers**:
  - **Outfit 1 – Best Match**: Optimum balance of elegance and dress code.
  - **Outfit 2 – Stylish Alternative**: Creative contrast and contemporary silhouettes.
  - **Outfit 3 – Simple and Comfortable**: High mobility and relaxed drape.
- Comprehensive rationale: Why colors match, why it fits the occasion, why shoes work, and finishing accessories.
- **Honest Gap Notification**: Clearly alerts the user if essential pieces are missing instead of hallucinating.

### 4. Virtual Outfit Preview & Personal Try-On
- Photorealistic neural human model rendering reflecting the user's actual garments.
- **Model Appearance Switcher**:
  - Gender: Male, Female, Androgynous
  - Ethnicity: Diverse, East Asian, Black African-descent, Caucasian, Hispanic Latino
  - Build: Regular, Athletic, Slim, Plus
- **Multi-Perspective & Color Variants**: Front view, 3/4 side profile, detail perspective, and tonal color variants.
- **Side-by-Side Comparison**: Compare Outfit 1, Outfit 2, and Outfit 3 simultaneously.
- **Private Virtual Try-On**: Optional full-body photo upload with an explicit consent checkbox and instant photo deletion capability.
- Clear label: *"AI-generated preview, not an exact fit simulation"*.

### 5. Smart Shopping Assistant
- Audits wardrobe for missing staple categories, neutral colors, footwear, and accessories.
- For every recommendation:
  - Matching items count & list with image references
  - Enabled outfit combinations multiplier
  - Color compatibility tags & supported occasions
  - Versatility rating ('High', 'Very High', 'Medium')
  - "Worth buying?" verdict with reasoning.

### 6. Check Before Buying (In-Store Shopping Companion)
- Snap a photo of any shirt, pant, shoe, or jacket while shopping in a store.
- AI recognizes the garment and checks against your wardrobe:
  1. *Does this match my existing clothes?*
  2. *How many outfits can I create with it?*
  3. *Which exact items in my wardrobe match it?*
  4. *Is this a duplicate of something I already own?*
  5. *Buy or Don't-Buy verdict with potential visual outfit pairings.*

### 7. Complete Wardrobe Outfit Planner
- Calendar-based weekly & monthly planner.
- Schedule outfits for college, office, or events.
- **Repeat Prevention Warning**: Warns if an outfit was worn within the last 7 days.
- Mark outfits as worn to increment wear frequency counters and log to outfit history.

### 8. AI Fashion Chat Concierge
- Conversational fashion assistant powered by real user wardrobe data.
- Answers queries like:
  - *"What should I wear to college tomorrow?"*
  - *"Does my black shirt match my beige chinos?"*
  - *"Suggest a formal outfit for an interview."*
  - *"Give me 5 outfits using my white sneakers."*
- **Inline Wardrobe Cards**: Displays interactive clothing cards right inside the chat replies!

---

## 🛠 Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS (Haute Couture Luxury Theme)
- **Icons**: Lucide React
- **Animations**: Framer Motion
- **Database**: Supabase (PostgreSQL with Row Level Security)
- **Storage**: Supabase Storage (`wardrobe-originals`, `outfit-previews`, `user-tryon`)
- **AI Models**:
  - **Claude 3.5 Sonnet** (Anthropic SDK) for Vision Recognition & Fashion Logic
  - **Photorealistic Neural Image Generator** (Flux / Pollinations / DALL-E) for Virtual Model Previews

---

## 🚀 Getting Started

### 1. Prerequisites
- Node.js 18+ (tested on Node v20/v24)
- npm or pnpm
- A Supabase account (free tier works great)
- An Anthropic Claude API Key (optional for live AI vision; offline intelligent heuristics are included)

### 2. Installation
```bash
git clone <repository-url>
cd "good outfit"
npm install
```

### 3. Environment Variables
Create a `.env.local` file in the root directory:
```bash
cp .env.example .env.local
```

Fill in your credentials:
```env
# Supabase Configuration (Get from Supabase Dashboard -> Settings -> API)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key

# AI Vision & Styling Configuration (Claude 3.5 Sonnet)
ANTHROPIC_API_KEY=sk-ant-api03-...

# Optional: Dedicated Image Generation Key (OpenAI DALL-E 3)
OPENAI_API_KEY=

# App URL
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 4. Supabase Database & Storage Setup
1. In your Supabase Dashboard, open the **SQL Editor**.
2. Open [`supabase/schema.sql`](file:///c:/Users/user/Downloads/good%20outfit/supabase/schema.sql) from this repository.
3. Paste the entire SQL script and run it. This will automatically:
   - Create all tables (`profiles`, `wardrobe_items`, `clothing_categories`, `outfit_combinations`, `saved_outfits`, `outfit_history`, `planner_entries`, `shopping_recommendations`, `generated_previews`).
   - Create storage buckets: `wardrobe-originals`, `outfit-previews`, and `user-tryon`.
   - Configure Row Level Security (RLS) policies ensuring users can only read, insert, update, or delete their own data.
   - Set up the automatic profile creation trigger on signup.

### 5. Run Development Server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📂 Project Structure

```
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── chat/route.ts                     # AI Fashion Chat API
│   │   │   ├── preview/generate/route.ts         # Realistic Model Preview API
│   │   │   ├── shopping/check-before-buying/     # In-Store Photo Checker API
│   │   │   ├── stylist/suggest/route.ts          # Outfit Recommendations Engine
│   │   │   └── vision/recognize/route.ts         # Claude Vision Clothing Classifier
│   │   ├── chat/page.tsx                         # AI Fashion Assistant Screen
│   │   ├── planner/page.tsx                      # Complete Outfit Planner Screen
│   │   ├── settings/page.tsx                     # Profile & Settings Screen
│   │   ├── shopping/page.tsx                     # Smart Shopping & Check Before Buying Screen
│   │   ├── suggestions/page.tsx                  # AI Outfit Suggestions (3 Tiers) Screen
│   │   ├── try-on/page.tsx                       # Virtual Try-On Studio Screen
│   │   ├── wardrobe/page.tsx                     # Digital Wardrobe Screen
│   │   ├── globals.css                           # Luxury Dark Theme & Styling
│   │   ├── layout.tsx                            # App Root Layout
│   │   └── page.tsx                              # Dashboard Screen
│   ├── components/
│   │   ├── chat/InlineItemCard.tsx               # Inline Wardrobe Card for Chat
│   │   ├── layout/                               # AppShell, Navbar, Sidebar
│   │   ├── modals/
│   │   │   ├── CheckBeforeBuyingModal.tsx        # In-Store Store Item Scanner
│   │   │   ├── ItemDetailModal.tsx               # Edit & Inspect Garment Modal
│   │   │   ├── OccasionSelectorModal.tsx         # Occasion & Preferences Selector
│   │   │   ├── UploadClothingModal.tsx           # AI Vision Garment Upload Modal
│   │   │   └── VirtualPreviewModal.tsx           # Model Appearance & Try-On Studio
│   │   ├── outfit/OutfitCard.tsx                 # 3-Tier Outfit Card with Explanations
│   │   ├── planner/CalendarView.tsx              # Interactive Week/Month Planner
│   │   └── wardrobe/ClothingCard.tsx             # Interactive Garment Card
│   ├── context/WardrobeContext.tsx               # Unified State Management & Supabase Sync
│   ├── lib/
│   │   ├── ai/
│   │   │   ├── chat-agent.ts                     # Wardrobe Chat Engine
│   │   │   ├── claude-vision.ts                  # Claude Vision Clothing Recognition
│   │   │   ├── image-generator.ts                # Photorealistic Preview Generator
│   │   │   ├── shopping-analyzer.ts              # Wardrobe Gap & Store Checker
│   │   │   └── styling-engine.ts                 # Rules & AI Styling Logic
│   │   ├── supabase/                             # Client, Server, Storage Handlers
│   │   ├── seed-data.ts                          # Starter Wardrobe Collection
│   │   └── utils.ts                              # Styling & Utility Helpers
│   └── types/database.ts                         # Complete TypeScript Types
├── supabase/
│   └── schema.sql                                # Full PostgreSQL Migration & RLS Script
├── .env.example
├── package.json
├── tailwind.config.ts
└── tsconfig.json
```

---

## 🔒 Security & AI Non-Negotiable Rules

1. **Strict Wardrobe Verification**: The AI recommendation engine strictly verifies every garment ID against the user's authentic database items. It never invents or pretends clothing exists.
2. **User Data Isolation**: PostgreSQL Row Level Security (RLS) ensures each user can strictly access only their own clothes, outfits, calendar schedules, and shopping recommendations (`auth.uid() = user_id`).
3. **Occasion First**: The styling engine strictly requires an occasion before generating outfits.
4. **Separate Storage Buckets**: Original photos are stored in `wardrobe-originals`, AI model previews in `outfit-previews`, and personal try-on photos in `user-tryon` with explicit consent and instant delete controls.
5. **Transparency**: Every preview is labeled *"AI-generated preview, not an exact fit simulation"*.


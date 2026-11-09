import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(dateString: string): string {
  try {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    }).format(date);
  } catch {
    return dateString;
  }
}

export function getOccasionColor(occasion: string): string {
  switch (occasion?.toLowerCase()) {
    case 'college':
    case 'school':
      return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
    case 'office':
    case 'formal meetings':
      return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
    case 'parties':
    case 'birthday celebrations':
      return 'bg-purple-500/10 text-purple-400 border-purple-500/20';
    case 'weddings and functions':
    case 'festivals':
      return 'bg-rose-500/10 text-rose-400 border-rose-500/20';
    case 'dates':
      return 'bg-pink-500/10 text-pink-400 border-pink-500/20';
    case 'sports and gym':
      return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
    default:
      return 'bg-luxury-800 text-luxury-300 border-luxury-700';
  }
}

export const POPULAR_COLORS = [
  { name: 'Black', hex: '#000000' },
  { name: 'White', hex: '#FFFFFF' },
  { name: 'Navy Blue', hex: '#000080' },
  { name: 'Beige', hex: '#F5F5DC' },
  { name: 'Gray', hex: '#808080' },
  { name: 'Brown', hex: '#8B4513' },
  { name: 'Olive Green', hex: '#556B2F' },
  { name: 'Burgundy', hex: '#800020' },
  { name: 'Charcoal', hex: '#36454F' },
  { name: 'Sky Blue', hex: '#87CEEB' },
  { name: 'Cream', hex: '#FFFDD0' },
  { name: 'Khaki', hex: '#C3B091' },
];

export const ALL_OCCASIONS = [
  'College',
  'School',
  'Office',
  'Formal meetings',
  'Casual outings',
  'Friends meetups',
  'Parties',
  'Birthday celebrations',
  'Weddings and functions',
  'Festivals',
  'Dates',
  'Travel',
  'Sports and gym',
  'Other'
] as const;


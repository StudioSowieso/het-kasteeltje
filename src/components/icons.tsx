import {
  Bath,
  Bed,
  Droplets,
  Flower2,
  Shirt,
  Sofa,
  Sparkles,
  Trash2,
  Trees,
  Utensils,
  Wind,
  type LucideIcon,
} from "lucide-react";

export const ICONS: Record<string, LucideIcon> = {
  sparkles: Sparkles,
  wind: Wind,
  bath: Bath,
  shirt: Shirt,
  utensils: Utensils,
  trees: Trees,
  bed: Bed,
  sofa: Sofa,
  droplets: Droplets,
  flower: Flower2,
  trash: Trash2,
};

export function CategoryIcon({ name, size = 20 }: { name: string; size?: number }) {
  const Icon = ICONS[name] ?? Sparkles;
  return <Icon size={size} aria-hidden="true" />;
}

export const PALETTE = ["#F9DB6D", "#F4B8DC", "#A8BC82", "#B8C4F0", "#F28B82", "#A9DDD3", "#F8C9A0"];
export const EMOJIS = ["🙂", "😎", "🧑‍🍳", "🦊", "🐻", "🐸", "🦄", "🐙", "🌻", "🚀", "🧙", "👑"];

import { ImageResponse } from "next/og";
import { CastleIcon } from "@/lib/castle-icon";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

// iOS-beginscherm: volledig vierkant, iOS rondt de hoeken zelf af.
export default function AppleIcon() {
  return new ImageResponse(<CastleIcon size={180} />, { ...size });
}

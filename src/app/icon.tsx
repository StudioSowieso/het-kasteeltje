import { ImageResponse } from "next/og";
import { CastleIcon } from "@/lib/castle-icon";

export const size = { width: 512, height: 512 };
export const contentType = "image/png";

// Favicon en Android/Chrome-icoon.
export default function Icon() {
  return new ImageResponse(<CastleIcon size={512} />, { ...size });
}

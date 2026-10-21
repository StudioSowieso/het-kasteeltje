/** Het kasteeltje-icoon: gele achtergrond, roze cirkel, zwart kasteel. Gebruikt door icon.tsx en apple-icon.tsx. */
export function CastleIcon({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <rect width="100" height="100" fill="#F9DB6D" />
      <circle cx="50" cy="52" r="40" fill="#F4B8DC" />
      {/* torens */}
      <rect x="17" y="30" width="20" height="52" fill="#14110F" />
      <rect x="63" y="30" width="20" height="52" fill="#14110F" />
      {/* muur */}
      <rect x="30" y="46" width="40" height="36" fill="#14110F" />
      {/* kantelen */}
      <rect x="17" y="22" width="6" height="10" fill="#14110F" />
      <rect x="25.5" y="22" width="6" height="10" fill="#14110F" />
      <rect x="31" y="22" width="6" height="10" fill="#14110F" />
      <rect x="63" y="22" width="6" height="10" fill="#14110F" />
      <rect x="71.5" y="22" width="6" height="10" fill="#14110F" />
      <rect x="77" y="22" width="6" height="10" fill="#14110F" />
      <rect x="40" y="39" width="6" height="9" fill="#14110F" />
      <rect x="54" y="39" width="6" height="9" fill="#14110F" />
      {/* poort */}
      <path d="M42 82 V66 a8 8 0 0 1 16 0 V82 Z" fill="#F9DB6D" />
      {/* raampjes */}
      <rect x="24" y="42" width="6" height="9" rx="3" fill="#F9DB6D" />
      <rect x="70" y="42" width="6" height="9" rx="3" fill="#F9DB6D" />
    </svg>
  );
}

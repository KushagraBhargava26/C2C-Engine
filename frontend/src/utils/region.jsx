import getUnicodeFlagIcon from "country-flag-icons/unicode";
import * as Flags from "country-flag-icons/react/3x2";

// Returns a React component (an actual SVG flag image), not text/emoji —
// works identically on every OS, unlike emoji flags which Windows doesn't render.
export function FlagIcon({ regionCode, className = "inline-block h-4 w-6" }) {
  const Flag = Flags[regionCode?.toUpperCase()];
  if (!Flag) return <span className={className}>🏳</span>;
  return <Flag className={className} title={regionCode} />;
}
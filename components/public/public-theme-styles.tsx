import type { PublicThemeColors } from "@/lib/api/public-site-shell";

type PublicThemeStylesProps = {
  themeColors: PublicThemeColors | null;
};

function cssVar(value: string | null | undefined, fallback: string) {
  return value?.trim() || fallback;
}

export function PublicThemeStyles({ themeColors }: PublicThemeStylesProps) {
  const primary = cssVar(themeColors?.primaryColor, "oklch(0.279 0.041 260.031)");
  const secondary = cssVar(
    themeColors?.secondaryColor,
    "oklch(0.968 0.007 247.896)",
  );
  const button = cssVar(themeColors?.buttonColor, primary);
  const header = cssVar(themeColors?.headerColor, "oklch(1 0 0)");
  const footer = cssVar(themeColors?.footerColor, "oklch(0.984 0.003 247.858)");

  return (
    <style>{`
      .public-site {
        --public-primary: ${primary};
        --public-secondary: ${secondary};
        --public-button: ${button};
        --public-header: ${header};
        --public-footer: ${footer};
      }
    `}</style>
  );
}

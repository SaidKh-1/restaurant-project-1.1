export type ThemePresetKey =
  | "ocean-blue"
  | "navy-dark"
  | "emerald"
  | "sunset"
  | "luxury-dark"
  | "golden"
  | "ramadan"
  | "eid-al-fitr"
  | "eid-al-adha";

export type ThemeColorSet = {
  primaryColor: string;
  secondaryColor: string;
  buttonColor: string;
  headerColor: string;
  footerColor: string;
  backgroundColor: string;
  textColor: string;
};

export type ThemePresetDefinition = {
  key: ThemePresetKey;
  label: string;
  description: string;
  seasonalGreeting?: {
    ar: string;
    en: string;
  };
  colors: ThemeColorSet;
};

export const THEME_PRESETS: ThemePresetDefinition[] = [
  {
    key: "ocean-blue",
    label: "Ocean Blue",
    description: "أزرق بحري منعش للمطاعم البحرية.",
    colors: {
      primaryColor: "#0f766e",
      secondaryColor: "#e0f2fe",
      buttonColor: "#0284c7",
      headerColor: "#ffffff",
      footerColor: "#0f172a",
      backgroundColor: "#f8fafc",
      textColor: "#0f172a",
    },
  },
  {
    key: "navy-dark",
    label: "Navy Dark",
    description: "مظهر داكن أنيق مع لمسات بحرية.",
    colors: {
      primaryColor: "#38bdf8",
      secondaryColor: "#1e293b",
      buttonColor: "#0ea5e9",
      headerColor: "#020617",
      footerColor: "#0f172a",
      backgroundColor: "#0b1220",
      textColor: "#f8fafc",
    },
  },
  {
    key: "emerald",
    label: "Emerald",
    description: "أخضر زمردي هادئ ونظيف.",
    colors: {
      primaryColor: "#047857",
      secondaryColor: "#d1fae5",
      buttonColor: "#059669",
      headerColor: "#ffffff",
      footerColor: "#064e3b",
      backgroundColor: "#f0fdf4",
      textColor: "#14532d",
    },
  },
  {
    key: "sunset",
    label: "Sunset",
    description: "دفء غروب الشمس مع لمسة برتقالية.",
    colors: {
      primaryColor: "#ea580c",
      secondaryColor: "#ffedd5",
      buttonColor: "#f97316",
      headerColor: "#fff7ed",
      footerColor: "#7c2d12",
      backgroundColor: "#fff7ed",
      textColor: "#431407",
    },
  },
  {
    key: "luxury-dark",
    label: "Luxury Dark",
    description: "فخامة داكنة مع لمسات ذهبية.",
    colors: {
      primaryColor: "#d4af37",
      secondaryColor: "#1c1917",
      buttonColor: "#ca8a04",
      headerColor: "#0c0a09",
      footerColor: "#1c1917",
      backgroundColor: "#111111",
      textColor: "#fafaf9",
    },
  },
  {
    key: "golden",
    label: "Golden",
    description: "ذهبي دافئ مع خلفية فاتحة.",
    colors: {
      primaryColor: "#b45309",
      secondaryColor: "#fef3c7",
      buttonColor: "#d97706",
      headerColor: "#fffbeb",
      footerColor: "#78350f",
      backgroundColor: "#fffbeb",
      textColor: "#451a03",
    },
  },
  {
    key: "ramadan",
    label: "Ramadan",
    description: "ألوان هادئة مناسبة لرمضان.",
    seasonalGreeting: {
      ar: "رمضان كريم",
      en: "Ramadan Kareem",
    },
    colors: {
      primaryColor: "#7c3aed",
      secondaryColor: "#ede9fe",
      buttonColor: "#6d28d9",
      headerColor: "#1e1b4b",
      footerColor: "#312e81",
      backgroundColor: "#f5f3ff",
      textColor: "#1e1b4b",
    },
  },
  {
    key: "eid-al-fitr",
    label: "Eid Al-Fitr",
    description: "ألوان احتفالية لعيد الفطر.",
    seasonalGreeting: {
      ar: "عيد فطر مبارك",
      en: "Eid Al-Fitr Mubarak",
    },
    colors: {
      primaryColor: "#16a34a",
      secondaryColor: "#dcfce7",
      buttonColor: "#22c55e",
      headerColor: "#ffffff",
      footerColor: "#14532d",
      backgroundColor: "#f0fdf4",
      textColor: "#14532d",
    },
  },
  {
    key: "eid-al-adha",
    label: "Eid Al-Adha",
    description: "ألوان دافئة لعيد الأضحى.",
    seasonalGreeting: {
      ar: "عيد أضحى مبارك",
      en: "Eid Al-Adha Mubarak",
    },
    colors: {
      primaryColor: "#be123c",
      secondaryColor: "#ffe4e6",
      buttonColor: "#e11d48",
      headerColor: "#fff1f2",
      footerColor: "#881337",
      backgroundColor: "#fff1f2",
      textColor: "#881337",
    },
  },
];

export function getThemePreset(key: string) {
  return THEME_PRESETS.find((preset) => preset.key === key) ?? null;
}

export function detectActiveThemePreset(colors: {
  primaryColor: string | null;
  secondaryColor: string | null;
  buttonColor: string | null;
  headerColor: string | null;
  footerColor: string | null;
}): ThemePresetKey | "custom" | null {
  const normalized = {
    primaryColor: colors.primaryColor?.toLowerCase() ?? null,
    secondaryColor: colors.secondaryColor?.toLowerCase() ?? null,
    buttonColor: colors.buttonColor?.toLowerCase() ?? null,
    headerColor: colors.headerColor?.toLowerCase() ?? null,
    footerColor: colors.footerColor?.toLowerCase() ?? null,
  };

  if (
    !normalized.primaryColor &&
    !normalized.secondaryColor &&
    !normalized.buttonColor &&
    !normalized.headerColor &&
    !normalized.footerColor
  ) {
    return null;
  }

  for (const preset of THEME_PRESETS) {
    const matches = (
      Object.keys(normalized) as Array<keyof typeof normalized>
    ).every((key) => normalized[key] === preset.colors[key].toLowerCase());

    if (matches) {
      return preset.key;
    }
  }

  return "custom";
}

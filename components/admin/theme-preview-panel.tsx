"use client";

import type { ThemeSettingsData } from "@/lib/admin/types";

type ThemePreviewPanelProps = {
  theme: Pick<
    ThemeSettingsData,
    "colors" | "coverImage" | "seasonalGreeting" | "restaurantName"
  >;
};

function cssColor(value: string | null | undefined, fallback: string) {
  return value?.trim() || fallback;
}

export function ThemePreviewPanel({ theme }: ThemePreviewPanelProps) {
  const colors = theme.colors;
  const primary = cssColor(colors.primaryColor, "#0f766e");
  const secondary = cssColor(colors.secondaryColor, "#e0f2fe");
  const button = cssColor(colors.buttonColor, primary);
  const header = cssColor(colors.headerColor, "#ffffff");
  const footer = cssColor(colors.footerColor, "#0f172a");
  const background = cssColor(colors.backgroundColor, secondary);
  const text = cssColor(colors.textColor, primary);

  return (
    <div className="overflow-hidden rounded-2xl border shadow-sm">
      <div
        className="border-b px-4 py-3"
        style={{ backgroundColor: header, color: text }}
      >
        <div className="flex items-center justify-between gap-3">
          <span className="text-sm font-semibold">
            {theme.restaurantName.ar ?? "معاينة المظهر"}
          </span>
          <span
            className="rounded-full px-3 py-1 text-xs font-medium text-white"
            style={{ backgroundColor: button }}
          >
            احجز الآن
          </span>
        </div>
      </div>

      {theme.seasonalGreeting.ar ? (
        <div
          className="px-4 py-2 text-center text-sm font-medium"
          style={{ backgroundColor: secondary, color: text }}
        >
          {theme.seasonalGreeting.ar}
        </div>
      ) : null}

      <div style={{ backgroundColor: background, color: text }}>
        <div className="relative aspect-[16/7] overflow-hidden bg-black/5">
          {theme.coverImage?.publicUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={theme.coverImage.publicUrl}
              alt={theme.coverImage.altText.ar ?? "Hero preview"}
              className="size-full object-cover"
            />
          ) : (
            <div
              className="flex size-full items-center justify-center text-sm"
              style={{ backgroundColor: secondary, color: text }}
            >
              صورة Hero / الغلاف
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
          <div className="absolute inset-x-0 bottom-0 space-y-2 p-4 text-white">
            <p className="text-xs text-white/80">الرئيسية</p>
            <h3 className="text-lg font-semibold">أطباق بحرية طازجة</h3>
            <button
              type="button"
              className="rounded-md px-3 py-1.5 text-xs font-medium text-white"
              style={{ backgroundColor: button }}
            >
              استكشف المنيو
            </button>
          </div>
        </div>

        <div className="space-y-3 px-4 py-4">
          <div
            className="rounded-xl p-3"
            style={{ backgroundColor: secondary, color: text }}
          >
            <p className="text-xs font-medium" style={{ color: primary }}>
              أطباق مميزة
            </p>
            <p className="mt-1 text-sm">معاينة قسم من الصفحة الرئيسية</p>
          </div>
        </div>
      </div>

      <div
        className="px-4 py-3 text-xs"
        style={{ backgroundColor: footer, color: "#ffffff" }}
      >
        تذييل الموقع
      </div>
    </div>
  );
}

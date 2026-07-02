"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  ChefHat,
  Fish,
  Mail,
  Megaphone,
  Settings,
  Star,
} from "lucide-react";

import { PageHeader } from "@/components/admin/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { adminGet } from "@/lib/admin/fetch-client";
import { useAdminFetchState } from "@/lib/admin/use-admin-fetch-state";
import type { DashboardSummaryData } from "@/lib/admin/types";
import { cn } from "@/lib/utils";

type DashboardStat = {
  label: string;
  value: number | string;
  hint: string;
  icon: React.ComponentType<{ className?: string }>;
  href?: string;
};

export function DashboardOverview() {
  const { isInitialLoading, isRefreshing, endLoad } = useAdminFetchState();
  const [stats, setStats] = useState<DashboardStat[]>([]);
  const [restaurantName, setRestaurantName] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadInitialData() {
      try {
        const data = await adminGet<DashboardSummaryData>(
          "/api/admin/dashboard-summary",
          { errorMessage: "تعذر تحميل لوحة التحكم." },
        );

        if (cancelled) {
          return;
        }

        setRestaurantName(data.restaurantName.ar ?? null);
        setStats([
          {
            label: "رسائل جديدة",
            value: data.stats.newMessages,
            hint: "بانتظار المراجعة",
            icon: Mail,
          },
          {
            label: "تقييمات معلقة",
            value: data.stats.pendingReviews,
            hint: "تحتاج موافقة",
            icon: Star,
          },
          {
            label: "العروض",
            value: data.stats.offers,
            hint: "إجمالي العروض",
            icon: Megaphone,
          },
          {
            label: "أصناف المنيو",
            value: data.stats.menuItems,
            hint: "جميع الأصناف",
            icon: Fish,
          },
        ]);
        endLoad(true);
      } catch {
        if (!cancelled) {
          endLoad(false);
        }
      }
    }

    void loadInitialData();

    return () => {
      cancelled = true;
    };
  }, [endLoad]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="لوحة التحكم"
        description={
          restaurantName
            ? `مرحباً بك في إدارة ${restaurantName}.`
            : "مرحباً بك في لوحة إدارة المطعم."
        }
        actions={
          <Button asChild variant="outline">
            <Link href="/admin/settings">
              <Settings className="size-4" />
              إعدادات الموقع
            </Link>
          </Button>
        }
      />

      <div
        className={cn(
          "grid gap-4 sm:grid-cols-2 xl:grid-cols-4",
          isRefreshing && "opacity-80 transition-opacity",
        )}
      >
        {isInitialLoading
          ? Array.from({ length: 4 }).map((_, index) => (
              <Card key={index}>
                <CardHeader>
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-8 w-16" />
                </CardHeader>
              </Card>
            ))
          : stats.map((stat) => {
              const Icon = stat.icon;

              return (
                <Card key={stat.label}>
                  <CardHeader className="flex flex-row items-start justify-between gap-3">
                    <div className="space-y-2">
                      <CardDescription>{stat.label}</CardDescription>
                      <CardTitle className="text-3xl">{stat.value}</CardTitle>
                    </div>
                    <div className="bg-muted rounded-lg p-2">
                      <Icon className="text-muted-foreground size-5" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground text-sm">{stat.hint}</p>
                  </CardContent>
                </Card>
              );
            })}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>الخطوات التالية</CardTitle>
            <CardDescription>
              ابدأ بإعداد بيانات المطعم قبل بناء بقية أقسام لوحة التحكم.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between gap-3 rounded-lg border p-3">
              <div className="flex items-center gap-3">
                <Settings className="text-muted-foreground size-4" />
                <span className="text-sm">تحديث إعدادات الموقع</span>
              </div>
              <Button asChild size="sm" variant="secondary">
                <Link href="/admin/settings">فتح</Link>
              </Button>
            </div>
            <div className="flex items-center justify-between gap-3 rounded-lg border p-3 opacity-70">
              <div className="flex items-center gap-3">
                <Fish className="text-muted-foreground size-4" />
                <span className="text-sm">إدارة المنيو</span>
              </div>
              <Badge variant="secondary">قريباً</Badge>
            </div>
            <div className="flex items-center justify-between gap-3 rounded-lg border p-3 opacity-70">
              <div className="flex items-center gap-3">
                <ChefHat className="text-muted-foreground size-4" />
                <span className="text-sm">إدارة الحجوزات</span>
              </div>
              <Badge variant="secondary">قريباً</Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>ملاحظات</CardTitle>
            <CardDescription>
              لوحة التحكم العربية جاهزة للتوسع تدريجياً.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            <p>
              تم ربط الصفحة الرئيسية وإعدادات الموقع بالـ APIs الحالية. بقية
              الأقسام ستُضاف في الخطوات القادمة.
            </p>
            <p>
              المحتوى العام يدعم العربية والإنجليزية، بينما واجهة الإدارة
              عربية-first.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

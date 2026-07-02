"use client";

import { useState } from "react";
import Link from "next/link";
import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { getHomepageSectionDefinition } from "@/lib/admin/homepage-sections";
import type { HomepageSectionData } from "@/lib/admin/types";

export type HomepageSectionFormValues = {
  isVisible: boolean;
  titleAr: string;
  subtitleAr: string;
  titleEn: string;
  subtitleEn: string;
};

type HomepageSectionFormDialogProps = {
  section: HomepageSectionData | null;
  open: boolean;
  formInstanceKey: number;
  canEdit: boolean;
  isSubmitting: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (values: HomepageSectionFormValues) => void;
};

export function mapHomepageSectionToFormValues(
  section: HomepageSectionData,
): HomepageSectionFormValues {
  return {
    isVisible: section.isVisible,
    titleAr: section.translations.ar?.title ?? "",
    subtitleAr: section.translations.ar?.subtitle ?? "",
    titleEn: section.translations.en?.title ?? "",
    subtitleEn: section.translations.en?.subtitle ?? "",
  };
}

export function buildHomepageSectionPayload(values: HomepageSectionFormValues) {
  return {
    isVisible: values.isVisible,
    translations: {
      ar: {
        title: values.titleAr.trim() || null,
        subtitle: values.subtitleAr.trim() || null,
      },
      en: {
        title: values.titleEn.trim() || null,
        subtitle: values.subtitleEn.trim() || null,
      },
    },
  };
}

export function HomepageSectionFormDialog({
  section,
  open,
  formInstanceKey,
  canEdit,
  isSubmitting,
  onOpenChange,
  onSubmit,
}: HomepageSectionFormDialogProps) {
  if (!section) {
    return null;
  }

  return (
    <HomepageSectionFormDialogContent
      key={`${section.id}-${formInstanceKey}`}
      section={section}
      open={open}
      canEdit={canEdit}
      isSubmitting={isSubmitting}
      onOpenChange={onOpenChange}
      onSubmit={onSubmit}
    />
  );
}

function HomepageSectionFormDialogContent({
  section,
  open,
  canEdit,
  isSubmitting,
  onOpenChange,
  onSubmit,
}: Omit<HomepageSectionFormDialogProps, "formInstanceKey"> & {
  section: HomepageSectionData;
}) {
  const [values, setValues] = useState(() =>
    mapHomepageSectionToFormValues(section),
  );

  const definition = getHomepageSectionDefinition(section.sectionKey);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92vh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>تعديل قسم الصفحة الرئيسية</DialogTitle>
          <DialogDescription>
            {definition?.description ??
              "تحكم في عنوان القسم ووصفه وإظهاره على الصفحة الرئيسية."}
          </DialogDescription>
        </DialogHeader>

        <form
          className="space-y-6"
          onSubmit={(event) => {
            event.preventDefault();
            onSubmit(values);
          }}
        >
          <div className="flex items-center justify-between rounded-lg border p-4">
            <div className="space-y-1">
              <Label htmlFor="homepage-section-visible">إظهار القسم</Label>
              <p className="text-muted-foreground text-sm">
                إخفاء القسم يمنع ظهوره على الصفحة الرئيسية.
              </p>
            </div>
            <Switch
              id="homepage-section-visible"
              checked={values.isVisible}
              disabled={!canEdit || isSubmitting}
              onCheckedChange={(checked) =>
                setValues((current) => ({ ...current, isVisible: checked }))
              }
            />
          </div>

          <div className="space-y-4 rounded-lg border p-4">
            <p className="text-sm font-medium">العربية (أساسي)</p>
            <div className="space-y-2">
              <Label htmlFor="homepage-title-ar">العنوان</Label>
              <Input
                id="homepage-title-ar"
                value={values.titleAr}
                disabled={!canEdit || isSubmitting}
                onChange={(event) =>
                  setValues((current) => ({
                    ...current,
                    titleAr: event.target.value,
                  }))
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="homepage-subtitle-ar">العنوان الفرعي</Label>
              <Input
                id="homepage-subtitle-ar"
                value={values.subtitleAr}
                disabled={!canEdit || isSubmitting}
                onChange={(event) =>
                  setValues((current) => ({
                    ...current,
                    subtitleAr: event.target.value,
                  }))
                }
              />
            </div>
          </div>

          <div className="space-y-4 rounded-lg border p-4">
            <p className="text-sm font-medium">English (optional)</p>
            <div className="space-y-2">
              <Label htmlFor="homepage-title-en">Title</Label>
              <Input
                id="homepage-title-en"
                dir="ltr"
                value={values.titleEn}
                disabled={!canEdit || isSubmitting}
                onChange={(event) =>
                  setValues((current) => ({
                    ...current,
                    titleEn: event.target.value,
                  }))
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="homepage-subtitle-en">Subtitle</Label>
              <Input
                id="homepage-subtitle-en"
                dir="ltr"
                value={values.subtitleEn}
                disabled={!canEdit || isSubmitting}
                onChange={(event) =>
                  setValues((current) => ({
                    ...current,
                    subtitleEn: event.target.value,
                  }))
                }
              />
            </div>
          </div>

          {definition?.managedElsewhereHref ? (
            <div className="rounded-lg border border-dashed bg-muted/30 p-4 text-sm">
              <p className="text-muted-foreground">
                محتوى هذا القسم يُدار من صفحة أخرى.
              </p>
              <Button
                type="button"
                variant="link"
                className="h-auto px-0"
                asChild
              >
                <Link href={definition.managedElsewhereHref}>
                  {definition.managedElsewhereLabel}
                </Link>
              </Button>
            </div>
          ) : null}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              إلغاء
            </Button>
            {canEdit ? (
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : null}
                حفظ
              </Button>
            ) : null}
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

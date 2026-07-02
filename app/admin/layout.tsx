import type { Metadata } from "next";
import { Toaster } from "sonner";

export const metadata: Metadata = {
  title: {
    default: "لوحة الإدارة",
    template: "%s | لوحة الإدارة",
  },
  description: "لوحة إدارة المطعم CMS",
  robots: {
    index: false,
    follow: false,
  },
};

export default function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div dir="rtl" lang="ar" className="min-h-screen">
      {children}
      <Toaster position="top-center" richColors closeButton />
    </div>
  );
}

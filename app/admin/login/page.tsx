import { Suspense } from "react";
import { Fish } from "lucide-react";

import { LoginForm } from "./login-form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function AdminLoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-muted/40 p-4">
      <Card className="w-full max-w-md shadow-md">
        <CardHeader className="space-y-3 text-center">
          <div className="bg-primary text-primary-foreground mx-auto flex size-12 items-center justify-center rounded-xl">
            <Fish className="size-6" />
          </div>
          <CardTitle className="text-2xl">تسجيل الدخول</CardTitle>
          <CardDescription>
            لوحة إدارة المطعم — الدخول للمستخدمين المصرح لهم فقط.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Suspense fallback={null}>
            <LoginForm />
          </Suspense>
        </CardContent>
      </Card>
    </main>
  );
}

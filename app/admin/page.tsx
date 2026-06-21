import { isAdmin } from "@/lib/auth";
import { redirect } from "next/navigation";
import { LoginForm } from "./LoginForm";

export const dynamic = "force-dynamic";

export default async function AdminLoginPage() {
  if (await isAdmin()) {
    redirect("/admin/dashboard");
  }

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-brand-panel px-4">
      <div className="grid-bg pointer-events-none fixed inset-0" />
      <LoginForm />
    </main>
  );
}

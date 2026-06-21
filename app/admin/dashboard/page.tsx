import type { Metadata } from "next";
import { isAdmin } from "@/lib/auth";
import { readSettings } from "@/lib/store";
import { redirect } from "next/navigation";
import { AdminDashboard } from "./AdminDashboard";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const settings = await readSettings();

  return {
    title: `${settings.siteName} 后台管理`,
    description: settings.subtitle
  };
}

export default async function AdminDashboardPage() {
  if (!(await isAdmin())) {
    redirect("/admin");
  }

  return <AdminDashboard />;
}

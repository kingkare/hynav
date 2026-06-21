import { isAdmin } from "@/lib/auth";
import { redirect } from "next/navigation";
import { AdminDashboard } from "./AdminDashboard";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  if (!(await isAdmin())) {
    redirect("/admin");
  }

  return <AdminDashboard />;
}

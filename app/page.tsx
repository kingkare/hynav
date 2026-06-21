import type { Metadata } from "next";
import { PublicNav } from "@/components/PublicNav";
import { readPublicCategories, readSettings } from "@/lib/store";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const settings = await readSettings();

  return {
    title: settings.siteName,
    description: settings.subtitle
  };
}

export default async function Home() {
  const categories = await readPublicCategories();
  const settings = await readSettings();
  return <PublicNav categories={categories} settings={settings} />;
}

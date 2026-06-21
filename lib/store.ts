import { randomUUID } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

export type NavLink = {
  id: string;
  categoryId: string;
  titleZh: string;
  titleEn: string | null;
  descZh: string | null;
  descEn: string | null;
  href: string;
  icon: string;
  color: string;
  sort: number;
  visible: boolean;
};

export type Category = {
  id: string;
  key: string;
  nameZh: string;
  nameEn: string | null;
  accent: string;
  sort: number;
  visible: boolean;
  links: NavLink[];
};

const dataDir = path.join(process.cwd(), "data");
const dataFile = path.join(dataDir, "navigation.json");
const settingsFile = path.join(dataDir, "settings.json");

export type SiteSettings = {
  siteName: string;
  welcomeText: string;
  subtitle: string;
  primaryButtonText: string;
  repoButtonText: string;
  repoUrl: string;
  communityCardTitle: string;
  communityCardDesc: string;
  communityCardHref: string;
  communityCardAction: string;
  adminCardTitle: string;
  adminCardDesc: string;
  adminCardHref: string;
  adminCardAction: string;
};

export const defaultSettings: SiteSettings = {
  siteName: "Community Nav",
  welcomeText: "欢迎来到",
  subtitle: "一个聚合优质资源、服务入口和开发者项目的社区导航中心。",
  primaryButtonText: "开始探索",
  repoButtonText: "项目仓库",
  repoUrl: "https://github.com",
  communityCardTitle: "社区主站",
  communityCardDesc: "把论坛、文档、项目和服务统一收纳，让成员快速找到入口。",
  communityCardHref: "#community",
  communityCardAction: "开始探索",
  adminCardTitle: "后台管理",
  adminCardDesc: "登录后台后添加分类、网址、图标和排序。",
  adminCardHref: "/admin",
  adminCardAction: "后台管理"
};

function sortCategories(categories: Category[]) {
  return [...categories]
    .sort((left, right) => left.sort - right.sort)
    .map((category) => ({
      ...category,
      links: [...category.links].sort((left, right) => left.sort - right.sort)
    }));
}

async function writeCategories(categories: Category[]) {
  await mkdir(dataDir, { recursive: true });
  await writeFile(dataFile, `${JSON.stringify(sortCategories(categories), null, 2)}\n`, "utf8");
}

export async function readCategories() {
  try {
    const raw = await readFile(dataFile, "utf8");
    return sortCategories(JSON.parse(raw) as Category[]);
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") {
      await writeCategories([]);
      return [];
    }

    throw error;
  }
}

export async function readPublicCategories() {
  const categories = await readCategories();

  return categories
    .filter((category) => category.visible)
    .map((category) => ({
      ...category,
      links: category.links.filter((link) => link.visible)
    }));
}

export async function createCategory(input: Omit<Category, "id" | "links">) {
  const categories = await readCategories();

  if (categories.some((category) => category.key === input.key)) {
    throw new Error("Category key already exists");
  }

  const category: Category = {
    ...input,
    id: randomUUID(),
    links: []
  };

  await writeCategories([...categories, category]);
  return category;
}

export async function updateCategory(id: string, input: Omit<Category, "id" | "links">) {
  const categories = await readCategories();

  if (categories.some((category) => category.id !== id && category.key === input.key)) {
    throw new Error("Category key already exists");
  }

  let updated: Category | null = null;
  const next = categories.map((category) => {
    if (category.id !== id) return category;
    updated = { ...category, ...input };
    return updated;
  });

  if (!updated) {
    throw new Error("Category not found");
  }

  await writeCategories(next);
  return updated;
}

export async function deleteCategory(id: string) {
  const categories = await readCategories();
  await writeCategories(categories.filter((category) => category.id !== id));
}

export async function createLink(input: Omit<NavLink, "id">) {
  const categories = await readCategories();
  const link: NavLink = {
    ...input,
    id: randomUUID()
  };

  let created = false;
  const next = categories.map((category) => {
    if (category.id !== input.categoryId) return category;
    created = true;
    return { ...category, links: [...category.links, link] };
  });

  if (!created) {
    throw new Error("Category not found");
  }

  await writeCategories(next);
  return link;
}

export async function updateLink(id: string, input: Omit<NavLink, "id">) {
  const categories = await readCategories();
  let updated: NavLink | null = null;

  const withoutLink = categories.map((category) => ({
    ...category,
    links: category.links.filter((link) => {
      if (link.id !== id) return true;
      updated = { ...link, ...input };
      return false;
    })
  }));

  if (!updated) {
    throw new Error("Link not found");
  }

  let moved = false;
  const next = withoutLink.map((category) => {
    if (category.id !== input.categoryId) return category;
    moved = true;
    return { ...category, links: [...category.links, updated as NavLink] };
  });

  if (!moved) {
    throw new Error("Category not found");
  }

  await writeCategories(next);
  return updated;
}

export async function deleteLink(id: string) {
  const categories = await readCategories();
  await writeCategories(
    categories.map((category) => ({
      ...category,
      links: category.links.filter((link) => link.id !== id)
    }))
  );
}

export async function readSettings() {
  try {
    const raw = await readFile(settingsFile, "utf8");
    return { ...defaultSettings, ...(JSON.parse(raw) as Partial<SiteSettings>) };
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") {
      await writeSettings(defaultSettings);
      return defaultSettings;
    }

    throw error;
  }
}

export async function writeSettings(input: SiteSettings) {
  const settings: SiteSettings = {
    ...defaultSettings,
    ...input,
    siteName: input.siteName.trim() || defaultSettings.siteName,
    welcomeText: input.welcomeText.trim() || defaultSettings.welcomeText,
    primaryButtonText: input.primaryButtonText.trim() || defaultSettings.primaryButtonText,
    repoButtonText: input.repoButtonText.trim() || defaultSettings.repoButtonText
  };

  await mkdir(dataDir, { recursive: true });
  await writeFile(settingsFile, `${JSON.stringify(settings, null, 2)}\n`, "utf8");
  return settings;
}

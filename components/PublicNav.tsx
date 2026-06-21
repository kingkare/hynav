"use client";

import type { SiteSettings } from "@/lib/store";
import { ArrowRight, Github, Languages, Menu, X } from "lucide-react";
import { useMemo, useState } from "react";
import { IconBadge } from "./IconBadge";

type LinkItem = {
  id: string;
  titleZh: string;
  titleEn: string | null;
  descZh: string | null;
  descEn: string | null;
  href: string;
  icon: string;
  color: string;
};

type Category = {
  id: string;
  key: string;
  nameZh: string;
  nameEn: string | null;
  accent: string;
  links: LinkItem[];
};

const accentClasses: Record<string, string> = {
  cyan: "text-brand-cyan",
  lime: "text-brand-lime",
  purple: "text-brand-purple",
  green: "text-green-400",
  yellow: "text-yellow-400"
};

function splitSiteName(siteName: string) {
  const trimmed = siteName.trim();
  const parts = trimmed.split(/\s+/);

  if (parts.length > 1) {
    return {
      head: parts.slice(0, -1).join(" "),
      tail: parts[parts.length - 1],
      separator: " "
    };
  }

  const chars = Array.from(trimmed);
  if (chars.length <= 3) {
    return { head: trimmed, tail: "", separator: "" };
  }

  const tailLength = /[a-z]$/i.test(trimmed) && chars.length >= 6 ? 3 : 2;
  return {
    head: chars.slice(0, -tailLength).join(""),
    tail: chars.slice(-tailLength).join(""),
    separator: ""
  };
}

export function PublicNav({
  categories,
  settings
}: {
  categories: Category[];
  settings: SiteSettings;
}) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [locale, setLocale] = useState<"zh" | "en">("zh");
  const labels = useMemo(
    () => ({
      home: locale === "zh" ? "首页" : "Home",
      explore: locale === "zh" ? "探索" : "Explore",
      services: locale === "zh" ? "服务" : "Services",
      community: locale === "zh" ? "社区" : "Community",
      projects: locale === "zh" ? "项目" : "Projects",
      admin: locale === "zh" ? "后台管理" : "Admin"
    }),
    [locale]
  );

  const navItems = [
    { href: "#feed", label: labels.explore },
    { href: "#resources", label: labels.services },
    { href: "#community", label: labels.community },
    { href: "#projects", label: labels.projects }
  ];

  const { head: siteNameHead, tail: siteNameTail, separator: siteNameSeparator } = splitSiteName(
    settings.siteName
  );

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-brand-panel">
      <div className="grid-bg pointer-events-none fixed inset-0 z-0" />
      <nav className="fixed top-0 z-50 w-full border-b border-brand-border bg-brand-dark/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <a href="#" className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-full border border-brand-cyan/40 bg-brand-cyan/10 text-sm font-bold text-brand-cyan shadow-glow">
              {settings.siteName.slice(0, 1).toUpperCase()}
            </span>
            <span className="text-lg font-bold tracking-tight text-white">
              {siteNameHead}
              {siteNameTail && (
                <span className="text-brand-cyan">
                  {siteNameSeparator}
                  {siteNameTail}
                </span>
              )}
            </span>
          </a>

          <div className="hidden items-center gap-7 md:flex">
            <a className="text-sm font-medium text-brand-text hover:text-brand-cyan" href="#">
              {labels.home}
            </a>
            {navItems.map((item) => (
              <a
                key={item.href}
                className="text-sm font-medium text-gray-400 hover:text-brand-cyan"
                href={item.href}
              >
                {item.label}
              </a>
            ))}
            <button
              className="flex items-center gap-1 text-sm font-medium text-gray-400 hover:text-brand-cyan"
              onClick={() => setLocale(locale === "zh" ? "en" : "zh")}
              title="切换语言"
              type="button"
            >
              <Languages className="h-4 w-4" />
              {locale === "zh" ? "EN" : "中文"}
            </button>
            <a className="text-sm font-medium text-gray-400 hover:text-brand-cyan" href="/admin">
              {labels.admin}
            </a>
          </div>

          <button
            className="rounded-full border border-transparent p-2 text-gray-400 hover:border-brand-border hover:text-brand-cyan md:hidden"
            onClick={() => setMobileOpen((open) => !open)}
            title="菜单"
            type="button"
          >
            {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {mobileOpen && (
          <div className="border-t border-brand-border bg-brand-dark/95 px-4 py-4 md:hidden">
            {[{ href: "#", label: labels.home }, ...navItems, { href: "/admin", label: labels.admin }].map(
              (item) => (
                <a
                  className="block rounded-md px-3 py-2 text-base font-medium text-gray-300 hover:bg-white/5 hover:text-brand-cyan"
                  href={item.href}
                  key={item.href}
                  onClick={() => setMobileOpen(false)}
                >
                  {item.label}
                </a>
              )
            )}
            <button
              className="mt-1 flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-base font-medium text-gray-300 hover:bg-white/5 hover:text-brand-cyan"
              onClick={() => setLocale(locale === "zh" ? "en" : "zh")}
              type="button"
            >
              <Languages className="h-5 w-5" />
              {locale === "zh" ? "English" : "中文"}
            </button>
          </div>
        )}
      </nav>

      <div className="relative z-10 mx-auto min-h-screen max-w-7xl border-x border-brand-border/20 bg-brand-dark pt-20 shadow-2xl">
        <section className="px-4 py-12 sm:px-6 sm:py-16 lg:grid lg:grid-cols-12 lg:gap-8 lg:px-8 lg:py-20">
          <div className="lg:col-span-7">
            <h1 className="mb-7 font-bold tracking-tight">
              <span className="block text-4xl leading-tight text-slate-300 sm:text-5xl lg:text-6xl">
                {settings.welcomeText}
              </span>
              <span className="mt-3 block text-5xl leading-none text-white sm:mt-4 sm:text-6xl lg:text-7xl">
                {siteNameHead}
                {siteNameTail && (
                  <span className="text-brand-lime">
                    {siteNameSeparator}
                    {siteNameTail}
                  </span>
                )}
              </span>
            </h1>
            <p className="max-w-2xl text-xl leading-relaxed text-gray-400">{settings.subtitle}</p>
            <div className="mt-8 flex flex-wrap gap-4">
              <a
                className="rounded-full bg-brand-cyan px-6 py-3 font-semibold text-brand-dark shadow-glow transition-colors hover:bg-cyan-300"
                href="#feed"
              >
                {settings.primaryButtonText}
              </a>
              <a
                className="flex items-center gap-2 rounded-full border border-gray-600 px-6 py-3 font-semibold text-gray-300 transition-colors hover:border-brand-text hover:text-white"
                href={settings.repoUrl}
                target="_blank"
                rel="noreferrer"
              >
                <Github className="h-5 w-5" />
                {settings.repoButtonText}
              </a>
            </div>
          </div>

          <div className="mt-12 space-y-4 lg:col-span-5 lg:mt-0">
            <a className="glass-card group block rounded-xl p-6" href={settings.communityCardHref}>
              <div className="mb-4 flex items-center gap-3">
                <IconBadge icon="users" color="purple" size="lg" />
                <div>
                  <h2 className="text-lg font-semibold text-white">{settings.communityCardTitle}</h2>
                  <p className="mt-1 text-sm text-gray-400">{settings.communityCardDesc}</p>
                </div>
              </div>
              <span className="inline-flex items-center gap-1 text-sm font-medium text-brand-purple">
                {settings.communityCardAction}
                <ArrowRight className="h-4 w-4" />
              </span>
            </a>
            <a className="glass-card group block rounded-xl p-6" href={settings.adminCardHref}>
              <div className="mb-4 flex items-center gap-3">
                <IconBadge icon="sparkles" color="cyan" size="lg" />
                <div>
                  <h2 className="text-lg font-semibold text-white">{settings.adminCardTitle}</h2>
                  <p className="mt-1 text-sm text-gray-400">{settings.adminCardDesc}</p>
                </div>
              </div>
              <span className="inline-flex items-center gap-1 text-sm font-medium text-brand-cyan">
                {settings.adminCardAction}
                <ArrowRight className="h-4 w-4" />
              </span>
            </a>
          </div>
        </section>

        <main className="px-4 py-10 sm:px-6 lg:px-8">
          {categories.map((category, index) => {
            const accent = accentClasses[category.accent] ?? accentClasses.cyan;
            const sectionId =
              index === 0
                ? "feed"
                : category.key === "services"
                  ? "resources"
                  : category.key === "projects"
                    ? "projects"
                    : "community";

            return (
              <section className="mb-20" id={sectionId} key={category.id}>
                <div className="mb-8 flex items-center gap-3">
                  <h2 className="text-3xl font-bold text-white">
                    {locale === "zh" ? category.nameZh : category.nameEn || category.nameZh}
                    <span className={`${accent} ml-1 align-top text-sm`}>°</span>
                  </h2>
                  <div className="h-px flex-1 bg-brand-border" />
                </div>

                <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
                  {category.links.map((link) => (
                    <a
                      className="glass-card group block h-full rounded-lg p-6"
                      href={link.href}
                      key={link.id}
                      rel="noreferrer"
                      target="_blank"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex min-w-0 items-center gap-3">
                          <IconBadge icon={link.icon} color={link.color} />
                          <div className="min-w-0">
                            <h3 className="truncate font-medium text-white">
                              {locale === "zh" ? link.titleZh : link.titleEn || link.titleZh}
                            </h3>
                            <p className="mt-1 line-clamp-2 text-xs text-gray-500">
                              {locale === "zh" ? link.descZh : link.descEn || link.descZh}
                            </p>
                          </div>
                        </div>
                        <span className="text-gray-600 transition-colors group-hover:text-brand-cyan">↗</span>
                      </div>
                    </a>
                  ))}
                </div>
              </section>
            );
          })}
        </main>

        <footer className="border-t border-brand-border bg-brand-dark/50 px-4 py-8 text-center text-xs text-gray-500">
          © {new Date().getFullYear()} {settings.siteName}. Powered by Next.js.
        </footer>
      </div>
    </div>
  );
}

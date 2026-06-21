"use client";

import { colorOptions, iconOptions, IconBadge } from "@/components/IconBadge";
import type { SiteSettings } from "@/lib/store";
import {
  Eye,
  EyeOff,
  Home,
  Loader2,
  LogOut,
  Pencil,
  Plus,
  RefreshCw,
  Save,
  Settings,
  Trash2,
  X
} from "lucide-react";
import { FormEvent, useEffect, useMemo, useState } from "react";

type LinkItem = {
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

type Category = {
  id: string;
  key: string;
  nameZh: string;
  nameEn: string | null;
  accent: string;
  sort: number;
  visible: boolean;
  links: LinkItem[];
};

type ModalType = "category" | "link" | "settings" | null;

const emptyCategory = {
  key: "",
  nameZh: "",
  nameEn: "",
  accent: "cyan",
  sort: 0,
  visible: true
};

const emptyLink = {
  categoryId: "",
  titleZh: "",
  titleEn: "",
  descZh: "",
  descEn: "",
  href: "",
  icon: "globe",
  color: "cyan",
  sort: 0,
  visible: true
};

const emptySettings: SiteSettings = {
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

const showEnglishFields = false;

const colorLabels: Record<string, string> = {
  blue: "蓝色",
  cyan: "青色",
  green: "绿色",
  indigo: "靛蓝",
  lime: "荧光绿",
  orange: "橙色",
  purple: "紫色",
  teal: "蓝绿色",
  yellow: "黄色"
};

const iconLabels: Record<string, string> = {
  activity: "活跃",
  boxes: "盒子",
  code: "代码",
  github: "GitHub",
  globe: "地球",
  map: "地图",
  network: "网络",
  plus: "加号",
  server: "服务器",
  sparkles: "星光",
  terminal: "终端",
  users: "用户"
};

export function AdminDashboard() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [settingsForm, setSettingsForm] = useState<SiteSettings>(emptySettings);
  const [categoryForm, setCategoryForm] = useState(emptyCategory);
  const [linkForm, setLinkForm] = useState(emptyLink);
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null);
  const [editingLinkId, setEditingLinkId] = useState<string | null>(null);
  const [modal, setModal] = useState<ModalType>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const flatLinks = useMemo(() => categories.flatMap((category) => category.links), [categories]);

  async function loadData() {
    setLoading(true);
    const [categoriesResponse, settingsResponse] = await Promise.all([
      fetch("/api/admin/categories", { cache: "no-store" }),
      fetch("/api/admin/settings", { cache: "no-store" })
    ]);

    if (categoriesResponse.status === 401 || settingsResponse.status === 401) {
      window.location.href = "/admin";
      return;
    }

    const [categoriesResult, settingsResult] = await Promise.all([
      categoriesResponse.json(),
      settingsResponse.json()
    ]);

    setCategories(categoriesResult);
    setSettingsForm(settingsResult);
    setLoading(false);

    if (!linkForm.categoryId && categoriesResult[0]?.id) {
      setLinkForm((current) => ({ ...current, categoryId: categoriesResult[0].id }));
    }
  }

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    document.title = `${settingsForm.siteName} 后台管理`;
  }, [settingsForm.siteName]);

  function openNewCategory() {
    setCategoryForm(emptyCategory);
    setEditingCategoryId(null);
    setModal("category");
  }

  function openEditCategory(category: Category) {
    setCategoryForm({
      key: category.key,
      nameZh: category.nameZh,
      nameEn: category.nameEn || "",
      accent: category.accent,
      sort: category.sort,
      visible: category.visible
    });
    setEditingCategoryId(category.id);
    setModal("category");
  }

  function openNewLink(categoryId = categories[0]?.id || "") {
    setLinkForm({ ...emptyLink, categoryId });
    setEditingLinkId(null);
    setModal("link");
  }

  function openEditLink(link: LinkItem) {
    setLinkForm({
      categoryId: link.categoryId,
      titleZh: link.titleZh,
      titleEn: link.titleEn || "",
      descZh: link.descZh || "",
      descEn: link.descEn || "",
      href: link.href,
      icon: link.icon,
      color: link.color,
      sort: link.sort,
      visible: link.visible
    });
    setEditingLinkId(link.id);
    setModal("link");
  }

  async function submitCategory(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setMessage("");

    const response = await fetch(
      editingCategoryId ? `/api/admin/categories/${editingCategoryId}` : "/api/admin/categories",
      {
        method: editingCategoryId ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(categoryForm)
      }
    );

    setSaving(false);

    if (!response.ok) {
      setMessage("分类保存失败，请检查 key 是否重复。");
      return;
    }

    setCategoryForm(emptyCategory);
    setEditingCategoryId(null);
    setModal(null);
    setMessage("分类已保存");
    await loadData();
  }

  async function submitLink(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setMessage("");

    const response = await fetch(editingLinkId ? `/api/admin/links/${editingLinkId}` : "/api/admin/links", {
      method: editingLinkId ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(linkForm)
    });

    setSaving(false);

    if (!response.ok) {
      setMessage("网址保存失败，请确认分类、中文标题和链接填写完整。");
      return;
    }

    setLinkForm({ ...emptyLink, categoryId: categories[0]?.id || "" });
    setEditingLinkId(null);
    setModal(null);
    setMessage("网址已保存");
    await loadData();
  }

  async function submitSettings(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setMessage("");

    const response = await fetch("/api/admin/settings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(settingsForm)
    });

    setSaving(false);

    if (!response.ok) {
      setMessage("系统设置保存失败，请检查填写内容。");
      return;
    }

    setSettingsForm(await response.json());
    setModal(null);
    setMessage("系统设置已保存");
  }

  async function removeCategory(id: string) {
    if (!window.confirm("删除分类会同时删除它下面的网址，确定继续？")) return;
    await fetch(`/api/admin/categories/${id}`, { method: "DELETE" });
    await loadData();
  }

  async function removeLink(id: string) {
    if (!window.confirm("确定删除这个网址？")) return;
    await fetch(`/api/admin/links/${id}`, { method: "DELETE" });
    await loadData();
  }

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    window.location.href = "/admin";
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-brand-panel">
      <div className="grid-bg pointer-events-none fixed inset-0" />
      <div className="relative z-10 mx-auto max-w-[1500px] px-4 py-8 sm:px-6 lg:px-8">
        <header className="mb-8 flex flex-col gap-5 border-b border-brand-border pb-6 xl:flex-row xl:items-center xl:justify-between">
          <div>
            <p className="text-sm font-medium text-brand-cyan">{settingsForm.siteName}</p>
            <h1 className="mt-1 text-3xl font-bold text-white">后台管理</h1>
            <p className="mt-2 text-sm text-gray-400">登录后默认只展示当前导航数据，新增和编辑都在弹窗中完成。</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <a className="admin-action" href="/">
              <Home className="h-4 w-4" />
              返回前台
            </a>
            <button className="admin-action text-brand-cyan" onClick={openNewCategory} type="button">
              <Plus className="h-4 w-4" />
              添加分类
            </button>
            <button className="admin-action text-brand-purple" onClick={() => openNewLink()} type="button">
              <Plus className="h-4 w-4" />
              添加网址
            </button>
            <button className="admin-action text-brand-lime" onClick={() => setModal("settings")} type="button">
              <Settings className="h-4 w-4" />
              系统设置
            </button>
            <button className="admin-action" onClick={loadData} type="button">
              <RefreshCw className="h-4 w-4" />
              刷新
            </button>
            <button
              className="inline-flex items-center gap-2 rounded-lg bg-brand-cyan px-4 py-2 text-sm font-semibold text-brand-dark hover:bg-cyan-300"
              onClick={logout}
              type="button"
            >
              <LogOut className="h-4 w-4" />
              退出
            </button>
          </div>
        </header>

        {message && <div className="mb-6 rounded-lg border border-brand-border bg-brand-dark/70 p-4 text-sm text-brand-cyan">{message}</div>}

        {loading ? (
          <div className="glass-card flex min-h-80 items-center justify-center rounded-xl">
            <Loader2 className="h-8 w-8 animate-spin text-brand-cyan" />
          </div>
        ) : (
          <section className="glass-card rounded-xl p-5 sm:p-6">
            <div className="mb-6 flex flex-col gap-3 border-b border-brand-border pb-5 md:flex-row md:items-center md:justify-between">
              <div>
                <h2 className="text-2xl font-semibold text-white">当前导航数据</h2>
                <p className="mt-1 text-sm text-gray-400">
                  {categories.length} 个分类，{flatLinks.length} 个网址
                </p>
              </div>
            </div>

            {categories.length === 0 ? (
              <div className="rounded-lg border border-dashed border-brand-border p-10 text-center">
                <p className="text-lg font-medium text-white">还没有分类</p>
                <p className="mt-2 text-sm text-gray-400">点击右上角「添加分类」开始创建导航数据。</p>
              </div>
            ) : (
              <div className="space-y-6">
                {categories.map((category) => (
                  <div className="rounded-lg border border-brand-border/60 bg-brand-dark/50 p-4 sm:p-5" key={category.id}>
                    <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-xl font-semibold text-white">{category.nameZh}</h3>
                          {category.visible ? <Eye className="h-4 w-4 text-brand-cyan" /> : <EyeOff className="h-4 w-4 text-gray-500" />}
                        </div>
                        <p className="mt-1 text-xs text-gray-500">
                          key: {category.key} / sort: {category.sort}
                          {category.nameEn ? ` / EN: ${category.nameEn}` : ""}
                        </p>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <button className="admin-mini-button" onClick={() => openNewLink(category.id)} type="button">
                          <Plus className="h-4 w-4" />
                          加网址
                        </button>
                        <IconButton label="编辑分类" onClick={() => openEditCategory(category)}>
                          <Pencil className="h-4 w-4" />
                        </IconButton>
                        <IconButton danger label="删除分类" onClick={() => removeCategory(category.id)}>
                          <Trash2 className="h-4 w-4" />
                        </IconButton>
                      </div>
                    </div>

                    {category.links.length === 0 ? (
                      <div className="rounded-lg border border-dashed border-brand-border/60 p-6 text-sm text-gray-400">这个分类下还没有网址。</div>
                    ) : (
                      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                        {category.links.map((link) => (
                          <div className="rounded-lg border border-brand-border/40 bg-brand-panel/70 p-4" key={link.id}>
                            <div className="flex items-start justify-between gap-3">
                              <div className="flex min-w-0 gap-3">
                                <IconBadge icon={link.icon} color={link.color} />
                                <div className="min-w-0">
                                  <h4 className="truncate font-medium text-white">{link.titleZh}</h4>
                                  <p className="mt-1 line-clamp-2 text-xs text-gray-500">{link.descZh || "暂无中文描述"}</p>
                                  <p className="mt-2 truncate text-xs text-brand-cyan">{link.href}</p>
                                </div>
                              </div>
                              {link.visible ? <Eye className="h-4 w-4 shrink-0 text-brand-cyan" /> : <EyeOff className="h-4 w-4 shrink-0 text-gray-500" />}
                            </div>
                            <div className="mt-4 flex items-center justify-between gap-3">
                              <span className="text-xs text-gray-500">sort: {link.sort}</span>
                              <div className="flex gap-2">
                                <IconButton label="编辑网址" onClick={() => openEditLink(link)}>
                                  <Pencil className="h-4 w-4" />
                                </IconButton>
                                <IconButton danger label="删除网址" onClick={() => removeLink(link.id)}>
                                  <Trash2 className="h-4 w-4" />
                                </IconButton>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </section>
        )}
      </div>

      {modal === "category" && (
        <Modal title={editingCategoryId ? "编辑分类" : "添加分类"} onClose={() => setModal(null)}>
          <CategoryForm
            categoryForm={categoryForm}
            saving={saving}
            setCategoryForm={setCategoryForm}
            submitCategory={submitCategory}
          />
        </Modal>
      )}

      {modal === "link" && (
        <Modal title={editingLinkId ? "编辑网址" : "添加网址"} onClose={() => setModal(null)}>
          <LinkForm
            categories={categories}
            linkForm={linkForm}
            saving={saving}
            setLinkForm={setLinkForm}
            submitLink={submitLink}
          />
        </Modal>
      )}

      {modal === "settings" && (
        <Modal title="系统设置" onClose={() => setModal(null)}>
          <SettingsForm
            saving={saving}
            settingsForm={settingsForm}
            setSettingsForm={setSettingsForm}
            submitSettings={submitSettings}
          />
        </Modal>
      )}
    </main>
  );
}

function CategoryForm({
  categoryForm,
  saving,
  setCategoryForm,
  submitCategory
}: {
  categoryForm: typeof emptyCategory;
  saving: boolean;
  setCategoryForm: (value: typeof emptyCategory) => void;
  submitCategory: (event: FormEvent<HTMLFormElement>) => void;
}) {
  return (
    <form className="space-y-4" onSubmit={submitCategory}>
      <Field label="唯一 key">
        <input className="admin-input" onChange={(event) => setCategoryForm({ ...categoryForm, key: event.target.value })} placeholder="services" required value={categoryForm.key} />
      </Field>
      <Field label="中文名称">
        <input className="admin-input" onChange={(event) => setCategoryForm({ ...categoryForm, nameZh: event.target.value })} placeholder="服务" required value={categoryForm.nameZh} />
      </Field>
      {showEnglishFields && (
        <Field hint="不是必填；留空时前台英文模式会使用中文名称。" label="英文名称（选填）">
          <input className="admin-input" onChange={(event) => setCategoryForm({ ...categoryForm, nameEn: event.target.value })} placeholder="选填：Services" value={categoryForm.nameEn} />
        </Field>
      )}
      <div className="grid grid-cols-2 gap-4">
        <Field label="强调色">
          <select className="admin-input" onChange={(event) => setCategoryForm({ ...categoryForm, accent: event.target.value })} value={categoryForm.accent}>
            {colorOptions.map((color) => <option key={color} value={color}>{colorLabels[color] ?? color}</option>)}
          </select>
        </Field>
        <Field label="排序">
          <input className="admin-input" onChange={(event) => setCategoryForm({ ...categoryForm, sort: Number(event.target.value) })} type="number" value={categoryForm.sort} />
        </Field>
      </div>
      <CheckBox checked={categoryForm.visible} label="前台显示" onChange={(visible) => setCategoryForm({ ...categoryForm, visible })} />
      <SaveButton saving={saving} />
    </form>
  );
}

function LinkForm({
  categories,
  linkForm,
  saving,
  setLinkForm,
  submitLink
}: {
  categories: Category[];
  linkForm: typeof emptyLink;
  saving: boolean;
  setLinkForm: (value: typeof emptyLink) => void;
  submitLink: (event: FormEvent<HTMLFormElement>) => void;
}) {
  return (
    <form className="space-y-4" onSubmit={submitLink}>
      <Field label="所属分类">
        <select className="admin-input" onChange={(event) => setLinkForm({ ...linkForm, categoryId: event.target.value })} required value={linkForm.categoryId}>
          {categories.map((category) => <option key={category.id} value={category.id}>{category.nameZh}</option>)}
        </select>
      </Field>
      <Field label="中文标题">
        <input className="admin-input" onChange={(event) => setLinkForm({ ...linkForm, titleZh: event.target.value })} placeholder="项目名称" required value={linkForm.titleZh} />
      </Field>
      {showEnglishFields && (
        <Field hint="不是必填；留空时前台英文模式会使用中文标题。" label="英文标题（选填）">
          <input className="admin-input" onChange={(event) => setLinkForm({ ...linkForm, titleEn: event.target.value })} placeholder="选填：Project name" value={linkForm.titleEn} />
        </Field>
      )}
      <Field label="链接地址">
        <input className="admin-input" onChange={(event) => setLinkForm({ ...linkForm, href: event.target.value })} placeholder="https://example.com" required type="url" value={linkForm.href} />
      </Field>
      <Field label="中文描述">
        <textarea className="admin-input min-h-20" onChange={(event) => setLinkForm({ ...linkForm, descZh: event.target.value })} placeholder="一句话说明这个入口" value={linkForm.descZh} />
      </Field>
      {showEnglishFields && (
        <Field hint="不是必填；留空时前台英文模式会使用中文描述。" label="英文描述（选填）">
          <textarea className="admin-input min-h-20" onChange={(event) => setLinkForm({ ...linkForm, descEn: event.target.value })} placeholder="选填：Short description" value={linkForm.descEn} />
        </Field>
      )}
      <div className="grid grid-cols-3 gap-4">
        <Field label="图标">
          <select className="admin-input" onChange={(event) => setLinkForm({ ...linkForm, icon: event.target.value })} value={linkForm.icon}>
            {iconOptions.map((icon) => <option key={icon} value={icon}>{iconLabels[icon] ?? icon}</option>)}
          </select>
        </Field>
        <Field label="颜色">
          <select className="admin-input" onChange={(event) => setLinkForm({ ...linkForm, color: event.target.value })} value={linkForm.color}>
            {colorOptions.map((color) => <option key={color} value={color}>{colorLabels[color] ?? color}</option>)}
          </select>
        </Field>
        <Field label="排序">
          <input className="admin-input" onChange={(event) => setLinkForm({ ...linkForm, sort: Number(event.target.value) })} type="number" value={linkForm.sort} />
        </Field>
      </div>
      <CheckBox checked={linkForm.visible} label="前台显示" onChange={(visible) => setLinkForm({ ...linkForm, visible })} />
      <SaveButton saving={saving} />
    </form>
  );
}

function SettingsForm({
  saving,
  settingsForm,
  setSettingsForm,
  submitSettings
}: {
  saving: boolean;
  settingsForm: SiteSettings;
  setSettingsForm: (value: SiteSettings) => void;
  submitSettings: (event: FormEvent<HTMLFormElement>) => void;
}) {
  const update = (key: keyof SiteSettings, value: string) => setSettingsForm({ ...settingsForm, [key]: value });

  return (
    <form className="space-y-5" onSubmit={submitSettings}>
      <SettingGroup title="基础展示">
        <Field label="网站名称">
          <input className="admin-input" onChange={(event) => update("siteName", event.target.value)} placeholder="Community Nav" required value={settingsForm.siteName} />
        </Field>
        <Field label="欢迎词">
          <input className="admin-input" onChange={(event) => update("welcomeText", event.target.value)} placeholder="欢迎来到" required value={settingsForm.welcomeText} />
        </Field>
        <Field label="首页副标题">
          <textarea className="admin-input min-h-20" onChange={(event) => update("subtitle", event.target.value)} placeholder="一个聚合优质资源、服务入口和开发者项目的社区导航中心。" value={settingsForm.subtitle} />
        </Field>
      </SettingGroup>

      <SettingGroup title="首页按钮">
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="主按钮文字">
            <input className="admin-input" onChange={(event) => update("primaryButtonText", event.target.value)} placeholder="开始探索" value={settingsForm.primaryButtonText} />
          </Field>
          <Field label="项目仓库按钮文字">
            <input className="admin-input" onChange={(event) => update("repoButtonText", event.target.value)} placeholder="项目仓库" value={settingsForm.repoButtonText} />
          </Field>
        </div>
        <Field label="项目仓库网址">
          <input className="admin-input" onChange={(event) => update("repoUrl", event.target.value)} placeholder="https://github.com" type="url" value={settingsForm.repoUrl} />
        </Field>
      </SettingGroup>

      <SettingGroup title="右侧卡片一">
        <Field label="标题">
          <input className="admin-input" onChange={(event) => update("communityCardTitle", event.target.value)} placeholder="社区主站" value={settingsForm.communityCardTitle} />
        </Field>
        <Field label="描述">
          <textarea className="admin-input min-h-20" onChange={(event) => update("communityCardDesc", event.target.value)} placeholder="把论坛、文档、项目和服务统一收纳，让成员快速找到入口。" value={settingsForm.communityCardDesc} />
        </Field>
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="跳转地址">
            <input className="admin-input" onChange={(event) => update("communityCardHref", event.target.value)} placeholder="#community" value={settingsForm.communityCardHref} />
          </Field>
          <Field label="动作文字">
            <input className="admin-input" onChange={(event) => update("communityCardAction", event.target.value)} placeholder="开始探索" value={settingsForm.communityCardAction} />
          </Field>
        </div>
      </SettingGroup>

      <SettingGroup title="右侧卡片二">
        <Field label="标题">
          <input className="admin-input" onChange={(event) => update("adminCardTitle", event.target.value)} placeholder="后台管理" value={settingsForm.adminCardTitle} />
        </Field>
        <Field label="描述">
          <textarea className="admin-input min-h-20" onChange={(event) => update("adminCardDesc", event.target.value)} placeholder="登录后台后添加分类、网址、图标和排序。" value={settingsForm.adminCardDesc} />
        </Field>
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="跳转地址">
            <input className="admin-input" onChange={(event) => update("adminCardHref", event.target.value)} placeholder="/admin" value={settingsForm.adminCardHref} />
          </Field>
          <Field label="动作文字">
            <input className="admin-input" onChange={(event) => update("adminCardAction", event.target.value)} placeholder="后台管理" value={settingsForm.adminCardAction} />
          </Field>
        </div>
      </SettingGroup>

      <SaveButton saving={saving} />
    </form>
  );
}

function SettingGroup({ children, title }: { children: React.ReactNode; title: string }) {
  return (
    <div className="rounded-lg border border-brand-border/60 bg-brand-dark/40 p-4">
      <h3 className="mb-4 text-base font-semibold text-white">{title}</h3>
      <div className="space-y-4">{children}</div>
    </div>
  );
}

function Modal({ children, onClose, title }: { children: React.ReactNode; onClose: () => void; title: string }) {
  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/55 px-4 py-8 backdrop-blur-sm">
      <div className="glass-card w-full max-w-3xl rounded-xl p-6 shadow-2xl">
        <div className="mb-5 flex items-center justify-between gap-4">
          <h2 className="text-2xl font-bold text-white">{title}</h2>
          <button className="rounded-full border border-brand-border p-2 text-gray-300 hover:border-brand-cyan hover:text-white" onClick={onClose} title="关闭" type="button">
            <X className="h-5 w-5" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

function Field({ children, hint, label }: { children: React.ReactNode; hint?: string; label: string }) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-medium text-gray-300">{label}</span>
      {children}
      {hint && <span className="mt-1 block text-xs text-gray-500">{hint}</span>}
    </label>
  );
}

function CheckBox({ checked, label, onChange }: { checked: boolean; label: string; onChange: (checked: boolean) => void }) {
  return (
    <label className="flex items-center gap-2 text-sm text-gray-300">
      <input checked={checked} onChange={(event) => onChange(event.target.checked)} type="checkbox" />
      {label}
    </label>
  );
}

function IconButton({ children, danger, label, onClick }: { children: React.ReactNode; danger?: boolean; label: string; onClick: () => void }) {
  return (
    <button
      className={`rounded-md border p-2 ${danger ? "border-rose-500/40 text-rose-300 hover:text-rose-200" : "border-brand-border text-gray-300 hover:text-brand-cyan"}`}
      onClick={onClick}
      title={label}
      type="button"
    >
      {children}
    </button>
  );
}

function SaveButton({ saving }: { saving: boolean }) {
  return (
    <button
      className="flex w-full items-center justify-center gap-2 rounded-lg bg-brand-cyan px-4 py-3 font-semibold text-brand-dark transition-colors hover:bg-cyan-300 disabled:cursor-not-allowed disabled:opacity-60"
      disabled={saving}
      type="submit"
    >
      {saving ? <Loader2 className="h-5 w-5 animate-spin" /> : <Save className="h-5 w-5" />}
      {saving ? "保存中..." : "保存"}
    </button>
  );
}

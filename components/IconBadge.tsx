"use client";

import {
  Activity,
  Boxes,
  Code2,
  Github,
  Globe2,
  Map,
  Network,
  Plus,
  Server,
  Sparkles,
  Terminal,
  Users
} from "lucide-react";

const icons = {
  activity: Activity,
  boxes: Boxes,
  code: Code2,
  github: Github,
  globe: Globe2,
  map: Map,
  network: Network,
  plus: Plus,
  server: Server,
  sparkles: Sparkles,
  terminal: Terminal,
  users: Users
};

const colorClasses = {
  blue: "text-blue-400 bg-blue-500/10 group-hover:border-blue-500/50",
  cyan: "text-brand-cyan bg-brand-cyan/10 group-hover:border-brand-cyan/50",
  green: "text-green-400 bg-green-500/10 group-hover:border-green-500/50",
  indigo: "text-indigo-400 bg-indigo-500/10 group-hover:border-indigo-500/50",
  lime: "text-brand-lime bg-brand-lime/10 group-hover:border-brand-lime/50",
  orange: "text-orange-400 bg-orange-500/10 group-hover:border-orange-500/50",
  purple: "text-brand-purple bg-brand-purple/10 group-hover:border-brand-purple/50",
  teal: "text-teal-400 bg-teal-500/10 group-hover:border-teal-500/50",
  yellow: "text-yellow-400 bg-yellow-500/10 group-hover:border-yellow-500/50"
};

export type IconKey = keyof typeof icons;
export type ColorKey = keyof typeof colorClasses;

export const iconOptions = Object.keys(icons);
export const colorOptions = Object.keys(colorClasses);

export function IconBadge({
  icon = "globe",
  color = "cyan",
  size = "md"
}: {
  icon?: string;
  color?: string;
  size?: "sm" | "md" | "lg";
}) {
  const Icon = icons[(icon as IconKey) || "globe"] ?? Globe2;
  const palette = colorClasses[(color as ColorKey) || "cyan"] ?? colorClasses.cyan;
  const boxSize = size === "sm" ? "h-8 w-8" : size === "lg" ? "h-12 w-12" : "h-10 w-10";
  const iconSize = size === "sm" ? "h-4 w-4" : size === "lg" ? "h-6 w-6" : "h-5 w-5";

  return (
    <span
      className={`${boxSize} ${palette} flex shrink-0 items-center justify-center rounded-md border border-transparent transition-transform group-hover:scale-110`}
    >
      <Icon className={iconSize} strokeWidth={1.8} />
    </span>
  );
}

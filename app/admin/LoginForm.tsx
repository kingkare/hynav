"use client";

import { Lock, LogIn } from "lucide-react";
import { FormEvent, useState } from "react";

export function LoginForm() {
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setMessage("");

    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password })
    });

    setLoading(false);

    if (!response.ok) {
      const result = await response.json().catch(() => null);
      setMessage(result?.message || "登录失败");
      return;
    }

    window.location.href = "/admin/dashboard";
  }

  return (
    <form className="glass-card w-full max-w-md rounded-xl p-8" onSubmit={handleSubmit}>
      <div className="mb-8 flex items-center gap-3">
        <span className="flex h-12 w-12 items-center justify-center rounded-lg bg-brand-cyan/10 text-brand-cyan">
          <Lock className="h-6 w-6" />
        </span>
        <div>
          <h1 className="text-2xl font-bold text-white">后台登录</h1>
          <p className="mt-1 text-sm text-gray-400">输入管理员密码管理导航数据</p>
        </div>
      </div>

      <label className="mb-2 block text-sm font-medium text-gray-300" htmlFor="password">
        管理员密码
      </label>
      <input
        className="admin-input"
        id="password"
        onChange={(event) => setPassword(event.target.value)}
        placeholder="请输入密码"
        type="password"
        value={password}
      />

      {message && <p className="mt-3 text-sm text-rose-300">{message}</p>}

      <button
        className="mt-6 flex w-full items-center justify-center gap-2 rounded-lg bg-brand-cyan px-4 py-3 font-semibold text-brand-dark transition-colors hover:bg-cyan-300 disabled:cursor-not-allowed disabled:opacity-60"
        disabled={loading}
        type="submit"
      >
        <LogIn className="h-5 w-5" />
        {loading ? "登录中..." : "登录"}
      </button>
    </form>
  );
}

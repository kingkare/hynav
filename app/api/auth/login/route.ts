import { createSession, verifyPassword } from "@/lib/auth";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const password = typeof body?.password === "string" ? body.password : "";

  if (!verifyPassword(password)) {
    return Response.json({ message: "密码错误" }, { status: 401 });
  }

  await createSession();
  return Response.json({ ok: true });
}

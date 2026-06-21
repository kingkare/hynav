import { assertAdmin } from "@/lib/auth";
import { readSettings, writeSettings } from "@/lib/store";

export const dynamic = "force-dynamic";

export async function GET() {
  const unauthorized = await assertAdmin();
  if (unauthorized) return unauthorized;

  return Response.json(await readSettings());
}

export async function PATCH(request: Request) {
  const unauthorized = await assertAdmin();
  if (unauthorized) return unauthorized;

  try {
    const body = await request.json();
    return Response.json(await writeSettings(body));
  } catch (error) {
    return Response.json({ message: (error as Error).message }, { status: 400 });
  }
}

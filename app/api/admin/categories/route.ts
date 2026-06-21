import { assertAdmin } from "@/lib/auth";
import { createCategory, readCategories } from "@/lib/store";

export const dynamic = "force-dynamic";

export async function GET() {
  const unauthorized = await assertAdmin();
  if (unauthorized) return unauthorized;

  return Response.json(await readCategories());
}

export async function POST(request: Request) {
  const unauthorized = await assertAdmin();
  if (unauthorized) return unauthorized;

  try {
    const body = await request.json();
    const category = await createCategory({
      key: body.key,
      nameZh: body.nameZh,
      nameEn: body.nameEn || null,
      accent: body.accent || "cyan",
      sort: Number(body.sort || 0),
      visible: Boolean(body.visible ?? true)
    });

    return Response.json(category);
  } catch (error) {
    return Response.json({ message: (error as Error).message }, { status: 400 });
  }
}

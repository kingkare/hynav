import { assertAdmin } from "@/lib/auth";
import { createLink } from "@/lib/store";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const unauthorized = await assertAdmin();
  if (unauthorized) return unauthorized;

  try {
    const body = await request.json();
    const link = await createLink({
      categoryId: body.categoryId,
      titleZh: body.titleZh,
      titleEn: body.titleEn || null,
      descZh: body.descZh || null,
      descEn: body.descEn || null,
      href: body.href,
      icon: body.icon || "globe",
      color: body.color || "cyan",
      sort: Number(body.sort || 0),
      visible: Boolean(body.visible ?? true)
    });

    return Response.json(link);
  } catch (error) {
    return Response.json({ message: (error as Error).message }, { status: 400 });
  }
}

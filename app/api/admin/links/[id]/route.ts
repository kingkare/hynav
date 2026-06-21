import { assertAdmin } from "@/lib/auth";
import { deleteLink, updateLink } from "@/lib/store";

type Params = {
  params: Promise<{ id: string }>;
};

export async function PATCH(request: Request, { params }: Params) {
  const unauthorized = await assertAdmin();
  if (unauthorized) return unauthorized;

  try {
    const { id } = await params;
    const body = await request.json();
    const link = await updateLink(id, {
      categoryId: body.categoryId,
      titleZh: body.titleZh,
      titleEn: body.titleEn || null,
      descZh: body.descZh || null,
      descEn: body.descEn || null,
      href: body.href,
      icon: body.icon || "globe",
      color: body.color || "cyan",
      sort: Number(body.sort || 0),
      visible: Boolean(body.visible)
    });

    return Response.json(link);
  } catch (error) {
    return Response.json({ message: (error as Error).message }, { status: 400 });
  }
}

export async function DELETE(_request: Request, { params }: Params) {
  const unauthorized = await assertAdmin();
  if (unauthorized) return unauthorized;

  const { id } = await params;
  await deleteLink(id);
  return Response.json({ ok: true });
}

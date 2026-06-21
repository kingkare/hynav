import { assertAdmin } from "@/lib/auth";
import { deleteCategory, updateCategory } from "@/lib/store";

type Params = {
  params: Promise<{ id: string }>;
};

export async function PATCH(request: Request, { params }: Params) {
  const unauthorized = await assertAdmin();
  if (unauthorized) return unauthorized;

  try {
    const { id } = await params;
    const body = await request.json();
    const category = await updateCategory(id, {
      key: body.key,
      nameZh: body.nameZh,
      nameEn: body.nameEn || null,
      accent: body.accent || "cyan",
      sort: Number(body.sort || 0),
      visible: Boolean(body.visible)
    });

    return Response.json(category);
  } catch (error) {
    return Response.json({ message: (error as Error).message }, { status: 400 });
  }
}

export async function DELETE(_request: Request, { params }: Params) {
  const unauthorized = await assertAdmin();
  if (unauthorized) return unauthorized;

  const { id } = await params;
  await deleteCategory(id);
  return Response.json({ ok: true });
}

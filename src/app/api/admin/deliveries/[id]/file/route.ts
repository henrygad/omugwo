import { getGeneratedDeliveryFile } from "@/lib/digital-deliveries";
import { requireAdminSession } from "@/lib/firebase/auth";
import { apiError } from "@/lib/http";

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    await requireAdminSession();
    const { id } = await context.params;
    const file = await getGeneratedDeliveryFile(id);
    return new Response(new Uint8Array(file.buffer), {
      headers: {
        "Content-Type": "application/epub+zip",
        "Content-Disposition": `attachment; filename="${file.fileName.replaceAll('"', "")}"`,
        "Cache-Control": "private, no-store, max-age=0",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch (error) {
    return apiError(error);
  }
}

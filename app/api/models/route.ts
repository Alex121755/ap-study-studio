import { isLocalRequest, localAccessDenied } from "@/lib/local-access";
import { getModelCatalog } from "@/lib/model-catalog";
import {readOpenAIKey} from "@/lib/server-config";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(request: Request) {
  if (!isLocalRequest(request)) return localAccessDenied();
  const headers = { "Cache-Control": "no-store", "X-Content-Type-Options": "nosniff" };
  const forceRefresh = new URL(request.url).searchParams.get("refresh") === "1";
  return Response.json(await getModelCatalog(readOpenAIKey(), { forceRefresh }), { headers });
}

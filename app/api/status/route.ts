import { ALLOWED_MODELS, DEFAULT_MODEL } from "@/lib/tutor";
import { isLocalRequest, localAccessDenied } from "@/lib/local-access";
import {readOpenAIKey} from "@/lib/server-config";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(request: Request) {
  if (!isLocalRequest(request)) return localAccessDenied();
  return Response.json(
    { configured: Boolean(readOpenAIKey()), local: true, defaultModel: DEFAULT_MODEL, models: [...ALLOWED_MODELS] },
    { headers: { "Cache-Control": "no-store", "X-Content-Type-Options": "nosniff" } },
  );
}

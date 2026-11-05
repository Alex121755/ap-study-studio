import { isLocalRequest, localAccessDenied } from '@/lib/local-access';
import { handleLinkRequest } from '@/lib/link-reader';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function POST(request: Request) {
  if (!isLocalRequest(request)) return localAccessDenied();
  return handleLinkRequest(request, { authenticate: async () => isLocalRequest(request) });
}

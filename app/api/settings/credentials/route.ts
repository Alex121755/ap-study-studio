import { createCredentialSettingsHandler } from "@/lib/credential-settings-core";
import { isLocalRequest } from "@/lib/local-access";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export const POST = createCredentialSettingsHandler({ isLocal: isLocalRequest });

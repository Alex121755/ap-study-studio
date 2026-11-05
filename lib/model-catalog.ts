import "server-only";
import { ALLOWED_MODELS } from "./tutor";
import { createModelCatalogResolver } from "./model-catalog-core";

// This request-coalescing cache lives only in the server isolate. No key is serialized.
export const getModelCatalog = createModelCatalogResolver(ALLOWED_MODELS);

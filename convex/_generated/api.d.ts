/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as auth from "../auth.js";
import type * as domains_bills_processing from "../domains/bills/processing.js";
import type * as domains_dashboard_feed from "../domains/dashboard/feed.js";
import type * as domains_dashboard_layout from "../domains/dashboard/layout.js";
import type * as domains_documents_vault from "../domains/documents/vault.js";
import type * as domains_families_members from "../domains/families/members.js";
import type * as health from "../health.js";
import type * as http from "../http.js";
import type * as lib_attentionItems from "../lib/attentionItems.js";
import type * as lib_auth from "../lib/auth.js";
import type * as services_ai_parseDocument from "../services/ai/parseDocument.js";
import type * as services_storage_extractPdfText from "../services/storage/extractPdfText.js";
import type * as services_storage_storeDocumentFile from "../services/storage/storeDocumentFile.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  auth: typeof auth;
  "domains/bills/processing": typeof domains_bills_processing;
  "domains/dashboard/feed": typeof domains_dashboard_feed;
  "domains/dashboard/layout": typeof domains_dashboard_layout;
  "domains/documents/vault": typeof domains_documents_vault;
  "domains/families/members": typeof domains_families_members;
  health: typeof health;
  http: typeof http;
  "lib/attentionItems": typeof lib_attentionItems;
  "lib/auth": typeof lib_auth;
  "services/ai/parseDocument": typeof services_ai_parseDocument;
  "services/storage/extractPdfText": typeof services_storage_extractPdfText;
  "services/storage/storeDocumentFile": typeof services_storage_storeDocumentFile;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {};

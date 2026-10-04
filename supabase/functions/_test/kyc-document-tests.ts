// ============================================================================
// Unit tests: KYC document validation + non-guessable paths.
// No network, no DB, no secrets.
// ============================================================================

import {
  buildObjectPath,
  extensionOf,
  KYC_MAX_BYTES,
  validateKycFile,
} from "../_shared/kyc/limits.ts";

let passed = 0;
let failed = 0;
function check(name: string, cond: boolean) {
  if (cond) {
    passed++;
    console.log(`  PASS  ${name}`);
  } else {
    failed++;
    console.log(`  FAIL  ${name}`);
  }
}

console.log("[1] File type + size validation");
check("jpeg ok", validateKycFile({ name: "id.jpg", type: "image/jpeg", size: 1000 }).ok);
check("png ok", validateKycFile({ name: "id.png", type: "image/png", size: 1000 }).ok);
check("pdf ok", validateKycFile({ name: "id.pdf", type: "application/pdf", size: 1000 }).ok);
check("webp ok", validateKycFile({ name: "id.webp", type: "image/webp", size: 1000 }).ok);
check("missing file rejected", validateKycFile(null).error === "missing_file");
check("empty file rejected", validateKycFile({ name: "id.jpg", type: "image/jpeg", size: 0 }).error === "empty_file");
check("oversize rejected", validateKycFile({ name: "id.jpg", type: "image/jpeg", size: KYC_MAX_BYTES + 1 }).error === "too_large");
check("exactly max size ok", validateKycFile({ name: "id.jpg", type: "image/jpeg", size: KYC_MAX_BYTES }).ok);
check("executable mime rejected", validateKycFile({ name: "id.jpg", type: "application/x-msdownload", size: 10 }).error === "bad_type");
check("svg rejected (script-bearing)", validateKycFile({ name: "id.svg", type: "image/svg+xml", size: 10 }).error === "bad_type");
check("wrong extension rejected", validateKycFile({ name: "id.exe", type: "image/jpeg", size: 10 }).error === "bad_extension");
check("no extension rejected", validateKycFile({ name: "id", type: "image/jpeg", size: 10 }).error === "bad_extension");
check("absent mime falls back to extension (ok)", validateKycFile({ name: "id.jpeg", type: "", size: 10 }).ok);

console.log("\n[2] Extension helper");
check("lowercases", extensionOf("A.PNG") === ".png");
check("no dot -> empty", extensionOf("id") === "");
check("last dot wins", extensionOf("a.b.c.jpg") === ".jpg");

console.log("\n[3] Non-guessable object paths, scoped to the user");
const uid = "11111111-1111-1111-1111-111111111111";
const p1 = buildObjectPath(uid, "front", "passport.jpg", "uuid-1");
check("path is prefixed with the user id", p1.startsWith(`${uid}/`));
check("filename is the uuid, not the original name", p1 === `${uid}/front-uuid-1.jpg`);
check("original name never appears", !p1.includes("passport"));
check("different uuid -> different path", buildObjectPath(uid, "front", "passport.jpg", "uuid-2") !== p1);
check("unknown extension becomes .bin", buildObjectPath(uid, "selfie", "x", "u") === `${uid}/selfie-u.bin`);
check("selfie kind is honoured", buildObjectPath(uid, "selfie", "s.png", "u") === `${uid}/selfie-u.png`);

console.log(`\nResult: ${passed} passed, ${failed} failed.`);
if (failed > 0) Deno.exit(1);

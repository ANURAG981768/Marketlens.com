import crypto from "crypto";

// Server-side certificate signing. The signing key lives only in the server
// environment (CERT_SIGNING_SECRET) and never reaches the browser, so a
// certificate's details cannot be altered or forged without it — unlike the old
// public checksum, whose algorithm shipped in the client bundle.
//
// Token format: `<base64url(payload JSON)>.<base64url(HMAC-SHA256)>`. The body
// is the same base64url(JSON) the legacy reader already understands, so a signed
// token still decodes for display; only the trailing segment changes from a
// 3-char checksum to a real signature.

const SECRET = process.env.CERT_SIGNING_SECRET || "";

export interface CertPayload {
  n: string; // recipient name
  t: string; // track / program title
  d: string; // issue date (ISO)
  id: string; // certificate id
  s: number; // quiz average score (%)
  l: number; // lessons completed
}

function b64url(buf: Buffer): string {
  return buf.toString("base64").replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function sign(body: string): string {
  return b64url(crypto.createHmac("sha256", SECRET).update(body).digest());
}

export function isSigningConfigured(): boolean {
  return SECRET.length > 0;
}

export function signCertificate(p: CertPayload): string {
  const body = b64url(Buffer.from(JSON.stringify(p), "utf8"));
  return `${body}.${sign(body)}`;
}

// Returns the payload only if the signature is valid for our secret. Fails
// closed: an unconfigured secret, a tampered body, or a bad signature all
// return null (so a forged certificate can never read as "verified").
export function verifyCertificate(token: string): CertPayload | null {
  if (!SECRET) return null;
  const [body, sig] = token.split(".");
  if (!body || !sig) return null;
  const expected = sign(body);
  const a = Buffer.from(sig);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return null;
  try {
    const p = JSON.parse(Buffer.from(body.replace(/-/g, "+").replace(/_/g, "/"), "base64").toString("utf8")) as CertPayload;
    if (!p.n || !p.t || !p.id) return null;
    return p;
  } catch {
    return null;
  }
}

// Self-contained certificate verification.
//
// A MarketLens certificate's details are encoded into a compact, URL-safe token
// that travels inside the share link itself. Anyone with the link can decode and
// read the same issued details — no database required. A checksum guards against
// casual tampering or copy/paste corruption. (When cloud accounts are added, this
// can be upgraded to a server-signed, registry-backed check.)

export interface CertPayload {
  n: string;   // recipient name
  t: string;   // track / program title
  d: string;   // issue date (ISO)
  id: string;  // certificate id
  s: number;   // quiz average score (%)
  l: number;   // lessons completed
}

function utf8ToB64url(str: string): string {
  const bytes = new TextEncoder().encode(str);
  let bin = "";
  bytes.forEach((b) => (bin += String.fromCharCode(b)));
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function b64urlToUtf8(s: string): string {
  const norm = s.replace(/-/g, "+").replace(/_/g, "/");
  const bin = atob(norm);
  const bytes = Uint8Array.from(bin, (c) => c.charCodeAt(0));
  return new TextDecoder().decode(bytes);
}

function checksum(json: string): string {
  let h = 0;
  for (let i = 0; i < json.length; i++) h = (h * 31 + json.charCodeAt(i)) >>> 0;
  return (h % 46656).toString(36).padStart(3, "0"); // 3 base-36 chars
}

export function encodeCertificate(p: CertPayload): string {
  const json = JSON.stringify(p);
  return `${utf8ToB64url(json)}.${checksum(json)}`;
}

export function decodeCertificate(token: string): CertPayload | null {
  try {
    const [body, check] = token.split(".");
    if (!body || !check) return null;
    const json = b64urlToUtf8(body);
    if (checksum(json) !== check) return null;
    const p = JSON.parse(json) as CertPayload;
    if (!p.n || !p.t || !p.id) return null;
    return p;
  } catch {
    return null;
  }
}

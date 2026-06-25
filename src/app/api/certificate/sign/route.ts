import { NextRequest, NextResponse } from "next/server";
import { signCertificate } from "@/lib/cert-crypto";

// Issues a server-signed certificate token. The payload is sanitized and bounded
// before signing so a malformed request can't produce a junk credential.
export async function POST(req: NextRequest) {
  try {
    const b = await req.json();
    const p = {
      n: String(b?.n ?? "").trim().slice(0, 80),
      t: String(b?.t ?? "").trim().slice(0, 80),
      d: String(b?.d ?? "").trim().slice(0, 40),
      id: String(b?.id ?? "").trim().slice(0, 40),
      s: Number.isFinite(+b?.s) ? Math.max(0, Math.min(100, Math.round(+b.s))) : 0,
      l: Number.isFinite(+b?.l) ? Math.max(0, Math.min(999, Math.round(+b.l))) : 0,
    };
    if (!p.n || !p.t || !p.id) {
      return NextResponse.json({ error: "invalid" }, { status: 400 });
    }
    return NextResponse.json({ token: signCertificate(p) });
  } catch {
    return NextResponse.json({ error: "invalid" }, { status: 400 });
  }
}

import { NextRequest, NextResponse } from "next/server";
import { verifyCertificate } from "@/lib/cert-crypto";

// Authoritative certificate check: only a token whose HMAC matches our server
// secret comes back as valid. A tampered or forged token returns valid:false.
export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get("token") || "";
  const payload = verifyCertificate(token);
  if (!payload) return NextResponse.json({ valid: false });
  return NextResponse.json({ valid: true, payload });
}

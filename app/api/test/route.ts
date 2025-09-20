// app/api/test/route.ts
import { NextResponse } from 'next/server';

export async function GET() {
  console.log("--- ✅ /api/test ROUTE WAS HIT SUCCESSFULLY ---");
  return NextResponse.json({ message: "Hello from the test API route!" });
}
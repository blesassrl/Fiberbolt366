import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  const body = await req.json()
  const address = body.address || "Indirizzo non fornito"

  return NextResponse.json({
    address,
    coverage: "Disponibile",
    speed: "1 Gbps"
  })
}

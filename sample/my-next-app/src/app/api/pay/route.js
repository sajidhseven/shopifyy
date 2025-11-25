import { NextResponse } from "next/server";

// Dummy payment gateway endpoint — accepts { orderId, amount }
export async function POST(req) {
  try {
    const body = await req.json();
    const { orderId, amount } = body || {};
    console.log("[/api/pay] charged (mock)", { orderId, amount });

    // Simulate a slight delay
    await new Promise((r) => setTimeout(r, 300));

    return NextResponse.json({ status: "success", transactionId: `txn_${Date.now()}` }, { status: 200 });
  } catch (err) {
    console.error("[/api/pay] ERROR:", err);
    return NextResponse.json({ error: "Payment failed" }, { status: 500 });
  }
}

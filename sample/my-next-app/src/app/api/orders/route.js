import prisma from "@/lib/db";
import { NextResponse } from "next/server";
import { getUserFromCookie } from "@/lib/auth";

async function requireUser() {
  const session = await getUserFromCookie();
  if (!session || session.userId === undefined || session.userId === null) {
    return { error: "Not authenticated" };
  }
  let userId = session.userId;
  if (typeof userId === "string") {
    const asNum = Number(userId);
    if (!Number.isNaN(asNum)) userId = asNum;
  }
  return { error: null, userId };
}

// GET /api/orders?orderId=...
export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const orderId = searchParams.get("orderId");

    if (orderId) {
      const order = await prisma.order.findUnique({
        where: { id: orderId },
        include: { items: true },
      });

      if (!order) return NextResponse.json({ error: "Not found" }, { status: 404 });

      return NextResponse.json({ order }, { status: 200 });
    }

    // No orderId -> list orders for current user
    const { error, userId } = await requireUser();
    if (error) return NextResponse.json({ error: "Unauthorized", orders: [] }, { status: 401 });

    const orders = await prisma.order.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      include: { items: true },
    });

    return NextResponse.json({ orders }, { status: 200 });
  } catch (err) {
    console.error("[/api/orders][GET]", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

// POST /api/orders -> create order from cart items and return orderId
export async function POST(req) {
  try {
    const { error, userId } = await requireUser();
    if (error) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const { fullName, address, phone } = body || {};
    if (!address) return NextResponse.json({ error: "Missing address" }, { status: 400 });

    // fetch cart items
    const cartItems = await prisma.cartItem.findMany({ where: { userId }, include: { product: true } });
    if (!cartItems || cartItems.length === 0) {
      return NextResponse.json({ error: "Cart empty" }, { status: 400 });
    }

    const total = cartItems.reduce((s, c) => s + (c.product?.price || 0) * c.qty, 0);

    // create order
    const created = await prisma.order.create({
      data: {
        userId,
        total,
        address: `${fullName || ""}\n${address}\nPhone: ${phone || ""}`,
        items: {
          create: cartItems.map((c) => ({
            productId: c.productId,
            name: c.product?.name || "",
            price: c.product?.price || 0,
            qty: c.qty,
          })),
        },
      },
      include: { items: true },
    });

    // clear cart after creating order
    await prisma.cartItem.deleteMany({ where: { userId } });

    console.log("[/api/orders][POST] created order", created.id);

    return NextResponse.json({ orderId: created.id }, { status: 201 });
  } catch (err) {
    console.error("[/api/orders][POST] ERROR:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

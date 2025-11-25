import prisma from "@/lib/db";
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";

export async function POST(req) {
  try {
    const body = await req.json();
    const { email, password, firstName, lastName } = body || {};

    console.log("[/api/auth/signup] body:", {
      email,
      hasPassword: !!password,
      firstName,
      lastName,
    });

    // require email + password ONLY
    if (!email || !password) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // check if user already exists
    const existing = await prisma.user.findUnique({
      where: { email },
      select: { id: true },
    });

    if (existing) {
      return NextResponse.json(
        { error: "Email already registered" },
        { status: 409 }
      );
    }

    // hash plaintext password
    const hashed = await bcrypt.hash(password, 10);

    // build data for prisma.user.create() based on Prisma schema
    // (this project uses `passwordHash` and doesn't include firstName/lastName)
    const createData = {
      email,
      passwordHash: hashed,
      role: "CUSTOMER",
    };

    console.log("[/api/auth/signup] createData:", createData);

    const createdUser = await prisma.user.create({
      data: createData,
      select: {
        id: true,
        email: true,
        role: true,
      },
    });

    console.log("[/api/auth/signup] createdUser:", createdUser);

    // sign JWT
    const tokenPayload = {
      userId: createdUser.id,
      email: createdUser.email,
      role: createdUser.role,
    };

    // NOTE: We do NOT set the auth cookie after signup.
    // User must log in separately after creating account.
    const displayName = createdUser.email?.split("@")[0] || "User";

    const safeUser = {
      id: createdUser.id,
      email: createdUser.email,
      role: createdUser.role,
      displayName,
    };

    return NextResponse.json(
      {
        user: safeUser,
        message: "Signup successful. Please log in.",
      },
      { status: 201 }
    );
  } catch (err) {
    console.error("[/api/auth/signup] ERROR:", err);
    return NextResponse.json(
      { error: "Signup failed" },
      { status: 500 }
    );
  }
}

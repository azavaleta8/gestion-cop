import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { dni, password, name } = body;

    if (!dni || !password) {
      return NextResponse.json(
        { error: "dni and password are required" },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existing = await prisma.user.findUnique({ where: { dni } });
    if (existing) {
      return NextResponse.json(
        { error: "User already exists" },
        { status: 409 }
      );
    }

    // Hash the password using bcryptjs
    const salt = await bcrypt.genSalt(10);
    const hashed = await bcrypt.hash(password, salt);

    const user = await prisma.user.create({
      data: {
        dni,
        password: hashed,
        name: name || "",
      },
    });

    return NextResponse.json({
      ok: true,
      user: { id: user.id, dni: user.dni, name: user.name },
    });
  } catch (err) {
    console.error("signup error", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}

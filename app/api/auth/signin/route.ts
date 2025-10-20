import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { dni, password } = body;

    if (!dni || !password) {
      return NextResponse.json(
        { error: "dni and password are required" },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({ where: { dni } });
    if (!user) {
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 }
      );
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 }
      );
    }

    // Do not return password
    const safeUser = { id: user.id, dni: user.dni, name: user.name };

    return NextResponse.json({ ok: true, user: safeUser });
  } catch (err) {
    console.error("signin error", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}

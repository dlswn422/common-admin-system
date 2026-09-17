import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import bcrypt from "bcryptjs";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const id = resolvedParams.id;

    if (!id || id === "undefined") {
      return NextResponse.json(
        { error: "유효한 ID가 필요합니다." },
        { status: 400 }
      );
    }

    const body = await request.json();

    const {
      name,
      email,
      phone,
      role_id,
      password,
      is_active,
    } = body;

    const updateData: {
      name?: string;
      email?: string | null;
      phone?: string | null;
      role_id?: string;
      password_hash?: string;
      is_active?: boolean;
    } = {};

    if (name !== undefined) {
      updateData.name = name.trim();
    }

    if (email !== undefined) {
      updateData.email = email || null;
    }

    if (phone !== undefined) {
      updateData.phone = phone || null;
    }

    if (role_id !== undefined) {
      updateData.role_id = role_id;
    }

    if (is_active !== undefined) {
      updateData.is_active = is_active;
    }

    if (password && password.trim() !== "") {
      updateData.password_hash = await bcrypt.hash(password, 12);
    }

    const { data, error } = await supabase
      .from("users")
      .update(updateData)
      .eq("id", id)
      .select(`
        id,
        name,
        email,
        phone,
        role_id,
        is_active,
        created_at
      `);

    if (error) {
      console.error("Supabase PATCH Error:", error.message);

      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }

    if (!data || data.length === 0) {
      return NextResponse.json(
        {
          error:
            "수정할 대상을 찾지 못했거나 권한이 없습니다.",
        },
        { status: 404 }
      );
    }

    return NextResponse.json(data[0]);
  } catch (error: any) {
    console.error("Server PATCH Error:", error.message);

    return NextResponse.json(
      { error: String(error.message) },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const id = resolvedParams.id;

    if (!id || id === "undefined") {
      return NextResponse.json(
        { error: "유효한 ID가 제공되지 않았습니다." },
        { status: 400 }
      );
    }

    const { error } = await supabase
      .from("users")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("Supabase DELETE Error:", error.message);

      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json({
      message: "삭제 성공",
    });
  } catch (error: any) {
    console.error("Server DELETE Error:", error.message);

    return NextResponse.json(
      { error: "삭제 중 서버 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import bcrypt from "bcryptjs";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

// 사용자 전체 목록 조회
export async function GET() {
  try {
    const { data, error } = await supabase
      .from("users")
      .select(`
        *,
        roles (
          id,
          name
        )
      `)
      .order("created_at", { ascending: false });

    if (error) throw error;

    const formattedData = data.map((user: any) => ({
      ...user,
      role_name: user.roles?.name || "미지정",
      password_hash: undefined,
    }));

    return NextResponse.json(formattedData);
  } catch (error: any) {
    console.error("GET 에러 상세:", error.message);

    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}

// 신규 사용자 등록
export async function POST(request: Request) {
  try {
    const body = await request.json();

    const {
      name,
      email,
      phone,
      role_id,
      password,
      is_active,
    } = body;

    if (!name || !password || !role_id) {
      return NextResponse.json(
        {
          error: "이름, 비밀번호, 역할은 필수 항목입니다.",
        },
        { status: 400 }
      );
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const { data, error } = await supabase
      .from("users")
      .insert([
        {
          name: name.trim(),
          email: email || null,
          phone: phone || null,
          role_id,
          password_hash: passwordHash,
          is_active: is_active ?? true,
        },
      ])
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
      console.error("Supabase 등록 에러:", error);

      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json(data[0], { status: 201 });
  } catch (error: any) {
    console.error("서버 내부 에러:", error);

    return NextResponse.json(
      { error: "서버 내부 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
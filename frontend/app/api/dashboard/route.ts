import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SECRET_KEY!
);

export async function GET() {
  try {
    // 사용자 현황 조회
    const { data: users, error: usersError } = await supabase
      .from("users")
      .select(`
        id,
        name,
        email,
        phone,
        role_id,
        is_active,
        created_at,
        roles (
          id,
          name
        )
      `)
      .order("created_at", { ascending: false });

    if (usersError) throw usersError;

    // 역할 현황 조회
    const { data: roles, error: rolesError } = await supabase
      .from("roles")
      .select("id, name, created_at")
      .order("created_at", { ascending: false });

    if (rolesError) throw rolesError;

    // 메뉴 현황 조회
    const { data: menus, error: menusError } = await supabase
      .from("menus")
      .select("id, title, path, sort_order")
      .order("sort_order", { ascending: true });

    if (menusError) throw menusError;

    // 역할별 메뉴 권한 조회
    const { data: roleMenuAccess, error: accessError } = await supabase
      .from("role_menu_access")
      .select("role_id, menu_id");

    if (accessError) throw accessError;

    const userList = users || [];
    const roleList = roles || [];
    const menuList = menus || [];
    const accessList = roleMenuAccess || [];

    const activeUsers = userList.filter(
      (user: any) => user.is_active === true
    ).length;

    const inactiveUsers = userList.length - activeUsers;

    // 역할별 사용자 수 / 메뉴 권한 수
    const roleStats = roleList.map((role: any) => {
      const userCount = userList.filter(
        (user: any) => user.role_id === role.id
      ).length;

      const menuCount = accessList.filter(
        (access: any) => access.role_id === role.id
      ).length;

      return {
        id: role.id,
        name: role.name,
        userCount,
        menuCount,
      };
    });

    // 최근 등록 사용자
    const recentUsers = userList.slice(0, 5).map((user: any) => ({
      id: user.id,
      name: user.name,
      email: user.email,
      is_active: user.is_active,
      role_name: user.roles?.name || "미지정",
      created_at: user.created_at,
    }));

    return NextResponse.json({
      summary: {
        totalUsers: userList.length,
        activeUsers,
        inactiveUsers,
        totalRoles: roleList.length,
        totalMenus: menuList.length,
        totalAccess: accessList.length,
      },
      roleStats,
      recentUsers,
    });
  } catch (error: any) {
    console.error("GET /api/dashboard error:", error);

    return NextResponse.json(
      {
        error:
          error?.message || "대시보드 정보를 불러오는 중 오류가 발생했습니다.",
      },
      { status: 500 }
    );
  }
}
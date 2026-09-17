"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname } from "next/navigation";

interface UserInfo {
  name?: string;
  role?: string;
  role_id?: string | number;
  role_name?: string;
}

interface MenuItem {
  id: string;
  title: string;
  path: string;
}

interface AdminHeaderProps {
  variant?: "compact" | "hero";
}

export default function AdminHeader({
  variant = "compact",
}: AdminHeaderProps) {
  const pathname = usePathname();

  const [user, setUser] = useState<UserInfo | null>(null);
  const [menus, setMenus] = useState<MenuItem[]>([]);

  // 로그인 사용자 및 메뉴 조회
  useEffect(() => {
    const storedUser = localStorage.getItem("user");

    if (!storedUser) {
      setUser(null);
      return;
    }

    try {
      const parsedUser: UserInfo = JSON.parse(storedUser);

      setUser(parsedUser);

      if (!parsedUser.role_id) return;

      const fetchMenus = async () => {
        try {
          const response = await fetch(
            `/api/menus?role_id=${parsedUser.role_id}`,
            {
              cache: "no-store",
            }
          );

          if (!response.ok) return;

          const data = await response.json();

          setMenus(Array.isArray(data) ? data : []);
        } catch (error) {
          console.error("헤더 메뉴 조회 실패:", error);
        }
      };

      fetchMenus();
    } catch (error) {
      console.error("유저 정보 파싱 에러:", error);
      setUser(null);
    }
  }, []);

  // 현재 페이지명 계산
  const displayName = useMemo(() => {
    const normalizedPath =
      pathname.length > 1 && pathname.endsWith("/")
        ? pathname.slice(0, -1)
        : pathname;

    const matchedMenu = menus.find((menu) => {
      const menuPath =
        menu.path.length > 1 && menu.path.endsWith("/")
          ? menu.path.slice(0, -1)
          : menu.path;

      return (
        normalizedPath === menuPath ||
        normalizedPath.startsWith(`${menuPath}/`)
      );
    });

    if (matchedMenu) {
      return matchedMenu.title;
    }

    const fallbackMap: Record<string, string> = {
      dashboard: "대시보드",
      codes: "코드 관리",
      menus: "메뉴 관리",
      users: "사용자 관리",
      roles: "역할 관리",
    };

    const segments = normalizedPath.split("/").filter(Boolean);
    const currentSegment = segments[segments.length - 1] || "dashboard";

    return fallbackMap[currentSegment] || currentSegment;
  }, [menus, pathname]);

  const userName = user?.name || "사용자";
  const userRole = user?.role_name || user?.role || "권한 정보 없음";
  const initial = userName.charAt(0).toUpperCase();

  // 로그인 사용자 영역
  const userArea = (
    <div className="flex shrink-0 items-center gap-3">
      <div className="hidden text-right sm:block">
        <p className="max-w-[140px] truncate text-sm font-semibold text-slate-200">
          {userName}
        </p>

        <p className="mt-0.5 max-w-[140px] truncate text-xs text-slate-500">
          {userRole}
        </p>
      </div>

      <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/[0.08] bg-white/[0.06] text-sm font-bold text-white">
        {initial}
      </div>
    </div>
  );

  // 관리 화면 통합 헤더
  if (variant === "hero") {
    return (
      <div className="flex w-full min-w-0 items-center justify-between gap-4 pl-12 lg:pl-0">
        <div>
          <p className="text-sm font-bold tracking-[-0.02em] text-white">
            Common Admin
          </p>

          <p className="mt-0.5 text-[11px] font-medium text-slate-500">
            Management System
          </p>
        </div>

        {userArea}
      </div>
    );
  }

  // 대시보드 기본 헤더
  return (
    <div className="flex w-full min-w-0 items-center justify-between gap-4">
      <div className="min-w-0">
        <p className="mb-1 text-[11px] font-medium text-slate-500">
          Common Admin
        </p>

        <h1 className="truncate text-lg font-bold tracking-[-0.02em] text-white md:text-xl">
          {displayName}
        </h1>
      </div>

      {userArea}
    </div>
  );
}
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import {
  LayoutDashboard,
  Code2,
  Menu,
  Users,
  ShieldCheck,
  LogOut,
  ChevronRight,
  Settings2,
  type LucideIcon,
} from "lucide-react";

interface MenuItem {
  id: string;
  title: string;
  path: string;
  icon?: string | null;
}

interface UserInfo {
  name: string;
  role?: string;
  role_id?: string | number;
  role_name?: string;
}

interface AdminSidebarProps {
  onLogoutOpen: () => void;
  onNavigate?: () => void;
}

// DB icon 문자열 → 실제 아이콘
const iconByName: Record<string, LucideIcon> = {
  LayoutDashboard,
  Code2,
  Menu,
  Users,
  ShieldCheck,
  Settings2,
};

// icon 값이 없을 때 path 기준 기본 아이콘
const iconByPath: Record<string, LucideIcon> = {
  "/dashboard": LayoutDashboard,
  "/codes": Code2,
  "/menus": Menu,
  "/users": Users,
  "/roles": ShieldCheck,
};

function getMenuIcon(item: MenuItem) {
  if (item.icon && iconByName[item.icon]) {
    return iconByName[item.icon];
  }

  return iconByPath[item.path] || Settings2;
}

export default function AdminSidebar({
  onLogoutOpen,
  onNavigate,
}: AdminSidebarProps) {
  const pathname = usePathname();

  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<UserInfo | null>(null);

  useEffect(() => {
    let isMounted = true;

    const fetchMenus = async () => {
      setIsLoading(true);

      try {
        // 로그인 사용자 조회
        const storedUser = localStorage.getItem("user");

        if (!storedUser) {
          if (!isMounted) return;

          setUser(null);
          setMenuItems([]);
          return;
        }

        let currentUser: UserInfo;

        try {
          currentUser = JSON.parse(storedUser);
        } catch (error) {
          console.error("유저 정보 파싱 에러:", error);
          localStorage.removeItem("user");

          if (!isMounted) return;

          setUser(null);
          setMenuItems([]);
          return;
        }

        if (!isMounted) return;

        setUser(currentUser);

        const roleId = currentUser.role_id;

        if (!roleId || roleId === "undefined" || roleId === "null") {
          console.error("role_id가 없습니다.");
          setMenuItems([]);
          return;
        }

        // 역할별 접근 가능 메뉴 조회
        const response = await fetch(`/api/menus?role_id=${roleId}`, {
          cache: "no-store",
        });

        if (!response.ok) {
          throw new Error("메뉴 응답 오류");
        }

        const data = await response.json();

        if (!isMounted) return;

        setMenuItems(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("사이드바 메뉴 로드 실패:", error);

        if (!isMounted) return;

        setMenuItems([]);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchMenus();

    return () => {
      isMounted = false;
    };
  }, []);

  const displayRole =
    user?.role_name || user?.role || "권한 정보 없음";

  return (
    <aside className="flex h-[100dvh] w-full flex-col overflow-hidden bg-[#0B1220] text-slate-100">
      {/* 브랜드 */}
      <div className="shrink-0 border-b border-white/[0.06] px-5 py-5">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-white shadow-[0_8px_24px_rgba(37,99,235,0.28)]">
            <ShieldCheck className="h-5 w-5" />
          </div>

          <div className="min-w-0">
            <h1 className="truncate text-[17px] font-bold tracking-[-0.02em] text-white">
              Common Admin
            </h1>

            <p className="mt-0.5 truncate text-xs font-medium text-slate-500">
              Management System
            </p>
          </div>
        </div>
      </div>

      {/* 사용자 정보 */}
      <div className="shrink-0 px-4 py-4">
        <div className="rounded-2xl border border-white/[0.07] bg-white/[0.035] px-4 py-3.5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-800 text-sm font-bold text-slate-200">
              {user?.name?.[0] || "U"}
            </div>

            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-white">
                {user?.name || "사용자"}
              </p>

              <p className="mt-0.5 truncate text-xs text-slate-500">
                {displayRole}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 메뉴 */}
      <nav className="custom-scrollbar min-h-0 flex-1 overflow-y-auto px-3 pb-4">
        <p className="px-3 pb-2 pt-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-600">
          Navigation
        </p>

        <ul className="space-y-1">
          {isLoading ? (
            [1, 2, 3, 4].map((item) => (
              <li
                key={item}
                className="h-[52px] animate-pulse rounded-xl bg-white/[0.035]"
              />
            ))
          ) : menuItems.length > 0 ? (
            menuItems.map((item) => {
              const isActive =
                pathname === item.path ||
                pathname.startsWith(`${item.path}/`);

              const Icon = getMenuIcon(item);

              return (
                <li key={item.id}>
                  <Link
                    href={item.path}
                    // 모바일에서는 메뉴 선택 후 Drawer 닫기
                    onClick={onNavigate}
                    className={`group flex min-h-[52px] items-center gap-3 rounded-xl px-3.5 transition-all duration-200 ${
                      isActive
                        ? "bg-blue-600 text-white shadow-[0_8px_20px_rgba(37,99,235,0.18)]"
                        : "text-slate-400 hover:bg-white/[0.05] hover:text-slate-100"
                    }`}
                  >
                    <span
                      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${
                        isActive
                          ? "bg-white/[0.12]"
                          : "bg-white/[0.035] group-hover:bg-white/[0.06]"
                      }`}
                    >
                      <Icon className="h-[18px] w-[18px]" />
                    </span>

                    <span className="min-w-0 flex-1 truncate text-sm font-medium">
                      {item.title}
                    </span>

                    <ChevronRight
                      className={`h-4 w-4 shrink-0 transition-all ${
                        isActive
                          ? "translate-x-0 opacity-100"
                          : "-translate-x-1 opacity-0 group-hover:translate-x-0 group-hover:opacity-60"
                      }`}
                    />
                  </Link>
                </li>
              );
            })
          ) : (
            <li className="px-2 py-8 text-center">
              <p className="text-sm font-medium text-slate-500">
                접근 가능한 메뉴가 없습니다.
              </p>
            </li>
          )}
        </ul>
      </nav>

      {/* 로그아웃 */}
      <div className="shrink-0 border-t border-white/[0.06] p-4">
        <button
          type="button"
          onClick={onLogoutOpen}
          className="flex w-full items-center justify-center gap-2.5 rounded-xl border border-white/[0.07] bg-white/[0.035] px-4 py-3 text-sm font-medium text-slate-400 transition-all hover:border-rose-400/15 hover:bg-rose-500/[0.08] hover:text-rose-300"
        >
          <LogOut className="h-4 w-4" />
          로그아웃
        </button>
      </div>
    </aside>
  );
}
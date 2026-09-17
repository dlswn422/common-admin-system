"use client";

import { useEffect, useState } from "react";
import {
  Users,
  UserCheck,
  UserX,
  ShieldCheck,
  Menu,
  KeyRound,
  LayoutDashboard,
} from "lucide-react";
import AdminHero from "../../components/layout/admin-hero";

type DashboardData = {
  summary: {
    totalUsers: number;
    activeUsers: number;
    inactiveUsers: number;
    totalRoles: number;
    totalMenus: number;
    totalAccess: number;
  };
  roleStats: {
    id: string;
    name: string;
    userCount: number;
    menuCount: number;
  }[];
  recentUsers: {
    id: string;
    name: string;
    email: string | null;
    is_active: boolean;
    role_name: string;
    created_at: string;
  }[];
};

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  // 대시보드 데이터 조회
  const fetchDashboard = async () => {
    try {
      setIsLoading(true);
      setError("");

      const response = await fetch("/api/dashboard", {
        cache: "no-store",
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.error || "대시보드 정보를 불러오지 못했습니다."
        );
      }

      setData(result);
    } catch (error: any) {
      console.error("Dashboard fetch error:", error);

      setError(
        error?.message || "대시보드 정보를 불러오지 못했습니다."
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  // 초기 로딩
  if (isLoading && !data) {
    return (
      <div className="flex min-h-[calc(100vh-120px)] items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="h-9 w-9 animate-spin rounded-full border-4 border-slate-200 border-t-blue-600" />

          <div className="text-center">
            <p className="text-sm font-medium text-slate-700">
              시스템 현황을 불러오는 중입니다.
            </p>

            <p className="mt-1 text-xs text-slate-400">
              잠시만 기다려 주세요.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // 조회 오류
  if (error || !data) {
    return (
      <div className="flex min-h-[calc(100vh-120px)] items-center justify-center">
        <div className="text-center">
          <p className="text-base font-semibold text-slate-800">
            대시보드 정보를 불러오지 못했습니다.
          </p>

          <p className="mt-2 text-sm text-slate-500">
            {error || "알 수 없는 오류가 발생했습니다."}
          </p>

          <button
            type="button"
            onClick={fetchDashboard}
            className="mt-5 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700"
          >
            다시 시도
          </button>
        </div>
      </div>
    );
  }

  // 요약 카드
  const summaryCards = [
    {
      label: "전체 사용자",
      value: data.summary.totalUsers,
      unit: "명",
      icon: Users,
      iconClass: "bg-blue-50 text-blue-600",
    },
    {
      label: "활성 사용자",
      value: data.summary.activeUsers,
      unit: "명",
      icon: UserCheck,
      iconClass: "bg-emerald-50 text-emerald-600",
    },
    {
      label: "비활성 사용자",
      value: data.summary.inactiveUsers,
      unit: "명",
      icon: UserX,
      iconClass: "bg-slate-100 text-slate-500",
    },
    {
      label: "전체 역할",
      value: data.summary.totalRoles,
      unit: "개",
      icon: ShieldCheck,
      iconClass: "bg-violet-50 text-violet-600",
    },
    {
      label: "등록 메뉴",
      value: data.summary.totalMenus,
      unit: "개",
      icon: Menu,
      iconClass: "bg-amber-50 text-amber-600",
    },
    {
      label: "메뉴 권한",
      value: data.summary.totalAccess,
      unit: "건",
      icon: KeyRound,
      iconClass: "bg-cyan-50 text-cyan-600",
    },
  ];

  return (
    <div className="mx-auto max-w-[1600px] space-y-8 pb-20">
      {/* 대시보드 헤더 */}
      <AdminHero
        eyebrow="시스템 현황"
        icon={<LayoutDashboard className="h-3.5 w-3.5" />}
        title="대시보드"
        description="사용자, 역할 및 메뉴 권한 현황을 확인합니다."
      />

      {/* 시스템 현황 */}
      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {summaryCards.map((card) => {
          const Icon = card.icon;

          return (
            <div
              key={card.label}
              className="rounded-[28px] border border-slate-200/80 bg-gradient-to-br from-white to-slate-50/95 p-6 shadow-[0_12px_30px_rgba(15,23,42,0.06)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_20px_45px_rgba(15,23,42,0.1)]"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-medium text-slate-500">
                    {card.label}
                  </p>

                  <div className="mt-3 flex items-end gap-1">
                    <span className="text-[2rem] font-black leading-none tracking-[-0.05em] text-slate-900">
                      {card.value}
                    </span>

                    <span className="pb-0.5 text-sm text-slate-400">
                      {card.unit}
                    </span>
                  </div>
                </div>

                <div
                  className={`flex h-12 w-12 items-center justify-center rounded-2xl ${card.iconClass}`}
                >
                  <Icon className="h-5 w-5" />
                </div>
              </div>
            </div>
          );
        })}
      </section>

      {/* 상세 현황 */}
      <section className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        {/* 역할별 현황 */}
        <div className="overflow-hidden rounded-[30px] border border-slate-200/80 bg-white/95 shadow-[0_16px_36px_rgba(15,23,42,0.06)]">
          <div className="border-b border-slate-100 px-6 py-5">
            <h2 className="text-[1.2rem] font-bold tracking-[-0.03em] text-slate-900">
              역할별 현황
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              역할별 사용자와 접근 가능한 메뉴 수입니다.
            </p>
          </div>

          {data.roleStats.length === 0 ? (
            <div className="px-6 py-16 text-center text-sm text-slate-400">
              등록된 역할이 없습니다.
            </div>
          ) : (
            <div className="overflow-x-auto px-4 py-4 md:px-6">
              <div className="grid grid-cols-[minmax(0,1fr)_120px_120px] rounded-2xl bg-slate-50 px-5 py-3 text-[11px] font-bold tracking-[0.12em] text-slate-400">
                <span>역할</span>
                <span className="text-center">사용자</span>
                <span className="text-center">메뉴 권한</span>
              </div>

              <div className="mt-3 space-y-3">
                {data.roleStats.map((role) => (
                  <div
                    key={role.id}
                    className="grid grid-cols-[minmax(0,1fr)_120px_120px] items-center rounded-[22px] border border-slate-100 bg-white px-5 py-4"
                  >
                    <span className="truncate text-sm font-bold text-slate-800">
                      {role.name}
                    </span>

                    <span className="text-center text-sm text-slate-600">
                      {role.userCount}명
                    </span>

                    <span className="text-center text-sm text-slate-600">
                      {role.menuCount}개
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* 최근 등록 사용자 */}
        <div className="overflow-hidden rounded-[30px] border border-slate-200/80 bg-white/95 shadow-[0_16px_36px_rgba(15,23,42,0.06)]">
          <div className="border-b border-slate-100 px-6 py-5">
            <h2 className="text-[1.2rem] font-bold tracking-[-0.03em] text-slate-900">
              최근 등록 사용자
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              최근 등록된 사용자 5명입니다.
            </p>
          </div>

          {data.recentUsers.length === 0 ? (
            <div className="px-6 py-16 text-center text-sm text-slate-400">
              등록된 사용자가 없습니다.
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {data.recentUsers.map((user) => (
                <div
                  key={user.id}
                  className="flex items-center justify-between px-6 py-5"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="truncate text-sm font-bold text-slate-800">
                        {user.name}
                      </p>

                      <span
                        className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${
                          user.is_active
                            ? "bg-emerald-50 text-emerald-600"
                            : "bg-slate-100 text-slate-500"
                        }`}
                      >
                        {user.is_active ? "활성" : "비활성"}
                      </span>
                    </div>

                    <p className="mt-1 truncate text-xs text-slate-400">
                      {user.email || "이메일 미등록"}
                    </p>
                  </div>

                  <div className="ml-4 text-right">
                    <p className="text-sm font-bold text-slate-600">
                      {user.role_name}
                    </p>

                    <p className="mt-1 text-xs text-slate-400">
                      {user.created_at
                        ? new Date(
                            user.created_at
                          ).toLocaleDateString("ko-KR")
                        : "-"}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
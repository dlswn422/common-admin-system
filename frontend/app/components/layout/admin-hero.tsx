"use client";

import type { ReactNode } from "react";
import AdminHeader from "./admin-header";

interface AdminPageHeroProps {
  eyebrow: string;
  title: string;
  description: string;
  icon: ReactNode;
  actions?: ReactNode;
}

export default function AdminPageHero({
  eyebrow,
  title,
  description,
  icon,
  actions,
}: AdminPageHeroProps) {
  return (
    <section className="soft-scale-in">
      <div className="relative overflow-hidden rounded-[30px] border border-white/10 bg-[linear-gradient(135deg,rgba(8,15,30,0.96),rgba(11,18,36,0.88))] p-6 shadow-[0_28px_70px_rgba(2,6,23,0.18)] backdrop-blur-2xl md:p-7">
        {/* 배경 효과 */}
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.06),transparent_34%,transparent_72%,rgba(59,130,246,0.06))]" />
        <div className="pointer-events-none absolute -left-12 top-0 h-40 w-40 rounded-full bg-blue-500/10 blur-3xl" />
        <div className="pointer-events-none absolute right-0 top-0 h-44 w-44 rounded-full bg-violet-500/10 blur-3xl" />
        <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent" />

        <div className="relative">
          {/* 공통 관리자 정보 */}
          <AdminHeader variant="hero" />

          {/* 페이지 정보 */}
          <div className="mt-5 flex flex-col gap-5 border-t border-white/10 pt-5 xl:flex-row xl:items-end xl:justify-between">
            <div className="max-w-3xl">
              <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-blue-400/15 bg-blue-500/10 px-3 py-1.5 text-[11px] font-semibold tracking-[0.16em] text-blue-200">
                {icon}
                {eyebrow}
              </div>

              <h1 className="text-[1.9rem] font-black leading-none tracking-[-0.05em] text-white md:text-[2.3rem]">
                {title}
              </h1>

              <p className="mt-3 text-sm leading-6 text-slate-300 md:text-[15px]">
                {description}
              </p>
            </div>

            {/* 페이지 액션 */}
            {actions && (
              <div className="flex shrink-0 flex-wrap items-center gap-3">
                {actions}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
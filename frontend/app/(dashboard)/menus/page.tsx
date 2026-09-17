"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
import {
  Plus,
  RotateCw,
  Trash2,
  CheckCircle2,
  X,
  Link2,
  Layers3,
  ListOrdered,
  Settings2,
  Sparkles,
  Navigation,
  AlertTriangle,
} from "lucide-react";
import AdminHero from "../../components/layout/admin-hero";

interface Menu {
  id: string;
  title: string;
  path: string;
  icon: string;
  sort_order: number;
}

interface Toast {
  message: string;
  type: "success" | "error";
}

interface ConfirmConfig {
  isOpen: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  isDestructive?: boolean;
}

export default function MenusPage() {
  const [menus, setMenus] = useState<Menu[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedMenu, setSelectedMenu] = useState<Menu | null>(null);

  // UI 상태
  const [toast, setToast] = useState<Toast | null>(null);

  const [confirmConfig, setConfirmConfig] =
    useState<ConfirmConfig>({
      isOpen: false,
      title: "",
      message: "",
      onConfirm: () => {},
    });

  // 입력 폼
  const [formData, setFormData] = useState({
    title: "",
    path: "",
    icon: "📁",
    sort_order: 1,
  });

  // 토스트 표시
  const showToast = useCallback(
    (
      message: string,
      type: "success" | "error" = "success"
    ) => {
      setToast({ message, type });
      setTimeout(() => setToast(null), 3000);
    },
    []
  );

  // 확인창 열기
  const openConfirm = (
    title: string,
    message: string,
    onConfirm: () => void,
    isDestructive = false
  ) => {
    setConfirmConfig({
      isOpen: true,
      title,
      message,
      onConfirm,
      isDestructive,
    });
  };

  // 메뉴 조회
  const fetchMenus = async () => {
    setIsLoading(true);

    try {
      const res = await fetch("/api/menus?all=true");
      const data = await res.json();

      if (Array.isArray(data)) {
        setMenus(
          data.sort(
            (a: Menu, b: Menu) =>
              a.sort_order - b.sort_order
          )
        );
      }
    } catch (error) {
      showToast("데이터 로드 실패", "error");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMenus();
  }, []);

  // 메뉴 모달 열기
  const openModal = (menu: Menu | null = null) => {
    if (menu) {
      setSelectedMenu(menu);

      setFormData({
        title: menu.title,
        path: menu.path,
        icon: menu.icon,
        sort_order: menu.sort_order,
      });
    } else {
      setSelectedMenu(null);

      setFormData({
        title: "",
        path: "/",
        icon: "📁",
        sort_order: menus.length + 1,
      });
    }

    setIsModalOpen(true);
  };

  // 메뉴 저장
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    const isEdit = !!selectedMenu;

    const url = isEdit
      ? `/api/menus/${selectedMenu.id}`
      : "/api/menus";

    const method = isEdit ? "PATCH" : "POST";

    try {
      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        setIsModalOpen(false);

        showToast(
          isEdit
            ? "메뉴가 수정되었습니다."
            : "새 메뉴가 등록되었습니다."
        );

        fetchMenus();
      } else {
        showToast("저장에 실패했습니다.", "error");
      }
    } catch (error) {
      showToast("오류가 발생했습니다.", "error");
    }
  };

  // 메뉴 삭제
  const handleDeleteAction = async (id: string) => {
    try {
      const res = await fetch(`/api/menus/${id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        showToast("삭제되었습니다.");
        fetchMenus();
      } else {
        showToast("삭제 실패", "error");
      }
    } catch (error) {
      showToast("오류 발생", "error");
    }
  };

  // 마지막 정렬 순서
  const lastSortOrder = useMemo(() => {
    if (!menus.length) return 0;

    return Math.max(
      ...menus.map((menu) => menu.sort_order)
    );
  }, [menus]);

  return (
    <div className="mx-auto max-w-[1600px] space-y-8 pb-20">
      {/* 토스트 */}
      {toast && (
        <div
          className={`fixed right-6 top-6 z-[11000] flex items-center gap-3 rounded-[22px] border border-white/10 px-5 py-4 shadow-2xl backdrop-blur-2xl animate-in slide-in-from-right-8 duration-300 ${
            toast.type === "success"
              ? "bg-slate-900/90 text-white"
              : "bg-rose-600/90 text-white"
          }`}
        >
          <div className="h-2.5 w-2.5 animate-pulse rounded-full bg-current" />

          <p className="text-sm font-bold tracking-tight">
            {toast.message}
          </p>
        </div>
      )}

      {/* 삭제 확인창 */}
      {confirmConfig.isOpen && (
        <div className="fixed inset-0 z-[12000] flex items-center justify-center bg-slate-950/60 p-6 backdrop-blur-md animate-in fade-in">
          <div className="w-full max-w-md rounded-[38px] bg-white p-10 text-center shadow-2xl animate-in zoom-in-95">
            <AlertTriangle
              size={40}
              className="mx-auto mb-6 text-rose-500"
            />

            <h3 className="mb-2 text-2xl font-black text-slate-900">
              {confirmConfig.title}
            </h3>

            <p className="mb-10 leading-relaxed text-slate-500">
              {confirmConfig.message}
            </p>

            <div className="flex gap-4">
              <button
                onClick={() =>
                  setConfirmConfig({
                    ...confirmConfig,
                    isOpen: false,
                  })
                }
                className="flex-1 rounded-2xl py-4 font-bold text-slate-400 transition-all hover:bg-slate-50"
              >
                취소
              </button>

              <button
                onClick={() => {
                  confirmConfig.onConfirm();

                  setConfirmConfig({
                    ...confirmConfig,
                    isOpen: false,
                  });
                }}
                className="flex-[1.6] rounded-2xl bg-slate-900 py-4 font-black text-white shadow-xl transition-all active:scale-95"
              >
                확인
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 메뉴 관리 헤더 */}
      <AdminHero
        eyebrow="내비게이션 관리"
        icon={<Layers3 className="h-3.5 w-3.5" />}
        title="메뉴 관리"
        description="사이드바 메뉴 구조와 경로, 아이콘 및 정렬 순서를 관리합니다."
        actions={
          <>
            <button
              onClick={fetchMenus}
              className="group inline-flex h-12 w-12 items-center justify-center rounded-[18px] border border-white/10 bg-white/[0.06] text-slate-200 transition-all hover:bg-blue-500/10 hover:text-white"
              aria-label="새로고침"
            >
              <RotateCw
                className={`h-5 w-5 transition-transform duration-500 ${
                  isLoading
                    ? "animate-spin"
                    : "group-hover:rotate-180"
                }`}
              />
            </button>

            <button
              onClick={() => openModal()}
              className="inline-flex h-12 items-center gap-2.5 rounded-[18px] bg-gradient-to-r from-blue-600 via-indigo-500 to-violet-500 px-5 text-sm font-extrabold text-white shadow-lg transition-all hover:-translate-y-0.5 active:scale-[0.98]"
            >
              <Plus className="h-4 w-4" />
              새 메뉴 추가
            </button>
          </>
        }
      />

      {/* 메뉴 현황 */}
      <section className="grid gap-4 md:grid-cols-3">
        {[
          {
            label: "전체 메뉴",
            value: menus.length,
            icon: Navigation,
            tone: "bg-blue-500/10 text-blue-600",
          },
          {
            label: "마지막 순번",
            value: lastSortOrder,
            icon: ListOrdered,
            tone: "bg-violet-500/10 text-violet-600",
          },
          {
            label: "운영 상태",
            value: "정상",
            icon: CheckCircle2,
            tone: "bg-emerald-500/10 text-emerald-600",
            pulse: true,
          },
        ].map((item, index) => (
          <div
            key={index}
            className="fade-up group rounded-[28px] border border-slate-200/80 bg-gradient-to-br from-white to-slate-50/95 p-6 shadow-sm transition-all hover:-translate-y-1 hover:shadow-md"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">
                  {item.label}
                </p>

                <p className="mt-3 text-[2rem] font-black tracking-tighter text-slate-900">
                  {typeof item.value === "number"
                    ? item.value.toString().padStart(2, "0")
                    : item.value}
                </p>
              </div>

              <div
                className={`flex h-12 w-12 items-center justify-center rounded-2xl ${item.tone}`}
              >
                <item.icon
                  className={`h-5 w-5 ${
                    item.pulse ? "animate-pulse" : ""
                  }`}
                />
              </div>
            </div>
          </div>
        ))}
      </section>

      {/* 메뉴 목록 */}
      <section className="fade-up flex h-[750px] flex-col overflow-hidden rounded-[30px] border border-slate-200/80 bg-white/95 shadow-[0_16px_36px_rgba(15,23,42,0.06)]">
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5">
          <div>
            <h2 className="text-[1.2rem] font-bold tracking-tight text-slate-900">
              메뉴 레지스트리
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              내비게이션 구조를 관리합니다.
            </p>
          </div>

          <div className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-[11px] font-semibold text-slate-600">
            <Sparkles
              size={14}
              className="text-blue-500"
            />
            실시간 반영
          </div>
        </div>

        <div className="scrollbar-hide flex-1 overflow-y-auto px-4 py-4 md:px-6 md:py-5">
          <div className="hidden rounded-2xl bg-slate-50 px-5 py-3 text-[11px] font-bold uppercase tracking-[0.12em] text-slate-400 md:grid md:grid-cols-[120px_minmax(0,1fr)_120px_220px] md:items-center md:gap-4">
            <span>아이콘</span>
            <span>메뉴 정보</span>
            <span>정렬 순서</span>
            <span className="text-right">작업</span>
          </div>

          <div className="mt-3 space-y-3">
            {isLoading ? (
              [1, 2, 3].map((item) => (
                <div
                  key={item}
                  className="h-28 animate-pulse rounded-[24px] bg-slate-50"
                />
              ))
            ) : (
              menus.map((menu) => (
                <div
                  key={menu.id}
                  className="group relative rounded-[24px] border border-slate-100 bg-white p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:border-blue-200"
                >
                  <div className="grid gap-4 md:grid-cols-[120px_minmax(0,1fr)_120px_220px] md:items-center">
                    <div className="flex h-16 w-16 items-center justify-center rounded-[22px] bg-blue-50 text-3xl shadow-inner transition-all group-hover:bg-slate-900 group-hover:text-white">
                      {menu.icon}
                    </div>

                    <div className="min-w-0">
                      <h3 className="truncate text-[1.2rem] font-black tracking-tight text-slate-900 transition-colors group-hover:text-blue-600">
                        {menu.title}
                      </h3>

                      <div className="mt-2 inline-flex items-center gap-2 rounded-xl bg-blue-50 px-3 py-1.5 text-xs font-bold text-blue-600">
                        <Link2 size={14} />

                        <span className="truncate">
                          {menu.path}
                        </span>
                      </div>
                    </div>

                    <div className="hidden justify-center md:flex">
                      <div className="rounded-full bg-slate-100 px-4 py-2 text-sm font-black tracking-tighter text-slate-700">
                        Order{" "}
                        {menu.sort_order
                          .toString()
                          .padStart(2, "0")}
                      </div>
                    </div>

                    <div className="relative z-50 flex items-center justify-end gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          openModal(menu);
                        }}
                        className="flex h-11 items-center gap-2 rounded-2xl bg-slate-900 px-4 text-sm font-bold text-white shadow-lg transition-all active:scale-95"
                      >
                        <Settings2 size={16} />
                        수정
                      </button>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();

                          openConfirm(
                            "삭제 확인",
                            `[${menu.title}] 메뉴를 삭제할까요?`,
                            () =>
                              handleDeleteAction(menu.id),
                            true
                          );
                        }}
                        className="flex h-11 w-11 items-center justify-center rounded-2xl border border-rose-100 bg-white text-rose-300 transition-all hover:bg-rose-50 hover:text-rose-600"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </section>

      {/* 메뉴 설정 모달 */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-slate-950/45 p-6 backdrop-blur-xl animate-in fade-in">
          <div className="relative w-full max-w-4xl overflow-hidden rounded-[34px] border border-white/10 bg-white shadow-2xl animate-in zoom-in-95">
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-slate-300 to-transparent" />

            <div className="grid lg:grid-cols-[1.15fr_0.85fr]">
              <div className="border-b border-slate-100 p-8 md:p-10 lg:border-b-0 lg:border-r">
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="absolute right-6 top-6 flex h-11 w-11 items-center justify-center rounded-full text-slate-300 transition-all hover:bg-slate-100"
                >
                  <X size={24} />
                </button>

                <div className="mb-8">
                  <div className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-[11px] font-semibold uppercase tracking-widest text-slate-500">
                    <Navigation size={12} />
                    Menu Config
                  </div>

                  <h3 className="mt-4 text-[2rem] font-black tracking-tighter text-slate-900">
                    {selectedMenu
                      ? "메뉴 수정"
                      : "새 메뉴 등록"}
                  </h3>
                </div>

                <form onSubmit={handleSave} className="space-y-6">
                  <div className="grid gap-5 md:grid-cols-[1fr_120px]">
                    <div>
                      <label className="mb-2 block text-sm font-bold text-slate-600">
                        메뉴명
                      </label>

                      <input
                        required
                        value={formData.title}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            title: e.target.value,
                          })
                        }
                        className="h-14 w-full rounded-2xl border border-slate-200 bg-slate-50 px-6 font-bold text-slate-900 outline-none transition-all focus:bg-white focus:ring-4 focus:ring-blue-500/10"
                        placeholder="ex) 사용자 관리"
                      />
                    </div>

                    <div>
                      <label className="mb-2 block text-center text-sm font-bold text-slate-600">
                        아이콘
                      </label>

                      <input
                        required
                        value={formData.icon}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            icon: e.target.value,
                          })
                        }
                        className="h-14 w-full rounded-2xl border border-slate-200 bg-slate-50 text-center text-2xl text-slate-900 outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-bold text-slate-600">
                      접속 경로
                    </label>

                    <div className="relative">
                      <Link2
                        className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300"
                        size={18}
                      />

                      <input
                        required
                        value={formData.path}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            path: e.target.value,
                          })
                        }
                        className="h-14 w-full rounded-2xl border border-slate-200 bg-slate-50 pl-14 pr-6 font-mono font-bold text-blue-600 focus:bg-white"
                        placeholder="ex) /dashboard"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-bold text-slate-600">
                      정렬 순서
                    </label>

                    <div className="relative">
                      <ListOrdered
                        className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300"
                        size={18}
                      />

                      <input
                        type="number"
                        required
                        value={formData.sort_order}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            sort_order: Number(
                              e.target.value
                            ),
                          })
                        }
                        className="h-14 w-full rounded-2xl border border-slate-200 bg-slate-50 pl-14 pr-6 font-black text-slate-900 focus:bg-white"
                        placeholder="ex) 1"
                      />
                    </div>
                  </div>

                  <div className="flex gap-4 pt-4">
                    <button
                      type="button"
                      onClick={() => setIsModalOpen(false)}
                      className="flex-1 rounded-2xl py-4.5 font-bold text-slate-400 hover:bg-slate-50"
                    >
                      취소
                    </button>

                    <button
                      type="submit"
                      className="flex-[2] rounded-2xl bg-slate-900 py-4.5 text-lg font-black text-white transition-all active:scale-95"
                    >
                      저장 완료
                    </button>
                  </div>
                </form>
              </div>

              {/* 메뉴 미리보기 */}
              <div className="flex flex-col items-center justify-center bg-slate-50/50 p-8 text-center lg:p-10">
                <div className="w-full space-y-6">
                  <div className="inline-flex items-center gap-2 text-[11px] font-black uppercase tracking-widest text-slate-400">
                    <Sparkles
                      size={14}
                      className="text-blue-500"
                    />
                    Live Preview
                  </div>

                  <div className="rounded-[30px] border border-slate-200 bg-white p-6 text-left shadow-xl">
                    <div className="flex items-center gap-5">
                      <div className="flex h-20 w-20 animate-pulse items-center justify-center rounded-[26px] bg-slate-900 text-4xl text-white shadow-2xl">
                        {formData.icon || "📁"}
                      </div>

                      <div className="min-w-0 flex-1">
                        <p className="truncate text-2xl font-black text-slate-900">
                          {formData.title || "메뉴명"}
                        </p>

                        <p className="mt-1 text-sm font-bold text-blue-500">
                          {formData.path || "/path"}
                        </p>
                      </div>
                    </div>

                    <div className="mt-8 flex items-center justify-between border-t border-slate-100 pt-6 text-[10px] font-black uppercase tracking-widest text-slate-400">
                      <span>Priority Order</span>

                      <span className="text-lg text-slate-900">
                        #
                        {String(
                          formData.sort_order
                        ).padStart(2, "0")}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }

        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }

        @keyframes fade-up {
          from {
            opacity: 0;
            transform: translateY(10px);
          }

          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .fade-up {
          animation: fade-up 0.5s cubic-bezier(0.16, 1, 0.3, 1)
            forwards;
        }
      `}</style>
    </div>
  );
}
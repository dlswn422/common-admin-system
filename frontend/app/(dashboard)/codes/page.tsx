"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import {
  Plus,
  RotateCw,
  Settings2,
  Trash2,
  Database,
  X,
  ChevronRight,
  Hash,
  Layers,
  LayoutGrid,
  Terminal,
  Sparkles,
  ArrowUpRight,
  CheckCircle2,
  FolderKanban,
  ListOrdered,
  Search,
  Filter,
  AlertTriangle,
} from "lucide-react";

interface CodeGroup {
  id: string;
  group_code: string;
  group_name: string;
}

interface CodeDetail {
  id: string;
  group_id: string;
  code_value: string;
  code_name: string;
  sort_order: number;
  is_use: boolean;
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

export default function CodesPage() {
  // 데이터
  const [groups, setGroups] = useState<CodeGroup[]>([]);
  const [details, setDetails] = useState<CodeDetail[]>([]);
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // 모달
  const [isGroupModalOpen, setIsGroupModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  // 수정 대상
  const [editingGroup, setEditingGroup] = useState<CodeGroup | null>(null);
  const [editingDetail, setEditingDetail] = useState<CodeDetail | null>(null);

  // 그룹 Form
  const [groupForm, setGroupForm] = useState({
    group_code: "",
    group_name: "",
  });

  // 상세 코드 Form
  const [detailForm, setDetailForm] = useState({
    code_value: "",
    code_name: "",
    sort_order: 1,
    is_use: true,
  });

  // 검색 / 필터
  const [detailSearchQuery, setDetailSearchQuery] = useState("");
  const [detailStatusFilter, setDetailStatusFilter] = useState<
    "all" | "active" | "inactive"
  >("all");

  const [toast, setToast] = useState<Toast | null>(null);

  // 삭제 확인창
  const [confirmConfig, setConfirmConfig] = useState<ConfirmConfig>({
    isOpen: false,
    title: "",
    message: "",
    onConfirm: () => {},
  });

  const showToast = useCallback(
    (message: string, type: "success" | "error" = "success") => {
      setToast({ message, type });
      setTimeout(() => setToast(null), 3000);
    },
    []
  );

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

  // 그룹 조회
  const fetchGroups = useCallback(async () => {
    setIsLoading(true);

    try {
      const res = await fetch("/api/codes/groups");
      const data = await res.json();
      const nextGroups = Array.isArray(data) ? data : [];

      setGroups(nextGroups);

      setSelectedGroupId((prev) => {
        if (!nextGroups.length) return null;
        if (prev && nextGroups.some((group) => group.id === prev)) return prev;

        return nextGroups[0].id;
      });
    } catch {
      showToast("코드 그룹을 불러오지 못했습니다.", "error");
    } finally {
      setIsLoading(false);
    }
  }, [showToast]);

  // 상세 코드 조회
  const fetchDetails = useCallback(
    async (groupId: string) => {
      try {
        const res = await fetch(`/api/codes/details?group_id=${groupId}`);
        const data = await res.json();

        setDetails(Array.isArray(data) ? data : []);
      } catch {
        setDetails([]);
        showToast("세부 코드를 불러오지 못했습니다.", "error");
      }
    },
    [showToast]
  );

  useEffect(() => {
    fetchGroups();
  }, [fetchGroups]);

  useEffect(() => {
    if (selectedGroupId) {
      fetchDetails(selectedGroupId);
    } else {
      setDetails([]);
    }
  }, [selectedGroupId, fetchDetails]);

  // 그룹 등록 / 수정 모달
  const openGroupModal = (group?: CodeGroup) => {
    if (group) {
      setEditingGroup(group);
      setGroupForm({
        group_code: group.group_code,
        group_name: group.group_name,
      });
    } else {
      setEditingGroup(null);
      setGroupForm({
        group_code: "",
        group_name: "",
      });
    }

    setIsGroupModalOpen(true);
  };

  // 상세 코드 등록 / 수정 모달
  const openDetailModal = (detail?: CodeDetail) => {
    if (detail) {
      setEditingDetail(detail);

      setDetailForm({
        code_value: detail.code_value,
        code_name: detail.code_name,
        sort_order: detail.sort_order,
        is_use: detail.is_use,
      });
    } else {
      setEditingDetail(null);

      setDetailForm({
        code_value: "",
        code_name: "",
        sort_order: details.length + 1,
        is_use: true,
      });
    }

    setIsDetailModalOpen(true);
  };

  // 그룹 저장
  const handleGroupSave = async (e: React.FormEvent) => {
    e.preventDefault();

    const method = editingGroup ? "PATCH" : "POST";

    const payload = editingGroup
      ? {
          ...groupForm,
          id: editingGroup.id,
        }
      : groupForm;

    try {
      const res = await fetch("/api/codes/groups", {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        setIsGroupModalOpen(false);

        showToast(
          editingGroup
            ? "그룹 정보가 수정되었습니다."
            : "코드 그룹이 등록되었습니다."
        );

        fetchGroups();
      } else {
        showToast("코드 그룹 저장에 실패했습니다.", "error");
      }
    } catch {
      showToast("코드 그룹 저장 중 오류가 발생했습니다.", "error");
    }
  };

  // 상세 코드 저장
  const handleDetailSave = async (e: React.FormEvent) => {
    e.preventDefault();

    const method = editingDetail ? "PATCH" : "POST";

    const payload = editingDetail
      ? {
          ...detailForm,
          id: editingDetail.id,
        }
      : {
          ...detailForm,
          group_id: selectedGroupId,
        };

    try {
      const res = await fetch("/api/codes/details", {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        setIsDetailModalOpen(false);

        showToast(
          editingDetail
            ? "세부 코드가 수정되었습니다."
            : "세부 코드가 등록되었습니다."
        );

        if (selectedGroupId) {
          fetchDetails(selectedGroupId);
        }
      } else {
        showToast("세부 코드 저장에 실패했습니다.", "error");
      }
    } catch {
      showToast("세부 코드 저장 중 오류가 발생했습니다.", "error");
    }
  };

  // 그룹 삭제
  const handleGroupDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();

    openConfirm(
      "코드 그룹 삭제",
      "그룹을 삭제하시겠습니까? 해당 그룹의 모든 세부 코드가 함께 삭제됩니다.",
      async () => {
        try {
          const res = await fetch(`/api/codes/groups?id=${id}`, {
            method: "DELETE",
          });

          if (res.ok) {
            showToast("코드 그룹이 삭제되었습니다.");

            if (selectedGroupId === id) {
              setSelectedGroupId(null);
            }

            fetchGroups();
          } else {
            showToast("그룹 삭제에 실패했습니다.", "error");
          }
        } catch {
          showToast("삭제 중 오류가 발생했습니다.", "error");
        }
      },
      true
    );
  };

  // 상세 코드 삭제
  const handleDetailDelete = (id: string) => {
    openConfirm(
      "세부 코드 삭제",
      "이 코드를 영구 삭제하시겠습니까?",
      async () => {
        try {
          const res = await fetch(`/api/codes/details?id=${id}`, {
            method: "DELETE",
          });

          if (res.ok) {
            showToast("세부 코드가 삭제되었습니다.");

            setDetails((prev) =>
              prev.filter((detail) => detail.id !== id)
            );
          } else {
            showToast("코드 삭제에 실패했습니다.", "error");
          }
        } catch {
          showToast("삭제 중 오류가 발생했습니다.", "error");
        }
      },
      true
    );
  };

  const selectedGroup = useMemo(() => {
    return groups.find((group) => group.id === selectedGroupId) ?? null;
  }, [groups, selectedGroupId]);

  const usedDetailsCount = useMemo(() => {
    return details.filter((detail) => detail.is_use).length;
  }, [details]);

  const filteredDetails = useMemo(() => {
    return details.filter((detail) => {
      const query = detailSearchQuery.trim().toLowerCase();

      const matchesSearch =
        !query ||
        detail.code_value.toLowerCase().includes(query) ||
        detail.code_name.toLowerCase().includes(query);

      const matchesStatus =
        detailStatusFilter === "all" ||
        (detailStatusFilter === "active" && detail.is_use) ||
        (detailStatusFilter === "inactive" && !detail.is_use);

      return matchesSearch && matchesStatus;
    });
  }, [details, detailSearchQuery, detailStatusFilter]);

  const detailSummaryText = useMemo(() => {
    const parts: string[] = [];

    if (detailStatusFilter === "active") {
      parts.push("사용 필터");
    }

    if (detailStatusFilter === "inactive") {
      parts.push("미사용 필터");
    }

    if (detailSearchQuery) {
      parts.push(`검색 결과 ${filteredDetails.length}개`);
    } else if (detailStatusFilter !== "all") {
      parts.push(`결과 ${filteredDetails.length}개`);
    } else {
      parts.push(`총 ${details.length}개 코드`);
    }

    return parts.join(" · ");
  }, [
    detailSearchQuery,
    detailStatusFilter,
    filteredDetails.length,
    details.length,
  ]);

  return (
    <div className="mx-auto max-w-[1600px] space-y-6 pb-10 md:space-y-8 md:pb-20">
      {/* Toast */}
      {toast && (
        <div
          className={`fixed inset-x-3 top-3 z-[11000] flex items-center gap-3 rounded-[18px] border border-white/10 px-4 py-3.5 shadow-[0_24px_50px_rgba(15,23,42,0.2)] backdrop-blur-2xl animate-in slide-in-from-top-4 duration-300 md:left-auto md:right-6 md:top-6 md:max-w-md md:rounded-[22px] md:px-5 md:py-4 ${
            toast.type === "success"
              ? "bg-slate-900/90 text-white"
              : "bg-rose-600/90 text-white"
          }`}
        >
          <div className="h-2.5 w-2.5 shrink-0 rounded-full bg-current animate-pulse" />

          <p className="min-w-0 text-sm font-bold tracking-[-0.02em]">
            {toast.message}
          </p>
        </div>
      )}

      {/* 삭제 확인 */}
      {confirmConfig.isOpen && (
        <div className="fixed inset-0 z-[12000] flex items-center justify-center bg-slate-950/65 p-4 backdrop-blur-md animate-in fade-in duration-300 md:p-6">
          <div className="max-h-[calc(100dvh-2rem)] w-full max-w-md overflow-y-auto rounded-[28px] border border-white/10 bg-white p-6 text-center shadow-[0_40px_100px_rgba(15,23,42,0.3)] animate-in zoom-in-95 md:rounded-[38px] md:p-10">
            <div
              className={`mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-[20px] md:mb-6 md:h-20 md:w-20 md:rounded-[24px] ${
                confirmConfig.isDestructive
                  ? "bg-rose-50 text-rose-500"
                  : "bg-blue-50 text-blue-500"
              }`}
            >
              <AlertTriangle className="h-8 w-8 md:h-10 md:w-10" />
            </div>

            <h3 className="mb-3 text-xl font-black tracking-tighter text-slate-900 md:text-2xl">
              {confirmConfig.title}
            </h3>

            <p className="mb-7 text-sm leading-relaxed text-slate-500 md:mb-10 md:text-[15px]">
              {confirmConfig.message}
            </p>

            <div className="flex flex-col-reverse gap-3 sm:flex-row sm:gap-4">
              <button
                type="button"
                onClick={() =>
                  setConfirmConfig({
                    ...confirmConfig,
                    isOpen: false,
                  })
                }
                className="flex-1 rounded-2xl py-3.5 font-bold text-slate-400 transition-all hover:bg-slate-50 hover:text-slate-600 md:py-4"
              >
                취소
              </button>

              <button
                type="button"
                onClick={() => {
                  confirmConfig.onConfirm();

                  setConfirmConfig({
                    ...confirmConfig,
                    isOpen: false,
                  });
                }}
                className={`flex-[1.6] rounded-2xl py-3.5 font-black text-white shadow-xl transition-all active:scale-95 md:py-4 ${
                  confirmConfig.isDestructive
                    ? "bg-rose-500 shadow-rose-500/25"
                    : "bg-slate-900 shadow-slate-900/25"
                }`}
              >
                확인
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 페이지 상단 */}
      <section className="soft-scale-in">
        <div className="relative overflow-hidden rounded-[24px] border border-white/10 bg-[linear-gradient(135deg,rgba(8,15,30,0.96),rgba(11,18,36,0.88))] p-5 shadow-[0_28px_70px_rgba(2,6,23,0.18)] backdrop-blur-2xl md:rounded-[30px] md:p-8">
          <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.06),transparent_34%,transparent_72%,rgba(59,130,246,0.06))]" />
          <div className="absolute -left-12 top-0 h-40 w-40 rounded-full bg-blue-500/12 blur-3xl" />
          <div className="absolute right-0 top-0 h-44 w-44 rounded-full bg-violet-500/10 blur-3xl" />

          <div className="relative flex items-end justify-between gap-4">
            <div className="min-w-0 max-w-3xl">
              <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-blue-400/15 bg-blue-500/10 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-blue-200 md:mb-4 md:text-[11px]">
                <Database className="h-3.5 w-3.5" />
                코드 사전 관리
              </div>

              <h1 className="text-[1.65rem] font-black leading-none tracking-[-0.05em] text-white md:text-[2.4rem]">
                코드 관리
              </h1>

              <p className="mt-3 max-w-2xl text-[13px] leading-6 text-slate-300 md:mt-4 md:text-[15px] md:leading-7">
                시스템에서 사용하는 코드 그룹과 세부 코드를 관리합니다.
              </p>
            </div>

            <button
              type="button"
              onClick={fetchGroups}
              className="group inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-[16px] border border-white/10 bg-white/[0.06] text-slate-200 shadow-[0_14px_28px_rgba(2,6,23,0.18)] backdrop-blur-xl transition-all duration-300 hover:border-blue-400/20 hover:bg-blue-500/10 hover:text-white md:h-14 md:w-14 md:rounded-[20px]"
              aria-label="새로고침"
            >
              <RotateCw
                className={`h-4.5 w-4.5 transition-transform duration-500 md:h-5 md:w-5 ${
                  isLoading ? "animate-spin" : "group-hover:rotate-180"
                }`}
              />
            </button>
          </div>
        </div>
      </section>

      {/* 요약 */}
      <section className="grid grid-cols-2 gap-3 md:gap-4 xl:grid-cols-4">
        {[
          {
            label: "전체 그룹",
            value: groups.length.toString().padStart(2, "0"),
            icon: Layers,
            tone: "bg-blue-500/10 text-blue-600 ring-blue-500/15",
          },
          {
            label: "선택 그룹 코드 수",
            value: details.length.toString().padStart(2, "0"),
            icon: LayoutGrid,
            tone:
              "bg-violet-500/10 text-violet-600 ring-violet-500/15",
          },
          {
            label: "사용 코드",
            value: usedDetailsCount.toString().padStart(2, "0"),
            icon: CheckCircle2,
            tone:
              "bg-emerald-500/10 text-emerald-600 ring-emerald-500/15",
          },
          {
            label: "현재 선택 그룹",
            value: selectedGroup?.group_name || "-",
            icon: Hash,
            tone:
              "bg-slate-900/10 text-slate-700 ring-slate-300/40",
          },
        ].map((stat) => {
          const Icon = stat.icon;

          return (
            <div
              key={stat.label}
              className="rounded-[20px] border border-slate-200/80 bg-white p-4 shadow-[0_10px_24px_rgba(15,23,42,0.05)] md:rounded-[28px] md:p-6"
            >
              <div className="flex items-start justify-between gap-2 md:gap-4">
                <div className="min-w-0">
                  <p className="truncate text-xs font-medium text-slate-500 md:text-sm">
                    {stat.label}
                  </p>

                  <p className="mt-2 truncate text-[1.45rem] font-black leading-none tracking-[-0.05em] text-slate-900 md:mt-3 md:text-[2rem]">
                    {stat.value}
                  </p>
                </div>

                <div
                  className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ring-1 md:h-12 md:w-12 md:rounded-2xl ${stat.tone}`}
                >
                  <Icon className="h-4 w-4 md:h-5 md:w-5" />
                </div>
              </div>
            </div>
          );
        })}
      </section>

      {/* 그룹 / 상세 */}
      <section className="grid grid-cols-1 gap-5 xl:grid-cols-[360px_minmax(0,1fr)] xl:gap-6">
        {/* 코드 그룹 */}
        <div className="flex h-auto max-h-[440px] flex-col overflow-hidden rounded-[24px] border border-slate-200/80 bg-white/95 shadow-[0_16px_36px_rgba(15,23,42,0.06)] md:max-h-[520px] md:rounded-[30px] xl:h-[750px] xl:max-h-none">
          <div className="shrink-0 border-b border-slate-100 px-5 py-4 md:px-6 md:py-5">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h2 className="text-[1.05rem] font-bold tracking-[-0.03em] text-slate-900 md:text-[1.15rem]">
                  코드 그룹
                </h2>

                <p className="mt-1 text-xs text-slate-500 md:text-sm">
                  전체 그룹 {groups.length}개
                </p>
              </div>

              <button
                type="button"
                onClick={() => openGroupModal()}
                className="group inline-flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900 text-white transition-all hover:bg-blue-600 active:scale-95 md:h-11 md:w-11 md:rounded-2xl"
              >
                <Plus className="h-4 w-4 transition-transform duration-300 group-hover:rotate-90" />
              </button>
            </div>
          </div>

          <div className="scrollbar-hide flex-1 space-y-2.5 overflow-y-auto p-3 md:space-y-3 md:p-4">
            {groups.length === 0 ? (
              <div className="rounded-[20px] border border-dashed border-slate-200 bg-slate-50/80 px-5 py-8 text-center md:rounded-[24px] md:py-10">
                <FolderKanban className="mx-auto mb-3 h-6 w-6 text-slate-300" />

                <p className="text-sm font-semibold text-slate-500">
                  등록된 코드 그룹이 없습니다.
                </p>
              </div>
            ) : (
              groups.map((group) => {
                const isSelected = selectedGroupId === group.id;

                return (
                  <button
                    key={group.id}
                    type="button"
                    onClick={() => setSelectedGroupId(group.id)}
                    className={`group relative w-full overflow-hidden rounded-[18px] border p-4 text-left transition-all md:rounded-[24px] md:p-5 ${
                      isSelected
                        ? "border-slate-900 bg-slate-900 shadow-[0_14px_30px_rgba(15,23,42,0.18)]"
                        : "border-slate-200/80 bg-white hover:border-blue-200"
                    }`}
                  >
                    <div className="relative flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div
                          className={`inline-flex rounded-full px-2.5 py-1 text-[10px] font-black tracking-[0.1em] md:px-3 md:text-[11px] ${
                            isSelected
                              ? "bg-blue-500/15 text-blue-200"
                              : "bg-slate-100 text-slate-500"
                          }`}
                        >
                          {group.group_code}
                        </div>

                        <p
                          className={`mt-2 truncate text-base font-black tracking-[-0.03em] md:mt-3 md:text-[1.15rem] ${
                            isSelected
                              ? "text-white"
                              : "text-slate-900"
                          }`}
                        >
                          {group.group_name}
                        </p>
                      </div>

                      <div className="flex shrink-0 gap-1.5 md:flex-col md:gap-2">
                        <div
                          onClick={(e) => {
                            e.stopPropagation();
                            openGroupModal(group);
                          }}
                          className={`flex h-8 w-8 items-center justify-center rounded-lg transition-all md:rounded-xl ${
                            isSelected
                              ? "bg-white/10 text-white hover:bg-white/20"
                              : "bg-slate-50 text-slate-400 hover:text-blue-600"
                          }`}
                        >
                          <Settings2 size={14} />
                        </div>

                        <div
                          onClick={(e) =>
                            handleGroupDelete(group.id, e)
                          }
                          className={`flex h-8 w-8 items-center justify-center rounded-lg transition-all md:rounded-xl ${
                            isSelected
                              ? "bg-white/10 text-rose-300 hover:bg-rose-500/20"
                              : "bg-rose-50 text-rose-300 hover:text-rose-600"
                          }`}
                        >
                          <Trash2 size={14} />
                        </div>
                      </div>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* 세부 코드 */}
        <div className="flex h-auto flex-col overflow-hidden rounded-[24px] border border-slate-200/80 bg-white/95 shadow-[0_16px_36px_rgba(15,23,42,0.06)] md:rounded-[30px] xl:h-[750px]">
          <div className="shrink-0 border-b border-slate-100 px-4 py-4 md:px-6 md:py-5">
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
                <div className="min-w-0">
                  <div className="inline-flex max-w-full items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-[11px] font-semibold text-slate-500">
                    <ArrowUpRight className="h-3.5 w-3.5 shrink-0" />

                    <span className="truncate">
                      {selectedGroup
                        ? `${selectedGroup.group_code} · ${selectedGroup.group_name}`
                        : "그룹 미선택"}
                    </span>
                  </div>

                  <h2 className="mt-3 text-[1.05rem] font-bold tracking-[-0.03em] text-slate-900 md:text-[1.15rem]">
                    세부 코드
                  </h2>
                </div>

                <button
                  type="button"
                  disabled={!selectedGroupId}
                  onClick={() => openDetailModal()}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-[16px] bg-blue-600 px-5 py-3.5 text-sm font-extrabold text-white transition-all hover:bg-blue-700 disabled:opacity-40 md:w-auto md:rounded-[20px] md:px-6"
                >
                  <Plus className="h-4 w-4" />
                  세부 코드 추가
                </button>
              </div>

              <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_170px_auto] md:items-center">
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-300" />

                  <input
                    type="text"
                    placeholder="코드값 또는 코드명 검색"
                    value={detailSearchQuery}
                    onChange={(e) =>
                      setDetailSearchQuery(e.target.value)
                    }
                    className="w-full rounded-[16px] border border-slate-200 bg-slate-50/80 py-3.5 pl-11 pr-4 text-sm font-semibold text-slate-900 outline-none focus:bg-white focus:ring-4 focus:ring-blue-500/10 md:rounded-[20px]"
                  />
                </div>

                <div className="relative">
                  <Filter className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-300" />

                  <select
                    value={detailStatusFilter}
                    onChange={(e) =>
                      setDetailStatusFilter(
                        e.target.value as
                          | "all"
                          | "active"
                          | "inactive"
                      )
                    }
                    className="w-full appearance-none rounded-[16px] border border-slate-200 bg-slate-50/80 py-3.5 pl-11 pr-10 text-sm font-semibold outline-none md:rounded-[20px]"
                  >
                    <option value="all">전체 상태</option>
                    <option value="active">사용</option>
                    <option value="inactive">미사용</option>
                  </select>

                  <ChevronRight className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 rotate-90 text-slate-300" />
                </div>

                <div className="inline-flex w-fit items-center gap-2 rounded-full bg-slate-100 px-3.5 py-2 text-xs font-semibold text-slate-600 md:text-sm">
                  <Sparkles className="h-3.5 w-3.5" />
                  {detailSummaryText}
                </div>
              </div>
            </div>
          </div>

          <div className="scrollbar-hide flex-1 overflow-y-auto px-3 py-3 md:px-6 md:py-5">
            {/* PC 헤더 */}
            <div className="hidden rounded-2xl bg-slate-50 px-5 py-3 text-[11px] font-bold uppercase tracking-[0.12em] text-slate-400 md:grid md:grid-cols-[100px_180px_minmax(0,1fr)_140px_120px] md:items-center md:gap-4">
              <span>우선순위</span>
              <span>코드값</span>
              <span>코드명</span>
              <span>사용 상태</span>
              <span className="text-right">작업</span>
            </div>

            <div className="mt-2 space-y-3 md:mt-3">
              {selectedGroupId && filteredDetails.length > 0 ? (
                filteredDetails.map((detail) => (
                  <div
                    key={detail.id}
                    className="grid gap-4 rounded-[20px] border border-slate-100 bg-white p-4 shadow-sm transition-all hover:border-blue-200 md:grid-cols-[100px_180px_minmax(0,1fr)_140px_120px] md:items-center md:rounded-[24px] md:px-5 md:py-5"
                  >
                    <div>
                      <p className="mb-1 text-[10px] font-semibold text-slate-400 md:hidden">
                        우선순위
                      </p>

                      <div className="flex items-center gap-2">
                        <ListOrdered className="h-4 w-4 text-slate-400" />

                        <p className="font-black text-slate-900">
                          {detail.sort_order
                            .toString()
                            .padStart(2, "0")}
                        </p>
                      </div>
                    </div>

                    <div>
                      <p className="mb-1 text-[10px] font-semibold text-slate-400 md:hidden">
                        코드값
                      </p>

                      <div className="inline-flex items-center gap-2 rounded-xl bg-slate-100 px-3 py-2 text-sm font-black text-slate-700">
                        <Hash className="h-3.5 w-3.5 text-slate-400" />
                        {detail.code_value}
                      </div>
                    </div>

                    <div className="min-w-0">
                      <p className="mb-1 text-[10px] font-semibold text-slate-400 md:hidden">
                        코드명
                      </p>

                      <p className="truncate font-bold text-slate-900">
                        {detail.code_name}
                      </p>
                    </div>

                    <div>
                      <p className="mb-1 text-[10px] font-semibold text-slate-400 md:hidden">
                        상태
                      </p>

                      <div
                        className={`inline-flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-black ${
                          detail.is_use
                            ? "bg-emerald-50 text-emerald-600"
                            : "bg-rose-50 text-rose-500"
                        }`}
                      >
                        <div
                          className={`h-1.5 w-1.5 rounded-full ${
                            detail.is_use
                              ? "bg-emerald-500"
                              : "bg-rose-500"
                          }`}
                        />

                        {detail.is_use ? "사용" : "미사용"}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 md:justify-end">
                      <button
                        type="button"
                        onClick={() => openDetailModal(detail)}
                        className="flex h-10 flex-1 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-400 transition-all hover:text-blue-600 md:h-11 md:w-11 md:flex-none md:rounded-2xl"
                      >
                        <Settings2 size={16} />
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          handleDetailDelete(detail.id)
                        }
                        className="flex h-10 flex-1 items-center justify-center rounded-xl border border-rose-100 bg-white text-rose-300 transition-all hover:text-rose-600 md:h-11 md:w-11 md:flex-none md:rounded-2xl"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="rounded-[22px] border border-dashed border-slate-200 bg-slate-50/80 px-6 py-16 text-center text-slate-400 md:rounded-[26px] md:py-28">
                  <Terminal className="mx-auto mb-4 h-8 w-8 md:h-10 md:w-10" />

                  <p className="font-bold md:text-lg">
                    {!selectedGroupId
                      ? "코드 그룹을 선택해 주세요"
                      : "등록된 데이터가 없습니다"}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* 그룹 모달 */}
      {isGroupModalOpen && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-slate-950/45 p-4 backdrop-blur-xl animate-in fade-in md:p-6">
          <div className="relative max-h-[calc(100dvh-2rem)] w-full max-w-2xl overflow-y-auto rounded-[26px] border border-white/10 bg-white p-5 shadow-2xl animate-in zoom-in-95 md:rounded-[38px] md:p-10">
            <div className="absolute left-0 top-0 h-1.5 w-full bg-gradient-to-r from-blue-600 to-indigo-600 md:h-2" />

            <button
              type="button"
              onClick={() => setIsGroupModalOpen(false)}
              className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full text-slate-300 transition-all hover:bg-slate-100 hover:text-slate-900 md:right-6 md:top-6 md:h-11 md:w-11"
            >
              <X size={20} />
            </button>

            <div className="mb-6 pr-12 md:mb-8">
              <div className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-[10px] font-semibold uppercase tracking-widest text-slate-500 md:text-[11px]">
                <Layers size={14} />
                Group Definition
              </div>

              <h3 className="mt-4 text-[1.7rem] font-black tracking-tighter text-slate-900 md:text-[2.2rem]">
                {editingGroup ? "그룹 정보 수정" : "그룹 추가"}
              </h3>
            </div>

            <form onSubmit={handleGroupSave} className="space-y-5 md:space-y-6">
              <div>
                <label className="mb-2 block text-xs font-black uppercase tracking-widest text-slate-400">
                  Group Code
                </label>

                <input
                  required
                  value={groupForm.group_code}
                  onChange={(e) =>
                    setGroupForm({
                      ...groupForm,
                      group_code: e.target.value.toUpperCase(),
                    })
                  }
                  className="h-14 w-full rounded-2xl border border-slate-200 bg-slate-50 px-5 text-[15px] font-black uppercase text-blue-600 outline-none focus:bg-white focus:ring-4 focus:ring-blue-500/10 md:h-15 md:px-6"
                  placeholder="ex) AUTH_TYPE"
                />
              </div>

              <div>
                <label className="mb-2 block text-xs font-black uppercase tracking-widest text-slate-400">
                  Group Name
                </label>

                <input
                  required
                  value={groupForm.group_name}
                  onChange={(e) =>
                    setGroupForm({
                      ...groupForm,
                      group_name: e.target.value,
                    })
                  }
                  className="h-14 w-full rounded-2xl border border-slate-200 bg-slate-50 px-5 font-bold text-slate-900 outline-none transition-all focus:bg-white md:h-15 md:px-6"
                  placeholder="ex) 사용자 권한 분류"
                />
              </div>

              <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row md:gap-4 md:pt-4">
                <button
                  type="button"
                  onClick={() => setIsGroupModalOpen(false)}
                  className="flex-1 rounded-2xl py-3.5 font-bold text-slate-400 hover:bg-slate-50 md:py-4.5"
                >
                  취소
                </button>

                <button
                  type="submit"
                  className="flex-[2] rounded-2xl bg-slate-900 py-3.5 text-base font-black text-white transition-all active:scale-95 md:py-4.5 md:text-lg"
                >
                  저장하기
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 상세 코드 모달 */}
      {isDetailModalOpen && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-slate-950/45 p-4 backdrop-blur-xl animate-in fade-in md:p-6">
          <div className="relative max-h-[calc(100dvh-2rem)] w-full max-w-2xl overflow-y-auto rounded-[26px] border border-white/10 bg-white p-5 shadow-2xl animate-in zoom-in-95 md:rounded-[38px] md:p-10">
            <div className="absolute left-0 top-0 h-1.5 w-full bg-gradient-to-r from-emerald-400 to-blue-500 md:h-2" />

            <button
              type="button"
              onClick={() => setIsDetailModalOpen(false)}
              className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full text-slate-300 transition-all hover:bg-slate-100 hover:text-slate-900 md:right-6 md:top-6 md:h-11 md:w-11"
            >
              <X size={20} />
            </button>

            <div className="mb-6 pr-12 md:mb-8">
              <div className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-[10px] font-semibold uppercase tracking-widest text-slate-500 md:text-[11px]">
                <LayoutGrid size={14} />
                Master Detail
              </div>

              <h3 className="mt-4 text-[1.7rem] font-black tracking-tighter text-slate-900 md:text-[2.2rem]">
                {editingDetail ? "세부 코드 수정" : "코드 추가"}
              </h3>
            </div>

            <form onSubmit={handleDetailSave} className="space-y-5 md:space-y-6">
              <div className="grid gap-5 md:grid-cols-2 md:gap-6">
                <div>
                  <label className="mb-2 block text-xs font-black uppercase tracking-widest text-slate-400">
                    Code Value
                  </label>

                  <input
                    required
                    value={detailForm.code_value}
                    onChange={(e) =>
                      setDetailForm({
                        ...detailForm,
                        code_value: e.target.value.toUpperCase(),
                      })
                    }
                    className="h-14 w-full rounded-2xl border border-slate-200 bg-slate-50 px-5 font-black uppercase text-emerald-600 outline-none md:h-15 md:px-6"
                    placeholder="ex) ADM"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-xs font-black uppercase tracking-widest text-slate-400">
                    Display Order
                  </label>

                  <input
                    type="number"
                    required
                    value={detailForm.sort_order}
                    onChange={(e) =>
                      setDetailForm({
                        ...detailForm,
                        sort_order: Number(e.target.value),
                      })
                    }
                    className="h-14 w-full rounded-2xl border border-slate-200 bg-slate-50 px-5 font-black text-slate-900 outline-none focus:bg-white md:h-15 md:px-6"
                    placeholder="ex) 1"
                  />
                </div>
              </div>

              <div>
                <label className="mb-2 block text-xs font-black uppercase tracking-widest text-slate-400">
                  Label Name
                </label>

                <input
                  required
                  value={detailForm.code_name}
                  onChange={(e) =>
                    setDetailForm({
                      ...detailForm,
                      code_name: e.target.value,
                    })
                  }
                  className="h-14 w-full rounded-2xl border border-slate-200 bg-slate-50 px-5 font-bold text-slate-900 outline-none transition-all focus:bg-white md:h-15 md:px-6"
                  placeholder="ex) 시스템 관리자"
                />
              </div>

              <button
                type="button"
                onClick={() =>
                  setDetailForm({
                    ...detailForm,
                    is_use: !detailForm.is_use,
                  })
                }
                className={`flex h-16 w-full items-center justify-between rounded-2xl border-2 px-5 transition-all md:h-18 md:rounded-3xl md:px-8 ${
                  detailForm.is_use
                    ? "border-emerald-200 bg-emerald-50/50 text-emerald-700"
                    : "border-slate-200 bg-slate-50 text-slate-400"
                }`}
              >
                <span className="text-sm font-black md:text-lg">
                  {detailForm.is_use
                    ? "현재 서비스 사용 중"
                    : "사용 중단 상태"}
                </span>

                <div
                  className={`relative h-7 w-12 rounded-full p-1 transition-colors md:h-8 md:w-14 md:p-1.5 ${
                    detailForm.is_use
                      ? "bg-emerald-500"
                      : "bg-slate-300"
                  }`}
                >
                  <div
                    className={`h-5 w-5 rounded-full bg-white shadow-sm transition-all ${
                      detailForm.is_use
                        ? "translate-x-5 md:translate-x-6"
                        : "translate-x-0"
                    }`}
                  />
                </div>
              </button>

              <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row md:gap-4 md:pt-4">
                <button
                  type="button"
                  onClick={() => setIsDetailModalOpen(false)}
                  className="flex-1 rounded-2xl py-3.5 font-bold text-slate-400 md:py-4.5"
                >
                  취소
                </button>

                <button
                  type="submit"
                  className="flex-[1.8] rounded-2xl bg-blue-600 py-3.5 text-base font-black text-white shadow-xl transition-all active:scale-95 md:py-4.5 md:text-lg"
                >
                  설정 완료
                </button>
              </div>
            </form>
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

        @keyframes soft-scale-in {
          from {
            opacity: 0;
            transform: scale(0.98);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        .soft-scale-in {
          animation: soft-scale-in 0.6s cubic-bezier(0.16, 1, 0.3, 1)
            forwards;
        }

        .h-15 {
          height: 3.75rem;
        }

        .h-18 {
          height: 4.5rem;
        }
      `}</style>
    </div>
  );
}
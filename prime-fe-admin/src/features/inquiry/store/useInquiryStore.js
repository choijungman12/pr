import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

const LEGACY_STORAGE_KEY = "propertyInquiries";
const STORE_STORAGE_KEY = "prime_admin_inquiry_store";

function sortByNewest(inquiries = []) {
  return [...inquiries].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );
}

function readLegacyInquiries() {
  if (typeof window === "undefined") return [];

  try {
    const raw = window.localStorage.getItem(LEGACY_STORAGE_KEY);
    if (!raw) return [];

    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? sortByNewest(parsed) : [];
  } catch {
    return [];
  }
}

// inquiry store는 문의 목록 자체와 목록 변경 action만 들고,
// 검색어/선택 상태 같은 화면 전용 값은 UI 컴포넌트에 남긴다.
export const useInquiryStore = create(
  persist(
    (set, get) => ({
      inquiries: [],
      initialized: false,

      initialize: () => {
        if (get().initialized) return;

        // 레거시 propertyInquiries 배열을 한 번 읽어 store 초기 상태로 사용한다.
        const legacyInquiries = readLegacyInquiries();
        set((state) => ({
          inquiries:
            state.inquiries.length > 0 ? state.inquiries : legacyInquiries,
          initialized: true,
        }));
      },

      answerInquiry: ({ id, answer }) =>
        set((state) => ({
          inquiries: state.inquiries.map((inquiry) =>
            inquiry.id === id
              ? {
                  ...inquiry,
                  status: "answered",
                  answer,
                  answeredAt: new Date().toISOString(),
                }
              : inquiry,
          ),
        })),

      deleteInquiry: (id) =>
        set((state) => ({
          inquiries: state.inquiries.filter((inquiry) => inquiry.id !== id),
        })),
    }),
    {
      name: STORE_STORAGE_KEY,
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        inquiries: state.inquiries,
      }),
    },
  ),
);

export const selectPendingInquiryCount = (state) =>
  state.inquiries.filter((inquiry) => inquiry.status === "pending").length;

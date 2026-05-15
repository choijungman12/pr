import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { adminProperties } from "../mocks/propertyCatalogMock";
import { mockPendingProperties } from "../mocks/propertyVerificationMock";

const LEGACY_PENDING_KEY = "pendingProperties";
const LEGACY_APPROVED_KEY = "approvedProperties";
const LEGACY_NOTIFICATION_KEY = "rejectionNotifications";
const STORE_STORAGE_KEY = "prime_admin_property_store";

function readJsonArray(key) {
  if (typeof window === "undefined") return [];

  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return [];

    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function upsertById(list, nextItem) {
  const exists = list.some((item) => item.id === nextItem.id);
  if (!exists) return [nextItem, ...list];

  return list.map((item) => (item.id === nextItem.id ? nextItem : item));
}

function buildInitialCatalog() {
  const legacyApproved = readJsonArray(LEGACY_APPROVED_KEY);

  return legacyApproved.reduce((acc, item) => {
    if (acc.some((property) => property.id === item.id)) return acc;
    return [item, ...acc];
  }, [...adminProperties]);
}

function buildInitialVerificationQueue() {
  const legacyPending = readJsonArray(LEGACY_PENDING_KEY);

  return [
    ...mockPendingProperties,
    ...legacyPending.filter(
      (item) => !mockPendingProperties.some((mock) => mock.id === item.id),
    ),
  ];
}

// property store는 게시 중 목록과 검수 대기 목록을 하나의 도메인으로 관리한다.
export const usePropertyStore = create(
  persist(
    (set, get) => ({
      catalogProperties: [],
      verificationProperties: [],
      notifications: [],
      initialized: false,

      initialize: () => {
        if (get().initialized) return;

        // 기존 localStorage와 feature mock을 한 번 합쳐서
        // 디렉토리 리팩터링 전후의 상태를 끊김 없이 이어간다.
        const legacyNotifications = readJsonArray(LEGACY_NOTIFICATION_KEY);

        set((state) => ({
          catalogProperties:
            state.catalogProperties.length > 0
              ? state.catalogProperties
              : buildInitialCatalog(),
          verificationProperties:
            state.verificationProperties.length > 0
              ? state.verificationProperties
              : buildInitialVerificationQueue(),
          notifications:
            state.notifications.length > 0
              ? state.notifications
              : legacyNotifications,
          initialized: true,
        }));
      },

      addPropertyDraft: (property) =>
        set((state) => ({
          verificationProperties: [
            {
              ...property,
              status: "pending",
              submittedAt: property.submittedAt || new Date().toISOString(),
            },
            ...state.verificationProperties,
          ],
        })),

      approveProperty: (propertyId) =>
        set((state) => {
          const target = state.verificationProperties.find(
            (property) => property.id === propertyId,
          );

          if (!target) return state;

          const approvedItem = {
            ...target,
            status: "approved",
          };

          return {
            // 검수 상태는 verification queue에 남겨두고,
            // 승인된 항목은 게시용 catalog에도 업서트한다.
            verificationProperties: state.verificationProperties.map((property) =>
              property.id === propertyId ? approvedItem : property,
            ),
            catalogProperties: upsertById(
              state.catalogProperties,
              approvedItem,
            ),
          };
        }),

      rejectProperty: ({ propertyId, reason }) =>
        set((state) => {
          const target = state.verificationProperties.find(
            (property) => property.id === propertyId,
          );

          if (!target) return state;

          return {
            verificationProperties: state.verificationProperties.map((property) =>
              property.id === propertyId
                ? { ...property, status: "rejected", rejectionReason: reason }
                : property,
            ),
            notifications: [
              {
                id: `notif-${Date.now()}`,
                propertyId: target.id,
                propertyName: target.name,
                type: "rejected",
                reason,
                createdAt: new Date().toLocaleString("ko-KR", {
                  year: "numeric",
                  month: "2-digit",
                  day: "2-digit",
                  hour: "2-digit",
                  minute: "2-digit",
                }),
                read: false,
              },
              ...state.notifications,
            ],
          };
        }),

      markAllNotificationsRead: () =>
        set((state) => ({
          notifications: state.notifications.map((notification) => ({
            ...notification,
            read: true,
          })),
        })),

      clearNotifications: () => {
        set({ notifications: [] });
      },
    }),
    {
      name: STORE_STORAGE_KEY,
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        catalogProperties: state.catalogProperties,
        verificationProperties: state.verificationProperties,
        notifications: state.notifications,
      }),
    },
  ),
);

export const selectPendingVerificationCount = (state) =>
  state.verificationProperties.filter(
    (property) => property.status === "pending",
  ).length;

export const selectUnreadNotificationCount = (state) =>
  state.notifications.filter((notification) => !notification.read).length;

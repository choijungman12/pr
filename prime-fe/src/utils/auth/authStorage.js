const AUTH_USER_STORAGE_KEY = "authUser";
const AUTH_SESSION_DURATION_MS = 6 * 60 * 60 * 1000;

export const ADMIN_EMAIL = "returnplus.dev@gmail.com";

const getEmailLocalPart = (email = "") => {
  const [localPart = ""] = email.split("@");
  return localPart.trim();
};

export const getUserDisplayName = (user) => {
  const name = user?.name?.trim();
  const nickname = user?.nickname?.trim();
  const emailFallback = getEmailLocalPart(user?.email);

  return name || nickname || emailFallback || "사용자";
};

export const getUserInitial = (user) => {
  const displayName = getUserDisplayName(user);
  return displayName.charAt(0).toUpperCase();
};

export const isAdminUser = (user) =>
  user?.email?.trim().toLowerCase() === ADMIN_EMAIL;

export const normalizeAuthUser = (user) => {
  if (!user) {
    return null;
  }

  const normalizedUser = {
    ...user,
    name: (user.userName ?? user.name ?? "").trim(),
    email: (user.userEmail ?? user.email ?? "").trim(),
    nickname: (user.nickName ?? user.nickname ?? "").trim(),
  };

  return {
    ...normalizedUser,
    displayName: getUserDisplayName(normalizedUser),
  };
};

export const loadStoredAuthUser = () => {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const rawUser = window.localStorage.getItem(AUTH_USER_STORAGE_KEY);

    if (!rawUser) {
      return null;
    }

    const parsedUser = JSON.parse(rawUser);

    if (
      parsedUser?.expiresAt &&
      Number.isFinite(parsedUser.expiresAt) &&
      parsedUser.expiresAt < Date.now()
    ) {
      window.localStorage.removeItem(AUTH_USER_STORAGE_KEY);
      return null;
    }

    return normalizeAuthUser(parsedUser);
  } catch (error) {
    window.localStorage.removeItem(AUTH_USER_STORAGE_KEY);
    return null;
  }
};

export const saveStoredAuthUser = (user) => {
  if (typeof window === "undefined") {
    return;
  }

  const normalizedUser = normalizeAuthUser(user);

  if (!normalizedUser) {
    window.localStorage.removeItem(AUTH_USER_STORAGE_KEY);
    return;
  }

  const now = Date.now();

  window.localStorage.setItem(
    AUTH_USER_STORAGE_KEY,
    JSON.stringify({
      ...normalizedUser,
      storedAt: now,
      expiresAt: now + AUTH_SESSION_DURATION_MS,
    })
  );
};

export const clearStoredAuthUser = () => {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.removeItem(AUTH_USER_STORAGE_KEY);
};

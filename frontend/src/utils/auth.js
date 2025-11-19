// Utility functions for auth-related helpers

export function decodeJwt() {
  try {
    const token = localStorage.getItem("jwtToken");
    if (!token) return null;
    const base64Url = token.split(".")[1];
    if (!base64Url) return null;
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );
    return JSON.parse(jsonPayload);
  } catch (e) {
    return null;
  }
}

export function getDisplayName() {
  const decoded = decodeJwt();
  if (!decoded) return "User";

  // Read potential extra claims where name might be embedded
  const extra = decoded.extraClaims || decoded.extraclaims || decoded.ExtraClaims || {};

  const fullNameFromPartsExtra = extra.firstName || extra.lastName
    ? `${extra.firstName || ""} ${extra.lastName || ""}`.trim()
    : null;

  const fullNameFromParts = decoded.firstName || decoded.lastName
    ? `${decoded.firstName || ""} ${decoded.lastName || ""}`.trim()
    : null;

  const candidates = [
    // Prefer values from extra claims if available
    extra.name,
    extra.fullName,
    fullNameFromPartsExtra,
    extra.firstName,
    extra.username,
    extra.userName,
    extra.email,
    // Fallback to top-level standard fields
    decoded.name,
    decoded.fullName,
    fullNameFromParts,
    decoded.firstName,
    decoded.username,
    decoded.userName,
    decoded.email,
    decoded.sub,
  ].filter(Boolean);

  let name = candidates.length ? String(candidates[0]) : "User";
  if (name.includes("@")) {
    name = name.split("@")[0];
  }
  return name;
}

let __logoutTimerId = null;

export function logout() {
  try {
    localStorage.removeItem("jwtToken");
  } finally {
    window.location.href = "/";
  }
}

export function scheduleAutoLogout() {
  if (__logoutTimerId) {
    clearTimeout(__logoutTimerId);
    __logoutTimerId = null;
  }
  const decoded = decodeJwt();
  if (!decoded || !decoded.exp) {
    return;
  }
  const msUntilExpiry = decoded.exp * 1000 - Date.now();
  if (msUntilExpiry <= 0) {
    logout();
    return;
  }
  __logoutTimerId = setTimeout(() => {
    logout();
  }, msUntilExpiry);
}

export function clearAutoLogout() {
  if (__logoutTimerId) {
    clearTimeout(__logoutTimerId);
    __logoutTimerId = null;
  }
}

export function initAuthAutoLogout() {
  scheduleAutoLogout();
}

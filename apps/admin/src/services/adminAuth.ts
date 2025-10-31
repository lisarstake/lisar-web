export type AdminAuthUser = {
  name: string;
  email: string;
  role: string;
  avatarUrl?: string;
};

const STORAGE_KEY = "adminUser";

export function loginAdmin(email: string, password: string): { success: boolean; message?: string } {
  // Demo: accept any non-empty credentials
  if (!email || !password) return { success: false, message: "Email and password required" };

  const existing = getAdmin();
  const user: AdminAuthUser = existing ?? {
    name: email.split("@")[0],
    email,
    role: "Administrator",
    avatarUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(email)}`,
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
  return { success: true };
}

export function signupAdmin(name: string, email: string, password: string): { success: boolean; message?: string } {
  if (!name || !email || !password) return { success: false, message: "All fields required" };
  const user: AdminAuthUser = {
    name,
    email,
    role: "Administrator",
    avatarUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(name)}`,
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
  return { success: true };
}

export function getAdmin(): AdminAuthUser | null {
  const raw = localStorage.getItem(STORAGE_KEY);
  return raw ? (JSON.parse(raw) as AdminAuthUser) : null;
}

export function logoutAdmin() {
  localStorage.removeItem(STORAGE_KEY);
}

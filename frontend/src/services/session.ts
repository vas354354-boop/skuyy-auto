// Penyimpanan sesi admin di browser
const KEY = 'skuyy_admin_session';

export interface AdminUser {
  id: string;
  email: string;
  role: string;
  name: string;
}

interface Session {
  token: string;
  user: AdminUser;
}

export function getSession(): Session | null {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as Session) : null;
  } catch {
    return null;
  }
}

export const getToken = () => getSession()?.token ?? null;

export function saveSession(session: Session) {
  localStorage.setItem(KEY, JSON.stringify(session));
}

export function clearSession() {
  localStorage.removeItem(KEY);
}

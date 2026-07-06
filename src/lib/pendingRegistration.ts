const PENDING_REG_KEY = 'tessy-pending-registration';

export const EMAIL_CONFIRMATION_REQUIRED = 'EMAIL_CONFIRMATION_REQUIRED';

export type PendingRegistration = {
  userId: string;
  email: string;
  profile: Record<string, unknown>;
};

export function savePendingRegistration(pending: PendingRegistration) {
  try {
    localStorage.setItem(PENDING_REG_KEY, JSON.stringify(pending));
  } catch {
    /* ignore */
  }
}

export function readPendingRegistration(userId: string, email: string): PendingRegistration | null {
  try {
    const raw = localStorage.getItem(PENDING_REG_KEY);
    if (!raw) return null;
    const pending = JSON.parse(raw) as PendingRegistration;
    if (pending.userId !== userId && pending.email.toLowerCase() !== email.toLowerCase()) {
      return null;
    }
    return pending;
  } catch {
    return null;
  }
}

export function clearPendingRegistration() {
  try {
    localStorage.removeItem(PENDING_REG_KEY);
  } catch {
    /* ignore */
  }
}

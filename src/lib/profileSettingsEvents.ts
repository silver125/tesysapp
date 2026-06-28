export const OPEN_PROFILE_SETTINGS_EVENT = 'tessy:open-profile-settings';
export const OPEN_DELETE_ACCOUNT_EVENT = 'tessy:open-delete-account';

export function openProfileSettings() {
  window.dispatchEvent(new Event(OPEN_PROFILE_SETTINGS_EVENT));
}

export function openDeleteAccountDialog() {
  window.dispatchEvent(new Event(OPEN_DELETE_ACCOUNT_EVENT));
}

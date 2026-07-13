export const OPEN_PROFILE_SETTINGS_EVENT = 'tessy:open-profile-settings';
export const OPEN_DELETE_ACCOUNT_EVENT = 'tessy:open-delete-account';
export const OPEN_HELP_EVENT = 'tessy:open-help';

export function openProfileSettings() {
  window.dispatchEvent(new Event(OPEN_PROFILE_SETTINGS_EVENT));
}

export function openDeleteAccountDialog() {
  window.dispatchEvent(new Event(OPEN_DELETE_ACCOUNT_EVENT));
}

export function openHelp() {
  window.dispatchEvent(new Event(OPEN_HELP_EVENT));
}

import { saveAllData } from './storage.ts';
import { showNotification } from './utils.ts';

export function openUserProfile(): void {
  document.getElementById('userProfileModal')?.classList.add('active');
}

export function closeUserProfile(): void {
  document.getElementById('userProfileModal')?.classList.remove('active');
}

export function saveUserProfile(): void {
  // Sync UI to appData
  saveAllData();
  closeUserProfile();
  showNotification('Profile saved', 'success');
}

export function changeAvatar(): void {
  showNotification('Avatar changed', 'success');
}

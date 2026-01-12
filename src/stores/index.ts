/**
 * Stores Barrel Export
 * Re-exports all Zustand stores for convenient importing
 */

export { useAuthStore, type Profile, type UserRole, type Department } from './authStore';
export { useUIStore, type Notification } from './uiStore';

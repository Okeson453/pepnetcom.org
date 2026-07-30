"use client";
import { trpc } from "@/lib/trpc/client";

// All *.get()/*.update() pairs below require the settings:read / settings:admin
// permission respectively (permissionProcedure), not just any admin role —
// see src/shared/rbac/permission-matrix.ts on the backend for what roles
// actually carry those permissions.
export function useGeneralSettings() {
  return trpc.settings.general.get.useQuery();
}
export function useUpdateGeneralSettings() {
  return trpc.settings.general.update.useMutation();
}
export function useCompanySettings() {
  return trpc.settings.company.get.useQuery();
}
export function useUpdateCompanySettings() {
  return trpc.settings.company.update.useMutation();
}
export function useSecuritySettings() {
  return trpc.settings.security.get.useQuery();
}
export function useUpdateSecuritySettings() {
  return trpc.settings.security.update.useMutation();
}
export function useEmailSettings() {
  return trpc.settings.email.get.useQuery();
}
export function useUpdateEmailSettings() {
  return trpc.settings.email.update.useMutation();
}
export function useSmsSettings() {
  return trpc.settings.sms.get.useQuery();
}
export function useUpdateSmsSettings() {
  return trpc.settings.sms.update.useMutation();
}
export function useApiKeys() {
  return trpc.settings.apiKeys.list.useQuery();
}
export function useCreateApiKey(options?: Parameters<typeof trpc.settings.apiKeys.create.useMutation>[0]) {
  const utils = trpc.useUtils();
  return trpc.settings.apiKeys.create.useMutation({
    ...options,
    onSuccess: (...args) => {
      utils.settings.apiKeys.list.invalidate();
      options?.onSuccess?.(...args);
    },
  });
}
export function useRevokeApiKey() {
  const utils = trpc.useUtils();
  return trpc.settings.apiKeys.revoke.useMutation({ onSuccess: () => utils.settings.apiKeys.list.invalidate() });
}
export function useTriggerBackup() {
  return trpc.settings.backup.trigger.useMutation();
}
export function useRestoreBackup() {
  return trpc.settings.backup.restore.useMutation();
}

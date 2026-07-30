"use client";
import { trpc } from "@/lib/trpc/client";

export function useUsers(input: { cursor?: string; limit?: number } = {}) {
  return trpc.users.list.useQuery(input);
}
export function useUser(id: string) {
  return trpc.users.getById.useQuery({ id }, { enabled: Boolean(id) });
}
export function useCreateUser(options?: Parameters<typeof trpc.users.create.useMutation>[0]) {
  const utils = trpc.useUtils();
  return trpc.users.create.useMutation({
    ...options,
    onSuccess: (...args) => {
      utils.users.list.invalidate();
      options?.onSuccess?.(...args);
    },
  });
}
export function useUpdateUser() {
  const utils = trpc.useUtils();
  return trpc.users.update.useMutation({ onSuccess: () => utils.users.list.invalidate() });
}
export function useDeactivateUser() {
  const utils = trpc.useUtils();
  return trpc.users.deactivate.useMutation({ onSuccess: () => utils.users.list.invalidate() });
}
export function useUpdateProfile() {
  return trpc.users.updateProfile.useMutation();
}
export function useRoles() {
  return trpc.users.roles.list.useQuery();
}
export function usePermissions(roleId: string) {
  return trpc.users.roles.permissions.useQuery({ roleId }, { enabled: Boolean(roleId) });
}
export function useUpdateRolePermissions() {
  const utils = trpc.useUtils();
  return trpc.users.roles.updatePermissions.useMutation({ onSuccess: () => utils.users.roles.permissions.invalidate() });
}

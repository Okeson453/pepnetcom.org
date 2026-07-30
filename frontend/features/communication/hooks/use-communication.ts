"use client";
import { trpc } from "@/lib/trpc/client";

export function useMessages() {
  return trpc.communication.messages.list.useQuery();
}
export function useMessageThread(userId: string) {
  return trpc.communication.messages.getThread.useQuery({ userId }, { enabled: Boolean(userId) });
}
export function useSendMessage() {
  const utils = trpc.useUtils();
  return trpc.communication.messages.send.useMutation({ onSuccess: () => utils.communication.messages.list.invalidate() });
}
/**
 * Real shape is session-based (startSession/sendMessage), not the flat
 * `liveChat.list` the old mock assumed — there is no "list all chats"
 * procedure on the backend today, only starting/sending within one.
 */
export function useStartLiveChatSession() {
  return trpc.communication.liveChat.startSession.useMutation();
}
export function useSendLiveChatMessage() {
  return trpc.communication.liveChat.sendMessage.useMutation();
}
export function useCreateEmailBroadcast(options?: Parameters<typeof trpc.communication.emailBroadcast.create.useMutation>[0]) {
  return trpc.communication.emailBroadcast.create.useMutation(options);
}
export function useSendEmailBroadcast() {
  return trpc.communication.emailBroadcast.send.useMutation();
}
export function useNotifications() {
  return trpc.communication.notifications.list.useQuery();
}
export function useMarkNotificationRead() {
  const utils = trpc.useUtils();
  return trpc.communication.notifications.markRead.useMutation({ onSuccess: () => utils.communication.notifications.list.invalidate() });
}

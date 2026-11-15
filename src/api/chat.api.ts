import apiClient from "@/lib/apiClient";
import type { ApiResponse, ChatPayload, ChatReply } from "@/types";

export function sendChatMessage(payload: ChatPayload) {
  return apiClient<ApiResponse<ChatReply>>("/chat", {
    method: "POST",
    body: payload,
  });
}

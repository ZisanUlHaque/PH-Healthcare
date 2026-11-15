export interface ChatPayload {
  message: string;
  sessionId?: string;
}

export interface ChatDoctor {
  id: string;
  name: string;
  specialization: string;
  consultationFee: string | null;
}

export interface ChatReply {
  sessionId: string;
  answer: string;
  doctors: ChatDoctor[];
}

export interface ChatUiMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  doctors?: ChatDoctor[];
  isError?: boolean;
}

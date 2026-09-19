export interface ChatRequestDto {
  content: string | null;
  conversationId: string | null;
}

export interface ChatResponseDto {
  content: string;
  conversationId: string;
}

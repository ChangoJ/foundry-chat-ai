export interface IAgentService {
  startConversation(): Promise<string>;
  sendMessage(conversationId: string, content: string): Promise<string>;
}

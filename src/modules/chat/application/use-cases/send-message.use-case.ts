import { IAgentService } from '../ports/i-agent-service';

export class SendMessageUseCase {
  constructor(private readonly agentService: IAgentService) {}

  async execute(conversationId: string, content: string): Promise<string> {
    return this.agentService.sendMessage(conversationId, content);
  }
}

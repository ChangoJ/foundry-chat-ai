import { IAgentService } from '../ports/i-agent-service';

export class StartConversationUseCase {
  constructor(private readonly agentService: IAgentService) {}

  async execute(): Promise<string> {
    return this.agentService.startConversation();
  }
}

import { FoundryAgentService } from '@/modules/chat/infrastructure/foundry/foundry-agent.service';
import { StartConversationUseCase } from '@/modules/chat/application/use-cases/start-conversation.use-case';
import { SendMessageUseCase } from '@/modules/chat/application/use-cases/send-message.use-case';

let startUseCase: StartConversationUseCase | null = null;
let sendUseCase: SendMessageUseCase | null = null;

function init(): void {
  if (!startUseCase) {
    const agentService = new FoundryAgentService();
    startUseCase = new StartConversationUseCase(agentService);
    sendUseCase = new SendMessageUseCase(agentService);
  }
}

export function getStartConversationUseCase(): StartConversationUseCase {
  init();
  return startUseCase!;
}

export function getSendMessageUseCase(): SendMessageUseCase {
  init();
  return sendUseCase!;
}

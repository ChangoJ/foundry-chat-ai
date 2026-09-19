import { AIProjectClient } from '@azure/ai-projects';
import { DefaultAzureCredential } from '@azure/identity';

import { IAgentService } from '../../application/ports/i-agent-service';
import { FoundryConnectionError } from '../../domain/errors/foundry-connection-error';

export class FoundryAgentService implements IAgentService {
  private readonly agentName: string;
  private readonly client: AIProjectClient;

  constructor() {
    const endpoint = process.env.AZURE_AI_FOUNDRY_ENDPOINT;
    const agentName = process.env.AZURE_AI_AGENT_NAME;

    if (!endpoint) throw new Error('AZURE_AI_FOUNDRY_ENDPOINT is not set');
    if (!agentName) throw new Error('AZURE_AI_AGENT_NAME is not set');

    this.agentName = agentName;
    this.client = new AIProjectClient(endpoint, new DefaultAzureCredential());
  }

  private getAgentClient() {
    return this.client.getOpenAIClient({
      azureConfig: { agentName: this.agentName, allowPreview: true },
    });
  }

  async startConversation(): Promise<string> {
    try {
      const conversation = await this.getAgentClient().conversations.create();
      return conversation.id;
    } catch (error) {
      throw new FoundryConnectionError();
    }
  }

  async sendMessage(conversationId: string, content: string): Promise<string> {
    try {
      const openAIClient = this.getAgentClient();

      await openAIClient.conversations.items.create(conversationId, {
        items: [{ type: 'message', role: 'user', content }],
      });

      const response = await openAIClient.responses.create({ conversation: conversationId });

      return response.output_text;
    } catch (error) {
      throw new FoundryConnectionError();
    }
  }
}

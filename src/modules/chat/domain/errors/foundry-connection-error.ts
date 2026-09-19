import { AppError } from './app-error';

export class FoundryConnectionError extends AppError {
  constructor(message = 'Error de conexión con Azure AI Foundry') {
    super('FOUNDRY_CONNECTION_ERROR', message);
  }
}

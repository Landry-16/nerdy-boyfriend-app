import type { MessageType } from '../../types/database'

export const messageTypeLabels: Record<MessageType, string> = {
  compliment: 'Compliment',
  memory: 'Souvenir',
  quote: 'Citation',
  joke: 'Blague',
  encouragement: 'Encouragement',
  declaration: 'Declaration',
}

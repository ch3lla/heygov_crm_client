import apiClient from './index'

export interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

export interface ChatRequest {
  query: string
  history?: ChatMessage[]
}

export interface AssistantMessage {
  intent?: string
  parameters?: Record<string, any>
  reply: string
}

export interface ToolResult {
  tool: string
  input: Record<string, any>
  result: any
}

export interface ChatResponse {
  status: 'Success' | 'Error'
  data?: {
    message: AssistantMessage
    toolsUsed?: ToolResult[]
  }
  message?: string
}

/**
 * Send a query to the AI assistant
 * 
 * @param query - The user's query
 * @param history - Optional conversation history for context
 * @returns The assistant's response
 * 
 * @example
 * const response = await sendChatMessage('Help me organize my contacts', messages.slice(-10))
 */
export const sendChatMessage = async (
  query: string,
  history?: ChatMessage[]
): Promise<ChatResponse> => {
  try {
    const response = await apiClient.post<ChatResponse>('/assistant/query', {
      query,
      history
    })
    return response.data
  } catch (error: any) {
    console.error('Assistant API error:', error)
    throw error
  }
}



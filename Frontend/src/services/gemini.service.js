import { GoogleGenerativeAI } from '@google/generative-ai';

class GeminiService {
  constructor() {
    this.apiKey = import.meta.env.VITE_GEMINI_API_KEY;
    this.genAI = new GoogleGenerativeAI(this.apiKey);
    this.model = this.genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
    
    // System prompt for medical chatbot with limitations
    this.systemPrompt = `You are a helpful medical information assistant for a hospital management system. You can provide general health information, answer questions about common symptoms, and give general wellness advice. 

IMPORTANT LIMITATIONS:
- You cannot diagnose medical conditions
- You cannot prescribe medications 
- You cannot replace professional medical advice
- Always recommend consulting with a healthcare professional for serious concerns
- Keep responses concise and easy to understand
- Focus on general health education and wellness tips
- If asked about serious symptoms or emergencies, always advise seeking immediate medical attention

You should be helpful, empathetic, and informative while staying within these boundaries. Always remind users that this is for informational purposes only and not a substitute for professional medical advice.`;
  }

  async sendMessage(message, conversationHistory = []) {
    try {
      if (!this.apiKey) {
        throw new Error('Gemini API key not found');
      }

      // Build conversation context
      let prompt = this.systemPrompt + '\n\n';
      
      // Add conversation history
      if (conversationHistory.length > 0) {
        prompt += 'Previous conversation:\n';
        conversationHistory.forEach(msg => {
          prompt += `${msg.role === 'user' ? 'Patient' : 'Assistant'}: ${msg.content}\n`;
        });
        prompt += '\n';
      }
      
      // Add current message
      prompt += `Patient: ${message}\n\nAssistant:`;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      return {
        success: true,
        message: text.trim(),
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('Gemini API Error:', error);
      
      let errorMessage = 'Sorry, I\'m having trouble responding right now. Please try again later.';
      
      if (error.message.includes('API key')) {
        errorMessage = 'AI service is not properly configured. Please contact support.';
      } else if (error.message.includes('quota') || error.message.includes('limit')) {
        errorMessage = 'AI service is temporarily unavailable due to high demand. Please try again later.';
      }

      return {
        success: false,
        error: errorMessage,
        timestamp: new Date().toISOString()
      };
    }
  }

  // Get suggested questions for first-time users
  getSuggestedQuestions() {
    return [
      "What are common signs of dehydration?",
      "How can I improve my sleep quality?",
      "What should I do for a mild headache?",
      "How often should I exercise?",
      "What are healthy eating tips?",
      "When should I see a doctor for a fever?",
      "How can I manage stress better?",
      "What are signs of high blood pressure?"
    ];
  }

  // Validate if a message is appropriate for the medical chatbot
  validateMessage(message) {
    if (!message || typeof message !== 'string') {
      return { valid: false, error: 'Please enter a valid message.' };
    }
    
    if (message.trim().length === 0) {
      return { valid: false, error: 'Please enter a message.' };
    }
    
    if (message.length > 1000) {
      return { valid: false, error: 'Message is too long. Please keep it under 1000 characters.' };
    }

    // Check for inappropriate content patterns
    const inappropriatePatterns = [
      /suicide|kill.*self|harm.*self/i,
      /emergency|urgent|911|ambulance/i,
      /chest.*pain|heart.*attack/i,
      /stroke|can't.*breathe|breathing.*trouble/i
    ];

    for (const pattern of inappropriatePatterns) {
      if (pattern.test(message)) {
        return { 
          valid: false, 
          error: 'For medical emergencies, please call 911 or go to the nearest emergency room immediately. This chat is for general health information only.' 
        };
      }
    }

    return { valid: true };
  }
}

const geminiService = new GeminiService();
export default geminiService;
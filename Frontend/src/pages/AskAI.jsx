import React, { useState, useRef, useEffect } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Bot, 
  Send, 
  User, 
  Loader, 
  AlertTriangle,
  Lightbulb,
  MessageCircle,
  Heart,
  RefreshCw
} from 'lucide-react';
import toast from 'react-hot-toast';
import geminiService from '../services/gemini.service';

const PageContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  height: calc(100vh - 140px);
  display: flex;
  flex-direction: column;
  padding: 0 20px;
`;

const PageHeader = styled.div`
  margin-bottom: 32px;
  text-align: center;
`;

const PageTitle = styled.h1`
  font-size: 42px;
  font-weight: 800;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin: 0 0 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
  
  @media (max-width: 768px) {
    font-size: 32px;
    gap: 12px;
  }
`;

const PageSubtitle = styled.p`
  font-size: 18px;
  color: #64748b;
  margin: 0;
  line-height: 1.6;
  max-width: 600px;
  margin: 0 auto;
  
  @media (max-width: 768px) {
    font-size: 16px;
  }
`;

const ChatContainer = styled.div`
  background: white;
  border-radius: 24px;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
  display: flex;
  flex-direction: column;
  flex: 1;
  overflow: hidden;
  border: 1px solid #e2e8f0;
  backdrop-filter: blur(10px);
  position: relative;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 1px;
    background: linear-gradient(90deg, transparent, #667eea, #764ba2, transparent);
  }
`;

const ChatHeader = styled.div`
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 24px 30px;
  display: flex;
  align-items: center;
  gap: 18px;
  position: relative;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0) 100%);
    pointer-events: none;
  }
`;

const ChatHeaderInfo = styled.div`
  flex: 1;
  z-index: 1;
`;

const ChatHeaderTitle = styled.h3`
  margin: 0;
  font-size: 22px;
  font-weight: 700;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
`;

const ChatHeaderSubtitle = styled.p`
  margin: 0;
  font-size: 14px;
  opacity: 0.95;
  font-weight: 500;
`;

const ChatHeaderActions = styled.div`
  display: flex;
  gap: 12px;
  z-index: 1;
`;

const HeaderButton = styled.button`
  background: rgba(255, 255, 255, 0.15);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 12px;
  color: white;
  cursor: pointer;
  padding: 10px 16px;
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  font-weight: 600;
  transition: all 0.3s ease;
  backdrop-filter: blur(10px);

  &:hover {
    background: rgba(255, 255, 255, 0.25);
    border-color: rgba(255, 255, 255, 0.4);
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }
  
  &:active {
    transform: translateY(0);
  }
`;

const ChatMessages = styled.div`
  flex: 1;
  padding: 32px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 24px;
  background: linear-gradient(180deg, #fafbfc 0%, #f8fafc 100%);
  position: relative;

  &::-webkit-scrollbar {
    width: 6px;
  }

  &::-webkit-scrollbar-track {
    background: transparent;
  }

  &::-webkit-scrollbar-thumb {
    background: linear-gradient(180deg, #667eea, #764ba2);
    border-radius: 3px;
  }

  &::-webkit-scrollbar-thumb:hover {
    background: linear-gradient(180deg, #5a67d8, #6b46c1);
  }
`;

const Message = styled(motion.div)`
  display: flex;
  align-items: flex-start;
  gap: 16px;
  max-width: 85%;
  align-self: ${props => props.$isUser ? 'flex-end' : 'flex-start'};
  flex-direction: ${props => props.$isUser ? 'row-reverse' : 'row'};
`;

const MessageAvatar = styled.div`
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background: ${props => props.$isUser ? 
    'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' : 
    'linear-gradient(135deg, #10b981 0%, #059669 100%)'
  };
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  border: 3px solid white;
  position: relative;
  
  &::after {
    content: '';
    position: absolute;
    width: 12px;
    height: 12px;
    border-radius: 50%;
    background: #10b981;
    bottom: 2px;
    right: 2px;
    border: 2px solid white;
    display: ${props => props.$isUser ? 'none' : 'block'};
  }
`;

const MessageContent = styled.div`
  background: ${props => props.$isUser ? 
    'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' : 
    'white'
  };
  color: ${props => props.$isUser ? 'white' : '#1f2937'};
  padding: 18px 24px;
  border-radius: 24px;
  border-top-${props => props.$isUser ? 'right' : 'left'}-radius: 8px;
  box-shadow: ${props => props.$isUser ? 
    '0 8px 25px rgba(102, 126, 234, 0.25)' : 
    '0 4px 12px rgba(0, 0, 0, 0.08)'
  };
  word-wrap: break-word;
  line-height: 1.7;
  font-size: 15px;
  position: relative;
  border: ${props => props.$isUser ? 'none' : '1px solid #e5e7eb'};
  
  ${props => !props.$isUser && `
    &::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 1px;
      background: linear-gradient(90deg, transparent, #f3f4f6, transparent);
    }
  `}
`;

const MessageTime = styled.div`
  font-size: 12px;
  color: #9ca3af;
  margin-top: 8px;
  text-align: ${props => props.$isUser ? 'right' : 'left'};
  font-weight: 500;
  letter-spacing: 0.025em;
`;

const InputContainer = styled.div`
  padding: 28px 32px;
  border-top: 1px solid #e5e7eb;
  background: linear-gradient(180deg, white 0%, #fafbfc 100%);
  position: relative;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 32px;
    right: 32px;
    height: 1px;
    background: linear-gradient(90deg, transparent, #667eea, #764ba2, transparent);
  }
`;

const InputWrapper = styled.div`
  display: flex;
  gap: 16px;
  align-items: flex-end;
  position: relative;
`;

const MessageInput = styled.textarea`
  flex: 1;
  border: 2px solid #e5e7eb;
  border-radius: 20px;
  padding: 16px 24px;
  font-size: 16px;
  font-family: inherit;
  resize: none;
  min-height: 24px;
  max-height: 120px;
  transition: all 0.3s ease;
  line-height: 1.5;
  background: white;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.04);

  &:focus {
    outline: none;
    border-color: #667eea;
    box-shadow: 0 0 0 4px rgba(102, 126, 234, 0.1), 0 4px 12px rgba(0, 0, 0, 0.08);
    transform: translateY(-1px);
  }

  &::placeholder {
    color: #9ca3af;
    font-weight: 500;
  }
`;

const SendButton = styled(motion.button)`
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 16px;
  padding: 16px 20px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  min-width: 64px;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(135deg, rgba(255,255,255,0.2) 0%, rgba(255,255,255,0) 100%);
    opacity: 0;
    transition: opacity 0.3s ease;
  }

  &:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(102, 126, 234, 0.4);
    
    &::before {
      opacity: 1;
    }
  }

  &:active {
    transform: translateY(-1px);
  }

  &:disabled {
    background: linear-gradient(135deg, #9ca3af 0%, #6b7280 100%);
    cursor: not-allowed;
    transform: none;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }
`;

const SuggestedQuestions = styled.div`
  padding: 32px;
  border-top: 1px solid #e5e7eb;
  background: linear-gradient(180deg, #f8fafc 0%, #f1f5f9 100%);
  position: relative;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 32px;
    right: 32px;
    height: 1px;
    background: linear-gradient(90deg, transparent, #cbd5e0, transparent);
  }
`;

const SuggestionsTitle = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 18px;
  font-weight: 700;
  color: #374151;
  margin-bottom: 24px;
  text-transform: uppercase;
  letter-spacing: 0.025em;
`;

const SuggestionsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 16px;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const SuggestionButton = styled(motion.button)`
  background: white;
  border: 2px solid #e5e7eb;
  border-radius: 16px;
  padding: 20px 24px;
  font-size: 15px;
  text-align: left;
  cursor: pointer;
  transition: all 0.3s ease;
  color: #374151;
  line-height: 1.5;
  font-weight: 500;
  position: relative;
  overflow: hidden;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.04);

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(135deg, #667eea, #764ba2);
    opacity: 0;
    transition: opacity 0.3s ease;
  }

  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0.7) 100%);
    opacity: 0;
    transition: opacity 0.3s ease;
  }

  & > * {
    position: relative;
    z-index: 1;
  }

  &:hover {
    border-color: #667eea;
    transform: translateY(-3px);
    box-shadow: 0 12px 25px rgba(102, 126, 234, 0.15);
    color: #667eea;
    
    &::before {
      opacity: 0.05;
    }
    
    &::after {
      opacity: 1;
    }
  }

  &:active {
    transform: translateY(-1px);
  }
`;

const LoadingMessage = styled(Message)`
  align-self: flex-start;
`;

const LoadingDots = styled.div`
  display: flex;
  gap: 6px;
  align-items: center;
  padding: 15px 20px;
  background: white;
  border-radius: 20px;
  border-top-left-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);

  span {
    width: 10px;
    height: 10px;
    border-radius: 50%;
    background: #cbd5e0;
    animation: loading 1.4s ease-in-out infinite both;

    &:nth-child(1) { animation-delay: -0.32s; }
    &:nth-child(2) { animation-delay: -0.16s; }
  }

  @keyframes loading {
    0%, 80%, 100% { transform: scale(0); }
    40% { transform: scale(1); }
  }
`;

const ErrorMessage = styled.div`
  background: #fed7e2;
  color: #c53030;
  padding: 15px 20px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 14px;
  margin-bottom: 20px;
`;

const WelcomeMessage = styled.div`
  text-align: center;
  padding: 80px 20px;
  color: #64748b;

  .icon {
    margin-bottom: 32px;
  }

  h4 {
    margin: 0 0 20px;
    color: #1f2937;
    font-size: 28px;
    font-weight: 700;
    line-height: 1.3;
  }

  p {
    margin: 0;
    font-size: 18px;
    line-height: 1.7;
    max-width: 600px;
    margin: 0 auto;
    font-weight: 400;
  }
`;

const DisclaimerBadge = styled.div`
  background: linear-gradient(135deg, #fef2f2 0%, #fecaca 100%);
  color: #dc2626;
  padding: 12px 18px;
  border-radius: 12px;
  font-size: 13px;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 8px;
  border: 1px solid #fca5a5;
  box-shadow: 0 2px 4px rgba(220, 38, 38, 0.1);
`;

const AskAI = () => {
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(true);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString('en-US', { 
      hour12: true, 
      hour: 'numeric', 
      minute: '2-digit' 
    });
  };

  const handleSendMessage = async (messageText = inputValue) => {
    if (!messageText.trim() || isLoading) return;

    setError('');
    setShowSuggestions(false);

    // Validate message
    const validation = geminiService.validateMessage(messageText);
    if (!validation.valid) {
      setError(validation.error);
      return;
    }

    // Add user message
    const userMessage = {
      id: Date.now(),
      content: messageText.trim(),
      role: 'user',
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      // Get AI response
      const response = await geminiService.sendMessage(messageText, messages);
      
      if (response.success) {
        const aiMessage = {
          id: Date.now() + 1,
          content: response.message,
          role: 'assistant',
          timestamp: response.timestamp
        };
        setMessages(prev => [...prev, aiMessage]);
      } else {
        setError(response.error);
      }
    } catch (error) {
      console.error('Chat error:', error);
      setError('Failed to get response. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleSuggestionClick = (suggestion) => {
    setInputValue(suggestion);
    inputRef.current?.focus();
  };

  const clearChat = () => {
    setMessages([]);
    setShowSuggestions(true);
    setError('');
    toast.success('Chat cleared');
  };

  return (
    <PageContainer>
      <PageHeader>
        <PageTitle>
          <Bot size={48} />
          AI Health Assistant
        </PageTitle>
        <PageSubtitle>
          Get instant answers to your health questions with our AI-powered assistant. 
          Please note that this is for informational purposes only and should not replace professional medical advice.
        </PageSubtitle>
      </PageHeader>

      <ChatContainer>
        <ChatHeader>
          <Bot size={28} />
          <ChatHeaderInfo>
            <ChatHeaderTitle>Health Assistant Chat</ChatHeaderTitle>
            <ChatHeaderSubtitle>Powered by Google Gemini AI</ChatHeaderSubtitle>
          </ChatHeaderInfo>
          <ChatHeaderActions>
            <DisclaimerBadge>
              <AlertTriangle size={14} />
              Not Medical Advice
            </DisclaimerBadge>
            <HeaderButton onClick={clearChat}>
              <RefreshCw size={16} />
              Clear Chat
            </HeaderButton>
          </ChatHeaderActions>
        </ChatHeader>

        <ChatMessages>
          {messages.length === 0 && showSuggestions && (
            <WelcomeMessage>
              <div className="icon">
                <Heart size={80} color="#667eea" />
              </div>
              <h4>Welcome to your AI Health Assistant!</h4>
              <p>
                I'm here to help answer your general health questions, provide wellness tips, 
                and offer information about common symptoms. Feel free to ask me anything 
                about your health and wellbeing, but remember to consult with healthcare 
                professionals for serious medical concerns.
              </p>
            </WelcomeMessage>
          )}

          {error && (
            <ErrorMessage>
              <AlertTriangle size={16} />
              {error}
            </ErrorMessage>
          )}

          <AnimatePresence>
            {messages.map((message) => (
              <Message
                key={message.id}
                $isUser={message.role === 'user'}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <MessageAvatar $isUser={message.role === 'user'}>
                  {message.role === 'user' ? <User size={20} /> : <Bot size={20} />}
                </MessageAvatar>
                <div>
                  <MessageContent $isUser={message.role === 'user'}>
                    {message.content}
                  </MessageContent>
                  <MessageTime $isUser={message.role === 'user'}>
                    {formatTime(message.timestamp)}
                  </MessageTime>
                </div>
              </Message>
            ))}
          </AnimatePresence>

          {isLoading && (
            <LoadingMessage>
              <MessageAvatar>
                <Bot size={20} />
              </MessageAvatar>
              <LoadingDots>
                <span></span>
                <span></span>
                <span></span>
              </LoadingDots>
            </LoadingMessage>
          )}

          <div ref={messagesEndRef} />
        </ChatMessages>

        {messages.length === 0 && showSuggestions && (
          <SuggestedQuestions>
            <SuggestionsTitle>
              <Lightbulb size={18} />
              Suggested Health Questions
            </SuggestionsTitle>
            <SuggestionsGrid>
              {geminiService.getSuggestedQuestions().map((question, index) => (
                <SuggestionButton
                  key={index}
                  onClick={() => handleSuggestionClick(question)}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {question}
                </SuggestionButton>
              ))}
            </SuggestionsGrid>
          </SuggestedQuestions>
        )}

        <InputContainer>
          <InputWrapper>
            <MessageInput
              ref={inputRef}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleInputKeyPress}
              placeholder="Ask me about your health..."
              disabled={isLoading}
              rows={1}
              style={{ height: 'auto' }}
              onInput={(e) => {
                e.target.style.height = 'auto';
                e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px';
              }}
            />
            <SendButton
              onClick={() => handleSendMessage()}
              disabled={!inputValue.trim() || isLoading}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {isLoading ? <Loader size={20} className="animate-spin" /> : <Send size={20} />}
            </SendButton>
          </InputWrapper>
        </InputContainer>
      </ChatContainer>
    </PageContainer>
  );
};

export default AskAI;
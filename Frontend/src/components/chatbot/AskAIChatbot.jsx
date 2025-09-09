import React, { useState, useRef, useEffect } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MessageCircle, 
  Send, 
  Bot, 
  User, 
  Loader, 
  AlertTriangle,
  Lightbulb,
  X,
  Minimize2,
  Maximize2
} from 'lucide-react';
import toast from 'react-hot-toast';
import geminiService from '../../services/gemini.service';

const ChatbotContainer = styled(motion.div)`
  background: white;
  border-radius: 15px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  display: flex;
  flex-direction: column;
  height: ${props => props.isMinimized ? '60px' : '500px'};
  transition: height 0.3s ease;
  overflow: hidden;
`;

const ChatbotHeader = styled.div`
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 15px 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  cursor: ${props => props.isMinimized ? 'pointer' : 'default'};
`;

const HeaderLeft = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
`;

const HeaderTitle = styled.h3`
  margin: 0;
  font-size: 18px;
  font-weight: 600;
`;

const HeaderSubtitle = styled.p`
  margin: 0;
  font-size: 12px;
  opacity: 0.8;
`;

const HeaderControls = styled.div`
  display: flex;
  gap: 8px;
`;

const ControlButton = styled.button`
  background: rgba(255, 255, 255, 0.2);
  border: none;
  border-radius: 6px;
  color: white;
  cursor: pointer;
  padding: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.2s ease;

  &:hover {
    background: rgba(255, 255, 255, 0.3);
  }
`;

const ChatMessages = styled.div`
  flex: 1;
  padding: 20px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 15px;
  background: #f8fafc;

  &::-webkit-scrollbar {
    width: 6px;
  }

  &::-webkit-scrollbar-track {
    background: #f1f1f1;
    border-radius: 3px;
  }

  &::-webkit-scrollbar-thumb {
    background: #cbd5e0;
    border-radius: 3px;
  }

  &::-webkit-scrollbar-thumb:hover {
    background: #a0aec0;
  }
`;

const Message = styled(motion.div)`
  display: flex;
  align-items: flex-start;
  gap: 10px;
  max-width: 85%;
  align-self: ${props => props.$isUser ? 'flex-end' : 'flex-start'};
  flex-direction: ${props => props.$isUser ? 'row-reverse' : 'row'};
`;

const MessageAvatar = styled.div`
  width: 35px;
  height: 35px;
  border-radius: 50%;
  background: ${props => props.$isUser ? '#667eea' : '#48bb78'};
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
`;

const MessageContent = styled.div`
  background: ${props => props.$isUser ? '#667eea' : 'white'};
  color: ${props => props.$isUser ? 'white' : '#2d3748'};
  padding: 12px 16px;
  border-radius: 18px;
  border-top-${props => props.$isUser ? 'right' : 'left'}-radius: 6px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  word-wrap: break-word;
  line-height: 1.5;
`;

const MessageTime = styled.div`
  font-size: 11px;
  color: #a0aec0;
  margin-top: 5px;
  text-align: ${props => props.$isUser ? 'right' : 'left'};
`;

const InputContainer = styled.div`
  padding: 20px;
  border-top: 1px solid #e2e8f0;
  background: white;
`;

const InputWrapper = styled.div`
  display: flex;
  gap: 10px;
  align-items: flex-end;
`;

const MessageInput = styled.textarea`
  flex: 1;
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  padding: 12px 16px;
  font-size: 14px;
  font-family: inherit;
  resize: none;
  min-height: 20px;
  max-height: 80px;
  transition: border-color 0.2s ease;

  &:focus {
    outline: none;
    border-color: #667eea;
  }

  &::placeholder {
    color: #a0aec0;
  }
`;

const SendButton = styled(motion.button)`
  background: #667eea;
  color: white;
  border: none;
  border-radius: 10px;
  padding: 12px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.2s ease;

  &:hover:not(:disabled) {
    background: #5a67d8;
  }

  &:disabled {
    background: #a0aec0;
    cursor: not-allowed;
  }
`;

const SuggestedQuestions = styled.div`
  padding: 20px;
  border-top: 1px solid #e2e8f0;
  background: #f8fafc;
`;

const SuggestionsTitle = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  font-weight: 600;
  color: #4a5568;
  margin-bottom: 15px;
`;

const SuggestionsGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
`;

const SuggestionButton = styled(motion.button)`
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 10px 12px;
  font-size: 12px;
  text-align: left;
  cursor: pointer;
  transition: all 0.2s ease;
  color: #4a5568;

  &:hover {
    border-color: #667eea;
    background: #f7fafc;
    color: #667eea;
  }
`;

const LoadingMessage = styled(Message)`
  align-self: flex-start;
`;

const LoadingDots = styled.div`
  display: flex;
  gap: 4px;
  align-items: center;
  padding: 12px 16px;
  background: white;
  border-radius: 18px;
  border-top-left-radius: 6px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);

  span {
    width: 8px;
    height: 8px;
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
  padding: 12px 16px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  margin-bottom: 15px;
`;

const WelcomeMessage = styled.div`
  text-align: center;
  padding: 40px 20px;
  color: #718096;

  h4 {
    margin: 0 0 10px;
    color: #4a5568;
    font-size: 16px;
  }

  p {
    margin: 0;
    font-size: 14px;
    line-height: 1.5;
  }
`;

const AskAIChatbot = () => {
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isMinimized, setIsMinimized] = useState(false);
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

  const toggleMinimize = () => {
    setIsMinimized(!isMinimized);
  };

  const clearChat = () => {
    setMessages([]);
    setShowSuggestions(true);
    setError('');
  };

  return (
    <ChatbotContainer
      isMinimized={isMinimized}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <ChatbotHeader 
        isMinimized={isMinimized}
        onClick={isMinimized ? toggleMinimize : undefined}
      >
        <HeaderLeft>
          <Bot size={24} />
          <div>
            <HeaderTitle>AskAI Health Assistant</HeaderTitle>
            {!isMinimized && (
              <HeaderSubtitle>Get instant answers to your health questions</HeaderSubtitle>
            )}
          </div>
        </HeaderLeft>
        <HeaderControls>
          {!isMinimized && (
            <ControlButton onClick={clearChat} title="Clear chat">
              <X size={16} />
            </ControlButton>
          )}
          <ControlButton onClick={toggleMinimize} title={isMinimized ? "Expand" : "Minimize"}>
            {isMinimized ? <Maximize2 size={16} /> : <Minimize2 size={16} />}
          </ControlButton>
        </HeaderControls>
      </ChatbotHeader>

      {!isMinimized && (
        <>
          <ChatMessages>
            {messages.length === 0 && showSuggestions && (
              <WelcomeMessage>
                <Bot size={48} color="#cbd5e0" />
                <h4>Welcome to your AI Health Assistant!</h4>
                <p>
                  I can help answer general health questions, provide wellness tips, 
                  and offer information about common symptoms. Ask me anything about 
                  your health and wellbeing!
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
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                >
                  <MessageAvatar $isUser={message.role === 'user'}>
                    {message.role === 'user' ? <User size={18} /> : <Bot size={18} />}
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
                  <Bot size={18} />
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
                <Lightbulb size={16} />
                Suggested Questions
              </SuggestionsTitle>
              <SuggestionsGrid>
                {geminiService.getSuggestedQuestions().slice(0, 6).map((question, index) => (
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
                  e.target.style.height = Math.min(e.target.scrollHeight, 80) + 'px';
                }}
              />
              <SendButton
                onClick={() => handleSendMessage()}
                disabled={!inputValue.trim() || isLoading}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {isLoading ? <Loader size={18} className="animate-spin" /> : <Send size={18} />}
              </SendButton>
            </InputWrapper>
          </InputContainer>
        </>
      )}
    </ChatbotContainer>
  );
};

export default AskAIChatbot;
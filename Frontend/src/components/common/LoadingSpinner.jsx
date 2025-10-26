import React from 'react';
import styled, { keyframes } from 'styled-components';
import { Heart } from 'lucide-react';

const spin = keyframes`
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
`;

const pulse = keyframes`
  0%, 100% { transform: scale(1); opacity: 1; }
  50% { transform: scale(1.1); opacity: 0.8; }
`;

const LoadingContainer = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, rgba(248, 250, 252, 0.95) 0%, rgba(241, 245, 249, 0.98) 100%);
  backdrop-filter: blur(8px);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  z-index: var(--z-modal);
`;

const SpinnerWrapper = styled.div`
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: var(--spacing-8);
`;

const Spinner = styled.div`
  width: 80px;
  height: 80px;
  border: 4px solid var(--primary-100);
  border-top: 4px solid var(--primary-600);
  border-radius: 50%;
  animation: ${spin} 1.2s linear infinite;
  box-shadow: var(--shadow-sm);
`;

const HeartIcon = styled.div`
  position: absolute;
  animation: ${pulse} 2.5s ease-in-out infinite;
  filter: drop-shadow(0 2px 4px rgba(14, 165, 233, 0.3));
`;

const LoadingText = styled.div`
  color: var(--text-secondary);
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-medium);
  text-align: center;
  max-width: 300px;
  line-height: var(--line-height-relaxed);
`;

const LoadingSpinner = ({ text = 'Loading...' }) => {
  return (
    <LoadingContainer>
      <SpinnerWrapper>
        <Spinner />
        <HeartIcon>
          <Heart size={32} color="#0ea5e9" fill="#0ea5e9" />
        </HeartIcon>
      </SpinnerWrapper>
      <LoadingText>{text}</LoadingText>
    </LoadingContainer>
  );
};

export default LoadingSpinner;
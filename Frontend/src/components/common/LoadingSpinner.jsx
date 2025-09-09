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
  background: rgba(255, 255, 255, 0.9);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  z-index: 9999;
`;

const SpinnerWrapper = styled.div`
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const Spinner = styled.div`
  width: 60px;
  height: 60px;
  border: 4px solid #e2e8f0;
  border-top: 4px solid #667eea;
  border-radius: 50%;
  animation: ${spin} 1s linear infinite;
`;

const HeartIcon = styled.div`
  position: absolute;
  animation: ${pulse} 2s ease-in-out infinite;
`;

const LoadingText = styled.div`
  margin-top: 20px;
  color: #4a5568;
  font-size: 16px;
  font-weight: 500;
`;

const LoadingSpinner = ({ text = 'Loading...' }) => {
  return (
    <LoadingContainer>
      <SpinnerWrapper>
        <Spinner />
        <HeartIcon>
          <Heart size={24} color="#667eea" fill="#667eea" />
        </HeartIcon>
      </SpinnerWrapper>
      <LoadingText>{text}</LoadingText>
    </LoadingContainer>
  );
};

export default LoadingSpinner;
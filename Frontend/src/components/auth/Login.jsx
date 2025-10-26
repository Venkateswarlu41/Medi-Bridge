import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Mail, Lock, Heart } from 'lucide-react';
import toast from 'react-hot-toast';

const LoginContainer = styled.div`
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(180deg, #f8fafb 0%, #ffffff 100%);
  padding: 20px;
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: -20%;
    right: -10%;
    width: 600px;
    height: 600px;
    background: radial-gradient(circle, rgba(84, 169, 234, 0.08) 0%, transparent 70%);
    border-radius: 50%;
  }

  &::after {
    content: '';
    position: absolute;
    bottom: -20%;
    left: -10%;
    width: 500px;
    height: 500px;
    background: radial-gradient(circle, rgba(132, 88, 253, 0.06) 0%, transparent 70%);
    border-radius: 50%;
  }
`;

const LoginCard = styled(motion.div)`
  background: white;
  border-radius: 24px;
  padding: 48px;
  width: 100%;
  max-width: 480px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.08);
  border: 1px solid #f3f4f6;
  position: relative;
  z-index: 1;

  @media (max-width: 480px) {
    padding: 32px 24px;
  }
`;

const Logo = styled.div`
  text-align: center;
  margin-bottom: 40px;
`;

const LogoIcon = styled.div`
  width: 70px;
  height: 70px;
  background: linear-gradient(135deg, #54a9ea 0%, #8458fd 100%);
  border-radius: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 20px;
  box-shadow: 0 10px 30px rgba(84, 169, 234, 0.3);
`;

const Title = styled.h1`
  font-size: 32px;
  font-weight: 700;
  color: #1a1a1a;
  margin: 0 0 8px;
  font-family: var(--font-family-heading);
`;

const Subtitle = styled.p`
  color: #6b7280;
  margin: 0 0 32px;
  font-size: 15px;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const InputGroup = styled.div`
  position: relative;
`;

const InputIcon = styled.div`
  position: absolute;
  left: 15px;
  top: 50%;
  transform: translateY(-50%);
  color: #a0aec0;
  z-index: 1;
`;

const Input = styled.input`
  width: 100%;
  padding: 16px 16px 16px 48px;
  border: 2px solid #e5e7eb;
  border-radius: 12px;
  font-size: 15px;
  transition: all 0.3s ease;
  background: #f9fafb;
  font-family: var(--font-family-body);

  &:focus {
    outline: none;
    border-color: #54a9ea;
    background: white;
    box-shadow: 0 0 0 4px rgba(84, 169, 234, 0.1);
  }

  &::placeholder {
    color: #9ca3af;
  }
`;

const PasswordToggle = styled.button`
  position: absolute;
  right: 16px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  color: #9ca3af;
  cursor: pointer;
  padding: 6px;
  transition: all 0.2s ease;
  
  &:hover {
    color: #54a9ea;
  }
`;

const LoginButton = styled(motion.button)`
  width: 100%;
  padding: 16px;
  background: linear-gradient(135deg, #54a9ea 0%, #8458fd 100%);
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s ease;
  font-family: var(--font-family-button);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  box-shadow: 0 10px 30px rgba(84, 169, 234, 0.3);

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 15px 40px rgba(84, 169, 234, 0.4);
  }

  &:disabled {
    opacity: 0.7;
    cursor: not-allowed;
    transform: none;
  }
`;

const ErrorMessage = styled.div`
  color: #e53e3e;
  font-size: 14px;
  margin-top: 5px;
  text-align: center;
`;

const RegisterLink = styled.div`
  text-align: center;
  margin-top: 24px;
  color: #6b7280;
  font-size: 14px;
  
  a {
    color: #54a9ea;
    text-decoration: none;
    font-weight: 600;
    
    &:hover {
      color: #8458fd;
      text-decoration: underline;
    }
  }
`;

const DemoCredentials = styled.div`
  margin-top: 24px;
  padding: 20px;
  background: linear-gradient(135deg, rgba(84, 169, 234, 0.05) 0%, rgba(132, 88, 253, 0.05) 100%);
  border-radius: 16px;
  border: 2px solid rgba(84, 169, 234, 0.1);
`;

const DemoTitle = styled.h4`
  margin: 0 0 12px;
  color: #1a1a1a;
  font-size: 15px;
  font-weight: 600;
  font-family: var(--font-family-heading);
`;

const DemoRole = styled.div`
  margin-bottom: 10px;
  font-size: 13px;
  color: #4b5563;
  display: flex;
  align-items: center;
  justify-content: space-between;
  
  strong {
    color: #1a1a1a;
    font-weight: 600;
  }

  button {
    margin-left: 10px;
    font-size: 11px;
    padding: 4px 12px;
    background: linear-gradient(135deg, #54a9ea 0%, #8458fd 100%);
    color: white;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    font-weight: 600;
    transition: all 0.2s ease;

    &:hover {
      transform: translateY(-1px);
      box-shadow: 0 4px 12px rgba(84, 169, 234, 0.3);
    }
  }
`;

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    const result = await login(formData.email, formData.password);

    if (result.success) {
      toast.success('Login successful!');
      navigate('/dashboard');
    } else {
      setError(result.message);
      toast.error(result.message);
    }

    setIsLoading(false);
  };

  const fillDemoCredentials = (email, password) => {
    setFormData({ email, password });
  };

  return (
    <LoginContainer>
      <LoginCard
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Logo>
          <LogoIcon>
            <Heart size={30} color="white" />
          </LogoIcon>
          <Title>Hygeia-Nexus</Title>
          <Subtitle>Hospital Management System</Subtitle>
        </Logo>

        <Form onSubmit={handleSubmit}>
          <InputGroup>
            <InputIcon>
              <Mail size={20} />
            </InputIcon>
            <Input
              type="email"
              name="email"
              placeholder="Enter your email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </InputGroup>

          <InputGroup>
            <InputIcon>
              <Lock size={20} />
            </InputIcon>
            <Input
              type={showPassword ? 'text' : 'password'}
              name="password"
              placeholder="Enter your password"
              value={formData.password}
              onChange={handleChange}
              required
            />
            <PasswordToggle
              type="button"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </PasswordToggle>
          </InputGroup>

          {error && <ErrorMessage>{error}</ErrorMessage>}

          <LoginButton
            type="submit"
            disabled={isLoading}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {isLoading ? 'Signing in...' : 'Sign In'}
          </LoginButton>
        </Form>

        <DemoCredentials>
          <DemoTitle>Demo Credentials:</DemoTitle>
          <DemoRole>
            <span><strong>Admin:</strong> admin@example.com / password123</span>
            <button onClick={() => fillDemoCredentials('admin@example.com', 'password123')}>
              Use
            </button>
          </DemoRole>
          <DemoRole>
            <span><strong>Doctor:</strong> doctor@example.com / password123</span>
            <button onClick={() => fillDemoCredentials('doctor@example.com', 'password123')}>
              Use
            </button>
          </DemoRole>
          <DemoRole>
            <span><strong>Patient:</strong> patient@example.com / password123</span>
            <button onClick={() => fillDemoCredentials('patient@example.com', 'password123')}>
              Use
            </button>
          </DemoRole>
        </DemoCredentials>

        <RegisterLink>
          Don't have an account? <Link to="/register">Sign up here</Link>
        </RegisterLink>
      </LoginCard>
    </LoginContainer>
  );
};

export default Login;
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
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px;
`;

const LoginCard = styled(motion.div)`
  background: white;
  border-radius: 20px;
  padding: 40px;
  width: 100%;
  max-width: 400px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
`;

const Logo = styled.div`
  text-align: center;
  margin-bottom: 30px;
`;

const LogoIcon = styled.div`
  width: 60px;
  height: 60px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 15px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 15px;
`;

const Title = styled.h1`
  font-size: 28px;
  font-weight: 700;
  color: #2d3748;
  margin: 0 0 5px;
`;

const Subtitle = styled.p`
  color: #718096;
  margin: 0 0 30px;
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
  padding: 15px 15px 15px 45px;
  border: 2px solid #e2e8f0;
  border-radius: 10px;
  font-size: 16px;
  transition: all 0.3s ease;
  background: #f7fafc;

  &:focus {
    outline: none;
    border-color: #667eea;
    background: white;
    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
  }

  &::placeholder {
    color: #a0aec0;
  }
`;

const PasswordToggle = styled.button`
  position: absolute;
  right: 15px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  color: #a0aec0;
  cursor: pointer;
  padding: 5px;
  
  &:hover {
    color: #667eea;
  }
`;

const LoginButton = styled(motion.button)`
  width: 100%;
  padding: 15px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 10px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 10px 20px rgba(102, 126, 234, 0.3);
  }

  &:disabled {
    opacity: 0.7;
    cursor: not-allowed;
    transform: none;
    box-shadow: none;
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
  margin-top: 20px;
  color: #718096;
  
  a {
    color: #667eea;
    text-decoration: none;
    font-weight: 600;
    
    &:hover {
      text-decoration: underline;
    }
  }
`;

const DemoCredentials = styled.div`
  margin-top: 20px;
  padding: 15px;
  background: #f7fafc;
  border-radius: 10px;
  border-left: 4px solid #667eea;
`;

const DemoTitle = styled.h4`
  margin: 0 0 10px;
  color: #2d3748;
  font-size: 14px;
`;

const DemoRole = styled.div`
  margin-bottom: 8px;
  font-size: 12px;
  color: #4a5568;
  
  strong {
    color: #2d3748;
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
            <strong>Admin:</strong> admin@example.com / password123
            <button 
              onClick={() => fillDemoCredentials('admin@example.com', 'password123')}
              style={{ marginLeft: '10px', fontSize: '10px', padding: '2px 6px', background: '#667eea', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
            >
              Use
            </button>
          </DemoRole>
          <DemoRole>
            <strong>Doctor:</strong> doctor@example.com / password123
            <button 
              onClick={() => fillDemoCredentials('doctor@example.com', 'password123')}
              style={{ marginLeft: '10px', fontSize: '10px', padding: '2px 6px', background: '#667eea', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
            >
              Use
            </button>
          </DemoRole>
          <DemoRole>
            <strong>Patient:</strong> patient@example.com / password123
            <button 
              onClick={() => fillDemoCredentials('patient@example.com', 'password123')}
              style={{ marginLeft: '10px', fontSize: '10px', padding: '2px 6px', background: '#667eea', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
            >
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
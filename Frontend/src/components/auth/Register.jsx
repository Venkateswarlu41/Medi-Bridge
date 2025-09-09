import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Mail, Lock, User, Phone, Calendar, Heart, Stethoscope, CreditCard } from 'lucide-react';
import toast from 'react-hot-toast';
import departmentService from '../../services/department.service';

const RegisterContainer = styled.div`
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px;
`;

const RegisterCard = styled(motion.div)`
  background: white;
  border-radius: 20px;
  padding: 40px;
  width: 100%;
  max-width: 500px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  max-height: 90vh;
  overflow-y: auto;
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

const FormRow = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 15px;

  @media (max-width: 480px) {
    grid-template-columns: 1fr;
  }
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

const Select = styled.select`
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

const RegisterButton = styled(motion.button)`
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

const LoginLink = styled.div`
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

const Register = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    role: 'patient',
    dateOfBirth: '',
    gender: '',
    bloodGroup: '',
    specialization: '',
    licenseNumber: '',
    department: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [departments, setDepartments] = useState([]);

  const { register } = useAuth();
  const navigate = useNavigate();

  // Fetch departments on component mount
  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        const result = await departmentService.getPublicDepartments();
        if (result.success) {
          setDepartments(result.departments);
        } else {
          // Fallback to hardcoded departments if API fails
          setDepartments([
            { _id: '1', name: 'Cardiology' },
            { _id: '2', name: 'Emergency Medicine' },
            { _id: '3', name: 'Pediatrics' },
            { _id: '4', name: 'Orthopedics' },
            { _id: '5', name: 'Laboratory' }
          ]);
        }
      } catch (error) {
        console.error('Error fetching departments:', error);
        // Fallback to hardcoded departments
        setDepartments([
          { _id: '1', name: 'Cardiology' },
          { _id: '2', name: 'Emergency Medicine' },
          { _id: '3', name: 'Pediatrics' },
          { _id: '4', name: 'Orthopedics' },
          { _id: '5', name: 'Laboratory' }
        ]);
      }
    };

    fetchDepartments();
  }, []);

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

    // Validate passwords match
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setIsLoading(false);
      return;
    }

    // Prepare registration data
    const registrationData = {
      firstName: formData.firstName,
      lastName: formData.lastName,
      email: formData.email,
      password: formData.password,
      phone: formData.phone,
      role: formData.role
    };

    // Add role-specific fields
    if (formData.role === 'patient') {
      registrationData.dateOfBirth = formData.dateOfBirth;
      registrationData.gender = formData.gender;
      registrationData.bloodGroup = formData.bloodGroup;
    } else if (formData.role === 'doctor') {
      registrationData.specialization = formData.specialization;
      registrationData.licenseNumber = formData.licenseNumber;
      registrationData.department = formData.department;
    } else if (['nurse', 'lab_technician'].includes(formData.role)) {
      registrationData.department = formData.department;
    }

    const result = await register(registrationData);

    if (result.success) {
      toast.success('Registration successful!');
      navigate('/dashboard');
    } else {
      console.error('Registration failed:', result);
      
      // Show detailed validation errors if available
      if (result.errors && result.errors.length > 0) {
        const errorMessages = result.errors.map(error => error.msg).join(', ');
        setError(errorMessages);
        toast.error(errorMessages);
      } else {
        setError(result.message);
        toast.error(result.message);
      }
    }

    setIsLoading(false);
  };

  return (
    <RegisterContainer>
      <RegisterCard
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Logo>
          <LogoIcon>
            <Heart size={30} color="white" />
          </LogoIcon>
          <Title>Join Hygeia-Nexus</Title>
          <Subtitle>Create your account</Subtitle>
        </Logo>

        <Form onSubmit={handleSubmit}>
          <FormRow>
            <InputGroup>
              <InputIcon>
                <User size={20} />
              </InputIcon>
              <Input
                type="text"
                name="firstName"
                placeholder="First Name"
                value={formData.firstName}
                onChange={handleChange}
                required
              />
            </InputGroup>

            <InputGroup>
              <InputIcon>
                <User size={20} />
              </InputIcon>
              <Input
                type="text"
                name="lastName"
                placeholder="Last Name"
                value={formData.lastName}
                onChange={handleChange}
                required
              />
            </InputGroup>
          </FormRow>

          <InputGroup>
            <InputIcon>
              <Mail size={20} />
            </InputIcon>
            <Input
              type="email"
              name="email"
              placeholder="Email Address"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </InputGroup>

          <InputGroup>
            <InputIcon>
              <Phone size={20} />
            </InputIcon>
            <Input
              type="tel"
              name="phone"
              placeholder="Phone Number"
              value={formData.phone}
              onChange={handleChange}
              required
            />
          </InputGroup>

          <InputGroup>
            <InputIcon>
              <User size={20} />
            </InputIcon>
            <Select
              name="role"
              value={formData.role}
              onChange={handleChange}
              required
            >
              <option value="patient">Patient</option>
              <option value="doctor">Doctor</option>
              <option value="nurse">Nurse</option>
              <option value="lab_technician">Lab Technician</option>
              <option value="receptionist">Receptionist</option>
            </Select>
          </InputGroup>

          {formData.role === 'doctor' && (
            <>
              <InputGroup>
                <InputIcon>
                  <User size={20} />
                </InputIcon>
                <Select
                  name="department"
                  value={formData.department}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select Department</option>
                  {departments.map((dept) => (
                    <option key={dept._id} value={dept.name}>
                      {dept.name}
                    </option>
                  ))}
                </Select>
              </InputGroup>

              <InputGroup>
                <InputIcon>
                  <Stethoscope size={20} />
                </InputIcon>
                <Input
                  type="text"
                  name="specialization"
                  placeholder="Specialization (e.g., Cardiology, Pediatrics)"
                  value={formData.specialization}
                  onChange={handleChange}
                  required
                />
              </InputGroup>

              <InputGroup>
                <InputIcon>
                  <CreditCard size={20} />
                </InputIcon>
                <Input
                  type="text"
                  name="licenseNumber"
                  placeholder="Medical License Number"
                  value={formData.licenseNumber}
                  onChange={handleChange}
                  required
                />
              </InputGroup>
            </>
          )}

          {['nurse', 'lab_technician'].includes(formData.role) && (
            <InputGroup>
              <InputIcon>
                <User size={20} />
              </InputIcon>
              <Select
                name="department"
                value={formData.department}
                onChange={handleChange}
                required
              >
                <option value="">Select Department</option>
                {departments.map((dept) => (
                  <option key={dept._id} value={dept.name}>
                    {dept.name}
                  </option>
                ))}
              </Select>
            </InputGroup>
          )}

          {formData.role === 'patient' && (
            <>
              <FormRow>
                <InputGroup>
                  <InputIcon>
                    <Calendar size={20} />
                  </InputIcon>
                  <Input
                    type="date"
                    name="dateOfBirth"
                    value={formData.dateOfBirth}
                    onChange={handleChange}
                    required
                  />
                </InputGroup>

                <InputGroup>
                  <InputIcon>
                    <User size={20} />
                  </InputIcon>
                  <Select
                    name="gender"
                    value={formData.gender}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Select Gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </Select>
                </InputGroup>
              </FormRow>

              <InputGroup>
                <InputIcon>
                  <Heart size={20} />
                </InputIcon>
                <Select
                  name="bloodGroup"
                  value={formData.bloodGroup}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select Blood Group</option>
                  <option value="A+">A+</option>
                  <option value="A-">A-</option>
                  <option value="B+">B+</option>
                  <option value="B-">B-</option>
                  <option value="AB+">AB+</option>
                  <option value="AB-">AB-</option>
                  <option value="O+">O+</option>
                  <option value="O-">O-</option>
                </Select>
              </InputGroup>
            </>
          )}

          <InputGroup>
            <InputIcon>
              <Lock size={20} />
            </InputIcon>
            <Input
              type={showPassword ? 'text' : 'password'}
              name="password"
              placeholder="Password"
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

          <InputGroup>
            <InputIcon>
              <Lock size={20} />
            </InputIcon>
            <Input
              type={showConfirmPassword ? 'text' : 'password'}
              name="confirmPassword"
              placeholder="Confirm Password"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
            />
            <PasswordToggle
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            >
              {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </PasswordToggle>
          </InputGroup>

          {error && <ErrorMessage>{error}</ErrorMessage>}

          <RegisterButton
            type="submit"
            disabled={isLoading}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {isLoading ? 'Creating Account...' : 'Create Account'}
          </RegisterButton>
        </Form>

        <LoginLink>
          Already have an account? <Link to="/login">Sign in here</Link>
        </LoginLink>
      </RegisterCard>
    </RegisterContainer>
  );
};

export default Register;
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import {
  User,
  Mail,
  Phone,
  Calendar,
  Heart,
  MapPin,
  FileText,
  Save,
  ArrowLeft,
  Eye,
  EyeOff,
  Users
} from 'lucide-react';
import toast from 'react-hot-toast';
import authService from '../../services/auth.service';
import { useAuth } from '../../context/AuthContext';

const FormContainer = styled.div`
  max-width: 800px;
  margin: 0 auto;
  background: white;
  border-radius: 15px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  overflow: hidden;
`;

const FormHeader = styled.div`
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 30px;
  display: flex;
  align-items: center;
  gap: 15px;
`;

const BackButton = styled(motion.button)`
  background: rgba(255, 255, 255, 0.2);
  border: none;
  border-radius: 8px;
  padding: 8px;
  color: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const FormTitle = styled.h1`
  font-size: 24px;
  font-weight: 600;
  margin: 0;
  flex: 1;
`;

const FormBody = styled.div`
  padding: 30px;
`;

const FormGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
`;

const FormGroup = styled.div`
  margin-bottom: 20px;
`;

const Label = styled.label`
  display: block;
  font-weight: 600;
  color: #2d3748;
  margin-bottom: 8px;
  font-size: 14px;
`;

const InputContainer = styled.div`
  position: relative;
`;

const Input = styled.input.withConfig({
  shouldForwardProp: (prop) => !['hasIcon'].includes(prop),
})`
  width: 100%;
  padding: 12px 15px;
  padding-left: ${props => props.hasIcon ? '45px' : '15px'};
  border: 2px solid #e2e8f0;
  border-radius: 10px;
  font-size: 16px;
  transition: all 0.3s ease;

  &:focus {
    outline: none;
    border-color: #667eea;
    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
  }

  &:invalid {
    border-color: #f56565;
  }
`;

const Select = styled.select.withConfig({
  shouldForwardProp: (prop) => !['hasIcon'].includes(prop),
})`
  width: 100%;
  padding: 12px 15px;
  padding-left: ${props => props.hasIcon ? '45px' : '15px'};
  border: 2px solid #e2e8f0;
  border-radius: 10px;
  font-size: 16px;
  background: white;
  cursor: pointer;
  transition: all 0.3s ease;

  &:focus {
    outline: none;
    border-color: #667eea;
    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
  }
`;

const Textarea = styled.textarea`
  width: 100%;
  padding: 12px 15px;
  border: 2px solid #e2e8f0;
  border-radius: 10px;
  font-size: 16px;
  min-height: 100px;
  resize: vertical;
  transition: all 0.3s ease;

  &:focus {
    outline: none;
    border-color: #667eea;
    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
  }
`;

const InputIcon = styled.div`
  position: absolute;
  left: 15px;
  top: 50%;
  transform: translateY(-50%);
  color: #a0aec0;
  z-index: 1;
`;

const ToggleButton = styled.button`
  position: absolute;
  right: 15px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  color: #a0aec0;
  cursor: pointer;
  padding: 0;
  display: flex;
  align-items: center;
`;

const FormActions = styled.div`
  display: flex;
  gap: 15px;
  justify-content: flex-end;
  padding-top: 20px;
  border-top: 1px solid #e2e8f0;
`;

const Button = styled(motion.button)`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 24px;
  border: none;
  border-radius: 10px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;

  ${props => props.variant === 'primary' ? `
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    
    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 10px 20px rgba(102, 126, 234, 0.3);
    }
  ` : `
    background: #f7fafc;
    color: #4a5568;
    border: 2px solid #e2e8f0;
    
    &:hover {
      background: #edf2f7;
    }
  `}

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none !important;
  }
`;

const ErrorText = styled.div`
  color: #f56565;
  font-size: 12px;
  margin-top: 5px;
`;

const PatientForm = () => {
  const navigate = useNavigate();
  const { hasAnyRole } = useAuth();
  
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    phone: '',
    dateOfBirth: '',
    gender: '',
    bloodGroup: '',
    emergencyContact: '',
    emergencyContactName: '',
    emergencyContactRelation: '',
    insuranceProvider: '',
    insurancePolicyNumber: '',
    allergies: '',
    chronicConditions: '',
    currentMedications: '',
    address: {
      street: '',
      city: '',
      state: '',
      zipCode: '',
      country: 'USA'
    }
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (!hasAnyRole(['admin', 'doctor'])) {
      navigate('/dashboard');
      return;
    }
  }, [hasAnyRole, navigate]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    if (name.startsWith('address.')) {
      const addressField = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        address: {
          ...prev.address,
          [addressField]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.firstName.trim()) newErrors.firstName = 'First name is required';
    if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required';
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    if (!formData.password.trim()) newErrors.password = 'Password is required';
    if (formData.password.length < 6) newErrors.password = 'Password must be at least 6 characters';
    if (!formData.phone.trim()) newErrors.phone = 'Phone number is required';
    if (!formData.dateOfBirth) newErrors.dateOfBirth = 'Date of birth is required';
    if (!formData.gender) newErrors.gender = 'Gender is required';

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (formData.email && !emailRegex.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error('Please fix the errors in the form');
      return;
    }

    setLoading(true);
    try {
      const patientData = {
        ...formData,
        role: 'patient',
        patientId: `PAT${Date.now().toString().slice(-6)}`, // Generate patient ID
        isActive: true
      };

      const result = await authService.register(patientData);
      
      if (result.success) {
        toast.success('Patient added successfully!');
        navigate('/patients');
      } else {
        toast.error(result.message || 'Failed to add patient');
      }
    } catch (error) {
      console.error('Error adding patient:', error);
      toast.error('Failed to add patient');
    } finally {
      setLoading(false);
    }
  };

  const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

  return (
    <FormContainer>
      <FormHeader>
        <BackButton
          onClick={() => navigate('/patients')}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          <ArrowLeft size={20} />
        </BackButton>
        <FormTitle>Add New Patient</FormTitle>
      </FormHeader>

      <FormBody>
        <form onSubmit={handleSubmit}>
          <FormGrid>
            <FormGroup>
              <Label>First Name *</Label>
              <InputContainer>
                <InputIcon>
                  <User size={18} />
                </InputIcon>
                <Input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  placeholder="Enter first name"
                  hasIcon
                  required
                />
              </InputContainer>
              {errors.firstName && <ErrorText>{errors.firstName}</ErrorText>}
            </FormGroup>

            <FormGroup>
              <Label>Last Name *</Label>
              <InputContainer>
                <InputIcon>
                  <User size={18} />
                </InputIcon>
                <Input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  placeholder="Enter last name"
                  hasIcon
                  required
                />
              </InputContainer>
              {errors.lastName && <ErrorText>{errors.lastName}</ErrorText>}
            </FormGroup>

            <FormGroup>
              <Label>Email Address *</Label>
              <InputContainer>
                <InputIcon>
                  <Mail size={18} />
                </InputIcon>
                <Input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="Enter email address"
                  hasIcon
                  required
                />
              </InputContainer>
              {errors.email && <ErrorText>{errors.email}</ErrorText>}
            </FormGroup>

            <FormGroup>
              <Label>Password *</Label>
              <InputContainer>
                <Input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="Enter password"
                  required
                />
                <ToggleButton
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </ToggleButton>
              </InputContainer>
              {errors.password && <ErrorText>{errors.password}</ErrorText>}
            </FormGroup>

            <FormGroup>
              <Label>Phone Number *</Label>
              <InputContainer>
                <InputIcon>
                  <Phone size={18} />
                </InputIcon>
                <Input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  placeholder="Enter phone number"
                  hasIcon
                  required
                />
              </InputContainer>
              {errors.phone && <ErrorText>{errors.phone}</ErrorText>}
            </FormGroup>

            <FormGroup>
              <Label>Date of Birth *</Label>
              <InputContainer>
                <InputIcon>
                  <Calendar size={18} />
                </InputIcon>
                <Input
                  type="date"
                  name="dateOfBirth"
                  value={formData.dateOfBirth}
                  onChange={handleInputChange}
                  hasIcon
                  required
                />
              </InputContainer>
              {errors.dateOfBirth && <ErrorText>{errors.dateOfBirth}</ErrorText>}
            </FormGroup>

            <FormGroup>
              <Label>Gender *</Label>
              <Select
                name="gender"
                value={formData.gender}
                onChange={handleInputChange}
                required
              >
                <option value="">Select gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </Select>
              {errors.gender && <ErrorText>{errors.gender}</ErrorText>}
            </FormGroup>

            <FormGroup>
              <Label>Blood Group</Label>
              <InputContainer>
                <InputIcon>
                  <Heart size={18} />
                </InputIcon>
                <Select
                  name="bloodGroup"
                  value={formData.bloodGroup}
                  onChange={handleInputChange}
                  hasIcon
                >
                  <option value="">Select blood group</option>
                  {bloodGroups.map((group) => (
                    <option key={group} value={group}>{group}</option>
                  ))}
                </Select>
              </InputContainer>
            </FormGroup>

            <FormGroup>
              <Label>Emergency Contact Name</Label>
              <InputContainer>
                <InputIcon>
                  <Users size={18} />
                </InputIcon>
                <Input
                  type="text"
                  name="emergencyContactName"
                  value={formData.emergencyContactName}
                  onChange={handleInputChange}
                  placeholder="Enter emergency contact name"
                  hasIcon
                />
              </InputContainer>
            </FormGroup>

            <FormGroup>
              <Label>Emergency Contact Phone</Label>
              <InputContainer>
                <InputIcon>
                  <Phone size={18} />
                </InputIcon>
                <Input
                  type="tel"
                  name="emergencyContact"
                  value={formData.emergencyContact}
                  onChange={handleInputChange}
                  placeholder="Enter emergency contact number"
                  hasIcon
                />
              </InputContainer>
            </FormGroup>

            <FormGroup>
              <Label>Emergency Contact Relation</Label>
              <Select
                name="emergencyContactRelation"
                value={formData.emergencyContactRelation}
                onChange={handleInputChange}
              >
                <option value="">Select relation</option>
                <option value="spouse">Spouse</option>
                <option value="parent">Parent</option>
                <option value="child">Child</option>
                <option value="sibling">Sibling</option>
                <option value="friend">Friend</option>
                <option value="other">Other</option>
              </Select>
            </FormGroup>

            <FormGroup>
              <Label>Insurance Provider</Label>
              <Input
                type="text"
                name="insuranceProvider"
                value={formData.insuranceProvider}
                onChange={handleInputChange}
                placeholder="Enter insurance provider"
              />
            </FormGroup>

            <FormGroup>
              <Label>Insurance Policy Number</Label>
              <Input
                type="text"
                name="insurancePolicyNumber"
                value={formData.insurancePolicyNumber}
                onChange={handleInputChange}
                placeholder="Enter policy number"
              />
            </FormGroup>

            <FormGroup>
              <Label>Street Address</Label>
              <InputContainer>
                <InputIcon>
                  <MapPin size={18} />
                </InputIcon>
                <Input
                  type="text"
                  name="address.street"
                  value={formData.address.street}
                  onChange={handleInputChange}
                  placeholder="Enter street address"
                  hasIcon
                />
              </InputContainer>
            </FormGroup>

            <FormGroup>
              <Label>City</Label>
              <Input
                type="text"
                name="address.city"
                value={formData.address.city}
                onChange={handleInputChange}
                placeholder="Enter city"
              />
            </FormGroup>

            <FormGroup>
              <Label>State</Label>
              <Input
                type="text"
                name="address.state"
                value={formData.address.state}
                onChange={handleInputChange}
                placeholder="Enter state"
              />
            </FormGroup>

            <FormGroup>
              <Label>ZIP Code</Label>
              <Input
                type="text"
                name="address.zipCode"
                value={formData.address.zipCode}
                onChange={handleInputChange}
                placeholder="Enter ZIP code"
              />
            </FormGroup>
          </FormGrid>

          <FormGroup>
            <Label>Known Allergies</Label>
            <Textarea
              name="allergies"
              value={formData.allergies}
              onChange={handleInputChange}
              placeholder="Enter any known allergies (separate by commas)"
            />
          </FormGroup>

          <FormGroup>
            <Label>Chronic Conditions</Label>
            <Textarea
              name="chronicConditions"
              value={formData.chronicConditions}
              onChange={handleInputChange}
              placeholder="Enter any chronic conditions (separate by commas)"
            />
          </FormGroup>

          <FormGroup>
            <Label>Current Medications</Label>
            <Textarea
              name="currentMedications"
              value={formData.currentMedications}
              onChange={handleInputChange}
              placeholder="Enter current medications (separate by commas)"
            />
          </FormGroup>

          <FormActions>
            <Button
              type="button"
              onClick={() => navigate('/patients')}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              disabled={loading}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Save size={18} />
              {loading ? 'Adding Patient...' : 'Add Patient'}
            </Button>
          </FormActions>
        </form>
      </FormBody>
    </FormContainer>
  );
};

export default PatientForm;
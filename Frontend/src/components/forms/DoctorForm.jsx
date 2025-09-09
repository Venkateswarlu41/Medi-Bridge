import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import {
  User,
  Mail,
  Phone,
  Calendar,
  Building,
  Award,
  FileText,
  Save,
  ArrowLeft,
  Eye,
  EyeOff
} from 'lucide-react';
import toast from 'react-hot-toast';
import authService from '../../services/auth.service';
import departmentService from '../../services/department.service';
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

const DoctorForm = () => {
  const navigate = useNavigate();
  const { hasAnyRole } = useAuth();
  
  const [departments, setDepartments] = useState([]);
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
    specialization: '',
    licenseNumber: '',
    departmentId: '',
    qualifications: '',
    experience: '',
    consultationFee: '',
    emergencyContact: '',
    address: {
      street: '',
      city: '',
      state: '',
      zipCode: '',
      country: 'USA'
    }
  });

  const [errors, setErrors] = useState({});

  // Default departments as fallback
  const defaultDepartments = [
    { _id: 'cardiology', name: 'Cardiology' },
    { _id: 'emergency', name: 'Emergency Medicine' },
    { _id: 'pediatrics', name: 'Pediatrics' },
    { _id: 'orthopedics', name: 'Orthopedics' },
    { _id: 'neurology', name: 'Neurology' },
    { _id: 'oncology', name: 'Oncology' },
    { _id: 'surgery', name: 'General Surgery' },
    { _id: 'internal', name: 'Internal Medicine' },
    { _id: 'psychiatry', name: 'Psychiatry' },
    { _id: 'radiology', name: 'Radiology' },
    { _id: 'anesthesiology', name: 'Anesthesiology' },
    { _id: 'dermatology', name: 'Dermatology' }
  ];

  useEffect(() => {
    if (!hasAnyRole(['admin'])) {
      navigate('/dashboard');
      return;
    }
    
    fetchDepartments();
  }, [hasAnyRole, navigate]);

  const fetchDepartments = async () => {
    try {
      // First try to get departments from API
      const result = await departmentService.getPublicDepartments();
      if (result.success && result.departments && result.departments.length > 0) {
        setDepartments(result.departments);
        return;
      }

      // If no departments found, try to seed them
      console.log('No departments found, attempting to seed default departments...');
      const seedResult = await departmentService.seedDepartments();
      if (seedResult.success) {
        // After seeding, try to fetch again
        const fetchAgainResult = await departmentService.getPublicDepartments();
        if (fetchAgainResult.success && fetchAgainResult.departments) {
          setDepartments(fetchAgainResult.departments);
          return;
        }
      }

      // If seeding fails, try the regular endpoint
      const fallbackResult = await departmentService.getAllDepartments();
      if (fallbackResult.success && fallbackResult.departments) {
        setDepartments(fallbackResult.departments);
        return;
      }

      // Use default departments as final fallback
      console.log('Using default departments as fallback');
      setDepartments(defaultDepartments);
    } catch (error) {
      console.error('Error fetching departments:', error);
      // Use default departments as fallback
      setDepartments(defaultDepartments);
    }
  };

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
    if (!formData.specialization.trim()) newErrors.specialization = 'Specialization is required';
    if (!formData.licenseNumber.trim()) newErrors.licenseNumber = 'License number is required';
    if (!formData.departmentId) newErrors.departmentId = 'Department is required';

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
      const doctorData = {
        ...formData,
        role: 'doctor',
        department: formData.departmentId, // Backend expects 'department' not 'departmentId'
        employeeId: `DOC${Date.now().toString().slice(-6)}`, // Generate employee ID
        isActive: true
      };

      // Remove departmentId from the data since we're using department
      delete doctorData.departmentId;

      const result = await authService.register(doctorData);
      
      if (result.success) {
        toast.success('Doctor added successfully!');
        navigate('/doctors');
      } else {
        toast.error(result.message || 'Failed to add doctor');
      }
    } catch (error) {
      console.error('Error adding doctor:', error);
      toast.error('Failed to add doctor');
    } finally {
      setLoading(false);
    }
  };

  const specializations = [
    'Cardiology',
    'Dermatology',
    'Emergency Medicine',
    'Endocrinology',
    'Family Medicine',
    'Gastroenterology',
    'Internal Medicine',
    'Neurology',
    'Obstetrics and Gynecology',
    'Oncology',
    'Ophthalmology',
    'Orthopedic Surgery',
    'Pediatrics',
    'Psychiatry',
    'Radiology',
    'Surgery',
    'Urology'
  ];

  return (
    <FormContainer>
      <FormHeader>
        <BackButton
          onClick={() => navigate('/doctors')}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          <ArrowLeft size={20} />
        </BackButton>
        <FormTitle>Add New Doctor</FormTitle>
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
              <Label>Date of Birth</Label>
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
                />
              </InputContainer>
            </FormGroup>

            <FormGroup>
              <Label>Gender</Label>
              <Select
                name="gender"
                value={formData.gender}
                onChange={handleInputChange}
              >
                <option value="">Select gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </Select>
            </FormGroup>

            <FormGroup>
              <Label>Specialization *</Label>
              <InputContainer>
                <InputIcon>
                  <Award size={18} />
                </InputIcon>
                <Select
                  name="specialization"
                  value={formData.specialization}
                  onChange={handleInputChange}
                  hasIcon
                  required
                >
                  <option value="">Select specialization</option>
                  {specializations.map((spec) => (
                    <option key={spec} value={spec}>{spec}</option>
                  ))}
                </Select>
              </InputContainer>
              {errors.specialization && <ErrorText>{errors.specialization}</ErrorText>}
            </FormGroup>

            <FormGroup>
              <Label>License Number *</Label>
              <InputContainer>
                <InputIcon>
                  <FileText size={18} />
                </InputIcon>
                <Input
                  type="text"
                  name="licenseNumber"
                  value={formData.licenseNumber}
                  onChange={handleInputChange}
                  placeholder="Enter license number"
                  hasIcon
                  required
                />
              </InputContainer>
              {errors.licenseNumber && <ErrorText>{errors.licenseNumber}</ErrorText>}
            </FormGroup>

            <FormGroup>
              <Label>Department *</Label>
              <InputContainer>
                <InputIcon>
                  <Building size={18} />
                </InputIcon>
                <Select
                  name="departmentId"
                  value={formData.departmentId}
                  onChange={handleInputChange}
                  hasIcon
                  required
                >
                  <option value="">Select department</option>
                  {departments.length > 0 ? (
                    departments.map((dept) => (
                      <option key={dept._id} value={dept._id}>
                        {dept.name}
                      </option>
                    ))
                  ) : (
                    <option disabled>Loading departments...</option>
                  )}
                </Select>
              </InputContainer>
              {errors.departmentId && <ErrorText>{errors.departmentId}</ErrorText>}
              {departments.length === 0 && (
                <ErrorText>Unable to load departments. Please try refreshing the page.</ErrorText>
              )}
            </FormGroup>

            <FormGroup>
              <Label>Years of Experience</Label>
              <Input
                type="number"
                name="experience"
                value={formData.experience}
                onChange={handleInputChange}
                placeholder="Enter years of experience"
                min="0"
              />
            </FormGroup>

            <FormGroup>
              <Label>Consultation Fee ($)</Label>
              <Input
                type="number"
                name="consultationFee"
                value={formData.consultationFee}
                onChange={handleInputChange}
                placeholder="Enter consultation fee"
                min="0"
                step="0.01"
              />
            </FormGroup>
          </FormGrid>

          <FormGroup>
            <Label>Qualifications</Label>
            <Textarea
              name="qualifications"
              value={formData.qualifications}
              onChange={handleInputChange}
              placeholder="Enter qualifications and certifications"
            />
          </FormGroup>

          <FormGroup>
            <Label>Emergency Contact</Label>
            <Input
              type="tel"
              name="emergencyContact"
              value={formData.emergencyContact}
              onChange={handleInputChange}
              placeholder="Enter emergency contact number"
            />
          </FormGroup>

          <FormActions>
            <Button
              type="button"
              onClick={() => navigate('/doctors')}
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
              {loading ? 'Adding Doctor...' : 'Add Doctor'}
            </Button>
          </FormActions>
        </form>
      </FormBody>
    </FormContainer>
  );
};

export default DoctorForm;
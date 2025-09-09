import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import {
  Calendar,
  Clock,
  User,
  UserCheck,
  FileText,
  ArrowLeft,
  Save,
  Check
} from 'lucide-react';
import toast from 'react-hot-toast';
import appointmentService from '../../services/appointment.service';
import doctorService from '../../services/doctor.service';
import patientService from '../../services/patient.service';
import { useAuth } from '../../context/AuthContext';

const FormContainer = styled.div`
  max-width: 800px;
  margin: 0 auto;
  background: white;
  border-radius: 20px;
  padding: 40px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
`;

const FormHeader = styled.div`
  text-align: center;
  margin-bottom: 40px;
`;

const BackButton = styled(motion.button)`
  position: absolute;
  left: 20px;
  top: 20px;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 20px;
  background: #f7fafc;
  border: 2px solid #e2e8f0;
  border-radius: 10px;
  cursor: pointer;
  color: #4a5568;
  font-weight: 500;
  transition: all 0.3s ease;

  &:hover {
    border-color: #667eea;
    color: #667eea;
  }
`;

const FormTitle = styled.h1`
  font-size: 32px;
  font-weight: 700;
  color: #2d3748;
  margin: 0 0 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
`;

const FormSubtitle = styled.p`
  color: #718096;
  font-size: 16px;
  margin: 0;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 25px;
`;

const FormRow = styled.div.withConfig({
  shouldForwardProp: (prop) => !['columns'].includes(prop),
})`
  display: grid;
  grid-template-columns: ${props => props.columns || '1fr'};
  gap: 20px;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const Label = styled.label`
  font-weight: 600;
  color: #2d3748;
  font-size: 14px;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const Input = styled.input`
  width: 100%;
  padding: 15px 18px;
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

  &:disabled {
    background: #edf2f7;
    cursor: not-allowed;
  }
`;

const Select = styled.select`
  width: 100%;
  padding: 15px 18px;
  border: 2px solid #e2e8f0;
  border-radius: 10px;
  font-size: 16px;
  transition: all 0.3s ease;
  background: #f7fafc;
  cursor: pointer;

  &:focus {
    outline: none;
    border-color: #667eea;
    background: white;
    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
  }

  &:disabled {
    background: #edf2f7;
    cursor: not-allowed;
  }
`;

const TextArea = styled.textarea`
  width: 100%;
  padding: 15px 18px;
  border: 2px solid #e2e8f0;
  border-radius: 10px;
  font-size: 16px;
  transition: all 0.3s ease;
  background: #f7fafc;
  resize: vertical;
  min-height: 120px;

  &:focus {
    outline: none;
    border-color: #667eea;
    background: white;
    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
  }
`;

const AvailableSlots = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: 10px;
  margin-top: 10px;
`;

const TimeSlot = styled(motion.button)`
  padding: 12px 16px;
  border: 2px solid #e2e8f0;
  background: white;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  color: #4a5568;
  transition: all 0.3s ease;

  &:hover:not(:disabled) {
    border-color: #667eea;
    color: #667eea;
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(102, 126, 234, 0.15);
  }

  &.selected {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    border-color: transparent;
    box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
  }

  &:disabled {
    background: #f1f5f9;
    color: #94a3b8;
    cursor: not-allowed;
    border-color: #e2e8f0;
    opacity: 0.6;
  }
`;

const SubmitButton = styled(motion.button)`
  width: 100%;
  padding: 18px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  margin-top: 20px;
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 10px 25px rgba(102, 126, 234, 0.3);
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
`;

const LoadingSpinner = styled.div`
  display: inline-block;
  width: 20px;
  height: 20px;
  border: 2px solid #ffffff40;
  border-radius: 50%;
  border-top-color: #ffffff;
  animation: spin 1s ease-in-out infinite;

  @keyframes spin {
    to { transform: rotate(360deg); }
  }
`;

const AppointmentForm = () => {
  const [formData, setFormData] = useState({
    patientId: '',
    doctorId: '',
    appointmentDate: '',
    appointmentTime: '',
    type: 'consultation',
    chiefComplaint: '',
    notes: ''
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [doctors, setDoctors] = useState([]);
  const [patients, setPatients] = useState([]);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [loadingSlots, setLoadingSlots] = useState(false);

  const { user, hasRole } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Pre-fill form from URL params
    const params = new URLSearchParams(location.search);
    const doctorId = params.get('doctorId');
    const patientId = params.get('patientId');
    
    if (doctorId) {
      setFormData(prev => ({ ...prev, doctorId }));
    }
    if (patientId) {
      setFormData(prev => ({ ...prev, patientId }));
    }
    
    // Pre-fill patient ID if user is a patient
    if (hasRole('patient') && user?._id) {
      setFormData(prev => ({ ...prev, patientId: user._id }));
    }

    fetchInitialData();
  }, [user, hasRole, location.search]);

  useEffect(() => {
    if (formData.doctorId && formData.appointmentDate) {
      fetchAvailableSlots();
    }
  }, [formData.doctorId, formData.appointmentDate]);

  const fetchInitialData = async () => {
    try {
      // Fetch doctors
      const doctorsResult = await doctorService.getAllDoctors();
      if (doctorsResult.success) {
        setDoctors(doctorsResult.data.doctors || []);
      }

      // Fetch patients (only if user is not a patient)
      if (!hasRole('patient')) {
        const patientsResult = await patientService.getAllPatients({ limit: 100 });
        if (patientsResult.success) {
          setPatients(patientsResult.data.patients || []);
        }
      }
    } catch (error) {
      console.error('Failed to fetch initial data:', error);
      toast.error('Failed to load form data');
    }
  };

  const fetchAvailableSlots = async () => {
    setLoadingSlots(true);
    try {
      const result = await appointmentService.getDoctorAvailability(
        formData.doctorId, 
        formData.appointmentDate
      );
      
      if (result.success && result.data.availableSlots) {
        setAvailableSlots(result.data.availableSlots || []);
      } else {
        // Generate default time slots as fallback
        const defaultSlots = generateDefaultTimeSlots();
        setAvailableSlots(defaultSlots);
        console.log('Using default time slots as fallback');
      }
    } catch (error) {
      console.error('Failed to fetch available slots:', error);
      // Generate default time slots as fallback
      const defaultSlots = generateDefaultTimeSlots();
      setAvailableSlots(defaultSlots);
    } finally {
      setLoadingSlots(false);
    }
  };

  const generateDefaultTimeSlots = () => {
    const slots = [];
    const startHour = 9; // 9 AM
    const endHour = 17; // 5 PM
    
    for (let hour = startHour; hour < endHour; hour++) {
      // Add slots at 00 and 30 minutes
      const timeOptions = ['00', '30'];
      timeOptions.forEach(minutes => {
        const time12Hour = formatTo12Hour(hour, minutes);
        const time24Hour = `${String(hour).padStart(2, '0')}:${minutes}`;
        slots.push({
          time: time12Hour,
          value: time24Hour, // Keep 24-hour format for backend
          available: true
        });
      });
    }
    
    return slots;
  };

  const formatTo12Hour = (hour, minutes) => {
    const period = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
    return `${displayHour}:${minutes} ${period}`;
  };

  const convertTo24HourFormat = (time12h) => {
    if (!time12h) return '';
    
    const [time, period] = time12h.split(' ');
    let [hours, minutes] = time.split(':');
    hours = parseInt(hours);
    
    if (period === 'PM' && hours !== 12) {
      hours += 12;
    } else if (period === 'AM' && hours === 12) {
      hours = 0;
    }
    
    return `${String(hours).padStart(2, '0')}:${minutes}`;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleTimeSlotSelect = (slot) => {
    setFormData(prev => ({
      ...prev,
      appointmentTime: slot.time // Use display time for frontend
    }));
    
    // Clear error when user selects a time
    if (errors.appointmentTime) {
      setErrors(prev => ({
        ...prev,
        appointmentTime: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.patientId) {
      newErrors.patientId = 'Please select a patient';
    }
    if (!formData.doctorId) {
      newErrors.doctorId = 'Please select a doctor';
    }
    if (!formData.appointmentDate) {
      newErrors.appointmentDate = 'Please select a date';
    }
    if (!formData.appointmentTime) {
      newErrors.appointmentTime = 'Please select a time slot';
    }
    if (!formData.chiefComplaint.trim()) {
      newErrors.chiefComplaint = 'Please describe the reason for visit';
    }
    
    // Check if selected doctor has department info
    const selectedDoctor = doctors.find(doctor => doctor._id === formData.doctorId);
    if (formData.doctorId && !selectedDoctor?.department) {
      newErrors.doctorId = 'Selected doctor missing department information';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error('Please fill in all required fields');
      return;
    }

    setLoading(true);
    
    try {
      // Get doctor's department from the selected doctor
      const selectedDoctor = doctors.find(doctor => doctor._id === formData.doctorId);
      const departmentId = selectedDoctor?.department?._id || selectedDoctor?.department;
      
      // Prepare appointment data with proper time format
      const appointmentData = {
        ...formData,
        departmentId: departmentId, // Add department ID
        // Convert 12-hour time to 24-hour format for backend
        appointmentTime: convertTo24HourFormat(formData.appointmentTime)
      };
      
      const result = await appointmentService.createAppointment(appointmentData);
      
      if (result.success) {
        toast.success('Appointment booked successfully!');
        navigate('/appointments');
      } else {
        console.error('Appointment creation failed:', result);
        
        // Show detailed error message
        if (result.errors && result.errors.length > 0) {
          const errorMessages = result.errors.map(error => error.msg || error.message).join(', ');
          toast.error(`Validation Error: ${errorMessages}`);
        } else {
          toast.error(result.message || 'Failed to book appointment');
        }
        
        if (result.errors) {
          setErrors(result.errors);
        }
      }
    } catch (error) {
      console.error('Failed to create appointment:', error);
      toast.error('Failed to book appointment');
    } finally {
      setLoading(false);
    }
  };

  const getTomorrowDate = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  };

  return (
    <div style={{ position: 'relative', padding: '20px' }}>
      <BackButton
        onClick={() => navigate(-1)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <ArrowLeft size={18} />
        Back
      </BackButton>

      <FormContainer
        as={motion.div}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <FormHeader>
          <FormTitle>
            <Calendar size={32} />
            Book Appointment
          </FormTitle>
          <FormSubtitle>
            Schedule your appointment with our healthcare professionals
          </FormSubtitle>
        </FormHeader>

        <Form onSubmit={handleSubmit}>
          <FormRow columns="1fr 1fr">
            <FormGroup>
              <Label>
                <User size={16} />
                Patient *
              </Label>
              {hasRole('patient') ? (
                <Input
                  type="text"
                  value={`${user?.firstName || ''} ${user?.lastName || ''} (You)`}
                  disabled
                  style={{ 
                    background: '#e6fffa', 
                    color: '#065f46',
                    fontWeight: '600',
                    border: '2px solid #10b981',
                    cursor: 'not-allowed'
                  }}
                />
              ) : (
                <Select
                  name="patientId"
                  value={formData.patientId}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select Patient</option>
                  {patients.map(patient => (
                    <option key={patient._id} value={patient._id}>
                      {patient.firstName} {patient.lastName} - {patient.patientId || patient.email}
                    </option>
                  ))}
                </Select>
              )}
              {errors.patientId && <ErrorMessage>{errors.patientId}</ErrorMessage>}
            </FormGroup>

            <FormGroup>
              <Label>
                <UserCheck size={16} />
                Doctor *
              </Label>
              <Select
                name="doctorId"
                value={formData.doctorId}
                onChange={handleChange}
                required
              >
                <option value="">Select Doctor</option>
                {doctors.map(doctor => (
                  <option key={doctor._id} value={doctor._id}>
                    Dr. {doctor.firstName} {doctor.lastName} - {doctor.specialization}
                  </option>
                ))}
              </Select>
              {errors.doctorId && <ErrorMessage>{errors.doctorId}</ErrorMessage>}
            </FormGroup>
          </FormRow>

          <FormRow columns="1fr 1fr">
            <FormGroup>
              <Label>
                <Calendar size={16} />
                Appointment Date *
              </Label>
              <Input
                type="date"
                name="appointmentDate"
                value={formData.appointmentDate}
                onChange={handleChange}
                min={getTomorrowDate()}
                required
              />
              {errors.appointmentDate && <ErrorMessage>{errors.appointmentDate}</ErrorMessage>}
            </FormGroup>

            <FormGroup>
              <Label>
                <Calendar size={16} />
                Appointment Type
              </Label>
              <Select
                name="type"
                value={formData.type}
                onChange={handleChange}
              >
                <option value="consultation">Consultation</option>
                <option value="follow-up">Follow-up</option>
                <option value="emergency">Emergency</option>
                <option value="routine-checkup">Routine Checkup</option>
                <option value="telemedicine">Telemedicine</option>
              </Select>
            </FormGroup>
          </FormRow>

          {!formData.doctorId || !formData.appointmentDate ? (
            <div style={{
              padding: '20px',
              textAlign: 'center',
              color: '#718096',
              background: '#f7fafc',
              borderRadius: '10px',
              border: '2px dashed #e2e8f0',
              fontSize: '14px'
            }}>
              <Clock size={24} style={{ marginBottom: '10px', color: '#a0aec0' }} />
              <div>Please select a doctor and appointment date to view available time slots</div>
            </div>
          ) : null}

          {formData.doctorId && formData.appointmentDate && (
            <FormGroup>
              <Label>
                <Clock size={16} />
                Available Time Slots *
              </Label>
              {loadingSlots ? (
                <div style={{ 
                  padding: '20px', 
                  textAlign: 'center', 
                  color: '#718096',
                  background: '#f7fafc',
                  borderRadius: '10px',
                  border: '2px dashed #e2e8f0'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
                    <LoadingSpinner />
                    Loading available slots...
                  </div>
                </div>
              ) : availableSlots.length > 0 ? (
                <>
                  <div style={{ 
                    fontSize: '14px', 
                    color: '#718096', 
                    marginBottom: '10px',
                    fontStyle: 'italic'
                  }}>
                    Select your preferred time slot for {new Date(formData.appointmentDate).toLocaleDateString()}
                  </div>
                  <AvailableSlots>
                    {availableSlots.map((slot, index) => (
                      <TimeSlot
                        key={slot.time || index}
                        type="button"
                        className={formData.appointmentTime === slot.time ? 'selected' : ''}
                        disabled={!slot.available}
                        onClick={() => handleTimeSlotSelect(slot)}
                        whileHover={slot.available ? { scale: 1.05 } : {}}
                        whileTap={slot.available ? { scale: 0.95 } : {}}
                      >
                        {slot.time}
                      </TimeSlot>
                    ))}
                  </AvailableSlots>
                </>
              ) : (
                <div style={{ 
                  padding: '20px', 
                  textAlign: 'center', 
                  color: '#e53e3e',
                  border: '2px dashed #fed7d7',
                  borderRadius: '10px',
                  background: '#fef5e7'
                }}>
                  <div style={{ marginBottom: '10px', fontWeight: '600' }}>No available slots</div>
                  <div style={{ fontSize: '14px' }}>No available slots for the selected date. Please choose a different date.</div>
                </div>
              )}
              {errors.appointmentTime && <ErrorMessage>{errors.appointmentTime}</ErrorMessage>}
            </FormGroup>
          )}

          <FormGroup>
            <Label>
              <FileText size={16} />
              Chief Complaint / Reason for Visit *
            </Label>
            <TextArea
              name="chiefComplaint"
              value={formData.chiefComplaint}
              onChange={handleChange}
              placeholder="Describe the reason for your visit, symptoms, or concerns..."
              required
            />
            {errors.chiefComplaint && <ErrorMessage>{errors.chiefComplaint}</ErrorMessage>}
          </FormGroup>

          <FormGroup>
            <Label>
              <FileText size={16} />
              Additional Notes (Optional)
            </Label>
            <TextArea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              placeholder="Any additional information or special requests..."
            />
          </FormGroup>

          <SubmitButton
            type="submit"
            disabled={loading}
            whileHover={{ scale: loading ? 1 : 1.02 }}
            whileTap={{ scale: loading ? 1 : 0.98 }}
          >
            {loading ? (
              <>
                <LoadingSpinner />
                Booking Appointment...
              </>
            ) : (
              <>
                <Save size={18} />
                Book Appointment
              </>
            )}
          </SubmitButton>
        </Form>
      </FormContainer>
    </div>
  );
};

export default AppointmentForm;
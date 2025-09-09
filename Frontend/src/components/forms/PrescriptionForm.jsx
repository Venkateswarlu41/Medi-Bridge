import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  Plus,
  Trash2,
  Save,
  Search,
  Pill,
  User,
  Calendar,
  FileText,
  DollarSign
} from 'lucide-react';
import toast from 'react-hot-toast';
import prescriptionService from '../../services/prescription.service';
import pharmacyService from '../../services/pharmacy.service';
import patientService from '../../services/patient.service';
import { useAuth } from '../../context/AuthContext';

const PageContainer = styled.div`
  max-width: 1000px;
  margin: 0 auto;
  padding: 20px;
`;

const BackButton = styled(motion.button)`
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
  margin-bottom: 20px;

  &:hover {
    border-color: #667eea;
    color: #667eea;
  }
`;

const FormCard = styled(motion.div)`
  background: white;
  border-radius: 20px;
  padding: 30px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
`;

const FormHeader = styled.div`
  margin-bottom: 30px;
`;

const FormTitle = styled.h1`
  font-size: 28px;
  font-weight: 700;
  color: #2d3748;
  margin: 0 0 10px;
  display: flex;
  align-items: center;
  gap: 12px;
`;

const FormGroup = styled.div`
  margin-bottom: 25px;
`;

const FormLabel = styled.label`
  display: block;
  font-weight: 600;
  color: #4a5568;
  margin-bottom: 8px;
  font-size: 14px;
`;

const FormInput = styled.input`
  width: 100%;
  padding: 12px 15px;
  border: 2px solid #e2e8f0;
  border-radius: 10px;
  font-size: 14px;
  transition: all 0.3s ease;

  &:focus {
    outline: none;
    border-color: #667eea;
    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
  }
`;

const FormSelect = styled.select`
  width: 100%;
  padding: 12px 15px;
  border: 2px solid #e2e8f0;
  border-radius: 10px;
  font-size: 14px;
  background: white;
  transition: all 0.3s ease;

  &:focus {
    outline: none;
    border-color: #667eea;
    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
  }
`;

const FormTextarea = styled.textarea`
  width: 100%;
  padding: 12px 15px;
  border: 2px solid #e2e8f0;
  border-radius: 10px;
  font-size: 14px;
  min-height: 100px;
  resize: vertical;
  transition: all 0.3s ease;

  &:focus {
    outline: none;
    border-color: #667eea;
    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
  }
`;

const MedicationsSection = styled.div`
  margin: 30px 0;
  padding: 25px;
  background: #f7fafc;
  border-radius: 15px;
`;

const SectionTitle = styled.h3`
  font-size: 18px;
  font-weight: 600;
  color: #2d3748;
  margin: 0 0 20px;
  display: flex;
  align-items: center;
  gap: 10px;
`;

const MedicationCard = styled.div`
  background: white;
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 15px;
`;

const MedicationHeader = styled.div`
  display: flex;
  justify-content: between;
  align-items: center;
  margin-bottom: 15px;
`;

const MedicationTitle = styled.h4`
  font-weight: 600;
  color: #2d3748;
  margin: 0;
  flex: 1;
`;

const RemoveButton = styled(motion.button)`
  padding: 8px;
  background: #fed7d7;
  color: #e53e3e;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover {
    background: #fecaca;
  }
`;

const MedicationGrid = styled.div`
  display: grid;
  grid-template-columns: 2fr 1fr 1fr 1fr;
  gap: 15px;
  margin-bottom: 15px;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const PriceDisplay = styled.div`
  display: flex;
  align-items: center;
  gap: 5px;
  font-weight: 600;
  color: #38a169;
`;

const AddMedicationButton = styled(motion.button)`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 20px;
  background: #667eea;
  color: white;
  border: none;
  border-radius: 10px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  width: 100%;

  &:hover {
    background: #5a67d8;
  }
`;

const FormActions = styled.div`
  display: flex;
  gap: 15px;
  justify-content: flex-end;
  margin-top: 30px;
  padding-top: 30px;
  border-top: 2px solid #e2e8f0;
`;

const ActionButton = styled(motion.button)`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 24px;
  border: none;
  border-radius: 10px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;

  &.primary {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;

    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 20px rgba(102, 126, 234, 0.3);
    }
  }

  &.secondary {
    background: #f7fafc;
    color: #4a5568;
    border: 2px solid #e2e8f0;

    &:hover {
      border-color: #667eea;
      color: #667eea;
    }
  }
`;

const PrescriptionForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const isEdit = Boolean(id);

  const [formData, setFormData] = useState({
    patient: '',
    diagnosis: '',
    symptoms: '',
    notes: '',
    specialInstructions: '',
    validityDays: 30,
    medications: []
  });

  const [patients, setPatients] = useState([]);
  const [availableMedications, setAvailableMedications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchPatients();
    fetchMedications();
    if (isEdit) {
      fetchPrescription();
    }
  }, [id]);

  const fetchPatients = async () => {
    try {
      const result = await patientService.getAllPatients();
      if (result.success) {
        setPatients(result.data.patients || []);
      }
    } catch (error) {
      console.error('Failed to fetch patients:', error);
    }
  };

  const fetchMedications = async () => {
    try {
      const result = await pharmacyService.getAllMedications();
      if (result.success) {
        setAvailableMedications(result.data.medications || []);
      }
    } catch (error) {
      console.error('Failed to fetch medications:', error);
    }
  };

  const fetchPrescription = async () => {
    try {
      setLoading(true);
      const result = await prescriptionService.getPrescriptionById(id);
      if (result.success) {
        const prescription = result.data.prescription;
        setFormData({
          patient: prescription.patient._id,
          diagnosis: prescription.diagnosis || '',
          symptoms: prescription.symptoms || '',
          notes: prescription.notes || '',
          specialInstructions: prescription.specialInstructions || '',
          validityDays: prescription.validityDays || 30,
          medications: prescription.medications.map(med => ({
            medicationId: med.medication._id,
            dosage: med.dosage,
            frequency: med.frequency,
            duration: med.duration,
            route: med.route || 'oral',
            instructions: med.instructions || '',
            quantity: med.quantity,
            refills: med.refills || 0
          })) || []
        });
      } else {
        toast.error(result.message);
        navigate('/prescriptions');
      }
    } catch (error) {
      toast.error('Failed to fetch prescription');
      navigate('/prescriptions');
    } finally {
      setLoading(false);
    }
  };

  const addMedication = () => {
    setFormData(prev => ({
      ...prev,
      medications: [
        ...prev.medications,
        {
          medicationId: '',
          dosage: { amount: '', unit: 'mg' },
          frequency: 'once-daily',
          duration: { value: 7, unit: 'days' },
          route: 'oral',
          instructions: '',
          quantity: 1,
          refills: 0
        }
      ]
    }));
  };

  const removeMedication = (index) => {
    setFormData(prev => ({
      ...prev,
      medications: prev.medications.filter((_, i) => i !== index)
    }));
  };

  const updateMedication = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      medications: prev.medications.map((med, i) => 
        i === index ? { ...med, [field]: value } : med
      )
    }));
  };

  const updateMedicationNested = (index, field, subField, value) => {
    setFormData(prev => ({
      ...prev,
      medications: prev.medications.map((med, i) => 
        i === index ? { 
          ...med, 
          [field]: { ...med[field], [subField]: value } 
        } : med
      )
    }));
  };

  const getMedicationPrice = (medicationId, quantity) => {
    const medication = availableMedications.find(m => m._id === medicationId);
    return medication ? (medication.inventory?.sellingPrice || 0) * quantity : 0;
  };

  const getTotalAmount = () => {
    return formData.medications.reduce((total, med) => {
      return total + getMedicationPrice(med.medicationId, med.quantity);
    }, 0);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.patient) {
      toast.error('Please select a patient');
      return;
    }

    if (formData.medications.length === 0) {
      toast.error('Please add at least one medication');
      return;
    }

    // Validate medications
    for (let i = 0; i < formData.medications.length; i++) {
      const med = formData.medications[i];
      if (!med.medicationId || !med.dosage.amount || !med.quantity) {
        toast.error(`Please complete medication ${i + 1} details`);
        return;
      }
    }

    try {
      setSaving(true);
      const prescriptionData = {
        patientId: formData.patient,
        diagnosis: formData.diagnosis,
        symptoms: formData.symptoms,
        notes: formData.notes,
        specialInstructions: formData.specialInstructions,
        validityDays: formData.validityDays,
        medications: formData.medications
      };

      let result;
      if (isEdit) {
        result = await prescriptionService.updatePrescription(id, prescriptionData);
      } else {
        result = await prescriptionService.createPrescription(prescriptionData);
      }

      if (result.success) {
        toast.success(`Prescription ${isEdit ? 'updated' : 'created'} successfully`);
        navigate('/prescriptions');
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error(`Failed to ${isEdit ? 'update' : 'create'} prescription`);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <PageContainer>
        <div style={{ textAlign: 'center', padding: '50px' }}>
          Loading prescription...
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <BackButton
        onClick={() => navigate('/prescriptions')}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <ArrowLeft size={16} />
        Back to Prescriptions
      </BackButton>

      <FormCard
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <FormHeader>
          <FormTitle>
            <Pill size={28} />
            {isEdit ? 'Edit Prescription' : 'Create New Prescription'}
          </FormTitle>
        </FormHeader>

        <form onSubmit={handleSubmit}>
          <FormGroup>
            <FormLabel>Patient *</FormLabel>
            <FormSelect
              value={formData.patient}
              onChange={(e) => setFormData(prev => ({ ...prev, patient: e.target.value }))}
              required
            >
              <option value="">Select Patient</option>
              {patients.map(patient => (
                <option key={patient._id} value={patient._id}>
                  {patient.firstName} {patient.lastName} - {patient.email}
                </option>
              ))}
            </FormSelect>
          </FormGroup>

          <FormGroup>
            <FormLabel>Diagnosis</FormLabel>
            <FormTextarea
              value={formData.diagnosis}
              onChange={(e) => setFormData(prev => ({ ...prev, diagnosis: e.target.value }))}
              placeholder="Enter diagnosis"
            />
          </FormGroup>

          <FormGroup>
            <FormLabel>Symptoms</FormLabel>
            <FormTextarea
              value={formData.symptoms}
              onChange={(e) => setFormData(prev => ({ ...prev, symptoms: e.target.value }))}
              placeholder="Enter symptoms"
            />
          </FormGroup>

          <MedicationsSection>
            <SectionTitle>
              <Pill size={20} />
              Medications ({formData.medications.length})
            </SectionTitle>

            {formData.medications.map((medication, index) => (
              <MedicationCard key={index}>
                <MedicationHeader>
                  <MedicationTitle>Medication {index + 1}</MedicationTitle>
                  <RemoveButton
                    type="button"
                    onClick={() => removeMedication(index)}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <Trash2 size={16} />
                  </RemoveButton>
                </MedicationHeader>

                <MedicationGrid>
                  <FormGroup>
                    <FormLabel>Medication *</FormLabel>
                    <FormSelect
                      value={medication.medicationId}
                      onChange={(e) => updateMedication(index, 'medicationId', e.target.value)}
                      required
                    >
                      <option value="">Select Medication</option>
                      {availableMedications.map(med => (
                        <option key={med._id} value={med._id}>
                          {med.name} - ${med.inventory?.sellingPrice || 0}
                        </option>
                      ))}
                    </FormSelect>
                  </FormGroup>

                  <FormGroup>
                    <FormLabel>Dosage Amount *</FormLabel>
                    <FormInput
                      type="number"
                      value={medication.dosage.amount}
                      onChange={(e) => updateMedicationNested(index, 'dosage', 'amount', e.target.value)}
                      placeholder="Amount"
                      required
                    />
                  </FormGroup>

                  <FormGroup>
                    <FormLabel>Dosage Unit</FormLabel>
                    <FormSelect
                      value={medication.dosage.unit}
                      onChange={(e) => updateMedicationNested(index, 'dosage', 'unit', e.target.value)}
                    >
                      <option value="mg">mg</option>
                      <option value="g">g</option>
                      <option value="ml">ml</option>
                      <option value="tablet">tablet</option>
                      <option value="capsule">capsule</option>
                    </FormSelect>
                  </FormGroup>

                  <FormGroup>
                    <FormLabel>Quantity *</FormLabel>
                    <FormInput
                      type="number"
                      min="1"
                      value={medication.quantity}
                      onChange={(e) => updateMedication(index, 'quantity', parseInt(e.target.value) || 1)}
                      required
                    />
                  </FormGroup>
                </MedicationGrid>

                <MedicationGrid>
                  <FormGroup>
                    <FormLabel>Frequency</FormLabel>
                    <FormSelect
                      value={medication.frequency}
                      onChange={(e) => updateMedication(index, 'frequency', e.target.value)}
                    >
                      <option value="once-daily">Once Daily</option>
                      <option value="twice-daily">Twice Daily</option>
                      <option value="three-times-daily">Three Times Daily</option>
                      <option value="four-times-daily">Four Times Daily</option>
                      <option value="every-6-hours">Every 6 Hours</option>
                      <option value="every-8-hours">Every 8 Hours</option>
                      <option value="every-12-hours">Every 12 Hours</option>
                      <option value="as-needed">As Needed</option>
                    </FormSelect>
                  </FormGroup>

                  <FormGroup>
                    <FormLabel>Duration Value</FormLabel>
                    <FormInput
                      type="number"
                      min="1"
                      value={medication.duration.value}
                      onChange={(e) => updateMedicationNested(index, 'duration', 'value', parseInt(e.target.value) || 1)}
                    />
                  </FormGroup>

                  <FormGroup>
                    <FormLabel>Duration Unit</FormLabel>
                    <FormSelect
                      value={medication.duration.unit}
                      onChange={(e) => updateMedicationNested(index, 'duration', 'unit', e.target.value)}
                    >
                      <option value="days">Days</option>
                      <option value="weeks">Weeks</option>
                      <option value="months">Months</option>
                    </FormSelect>
                  </FormGroup>

                  <FormGroup>
                    <FormLabel>Route</FormLabel>
                    <FormSelect
                      value={medication.route}
                      onChange={(e) => updateMedication(index, 'route', e.target.value)}
                    >
                      <option value="oral">Oral</option>
                      <option value="intravenous">Intravenous</option>
                      <option value="intramuscular">Intramuscular</option>
                      <option value="subcutaneous">Subcutaneous</option>
                      <option value="topical">Topical</option>
                      <option value="inhalation">Inhalation</option>
                      <option value="nasal">Nasal</option>
                      <option value="rectal">Rectal</option>
                    </FormSelect>
                  </FormGroup>
                  <FormGroup>
                    <FormLabel>Price</FormLabel>
                    <PriceDisplay>
                      <DollarSign size={16} />
                      {getMedicationPrice(medication.medicationId, medication.quantity).toFixed(2)}
                    </PriceDisplay>
                  </FormGroup>
                </MedicationGrid>

                <FormGroup>
                  <FormLabel>Instructions</FormLabel>
                  <FormTextarea
                    value={medication.instructions}
                    onChange={(e) => updateMedication(index, 'instructions', e.target.value)}
                    placeholder="Take with food, avoid alcohol, etc."
                    style={{ minHeight: '60px' }}
                  />
                </FormGroup>
              </MedicationCard>
            ))}

            <AddMedicationButton
              type="button"
              onClick={addMedication}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Plus size={16} />
              Add Medication
            </AddMedicationButton>
          </MedicationsSection>

          <FormGroup>
            <FormLabel>Special Instructions</FormLabel>
            <FormTextarea
              value={formData.specialInstructions}
              onChange={(e) => setFormData(prev => ({ ...prev, specialInstructions: e.target.value }))}
              placeholder="Any special instructions for this prescription"
            />
          </FormGroup>

          <FormGroup>
            <FormLabel>Additional Notes</FormLabel>
            <FormTextarea
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              placeholder="Any additional notes"
            />
          </FormGroup>

          <FormGroup>
            <FormLabel>Validity (Days)</FormLabel>
            <FormInput
              type="number"
              min="1"
              max="365"
              value={formData.validityDays}
              onChange={(e) => setFormData(prev => ({ ...prev, validityDays: parseInt(e.target.value) || 30 }))}
            />
          </FormGroup>

          {formData.medications.length > 0 && (
            <div style={{ 
              marginTop: '20px', 
              padding: '15px', 
              background: '#f0fff4', 
              borderRadius: '10px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <span style={{ fontWeight: '600', color: '#2d3748' }}>
                Total Amount:
              </span>
              <span style={{ 
                fontSize: '20px', 
                fontWeight: '700', 
                color: '#38a169',
                display: 'flex',
                alignItems: 'center',
                gap: '5px'
              }}>
                <DollarSign size={20} />
                {getTotalAmount().toFixed(2)}
              </span>
            </div>
          )}

          <FormActions>
            <ActionButton
              type="button"
              className="secondary"
              onClick={() => navigate('/prescriptions')}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              Cancel
            </ActionButton>
            <ActionButton
              type="submit"
              className="primary"
              disabled={saving}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Save size={16} />
              {saving ? 'Saving...' : (isEdit ? 'Update' : 'Create')} Prescription
            </ActionButton>
          </FormActions>
        </form>
      </FormCard>
    </PageContainer>
  );
};

export default PrescriptionForm;
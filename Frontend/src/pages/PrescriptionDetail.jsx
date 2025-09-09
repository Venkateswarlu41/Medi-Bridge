import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  Pill,
  User,
  Calendar,
  FileText,
  DollarSign,
  Edit,
  Package
} from 'lucide-react';
import toast from 'react-hot-toast';
import prescriptionService from '../services/prescription.service';
import { useAuth } from '../context/AuthContext';
import { format, parseISO } from 'date-fns';

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

const DetailCard = styled(motion.div)`
  background: white;
  border-radius: 20px;
  padding: 30px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 30px;
`;

const HeaderLeft = styled.div`
  flex: 1;
`;

const Title = styled.h1`
  font-size: 28px;
  font-weight: 700;
  color: #2d3748;
  margin: 0 0 10px;
  display: flex;
  align-items: center;
  gap: 12px;
`;

const PrescriptionId = styled.div`
  font-size: 16px;
  color: #718096;
  margin-bottom: 15px;
`;

const StatusBadge = styled.div`
  padding: 8px 16px;
  border-radius: 20px;
  font-size: 14px;
  font-weight: 600;
  text-transform: uppercase;
  background: ${props => getStatusColor(props.status)}20;
  color: ${props => getStatusColor(props.status)};
  display: inline-flex;
  align-items: center;
  gap: 8px;
`;

const EditButton = styled(motion.button)`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 20px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 10px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 20px rgba(102, 126, 234, 0.3);
  }
`;

const InfoGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 30px;
  margin-bottom: 30px;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const InfoSection = styled.div`
  background: #f7fafc;
  padding: 25px;
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

const InfoRow = styled.div`
  display: flex;
  margin-bottom: 15px;
  font-size: 15px;

  &:last-child {
    margin-bottom: 0;
  }
`;

const InfoLabel = styled.span`
  color: #718096;
  min-width: 120px;
`;

const InfoValue = styled.span`
  color: #2d3748;
  font-weight: 500;
  flex: 1;
`;

const MedicationsSection = styled.div`
  background: #f7fafc;
  padding: 25px;
  border-radius: 15px;
  margin-bottom: 20px;
`;

const MedicationsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 15px;
`;

const MedicationCard = styled.div`
  background: white;
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  padding: 20px;
`;

const MedicationName = styled.div`
  font-weight: 600;
  color: #2d3748;
  font-size: 16px;
  margin-bottom: 10px;

  .generic {
    font-size: 14px;
    color: #718096;
    font-weight: 400;
    margin-top: 4px;
  }
`;

const MedicationDetails = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 15px;
  margin-bottom: 10px;
`;

const DetailItem = styled.div`
  .label {
    font-size: 12px;
    color: #718096;
    text-transform: uppercase;
    font-weight: 600;
    margin-bottom: 4px;
  }
  
  .value {
    font-size: 14px;
    color: #2d3748;
    font-weight: 500;
  }
`;

const PriceTag = styled.div`
  display: flex;
  align-items: center;
  gap: 5px;
  font-weight: 600;
  color: #38a169;
  font-size: 16px;
`;

const TotalAmount = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  background: #f0fff4;
  border-radius: 15px;
  margin-top: 20px;
`;

const TotalLabel = styled.span`
  font-size: 18px;
  font-weight: 600;
  color: #2d3748;
`;

const TotalValue = styled.span`
  font-size: 24px;
  font-weight: 700;
  color: #38a169;
  display: flex;
  align-items: center;
  gap: 5px;
`;

// Helper function to get status color
const getStatusColor = (status) => {
  const colors = {
    active: '#48bb78',
    completed: '#38b2ac',
    cancelled: '#e53e3e',
    expired: '#a0aec0'
  };
  return colors[status] || '#718096';
};

const formatFrequency = (frequency) => {
  if (!frequency) return 'As needed';
  return `${frequency.times} times ${frequency.period}`;
};

const formatDuration = (duration) => {
  if (!duration) return 'As needed';
  return `${duration.value} ${duration.unit}`;
};

const PrescriptionDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { hasAnyRole } = useAuth();

  const [prescription, setPrescription] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPrescription();
  }, [id]);

  const fetchPrescription = async () => {
    try {
      setLoading(true);
      const result = await prescriptionService.getPrescriptionById(id);
      if (result.success) {
        setPrescription(result.data.prescription);
      } else {
        toast.error(result.message);
        navigate('/prescriptions');
      }
    } catch (error) {
      toast.error('Failed to fetch prescription details');
      navigate('/prescriptions');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <PageContainer>
        <div style={{ textAlign: 'center', padding: '50px' }}>
          Loading prescription details...
        </div>
      </PageContainer>
    );
  }

  if (!prescription) {
    return (
      <PageContainer>
        <div style={{ textAlign: 'center', padding: '50px' }}>
          Prescription not found
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

      <DetailCard
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Header>
          <HeaderLeft>
            <Title>
              <Pill size={28} />
              Prescription Details
            </Title>
            <PrescriptionId>ID: {prescription.prescriptionId}</PrescriptionId>
            <StatusBadge status={prescription.status}>
              {prescription.status}
            </StatusBadge>
          </HeaderLeft>

          {hasAnyRole(['admin', 'doctor']) && prescription.status === 'active' && (
            <EditButton
              onClick={() => navigate(`/prescriptions/${prescription._id}/edit`)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Edit size={16} />
              Edit Prescription
            </EditButton>
          )}
        </Header>

        <InfoGrid>
          <InfoSection>
            <SectionTitle>
              <User size={20} />
              Patient Information
            </SectionTitle>
            <InfoRow>
              <InfoLabel>Name:</InfoLabel>
              <InfoValue>
                {prescription.patient?.firstName} {prescription.patient?.lastName}
              </InfoValue>
            </InfoRow>
            <InfoRow>
              <InfoLabel>Email:</InfoLabel>
              <InfoValue>{prescription.patient?.email}</InfoValue>
            </InfoRow>
            <InfoRow>
              <InfoLabel>Phone:</InfoLabel>
              <InfoValue>{prescription.patient?.phone}</InfoValue>
            </InfoRow>
          </InfoSection>

          <InfoSection>
            <SectionTitle>
              <User size={20} />
              Doctor Information
            </SectionTitle>
            <InfoRow>
              <InfoLabel>Name:</InfoLabel>
              <InfoValue>
                Dr. {prescription.doctor?.firstName} {prescription.doctor?.lastName}
              </InfoValue>
            </InfoRow>
            <InfoRow>
              <InfoLabel>Specialization:</InfoLabel>
              <InfoValue>{prescription.doctor?.specialization || 'General Medicine'}</InfoValue>
            </InfoRow>
            <InfoRow>
              <InfoLabel>License:</InfoLabel>
              <InfoValue>{prescription.doctor?.licenseNumber || 'N/A'}</InfoValue>
            </InfoRow>
          </InfoSection>
        </InfoGrid>

        <InfoGrid>
          <InfoSection>
            <SectionTitle>
              <Calendar size={20} />
              Prescription Information
            </SectionTitle>
            <InfoRow>
              <InfoLabel>Created:</InfoLabel>
              <InfoValue>
                {format(parseISO(prescription.createdAt), 'MMM dd, yyyy hh:mm a')}
              </InfoValue>
            </InfoRow>
            <InfoRow>
              <InfoLabel>Status:</InfoLabel>
              <InfoValue style={{ textTransform: 'capitalize' }}>
                {prescription.status}
              </InfoValue>
            </InfoRow>
            <InfoRow>
              <InfoLabel>Total Amount:</InfoLabel>
              <InfoValue>
                <PriceTag>
                  <DollarSign size={16} />
                  {prescription.totalAmount?.toFixed(2) || '0.00'}
                </PriceTag>
              </InfoValue>
            </InfoRow>
          </InfoSection>

          <InfoSection>
            <SectionTitle>
              <FileText size={20} />
              Clinical Information
            </SectionTitle>
            <InfoRow>
              <InfoLabel>Indication:</InfoLabel>
              <InfoValue>
                {prescription.clinicalIndication || 'Not specified'}
              </InfoValue>
            </InfoRow>
            <InfoRow>
              <InfoLabel>Notes:</InfoLabel>
              <InfoValue>
                {prescription.notes || 'No additional notes'}
              </InfoValue>
            </InfoRow>
          </InfoSection>
        </InfoGrid>

        <MedicationsSection>
          <SectionTitle>
            <Package size={20} />
            Medications ({prescription.medications?.length || 0})
          </SectionTitle>

          <MedicationsList>
            {prescription.medications?.map((med, index) => (
              <MedicationCard key={index}>
                <MedicationName>
                  {med.medication?.name}
                  {med.medication?.genericName && (
                    <div className="generic">
                      Generic: {med.medication.genericName}
                    </div>
                  )}
                </MedicationName>

                <MedicationDetails>
                  <DetailItem>
                    <div className="label">Dosage</div>
                    <div className="value">
                      {med.dosage?.amount} {med.dosage?.unit}
                    </div>
                  </DetailItem>

                  <DetailItem>
                    <div className="label">Frequency</div>
                    <div className="value">
                      {formatFrequency(med.frequency)}
                    </div>
                  </DetailItem>

                  <DetailItem>
                    <div className="label">Duration</div>
                    <div className="value">
                      {formatDuration(med.duration)}
                    </div>
                  </DetailItem>

                  <DetailItem>
                    <div className="label">Quantity</div>
                    <div className="value">{med.quantity}</div>
                  </DetailItem>

                  <DetailItem>
                    <div className="label">Unit Price</div>
                    <div className="value">
                      <PriceTag>
                        <DollarSign size={14} />
                        {med.medication?.inventory?.sellingPrice?.toFixed(2) || '0.00'}
                      </PriceTag>
                    </div>
                  </DetailItem>

                  <DetailItem>
                    <div className="label">Total Price</div>
                    <div className="value">
                      <PriceTag>
                        <DollarSign size={14} />
                        {((med.medication?.inventory?.sellingPrice || 0) * med.quantity).toFixed(2)}
                      </PriceTag>
                    </div>
                  </DetailItem>
                </MedicationDetails>

                {med.specialInstructions && (
                  <div style={{ marginTop: '15px' }}>
                    <div style={{ 
                      fontSize: '12px', 
                      color: '#718096', 
                      textTransform: 'uppercase', 
                      fontWeight: '600',
                      marginBottom: '4px'
                    }}>
                      Special Instructions
                    </div>
                    <div style={{ 
                      fontSize: '14px', 
                      color: '#2d3748',
                      fontStyle: 'italic'
                    }}>
                      {med.specialInstructions}
                    </div>
                  </div>
                )}
              </MedicationCard>
            ))}
          </MedicationsList>

          {prescription.medications?.length > 0 && (
            <TotalAmount>
              <TotalLabel>Total Prescription Amount:</TotalLabel>
              <TotalValue>
                <DollarSign size={24} />
                {prescription.totalAmount?.toFixed(2) || '0.00'}
              </TotalValue>
            </TotalAmount>
          )}
        </MedicationsSection>
      </DetailCard>
    </PageContainer>
  );
};

export default PrescriptionDetail;
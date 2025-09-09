import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Pill,
  Search,
  Plus,
  Eye,
  Edit,
  X,
  Calendar,
  User,
  FileText,
  Clock,
  CheckCircle,
  AlertTriangle,
  Filter,
  ChevronDown,
  ChevronUp,
  Package,
  DollarSign
} from 'lucide-react';
import toast from 'react-hot-toast';
import prescriptionService from '../services/prescription.service';
import { useAuth } from '../context/AuthContext';
import { format, parseISO } from 'date-fns';

const PageContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
`;

const PageHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
`;

const PageTitle = styled.h1`
  font-size: 32px;
  font-weight: 700;
  color: #2d3748;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 12px;
`;

const AddButton = styled(motion.button)`
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

const FiltersContainer = styled.div`
  display: flex;
  gap: 15px;
  margin-bottom: 25px;
  flex-wrap: wrap;
  align-items: center;
`;

const SearchContainer = styled.div`
  position: relative;
  flex: 1;
  min-width: 300px;
`;

const SearchIcon = styled.div`
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: #a0aec0;
`;

const SearchInput = styled.input`
  width: 100%;
  padding: 12px 15px 12px 40px;
  border: 2px solid #e2e8f0;
  border-radius: 10px;
  font-size: 14px;
  transition: border-color 0.3s ease;

  &:focus {
    outline: none;
    border-color: #667eea;
  }
`;

const FilterSelect = styled.select`
  padding: 12px 15px;
  border: 2px solid #e2e8f0;
  border-radius: 10px;
  font-size: 14px;
  background: white;
  cursor: pointer;
  transition: border-color 0.3s ease;

  &:focus {
    outline: none;
    border-color: #667eea;
  }
`;

const PrescriptionsGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 20px;
  margin-bottom: 30px;
`;

const PrescriptionCard = styled(motion.div)`
  background: white;
  border-radius: 15px;
  padding: 25px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.07);
  border: 2px solid #f7fafc;
  transition: all 0.3s ease;

  &:hover {
    border-color: #667eea;
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
  }
`;

const PrescriptionHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 20px;
`;

const PrescriptionInfo = styled.div`
  flex: 1;
`;

const PrescriptionId = styled.h3`
  font-size: 18px;
  font-weight: 600;
  color: #2d3748;
  margin: 0 0 8px;
`;

const PrescriptionDate = styled.div`
  font-size: 14px;
  color: #718096;
  margin-bottom: 8px;
  display: flex;
  align-items: center;
  gap: 5px;
`;

const StatusBadge = styled.div`
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  background: ${props => getStatusColor(props.$status)}20;
  color: ${props => getStatusColor(props.$status)};
  display: inline-block;
`;

const PatientDoctorInfo = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  margin-bottom: 20px;
`;

const InfoSection = styled.div`
  background: #f7fafc;
  padding: 15px;
  border-radius: 10px;
`;

const InfoTitle = styled.h4`
  font-size: 14px;
  font-weight: 600;
  color: #2d3748;
  margin: 0 0 8px;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const InfoValue = styled.div`
  color: #4a5568;
  font-size: 14px;
`;

const MedicationsSection = styled.div`
  margin-bottom: 20px;
`;

const MedicationsToggle = styled.button`
  background: none;
  border: none;
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 600;
  color: #667eea;
  cursor: pointer;
  margin-bottom: 15px;
  transition: color 0.3s ease;

  &:hover {
    color: #5a6fcf;
  }
`;

const MedicationsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const MedicationItem = styled.div`
  background: white;
  border: 2px solid #e2e8f0;
  border-radius: 10px;
  padding: 15px;
  display: grid;
  grid-template-columns: 2fr 1fr 1fr 1fr auto;
  gap: 15px;
  align-items: center;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 10px;
  }
`;

const MedicationName = styled.div`
  font-weight: 600;
  color: #2d3748;
  
  .generic {
    font-size: 12px;
    color: #718096;
    font-weight: normal;
    margin-top: 2px;
  }
`;

const MedicationDosage = styled.div`
  color: #4a5568;
  font-size: 14px;
`;

const MedicationFrequency = styled.div`
  color: #4a5568;
  font-size: 14px;
  text-transform: capitalize;
`;

const MedicationPrice = styled.div`
  color: #48bb78;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 4px;
`;

const TotalAmount = styled.div`
  background: #f7fafc;
  padding: 15px;
  border-radius: 10px;
  margin-bottom: 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const TotalLabel = styled.div`
  font-weight: 600;
  color: #2d3748;
`;

const TotalValue = styled.div`
  font-size: 18px;
  font-weight: 700;
  color: #48bb78;
`;

const ActionsContainer = styled.div`
  display: flex;
  gap: 10px;
  justify-content: flex-end;
`;

const ActionButton = styled(motion.button)`
  padding: 8px 12px;
  border: 2px solid #e2e8f0;
  background: white;
  border-radius: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 14px;
  color: #4a5568;
  transition: all 0.3s ease;

  &:hover {
    border-color: #667eea;
    color: #667eea;
  }

  &.primary {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    border-color: transparent;

    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 5px 15px rgba(102, 126, 234, 0.3);
    }
  }

  &.danger {
    border-color: #fed7d7;
    color: #e53e3e;

    &:hover {
      background: #fed7d7;
    }
  }
`;

const LoadingContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 200px;
  color: #718096;
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 60px 20px;
  color: #718096;

  h3 {
    font-size: 24px;
    margin-bottom: 10px;
    color: #4a5568;
  }

  p {
    font-size: 16px;
    margin-bottom: 20px;
  }
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

const Prescriptions = () => {
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [expandedCards, setExpandedCards] = useState(new Set());
  
  const { hasAnyRole, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchPrescriptions();
  }, []);

  const fetchPrescriptions = async () => {
    try {
      setLoading(true);
      const result = await prescriptionService.getAllPrescriptions();
      
      if (result.success) {
        setPrescriptions(result.data.prescriptions || []);
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      console.error('Failed to fetch prescriptions:', error);
      toast.error('Failed to fetch prescriptions');
    } finally {
      setLoading(false);
    }
  };

  const filteredPrescriptions = prescriptions.filter(prescription => {
    const matchesSearch = searchQuery === '' || 
      prescription.prescriptionId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      `${prescription.patient?.firstName} ${prescription.patient?.lastName}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
      `${prescription.doctor?.firstName} ${prescription.doctor?.lastName}`.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === '' || prescription.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const toggleCardExpansion = (prescriptionId) => {
    const newExpanded = new Set(expandedCards);
    if (newExpanded.has(prescriptionId)) {
      newExpanded.delete(prescriptionId);
    } else {
      newExpanded.add(prescriptionId);
    }
    setExpandedCards(newExpanded);
  };

  const handleViewPrescription = (prescription) => {
    navigate(`/prescriptions/${prescription._id}`);
  };

  const handleEditPrescription = (prescription) => {
    navigate(`/prescriptions/${prescription._id}/edit`);
  };

  const handleCreatePrescription = () => {
    navigate('/prescriptions/new');
  };

  const handleCancelPrescription = async (prescription) => {
    if (window.confirm('Are you sure you want to cancel this prescription?')) {
      try {
        const result = await prescriptionService.cancelPrescription(prescription._id, 'Cancelled by doctor');
        if (result.success) {
          toast.success('Prescription cancelled successfully');
          fetchPrescriptions();
        } else {
          toast.error(result.message);
        }
      } catch (error) {
        toast.error('Failed to cancel prescription');
      }
    }
  };

  const formatDate = (dateString) => {
    try {
      return format(parseISO(dateString), 'MMM dd, yyyy');
    } catch (error) {
      return 'Invalid date';
    }
  };

  const formatFrequency = (frequency) => {
    return frequency.replace(/-/g, ' ');
  };

  if (loading) {
    return (
      <PageContainer>
        <LoadingContainer>
          <div>Loading prescriptions...</div>
        </LoadingContainer>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <PageHeader>
        <PageTitle>
          <Pill size={32} />
          Prescriptions ({prescriptions.length})
        </PageTitle>
        
        {hasAnyRole(['doctor']) && (
          <AddButton
            onClick={handleCreatePrescription}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Plus size={18} />
            New Prescription
          </AddButton>
        )}
      </PageHeader>

      <FiltersContainer>
        <SearchContainer>
          <SearchIcon>
            <Search size={18} />
          </SearchIcon>
          <SearchInput
            type="text"
            placeholder="Search prescriptions..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </SearchContainer>

        <FilterSelect value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="">All Status</option>
          <option value="active">Active</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
          <option value="expired">Expired</option>
        </FilterSelect>
      </FiltersContainer>

      {filteredPrescriptions.length === 0 ? (
        <EmptyState>
          <Pill size={64} color="#cbd5e0" />
          <h3>No prescriptions found</h3>
          <p>
            {searchQuery || statusFilter
              ? 'Try adjusting your search criteria'
              : hasAnyRole(['doctor']) 
                ? 'Get started by creating your first prescription'
                : 'No prescriptions have been prescribed yet'
            }
          </p>
          {hasAnyRole(['doctor']) && (
            <AddButton
              onClick={handleCreatePrescription}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Plus size={18} />
              New Prescription
            </AddButton>
          )}
        </EmptyState>
      ) : (
        <PrescriptionsGrid>
          {filteredPrescriptions.map((prescription, index) => (
            <PrescriptionCard
              key={prescription._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
            >
              <PrescriptionHeader>
                <PrescriptionInfo>
                  <PrescriptionId>{prescription.prescriptionId}</PrescriptionId>
                  <PrescriptionDate>
                    <Calendar size={14} />
                    {formatDate(prescription.prescriptionDate)}
                  </PrescriptionDate>
                  <StatusBadge $status={prescription.status}>
                    {prescription.status}
                  </StatusBadge>
                </PrescriptionInfo>
              </PrescriptionHeader>

              <PatientDoctorInfo>
                <InfoSection>
                  <InfoTitle>
                    <User size={16} />
                    Patient
                  </InfoTitle>
                  <InfoValue>
                    {prescription.patient?.firstName} {prescription.patient?.lastName}
                  </InfoValue>
                </InfoSection>
                {hasAnyRole(['admin', 'patient']) && (
                  <InfoSection>
                    <InfoTitle>
                      <User size={16} />
                      Doctor
                    </InfoTitle>
                    <InfoValue>
                      Dr. {prescription.doctor?.firstName} {prescription.doctor?.lastName}
                    </InfoValue>
                  </InfoSection>
                )}
              </PatientDoctorInfo>

              {prescription.diagnosis && (
                <InfoSection style={{ marginBottom: '20px' }}>
                  <InfoTitle>
                    <FileText size={16} />
                    Diagnosis
                  </InfoTitle>
                  <InfoValue>{prescription.diagnosis}</InfoValue>
                </InfoSection>
              )}

              <MedicationsSection>
                <MedicationsToggle
                  onClick={() => toggleCardExpansion(prescription._id)}
                >
                  <Package size={16} />
                  Medications ({prescription.medications?.length || 0})
                  {expandedCards.has(prescription._id) ? 
                    <ChevronUp size={16} /> : 
                    <ChevronDown size={16} />
                  }
                </MedicationsToggle>

                <AnimatePresence>
                  {expandedCards.has(prescription._id) && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <MedicationsList>
                        {prescription.medications?.map((med, medIndex) => (
                          <MedicationItem key={medIndex}>
                            <MedicationName>
                              {med.medication?.name}
                              {med.medication?.genericName && (
                                <div className="generic">
                                  Generic: {med.medication.genericName}
                                </div>
                              )}
                            </MedicationName>
                            <MedicationDosage>
                              {med.dosage?.amount} {med.dosage?.unit}
                            </MedicationDosage>
                            <MedicationFrequency>
                              {formatFrequency(med.frequency)}
                            </MedicationFrequency>
                            <MedicationPrice>
                              <DollarSign size={14} />
                              ${(med.medication?.inventory?.sellingPrice * med.quantity).toFixed(2)}
                            </MedicationPrice>
                            <div style={{ fontSize: '12px', color: '#718096' }}>
                              Qty: {med.quantity}
                            </div>
                          </MedicationItem>
                        ))}
                      </MedicationsList>
                    </motion.div>
                  )}
                </AnimatePresence>
              </MedicationsSection>

              <TotalAmount>
                <TotalLabel>Total Amount:</TotalLabel>
                <TotalValue>${prescription.billing?.totalAmount?.toFixed(2) || '0.00'}</TotalValue>
              </TotalAmount>

              <ActionsContainer>
                <ActionButton
                  onClick={() => handleViewPrescription(prescription)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Eye size={14} />
                  View
                </ActionButton>
                {hasAnyRole(['doctor']) && prescription.status === 'active' && (
                  <>
                    <ActionButton
                      onClick={() => handleEditPrescription(prescription)}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Edit size={14} />
                      Edit
                    </ActionButton>
                    <ActionButton
                      className="danger"
                      onClick={() => handleCancelPrescription(prescription)}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <X size={14} />
                      Cancel
                    </ActionButton>
                  </>
                )}
              </ActionsContainer>
            </PrescriptionCard>
          ))}
        </PrescriptionsGrid>
      )}
    </PageContainer>
  );
};

export default Prescriptions;
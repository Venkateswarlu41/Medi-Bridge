import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  FileText,
  User,
  Calendar,
  Activity,
  Pill,
  TestTube,
  Heart,
  Building,
  Clock,
  AlertCircle,
  CheckCircle,
  Download,
  Edit,
  Printer
} from 'lucide-react';
import toast from 'react-hot-toast';
import medicalRecordService from '../services/medicalRecord.service';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/common/LoadingSpinner';

const PageContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  gap: 20px;
  margin-bottom: 30px;
`;

const BackButton = styled(motion.button)`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border: 2px solid var(--gray-200);
  background: white;
  border-radius: 10px;
  cursor: pointer;
  color: var(--gray-600);
  transition: all 0.3s ease;

  &:hover {
    border-color: var(--primary-color);
    color: var(--primary-color);
  }
`;

const PageTitle = styled.h1`
  font-size: 28px;
  font-weight: 700;
  color: var(--gray-800);
  margin: 0;
`;

const RecordContainer = styled.div`
  display: grid;
  grid-template-columns: 350px 1fr;
  gap: 30px;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 20px;
  }
`;

const SidePanel = styled(motion.div)`
  background: white;
  border-radius: 20px;
  padding: 30px;
  box-shadow: var(--shadow-sm);
  height: fit-content;
`;

const MainContent = styled(motion.div)`
  background: white;
  border-radius: 20px;
  padding: 30px;
  box-shadow: var(--shadow-sm);
`;

const RecordHeader = styled.div`
  border-bottom: 1px solid var(--gray-200);
  padding-bottom: 20px;
  margin-bottom: 25px;
`;

const RecordTitle = styled.h2`
  font-size: 24px;
  font-weight: 700;
  color: var(--gray-800);
  margin: 0 0 10px;
`;

const RecordId = styled.div`
  font-size: 14px;
  color: var(--gray-500);
  margin-bottom: 15px;
`;

const RecordType = styled.div`
  display: inline-block;
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  background: var(--primary-color)20;
  color: var(--primary-color);
`;

const InfoRow = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 15px;
  color: var(--gray-600);
  font-size: 14px;

  svg {
    color: var(--gray-400);
  }
`;

const Section = styled.div`
  margin-bottom: 30px;
`;

const SectionTitle = styled.h3`
  font-size: 18px;
  font-weight: 600;
  color: var(--gray-800);
  margin: 0 0 15px;
  display: flex;
  align-items: center;
  gap: 10px;
`;

const ContentText = styled.div`
  color: var(--gray-600);
  line-height: 1.6;
  margin-bottom: 15px;
`;

const DiagnosisList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const DiagnosisItem = styled.div`
  padding: 15px;
  background: var(--gray-50);
  border-radius: 10px;
  border-left: 4px solid var(--primary-color);
`;

const DiagnosisCode = styled.div`
  font-size: 12px;
  color: var(--gray-500);
  margin-bottom: 5px;
`;

const DiagnosisDescription = styled.div`
  color: var(--gray-800);
  font-weight: 500;
`;

const MedicationList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const MedicationItem = styled.div`
  padding: 15px;
  background: var(--gray-50);
  border-radius: 10px;
  border-left: 4px solid #10b981;
`;

const MedicationName = styled.div`
  font-weight: 600;
  color: var(--gray-800);
  margin-bottom: 5px;
`;

const MedicationDetails = styled.div`
  font-size: 14px;
  color: var(--gray-600);
`;

const LabResultsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const LabResultItem = styled.div`
  padding: 15px;
  background: var(--gray-50);
  border-radius: 10px;
  border-left: 4px solid #8b5cf6;
`;

const TestName = styled.div`
  font-weight: 600;
  color: var(--gray-800);
  margin-bottom: 5px;
`;

const TestResult = styled.div`
  font-size: 14px;
  color: var(--gray-600);
  margin-bottom: 5px;
`;

const TestStatus = styled.span`
  padding: 4px 8px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  ${props => {
    switch (props.status) {
      case 'normal':
        return 'background: #10b98120; color: #10b981;';
      case 'abnormal':
        return 'background: #f5971320; color: #f59713;';
      case 'critical':
        return 'background: #ef444420; color: #ef4444;';
      default:
        return 'background: #6b728020; color: #6b7280;';
    }
  }}
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 15px;
  justify-content: flex-end;
  margin-top: 30px;
`;

const ActionButton = styled(motion.button)`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  border: 2px solid var(--primary-color);
  background: white;
  color: var(--primary-color);
  border-radius: 10px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    background: var(--primary-color);
    color: white;
  }

  &.primary {
    background: var(--primary-color);
    color: white;

    &:hover {
      background: var(--secondary-color);
    }
  }
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 40px 20px;
  color: var(--gray-500);

  svg {
    margin-bottom: 15px;
    color: var(--gray-400);
  }

  h4 {
    margin: 0 0 8px;
    color: var(--gray-700);
  }

  p {
    margin: 0;
    font-size: 14px;
  }
`;

const MedicalRecordDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [record, setRecord] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRecord();
  }, [id]);

  const fetchRecord = async () => {
    setLoading(true);
    try {
      const response = await medicalRecordService.getMedicalRecordById(id);
      
      if (response.success) {
        setRecord(response.data.record);
      } else {
        toast.error('Failed to fetch medical record');
        navigate('/medical-records');
      }
    } catch (error) {
      console.error('Error fetching medical record:', error);
      toast.error('An error occurred while fetching medical record');
      navigate('/medical-records');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async () => {
    try {
      toast.success('Download feature coming soon');
    } catch (error) {
      toast.error('Failed to download record');
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!record) {
    return (
      <PageContainer>
        <EmptyState>
          <FileText size={60} />
          <h4>Medical record not found</h4>
          <p>The requested medical record could not be found.</p>
        </EmptyState>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <Header>
        <BackButton
          onClick={() => navigate('/medical-records')}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          <ArrowLeft size={20} />
        </BackButton>
        <PageTitle>Medical Record Details</PageTitle>
      </Header>

      <RecordContainer>
        <SidePanel
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
        >
          <RecordHeader>
            <RecordId>ID: {record.recordId || record._id}</RecordId>
            <RecordTitle>{record.recordType?.replace('-', ' ')}</RecordTitle>
            <RecordType>{record.recordType}</RecordType>
          </RecordHeader>

          <Section>
            <SectionTitle>
              <User size={18} />
              Patient Information
            </SectionTitle>
            <InfoRow>
              <User size={16} />
              <span>{record.patient?.firstName} {record.patient?.lastName}</span>
            </InfoRow>
            <InfoRow>
              <Calendar size={16} />
              <span>
                {record.patient?.dateOfBirth ? 
                  new Date(record.patient.dateOfBirth).toLocaleDateString() : 
                  'Date of birth not available'
                }
              </span>
            </InfoRow>
            {record.patient?.gender && (
              <InfoRow>
                <User size={16} />
                <span>{record.patient.gender}</span>
              </InfoRow>
            )}
            {record.patient?.bloodGroup && (
              <InfoRow>
                <Heart size={16} />
                <span>Blood Group: {record.patient.bloodGroup}</span>
              </InfoRow>
            )}
          </Section>

          <Section>
            <SectionTitle>
              <User size={18} />
              Healthcare Provider
            </SectionTitle>
            <InfoRow>
              <User size={16} />
              <span>Dr. {record.doctor?.firstName} {record.doctor?.lastName}</span>
            </InfoRow>
            <InfoRow>
              <Activity size={16} />
              <span>{record.doctor?.specialization}</span>
            </InfoRow>
            <InfoRow>
              <Building size={16} />
              <span>{record.department?.name}</span>
            </InfoRow>
          </Section>

          <Section>
            <SectionTitle>
              <Clock size={18} />
              Record Information
            </SectionTitle>
            <InfoRow>
              <Calendar size={16} />
              <span>
                {new Date(record.recordDate || record.createdAt).toLocaleDateString()}
              </span>
            </InfoRow>
            <InfoRow>
              <FileText size={16} />
              <span>Status: {record.status}</span>
            </InfoRow>
            {record.createdBy && (
              <InfoRow>
                <User size={16} />
                <span>Created by: {record.createdBy.firstName} {record.createdBy.lastName}</span>
              </InfoRow>
            )}
          </Section>
        </SidePanel>

        <MainContent
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          {record.chiefComplaint && (
            <Section>
              <SectionTitle>
                <AlertCircle size={18} />
                Chief Complaint
              </SectionTitle>
              <ContentText>{record.chiefComplaint}</ContentText>
            </Section>
          )}

          {record.historyOfPresentIllness && (
            <Section>
              <SectionTitle>
                <FileText size={18} />
                History of Present Illness
              </SectionTitle>
              <ContentText>{record.historyOfPresentIllness}</ContentText>
            </Section>
          )}

          {record.diagnosis && record.diagnosis.length > 0 && (
            <Section>
              <SectionTitle>
                <Activity size={18} />
                Diagnosis
              </SectionTitle>
              <DiagnosisList>
                {record.diagnosis.map((diag, index) => (
                  <DiagnosisItem key={index}>
                    {diag.code && <DiagnosisCode>Code: {diag.code}</DiagnosisCode>}
                    <DiagnosisDescription>{diag.description}</DiagnosisDescription>
                    {diag.severity && (
                      <TestStatus status={diag.severity}>{diag.severity}</TestStatus>
                    )}
                  </DiagnosisItem>
                ))}
              </DiagnosisList>
            </Section>
          )}

          {record.treatment?.medications && record.treatment.medications.length > 0 && (
            <Section>
              <SectionTitle>
                <Pill size={18} />
                Medications
              </SectionTitle>
              <MedicationList>
                {record.treatment.medications.map((med, index) => (
                  <MedicationItem key={index}>
                    <MedicationName>{med.name}</MedicationName>
                    <MedicationDetails>
                      Dosage: {med.dosage} | Frequency: {med.frequency}
                      {med.duration && ` | Duration: ${med.duration}`}
                    </MedicationDetails>
                    {med.instructions && (
                      <ContentText style={{ marginTop: '5px', fontSize: '14px' }}>
                        Instructions: {med.instructions}
                      </ContentText>
                    )}
                  </MedicationItem>
                ))}
              </MedicationList>
            </Section>
          )}

          {record.labResults && record.labResults.length > 0 && (
            <Section>
              <SectionTitle>
                <TestTube size={18} />
                Lab Results
              </SectionTitle>
              <LabResultsList>
                {record.labResults.map((test, index) => (
                  <LabResultItem key={index}>
                    <TestName>{test.testName}</TestName>
                    <TestResult>Result: {test.result}</TestResult>
                    {test.normalRange && (
                      <TestResult>Normal Range: {test.normalRange}</TestResult>
                    )}
                    <TestStatus status={test.status}>{test.status}</TestStatus>
                  </LabResultItem>
                ))}
              </LabResultsList>
            </Section>
          )}

          {record.notes && (
            <Section>
              <SectionTitle>
                <FileText size={18} />
                Notes
              </SectionTitle>
              <ContentText>{record.notes}</ContentText>
            </Section>
          )}

          <ActionButtons>
            <ActionButton
              onClick={handleDownload}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Download size={16} />
              Download PDF
            </ActionButton>
            <ActionButton
              onClick={handlePrint}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Printer size={16} />
              Print
            </ActionButton>
            {user?.role !== 'patient' && (
              <ActionButton
                className="primary"
                onClick={() => navigate(`/medical-records/${id}/edit`)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Edit size={16} />
                Edit Record
              </ActionButton>
            )}
          </ActionButtons>
        </MainContent>
      </RecordContainer>
    </PageContainer>
  );
};

export default MedicalRecordDetail;
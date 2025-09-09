import React from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { 
  Heart, 
  Calendar, 
  Users, 
  FileText, 
  Pill, 
  Activity, 
  CreditCard,
  Bot,
  ArrowRight
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

// Styled Components
const HomeContainer = styled.div`
  padding: 0;
  max-width: 100%;
`;

const HeroSection = styled.div`
  background: linear-gradient(135deg, var(--primary-color) 0%, var(--secondary-color) 100%);
  color: white;
  padding: 60px 40px;
  border-radius: 20px;
  margin-bottom: 40px;
  position: relative;
  overflow: hidden;
  box-shadow: var(--shadow-lg);
`;

const HeroPattern = styled.div`
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  background-image: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.05'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
  z-index: 0;
`;

const HeroContent = styled.div`
  position: relative;
  z-index: 1;
  max-width: 800px;
`;

const HeroTitle = styled.h1`
  font-size: 2.5rem;
  font-weight: 700;
  margin-bottom: 20px;
  line-height: 1.2;
`;

const HeroSubtitle = styled.p`
  font-size: 1.2rem;
  margin-bottom: 30px;
  opacity: 0.9;
  max-width: 600px;
  line-height: 1.6;
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 15px;
  flex-wrap: wrap;
`;

const PrimaryButton = styled(motion.button)`
  background: white;
  color: var(--primary-color);
  border: none;
  padding: 12px 24px;
  border-radius: 10px;
  font-weight: 600;
  font-size: 1rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  box-shadow: var(--shadow-md);
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: var(--shadow-lg);
  }
`;

const SecondaryButton = styled(motion.button)`
  background: rgba(255, 255, 255, 0.2);
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.4);
  padding: 12px 24px;
  border-radius: 10px;
  font-weight: 600;
  font-size: 1rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.3s ease;

  &:hover {
    background: rgba(255, 255, 255, 0.3);
  }
`;

const FeaturesSection = styled.div`
  margin-bottom: 40px;
`;

const SectionTitle = styled.h2`
  font-size: 1.8rem;
  font-weight: 700;
  margin-bottom: 30px;
  color: var(--gray-800);
  position: relative;
  display: inline-block;
  
  &:after {
    content: '';
    position: absolute;
    bottom: -10px;
    left: 0;
    width: 60px;
    height: 4px;
    background: linear-gradient(135deg, var(--primary-color) 0%, var(--secondary-color) 100%);
    border-radius: 2px;
  }
`;

const FeatureGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 30px;
`;

const FeatureCard = styled(motion.div)`
  background: white;
  border-radius: 15px;
  padding: 30px;
  box-shadow: var(--shadow-sm);
  transition: all 0.3s ease;

  &:hover {
    box-shadow: var(--shadow-md);
    transform: translateY(-5px);
  }
`;

const FeatureIcon = styled.div`
  width: 60px;
  height: 60px;
  border-radius: 12px;
  background: linear-gradient(135deg, var(--primary-color) 0%, var(--secondary-color) 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 20px;
  color: white;
`;

const FeatureTitle = styled.h3`
  font-size: 1.2rem;
  font-weight: 600;
  margin-bottom: 10px;
  color: var(--gray-800);
`;

const FeatureDescription = styled.p`
  color: var(--gray-600);
  line-height: 1.6;
`;

const StatsSection = styled.div`
  background: white;
  border-radius: 20px;
  padding: 40px;
  margin-bottom: 40px;
  box-shadow: var(--shadow-sm);
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 30px;
  text-align: center;
`;

const StatItem = styled.div`
  padding: 20px;
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-5px);
  }
`;

const StatValue = styled.div`
  font-size: 2.5rem;
  font-weight: 700;
  color: var(--primary-color);
  margin-bottom: 10px;
`;

const StatLabel = styled.div`
  color: var(--gray-600);
  font-weight: 500;
`;

const CTASection = styled.div`
  background: linear-gradient(135deg, var(--primary-color) 0%, var(--secondary-color) 100%);
  border-radius: 20px;
  padding: 50px 40px;
  color: white;
  text-align: center;
  position: relative;
  overflow: hidden;
  box-shadow: var(--shadow-lg);
`;

const CTAPattern = styled.div`
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  background-image: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.05'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
  z-index: 0;
`;

const CTAContent = styled.div`
  position: relative;
  z-index: 1;
  max-width: 700px;
  margin: 0 auto;
`;

const CTATitle = styled.h2`
  font-size: 2rem;
  font-weight: 700;
  margin-bottom: 20px;
`;

const CTADescription = styled.p`
  font-size: 1.1rem;
  margin-bottom: 30px;
  opacity: 0.9;
`;

const Home = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const features = [
    {
      icon: Calendar,
      title: 'Smart Appointment Scheduling',
      description: 'Efficiently manage appointments with intelligent scheduling that optimizes doctor availability and patient preferences.'
    },
    {
      icon: FileText,
      title: 'Comprehensive Medical Records',
      description: 'Securely store and access complete patient medical histories, test results, and treatment plans in one place.'
    },
    {
      icon: Pill,
      title: 'Pharmacy Management',
      description: 'Track medications, manage prescriptions, and monitor inventory with our integrated pharmacy system.'
    },
    {
      icon: CreditCard,
      title: 'Streamlined Billing',
      description: 'Simplify healthcare payments with our integrated billing system that handles insurance claims and patient invoices.'
    },
    {
      icon: Bot,
      title: 'AI-Powered Assistance',
      description: 'Leverage advanced AI technology to assist with diagnostics, treatment recommendations, and patient care.'
    },
    {
      icon: Users,
      title: 'Multi-Role Platform',
      description: 'Tailored interfaces and workflows for administrators, doctors, patients, and lab technicians.'
    }
  ];

  const handleGetStarted = () => {
    if (user) {
      navigate('/dashboard');
    } else {
      navigate('/login');
    }
  };


  const handleLearnMore = () => {
    // Scroll to features section
    document.getElementById('features').scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <HomeContainer>
      <HeroSection>
        <HeroPattern />
        <HeroContent>
          <HeroTitle>Welcome to Hygeia-Nexus Healthcare System</HeroTitle>
          <HeroSubtitle>
            A comprehensive healthcare management platform designed to streamline patient care, 
            optimize hospital operations, and enhance medical service delivery.
          </HeroSubtitle>
          <ButtonGroup>
            <PrimaryButton 
              onClick={handleGetStarted}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Get Started
              <ArrowRight size={18} />
            </PrimaryButton>
            <SecondaryButton 
              onClick={handleLearnMore}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Learn More
            </SecondaryButton>
          </ButtonGroup>
        </HeroContent>
      </HeroSection>

      <FeaturesSection id="features">
        <SectionTitle>Key Features</SectionTitle>
        <FeatureGrid>
          {features.map((feature, index) => (
            <FeatureCard 
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >

              <FeatureIcon>
                <feature.icon size={30} />
              </FeatureIcon>
              <FeatureTitle>{feature.title}</FeatureTitle>
              <FeatureDescription>{feature.description}</FeatureDescription>
            </FeatureCard>
          ))}
        </FeatureGrid>
      </FeaturesSection>

      <StatsSection>
        <SectionTitle>Trusted Healthcare Solution</SectionTitle>
        <StatsGrid>
          <StatItem>
            <StatValue>10,000+</StatValue>
            <StatLabel>Patients Served</StatLabel>
          </StatItem>
          <StatItem>
            <StatValue>500+</StatValue>
            <StatLabel>Healthcare Professionals</StatLabel>
          </StatItem>
          <StatItem>
            <StatValue>98%</StatValue>
            <StatLabel>Satisfaction Rate</StatLabel>
          </StatItem>
          <StatItem>
            <StatValue>24/7</StatValue>
            <StatLabel>Support Available</StatLabel>
          </StatItem>
        </StatsGrid>
      </StatsSection>

      <CTASection>
        <CTAPattern />
        <CTAContent>
          <CTATitle>Ready to transform your healthcare experience?</CTATitle>
          <CTADescription>
            Join thousands of healthcare professionals and patients who are already benefiting from our comprehensive healthcare management system.
          </CTADescription>

          <PrimaryButton 
            onClick={handleGetStarted}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Get Started Now
            <ArrowRight size={18} />
          </PrimaryButton>
        </CTAContent>
      </CTASection>
    </HomeContainer>
  );
};

export default Home;
import { useNavigate } from "react-router-dom";
import styled from "styled-components";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import {
  FaCalendarCheck,
  FaUserMd,
  FaHeartbeat,
  FaShieldAlt,
  FaApple,
  FaGooglePlay,
  FaFacebookF,
  FaTwitter,
  FaLinkedinIn,
  FaInstagram,
  FaArrowRight
} from "react-icons/fa";
import { useAuth } from "../context/AuthContext";
import Navbar from "../components/common/Navbar";

// Main Container
const HomeContainer = styled.div`
  width: 100%;
  min-height: 100vh;
  background: #ffffff;
`;

// Hero Section
const HeroSection = styled.section`
  margin-top: 80px;
  padding: 100px 24px 80px;
  background: linear-gradient(180deg, #f8fafb 0%, #ffffff 100%);
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: -50%;
    right: -10%;
    width: 600px;
    height: 600px;
    background: radial-gradient(circle, rgba(84, 169, 234, 0.1) 0%, transparent 70%);
    border-radius: 50%;
    z-index: 0;
  }

  &::after {
    content: '';
    position: absolute;
    bottom: -30%;
    left: -10%;
    width: 500px;
    height: 500px;
    background: radial-gradient(circle, rgba(132, 88, 253, 0.08) 0%, transparent 70%);
    border-radius: 50%;
    z-index: 0;
  }

  @media (max-width: 768px) {
    padding: 60px 20px 40px;
  }
`;

const HeroContent = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 60px;
  align-items: center;
  position: relative;
  z-index: 1;

  @media (max-width: 968px) {
    grid-template-columns: 1fr;
    gap: 40px;
    text-align: center;
  }
`;

const HeroLeft = styled.div``;

const HeroTitle = styled(motion.h1)`
  font-size: 3.5rem;
  font-weight: 700;
  line-height: 1.2;
  color: #1a1a1a;
  margin-bottom: 24px;
  font-family: 'Poppins', 'Montserrat', sans-serif;

  span {
    background: linear-gradient(135deg, #54a9ea 0%, #8458fd 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  @media (max-width: 968px) {
    font-size: 2.5rem;
  }

  @media (max-width: 480px) {
    font-size: 2rem;
  }
`;

const HeroSubtitle = styled(motion.p)`
  font-size: 1.125rem;
  line-height: 1.7;
  color: #6b7280;
  margin-bottom: 32px;
  max-width: 540px;
  font-family: 'Inter', 'Roboto', sans-serif;

  @media (max-width: 968px) {
    margin: 0 auto 32px;
  }
`;

const HeroButtons = styled(motion.div)`
  display: flex;
  gap: 16px;
  flex-wrap: wrap;

  @media (max-width: 968px) {
    justify-content: center;
  }
`;

const PrimaryButton = styled(motion.button)`
  padding: 16px 40px;
  background: linear-gradient(135deg, #54a9ea 0%, #8458fd 100%);
  border: none;
  color: white;
  border-radius: 50px;
  font-weight: 700;
  font-size: 1rem;
  font-family: 'Poppins', 'Inter', sans-serif;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 12px;
  box-shadow: 0 10px 30px rgba(84, 169, 234, 0.4);
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
    transition: left 0.5s;
  }

  &:hover {
    transform: translateY(-3px);
    box-shadow: 0 15px 40px rgba(84, 169, 234, 0.5);

    &::before {
      left: 100%;
    }
  }
`;

const SecondaryButton = styled(motion.button)`
  padding: 16px 40px;
  background: white;
  border: 2px solid #e5e7eb;
  color: #374151;
  border-radius: 50px;
  font-weight: 700;
  font-size: 1rem;
  font-family: 'Poppins', 'Inter', sans-serif;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    border-color: #54a9ea;
    color: #54a9ea;
    transform: translateY(-2px);
    box-shadow: 0 8px 20px rgba(84, 169, 234, 0.2);
  }
`;

const HeroRight = styled.div`
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;

  @media (max-width: 968px) {
    display: none;
  }
`;

const HeroImageWrapper = styled.div`
  position: relative;
  width: 100%;
  max-width: 550px;
  background: white;
  border-radius: 24px;
  padding: 40px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.08);
  border: 2px solid #f3f4f6;

  &::before {
    content: '';
    position: absolute;
    top: -10px;
    left: -10px;
    right: -10px;
    bottom: -10px;
    background: linear-gradient(135deg, rgba(84, 169, 234, 0.1) 0%, rgba(132, 88, 253, 0.1) 100%);
    border-radius: 28px;
    z-index: -1;
  }

  img {
    width: 100%;
    height: auto;
    display: block;
    border-radius: 16px;
  }
`;

const HeroSVG = styled.div`
  width: 100%;
  height: auto;
  
  svg {
    width: 100%;
    height: auto;
  }
`;

// How It Works Section
const HowItWorksSection = styled.section`
  padding: 80px 24px;
  background: linear-gradient(180deg, #ffffff 0%, #f8fafb 100%);

  @media (max-width: 768px) {
    padding: 60px 20px;
  }
`;

const HowItWorksGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: 40px;
  margin-top: 60px;
`;

const HowItWorksCard = styled(motion.div)`
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: 32px;
  background: white;
  border-radius: 20px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.06);
  transition: all 0.3s ease;
  position: relative;
  border: 2px solid transparent;

  &:hover {
    transform: translateY(-8px);
    box-shadow: 0 20px 60px rgba(84, 169, 234, 0.15);
    border-color: rgba(84, 169, 234, 0.3);
  }
`;

const HowItWorksImage = styled.div`
  width: 200px;
  height: 200px;
  margin-bottom: 24px;
  position: relative;
  
  img {
    width: 100%;
    height: 100%;
    object-fit: contain;
    transition: transform 0.3s ease;
  }

  &::before {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 160px;
    height: 160px;
    background: linear-gradient(135deg, rgba(84, 169, 234, 0.08) 0%, rgba(132, 88, 253, 0.08) 100%);
    border-radius: 50%;
    z-index: -1;
    transition: all 0.3s ease;
  }

  ${HowItWorksCard}:hover & {
    img {
      transform: scale(1.08) rotate(2deg);
    }

    &::before {
      width: 180px;
      height: 180px;
      background: linear-gradient(135deg, rgba(84, 169, 234, 0.12) 0%, rgba(132, 88, 253, 0.12) 100%);
    }
  }
`;

const HowItWorksContent = styled.div`
  h3 {
    font-size: 1.5rem;
    font-weight: 700;
    margin-bottom: 12px;
    color: #1a1a1a;
    font-family: var(--font-family-heading);
  }

  p {
    font-size: 1rem;
    color: #6b7280;
    line-height: 1.6;
  }
`;

const StepNumber = styled.div`
  font-size: 3rem;
  font-weight: 800;
  background: linear-gradient(135deg, #54a9ea 0%, #8458fd 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin-bottom: 16px;
  font-family: var(--font-family-heading);
`;

// Features Section
const FeaturesSection = styled.section`
  padding: 80px 24px;
  background: white;

  @media (max-width: 768px) {
    padding: 60px 20px;
  }
`;

const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
`;

const SectionHeader = styled.div`
  text-align: center;
  margin-bottom: 60px;
`;

const SectionTitle = styled(motion.h2)`
  font-size: 2.5rem;
  font-weight: 700;
  margin-bottom: 16px;
  color: #1a1a1a;
  font-family: 'Poppins', 'Montserrat', sans-serif;

  @media (max-width: 768px) {
    font-size: 2rem;
  }
`;

const SectionSubtitle = styled(motion.p)`
  font-size: 1.125rem;
  color: #6b7280;
  max-width: 600px;
  margin: 0 auto;
`;

const FeatureGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 32px;
`;

const FeatureCard = styled(motion.div)`
  background: white;
  border: 1px solid #f3f4f6;
  border-radius: 16px;
  padding: 32px;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;

  &::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    height: 3px;
    background: linear-gradient(90deg, #54a9ea 0%, #8458fd 100%);
    transform: scaleX(0);
    transition: transform 0.3s ease;
  }

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 12px 40px rgba(84, 169, 234, 0.12);
    border-color: rgba(84, 169, 234, 0.3);

    &::after {
      transform: scaleX(1);
    }
  }
`;

const FeatureIcon = styled.div`
  width: 64px;
  height: 64px;
  border-radius: 16px;
  background: ${(props) => props.bg || "linear-gradient(135deg, #54a9ea 0%, #8458fd 100%)"};
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${(props) => props.color || "#ffffff"};
  margin-bottom: 20px;
  box-shadow: 0 10px 25px rgba(84, 169, 234, 0.3);
  transition: all 0.3s ease;
`;

const FeatureTitle = styled.h3`
  font-size: 1.25rem;
  font-weight: 600;
  margin-bottom: 12px;
  color: #1a1a1a;
  font-family: 'Poppins', 'Montserrat', sans-serif;
`;

const FeatureDescription = styled.p`
  color: #6b7280;
  line-height: 1.6;
  font-size: 0.9375rem;
`;

// Services Section
const ServicesSection = styled.section`
  padding: 80px 24px;
  background: linear-gradient(180deg, #f8fafb 0%, #ffffff 100%);

  @media (max-width: 768px) {
    padding: 60px 20px;
  }
`;

const ServicesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 32px;
  margin-top: 60px;
`;

const ServiceCard = styled(motion.div)`
  background: white;
  border-radius: 20px;
  padding: 32px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.06);
  transition: all 0.3s ease;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 4px;
    background: linear-gradient(90deg, #54a9ea 0%, #8458fd 100%);
    transform: scaleX(0);
    transition: transform 0.3s ease;
  }

  &:hover {
    transform: translateY(-8px);
    box-shadow: 0 20px 60px rgba(84, 169, 234, 0.15);

    &::before {
      transform: scaleX(1);
    }
  }
`;

const ServiceImage = styled.div`
  width: 180px;
  height: 180px;
  margin-bottom: 24px;
  position: relative;
  
  img {
    width: 100%;
    height: 100%;
    object-fit: contain;
    transition: transform 0.3s ease;
  }

  &::before {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 140px;
    height: 140px;
    background: linear-gradient(135deg, rgba(84, 169, 234, 0.1) 0%, rgba(132, 88, 253, 0.1) 100%);
    border-radius: 50%;
    z-index: -1;
    transition: all 0.3s ease;
  }

  ${ServiceCard}:hover & {
    img {
      transform: scale(1.05);
    }

    &::before {
      width: 160px;
      height: 160px;
      background: linear-gradient(135deg, rgba(84, 169, 234, 0.15) 0%, rgba(132, 88, 253, 0.15) 100%);
    }
  }
`;

const ServiceContent = styled.div`
  h3 {
    font-size: 1.375rem;
    font-weight: 700;
    margin-bottom: 12px;
    color: #1a1a1a;
    font-family: var(--font-family-heading);
  }

  p {
    font-size: 1rem;
    color: #6b7280;
    line-height: 1.6;
  }
`;

// Stats Section
const StatsSection = styled.section`
  padding: 80px 24px;
  background: linear-gradient(135deg, #54a9ea 0%, #8458fd 100%);
  color: white;
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.05'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
    opacity: 0.3;
  }

  @media (max-width: 768px) {
    padding: 60px 20px;
  }
`;

const StatsGrid = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 48px;
  text-align: center;
`;

const StatCard = styled(motion.div)``;

const StatValue = styled.div`
  font-size: 3rem;
  font-weight: 700;
  margin-bottom: 8px;

  @media (max-width: 768px) {
    font-size: 2.5rem;
  }
`;

const StatLabel = styled.div`
  font-size: 1rem;
  opacity: 0.9;
`;

// CTA Section
const CTASection = styled.section`
  padding: 80px 24px;
  background: linear-gradient(180deg, #ffffff 0%, #f8fafb 100%);

  @media (max-width: 768px) {
    padding: 60px 20px;
  }
`;

const CTAGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 60px;
  align-items: center;
  background: linear-gradient(135deg, #54a9ea 0%, #8458fd 100%);
  padding: 60px;
  border-radius: 24px;
  box-shadow: 0 20px 60px rgba(84, 169, 234, 0.3);

  @media (max-width: 968px) {
    grid-template-columns: 1fr;
    padding: 40px 24px;
    gap: 40px;
  }
`;

const CTALeft = styled(motion.div)`
  img {
    width: 100%;
    height: auto;
    filter: brightness(1.1) drop-shadow(0 10px 30px rgba(0, 0, 0, 0.2));
  }

  @media (max-width: 968px) {
    display: none;
  }
`;

const CTARight = styled.div`
  color: white;

  @media (max-width: 968px) {
    text-align: center;
  }
`;

const CTATitle = styled(motion.h2)`
  font-size: 2.5rem;
  font-weight: 700;
  margin-bottom: 20px;
  font-family: var(--font-family-heading);
  color: white;

  @media (max-width: 768px) {
    font-size: 2rem;
  }
`;

const CTADescription = styled(motion.p)`
  font-size: 1.125rem;
  margin-bottom: 32px;
  opacity: 0.95;
  line-height: 1.7;
  color: white;
`;

const CTAButton = styled(motion.button)`
  padding: 18px 48px;
  background: white;
  border: none;
  color: #54a9ea;
  border-radius: 50px;
  font-weight: 700;
  font-size: 1.05rem;
  font-family: 'Poppins', 'Inter', sans-serif;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 12px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(84, 169, 234, 0.1), transparent);
    transition: left 0.5s;
  }

  &:hover {
    transform: translateY(-3px);
    box-shadow: 0 15px 40px rgba(0, 0, 0, 0.25);

    &::before {
      left: 100%;
    }
  }
`;

// Footer
const Footer = styled.footer`
  background: #1a1d29;
  color: white;
  padding: 60px 24px 30px;

  @media (max-width: 768px) {
    padding: 40px 20px 20px;
  }
`;

const FooterTop = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 48px;
  padding-bottom: 32px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);

  @media (max-width: 768px) {
    flex-direction: column;
    gap: 24px;
    text-align: center;
  }
`;

const FooterTopLeft = styled.div`
  h2 {
    font-size: 2rem;
    font-weight: 700;
    margin-bottom: 0;
    font-family: var(--font-family-heading);
  }
`;

const FooterTopRight = styled.div`
  display: flex;
  gap: 16px;

  @media (max-width: 768px) {
    flex-direction: column;
    width: 100%;
    max-width: 300px;
  }
`;

const FooterButton = styled(motion.button)`
  padding: 12px 32px;
  border-radius: 50px;
  font-weight: 600;
  font-size: 0.9rem;
  font-family: var(--font-family-button);
  cursor: pointer;
  transition: all 0.3s ease;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  text-transform: uppercase;
  letter-spacing: 0.5px;

  ${props => props.primary ? `
    background: linear-gradient(135deg, #54a9ea 0%, #8458fd 100%);
    border: none;
    color: white;
    box-shadow: 0 4px 15px rgba(84, 169, 234, 0.4);

    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 20px rgba(84, 169, 234, 0.5);
    }
  ` : `
    background: transparent;
    border: 2px solid rgba(255, 255, 255, 0.2);
    color: white;

    &:hover {
      border-color: #54a9ea;
      background: rgba(84, 169, 234, 0.1);
    }
  `}
`;

const FooterContent = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: 2fr 1fr 1fr 1fr 1fr;
  gap: 48px;
  margin-bottom: 48px;

  @media (max-width: 968px) {
    grid-template-columns: 1fr 1fr;
    gap: 32px;
  }

  @media (max-width: 480px) {
    grid-template-columns: 1fr;
  }
`;

const FooterColumn = styled.div`
  h4 {
    font-size: 0.875rem;
    font-weight: 600;
    margin-bottom: 20px;
    color: rgba(255, 255, 255, 0.6);
    text-transform: uppercase;
    letter-spacing: 1px;
  }

  p {
    color: rgba(255, 255, 255, 0.7);
    line-height: 1.6;
    margin-bottom: 20px;
    font-size: 0.9375rem;
  }
`;

const FooterBrand = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;

  svg {
    font-size: 2rem;
    color: #54a9ea;
  }

  h3 {
    font-size: 1.5rem;
    font-weight: 700;
    background: linear-gradient(135deg, #54a9ea 0%, #8458fd 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    font-family: var(--font-family-heading);
  }
`;

const NewsletterForm = styled.div`
  margin-top: 20px;
`;

const NewsletterInput = styled.div`
  display: flex;
  gap: 8px;
  margin-bottom: 16px;

  input {
    flex: 1;
    padding: 12px 16px;
    border-radius: 50px;
    border: 1px solid rgba(255, 255, 255, 0.2);
    background: rgba(255, 255, 255, 0.05);
    color: white;
    font-size: 0.9rem;
    transition: all 0.3s ease;

    &::placeholder {
      color: rgba(255, 255, 255, 0.5);
    }

    &:focus {
      outline: none;
      border-color: #54a9ea;
      background: rgba(255, 255, 255, 0.08);
    }
  }

  button {
    padding: 12px 24px;
    border-radius: 50px;
    background: linear-gradient(135deg, #54a9ea 0%, #8458fd 100%);
    border: none;
    color: white;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
    display: flex;
    align-items: center;
    gap: 8px;

    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(84, 169, 234, 0.4);
    }
  }

  @media (max-width: 480px) {
    flex-direction: column;

    button {
      width: 100%;
      justify-content: center;
    }
  }
`;

const AppButtons = styled.div`
  display: flex;
  gap: 12px;
  margin-top: 20px;

  @media (max-width: 480px) {
    flex-direction: column;
  }
`;

const AppButton = styled.a`
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 20px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 12px;
  color: white;
  cursor: pointer;
  transition: all 0.3s ease;
  text-decoration: none;

  svg {
    font-size: 1.5rem;
  }

  div {
    display: flex;
    flex-direction: column;
    align-items: flex-start;

    span:first-child {
      font-size: 0.7rem;
      color: rgba(255, 255, 255, 0.6);
    }

    span:last-child {
      font-size: 0.95rem;
      font-weight: 600;
    }
  }

  &:hover {
    background: rgba(255, 255, 255, 0.1);
    border-color: #54a9ea;
    transform: translateY(-2px);
  }
`;

const FooterLink = styled.a`
  display: block;
  color: rgba(255, 255, 255, 0.7);
  margin-bottom: 12px;
  font-size: 0.9375rem;
  cursor: pointer;
  transition: color 0.3s ease;

  &:hover {
    color: #54a9ea;
  }
`;

const FooterBottom = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding-top: 32px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  display: flex;
  justify-content: space-between;
  align-items: center;

  @media (max-width: 768px) {
    flex-direction: column;
    gap: 20px;
    text-align: center;
  }
`;

const FooterBottomLeft = styled.div`
  display: flex;
  gap: 24px;
  align-items: center;
  color: rgba(255, 255, 255, 0.6);
  font-size: 0.875rem;

  @media (max-width: 768px) {
    flex-direction: column;
    gap: 12px;
  }
`;

const FooterBottomLink = styled.a`
  color: rgba(255, 255, 255, 0.6);
  cursor: pointer;
  transition: color 0.3s ease;

  &:hover {
    color: #54a9ea;
  }
`;

const SocialLinks = styled.div`
  display: flex;
  gap: 12px;
`;

const SocialLink = styled.a`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    background: linear-gradient(135deg, #54a9ea 0%, #8458fd 100%);
    border-color: transparent;
    transform: translateY(-2px);
  }
`;

// Component
const Home = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const features = [
    {
      icon: FaCalendarCheck,
      title: "Easy Scheduling",
      description: "Book appointments with your preferred doctors in just a few clicks.",
      bg: "linear-gradient(135deg, #54a9ea 0%, #8458fd 100%)",
      color: "#ffffff",
    },
    {
      icon: FaUserMd,
      title: "Expert Doctors",
      description: "Access to a network of qualified and experienced healthcare professionals.",
      bg: "linear-gradient(135deg, #fa7e7e 0%, #fcb87e 100%)",
      color: "#ffffff",
    },
    {
      icon: FaHeartbeat,
      title: "Health Records",
      description: "Securely store and access your medical history anytime, anywhere.",
      bg: "linear-gradient(135deg, #38d1cf 0%, #2776ea 100%)",
      color: "#ffffff",
    },
    {
      icon: FaShieldAlt,
      title: "Secure & Private",
      description: "Your health data is protected with enterprise-grade security.",
      bg: "linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)",
      color: "#ffffff",
    },
  ];

  const handleGetStarted = () => {
    if (user) {
      navigate("/dashboard");
    } else {
      navigate("/register");
    }
  };

  return (
    <HomeContainer>
      <Navbar />

      {/* Hero Section */}
      <HeroSection>
        <HeroContent>
          <HeroLeft>
            <HeroTitle
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              Your Health, <span>Our Priority</span>
            </HeroTitle>
            <HeroSubtitle
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              Experience seamless healthcare management with Hygeia-Nexus. Book appointments, access medical records, and connect with healthcare professionals all in one place.
            </HeroSubtitle>
            <HeroButtons
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <PrimaryButton
                onClick={handleGetStarted}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Get Started
                <ArrowRight size={20} />
              </PrimaryButton>
              <SecondaryButton
                onClick={() => document.getElementById("features")?.scrollIntoView({ behavior: "smooth" })}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Learn More
              </SecondaryButton>
            </HeroButtons>
          </HeroLeft>

          <HeroRight>
            <HeroImageWrapper>
              <HeroSVG>
                <img
                  src="/home.jpg"
                  alt="Healthcare Professional"
                />
              </HeroSVG>
            </HeroImageWrapper>
          </HeroRight>
        </HeroContent>
      </HeroSection>

      {/* How It Works Section */}
      <HowItWorksSection>
        <Container>
          <SectionHeader>
            <SectionTitle
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              How It Works
            </SectionTitle>
            <SectionSubtitle
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
            >
              Get started with Hygeia-Nexus in three simple steps
            </SectionSubtitle>
          </SectionHeader>

          <HowItWorksGrid>
            <HowItWorksCard
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <HowItWorksImage>
                <img
                  src="https://cdni.iconscout.com/illustration/premium/thumb/user-account-sign-up-4489360-3723267.png"
                  onError={(e) => {
                    e.target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 200 200'%3E%3Crect x='50' y='50' width='100' height='100' rx='10' fill='%2354a9ea'/%3E%3Ccircle cx='100' cy='80' r='15' fill='white'/%3E%3Cpath d='M 70 120 Q 100 140 130 120' stroke='white' stroke-width='3' fill='none'/%3E%3C/svg%3E";
                  }}
                  alt="Sign Up"
                />
              </HowItWorksImage>
              <HowItWorksContent>
                <StepNumber>01</StepNumber>
                <h3>Create Your Account</h3>
                <p>Sign up in minutes with your basic information. It's quick, easy, and secure.</p>
              </HowItWorksContent>
            </HowItWorksCard>

            <HowItWorksCard
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
            >
              <HowItWorksImage>
                <img
                  src="https://cdni.iconscout.com/illustration/premium/thumb/doctor-search-5815270-4863042.png"
                  onError={(e) => {
                    e.target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 200 200'%3E%3Ccircle cx='80' cy='80' r='40' fill='none' stroke='%2354a9ea' stroke-width='6'/%3E%3Cline x1='110' y1='110' x2='140' y2='140' stroke='%2354a9ea' stroke-width='6'/%3E%3Ccircle cx='80' cy='80' r='20' fill='%238458fd'/%3E%3C/svg%3E";
                  }}
                  alt="Find Doctor"
                />
              </HowItWorksImage>
              <HowItWorksContent>
                <StepNumber>02</StepNumber>
                <h3>Find Your Doctor</h3>
                <p>Browse through our network of qualified healthcare professionals and choose the right one for you.</p>
              </HowItWorksContent>
            </HowItWorksCard>

            <HowItWorksCard
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4 }}
            >
              <HowItWorksImage>
                <img
                  src="https://cdni.iconscout.com/illustration/premium/thumb/calendar-appointment-5594454-4659651.png"
                  onError={(e) => {
                    e.target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 200 200'%3E%3Crect x='40' y='50' width='120' height='100' rx='10' fill='%2354a9ea'/%3E%3Crect x='40' y='50' width='120' height='30' rx='10' fill='%238458fd'/%3E%3Ctext x='100' y='110' text-anchor='middle' fill='white' font-size='40' font-weight='bold'%3E15%3C/text%3E%3C/svg%3E";
                  }}
                  alt="Book Appointment"
                />
              </HowItWorksImage>
              <HowItWorksContent>
                <StepNumber>03</StepNumber>
                <h3>Book Appointment</h3>
                <p>Schedule your appointment at your convenience and get instant confirmation.</p>
              </HowItWorksContent>
            </HowItWorksCard>
          </HowItWorksGrid>
        </Container>
      </HowItWorksSection>

      {/* Features Section */}
      <FeaturesSection id="features">
        <Container>
          <SectionHeader>
            <SectionTitle
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              Why Choose Hygeia-Nexus?
            </SectionTitle>
            <SectionSubtitle
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
            >
              Everything you need for modern healthcare management in one platform
            </SectionSubtitle>
          </SectionHeader>

          <FeatureGrid>
            {features.map((feature, index) => {
              const IconComponent = feature.icon;
              return (
                <FeatureCard
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                >
                  <FeatureIcon bg={feature.bg} color={feature.color}>
                    <IconComponent size={32} />
                  </FeatureIcon>
                  <FeatureTitle>{feature.title}</FeatureTitle>
                  <FeatureDescription>{feature.description}</FeatureDescription>
                </FeatureCard>
              );
            })}
          </FeatureGrid>
        </Container>
      </FeaturesSection>

      {/* Services Section */}
      <ServicesSection>
        <Container>
          <SectionHeader>
            <SectionTitle
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              Our Healthcare Services
            </SectionTitle>
            <SectionSubtitle
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
            >
              Comprehensive healthcare solutions tailored to your needs
            </SectionSubtitle>
          </SectionHeader>

          <ServicesGrid>
            <ServiceCard
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <ServiceImage>
                <img
                  src="https://cdni.iconscout.com/illustration/premium/thumb/video-call-consultation-5594449-4659646.png"
                  onError={(e) => {
                    e.target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 200 200'%3E%3Crect x='30' y='60' width='100' height='80' rx='10' fill='%2354a9ea'/%3E%3Cpolygon points='140,80 140,120 170,100' fill='%238458fd'/%3E%3Ccircle cx='80' cy='90' r='15' fill='white'/%3E%3C/svg%3E";
                  }}
                  alt="Telemedicine"
                />
              </ServiceImage>
              <ServiceContent>
                <h3>Telemedicine</h3>
                <p>Connect with doctors remotely through secure video consultations from the comfort of your home.</p>
              </ServiceContent>
            </ServiceCard>

            <ServiceCard
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
            >
              <ServiceImage>
                <img
                  src="https://cdni.iconscout.com/illustration/premium/thumb/medical-records-5594456-4659653.png"
                  onError={(e) => {
                    e.target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 200 200'%3E%3Crect x='50' y='30' width='100' height='140' rx='10' fill='%2354a9ea'/%3E%3Crect x='70' y='50' width='60' height='8' rx='4' fill='white'/%3E%3Crect x='70' y='70' width='60' height='8' rx='4' fill='white'/%3E%3Crect x='70' y='90' width='40' height='8' rx='4' fill='white'/%3E%3Cpath d='M 100 120 L 90 130 L 85 125' stroke='white' stroke-width='4' fill='none'/%3E%3C/svg%3E";
                  }}
                  alt="Health Records"
                />
              </ServiceImage>
              <ServiceContent>
                <h3>Digital Health Records</h3>
                <p>Access your complete medical history, prescriptions, and test results anytime, anywhere.</p>
              </ServiceContent>
            </ServiceCard>

            <ServiceCard
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
            >
              <ServiceImage>
                <img
                  src="https://cdni.iconscout.com/illustration/premium/thumb/appointment-booking-5594453-4659650.png"
                  onError={(e) => {
                    e.target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 200 200'%3E%3Ccircle cx='100' cy='100' r='70' fill='none' stroke='%2354a9ea' stroke-width='8'/%3E%3Cline x1='100' y1='100' x2='100' y2='60' stroke='%238458fd' stroke-width='6'/%3E%3Cline x1='100' y1='100' x2='130' y2='100' stroke='%238458fd' stroke-width='6'/%3E%3Ccircle cx='100' cy='100' r='8' fill='%238458fd'/%3E%3C/svg%3E";
                  }}
                  alt="Appointment Scheduling"
                />
              </ServiceImage>
              <ServiceContent>
                <h3>Smart Scheduling</h3>
                <p>Book, reschedule, or cancel appointments with ease. Get automated reminders for upcoming visits.</p>
              </ServiceContent>
            </ServiceCard>

            <ServiceCard
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
            >
              <ServiceImage>
                <img
                  src="https://cdni.iconscout.com/illustration/premium/thumb/medicine-prescription-5594455-4659652.png"
                  onError={(e) => {
                    e.target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 200 200'%3E%3Crect x='60' y='60' width='80' height='40' rx='20' fill='%2354a9ea'/%3E%3Crect x='60' y='100' width='80' height='40' rx='20' fill='%238458fd'/%3E%3Cline x1='100' y1='60' x2='100' y2='140' stroke='white' stroke-width='3'/%3E%3C/svg%3E";
                  }}
                  alt="Prescription Management"
                />
              </ServiceImage>
              <ServiceContent>
                <h3>Prescription Management</h3>
                <p>Manage your medications, set reminders, and get refills delivered to your doorstep.</p>
              </ServiceContent>
            </ServiceCard>
          </ServicesGrid>
        </Container>
      </ServicesSection>

      {/* Stats Section */}
      <StatsSection>
        <StatsGrid>
          <StatCard
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <StatValue>10K+</StatValue>
            <StatLabel>Patients Served</StatLabel>
          </StatCard>
          <StatCard
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
          >
            <StatValue>500+</StatValue>
            <StatLabel>Healthcare Professionals</StatLabel>
          </StatCard>
          <StatCard
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
          >
            <StatValue>98%</StatValue>
            <StatLabel>Satisfaction Rate</StatLabel>
          </StatCard>
          <StatCard
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
          >
            <StatValue>24/7</StatValue>
            <StatLabel>Support Available</StatLabel>
          </StatCard>
        </StatsGrid>
      </StatsSection>

      {/* CTA Section */}
      <CTASection>
        <Container>
          <CTAGrid>
            <CTALeft
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <img
                src="https://cdni.iconscout.com/illustration/premium/thumb/doctor-consultation-5594448-4659645.png"
                onError={(e) => {
                  e.target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 200 200'%3E%3Cpath d='M 80 60 Q 80 40 100 40 Q 120 40 120 60' stroke='%2354a9ea' stroke-width='8' fill='none'/%3E%3Ccircle cx='80' cy='60' r='15' fill='%2354a9ea'/%3E%3Ccircle cx='120' cy='60' r='15' fill='%2354a9ea'/%3E%3Cpath d='M 100 40 L 100 100 Q 100 120 85 130' stroke='%2354a9ea' stroke-width='6' fill='none'/%3E%3Ccircle cx='85' cy='130' r='20' fill='%238458fd'/%3E%3C/svg%3E";
                }}
                alt="Get Started"
              />
            </CTALeft>
            <CTARight>
              <CTATitle
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
              >
                Ready to Get Started?
              </CTATitle>
              <CTADescription
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 }}
              >
                Join thousands of users who trust Hygeia-Nexus for their healthcare needs. Experience modern healthcare management today.
              </CTADescription>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 }}
              >
                <CTAButton
                  onClick={handleGetStarted}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Create Free Account
                  <ArrowRight size={20} />
                </CTAButton>
              </motion.div>
            </CTARight>
          </CTAGrid>
        </Container>
      </CTASection>

      {/* Footer */}
      <Footer>
        <FooterTop>
          <FooterTopLeft>
            <h2 style={{ color: "white" }}>Let's Connect with us</h2>
          </FooterTopLeft>
          <FooterTopRight>
            <FooterButton
              primary
              onClick={handleGetStarted}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              Get Started <FaArrowRight />
            </FooterButton>
            <FooterButton
              onClick={() => navigate("/contact")}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              Contact Us
            </FooterButton>
          </FooterTopRight>
        </FooterTop>

        <FooterContent>
          <FooterColumn>
            <FooterBrand>
              <FaHeartbeat />
              <h3>Hygeia-Nexus</h3>
            </FooterBrand>
            <p>
              Modern healthcare management platform designed to make healthcare accessible and efficient for everyone.
            </p>
            <NewsletterForm>
              <p style={{ marginBottom: '12px', fontSize: '0.875rem' }}>Subscribe our newsletter for updates</p>
              <NewsletterInput>
                <input type="email" placeholder="Enter your email address..." />
                <button>
                  Subscribe <FaArrowRight />
                </button>
              </NewsletterInput>
            </NewsletterForm>
            <AppButtons>
              <AppButton href="#" target="_blank">
                <FaApple />
                <div>
                  <span>Download on the</span>
                  <span>App Store</span>
                </div>
              </AppButton>
              <AppButton href="#" target="_blank">
                <FaGooglePlay />
                <div>
                  <span>Get it on</span>
                  <span>Google Play</span>
                </div>
              </AppButton>
            </AppButtons>
          </FooterColumn>

          <FooterColumn>
            <h4>Company</h4>
            <FooterLink onClick={() => navigate("/about")}>About Us</FooterLink>
            <FooterLink onClick={() => navigate("/careers")}>Careers</FooterLink>
            <FooterLink onClick={() => navigate("/blog")}>Blog</FooterLink>
            <FooterLink onClick={() => navigate("/press")}>Press</FooterLink>
          </FooterColumn>

          <FooterColumn>
            <h4>Features</h4>
            <FooterLink onClick={() => document.getElementById("features")?.scrollIntoView({ behavior: "smooth" })}>
              Primary Care
            </FooterLink>
            <FooterLink>Telehealth</FooterLink>
            <FooterLink>Mental Health</FooterLink>
            <FooterLink>Cardiology</FooterLink>
            <FooterLink>Integrations</FooterLink>
          </FooterColumn>

          <FooterColumn>
            <h4>Solutions</h4>
            <FooterLink>For Patients</FooterLink>
            <FooterLink>For Doctors</FooterLink>
            <FooterLink>For Hospitals</FooterLink>
            <FooterLink>Health Records</FooterLink>
          </FooterColumn>

          <FooterColumn>
            <h4>Support</h4>
            <FooterLink>Help Center</FooterLink>
            <FooterLink>Documentation</FooterLink>
            <FooterLink>Contact Support</FooterLink>
            <FooterLink>FAQs</FooterLink>
          </FooterColumn>
        </FooterContent>

        <FooterBottom>
          <FooterBottomLeft>
            <span>© 2024 Hygeia-Nexus. All rights reserved.</span>
            <FooterBottomLink>Privacy Policy</FooterBottomLink>
            <FooterBottomLink>Terms of Service</FooterBottomLink>
            <FooterBottomLink>Accessibility</FooterBottomLink>
          </FooterBottomLeft>
          <SocialLinks>
            <SocialLink href="#" target="_blank" aria-label="Facebook">
              <FaFacebookF />
            </SocialLink>
            <SocialLink href="#" target="_blank" aria-label="Twitter">
              <FaTwitter />
            </SocialLink>
            <SocialLink href="#" target="_blank" aria-label="LinkedIn">
              <FaLinkedinIn />
            </SocialLink>
            <SocialLink href="#" target="_blank" aria-label="Instagram">
              <FaInstagram />
            </SocialLink>
          </SocialLinks>
        </FooterBottom>
      </Footer>
    </HomeContainer>
  );
};

export default Home;

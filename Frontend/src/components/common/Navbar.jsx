import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, Menu, X } from "lucide-react";

// Styled Components
const NavbarContainer = styled(motion.nav)`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1000;
  background: ${(props) =>
    props.scrolled
      ? "rgba(255, 255, 255, 0.98)"
      : "rgba(255, 255, 255, 0.95)"};
  backdrop-filter: blur(10px);
  box-shadow: ${(props) =>
    props.scrolled ? "0 4px 30px rgba(0, 0, 0, 0.1)" : "0 2px 10px rgba(0, 0, 0, 0.05)"};
  transition: all 0.3s ease;
  border-bottom: 1px solid
    ${(props) => (props.scrolled ? "#e0e7ff" : "rgba(224, 231, 255, 0.5)")};
`;

const NavbarContent = styled.div`
  max-width: 1400px;
  margin: 0 auto;
  padding: 20px 40px;
  display: flex;
  justify-content: space-between;
  align-items: center;

  @media (max-width: 768px) {
    padding: 15px 20px;
  }
`;

const Logo = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;
  transition: transform 0.3s ease;

  &:hover {
    transform: scale(1.02);
  }
`;

const LogoIcon = styled.div`
  width: 45px;
  height: 45px;
  background: linear-gradient(135deg, #54a9ea 0%, #8458fd 100%);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 15px rgba(84, 169, 234, 0.3);
  position: relative;

  &::after {
    content: "";
    position: absolute;
    inset: 2px;
    background: linear-gradient(
      135deg,
      rgba(255, 255, 255, 0.2),
      transparent
    );
    border-radius: 10px;
  }
`;

const LogoText = styled.div`
  font-size: 1.5rem;
  font-weight: 800;
  background: linear-gradient(135deg, #54a9ea 0%, #8458fd 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  letter-spacing: -0.5px;
  font-family: 'Poppins', 'Montserrat', sans-serif;

  @media (max-width: 480px) {
    font-size: 1.3rem;
  }
`;

const NavLinks = styled.div`
  display: flex;
  align-items: center;
  gap: 40px;

  @media (max-width: 968px) {
    display: none;
  }
`;

const NavLink = styled.a`
  color: #334155;
  font-weight: 500;
  font-size: 0.95rem;
  cursor: pointer;
  position: relative;
  transition: color 0.3s ease;

  &::after {
    content: "";
    position: absolute;
    bottom: -5px;
    left: 0;
    width: 0;
    height: 2px;
    background: linear-gradient(90deg, #667eea, #764ba2);
    transition: width 0.3s ease;
  }

  &:hover {
    color: #667eea;

    &::after {
      width: 100%;
    }
  }
`;

const NavButtons = styled.div`
  display: flex;
  align-items: center;
  gap: 15px;

  @media (max-width: 968px) {
    display: none;
  }
`;

const LoginButton = styled(motion.button)`
  padding: 10px 24px;
  background: transparent;
  border: 2px solid #54a9ea;
  color: #54a9ea;
  border-radius: 50px;
  font-weight: 700;
  font-size: 0.9rem;
  font-family: 'Poppins', 'Inter', sans-serif;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    background: linear-gradient(135deg, #54a9ea 0%, #8458fd 100%);
    border-color: transparent;
    color: white;
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(84, 169, 234, 0.3);
  }
`;

const SignupButton = styled(motion.button)`
  padding: 10px 24px;
  background: linear-gradient(135deg, #54a9ea 0%, #8458fd 100%);
  border: none;
  color: white;
  border-radius: 50px;
  font-weight: 700;
  font-size: 0.9rem;
  font-family: 'Poppins', 'Inter', sans-serif;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  cursor: pointer;
  box-shadow: 0 4px 15px rgba(84, 169, 234, 0.3);
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
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(84, 169, 234, 0.4);

    &::before {
      left: 100%;
    }
  }
`;

const MobileMenuButton = styled.button`
  display: none;
  background: none;
  border: none;
  color: #334155;
  cursor: pointer;
  padding: 5px;
  z-index: 1001;

  @media (max-width: 968px) {
    display: block;
  }
`;

const MobileMenuOverlay = styled(motion.div)`
  display: none;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 998;

  @media (max-width: 968px) {
    display: block;
  }
`;

const MobileMenu = styled(motion.div)`
  display: none;
  position: fixed;
  top: 0;
  right: 0;
  bottom: 0;
  width: 80%;
  max-width: 350px;
  background: white;
  box-shadow: -10px 0 40px rgba(0, 0, 0, 0.1);
  padding: 80px 30px 30px;
  z-index: 999;
  overflow-y: auto;

  @media (max-width: 968px) {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }
`;

const MobileNavLink = styled.a`
  color: #334155;
  font-weight: 500;
  font-size: 1rem;
  padding: 15px 0;
  border-bottom: 1px solid #e2e8f0;
  cursor: pointer;
  transition: color 0.3s ease;
  display: block;

  &:hover {
    color: #0066cc;
  }
`;

const MobileNavButtons = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-top: 20px;
`;

const Navbar = () => {
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
      setMobileMenuOpen(false);
    }
  };

  const handleLogin = () => {
    navigate("/login");
    setMobileMenuOpen(false);
  };

  const handleSignup = () => {
    navigate("/register");
    setMobileMenuOpen(false);
  };

  return (
    <>
      <NavbarContainer scrolled={scrolled}>
        <NavbarContent>
          <Logo onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>
            <LogoIcon>
              <Heart size={24} color="white" fill="white" />
            </LogoIcon>
            <LogoText>Hygeia-Nexus</LogoText>
          </Logo>

          <NavLinks>
            <NavLink onClick={() => scrollToSection("features")}>
              Features
            </NavLink>
            <NavLink onClick={() => scrollToSection("benefits")}>
              Benefits
            </NavLink>
            <NavLink onClick={() => scrollToSection("stats")}>About</NavLink>
            <NavLink onClick={() => scrollToSection("contact")}>
              Contact
            </NavLink>
          </NavLinks>

          <NavButtons>
            <LoginButton
              onClick={handleLogin}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Login
            </LoginButton>
            <SignupButton
              onClick={handleSignup}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Get Started
            </SignupButton>
          </NavButtons>

          <MobileMenuButton onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </MobileMenuButton>
        </NavbarContent>
      </NavbarContainer>

      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            <MobileMenuOverlay
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileMenuOpen(false)}
            />
            <MobileMenu
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            >
              <MobileNavLink onClick={() => scrollToSection("features")}>
                Features
              </MobileNavLink>
              <MobileNavLink onClick={() => scrollToSection("benefits")}>
                Benefits
              </MobileNavLink>
              <MobileNavLink onClick={() => scrollToSection("stats")}>
                About
              </MobileNavLink>
              <MobileNavLink onClick={() => scrollToSection("contact")}>
                Contact
              </MobileNavLink>
              <MobileNavButtons>
                <LoginButton
                  onClick={handleLogin}
                  whileTap={{ scale: 0.95 }}
                  style={{ width: "100%" }}
                >
                  Login
                </LoginButton>
                <SignupButton
                  onClick={handleSignup}
                  whileTap={{ scale: 0.95 }}
                  style={{ width: "100%" }}
                >
                  Get Started
                </SignupButton>
              </MobileNavButtons>
            </MobileMenu>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default Navbar;

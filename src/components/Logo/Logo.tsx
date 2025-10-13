import React, { FC, useEffect, useState } from 'react';
import './Logo.scss';
import logo from '../../../public/images/logo_black.svg';
import { useScrollProgress } from '../../contexts/ScrollProgressContext';
import { useLenis } from 'lenis/react';

interface LogoProps {
  className?: string;
}

const Logo:FC<LogoProps> = ({className}) => {
  const lenis = useLenis();
  const scrollProgress = useScrollProgress();
  const [rotation, setRotation] = useState(0);
  const [velocity, setVelocity] = useState(0);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const targetRotation = scrollProgress * 360;
    const newVelocity = (targetRotation - rotation) * 0.1; // Calculate velocity based on target
    setVelocity(newVelocity);
  }, [scrollProgress, rotation]);

  useEffect(() => {
    const updateRotation = () => {
      setRotation((prevRotation) => prevRotation + velocity);
      setVelocity((prevVelocity) => prevVelocity * 0.95); // Apply damping to reduce velocity over time
    };

    const animationFrame = requestAnimationFrame(updateRotation);
    return () => cancelAnimationFrame(animationFrame);
  }, [velocity]);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 0);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogoClick = () => {
      window.scrollTo({ top: 0, behavior: "instant" });
      /*
    if (lenis) {
      lenis.scrollTo(0, { duration: 5, easing: (t: number) => 0.5 - 0.5 * Math.cos(Math.PI * t) }); // easeInOutSine
    } else {
      window.scrollTo({ top: 0, behavior: "instant" });
    }
      */
  };

  return (
    <div 
      className={`logo ${isScrolled ? 'scrolled' : ''} ${className ?? ''}`}
      >
      <img
        src={logo}
        alt="Logo"
        className='logo-image'
        onClick={handleLogoClick}
        style={{
          transform: `rotate(${rotation}deg)`,
        }}
      />
    </div>
  );
};

export default Logo;
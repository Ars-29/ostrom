import React, { useEffect, useRef } from 'react';
import './MouseFollower.scss';

const MouseFollower: React.FC = () => {
  const followerRef = useRef<HTMLDivElement>(null);
  const followerRefSmall = useRef<HTMLDivElement>(null);
  const targetPosition = useRef({ x: 0, y: 0 });
  const currentPosition = useRef({ x: 0, y: 0 });
  const smallCurrentPosition = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      targetPosition.current.x = e.clientX;
      targetPosition.current.y = e.clientY;
    };

    const animate = () => {
      const follower = followerRef.current;
      const followerSmall = followerRefSmall.current;
      const circleSize = 40; // Match the CSS width/height of the larger circle
      const smallCircleSize = 6; // Match the CSS width/height of the smaller circle

      if (follower && followerSmall) {
        // Update larger circle position
        currentPosition.current.x += (targetPosition.current.x - currentPosition.current.x) * 0.12;
        currentPosition.current.y += (targetPosition.current.y - currentPosition.current.y) * 0.12;

        // Update smaller circle position with less inertia
        smallCurrentPosition.current.x += (targetPosition.current.x - smallCurrentPosition.current.x) * 0.18;
        smallCurrentPosition.current.y += (targetPosition.current.y - smallCurrentPosition.current.y) * 0.18;

        // Apply transformations
        follower.style.transform = `translate3d(${currentPosition.current.x}px, ${currentPosition.current.y}px, 0)`;
        followerSmall.style.transform = `translate3d(${smallCurrentPosition.current.x}px, ${smallCurrentPosition.current.y}px, 0)`;
      }

      // Throttle animation updates to improve performance
      // setTimeout(() => requestAnimationFrame(animate), 16); // ~60 FPS
      requestAnimationFrame(animate);
    };

    window.addEventListener('mousemove', handleMouseMove);
    animate();

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  useEffect(() => {
    const handleMouseEnter = (e: Event) => {
      const mouseEvent = e as MouseEvent;
      if ((mouseEvent.target as HTMLElement).classList.contains('active-follower')) {
        followerRef.current?.classList.add('active');
        followerRefSmall.current?.classList.add('active');
      }
    };

    const handleMouseLeave = (e: Event) => {
      const mouseEvent = e as MouseEvent;
      if ((mouseEvent.target as HTMLElement).classList.contains('active-follower')) {
        followerRef.current?.classList.remove('active');
        followerRefSmall.current?.classList.remove('active');
      }
    };

    setTimeout(() => {
      const activeFollowers = document.querySelectorAll('.active-follower');
      activeFollowers.forEach((element) => {
        element.addEventListener('mouseenter', handleMouseEnter);
        element.addEventListener('mouseleave', handleMouseLeave);
      });
    }, 1000);

    return () => {
      
    };
  }, []);

  return (
    <>
      <div ref={followerRefSmall} className="mouse-follower-small"></div>
      <div ref={followerRef} className="mouse-follower"></div>
    </>
  );
};

export default MouseFollower;
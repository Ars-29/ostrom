import React, { useState, useEffect } from 'react';
// Lenis hook (safe optional usage if available)
// @ts-ignore - in case type defs differ
import { useLenis } from 'lenis/react';
import './LegalOverlay.scss';

interface LegalOverlayProps {
  onClose: () => void;
}

// Simple legal mentions overlay (modal)
const LegalOverlay: React.FC<LegalOverlayProps> = ({ onClose }) => {
  const [isFadingOut, setIsFadingOut] = useState(false);
  const lenis = typeof useLenis === 'function' ? useLenis() : null;

  // Stop smooth scrolling + lock document scroll while modal is open
  useEffect(() => {
    // Pause Lenis if present
    try { lenis?.stop?.(); } catch {}

    const previousHtmlOverflow = document.documentElement.style.overflow;
    const previousBodyOverflow = document.body.style.overflow;
    document.documentElement.style.overflow = 'hidden';
    document.body.style.overflow = 'hidden';

    // Prevent wheel events from reaching underlying Lenis/root when user hovers overlay backdrop
    const wheelBlock = (e: WheelEvent) => {
      // If the event target is inside the scrollable content, allow natural scrolling there
      const contentEl = document.querySelector('.legal-overlay-content');
      if (contentEl && contentEl.contains(e.target as Node)) return;
      e.preventDefault();
      e.stopPropagation();
    };
    window.addEventListener('wheel', wheelBlock, { passive: false });

    return () => {
      window.removeEventListener('wheel', wheelBlock);
      document.documentElement.style.overflow = previousHtmlOverflow;
      document.body.style.overflow = previousBodyOverflow;
      try { lenis?.start?.(); } catch {}
    };
  }, [lenis]);

  const handleClose = () => {
    setIsFadingOut(true);
    setTimeout(() => onClose(), 400); // Match fade-out duration
  };

  const stopPropagation = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  return (
    <div className={`legal-overlay ${isFadingOut ? 'fade-out' : ''}`} role="dialog" aria-modal="true" aria-labelledby="legal-overlay-title" onClick={handleClose}>
      <div className="legal-overlay-backdrop" />
      <div
        className="legal-overlay-content"
        onClick={stopPropagation}
        onWheel={(e) => { e.stopPropagation(); }}
        // Stop touch events from bubbling to any global handlers that may call preventDefault
        onTouchStart={(e) => { e.stopPropagation(); }}
        onTouchMove={(e) => { e.stopPropagation(); }}
      >
        <button className="legal-overlay-close" aria-label="Close legal mentions" onClick={handleClose}>×</button>
        <h2 id="legal-overlay-title" className="legal-title">Legal Notices</h2>
        <div className="legal-body">
          <h3>Publisher</h3>
          <p><strong>Company:</strong> Strom Paris SAS</p>
          <p><strong>Share Capital:</strong> €80,000</p>
          <p><strong>Registered Office:</strong> 42B rue Cardinet, 75017 Paris, France</p>
          <p><strong>RCS Paris:</strong> 929 424 539</p>
          <p><strong>EU VAT:</strong> FR93929424539</p>
          <p><strong>Email:</strong> <a href="mailto:contact@ostrometfils.com">contact@ostrometfils.com</a></p>
          <p><strong>Phone:</strong> +33 9 66 98 94 73</p>

          <h3>Publication Director</h3>
          <p>Ramesh Nair</p>

          <h3>Hosting</h3>
          <p><strong>OVH SAS</strong><br />2 rue Kellermann, 59100 Roubaix, France<br />Phone: +33 (0)9 72 10 10 07<br />Website: <a href="https://www.ovhcloud.com" target="_blank" rel="noopener noreferrer">https://www.ovhcloud.com</a></p>

          <h3>Intellectual Property</h3>
          <p>All elements on this site (texts, images, graphics, logo, videos, icons, etc.) are the exclusive property of O.Ström &amp; Fils unless otherwise stated. Any reproduction, representation, modification or use of all or part of the site without prior written authorization is strictly prohibited.</p>

          <h3>Credits</h3>
          <p><strong>Design &amp; Digital Development:</strong> <a target='_blank' href="https://www.us-paris.com/">US Paris</a></p>
          <p><strong>Art Direction &amp; Film:</strong> <a target='_blank' href="https://www.us-paris.com/">US Paris</a></p>

            <br />
          <p style={{fontSize: '12px', opacity: 0.7}}>Last updated: {new Date().getFullYear()}</p>
        </div>
      </div>
    </div>
  );
};

export default LegalOverlay;

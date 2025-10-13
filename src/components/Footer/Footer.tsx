import React, { useState } from 'react';

import './Footer.scss';
import ScoreFooter from './ScoreFooter';
import LegalOverlay from '../LegalOverlay/LegalOverlay';

const Footer: React.FC = () => {
  const [showLegal, setShowLegal] = useState(false);

  const openLegal = (e: React.MouseEvent) => {
    e.preventDefault();
    setShowLegal(true);
  };

  const closeLegal = () => setShowLegal(false);

  return (
    <>
      <footer className="footer" id="footer-trigger">
        <div className='footer-content'>
          <ScoreFooter />
          <div className="footer-copyright">
            &copy; {new Date().getFullYear()} STROM - All rights reserved -
            <a href="#legal" onClick={openLegal} className='footer-legal-link'>Legal Notices</a>
          </div>
        </div>
      </footer>
      {showLegal && <LegalOverlay onClose={closeLegal} />}
    </>
  );
};

export default Footer;
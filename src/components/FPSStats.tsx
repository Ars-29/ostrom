import { useEffect } from 'react';
import Stats from 'stats.js';

const FPSStats = () => {
  useEffect(() => {
    const stats = new Stats();
    stats.showPanel(0); // 0: fps, 1: ms, 2: mb, 3+: custom
    document.body.appendChild(stats.dom);

    let animationId: number;
    const animate = () => {
      stats.begin();
      stats.end();
      animationId = requestAnimationFrame(animate);
    };
    animate();

    return () => {
      cancelAnimationFrame(animationId);
      if (stats.dom.parentNode) {
        stats.dom.parentNode.removeChild(stats.dom);
      }
    };
  }, []);

  return null;
};

export default FPSStats;

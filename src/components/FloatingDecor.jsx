import React, { useEffect, useState } from 'react';

const FloatingDecor = () => {
  const [elements, setElements] = useState([]);

  useEffect(() => {
    // Icons for floating: 💖 (Pink Heart), 🌹 (Rose), ✨ (Sparkle), 🌷 (Tulip)
    const icons = ['💖', '🌹', '✨', '🌷'];
    const newElements = Array.from({ length: 8 }).map((_, i) => {
      const type = icons[Math.floor(Math.random() * icons.length)];
      const size = Math.random() * 0.8 + 0.6; // Smaller size for subtlety (0.6rem to 1.4rem)
      const left = `${Math.random() * 80}%`;
      const top = `${Math.random() * 100}%`;
      
      const floatDuration = Math.random() * 15 + 20; // 20s to 35s
      const delay = Math.random() * -30;

      let opacity = Math.random() * 0.3 + 0.1; 
      let filter = `blur(${Math.random() * 1.5}px) drop-shadow(0 5px 10px rgba(163, 134, 58, 0.3))`;
      
      if (type === '✨') opacity = Math.random() * 0.5 + 0.2;

      return {
        id: i,
        char: type,
        size: `${size}rem`,
        left,
        top,
        animationDuration: `${floatDuration}s`,
        animationDelay: `${delay}s`,
        opacity,
        filter
      };
    });

    setElements(newElements);
  }, []);

  return (
    <div style={{
      position: 'fixed',
      top: '12vh',
      right: '1vw',
      width: '120px',
      height: '75vh',
      pointerEvents: 'none',
      zIndex: 100,
      overflow: 'visible'
    }}>
      {elements.map((el) => (
        <div
          key={el.id}
          className="floating-element"
          style={{
            position: 'absolute',
            left: el.left,
            top: el.top,
            fontSize: el.size,
            opacity: el.opacity,
            filter: el.filter,
            animationName: 'floatSubtle',
            animationDuration: el.animationDuration,
            animationDelay: el.animationDelay,
            animationTimingFunction: 'ease-in-out',
            animationIterationCount: 'infinite',
            animationDirection: 'alternate'
          }}
        >
          {el.char}
        </div>
      ))}
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes floatSubtle {
          0% { transform: translate3d(0, 0, 0) rotate(0deg); }
          100% { transform: translate3d(15px, -30px, 0) rotate(8deg); }
        }
      `}} />
    </div>
  );
};

export default FloatingDecor;

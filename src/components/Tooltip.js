import React, { useState } from 'react';

const Tooltip = ({ children, content, type = 'default', position = 'top', delay = 300 }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [timeoutId, setTimeoutId] = useState(null);

  const handleMouseEnter = () => {
    const id = setTimeout(() => {
      setIsVisible(true);
    }, delay);
    setTimeoutId(id);
  };

  const handleMouseLeave = () => {
    if (timeoutId) {
      clearTimeout(timeoutId);
      setTimeoutId(null);
    }
    setIsVisible(false);
  };

  const getTooltipClass = () => {
    let classes = 'tooltip';
    
    if (position !== 'top') {
      classes += ` tooltip-${position}`;
    }
    
    switch (type) {
      case 'url':
        classes += ' tooltip-url';
        break;
      case 'method':
        classes += ' tooltip-method';
        break;
      case 'endpoint':
        classes += ' tooltip-endpoint';
        break;
      default:
        break;
    }
    
    return classes;
  };

  if (!content) {
    return children;
  }

  return (
    <div 
      className="tooltip-container"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {children}
      {isVisible && (
        <div className={getTooltipClass()}>
          {content}
        </div>
      )}
    </div>
  );
};

export default Tooltip;
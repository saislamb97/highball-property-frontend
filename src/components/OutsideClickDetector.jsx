import React, { useRef, useEffect } from 'react';

function OutsideClickDetector({ style = {}, children, onOutsideClick }) {
  const wrapperRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        if (onOutsideClick) {
          onOutsideClick(event);
        }
      }
    }

    document.addEventListener('click', handleClickOutside);
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, [onOutsideClick]);

  return <div style={style} ref={wrapperRef}>{children}</div>;
}

export default OutsideClickDetector;

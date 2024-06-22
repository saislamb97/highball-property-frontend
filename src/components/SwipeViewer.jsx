import React, { useState, useRef, useEffect, useCallback } from "react";

const SwipeViewer = ({ 
  children, 
  current = 0, 
  transitionTime = 300, 
  onTransitionEnd = _ => _, 
  onChange = _ => _
}) => {
  const swipeRef = useRef(null);
  const [currentIndex, setCurrentIndex] = useState(current);
  
  const childCount = React.Children.count(children);
  const childWidth = (100 / childCount);
  
  const handleSwipe = useCallback((direction) => {
    const newIndex = currentIndex + direction;
    if (newIndex < 0 || newIndex >= childCount) {
      return;
    }
    setCurrentIndex(newIndex);
    const newOffset = newIndex * childWidth;
    swipeRef.current.style.transform = `translateX(-${newOffset}%)`;
    onChange(newIndex)
    setTimeout(_ => onTransitionEnd(newIndex), transitionTime)

  }, [children])

  useEffect(() => {
    if (current !== currentIndex) {
      const actionDirection = current - currentIndex;
      if (actionDirection < 0 && currentIndex > 0) {
        handleSwipe(actionDirection)
      }
      if (actionDirection > 0 && currentIndex < childCount) {
        handleSwipe(actionDirection)
      }
    }
  }, [current])

  return (
    <div className="swipe-wrapper" style={{ overflow: "hidden" }}>
      <div
        ref={swipeRef}
        className="swipe-inner"
        style={{
          display: "flex",
          transition: `transform ${transitionTime}ms ease-in-out`,
          width: `${childCount * 100}%`,
        }}
      >
        {React.Children.map(children, (child) => (
          <div
            style={{
              width: `${childWidth}%`,
              flexShrink: 0,
            }}
          >
            {child}
          </div>
        ))}
      </div>
    </div>
  );
};

export default SwipeViewer;

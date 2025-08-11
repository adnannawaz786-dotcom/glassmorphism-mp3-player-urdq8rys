import React, { useState, useRef, useEffect } from 'react';

const ProgressBar = ({ 
  currentTime = 0, 
  duration = 0, 
  onSeek, 
  className = "" 
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [dragTime, setDragTime] = useState(0);
  const progressBarRef = useRef(null);

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;
  const displayProgress = isDragging ? (dragTime / duration) * 100 : progress;

  const formatTime = (time) => {
    if (isNaN(time)) return "0:00";
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const getTimeFromPosition = (clientX) => {
    if (!progressBarRef.current) return 0;
    
    const rect = progressBarRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const percentage = Math.max(0, Math.min(1, x / rect.width));
    return percentage * duration;
  };

  const handleMouseDown = (e) => {
    setIsDragging(true);
    const newTime = getTimeFromPosition(e.clientX);
    setDragTime(newTime);
  };

  const handleTouchStart = (e) => {
    setIsDragging(true);
    const touch = e.touches[0];
    const newTime = getTimeFromPosition(touch.clientX);
    setDragTime(newTime);
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    const newTime = getTimeFromPosition(e.clientX);
    setDragTime(newTime);
  };

  const handleTouchMove = (e) => {
    if (!isDragging) return;
    e.preventDefault();
    const touch = e.touches[0];
    const newTime = getTimeFromPosition(touch.clientX);
    setDragTime(newTime);
  };

  const handleEnd = () => {
    if (isDragging && onSeek) {
      onSeek(dragTime);
    }
    setIsDragging(false);
    setDragTime(0);
  };

  const handleClick = (e) => {
    if (!isDragging && onSeek) {
      const newTime = getTimeFromPosition(e.clientX);
      onSeek(newTime);
    }
  };

  useEffect(() => {
    const handleGlobalMouseMove = (e) => handleMouseMove(e);
    const handleGlobalMouseUp = () => handleEnd();
    const handleGlobalTouchMove = (e) => handleTouchMove(e);
    const handleGlobalTouchEnd = () => handleEnd();

    if (isDragging) {
      document.addEventListener('mousemove', handleGlobalMouseMove);
      document.addEventListener('mouseup', handleGlobalMouseUp);
      document.addEventListener('touchmove', handleGlobalTouchMove, { passive: false });
      document.addEventListener('touchend', handleGlobalTouchEnd);
    }

    return () => {
      document.removeEventListener('mousemove', handleGlobalMouseMove);
      document.removeEventListener('mouseup', handleGlobalMouseUp);
      document.removeEventListener('touchmove', handleGlobalTouchMove);
      document.removeEventListener('touchend', handleGlobalTouchEnd);
    };
  }, [isDragging, dragTime]);

  return (
    <div className={`w-full space-y-2 ${className}`}>
      {/* Progress Bar */}
      <div
        ref={progressBarRef}
        className="relative h-2 bg-white/20 rounded-full cursor-pointer backdrop-blur-sm border border-white/10 overflow-hidden group"
        onMouseDown={handleMouseDown}
        onTouchStart={handleTouchStart}
        onClick={handleClick}
      >
        {/* Background Track */}
        <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-white/5 rounded-full" />
        
        {/* Progress Fill */}
        <div
          className="absolute left-0 top-0 h-full bg-gradient-to-r from-blue-400 to-purple-500 rounded-full transition-all duration-100 ease-out shadow-lg"
          style={{ width: `${Math.max(0, Math.min(100, displayProgress))}%` }}
        />
        
        {/* Progress Handle */}
        <div
          className={`absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-white rounded-full shadow-lg border-2 border-blue-400 transition-all duration-100 ease-out ${
            isDragging ? 'scale-125 shadow-xl' : 'scale-0 group-hover:scale-100'
          }`}
          style={{ 
            left: `${Math.max(0, Math.min(100, displayProgress))}%`,
            transform: `translateX(-50%) translateY(-50%) scale(${isDragging ? 1.25 : 0})`,
          }}
        />
        
        {/* Hover Effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-blue-400/20 to-purple-500/20 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
      </div>

      {/* Time Display */}
      <div className="flex justify-between items-center text-xs font-medium text-white/80 px-1">
        <span className="tabular-nums">
          {formatTime(isDragging ? dragTime : currentTime)}
        </span>
        <span className="tabular-nums">
          {formatTime(duration)}
        </span>
      </div>
    </div>
  );
};

export default ProgressBar;

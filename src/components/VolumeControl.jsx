import React, { useState, useRef, useEffect } from 'react';
import { Volume2, VolumeX } from 'lucide-react';

const VolumeControl = ({ volume, onVolumeChange, className = '' }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [previousVolume, setPreviousVolume] = useState(volume);
  const sliderRef = useRef(null);

  const handleMouseDown = (e) => {
    setIsDragging(true);
    handleVolumeChange(e);
  };

  const handleMouseMove = (e) => {
    if (isDragging) {
      handleVolumeChange(e);
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleTouchStart = (e) => {
    setIsDragging(true);
    handleVolumeChange(e.touches[0]);
  };

  const handleTouchMove = (e) => {
    if (isDragging) {
      e.preventDefault();
      handleVolumeChange(e.touches[0]);
    }
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  const handleVolumeChange = (event) => {
    if (!sliderRef.current) return;

    const rect = sliderRef.current.getBoundingClientRect();
    const clientX = event.clientX || event.pageX;
    const x = clientX - rect.left;
    const width = rect.width;
    const newVolume = Math.max(0, Math.min(1, x / width));
    
    onVolumeChange(newVolume);
    if (newVolume > 0 && isMuted) {
      setIsMuted(false);
    }
  };

  const handleMuteToggle = () => {
    if (isMuted) {
      setIsMuted(false);
      onVolumeChange(previousVolume);
    } else {
      setPreviousVolume(volume);
      setIsMuted(true);
      onVolumeChange(0);
    }
  };

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.addEventListener('touchmove', handleTouchMove, { passive: false });
      document.addEventListener('touchend', handleTouchEnd);

      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
        document.removeEventListener('touchmove', handleTouchMove);
        document.removeEventListener('touchend', handleTouchEnd);
      };
    }
  }, [isDragging]);

  const displayVolume = isMuted ? 0 : volume;

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {/* Mute/Unmute Button */}
      <button
        onClick={handleMuteToggle}
        className="p-2 rounded-full backdrop-blur-md bg-white/10 border border-white/20 
                   hover:bg-white/20 transition-all duration-300 group touch-manipulation"
        aria-label={isMuted ? 'Unmute' : 'Mute'}
      >
        {isMuted || displayVolume === 0 ? (
          <VolumeX className="w-4 h-4 text-white/80 group-hover:text-white transition-colors" />
        ) : (
          <Volume2 className="w-4 h-4 text-white/80 group-hover:text-white transition-colors" />
        )}
      </button>

      {/* Volume Slider */}
      <div className="flex-1 min-w-[80px] max-w-[120px]">
        <div
          ref={sliderRef}
          className="relative h-2 rounded-full backdrop-blur-md bg-white/10 border border-white/20 
                     cursor-pointer group overflow-hidden"
          onMouseDown={handleMouseDown}
          onTouchStart={handleTouchStart}
        >
          {/* Background track */}
          <div className="absolute inset-0 rounded-full bg-gradient-to-r from-transparent to-white/5" />
          
          {/* Volume fill */}
          <div
            className="absolute left-0 top-0 h-full rounded-full bg-gradient-to-r 
                       from-blue-400/60 to-purple-500/60 transition-all duration-150
                       group-hover:from-blue-400/80 group-hover:to-purple-500/80"
            style={{ width: `${displayVolume * 100}%` }}
          />
          
          {/* Volume handle */}
          <div
            className="absolute top-1/2 w-4 h-4 -mt-2 -ml-2 rounded-full 
                       bg-white/90 border-2 border-white/50 shadow-lg
                       transition-all duration-150 hover:scale-110
                       backdrop-blur-sm"
            style={{ left: `${displayVolume * 100}%` }}
          />
          
          {/* Hover glow effect */}
          <div
            className="absolute top-1/2 w-6 h-6 -mt-3 -ml-3 rounded-full 
                       bg-white/20 opacity-0 group-hover:opacity-100 
                       transition-opacity duration-300 blur-sm"
            style={{ left: `${displayVolume * 100}%` }}
          />
        </div>
        
        {/* Volume percentage indicator */}
        <div className="text-xs text-white/60 text-center mt-1 font-medium">
          {Math.round(displayVolume * 100)}%
        </div>
      </div>
    </div>
  );
};

export default VolumeControl;

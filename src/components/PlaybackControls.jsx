```jsx
import React from 'react';
import { Play, Pause, SkipBack, SkipForward, Volume2 } from 'lucide-react';

const PlaybackControls = ({ 
  isPlaying, 
  onPlayPause, 
  onPrevious, 
  onNext, 
  volume, 
  onVolumeChange,
  disabled = false 
}) => {
  return (
    <div className="flex items-center justify-center space-x-4 p-6">
      {/* Previous Button */}
      <button
        onClick={onPrevious}
        disabled={disabled}
        className="group relative p-3 rounded-full backdrop-blur-md bg-white/10 border border-white/20 
                   hover:bg-white/20 active:scale-95 transition-all duration-200 
                   disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white/10"
        aria-label="Previous track"
      >
        <SkipBack className="w-5 h-5 text-white group-hover:text-white/90" />
        <div className="absolute inset-0 rounded-full bg-gradient-to-r from-purple-400/20 to-pink-400/20 
                        opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
      </button>

      {/* Play/Pause Button */}
      <button
        onClick={onPlayPause}
        disabled={disabled}
        className="group relative p-4 rounded-full backdrop-blur-md bg-white/15 border border-white/30 
                   hover:bg-white/25 active:scale-95 transition-all duration-200 shadow-lg
                   disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white/15"
        aria-label={isPlaying ? 'Pause' : 'Play'}
      >
        {isPlaying ? (
          <Pause className="w-7 h-7 text-white group-hover:text-white/90" />
        ) : (
          <Play className="w-7 h-7 text-white group-hover:text-white/90 ml-0.5" />
        )}
        <div className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-400/20 to-purple-400/20 
                        opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
      </button>

      {/* Next Button */}
      <button
        onClick={onNext}
        disabled={disabled}
        className="group relative p-3 rounded-full backdrop-blur-md bg-white/10 border border-white/20 
                   hover:bg-white/20 active:scale-95 transition-all duration-200
                   disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white/10"
        aria-label="Next track"
      >
        <SkipForward className="w-5 h-5 text-white group-hover:text-white/90" />
        <div className="absolute inset-0 rounded-full bg-gradient-to-r from-pink-400/20 to-purple-400/20 
                        opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
      </button>

      {/* Volume Control */}
      <div className="flex items-center space-x-2 ml-4">
        <Volume2 className="w-4 h-4 text-white/70" />
        <div className="relative w-16 h-1 bg-white/20 rounded-full overflow-hidden">
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={volume}
            onChange={(e) => onVolumeChange(parseFloat(e.target.value))}
            disabled={disabled}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
            aria-label="Volume control"
          />
          <div 
            className="absolute left-0 top-0 h-full bg-gradient-to-r from-blue-400 to-purple-400 rounded-full transition-all duration-150"
            style={{ width: `${volume * 100}%` }}
          />
          <div 
            className="absolute top-1/2 w-3 h-3 bg-white rounded-full shadow-lg transform -translate-y-1/2 transition-all duration-150"
            style={{ left: `calc(${volume * 100}% - 6px)` }}
          />
        </div>
      </div>
    </div>
  );
};

export default PlaybackControls;
```
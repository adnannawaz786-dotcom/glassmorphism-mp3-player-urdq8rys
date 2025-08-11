import React from 'react';
import { Music } from 'lucide-react';

const TrackInfo = ({ 
  title = "No Track Selected", 
  artist = "Unknown Artist", 
  album = "Unknown Album",
  artwork = null,
  className = "" 
}) => {
  return (
    <div className={`flex items-center space-x-4 p-4 ${className}`}>
      {/* Album Artwork */}
      <div className="relative flex-shrink-0">
        <div className="w-16 h-16 md:w-20 md:h-20 rounded-xl overflow-hidden bg-white/10 backdrop-blur-md border border-white/20 shadow-lg">
          {artwork ? (
            <img 
              src={artwork} 
              alt={`${album} artwork`}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Music className="w-6 h-6 md:w-8 md:h-8 text-white/60" />
            </div>
          )}
        </div>
        {/* Glassmorphism overlay */}
        <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-white/5 to-transparent pointer-events-none" />
      </div>

      {/* Track Information */}
      <div className="flex-1 min-w-0">
        <div className="space-y-1">
          {/* Track Title */}
          <h3 className="text-white font-semibold text-base md:text-lg leading-tight truncate">
            {title}
          </h3>
          
          {/* Artist */}
          <p className="text-white/80 text-sm md:text-base truncate">
            {artist}
          </p>
          
          {/* Album - Hidden on very small screens */}
          <p className="text-white/60 text-xs md:text-sm truncate hidden sm:block">
            {album}
          </p>
        </div>
      </div>

      {/* Optional: Now Playing Indicator */}
      <div className="flex-shrink-0">
        <div className="flex space-x-1 items-center">
          <div className="w-1 h-3 bg-gradient-to-t from-blue-400 to-purple-400 rounded-full animate-pulse" />
          <div className="w-1 h-4 bg-gradient-to-t from-blue-400 to-purple-400 rounded-full animate-pulse delay-75" />
          <div className="w-1 h-2 bg-gradient-to-t from-blue-400 to-purple-400 rounded-full animate-pulse delay-150" />
        </div>
      </div>
    </div>
  );
};

export default TrackInfo;

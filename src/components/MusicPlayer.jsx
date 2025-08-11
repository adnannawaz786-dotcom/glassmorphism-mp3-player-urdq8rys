import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, SkipBack, SkipForward, Volume2, VolumeX, Shuffle, Repeat } from 'lucide-react';
import AudioVisualizer from './AudioVisualizer';

const MusicPlayer = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isShuffled, setIsShuffled] = useState(false);
  const [isRepeating, setIsRepeating] = useState(false);
  const [currentTrack, setCurrentTrack] = useState(0);
  const [audioContext, setAudioContext] = useState(null);
  const [analyser, setAnalyser] = useState(null);

  const audioRef = useRef(null);
  const progressRef = useRef(null);
  const volumeRef = useRef(null);

  // Sample playlist - in a real app, this would come from props or state management
  const playlist = [
    {
      id: 1,
      title: "Sample Track 1",
      artist: "Demo Artist",
      album: "Demo Album",
      duration: "3:45",
      src: "/audio/sample1.mp3" // You'll need to add actual audio files
    },
    {
      id: 2,
      title: "Sample Track 2",
      artist: "Demo Artist",
      album: "Demo Album",
      duration: "4:12",
      src: "/audio/sample2.mp3"
    }
  ];

  const currentSong = playlist[currentTrack];

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateTime = () => setCurrentTime(audio.currentTime);
    const updateDuration = () => setDuration(audio.duration);

    audio.addEventListener('timeupdate', updateTime);
    audio.addEventListener('loadedmetadata', updateDuration);
    audio.addEventListener('ended', handleNext);

    return () => {
      audio.removeEventListener('timeupdate', updateTime);
      audio.removeEventListener('loadedmetadata', updateDuration);
      audio.removeEventListener('ended', handleNext);
    };
  }, [currentTrack]);

  useEffect(() => {
    // Initialize Web Audio API for visualizer
    if (audioRef.current && !audioContext) {
      const context = new (window.AudioContext || window.webkitAudioContext)();
      const analyserNode = context.createAnalyser();
      const source = context.createMediaElementSource(audioRef.current);
      
      source.connect(analyserNode);
      analyserNode.connect(context.destination);
      
      analyserNode.fftSize = 256;
      
      setAudioContext(context);
      setAnalyser(analyserNode);
    }
  }, [audioContext]);

  const togglePlay = async () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (audioContext && audioContext.state === 'suspended') {
      await audioContext.resume();
    }

    if (isPlaying) {
      audio.pause();
    } else {
      audio.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleNext = () => {
    const nextTrack = isShuffled 
      ? Math.floor(Math.random() * playlist.length)
      : (currentTrack + 1) % playlist.length;
    setCurrentTrack(nextTrack);
  };

  const handlePrevious = () => {
    const prevTrack = currentTrack === 0 ? playlist.length - 1 : currentTrack - 1;
    setCurrentTrack(prevTrack);
  };

  const handleProgressChange = (e) => {
    const audio = audioRef.current;
    if (!audio) return;

    const rect = progressRef.current.getBoundingClientRect();
    const pos = (e.clientX - rect.left) / rect.width;
    audio.currentTime = pos * duration;
  };

  const handleVolumeChange = (e) => {
    const rect = volumeRef.current.getBoundingClientRect();
    const pos = (e.clientX - rect.left) / rect.width;
    const newVolume = Math.max(0, Math.min(1, pos));
    setVolume(newVolume);
    if (audioRef.current) {
      audioRef.current.volume = newVolume;
    }
  };

  const toggleMute = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isMuted) {
      audio.volume = volume;
      setIsMuted(false);
    } else {
      audio.volume = 0;
      setIsMuted(true);
    }
  };

  const formatTime = (time) => {
    if (isNaN(time)) return '0:00';
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const progressPercentage = duration ? (currentTime / duration) * 100 : 0;

  return (
    <div className="w-full max-w-md mx-auto">
      {/* Audio element */}
      <audio
        ref={audioRef}
        src={currentSong?.src}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
      />

      {/* Main player container */}
      <div className="backdrop-blur-lg bg-white/10 border border-white/20 rounded-3xl p-6 shadow-2xl">
        {/* Audio Visualizer */}
        <div className="mb-6 h-32 rounded-2xl overflow-hidden backdrop-blur-sm bg-white/5 border border-white/10">
          <AudioVisualizer analyser={analyser} isPlaying={isPlaying} />
        </div>

        {/* Track Info */}
        <div className="text-center mb-6">
          <h2 className="text-white text-xl font-bold mb-1 truncate">
            {currentSong?.title || 'No Track Selected'}
          </h2>
          <p className="text-white/70 text-sm truncate">
            {currentSong?.artist || 'Unknown Artist'}
          </p>
        </div>

        {/* Progress Bar */}
        <div className="mb-4">
          <div
            ref={progressRef}
            className="h-2 bg-white/20 rounded-full cursor-pointer relative overflow-hidden backdrop-blur-sm"
            onClick={handleProgressChange}
          >
            <div
              className="h-full bg-gradient-to-r from-purple-400 to-pink-400 rounded-full transition-all duration-300 ease-out"
              style={{ width: `${progressPercentage}%` }}
            />
            <div
              className="absolute top-1/2 transform -translate-y-1/2 w-4 h-4 bg-white rounded-full shadow-lg transition-all duration-300 ease-out"
              style={{ left: `calc(${progressPercentage}% - 8px)` }}
            />
          </div>
          <div className="flex justify-between text-white/70 text-xs mt-2">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>

        {/* Control Buttons */}
        <div className="flex items-center justify-center space-x-4 mb-6">
          <button
            onClick={() => setIsShuffled(!isShuffled)}
            className={`p-2 rounded-full backdrop-blur-sm transition-all duration-300 ${
              isShuffled 
                ? 'bg-purple-500/30 text-purple-300' 
                : 'bg-white/10 text-white/70 hover:bg-white/20'
            }`}
          >
            <Shuffle size={16} />
          </button>

          <button
            onClick={handlePrevious}
            className="p-3 rounded-full bg-white/10 text-white hover:bg-white/20 transition-all duration-300 backdrop-blur-sm"
          >
            <SkipBack size={20} />
          </button>

          <button
            onClick={togglePlay}
            className="p-4 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600 transition-all duration-300 shadow-lg transform hover:scale-105"
          >
            {isPlaying ? <Pause size={24} /> : <Play size={24} />}
          </button>

          <button
            onClick={handleNext}
            className="p-3 rounded-full bg-white/10 text-white hover:bg-white/20 transition-all duration-300 backdrop-blur-sm"
          >
            <SkipForward size={20} />
          </button>

          <button
            onClick={() => setIsRepeating(!isRepeating)}
            className={`p-2 rounded-full backdrop-blur-sm transition-all duration-300 ${
              isRepeating 
                ? 'bg-purple-500/30 text-purple-300' 
                : 'bg-white/10 text-white/70 hover:bg-white/20'
            }`}
          >
            <Repeat size={16} />
          </button>
        </div>

        {/* Volume Control */}
        <div className="flex items-center space-x-3">
          <button
            onClick={toggleMute}
            className="p-2 rounded-full bg-white/10 text-white/70 hover:bg-white/20 transition-all duration-300 backdrop-blur-sm"
          >
            {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
          </button>
          
          <div className="flex-1">
            <div
              ref={volumeRef}
              className="h-1.5 bg-white/20 rounded-full cursor-pointer relative overflow-hidden backdrop-blur-sm"
              onClick={handleVolumeChange}
            >
              <div
                className="h-full bg-gradient-to-r from-green-400 to-blue-400 rounded-full transition-all duration-300"
                style={{ width: `${(isMuted ? 0 : volume) * 100}%` }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MusicPlayer;

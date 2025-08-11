import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, SkipBack, SkipForward, Volume2, Upload } from 'lucide-react';
import { Button } from './components/ui/button';
import { Slider } from './components/ui/slider';
import { cn } from './lib/utils';

const AudioVisualizer = ({ audioRef, isPlaying }) => {
  const canvasRef = useRef(null);
  const animationRef = useRef(null);
  const analyserRef = useRef(null);
  const dataArrayRef = useRef(null);

  useEffect(() => {
    if (!audioRef.current) return;

    const audio = audioRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    // Create audio context and analyser
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const analyser = audioContext.createAnalyser();
    const source = audioContext.createMediaElementSource(audio);
    
    source.connect(analyser);
    analyser.connect(audioContext.destination);
    
    analyser.fftSize = 256;
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    
    analyserRef.current = analyser;
    dataArrayRef.current = dataArray;

    const draw = () => {
      if (!isPlaying) return;

      analyser.getByteFrequencyData(dataArray);
      
      ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      const barWidth = (canvas.width / bufferLength) * 2.5;
      let barHeight;
      let x = 0;
      
      for (let i = 0; i < bufferLength; i++) {
        barHeight = (dataArray[i] / 255) * canvas.height * 0.8;
        
        const gradient = ctx.createLinearGradient(0, canvas.height - barHeight, 0, canvas.height);
        gradient.addColorStop(0, 'rgba(139, 92, 246, 0.8)');
        gradient.addColorStop(1, 'rgba(59, 130, 246, 0.6)');
        
        ctx.fillStyle = gradient;
        ctx.fillRect(x, canvas.height - barHeight, barWidth, barHeight);
        
        x += barWidth + 1;
      }
      
      animationRef.current = requestAnimationFrame(draw);
    };

    if (isPlaying) {
      draw();
    }

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isPlaying]);

  return (
    <canvas
      ref={canvasRef}
      width="300"
      height="150"
      className="w-full h-32 rounded-lg bg-white/5 backdrop-blur-sm"
    />
  );
};

const App = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState([70]);
  const [currentTrack, setCurrentTrack] = useState(null);
  const [playlist, setPlaylist] = useState([]);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);

  const audioRef = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateTime = () => setCurrentTime(audio.currentTime);
    const updateDuration = () => setDuration(audio.duration);
    const handleEnded = () => {
      setIsPlaying(false);
      nextTrack();
    };

    audio.addEventListener('timeupdate', updateTime);
    audio.addEventListener('loadedmetadata', updateDuration);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('timeupdate', updateTime);
      audio.removeEventListener('loadedmetadata', updateDuration);
      audio.removeEventListener('ended', handleEnded);
    };
  }, [currentTrack]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume[0] / 100;
    }
  }, [volume]);

  const togglePlay = () => {
    if (!audioRef.current || !currentTrack) return;

    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleFileUpload = (event) => {
    const files = Array.from(event.target.files);
    const newTracks = files.map((file, index) => ({
      id: playlist.length + index,
      name: file.name.replace('.mp3', ''),
      url: URL.createObjectURL(file),
      file: file
    }));

    setPlaylist(prev => [...prev, ...newTracks]);
    
    if (!currentTrack && newTracks.length > 0) {
      setCurrentTrack(newTracks[0]);
      setCurrentTrackIndex(playlist.length);
    }
  };

  const nextTrack = () => {
    if (playlist.length === 0) return;
    const nextIndex = (currentTrackIndex + 1) % playlist.length;
    setCurrentTrackIndex(nextIndex);
    setCurrentTrack(playlist[nextIndex]);
    setIsPlaying(false);
  };

  const prevTrack = () => {
    if (playlist.length === 0) return;
    const prevIndex = currentTrackIndex === 0 ? playlist.length - 1 : currentTrackIndex - 1;
    setCurrentTrackIndex(prevIndex);
    setCurrentTrack(playlist[prevIndex]);
    setIsPlaying(false);
  };

  const handleSeek = (value) => {
    if (audioRef.current) {
      audioRef.current.currentTime = value[0];
      setCurrentTime(value[0]);
    }
  };

  const formatTime = (time) => {
    if (isNaN(time)) return '0:00';
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md mx-auto">
        {/* Main Player Card */}
        <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-3xl p-6 shadow-2xl">
          {/* Upload Section */}
          {!currentTrack && (
            <div className="text-center mb-6">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileUpload}
                accept="audio/*"
                multiple
                className="hidden"
              />
              <Button
                onClick={() => fileInputRef.current?.click()}
                className="bg-white/20 hover:bg-white/30 border border-white/30 text-white backdrop-blur-sm"
              >
                <Upload className="w-4 h-4 mr-2" />
                Upload Music
              </Button>
            </div>
          )}

          {currentTrack && (
            <>
              {/* Track Info */}
              <div className="text-center mb-6">
                <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 flex items-center justify-center">
                  <div className="text-2xl">🎵</div>
                </div>
                <h2 className="text-xl font-bold text-white mb-1 truncate">
                  {currentTrack.name}
                </h2>
                <p className="text-white/70 text-sm">
                  Track {currentTrackIndex + 1} of {playlist.length}
                </p>
              </div>

              {/* Audio Visualizer */}
              <div className="mb-6">
                <AudioVisualizer audioRef={audioRef} isPlaying={isPlaying} />
              </div>

              {/* Progress Bar */}
              <div className="mb-6">
                <Slider
                  value={[currentTime]}
                  max={duration || 100}
                  step={1}
                  onValueChange={handleSeek}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-white/70 mt-2">
                  <span>{formatTime(currentTime)}</span>
                  <span>{formatTime(duration)}</span>
                </div>
              </div>

              {/* Control Buttons */}
              <div className="flex items-center justify-center gap-4 mb-6">
                <Button
                  onClick={prevTrack}
                  size="sm"
                  className="bg-white/20 hover:bg-white/30 border border-white/30 text-white backdrop-blur-sm rounded-full w-12 h-12"
                >
                  <SkipBack className="w-5 h-5" />
                </Button>

                <Button
                  onClick={togglePlay}
                  className="bg-white/30 hover:bg-white/40 border border-white/40 text-white backdrop-blur-sm rounded-full w-16 h-16"
                >
                  {isPlaying ? (
                    <Pause className="w-7 h-7" />
                  ) : (
                    <Play className="w-7 h-7 ml-1" />
                  )}
                </Button>

                <Button
                  onClick={nextTrack}
                  size="sm"
                  className="bg-white/20 hover:bg-white/30 border border-white/30 text-white backdrop-blur-sm rounded-full w-12 h-12"
                >
                  <SkipForward className="w-5 h-5" />
                </Button>
              </div>

              {/* Volume Control */}
              <div className="flex items-center gap-3">
                <Volume2 className="w-4 h-4 text-white/70" />
                <Slider
                  value={volume}
                  max={100}
                  step={1}
                  onValueChange={setVolume}
                  className="flex-1"
                />
                <span className="text-xs text-white/70 w-8">
                  {volume[0]}%
                </span>
              </div>

              {/* Add More Music Button */}
              <div className="mt-4 text-center">
                <Button
                  onClick={() => fileInputRef.current?.click()}
                  variant="ghost"
                  size="sm"
                  className="text-white/70 hover:text-white hover:bg-white/10"
                >
                  <Upload className="w-3 h-3 mr-1" />
                  Add More
                </Button>
              </div>
            </>
          )}

          {/* Hidden Audio Element */}
          {currentTrack && (
            <audio
              ref={audioRef}
              src={currentTrack.url}
              preload="metadata"
            />
          )}

          {/* Hidden File Input */}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            accept="audio/*"
            multiple
            className="hidden"
          />
        </div>

        {/* Playlist */}
        {playlist.length > 1 && (
          <div className="mt-4 backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl p-4">
            <h3 className="text-white font-semibold mb-3 text-sm">Playlist</h3>
            <div className="space-y-2 max-h-32 overflow-y-auto">
              {playlist.map((track, index) => (
                <button
                  key={track.id}
                  onClick={() => {
                    setCurrentTrack(track);
                    setCurrentTrackIndex(index);
                    setIsPlaying(false);
                  }}
                  className={cn(
                    "w-full text-left p-2 rounded-lg text-sm transition-colors",
                    index === currentTrackIndex
                      ? "bg-white/20 text-white"
                      : "text-white/70 hover:bg-white/10 hover:text-white"
                  )}
                >
                  <div className="truncate">{track.name}</div>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default App;

```jsx
import React, { useRef, useEffect, useState } from 'react';

const AudioVisualizer = ({ audioRef, isPlaying, className = '' }) => {
  const canvasRef = useRef(null);
  const animationRef = useRef(null);
  const analyserRef = useRef(null);
  const dataArrayRef = useRef(null);
  const audioContextRef = useRef(null);
  const sourceRef = useRef(null);
  const [isInitialized, setIsInitialized] = useState(false);

  const initializeAudioContext = async () => {
    if (!audioRef?.current || isInitialized) return;

    try {
      // Create audio context
      audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
      
      // Create analyser node
      analyserRef.current = audioContextRef.current.createAnalyser();
      analyserRef.current.fftSize = 256;
      analyserRef.current.smoothingTimeConstant = 0.8;

      // Create source from audio element
      sourceRef.current = audioContextRef.current.createMediaElementSource(audioRef.current);
      
      // Connect nodes
      sourceRef.current.connect(analyserRef.current);
      analyserRef.current.connect(audioContextRef.current.destination);

      // Create data array
      const bufferLength = analyserRef.current.frequencyBinCount;
      dataArrayRef.current = new Uint8Array(bufferLength);

      setIsInitialized(true);
    } catch (error) {
      console.error('Error initializing audio context:', error);
    }
  };

  const draw = () => {
    if (!canvasRef.current || !analyserRef.current || !dataArrayRef.current) return;

    const canvas = canvasRef.current;
    const canvasCtx = canvas.getContext('2d');
    const bufferLength = analyserRef.current.frequencyBinCount;

    // Get frequency data
    analyserRef.current.getByteFrequencyData(dataArrayRef.current);

    // Clear canvas
    canvasCtx.clearRect(0, 0, canvas.width, canvas.height);

    // Set up gradient
    const gradient = canvasCtx.createLinearGradient(0, canvas.height, 0, 0);
    gradient.addColorStop(0, 'rgba(139, 92, 246, 0.8)'); // Purple
    gradient.addColorStop(0.5, 'rgba(59, 130, 246, 0.8)'); // Blue
    gradient.addColorStop(1, 'rgba(16, 185, 129, 0.8)'); // Emerald

    // Calculate bar dimensions
    const barWidth = canvas.width / bufferLength;
    let x = 0;

    // Draw frequency bars
    for (let i = 0; i < bufferLength; i++) {
      const barHeight = (dataArrayRef.current[i] / 255) * canvas.height * 0.8;
      
      // Create individual bar gradient
      const barGradient = canvasCtx.createLinearGradient(0, canvas.height, 0, canvas.height - barHeight);
      barGradient.addColorStop(0, 'rgba(139, 92, 246, 0.9)');
      barGradient.addColorStop(0.5, 'rgba(59, 130, 246, 0.7)');
      barGradient.addColorStop(1, 'rgba(16, 185, 129, 0.5)');

      canvasCtx.fillStyle = barGradient;
      
      // Draw bar with rounded top
      canvasCtx.beginPath();
      canvasCtx.roundRect(x, canvas.height - barHeight, barWidth - 1, barHeight, [2, 2, 0, 0]);
      canvasCtx.fill();

      x += barWidth;
    }

    // Draw waveform overlay
    canvasCtx.beginPath();
    canvasCtx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
    canvasCtx.lineWidth = 2;
    
    for (let i = 0; i < bufferLength; i++) {
      const y = (dataArrayRef.current[i] / 255) * canvas.height;
      const x = (i / bufferLength) * canvas.width;
      
      if (i === 0) {
        canvasCtx.moveTo(x, canvas.height - y);
      } else {
        canvasCtx.lineTo(x, canvas.height - y);
      }
    }
    canvasCtx.stroke();

    if (isPlaying) {
      animationRef.current = requestAnimationFrame(draw);
    }
  };

  // Handle canvas resize
  const resizeCanvas = () => {
    if (!canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const container = canvas.parentElement;
    
    canvas.width = container.clientWidth;
    canvas.height = container.clientHeight;
  };

  useEffect(() => {
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    
    return () => {
      window.removeEventListener('resize', resizeCanvas);
    };
  }, []);

  useEffect(() => {
    if (isPlaying && !isInitialized) {
      initializeAudioContext();
    }
  }, [isPlaying, isInitialized]);

  useEffect(() => {
    if (isPlaying && isInitialized) {
      // Resume audio context if needed
      if (audioContextRef.current?.state === 'suspended') {
        audioContextRef.current.resume();
      }
      draw();
    } else {
      // Cancel animation
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      
      // Clear canvas when not playing
      if (canvasRef.current) {
        const canvas = canvasRef.current;
        const canvasCtx = canvas.getContext('2d');
        canvasCtx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Draw static bars when paused
        const barCount = 64;
        const barWidth = canvas.width / barCount;
        
        for (let i = 0; i < barCount; i++) {
          const barHeight = Math.random() * 20 + 5;
          const x = i * barWidth;
          
          canvasCtx.fillStyle = 'rgba(255, 255, 255, 0.1)';
          canvasCtx.beginPath();
          canvasCtx.roundRect(x, canvas.height - barHeight, barWidth - 1, barHeight, [2, 2, 0, 0]);
          canvasCtx.fill();
        }
      }
    }

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isPlaying, isInitialized]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, []);

  return (
    <div className={`relative w-full h-full overflow-hidden ${className}`}>
      <canvas
        ref={canvasRef}
        className="w-full h-full"
        style={{ imageRendering: 'pixelated' }}
      />
      
      {/* Glassmorphism overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-white/5 to-transparent pointer-events-none" />
      
      {/* Glow effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 via-blue-500/10 to-emerald-500/10 pointer-events-none animate-pulse" />
    </div>
  );
};

export default AudioVisualizer;
```
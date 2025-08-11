import { useEffect, useRef, useState, useCallback } from 'react';

export const useAudioVisualizer = (audioElement) => {
  const canvasRef = useRef(null);
  const animationRef = useRef(null);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const sourceRef = useRef(null);
  const dataArrayRef = useRef(null);
  
  const [isInitialized, setIsInitialized] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  // Initialize audio context and analyser
  const initializeAudioContext = useCallback(async () => {
    if (!audioElement || isInitialized) return;

    try {
      // Create audio context
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      audioContextRef.current = new AudioContext();
      
      // Create analyser node
      analyserRef.current = audioContextRef.current.createAnalyser();
      analyserRef.current.fftSize = 256;
      analyserRef.current.smoothingTimeConstant = 0.8;
      
      // Create source from audio element
      sourceRef.current = audioContextRef.current.createMediaElementSource(audioElement);
      
      // Connect nodes
      sourceRef.current.connect(analyserRef.current);
      analyserRef.current.connect(audioContextRef.current.destination);
      
      // Create data array for frequency data
      const bufferLength = analyserRef.current.frequencyBinCount;
      dataArrayRef.current = new Uint8Array(bufferLength);
      
      setIsInitialized(true);
    } catch (error) {
      console.error('Error initializing audio context:', error);
    }
  }, [audioElement, isInitialized]);

  // Draw visualization
  const draw = useCallback(() => {
    if (!canvasRef.current || !analyserRef.current || !dataArrayRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const bufferLength = analyserRef.current.frequencyBinCount;

    // Get frequency data
    analyserRef.current.getByteFrequencyData(dataArrayRef.current);

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Set up gradient
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, 'rgba(139, 69, 255, 0.8)');
    gradient.addColorStop(0.5, 'rgba(59, 130, 246, 0.6)');
    gradient.addColorStop(1, 'rgba(16, 185, 129, 0.4)');

    // Calculate bar dimensions
    const barWidth = canvas.width / bufferLength;
    let x = 0;

    // Draw frequency bars
    for (let i = 0; i < bufferLength; i++) {
      const barHeight = (dataArrayRef.current[i] / 255) * canvas.height;
      
      // Create bar gradient
      const barGradient = ctx.createLinearGradient(0, canvas.height - barHeight, 0, canvas.height);
      barGradient.addColorStop(0, `rgba(139, 69, 255, ${0.8 * (dataArrayRef.current[i] / 255)})`);
      barGradient.addColorStop(0.5, `rgba(59, 130, 246, ${0.6 * (dataArrayRef.current[i] / 255)})`);
      barGradient.addColorStop(1, `rgba(16, 185, 129, ${0.4 * (dataArrayRef.current[i] / 255)})`);

      ctx.fillStyle = barGradient;
      ctx.fillRect(x, canvas.height - barHeight, barWidth - 1, barHeight);
      
      x += barWidth;
    }

    // Draw waveform overlay
    ctx.beginPath();
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.lineWidth = 2;
    
    const sliceWidth = canvas.width / bufferLength;
    x = 0;
    
    for (let i = 0; i < bufferLength; i++) {
      const v = dataArrayRef.current[i] / 255;
      const y = v * canvas.height / 2 + canvas.height / 4;
      
      if (i === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
      
      x += sliceWidth;
    }
    
    ctx.stroke();
  }, []);

  // Animation loop
  const animate = useCallback(() => {
    if (!isAnimating) return;
    
    draw();
    animationRef.current = requestAnimationFrame(animate);
  }, [draw, isAnimating]);

  // Start visualization
  const startVisualization = useCallback(async () => {
    if (!isInitialized) {
      await initializeAudioContext();
    }
    
    if (audioContextRef.current?.state === 'suspended') {
      await audioContextRef.current.resume();
    }
    
    setIsAnimating(true);
  }, [isInitialized, initializeAudioContext]);

  // Stop visualization
  const stopVisualization = useCallback(() => {
    setIsAnimating(false);
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = null;
    }
    
    // Clear canvas
    if (canvasRef.current) {
      const ctx = canvasRef.current.getContext('2d');
      ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    }
  }, []);

  // Resize canvas
  const resizeCanvas = useCallback(() => {
    if (!canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    
    const ctx = canvas.getContext('2d');
    ctx.scale(dpr, dpr);
    
    canvas.style.width = rect.width + 'px';
    canvas.style.height = rect.height + 'px';
  }, []);

  // Handle audio events
  useEffect(() => {
    if (!audioElement) return;

    const handlePlay = () => startVisualization();
    const handlePause = () => stopVisualization();
    const handleEnded = () => stopVisualization();

    audioElement.addEventListener('play', handlePlay);
    audioElement.addEventListener('pause', handlePause);
    audioElement.addEventListener('ended', handleEnded);

    return () => {
      audioElement.removeEventListener('play', handlePlay);
      audioElement.removeEventListener('pause', handlePause);
      audioElement.removeEventListener('ended', handleEnded);
    };
  }, [audioElement, startVisualization, stopVisualization]);

  // Handle animation
  useEffect(() => {
    if (isAnimating) {
      animate();
    }
    
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isAnimating, animate]);

  // Handle resize
  useEffect(() => {
    const handleResize = () => {
      resizeCanvas();
    };

    window.addEventListener('resize', handleResize);
    
    // Initial resize
    const timeoutId = setTimeout(resizeCanvas, 100);

    return () => {
      window.removeEventListener('resize', handleResize);
      clearTimeout(timeoutId);
    };
  }, [resizeCanvas]);

  // Cleanup
  useEffect(() => {
    return () => {
      stopVisualization();
      
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, [stopVisualization]);

  return {
    canvasRef,
    isInitialized,
    isAnimating,
    startVisualization,
    stopVisualization,
    resizeCanvas
  };
};

export default useAudioVisualizer;

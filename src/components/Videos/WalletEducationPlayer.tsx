import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';

export interface Tutorial {
  id: string;
  title: string;
  description: string;
  duration: string;
  audioSrc: string;
  level?: number;
  forProvider?: boolean;
}

interface WalletEducationPlayerProps {
  tutorial: Tutorial;
  isCompleted?: boolean;
  onComplete?: (tutorialId: string) => void;
  onProgress?: (tutorialId: string, currentTime: number, duration: number) => void;
}

const WalletEducationPlayer: React.FC<WalletEducationPlayerProps> = ({
  tutorial,
  isCompleted = false,
  onComplete,
  onProgress
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [hasEnded, setHasEnded] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
      if (onProgress && audio.duration) {
        onProgress(tutorial.id, audio.currentTime, audio.duration);
      }
    };

    const handleLoadedMetadata = () => {
      setDuration(audio.duration);
    };

    const handleEnded = () => {
      setIsPlaying(false);
      setHasEnded(true);
      if (onComplete) {
        onComplete(tutorial.id);
      }
    };

    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('ended', handleEnded);
    };
  }, [tutorial.id, onComplete, onProgress]);

  const togglePlayPause = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
    } else {
      audio.play();
    }
    setIsPlaying(!isPlaying);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    const audio = audioRef.current;
    if (!audio || !duration) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const percent = (e.clientX - rect.left) / rect.width;
    audio.currentTime = percent * duration;
  };

  return (
    <div className="bg-white rounded-xl border border-sage-200 shadow-card overflow-hidden hover:shadow-lg transition-shadow">
      {/* Audio Player Visual */}
      <div className="aspect-video bg-gradient-to-br from-ocean-700 via-ocean-600 to-gold-600 relative flex flex-col items-center justify-center p-6">
        {/* Completed Badge */}
        {(isCompleted || hasEnded) && (
          <div className="absolute top-3 right-3 bg-green-500 text-white text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1">
            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            Complete
          </div>
        )}

        {/* Level Badge */}
        {tutorial.level && (
          <div className="absolute top-3 left-3 bg-gold-500 text-ocean-900 text-xs font-bold px-2 py-1 rounded-full">
            Level {tutorial.level}
          </div>
        )}

        {/* Provider Badge */}
        {tutorial.forProvider && (
          <div className="absolute top-3 left-3 bg-ocean-800 text-white text-xs font-bold px-2 py-1 rounded-full">
            For Providers
          </div>
        )}

        {/* Waveform/Visual */}
        <div className="mb-4 flex items-end gap-1 h-16">
          {[...Array(20)].map((_, i) => (
            <motion.div
              key={i}
              className="w-1.5 bg-white/60 rounded-full"
              animate={{
                height: isPlaying
                  ? [8 + Math.random() * 40, 8 + Math.random() * 40]
                  : 8
              }}
              transition={{
                duration: 0.3,
                repeat: isPlaying ? Infinity : 0,
                repeatType: 'reverse'
              }}
            />
          ))}
        </div>

        {/* Play/Pause Button */}
        <button
          onClick={togglePlayPause}
          className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform"
          aria-label={isPlaying ? 'Pause' : 'Play'}
        >
          {isPlaying ? (
            <svg className="w-7 h-7 text-ocean-600" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          ) : (
            <svg className="w-7 h-7 text-ocean-600 ml-1" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
            </svg>
          )}
        </button>

        {/* Progress Bar */}
        <div className="w-full mt-6">
          <div
            className="h-2 bg-white/30 rounded-full cursor-pointer"
            onClick={handleSeek}
          >
            <div
              className="h-full bg-white rounded-full transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="flex justify-between mt-2 text-white/80 text-sm">
            <span>{formatTime(currentTime)}</span>
            <span>{duration > 0 ? formatTime(duration) : tutorial.duration}</span>
          </div>
        </div>

        <audio ref={audioRef} src={tutorial.audioSrc} preload="metadata" />
      </div>

      {/* Video Info */}
      <div className="p-4">
        <h3 className="font-semibold text-ocean-800 mb-1">{tutorial.title}</h3>
        <p className="text-sm text-sage-600">{tutorial.description}</p>
      </div>
    </div>
  );
};

export default WalletEducationPlayer;

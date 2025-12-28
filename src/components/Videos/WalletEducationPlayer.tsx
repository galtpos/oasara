import React, { useState, useRef, useEffect } from 'react';

export interface Tutorial {
  id: string;
  title: string;
  description: string;
  duration: string;
  audioSrc?: string;
  screenshotSrc?: string;
  videoSrc?: string;
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
  const videoRef = useRef<HTMLVideoElement>(null);

  const isVideoMode = !!tutorial.videoSrc;
  const mediaRef = isVideoMode ? videoRef : audioRef;

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  const screenshotUrl = tutorial.screenshotSrc || `/tutorials/${tutorial.id}/screenshots/01_${tutorial.id.split('_').slice(1).join('_') || 'screenshot'}.png`;

  useEffect(() => {
    const media = isVideoMode ? videoRef.current : audioRef.current;
    if (!media) return;

    const handleTimeUpdate = () => {
      setCurrentTime(media.currentTime);
      if (onProgress && media.duration) {
        onProgress(tutorial.id, media.currentTime, media.duration);
      }
    };

    const handleLoadedMetadata = () => {
      setDuration(media.duration);
    };

    const handleEnded = () => {
      setIsPlaying(false);
      setHasEnded(true);
      if (onComplete) {
        onComplete(tutorial.id);
      }
    };

    media.addEventListener('timeupdate', handleTimeUpdate);
    media.addEventListener('loadedmetadata', handleLoadedMetadata);
    media.addEventListener('ended', handleEnded);

    return () => {
      media.removeEventListener('timeupdate', handleTimeUpdate);
      media.removeEventListener('loadedmetadata', handleLoadedMetadata);
      media.removeEventListener('ended', handleEnded);
    };
  }, [tutorial.id, onComplete, onProgress, isVideoMode]);

  const togglePlayPause = () => {
    const media = isVideoMode ? videoRef.current : audioRef.current;
    if (!media) return;

    if (isPlaying) {
      media.pause();
    } else {
      media.play();
    }
    setIsPlaying(!isPlaying);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    const media = isVideoMode ? videoRef.current : audioRef.current;
    if (!media || !duration) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const percent = (e.clientX - rect.left) / rect.width;
    media.currentTime = percent * duration;
  };

  return (
    <div className="bg-white rounded-xl border border-sage-200 shadow-card overflow-hidden hover:shadow-lg transition-shadow">
      <div className="aspect-video relative bg-ocean-900">
        {/* Video Mode */}
        {isVideoMode ? (
          <video
            ref={videoRef}
            src={tutorial.videoSrc}
            className="w-full h-full object-contain"
            preload="metadata"
            playsInline
          />
        ) : (
          <>
            {/* Audio Mode - Screenshot Background */}
            <img
              src={screenshotUrl}
              alt={tutorial.title}
              className="w-full h-full object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = 'none';
              }}
            />
            <audio ref={audioRef} src={tutorial.audioSrc} preload="metadata" />
          </>
        )}

        {/* Dark Overlay for Controls */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent pointer-events-none" />

        {/* Completed Badge */}
        {(isCompleted || hasEnded) && (
          <div className="absolute top-3 right-3 bg-green-500 text-white text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1 z-10">
            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            Complete
          </div>
        )}

        {/* Level Badge */}
        {tutorial.level && (
          <div className="absolute top-3 left-3 bg-gold-500 text-ocean-900 text-xs font-bold px-2 py-1 rounded-full z-10">
            Level {tutorial.level}
          </div>
        )}

        {/* Provider Badge */}
        {tutorial.forProvider && (
          <div className="absolute top-3 left-3 bg-ocean-800 text-white text-xs font-bold px-2 py-1 rounded-full z-10">
            For Providers
          </div>
        )}

        {/* Play/Pause Button - Centered (only show when not playing video) */}
        {(!isVideoMode || !isPlaying) && (
          <button
            onClick={togglePlayPause}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 bg-white/90 hover:bg-white rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform z-10"
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
        )}

        {/* Click to pause for video mode */}
        {isVideoMode && isPlaying && (
          <div
            className="absolute inset-0 cursor-pointer z-5"
            onClick={togglePlayPause}
          />
        )}

        {/* Progress Bar - Bottom */}
        <div className="absolute bottom-0 left-0 right-0 p-4 z-10">
          <div
            className="h-2 bg-white/30 rounded-full cursor-pointer"
            onClick={handleSeek}
          >
            <div
              className="h-full bg-gold-500 rounded-full transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="flex justify-between mt-2 text-white text-sm font-medium">
            <span>{formatTime(currentTime)}</span>
            <span>{duration > 0 ? formatTime(duration) : tutorial.duration}</span>
          </div>
        </div>
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

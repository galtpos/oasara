import React, { useState } from 'react';

interface LazyYouTubeEmbedProps {
  videoId: string;
  title: string;
  className?: string;
}

/**
 * Lazy YouTube Embed - Only loads iframe when user clicks
 * Prevents 11+ YouTube iframes from freezing the page
 */
const LazyYouTubeEmbed: React.FC<LazyYouTubeEmbedProps> = ({ videoId, title, className = '' }) => {
  const [isLoaded, setIsLoaded] = useState(false);

  // Use high-quality thumbnail
  const thumbnailUrl = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;

  if (isLoaded) {
    return (
      <iframe
        src={`https://www.youtube.com/embed/${videoId}?autoplay=1`}
        title={title}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        className={`w-full h-full ${className}`}
      />
    );
  }

  return (
    <button
      onClick={() => setIsLoaded(true)}
      className={`w-full h-full relative bg-black cursor-pointer group ${className}`}
      aria-label={`Play ${title}`}
    >
      <img
        src={thumbnailUrl}
        alt={title}
        className="w-full h-full object-cover"
        loading="lazy"
      />
      {/* Play button overlay */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center shadow-lg group-hover:bg-red-700 group-hover:scale-110 transition-all">
          <svg className="w-7 h-7 text-white ml-1" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
          </svg>
        </div>
      </div>
      {/* Gradient overlay for better contrast */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent pointer-events-none" />
    </button>
  );
};

export default LazyYouTubeEmbed;

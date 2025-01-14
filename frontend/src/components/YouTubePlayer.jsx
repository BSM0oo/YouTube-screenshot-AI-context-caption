import React, { useEffect, useRef, useState } from 'react';

const YouTubePlayer = ({ videoId, onPlayerReady }) => {
  const playerRef = useRef(null);
  const containerRef = useRef(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // Load YouTube IFrame API if not already loaded
    if (!window.YT) {
      const tag = document.createElement('script');
      tag.src = 'https://www.youtube.com/iframe_api';
      const firstScriptTag = document.getElementsByTagName('script')[0];
      firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

      window.onYouTubeIframeAPIReady = initPlayer;
    } else {
      initPlayer();
    }

    // Add keyboard event listener
    const handleKeyDown = (e) => {
      if (!playerRef.current || !isReady) return;

      switch (e.key) {
        case 'ArrowLeft':
          e.preventDefault();
          const currentTime = playerRef.current.getCurrentTime();
          playerRef.current.seekTo(Math.max(0, currentTime - 10), true);
          break;
        case 'ArrowRight':
          e.preventDefault();
          const currentTime2 = playerRef.current.getCurrentTime();
          const duration = playerRef.current.getDuration();
          playerRef.current.seekTo(Math.min(duration, currentTime2 + 10), true);
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      if (playerRef.current) {
        playerRef.current.destroy();
      }
    };
  }, [videoId, isReady]);

  const initPlayer = () => {
    if (!videoId) return;

    playerRef.current = new window.YT.Player('youtube-player', {
      videoId: videoId,
      playerVars: {
        autoplay: 0,
        controls: 1,
        rel: 0, // This prevents related videos from showing
        origin: window.location.origin,
        enablejsapi: 1
      },
      events: {
        onReady: () => {
          setIsReady(true);
          if (onPlayerReady) {
            onPlayerReady(playerRef.current);
          }
        },
      },
    });
  };

  // Function to handle screenshots (this should be called from your screenshot logic)
  const prepareForScreenshot = () => {
    if (!containerRef.current) return;
    
    // Hide any "more videos" elements before screenshot
    const relatedVideos = containerRef.current.querySelector('[aria-label="Related videos"]');
    if (relatedVideos) {
      relatedVideos.style.display = 'none';
    }
    
    // Return a cleanup function
    return () => {
      if (relatedVideos) {
        relatedVideos.style.display = '';
      }
    };
  };

  return (
    <div 
      ref={containerRef}
      id="youtube-player-container" 
      className="relative w-full overflow-hidden touch-manipulation" 
      style={{ 
        paddingBottom: '56.25%',
        WebkitOverflowScrolling: 'touch' // Enable smooth scrolling on iOS
      }}
    >
      <div 
        id="youtube-player" 
        className="absolute inset-0 w-full h-full"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
      />
      <style jsx>{`
        /* Hide YouTube's suggested videos overlay */
        .ytp-pause-overlay,
        .ytp-related-videos-container {
          display: none !important;
        }
      `}</style>
    </div>
  );
};

export default YouTubePlayer;
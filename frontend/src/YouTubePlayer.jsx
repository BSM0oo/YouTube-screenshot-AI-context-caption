import React, { useEffect, useRef, useState } from 'react';

const YouTubePlayer = ({ videoId, onPlayerReady }) => {
  const playerRef = useRef(null);
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

    return () => {
      if (playerRef.current) {
        playerRef.current.destroy();
      }
    };
  }, [videoId]);

  const initPlayer = () => {
    if (!videoId) return;

    playerRef.current = new window.YT.Player('youtube-player', {
      videoId: videoId,
      playerVars: {
        autoplay: 0,
        controls: 1,
        rel: 0,
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

  return (
    <div 
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
    </div>
  );
};

export default YouTubePlayer;
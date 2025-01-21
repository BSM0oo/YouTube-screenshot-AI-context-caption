import React from 'react';
import YouTubePlayer from '../../components/YouTubePlayer';
import useVideoPlayer from './useVideoPlayer';
import VideoControls from '../../components/VideoControls';
import { extractVideoId } from '../../utils/videoUtils';
import { fetchTranscript, fetchVideoInfo } from '../../utils/apiUtils';

const VideoSection = ({
  videoId,
  setVideoId,
  setTranscript,
  setVideoInfo,
  isFullWidth,
  setIsFullWidth,
  onClearData,
  eraseFiles,
  setEraseFiles,
  setError,
  setPlayer,
  player,
  currentTime,
}) => {
  const {
    loading,
    setLoading,
    handlePlayerReady: innerHandlePlayerReady,
    loadVideo
  } = useVideoPlayer();

  const handlePlayerReady = (ytPlayer) => {
    innerHandlePlayerReady(ytPlayer);
    setPlayer(ytPlayer);
  };

  const handleVideoSubmit = async (url) => {
    setLoading(true);
    setError('');
    setVideoInfo(null);
    
    try {
      const id = extractVideoId(url);
      if (id) {
        loadVideo(id);

        const [transcriptResponse, videoInfoResponse] = await Promise.all([
          fetchTranscript(id),
          fetchVideoInfo(id)
        ]);

        setTranscript(transcriptResponse);
        setVideoInfo({
          ...videoInfoResponse,
          videoId: id
        });
      }
    } catch (error) {
      setError('Error loading video: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4 flex flex-col w-full">
      <VideoControls
        onLoadVideo={(url) => {
          setVideoId(url);
          handleVideoSubmit(url);
        }}
        onToggleFullWidth={() => setIsFullWidth(!isFullWidth)}
        onClearData={onClearData}
        isFullWidth={isFullWidth}
        eraseLocalFiles={eraseFiles}
        setEraseLocalFiles={setEraseFiles}
      />

      <div className="video-container">
        {videoId ? (
          <YouTubePlayer 
            videoId={videoId}
            onPlayerReady={handlePlayerReady}
          />
        ) : (
          <div className="absolute top-0 left-0 w-full h-full bg-black flex items-center justify-center">
            <div className="text-red-600 flex flex-col items-center">
              <svg 
                className="w-16 h-16 mb-2" 
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z"/>
              </svg>
              <span className="text-white text-lg font-medium">Enter YouTube URL</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default VideoSection;
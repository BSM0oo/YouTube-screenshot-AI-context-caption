import React, { useState } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../config';
import { getContentTypeIcon } from '../utils/iconUtils.jsx';
import GifCaptureManager from './GifCaptureManager.jsx';

const EnhancedScreenshotManager = ({ 
  videoId, 
  player, 
  transcript,
  onScreenshotsTaken,
  customPrompt 
}) => {
  const [screenshotMode, setScreenshotMode] = useState('single');
  const [showGifCapture, setShowGifCapture] = useState(false);
  const [burstCount, setBurstCount] = useState(3);
  const [burstInterval, setBurstInterval] = useState(2);
  const [isCapturing, setIsCapturing] = useState(false);
  const [processingScreenshot, setProcessingScreenshot] = useState(false);
  const [error, setError] = useState('');
  const [isCleaningUp, setIsCleaningUp] = useState(false);
  const [processWithCaptions, setProcessWithCaptions] = useState(true);
  const [markedTimestamps, setMarkedTimestamps] = useState([]);
  const [isMarkMode, setIsMarkMode] = useState(false);

  const formatTime = (seconds) => {
    const date = new Date(seconds * 1000);
    return date.toISOString().substr(11, 8);
  };

  const extractVideoId = (url) => {
    const match = url.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/);
    return match ? match[1] : url;
  };

  const captureScreenshot = async (timestamp) => {
    try {
      setProcessingScreenshot(true);
      setError('');
      
      if (player) {
        player.pauseVideo();
        player.seekTo(timestamp, true);
        await new Promise(resolve => setTimeout(resolve, 1000)); // Wait for frame
      }

      let screenshotResponse;
      try {
        screenshotResponse = await axios.post(`${API_BASE_URL}/api/capture-screenshot`, {
          video_id: extractVideoId(videoId),
          timestamp,
          generate_caption: processWithCaptions
        });
        console.log("Screenshot response:", screenshotResponse.data);
      } catch (error) {
        console.error("Screenshot API error:", error);
        throw error;
      }

      // If captions are disabled, return just the screenshot
      if (!processWithCaptions) {
        return {
          image: screenshotResponse.data.image_data,
          timestamp,
          caption: '',
          content_type: 'screenshot_only',
          notes: '',
          transcriptContext: ''
        };
      }

      // Otherwise, proceed with caption generation
      const contextWindow = 20;
      const relevantTranscript = transcript
        .filter(entry => 
          entry.start >= timestamp - contextWindow &&
          entry.start <= timestamp + contextWindow
        )
        .map(entry => `[${formatTime(entry.start)}] ${entry.text}`)
        .join('\n\n');

      let captionResponse;
      try {
        captionResponse = await axios.post(`${API_BASE_URL}/api/generate-structured-caption`, {
          timestamp,
          image_data: screenshotResponse.data.image_data,
          transcript_context: relevantTranscript,
          prompt: customPrompt
        });
      } catch (error) {
        console.error("Caption API error:", error);
        throw error;
      }

      return {
        image: screenshotResponse.data.image_data,
        timestamp,
        caption: captionResponse.data.structured_caption,
        content_type: captionResponse.data.content_type,
        notes: '',
        transcriptContext: relevantTranscript
      };

    } catch (error) {
      console.error('Screenshot error:', error);
      throw error;
    } finally {
      setProcessingScreenshot(false);
      if (player) {
        player.playVideo();
      }
    }
  };

  const handleSingleScreenshot = async () => {
    if (!player) return;
    
    try {
      const screenshot = await captureScreenshot(player.getCurrentTime());
      onScreenshotsTaken([screenshot]);
    } catch (error) {
      setError('Failed to capture screenshot: ' + error.message);
    } finally {
      setProcessingScreenshot(false);
      player.playVideo();
    }
  };

  const handleBurstScreenshots = async () => {
    if (!player) return;
    
    try {
      setIsCapturing(true);
      setProcessingScreenshot(true);
      setError('');
      player.pauseVideo();
      
      const screenshots = [];
      const startTime = player.getCurrentTime();
      
      for (let i = 0; i < burstCount; i++) {
        const timestamp = startTime + (i * burstInterval);
        try {
          const screenshot = await captureScreenshot(timestamp);
          screenshots.push(screenshot);
        } catch (error) {
          console.error(`Failed to capture burst screenshot ${i}:`, error);
        }
      }
      
      if (screenshots.length > 0) {
        onScreenshotsTaken(screenshots);
      }
      
    } catch (error) {
      console.error('Burst capture error:', error);
      setError('Failed to capture burst screenshots: ' + error.message);
    } finally {
      setProcessingScreenshot(false);
      setIsCapturing(false);
      player.playVideo();
    }
  };

  const handleGifCaptured = (gifData, timestamp) => {
    onScreenshotsTaken([{
      image: gifData,
      timestamp,
      caption: 'Animated GIF capture',
      content_type: 'gif',
      notes: '',
      transcriptContext: ''
    }]);
  };

    const handleMarkForScreenshot = () => {
    if (!player) return;
    const currentTime = player.getCurrentTime();
    setMarkedTimestamps(prev => [...prev, { timestamp: currentTime, withCaption: processWithCaptions }]);
  };

  const handleCaptureMarked = async () => {
    if (!player || markedTimestamps.length === 0) return;
    
    try {
      setProcessingScreenshot(true);
      setError('');
      
      const screenshots = [];
      for (const mark of markedTimestamps) {
        try {
          const screenshot = await captureScreenshot(mark.timestamp);
          screenshots.push(screenshot);
        } catch (error) {
          console.error(`Failed to capture marked screenshot:`, error);
        }
      }
      
      if (screenshots.length > 0) {
        onScreenshotsTaken(screenshots);
        setMarkedTimestamps([]); // Clear marks after successful capture
      }
      
    } catch (error) {
      console.error('Marked capture error:', error);
      setError('Failed to capture marked screenshots: ' + error.message);
    } finally {
      setProcessingScreenshot(false);
      player.playVideo();
    }
  };

  const clearMarkedTimestamps = () => {
    setMarkedTimestamps([]);
  };

  const handleCleanup = () => {
    setIsCleaningUp(true);
    try {
      setError('');
      if (player) {
        player.playVideo();
      }
    } finally {
      setIsCleaningUp(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-lg p-4 border">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-4">
            <div className="flex gap-4">
              <label className="flex items-center">
                <input
                  type="radio"
                  checked={screenshotMode === 'single'}
                  onChange={() => setScreenshotMode('single')}
                  className="mr-2"
                />
                Single Screenshot
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  checked={screenshotMode === 'burst'}
                  onChange={() => setScreenshotMode('burst')}
                  className="mr-2"
                />
                Burst Mode
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  checked={screenshotMode === 'gif'}
                  onChange={() => setScreenshotMode('gif')}
                  className="mr-2"
                />
                GIF Mode
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  checked={screenshotMode === 'mark'}
                  onChange={() => {
                    setScreenshotMode('mark');
                    setIsMarkMode(true);
                    clearMarkedTimestamps();
                  }}
                  className="mr-2"
                />
                Mark Mode
              </label>
            </div>
            <div className="h-5 border-l border-gray-300"></div>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={processWithCaptions}
                onChange={(e) => setProcessWithCaptions(e.target.checked)}
                className="mr-2 rounded text-blue-600 border-gray-300 focus:ring-blue-500"
              />
              Generate Captions
            </label>
          </div>
          <button
            onClick={handleCleanup}
            className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 disabled:opacity-50"
            disabled={isCleaningUp}
          >
            {isCleaningUp ? 'Cleaning...' : 'Cleanup'}
          </button>
        </div>

        {screenshotMode === 'burst' && (
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Number of Screenshots
              </label>
              <input
                type="number"
                min="2"
                max="10"
                value={burstCount}
                onChange={(e) => setBurstCount(Number(e.target.value))}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Interval (seconds)
              </label>
              <input
                type="number"
                min="1"
                max="10"
                value={burstInterval}
                onChange={(e) => setBurstInterval(Number(e.target.value))}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              />
            </div>
          </div>
        )}

        {screenshotMode === 'mark' ? (
          <div className="space-y-4">
            <button
              onClick={handleMarkForScreenshot}
              className="w-full bg-blue-500 text-white px-4 py-3 rounded-lg hover:bg-blue-600 disabled:opacity-50 flex items-center justify-center gap-2"
              disabled={processingScreenshot || !player}
            >
              Mark for Screenshot {processWithCaptions ? '+ Caption' : 'Only'}
            </button>
            
            {markedTimestamps.length > 0 && (
              <div className="space-y-4">
                <div className="text-sm text-gray-600">
                  {markedTimestamps.length} timestamp{markedTimestamps.length !== 1 ? 's' : ''} marked
                </div>
                <button
                  onClick={handleCaptureMarked}
                  className="w-full bg-green-500 text-white px-4 py-3 rounded-lg hover:bg-green-600 disabled:opacity-50 flex items-center justify-center gap-2"
                  disabled={processingScreenshot || !player}
                >
                  Capture All Marked Screenshots
                </button>
                <button
                  onClick={clearMarkedTimestamps}
                  className="w-full bg-red-500 text-white px-4 py-3 rounded-lg hover:bg-red-600 disabled:opacity-50 flex items-center justify-center gap-2"
                  disabled={processingScreenshot}
                >
                  Clear Marked Timestamps
                </button>
              </div>
            )}
        )}
          </div>
        ) : (
          <button
            onClick={
              screenshotMode === 'single'
                ? handleSingleScreenshot
                : handleBurstScreenshots
            }
          className="w-full bg-green-500 text-white px-4 py-3 rounded-lg hover:bg-green-600 disabled:opacity-50 flex items-center justify-center gap-2 mt-4"
          disabled={processingScreenshot || !player || isCapturing}
        >
          {processingScreenshot ? (
            <>
              <svg className="animate-spin h-5 w-5 mr-3" viewBox="0 0 24 24">
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              {screenshotMode === 'burst'
                ? 'Capturing Screenshots...'
                : 'Processing Screenshot...'}
            </>
          ) : screenshotMode === 'single' ? (
            'Take Screenshot'
          ) : (
            `Take ${burstCount} Screenshots`
          )}
        </button>
      </div>

      {screenshotMode === 'gif' && (
      <div className="mt-4">
      <GifCaptureManager
          videoId={extractVideoId(videoId)}
            currentTime={player ? player.getCurrentTime() : 0}
              onGifCaptured={handleGifCaptured}
              />
              </div>
        )}

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}
      </div>
    );
  };

  export default EnhancedScreenshotManager;
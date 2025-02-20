import React, { useState } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../config';

const ScreenshotManager = ({ 
  videoId, 
  player, 
  transcript,
  onScreenshotsTaken,
  customPrompt 
}) => {
  const [screenshotMode, setScreenshotMode] = useState('single');
  const [burstCount, setBurstCount] = useState(3);
  const [burstInterval, setBurstInterval] = useState(2);
  const [isCapturing, setIsCapturing] = useState(false);
  const [processingScreenshot, setProcessingScreenshot] = useState(false);
  const [error, setError] = useState('');
  const [processWithCaptions, setProcessWithCaptions] = useState(true);

  const formatTime = (seconds) => {
    const date = new Date(seconds * 1000);
    return date.toISOString().substr(11, 8);
  };

  const extractVideoId = (url) => {
    const match = url.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/);
    return match ? match[1] : url;
  };

  // Helper function to ensure frame is ready
  const waitForFrame = async () => {
    return new Promise((resolve) => {
      requestAnimationFrame(() => {
        setTimeout(resolve, 100);
      });
    });
  };

  // Helper function to verify screenshot quality
  const verifyScreenshot = async (imageData) => {
    if (!imageData || imageData.length < 1000) {
      throw new Error('Invalid screenshot data');
    }
    return true;
  };

  const processScreenshot = async (currentTime, imageData, transcriptContext) => {
    if (!processWithCaptions) {
      return {
        image: imageData,
        timestamp: currentTime,
        caption: '',
        notes: '',
        transcriptContext: '',
        content_type: 'screenshot_only'
      };
    }

    const captionResponse = await axios.post(`${API_BASE_URL}/api/generate-caption`, {
      timestamp: currentTime,
      image_data: imageData,
      transcript_context: transcriptContext,
      prompt: customPrompt
    });

    return {
      image: imageData,
      timestamp: currentTime,
      caption: captionResponse.data.caption,
      notes: '',
      transcriptContext: transcriptContext,
      content_type: captionResponse.data.content_type
    };
  };

  const captureScreenshot = async () => {
    if (!player) return;
    
    try {
      setProcessingScreenshot(true);
      setError('');
      
      player.pauseVideo();
      await waitForFrame();
      
      const currentTime = player.getCurrentTime();

      let attempts = 0;
      const maxAttempts = 3;
      let screenshotResponse;

      while (attempts < maxAttempts) {
        try {
          player.seekTo(currentTime, true);
          await waitForFrame();
          
          screenshotResponse = await axios.post(`${API_BASE_URL}/api/capture-screenshot`, {
            video_id: extractVideoId(videoId),
            timestamp: currentTime
          });

          await verifyScreenshot(screenshotResponse.data.image_data);
          break;
        } catch (error) {
          attempts++;
          console.warn(`Screenshot attempt ${attempts} failed:`, error);
          if (attempts === maxAttempts) {
            throw new Error('Failed to capture a quality screenshot after multiple attempts');
          }
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }
      
      const contextWindow = 20;
      const relevantTranscript = transcript
        .filter(entry => 
          entry.start >= currentTime - contextWindow &&
          entry.start <= currentTime + contextWindow
        )
        .map(entry => `[${formatTime(entry.start)}] ${entry.text}`)
        .join('\n\n');

      const processedScreenshot = await processScreenshot(
        currentTime,
        screenshotResponse.data.image_data,
        relevantTranscript
      );

      onScreenshotsTaken([processedScreenshot]);

    } catch (error) {
      console.error('Screenshot error:', error);
      setError(
        'Failed to capture screenshot. Error: ' + 
        (error.response?.data?.detail || error.message)
      );
    } finally {
      setProcessingScreenshot(false);
      player.playVideo();
    }
  };

  const captureBurstScreenshots = async () => {
    if (!player) return;
    
    try {
      setIsCapturing(true);
      setProcessingScreenshot(true);
      setError('');
      player.pauseVideo();
      
      const newScreenshots = [];
      for (let i = 0; i < burstCount; i++) {
        const currentTime = player.getCurrentTime() + (i * burstInterval);
        
        player.seekTo(currentTime, true);
        await waitForFrame();
        
        let attempts = 0;
        const maxAttempts = 3;
        let screenshotResponse;

        while (attempts < maxAttempts) {
          try {
            await new Promise(resolve => setTimeout(resolve, 500));
            
            screenshotResponse = await axios.post(`${API_BASE_URL}/api/capture-screenshot`, {
              video_id: extractVideoId(videoId),
              timestamp: currentTime
            });

            await verifyScreenshot(screenshotResponse.data.image_data);
            break;
          } catch (error) {
            attempts++;
            console.warn(`Burst screenshot attempt ${attempts} failed:`, error);
            if (attempts === maxAttempts) {
              throw new Error(`Failed to capture quality screenshot ${i + 1} of ${burstCount}`);
            }
            await new Promise(resolve => setTimeout(resolve, 1000));
          }
        }
        
        const contextWindow = 20;
        const relevantTranscript = transcript
          .filter(entry => 
            entry.start >= currentTime - contextWindow &&
            entry.start <= currentTime + contextWindow
          )
          .map(entry => `[${formatTime(entry.start)}] ${entry.text}`)
          .join('\n\n');

        const processedScreenshot = await processScreenshot(
          currentTime,
          screenshotResponse.data.image_data,
          relevantTranscript
        );

        newScreenshots.push(processedScreenshot);
      }

      onScreenshotsTaken(newScreenshots);

    } catch (error) {
      console.error('Burst capture error:', error);
      setError(
        'Failed to capture burst screenshots. Error: ' + 
        (error.response?.data?.detail || error.message)
      );
    } finally {
      setProcessingScreenshot(false);
      setIsCapturing(false);
      player.playVideo();
    }
  };

  return (
    <div className="space-y-2">
      <div className="bg-white rounded-lg p-4 border">
        <div className="flex flex-col gap-4">
          <div className="flex flex-wrap items-center gap-4 mb-4">
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
            {/* Caption Processing Toggle */}
            <label className="flex items-center px-3 py-1.5 bg-gray-100 rounded-lg hover:bg-gray-200 cursor-pointer">
              <input
                type="checkbox"
                checked={processWithCaptions}
                onChange={(e) => setProcessWithCaptions(e.target.checked)}
                className="mr-2 rounded border-gray-300"
              />
              <span className="text-sm font-medium">
                {processWithCaptions ? '+ AI Captions' : 'No Captions'}
              </span>
            </label>

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

          <button
            onClick={screenshotMode === 'single' ? captureScreenshot : captureBurstScreenshots}
            className="w-full bg-green-500 text-white px-4 py-3 rounded-lg hover:bg-green-600 disabled:opacity-50 flex items-center justify-center gap-2"
            disabled={processingScreenshot || !player || isCapturing}
          >
            {processingScreenshot ? (
              <>
                <svg className="animate-spin h-5 w-5 mr-3" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                {screenshotMode === 'burst' ? 'Capturing Screenshots...' : 'Processing Screenshot...'}
              </>
            ) : (
              `Take ${screenshotMode === 'burst' ? `${burstCount} Screenshots` : 'Screenshot'}`
            )}
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}
    </div>
  );
};

export default ScreenshotManager;
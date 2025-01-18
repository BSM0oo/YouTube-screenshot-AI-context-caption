import React, { useState } from 'react';
import GifCaptureManager from '../GifCaptureManager';
import ScreenshotModeSelector from './ScreenshotModeSelector';
import BurstModeControls from './BurstModeControls';
import MarkModeControls from './MarkModeControls';
import CaptureControls from './CaptureControls';
import { captureScreenshot, extractVideoId } from './screenshotService';

const EnhancedScreenshotManager = ({ 
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
  const [isCleaningUp, setIsCleaningUp] = useState(false);
  const [processWithCaptions, setProcessWithCaptions] = useState(true);
  const [markedTimestamps, setMarkedTimestamps] = useState([]);

  const handleSingleScreenshot = async () => {
    if (!player) return;
    
    try {
      setProcessingScreenshot(true);
      const screenshot = await captureScreenshot({
        player,
        videoId,
        timestamp: player.getCurrentTime(),
        generateCaption: processWithCaptions,
        transcript,
        customPrompt,
        onPlayVideo: () => player.playVideo()
      });
      onScreenshotsTaken([screenshot]);
    } catch (error) {
      setError('Failed to capture screenshot: ' + error.message);
    } finally {
      setProcessingScreenshot(false);
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
          const screenshot = await captureScreenshot({
            player,
            videoId,
            timestamp,
            generateCaption: processWithCaptions,
            transcript,
            customPrompt
          });
          screenshots.push(screenshot);
        } catch (error) {
          console.error(`Failed to capture burst screenshot ${i}:`, error);
        }
      }
      
      if (screenshots.length > 0) {
        onScreenshotsTaken(screenshots);
      }
      
    } catch (error) {
      setError('Failed to capture burst screenshots: ' + error.message);
    } finally {
      setProcessingScreenshot(false);
      setIsCapturing(false);
      player.playVideo();
    }
  };

  const handleMarkForScreenshot = () => {
    if (!player) return;
    const currentTime = player.getCurrentTime();
    setMarkedTimestamps(prev => [...prev, { 
      timestamp: currentTime, 
      withCaption: processWithCaptions 
    }]);
  };

  const handleCaptureMarked = async () => {
    if (!player || markedTimestamps.length === 0) return;
    
    try {
      setProcessingScreenshot(true);
      setError('');
      player.pauseVideo();
      
      const screenshots = [];
      for (const mark of markedTimestamps) {
        try {
          const screenshot = await captureScreenshot({
            player,
            videoId,
            timestamp: mark.timestamp,
            generateCaption: mark.withCaption,
            transcript,
            customPrompt
          });
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
      setError('Failed to capture marked screenshots: ' + error.message);
    } finally {
      setProcessingScreenshot(false);
      player.playVideo();
    }
  };

  const handleCleanup = () => {
    setIsCleaningUp(true);
    try {
      if (player) {
        player.playVideo();
      }
      setError('');
      setMarkedTimestamps([]);
      setProcessingScreenshot(false);
      setIsCapturing(false);
    } finally {
      setIsCleaningUp(false);
    }
  };

  const handleModeChange = (mode) => {
    setScreenshotMode(mode);
    if (mode === 'mark') {
      setMarkedTimestamps([]);
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

  return (
    <>
      <div className="bg-white rounded-lg p-4 border">
        <ScreenshotModeSelector 
          screenshotMode={screenshotMode}
          setScreenshotMode={setScreenshotMode}
          processWithCaptions={processWithCaptions}
          setProcessWithCaptions={setProcessWithCaptions}
          onModeChange={handleModeChange}
          isCleaningUp={isCleaningUp}
          onCleanup={handleCleanup}
        />

        {screenshotMode === 'burst' && (
          <BurstModeControls 
            burstCount={burstCount}
            setBurstCount={setBurstCount}
            burstInterval={burstInterval}
            setBurstInterval={setBurstInterval}
          />
        )}

        {screenshotMode === 'mark' ? (
          <MarkModeControls 
            markedTimestamps={markedTimestamps}
            onMark={handleMarkForScreenshot}
            onCapture={handleCaptureMarked}
            onClear={() => setMarkedTimestamps([])}
            processWithCaptions={processWithCaptions}
            processingScreenshot={processingScreenshot}
            disabled={!player}
          />
        ) : (
          <CaptureControls 
            mode={screenshotMode}
            onCapture={screenshotMode === 'single' ? handleSingleScreenshot : handleBurstScreenshots}
            disabled={!player || isCapturing}
            processing={processingScreenshot}
            burstCount={burstCount}
          />
        )}
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
        <div className="mt-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}
    </>
  );
};

export default EnhancedScreenshotManager;
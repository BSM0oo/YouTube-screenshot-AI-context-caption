import React, { useState } from 'react';
import GifCaptureManager from '../GifCaptureManager';
import ScreenshotGallery from './ScreenshotGallery';
import ScreenshotModeSelector from './ScreenshotModeSelector';
import BurstModeControls from './BurstModeControls';
import MarkModeControls from './MarkModeControls';
import CaptureControls from './CaptureControls';
import LabelControls from './LabelControls';
import { captureScreenshot, extractVideoId } from './screenshotService';

const EnhancedScreenshotManager = ({ 
  videoId, 
  player, 
  transcript,
  onScreenshotsTaken,
  customPrompt,
  onScreenshotEdit
}) => {
  const [screenshotMode, setScreenshotMode] = useState('single');
  const [burstCount, setBurstCount] = useState(3);
  const [burstInterval, setBurstInterval] = useState(2);
  const [isCapturing, setIsCapturing] = useState(false);
  const [processingScreenshot, setProcessingScreenshot] = useState(false);
  const [error, setError] = useState('');
  const [screenshots, setScreenshots] = useState([]);
  const [isCleaningUp, setIsCleaningUp] = useState(false);
  const [processWithCaptions, setProcessWithCaptions] = useState(true);
  const [markedTimestamps, setMarkedTimestamps] = useState([]);
  const [remainingMarks, setRemainingMarks] = useState(0);

  // Label controls state
  const [enableLabel, setEnableLabel] = useState(false);
  const [labelText, setLabelText] = useState('');
  const [fontSize, setFontSize] = useState(48); // Default font size
  const [textColor, setTextColor] = useState('white'); // Default text color

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
        onPlayVideo: () => player.playVideo(),
        label: enableLabel ? {
          text: labelText,
          fontSize: fontSize,
          color: textColor
        } : null
      });
      const newScreenshots = [screenshot];
      setScreenshots(prev => [...prev, ...newScreenshots]);
      onScreenshotsTaken(newScreenshots);
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
            customPrompt,
            label: enableLabel ? {
              text: labelText,
              fontSize: fontSize
            } : null
          });
          screenshots.push(screenshot);
        } catch (error) {
          console.error(`Failed to capture burst screenshot ${i}:`, error);
        }
      }
      
      if (screenshots.length > 0) {
        setScreenshots(prev => [...prev, ...screenshots]);
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
    setMarkedTimestamps(prev => [
      ...prev, 
      { timestamp: currentTime, withCaption: processWithCaptions }
    ]);
    setRemainingMarks(prev => prev + 1);
  };

  const handleCaptureMarked = async () => {
    if (!player || markedTimestamps.length === 0) return;
    
    try {
      setProcessingScreenshot(true);
      setError('');
      player.pauseVideo();
      
      const screenshots = [];
      let captionErrors = false;
      setRemainingMarks(markedTimestamps.length);

      // Process marks one at a time, updating UI after each
      for (const mark of markedTimestamps) {
        try {
          // Wait before starting next capture
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          // Ensure player is at correct time
          player.seekTo(mark.timestamp, true);
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          const screenshot = await captureScreenshot({
            player,
            videoId,
            timestamp: mark.timestamp,
            generateCaption: mark.withCaption,
            transcript,
            customPrompt,
            label: enableLabel ? {
              text: labelText,
              fontSize: fontSize
            } : null
          });

          // Update UI immediately with this screenshot
          screenshots.push(screenshot);
          setScreenshots(prev => [...prev, screenshot]);
          onScreenshotsTaken([screenshot]);
          setRemainingMarks(prev => prev - 1);

          if (screenshot.captionError) {
            captionErrors = true;
          }

          // Wait 5 seconds after each successful capture before starting the next one
          await new Promise(resolve => setTimeout(resolve, 5000));
          
        } catch (error) {
          console.error(`Failed to capture marked screenshot at ${mark.timestamp}:`, error);
          setError(`Failed to capture screenshot at ${formatTime(mark.timestamp)}: ${error.message}`);
          setRemainingMarks(prev => prev - 1);
        }
      }
      
      // Clear marks only after all processing is done
      if (screenshots.length > 0) {
        setMarkedTimestamps([]); // Clear marks after all captures

        if (captionErrors) {
          setError('Some captions failed to generate. You can regenerate them individually.');
        }
      }
      
    } catch (error) {
      console.error('Failed to capture marked screenshots:', error);
      setError('Failed to capture marked screenshots: ' + error.message);
    } finally {
      setProcessingScreenshot(false);
      if (player) {
        try {
          player.playVideo();
        } catch (e) {
          console.error('Error resuming video:', e);
        }
      }
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
      <ScreenshotGallery
        initialScreenshots={screenshots}
        onScreenshotEdit={onScreenshotEdit}
      />
      <div className="bg-white rounded-lg p-2 sm:p-4 border overflow-hidden">
        <ScreenshotModeSelector 
          screenshotMode={screenshotMode}
          setScreenshotMode={setScreenshotMode}
          processWithCaptions={processWithCaptions}
          setProcessWithCaptions={setProcessWithCaptions}
          onModeChange={handleModeChange}
          isCleaningUp={isCleaningUp}
          onCleanup={handleCleanup}
        />

        <div className="mt-2 sm:mt-4 mb-2 sm:mb-4 space-y-2 sm:space-y-4">
          <LabelControls
            enableLabel={enableLabel}
            setEnableLabel={setEnableLabel}
            labelText={labelText}
            setLabelText={setLabelText}
            fontSize={fontSize}
            setFontSize={setFontSize}
            textColor={textColor}
            setTextColor={setTextColor}
            renderCaptureButton={() => (
              <CaptureControls 
                mode={screenshotMode}
                onCapture={screenshotMode === 'single' ? handleSingleScreenshot : handleBurstScreenshots}
                disabled={!player || isCapturing}
                processing={processingScreenshot}
                burstCount={burstCount}
              />
            )}
          />
        </div>

        {screenshotMode === 'burst' && (
          <BurstModeControls 
            burstCount={burstCount}
            setBurstCount={setBurstCount}
            burstInterval={burstInterval}
            setBurstInterval={setBurstInterval}
          />
        )}

        {screenshotMode === 'mark' && (
          <MarkModeControls 
            markedTimestamps={markedTimestamps}
            onMark={handleMarkForScreenshot}
            onCapture={handleCaptureMarked}
            onClear={() => {
              setMarkedTimestamps([]);
              setRemainingMarks(0);
            }}
            processWithCaptions={processWithCaptions}
            processingScreenshot={processingScreenshot}
            disabled={!player}
            remainingMarks={remainingMarks}
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
import React, { useState } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../config';
import { getContentTypeIcon } from '../utils/iconUtils.jsx';

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
  const [detectedScenes, setDetectedScenes] = useState([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [selectedScenes, setSelectedScenes] = useState(new Set());
  const [isCleaningUp, setIsCleaningUp] = useState(false);

  const formatTime = (seconds) => {
    const date = new Date(seconds * 1000);
    return date.toISOString().substr(11, 8);
  };

  const extractVideoId = (url) => {
    const match = url.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/);
    return match ? match[1] : url;
  };

  const analyzeVideoSegment = async () => {
    if (!player) return;
    
    try {
      setIsAnalyzing(true);
      setError('');
      
      const currentTime = player.getCurrentTime();
      const response = await axios.post(`${API_BASE_URL}/api/analyze-video-frames`, {
        video_id: extractVideoId(videoId),
        start_time: currentTime,
        duration: 30 // Analyze next 30 seconds
      });
      
      setDetectedScenes(response.data.frame_analysis);
      
      // Auto-select scenes with significant changes
      const newSelected = new Set();
      response.data.frame_analysis.forEach((scene, index) => {
        if (scene.scene_change || scene.contains_text || scene.is_slide) {
          newSelected.add(index);
        }
      });
      setSelectedScenes(newSelected);
      
    } catch (error) {
      console.error('Analysis error:', error);
      setError('Failed to analyze video segment: ' + error.message);
    } finally {
      setIsAnalyzing(false);
    }
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
          timestamp
        });
        console.log("Screenshot response:", screenshotResponse.data); // Add debugging
      } catch (error) {
        console.error("Screenshot API error:", error);
        throw error;
      }

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
        console.log("Caption response:", captionResponse.data); // Add debugging
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

  const captureSelectedScenes = async () => {
    if (!player || selectedScenes.size === 0) return;
    
    try {
      setIsCapturing(true);
      setError('');
      player.pauseVideo();
      
      const screenshots = [];
      for (const index of selectedScenes) {
        const scene = detectedScenes[index];
        try {
          const screenshot = await captureScreenshot(scene.timestamp);
          screenshots.push(screenshot);
        } catch (error) {
          console.error(`Failed to capture scene at ${scene.timestamp}:`, error);
        }
      }
      
      if (screenshots.length > 0) {
        onScreenshotsTaken(screenshots);
      }
      
    } catch (error) {
      console.error('Scene capture error:', error);
      setError('Failed to capture selected scenes: ' + error.message);
    } finally {
      setIsCapturing(false);
      setProcessingScreenshot(false);
      player.playVideo();
    }
  };

  const toggleSceneSelection = (index) => {
    const newSelected = new Set(selectedScenes);
    if (newSelected.has(index)) {
      newSelected.delete(index);
    } else {
      newSelected.add(index);
    }
    setSelectedScenes(newSelected);
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

  const handleCleanup = () => {
    setIsCleaningUp(true);
    try {
      setDetectedScenes([]);
      setSelectedScenes(new Set());
      setError('');
      setIsAnalyzing(false);
      setIsCapturing(false);
      setProcessingScreenshot(false);
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
                checked={screenshotMode === 'smart'}
                onChange={() => setScreenshotMode('smart')}
                className="mr-2"
              />
              Smart Detection
            </label>
          </div>
          <button
            onClick={handleCleanup}
            className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 disabled:opacity-50"
            disabled={isCleaningUp || (!detectedScenes.length && !isAnalyzing && !isCapturing)}
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

        {screenshotMode === 'smart' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <button
                onClick={analyzeVideoSegment}
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50"
                disabled={isAnalyzing || !player}
              >
                {isAnalyzing ? 'Analyzing...' : 'Analyze Next 30s'}
              </button>
              
              {detectedScenes.length > 0 && (
                <div className="flex items-center gap-4">
                  <span className="text-sm text-gray-600">
                    {detectedScenes.length} scenes detected
                  </span>
                  <button
                    onClick={captureSelectedScenes}
                    className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 disabled:opacity-50"
                    disabled={isCapturing || selectedScenes.size === 0}
                  >
                    Capture Selected ({selectedScenes.size})
                  </button>
                </div>
              )}
            </div>

            {detectedScenes.length > 0 && (
              <div className="mt-4">
                <h3 className="font-medium mb-2">Detected Scenes:</h3>
                <div className="h-24 bg-gray-100 rounded-lg p-2 relative">
                  {detectedScenes.map((scene, index) => (
                    <div 
                      key={index} 
                      className="absolute transform -translate-y-1/2" 
                      style={{
                        top: '50%',
                        left: `${(scene.timestamp / 30) * 100}%`,
                        zIndex: 10,  // Add z-index
                        pointerEvents: 'auto',  // Ensure clicks are captured
                      }}
                    >
                      <button
                        className={`h-8 w-8 rounded-full cursor-pointer border-2 border-white transition-all duration-200 flex items-center justify-center hover:scale-110 ${
                          selectedScenes.has(index)
                            ? 'ring-2 ring-offset-2 ring-blue-500 scale-110 z-20'  // Increase z-index when selected
                            : 'opacity-75 hover:opacity-100'
                        } ${
                          scene.scene_change
                            ? 'bg-blue-500'
                            : scene.contains_text
                            ? 'bg-green-500'
                            : scene.is_slide
                            ? 'bg-purple-500'
                            : 'bg-gray-400'
                        }`}
                        onClick={() => toggleSceneSelection(index)}
                        title={`${formatTime(scene.timestamp)} - ${
                          scene.scene_change
                            ? 'Scene Change'
                            : scene.contains_text
                            ? 'Text Detected'
                            : scene.is_slide
                            ? 'Slide Detected'
                            : 'Frame'
                        } (Click to ${selectedScenes.has(index) ? 'deselect' : 'select'})`}
                      >
                        {selectedScenes.has(index) && (
                          <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        )}
                      </button>
                    </div>
                  ))}
                </div>
                <div className="flex justify-between text-sm text-gray-500 mt-1">
                  <span>{formatTime(detectedScenes[0]?.timestamp || 0)}</span>
                  <div className="flex gap-4 items-center">
                    <div className="flex gap-2 items-center">
                      <span className="w-3 h-3 rounded-full bg-blue-500"></span>
                      <span>Scene Change</span>
                    </div>
                    <div className="flex gap-2 items-center">
                      <span className="w-3 h-3 rounded-full bg-green-500"></span>
                      <span>Text</span>
                    </div>
                    <div className="flex gap-2 items-center">
                      <span className="w-3 h-3 rounded-full bg-purple-500"></span>
                      <span>Slide</span>
                    </div>
                  </div>
                  <span>{formatTime(detectedScenes[detectedScenes.length - 1]?.timestamp || 0)}</span>
                </div>
              </div>
            )}
          </div>
        )}

        <button
          onClick={
            screenshotMode === 'single'
              ? handleSingleScreenshot
              : screenshotMode === 'burst'
              ? handleBurstScreenshots
              : undefined
          }
          className="w-full bg-green-500 text-white px-4 py-3 rounded-lg hover:bg-green-600 disabled:opacity-50 flex items-center justify-center gap-2 mt-4"
          disabled={
            processingScreenshot ||
            !player ||
            isCapturing ||
            screenshotMode === 'smart'
          }
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

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}
    </div>
  );
};

export default EnhancedScreenshotManager;
import { clearServerState, queryTranscript } from './apiUtils';

export const createScreenshotHandler = (setScreenshots) => (newScreenshots) => {
  setScreenshots(prev => {
    // Process all screenshots to ensure consistent format
    const processed = [...prev, ...newScreenshots].map(screenshot => ({
      ...screenshot,
      timestamp: Number(screenshot.timestamp),
      image: screenshot.image,
      caption: screenshot.caption || '',
      notes: screenshot.notes || '',
      transcriptContext: screenshot.transcriptContext || '',
      content_type: screenshot.content_type || 'other'
    }));
    
    const sorted = processed.sort((a, b) => a.timestamp - b.timestamp);
    
    if (sorted.length > 50) {
      console.warn('More than 50 screenshots, keeping only the most recent ones');
      return sorted.slice(-50);
    }
    return sorted;
  });
};

export const createPromptSubmitHandler = (setScreenshots, setError, currentTime, transcript) => async (prompt) => {
  try {
    const response = await queryTranscript(transcript, prompt);
    
    // Ensure we have a valid response
    if (!response || typeof response.response !== 'string') {
      throw new Error('Invalid response format from server');
    }

    const newScreenshot = {
      timestamp: currentTime,
      type: 'prompt_response',
      prompt: prompt,
      response: response.response, // Use response directly from the response object
      createdAt: new Date().toISOString()
    };

    setScreenshots(prev => [...prev, newScreenshot]);
    return true;
  } catch (error) {
    console.error('Error submitting prompt:', error);
    const errorMessage = error.response?.data?.detail || 
                        error.response?.data?.error ||
                        error.message ||
                        'Unknown error occurred';
    setError('Failed to process prompt: ' + errorMessage);
    return false;
  }
};

export const createAnalysisHandler = (setTranscriptAnalysis, setError, setIsAnalyzing) => async (analysis) => {
  try {
    setIsAnalyzing(true);
    const response = await queryTranscript(analysis, 'Generate a detailed outline');
    
    // Handle different possible response formats
    const analysisText = typeof response === 'string' ? response :
                        response.response || 
                        response.analysis || 
                        '';
                        
    if (!analysisText) {
      throw new Error('No analysis text received from server');
    }

    setTranscriptAnalysis(analysisText);
  } catch (error) {
    console.error('Error analyzing transcript:', error);
    const errorMessage = error.response?.data?.detail || 
                        error.response?.data?.error ||
                        error.message ||
                        'Unknown error occurred';
    setError('Failed to analyze transcript: ' + errorMessage);
  } finally {
    setIsAnalyzing(false);
  }
};

export const createClearDataHandler = (
  setVideoId,
  setScreenshots,
  setNotes,
  setTranscript,
  setTranscriptAnalysis,
  setCustomPrompt,
  setVideoInfo,
  setDetectedScenes,
  setContentTypes,
  eraseFiles
) => async () => {
  if (confirm('Are you sure you want to clear all data?' + 
      (eraseFiles ? '\nThis will also erase local files.' : ''))) {
    await clearServerState(eraseFiles);
    
    const keys = [
      'yt-notes-videoId',
      'yt-notes-screenshots',
      'yt-notes-notes',
      'yt-notes-transcript',
      'yt-notes-transcriptAnalysis',
      'yt-notes-customPrompt',
      'yt-notes-videoInfo',
      'yt-notes-detectedScenes',
      'yt-notes-contentTypes'
    ];
    
    keys.forEach(key => localStorage.removeItem(key));
    
    setVideoId('');
    setScreenshots([]);
    setNotes('');
    setTranscript([]);
    setTranscriptAnalysis('');
    setCustomPrompt('Based on the following transcript context...');
    setVideoInfo(null);
    setDetectedScenes([]);
    setContentTypes(new Set());
  }
};
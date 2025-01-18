import axios from 'axios';
import { API_BASE_URL } from '../../config';

export const formatTime = (seconds) => {
  const date = new Date(seconds * 1000);
  return date.toISOString().substr(11, 8);
};

export const extractVideoId = (url) => {
  const match = url.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/);
  return match ? match[1] : url;
};

export const captureScreenshot = async ({
  player,
  videoId,
  timestamp,
  generateCaption,
  transcript,
  customPrompt,
  onPlayVideo
}) => {
  try {
    if (!player) throw new Error('Player not initialized');
    
    // Pause video and seek
    try {
      player.pauseVideo();
      player.seekTo(timestamp, true);
      await new Promise(resolve => setTimeout(resolve, 1000)); // Wait for frame
    } catch (e) {
      console.error('Error controlling player:', e);
      throw new Error('Failed to control video player');
    }

    let screenshotResponse;
    try {
      screenshotResponse = await axios.post(`${API_BASE_URL}/api/capture-screenshot`, {
        video_id: extractVideoId(videoId),
        timestamp,
        generate_caption: generateCaption
      });
    } catch (error) {
      console.error("Screenshot API error:", error);
      throw error;
    }

    // If captions are disabled, return just the screenshot
    if (!generateCaption) {
      return {
        image: screenshotResponse.data.image_data,
        timestamp,
        caption: '',
        content_type: 'screenshot_only',
        notes: '',
        transcriptContext: ''
      };
    }

    // Set up caption generation with timeout
    const captionPromise = new Promise(async (resolve, reject) => {
      try {
        // Get transcript context
        const contextWindow = 20;
        const relevantTranscript = transcript
          .filter(entry => 
            entry.start >= timestamp - contextWindow &&
            entry.start <= timestamp + contextWindow
          )
          .map(entry => `[${formatTime(entry.start)}] ${entry.text}`)
          .join('\n\n');

        const captionResponse = await axios.post(`${API_BASE_URL}/api/generate-structured-caption`, {
          timestamp,
          image_data: screenshotResponse.data.image_data,
          transcript_context: relevantTranscript,
          prompt: customPrompt
        });

        resolve({
          caption: captionResponse.data.structured_caption,
          content_type: captionResponse.data.content_type,
          transcriptContext: relevantTranscript
        });
      } catch (error) {
        reject(error);
      }
    });

    // Set up timeout
    const timeoutPromise = new Promise((resolve, reject) => {
      setTimeout(() => {
        reject(new Error('Caption generation timed out'));
      }, 15000); // 15 second timeout
    });

    try {
      const captionData = await Promise.race([captionPromise, timeoutPromise]);
      return {
        image: screenshotResponse.data.image_data,
        timestamp,
        ...captionData,
        notes: ''
      };
    } catch (error) {
      console.warn(`Caption generation failed for timestamp ${timestamp}:`, error);
      return {
        image: screenshotResponse.data.image_data,
        timestamp,
        caption: '❌ Caption generation failed - use regenerate option',
        content_type: 'screenshot_only',
        notes: '',
        transcriptContext: '',
        captionError: true
      };
    }

  } finally {
  if (onPlayVideo) {
  try {
      await new Promise(resolve => setTimeout(resolve, 500)); // Wait before resuming
        onPlayVideo();
        } catch (e) {
          console.error('Error resuming video:', e);
        }
      }
    }
  };
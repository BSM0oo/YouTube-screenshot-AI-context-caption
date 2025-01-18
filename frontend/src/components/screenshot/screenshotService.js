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

  } finally {
    if (onPlayVideo) {
      onPlayVideo();
    }
  }
};
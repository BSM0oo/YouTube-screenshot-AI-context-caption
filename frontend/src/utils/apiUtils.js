import axios from 'axios';
import { API_BASE_URL } from '../config';

/**
 * Clear server state and optionally erase files
 * @param {boolean} eraseFiles - Whether to erase local files
 * @returns {Promise<void>}
 */
export const clearServerState = async (eraseFiles) => {
  try {
    await axios.delete(`${API_BASE_URL}/api/state/clear?eraseFiles=${eraseFiles}`);
  } catch (error) {
    console.error('Error clearing state:', error);
    throw error;
  }
};

/**
 * Fetch video transcript
 * @param {string} videoId - YouTube video ID
 * @returns {Promise<Array>} - Array of transcript entries
 */
export const fetchTranscript = async (videoId) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/api/transcript/${videoId}`);
    if (!response.data || !Array.isArray(response.data.transcript)) {
      throw new Error('Invalid transcript format received from server');
    }
    return response.data.transcript;
  } catch (error) {
    console.error('Error fetching transcript:', error);
    throw error;
  }
};

/**
 * Fetch video information
 * @param {string} videoId - YouTube video ID
 * @returns {Promise<Object>} - Video information object
 */
export const fetchVideoInfo = async (videoId) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/api/video-info/${videoId}`);
    if (!response.data) {
      throw new Error('No video information received from server');
    }
    return response.data;
  } catch (error) {
    console.error('Error fetching video info:', error);
    throw error;
  }
};

/**
 * Process transcript query response
 * @param {Object} response - Raw response from server
 * @returns {Object} - Processed response
 */
const processQueryResponse = (response) => {
  if (!response.data) {
    throw new Error('Empty response from server');
  }

  // Handle different response formats
  if (typeof response.data === 'string') {
    return { response: response.data };
  }

  if (typeof response.data.response === 'string') {
    return { response: response.data.response };
  }

  if (typeof response.data === 'object' && response.data.content) {
    return { response: response.data.content };
  }

  throw new Error('Invalid response format from server');
};

/**
 * Analyze transcript with custom prompt
 * @param {Array} transcript - Transcript array
 * @param {string} prompt - Analysis prompt
 * @returns {Promise<Object>} - Analysis response
 */
export const analyzeTranscript = async (transcript, prompt) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/api/query-transcript`, {
      transcript,
      prompt
    });
    return processQueryResponse(response);
  } catch (error) {
    console.error('Error analyzing transcript:', error);
    throw error;
  }
};

/**
 * Query transcript with custom prompt
 * @param {Array} transcript - Transcript array
 * @param {string} prompt - Query prompt
 * @returns {Promise<Object>} - Query response
 */
export const queryTranscript = async (transcript, prompt) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/api/query-transcript`, {
      transcript,
      prompt
    });
    return processQueryResponse(response);
  } catch (error) {
    console.error('Error querying transcript:', error);
    throw error;
  }
};
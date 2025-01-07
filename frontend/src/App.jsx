import React, { useState, useEffect } from 'react';
import axios from 'axios';
import YouTubePlayer from './components/YouTubePlayer';
import ScreenshotManager from './components/ScreenshotManager';
import TranscriptViewer from './components/TranscriptViewer';
import NotesManager from './components/NotesManager';
import ScreenshotGallery from './components/ScreenshotGallery';
import VideoInfoViewer from './components/VideoInfoViewer';
import FullTranscriptViewer from './components/FullTranscriptViewer';
import usePersistedState from './hooks/usePersistedState';
import { API_BASE_URL } from './config';

const printStyles = `
  @media print {
    .main-content {
      display: none !important;
    }
    
    .print-content {
      display: block !important;
    }

    .print-content .whitespace-pre-wrap {
      max-height: none !important;
      overflow: visible !important;
    }

    .page-break {
      break-before: page !important;
    }
  }
`;

const appStyles = `
  .app-container {
    width: 100vw;
    min-height: 100vh;
    overflow-x: hidden;
  }

  .content-container {
    width: 100%;
    max-width: 100vw;
    padding: 1rem;
    margin: 0;
    box-sizing: border-box;
  }

  @media (min-width: 640px) {
    .content-container {
      max-width: 80rem;
      margin: 0 auto;
      padding: 2rem;
    }
  }

  .video-container {
    width: 100%;
    position: relative;
    padding-top: 56.25%; /* 16:9 Aspect Ratio */
  }

  .video-container > div {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
  }
`;

const clearServerState = async (eraseFiles) => {
  try {
    await axios.delete(`${API_BASE_URL}/api/state/clear?eraseFiles=${eraseFiles}`);
  } catch (error) {
    console.error('Error clearing state:', error);
  }
};

const App = () => {
  // State management with persistence
  const [videoId, setVideoId] = usePersistedState('videoId', '');
  const [screenshots, setScreenshots] = usePersistedState('screenshots', []);
  const [notes, setNotes] = usePersistedState('notes', '');
  const [transcript, setTranscript] = usePersistedState('transcript', []);
  const [transcriptAnalysis, setTranscriptAnalysis] = usePersistedState('transcriptAnalysis', '');
  const [customPrompt, setCustomPrompt] = usePersistedState('customPrompt', 
    'Based on the following transcript context...'
  );
  const [videoInfo, setVideoInfo] = usePersistedState('videoInfo', null);

  // UI state (no persistence needed)
  const [player, setPlayer] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [currentTime, setCurrentTime] = useState(0);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isPrinting, setIsPrinting] = useState(false);
  const [eraseFiles, setEraseFiles] = useState(() => 
    localStorage.getItem('eraseFilesOnClear') === 'true'
  );

  // Add styles to head
  useEffect(() => {
    const style = document.createElement('style');
    style.innerHTML = printStyles + appStyles;
    document.head.appendChild(style);
    return () => document.head.removeChild(style);
  }, []);

  useEffect(() => {
    localStorage.setItem('eraseFilesOnClear', eraseFiles);
  }, [eraseFiles]);

  useEffect(() => {
    if (player) {
      const interval = setInterval(() => {
        try {
          const time = player.getCurrentTime();
          setCurrentTime(time);
        } catch (error) {
          console.error('Error getting current time:', error);
        }
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [player]);

  const extractVideoId = (url) => {
    const match = url.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/);
    return match ? match[1] : url;
  };

  const handleVideoSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setScreenshots([]);
    setVideoInfo(null);
    
    try {
      const id = extractVideoId(videoId);
      if (id) {
        if (player) {
          player.loadVideoById(id);
        }

        const [transcriptResponse, videoInfoResponse] = await Promise.all([
          axios.get(`${API_BASE_URL}/api/transcript/${id}`),
          axios.get(`${API_BASE_URL}/api/video-info/${id}`)
        ]);

        setTranscript(transcriptResponse.data.transcript);
        setVideoInfo(videoInfoResponse.data);
      }
    } catch (error) {
      setError('Error loading video: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handlePlayerReady = (ytPlayer) => {
    setPlayer(ytPlayer);
  };

  const clearStoredData = async () => {
    if (confirm('Are you sure you want to clear all data?' + 
        (eraseFiles ? '\nThis will also erase local files.' : ''))) {
      await clearServerState(eraseFiles);
      setVideoId('');
      setScreenshots([]);
      setNotes('');
      setTranscript([]);
      setTranscriptAnalysis('');
      setCustomPrompt('Based on the following transcript context...');
      setVideoInfo(null);
    }
  };

  return (
    <div className="app-container bg-gray-50">
      <div className="content-container">
        <div className="flex flex-col w-full mb-4">
          <div className="flex flex-col sm:flex-row justify-between items-start w-full">
            <div className="flex flex-col w-full sm:w-auto">
              <h1 className="text-2xl sm:text-3xl font-bold">YouTube Notes App</h1>
              {videoInfo?.title && (
                <div className="mt-3 bg-blue-50 border-l-4 border-blue-500 pl-4 py-2 pr-3 rounded-r-lg w-full sm:w-auto">
                  <h2 className="text-xl sm:text-2xl font-semibold text-blue-900 leading-tight">
                    {videoInfo.title}
                  </h2>
                </div>
              )}
            </div>
            <div className="flex items-center gap-4 mt-4 sm:mt-0 w-full sm:w-auto">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={eraseFiles}
                  onChange={(e) => setEraseFiles(e.target.checked)}
                  className="form-checkbox h-4 w-4 text-blue-600"
                />
                <span className="text-sm text-gray-600">Erase local files on clear</span>
              </label>
              <button
                onClick={clearStoredData}
                className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
              >
                Clear All Data
              </button>
            </div>
          </div>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4 w-full">
            {error}
          </div>
        )}
        
        <form onSubmit={handleVideoSubmit} className="mb-4 w-full">
          <div className="flex flex-col sm:flex-row gap-2">
            <input
              type="text"
              value={videoId}
              onChange={(e) => setVideoId(e.target.value)}
              placeholder="Enter YouTube Video URL"
              className="flex-1 p-2 border rounded text-sm sm:text-base w-full"
            />
            <button 
              type="submit" 
              className="w-full sm:w-auto bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50"
              disabled={loading}
            >
              {loading ? 'Loading...' : 'Load Video'}
            </button>
          </div>
        </form>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 w-full">
          <div className="space-y-4 w-full">
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
            
            <ScreenshotManager
              videoId={videoId}
              player={player}
              transcript={transcript}
              onScreenshotsTaken={(newScreenshots) => 
                setScreenshots(prev => [...prev, ...newScreenshots])
              }
              customPrompt={customPrompt}
            />

            <div className="flex items-center justify-between w-full">
              <button
                onClick={() => setShowPrompt(!showPrompt)}
                className="text-gray-600 hover:text-gray-800"
              >
                {showPrompt ? 'Hide Caption Prompt' : 'Show Caption Prompt'}
              </button>
            </div>

            {showPrompt && (
              <div className="bg-white rounded-lg p-4 border w-full">
                <h2 className="text-lg font-bold mb-4">Caption Generation Prompt</h2>
                <textarea
                  value={customPrompt}
                  onChange={(e) => setCustomPrompt(e.target.value)}
                  className="w-full h-32 p-2 border rounded mb-2"
                  placeholder="Enter custom prompt for caption generation..."
                />
              </div>
            )}
          </div>

          <div className="space-y-4 w-full">
            <NotesManager
              videoId={videoId}
              videoTitle={videoInfo?.title}
              videoDescription={videoInfo?.description}
              notes={notes}
              onNotesChange={setNotes}
              screenshots={screenshots}
              transcriptAnalysis={transcriptAnalysis}
              transcript={transcript}
            />

            <div className="flex justify-between items-center mb-2 w-full">
              <h2 className="text-xl font-bold">Transcript</h2>
              {transcript.length > 0 && (
                <button
                  onClick={async () => {
                    try {
                      const fullTranscript = transcript
                        .map(item => `[${new Date(item.start * 1000).toISOString().substr(11, 8)}] ${item.text}`)
                        .join('\n');
                      
                      if (navigator.clipboard && window.isSecureContext) {
                        await navigator.clipboard.writeText(fullTranscript);
                      } else {
                        const textArea = document.createElement("textarea");
                        textArea.value = fullTranscript;
                        textArea.style.position = "fixed";
                        textArea.style.left = "-999999px";
                        document.body.appendChild(textArea);
                        textArea.focus();
                        textArea.select();
                        try {
                          document.execCommand('copy');
                        } catch (err) {
                          console.error('Fallback: Oops, unable to copy', err);
                          alert('Copy failed! Please try selecting and copying the text manually.');
                          return;
                        }
                        document.body.removeChild(textArea);
                      }
                      alert('Transcript copied to clipboard!');
                    } catch (err) {
                      console.error('Failed to copy:', err);
                      alert('Failed to copy transcript. Please try again or copy manually.');
                    }
                  }}
                  className="bg-gray-500 hover:bg-gray-600 text-white px-3 py-1 rounded text-sm"
                >
                  Copy Transcript
                </button>
              )}
            </div>

            <TranscriptViewer
              transcript={transcript}
              currentTime={currentTime}
              onTimeClick={(time) => player?.seekTo(time, true)}
              onAnalysisGenerated={setTranscriptAnalysis}
            />
          </div>
        </div>

        <div className="w-full mt-8">
          <ScreenshotGallery
            screenshots={screenshots}
            onScreenshotsUpdate={setScreenshots}
            customPrompt={customPrompt}
          />
        </div>

        {transcriptAnalysis && (
          <div className="bg-white rounded-lg p-6 border mt-8 w-full">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Generated Transcript Outline</h2>
              <button
                onClick={() => setTranscriptAnalysis('')}
                className="text-red-500 hover:text-red-700"
              >
                Clear Outline
              </button>
            </div>
            <div className="prose max-w-none whitespace-pre-wrap">
              {transcriptAnalysis}
            </div>
          </div>
        )}

        <div className="w-full mt-8">
          <VideoInfoViewer videoInfo={videoInfo} />
        </div>
        
        <div className="w-full mt-8">
          <FullTranscriptViewer transcript={transcript} />
        </div>
      </div>
    </div>
  );
};

export default App;
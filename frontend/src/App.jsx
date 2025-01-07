import React, { useState, useEffect } from 'react';
import axios from 'axios';
import YouTubePlayer from './components/YouTubePlayer';
import ScreenshotManager from './components/ScreenshotManager';
import TranscriptViewer from './components/TranscriptViewer';
import NotesManager from './components/NotesManager';
import ScreenshotGallery from './components/ScreenshotGallery';
import VideoInfoViewer from './components/VideoInfoViewer';
import FullTranscriptViewer from './components/FullTranscriptViewer';
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

const clearServerState = async (eraseFiles) => {
  try {
    await axios.delete(`${API_BASE_URL}/api/state/clear?eraseFiles=${eraseFiles}`);
  } catch (error) {
    console.error('Error clearing state:', error);
  }
};

const App = () => {
  const [videoId, setVideoId] = useState('');
  const [screenshots, setScreenshots] = useState([]);
  const [notes, setNotes] = useState('');
  const [transcript, setTranscript] = useState([]);
  const [transcriptAnalysis, setTranscriptAnalysis] = useState('');
  const [customPrompt, setCustomPrompt] = useState(
    'Based on the following transcript context...'
  );

  const [player, setPlayer] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [currentTime, setCurrentTime] = useState(0);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isPrinting, setIsPrinting] = useState(false);
  const [eraseFiles, setEraseFiles] = useState(() => 
    localStorage.getItem('eraseFilesOnClear') === 'true'
  );
  const [videoInfo, setVideoInfo] = useState(null);

  useEffect(() => {
    localStorage.setItem('eraseFilesOnClear', eraseFiles);
  }, [eraseFiles]);

  useEffect(() => {
    const style = document.createElement('style');
    style.innerHTML = printStyles;
    document.head.appendChild(style);
    return () => document.head.removeChild(style);
  }, []);

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
    }
  };

    return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-2 sm:px-4 py-4 sm:py-8">
        <div className="flex flex-col mb-4 sm:mb-8">
          <div className="flex justify-between items-start">
            <div className="flex flex-col">
              <h1 className="text-2xl sm:text-3xl font-bold">YouTube Notes App</h1>
              {videoInfo?.title && (
                <div className="mt-3 bg-blue-50 border-l-4 border-blue-500 pl-4 py-2 pr-3 rounded-r-lg">
                  <h2 className="text-xl sm:text-2xl font-semibold text-blue-900 leading-tight">
                    {videoInfo.title}
                  </h2>
                </div>
              )}
            </div>
            <div className="flex items-center gap-4">
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
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}
        
        <form onSubmit={handleVideoSubmit} className="mb-4 sm:mb-8">
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-4">
            <input
              type="text"
              value={videoId}
              onChange={(e) => setVideoId(e.target.value)}
              placeholder="Enter YouTube Video URL"
              className="flex-1 p-2 border rounded text-sm sm:text-base"
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

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-8 mb-8">
          <div className="space-y-4">
            <div className="aspect-video bg-black rounded-lg overflow-hidden w-full">
              {videoId && (
                <YouTubePlayer 
                  videoId={videoId}
                  onPlayerReady={handlePlayerReady}
                />
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

            <div className="flex items-center justify-between">
              <button
                onClick={() => setShowPrompt(!showPrompt)}
                className="text-gray-600 hover:text-gray-800"
              >
                {showPrompt ? 'Hide Caption Prompt' : 'Show Caption Prompt'}
              </button>
            </div>

            {showPrompt && (
              <div className="bg-white rounded-lg p-4 border">
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

          <div className="space-y-4">
            // Find the NotesManager component in App.jsx and update its props:

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

            <div className="flex justify-between items-center mb-2">
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

        <ScreenshotGallery
          screenshots={screenshots}
          onScreenshotsUpdate={setScreenshots}
          customPrompt={customPrompt}
        />

        {transcriptAnalysis && (
          <div className="bg-white rounded-lg p-6 border mt-8">
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

        <VideoInfoViewer videoInfo={videoInfo} />
        
        <FullTranscriptViewer transcript={transcript} />
      </div>
    </div>
  );
};

export default App;
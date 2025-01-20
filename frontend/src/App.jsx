import React, { useState, useEffect } from 'react';
import usePersistedState from './hooks/usePersistedState';
import useNearBottom from './hooks/useNearBottom';
import MainLayout from './layouts/MainLayout';
import VideoSection from './features/video/VideoSection';
import EnhancedScreenshotManager from './components/screenshot/EnhancedScreenshotManager';
import EnhancedScreenshotGallery from './components/EnhancedScreenshotGallery_New';
import TranscriptViewer from './components/TranscriptViewer';
import NotesManager from './components/NotesManager';
import VideoInfoViewer from './components/VideoInfoViewer';
import FullTranscriptViewer from './components/FullTranscriptViewer';
import ReactMarkdown from 'react-markdown';
import TranscriptPrompt from './components/TranscriptPrompt';
import SaveContentButton from './components/SaveContentButton';
import { createScreenshotHandler, createPromptSubmitHandler, createAnalysisHandler, createClearDataHandler } from './utils/handlers';
import ScreenshotsHeader from './features/screenshots/ScreenshotsHeader';


const App = () => {
  const isNearBottom = useNearBottom();
  const [isFullWidth, setIsFullWidth] = useState(false);
  
  // Enhanced state management with persistence
  const [videoId, setVideoId] = usePersistedState('yt-notes-videoId', '');
  const [screenshots, setScreenshots] = usePersistedState('yt-notes-screenshots', []);
  const [notes, setNotes] = usePersistedState('yt-notes-notes', '');
  const [transcript, setTranscript] = usePersistedState('yt-notes-transcript', []);
  const [transcriptAnalysis, setTranscriptAnalysis] = usePersistedState('yt-notes-transcriptAnalysis', '');
  const [customPrompt, setCustomPrompt] = usePersistedState('yt-notes-customPrompt', 
    'Based on the following transcript context...'
  );
  const [videoInfo, setVideoInfo] = usePersistedState('yt-notes-videoInfo', null);
  
  // New state for scene detection and content organization
  const [detectedScenes, setDetectedScenes] = usePersistedState('yt-notes-detectedScenes', []);
  const [contentTypes, setContentTypes] = usePersistedState('yt-notes-contentTypes', new Set());

  // UI state (no persistence needed)
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [currentTime, setCurrentTime] = useState(0);
  const [player, setPlayer] = useState(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isPrinting, setIsPrinting] = useState(false);
  const [eraseFiles, setEraseFiles] = useState(() => 
    localStorage.getItem('eraseFilesOnClear') === 'true'
  );
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isTranscriptVisible, setIsTranscriptVisible] = useState(true);
  const [isMainContentVisible, setIsMainContentVisible] = useState(true);
  const [outlinePosition, setOutlinePosition] = usePersistedState('yt-notes-outlinePosition', 'after');
  const [sortOldestFirst, setSortOldestFirst] = usePersistedState('yt-notes-sortOldestFirst', false);
  const [groupByType, setGroupByType] = usePersistedState('yt-notes-groupByType', false);
  

  useEffect(() => {
    localStorage.setItem('eraseFilesOnClear', eraseFiles);
  }, [eraseFiles]);

  const handleScreenshotsTaken = createScreenshotHandler(setScreenshots);
  const handlePromptSubmit = createPromptSubmitHandler(setScreenshots, setError, currentTime, transcript);
  const handleAnalysisGenerated = createAnalysisHandler(setTranscriptAnalysis, setError, setIsAnalyzing);
  const clearStoredData = createClearDataHandler(
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
  );

  return (
    <MainLayout isFullWidth={isFullWidth} videoInfo={videoInfo} error={error}>
      {isMainContentVisible && (
        <>
          <VideoSection 
            videoId={videoId}
            setVideoId={setVideoId}
            setTranscript={setTranscript}
            setVideoInfo={setVideoInfo}
            isFullWidth={isFullWidth}
            setIsFullWidth={setIsFullWidth}
            onClearData={clearStoredData}
            eraseFiles={eraseFiles}
            setEraseFiles={setEraseFiles}
            setError={setError}
            setPlayer={setPlayer}
            player={player}
            currentTime={currentTime}
          />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-2 sm:gap-4 w-full">
            <div className="space-y-4 flex flex-col">
              <div>
                <EnhancedScreenshotManager
                  videoId={videoId}
                  player={player}
                  transcript={transcript}
                  onScreenshotsTaken={handleScreenshotsTaken}
                  customPrompt={customPrompt}
                  detectedScenes={detectedScenes}
                  onScenesDetected={setDetectedScenes}
                />
              </div>
            </div>

            <div className="h-full space-y-4">
              <div className="bg-white rounded-lg p-4 border">
                <div className="flex flex-col gap-4">
                  <div className="flex justify-between items-center">
                    <h2 className="text-xl font-bold">Transcript Controls</h2>
                    {transcript.length > 0 && (
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleAnalysisGenerated(transcript)}
                          className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-sm"
                          disabled={isAnalyzing}
                        >
                          {isAnalyzing ? 'Generating...' : 'Generate Outline'}
                        </button>
                        <button
                          onClick={() => setIsTranscriptVisible(!isTranscriptVisible)}
                          className="bg-orange-500 hover:bg-orange-600 text-white px-3 py-1 rounded text-sm"
                        >
                          {isTranscriptVisible ? 'Hide Transcript' : 'Show Transcript'}
                        </button>
                      </div>
                    )}
                  </div>
                  {transcript.length > 0 && (
                    <TranscriptPrompt onSubmit={handlePromptSubmit} />
                  )}
                </div>
              </div>

              {isTranscriptVisible && (
                <TranscriptViewer
                  transcript={transcript}
                  currentTime={currentTime}
                  onTimeClick={(time) => player?.seekTo(time)}
                  onAnalysisGenerated={handleAnalysisGenerated}
                  className="bg-white rounded-lg h-[600px] overflow-auto"
                />
              )}

              <div className="mt-4">
                <NotesManager
                  title="Notes & Export Options"
                  showButtonText={isNotesVisible => 
                    isNotesVisible ? 'Hide Notes & Export Options' : 'Show Notes & Export Options'
                  }
                  videoId={videoId}
                  videoTitle={videoInfo?.title}
                  videoDescription={videoInfo?.description}
                  notes={notes}
                  onNotesChange={setNotes}
                  screenshots={screenshots}
                  transcriptAnalysis={transcriptAnalysis}
                  transcript={transcript}
                />
              </div>
            </div>
          </div>
        </>
      )}

      <div className="mt-8">
        <ScreenshotsHeader
          isMainContentVisible={isMainContentVisible}
          setIsMainContentVisible={setIsMainContentVisible}
          outlinePosition={outlinePosition}
          setOutlinePosition={setOutlinePosition}
          sortOldestFirst={sortOldestFirst}
          setSortOldestFirst={setSortOldestFirst}
          groupByType={groupByType}
          setGroupByType={setGroupByType}
          onEditCaptions={() => {
            // Implementation for editing captions
            console.log('Edit captions');
          }}
          onReorderScreenshots={() => {
            // Implementation for reordering screenshots
            console.log('Reorder screenshots');
          }}
        />
        {outlinePosition === 'before' && transcriptAnalysis && (
          <div className="bg-white rounded-lg p-6 border mb-8 w-full">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Generated Transcript Outline</h2>
              <button
                onClick={() => setTranscriptAnalysis('')}
                className="text-red-500 hover:text-red-700"
              >
                Clear Outline
              </button>
            </div>
            <div className="prose prose-lg max-w-none">
              <ReactMarkdown
                components={{
                  ul: ({node, ...props}) => (
                    <ul className="list-disc pl-4 space-y-1 mb-4" {...props} />
                  ),
                  li: ({node, ...props}) => (
                    <li className="ml-4" {...props} />
                  ),
                  h2: ({node, ...props}) => (
                    <h2 className="text-lg font-bold mt-4 mb-2" {...props} />
                  ),
                  p: ({node, ...props}) => (
                    <p className="mb-4" {...props} />
                  ),
                  strong: ({node, ...props}) => (
                    <strong className="font-bold" {...props} />
                  )
                }}
              >
                {transcriptAnalysis}
              </ReactMarkdown>
            </div>
          </div>
        )}
        <EnhancedScreenshotGallery
          screenshots={screenshots}
          onScreenshotsUpdate={setScreenshots}
          customPrompt={customPrompt}
          videoTitle={videoInfo?.title}
          transcript={transcript}
          isMainContentVisible={isMainContentVisible}
          setIsMainContentVisible={setIsMainContentVisible}
        />
      </div>

      {outlinePosition === 'after' && transcriptAnalysis && (
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
          <div className="prose prose-lg max-w-none">
            <ReactMarkdown
              components={{
                ul: ({node, ...props}) => (
                  <ul className="list-disc pl-4 space-y-1 mb-4" {...props} />
                ),
                li: ({node, ...props}) => (
                  <li className="ml-4" {...props} />
                ),
                h2: ({node, ...props}) => (
                  <h2 className="text-lg font-bold mt-4 mb-2" {...props} />
                ),
                p: ({node, ...props}) => (
                  <p className="mb-4" {...props} />
                ),
                strong: ({node, ...props}) => (
                  <strong className="font-bold" {...props} />
                )
              }}
            >
              {transcriptAnalysis}
            </ReactMarkdown>
          </div>
        </div>
      )}

      <div className="w-full mt-8">
        <VideoInfoViewer videoInfo={videoInfo} />
      </div>
      
      <div className="w-full mt-8">
        <FullTranscriptViewer transcript={transcript} />
      </div>

      {isNearBottom && (
        <SaveContentButton
          screenshots={screenshots}
          videoInfo={videoInfo}
          transcriptAnalysis={transcriptAnalysis}
          transcript={transcript}
          disabled={!videoId || screenshots.length === 0}
        />
      )}
    </MainLayout>
  );
};

export default App;
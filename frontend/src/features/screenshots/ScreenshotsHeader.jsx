import React from 'react';
import ScreenshotsMenu from './ScreenshotsMenu';

const ScreenshotsHeader = ({
  videoId,
  videoTitle,
  isMainContentVisible,
  setIsMainContentVisible,
  outlinePosition,
  setOutlinePosition,
  sortOldestFirst,
  setSortOldestFirst,
  groupByType,
  setGroupByType,
  isTranscriptControlsVisible,
  setIsTranscriptControlsVisible,
  isNotesOptionsVisible,
  setIsNotesOptionsVisible,
  onEditCaptions,
  onReorderScreenshots
}) => {
  return (
    <div className="flex justify-between items-center mb-4">
      <div className="flex flex-col">
        <div className="bg-blue-50 border-l-4 border-blue-500 pl-4 py-2 pr-3 rounded-r-lg">
          <h2 className="text-xl sm:text-2xl font-semibold text-blue-900 leading-tight">{videoTitle}</h2>
          {videoId && (
            <a
              href={`https://www.youtube.com/watch?v=${videoId}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-blue-800 hover:text-blue-600 mt-1 block"
            >
              youtube.com/watch?v={videoId}
            </a>
          )}
        </div>
      </div>
      
      <ScreenshotsMenu 
        isMainContentVisible={isMainContentVisible}
        setIsMainContentVisible={setIsMainContentVisible}
        outlinePosition={outlinePosition}
        setOutlinePosition={setOutlinePosition}
        sortOldestFirst={sortOldestFirst}
        setSortOldestFirst={setSortOldestFirst}
        groupByType={groupByType}
        setGroupByType={setGroupByType}
        isTranscriptControlsVisible={isTranscriptControlsVisible}
        setIsTranscriptControlsVisible={setIsTranscriptControlsVisible}
        isNotesOptionsVisible={isNotesOptionsVisible}
        setIsNotesOptionsVisible={setIsNotesOptionsVisible}
        onEditCaptions={onEditCaptions}
        onReorderScreenshots={onReorderScreenshots}
      />
    </div>
  );
};

export default ScreenshotsHeader;
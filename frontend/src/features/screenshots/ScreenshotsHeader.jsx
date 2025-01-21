import React from 'react';
import ScreenshotsMenu from './ScreenshotsMenu';

const ScreenshotsHeader = ({
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
      <h2 className="text-2xl font-bold">Screenshots & Notes</h2>
      
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
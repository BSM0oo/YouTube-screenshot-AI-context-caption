import React from 'react';

const ScreenshotModeSelector = ({
  screenshotMode,
  setScreenshotMode,
  processWithCaptions,
  setProcessWithCaptions,
  onModeChange,
  isCleaningUp,
  onCleanup
}) => {
  const handleModeChange = (mode) => {
    setScreenshotMode(mode);
    if (onModeChange) {
      onModeChange(mode);
    }
  };

  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 sm:gap-4 mb-2 sm:mb-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4 w-full sm:w-auto">
        <div className="grid grid-cols-2 sm:flex gap-2 sm:gap-4 w-full sm:w-auto">
          <label className="flex items-center">
            <input
              type="radio"
              checked={screenshotMode === 'single'}
              onChange={() => handleModeChange('single')}
              className="mr-2"
            />
            Single Screenshot
          </label>
          <label className="flex items-center">
            <input
              type="radio"
              checked={screenshotMode === 'burst'}
              onChange={() => handleModeChange('burst')}
              className="mr-2"
            />
            Burst Mode
          </label>
          <label className="flex items-center">
            <input
              type="radio"
              checked={screenshotMode === 'gif'}
              onChange={() => handleModeChange('gif')}
              className="mr-2"
            />
            GIF Mode
          </label>
          <label className="flex items-center">
            <input
              type="radio"
              checked={screenshotMode === 'mark'}
              onChange={() => handleModeChange('mark')}
              className="mr-2"
            />
            Mark Mode
          </label>
        </div>
        <div className="h-5 border-l border-gray-300"></div>
        <label className="flex items-center">
          <input
            type="checkbox"
            checked={processWithCaptions}
            onChange={(e) => setProcessWithCaptions(e.target.checked)}
            className="mr-2 rounded text-blue-600 border-gray-300 focus:ring-blue-500"
          />
          Generate Captions
        </label>
      </div>
      <button
        onClick={onCleanup}
        className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 disabled:opacity-50"
        disabled={isCleaningUp}
      >
        {isCleaningUp ? 'Cleaning...' : 'Cleanup'}
      </button>
    </div>
  );
};

export default ScreenshotModeSelector;
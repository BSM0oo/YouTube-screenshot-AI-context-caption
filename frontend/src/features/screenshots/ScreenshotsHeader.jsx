import React from 'react';

const ScreenshotsHeader = ({
  isMainContentVisible,
  setIsMainContentVisible,
  outlinePosition,
  setOutlinePosition
}) => {
  return (
    <div className="flex justify-between items-center mb-4">
      <h2 className="text-2xl font-bold">Screenshots & Notes</h2>
      
      <div className="flex items-center gap-4">
        {/* Outline Position Toggle */}
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600">Outline Position:</span>
          <select
            value={outlinePosition}
            onChange={(e) => setOutlinePosition(e.target.value)}
            className="bg-white border border-gray-300 rounded px-2 py-1 text-sm"
          >
            <option value="before">Before Screenshots</option>
            <option value="after">After Screenshots</option>
          </select>
        </div>

        {/* Show/Hide Main Content Button */}
        <button
          onClick={() => setIsMainContentVisible(!isMainContentVisible)}
          className="flex items-center gap-2 bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded"
        >
          {isMainContentVisible ? (
            <>
              <span>Hide Video & Transcript</span>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
              </svg>
            </>
          ) : (
            <>
              <span>Show Video & Transcript</span>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default ScreenshotsHeader;
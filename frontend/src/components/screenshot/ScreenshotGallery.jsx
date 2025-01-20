import React from 'react';
import { useScreenshots } from './useScreenshots';

const ScreenshotGallery = ({ initialScreenshots = [], onScreenshotEdit }) => {
  const {
    screenshots,
    currentPage,
    totalPages,
    isLoading,
    addScreenshots,
    nextPage,
    previousPage,
    goToPage
  } = useScreenshots(initialScreenshots);

  // Render pagination controls
  const renderPagination = () => {
    if (totalPages <= 1) return null;

    return (
      <div className="flex justify-center items-center gap-4 mt-4">
        <button
          onClick={previousPage}
          disabled={currentPage === 1}
          className={`px-4 py-2 rounded ${
            currentPage === 1 
              ? 'bg-gray-300 cursor-not-allowed' 
              : 'bg-blue-500 hover:bg-blue-600 text-white'
          }`}
        >
          Previous
        </button>
        <span className="text-sm">
          Page {currentPage} of {totalPages}
        </span>
        <button
          onClick={nextPage}
          disabled={currentPage === totalPages}
          className={`px-4 py-2 rounded ${
            currentPage === totalPages
              ? 'bg-gray-300 cursor-not-allowed'
              : 'bg-blue-500 hover:bg-blue-600 text-white'
          }`}
        >
          Next
        </button>
      </div>
    );
  };

  return (
    <div className="w-full">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {screenshots.map((screenshot, index) => (
          <div key={index} className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="relative aspect-video">
              <img
                src={screenshot.image}
                alt={`Screenshot ${index + 1}`}
                className="w-full h-full object-cover"
                loading="lazy"
              />
              <div className="absolute bottom-0 right-0 bg-black bg-opacity-50 text-white px-2 py-1 text-sm">
                {formatTime(screenshot.timestamp)}
              </div>
            </div>
            <div className="p-4">
              {!screenshot.captionDisabled && screenshot.caption && screenshot.caption.trim() && (
                <div className="prose max-w-none">
                  {screenshot.caption.split('\n')
                    .filter(line => line.trim())
                    .map((line, i) => (
                      <p key={i} className="mb-2">{line}</p>
                    ))}
                </div>
              )}
              {!screenshot.captionDisabled && screenshot.captionError && (
                <div className="text-red-500">❌ Caption generation failed - use regenerate option</div>
              )}
              {screenshot.notes && (
                <div className="mt-2 text-sm text-gray-600">{screenshot.notes}</div>
              )}
              {onScreenshotEdit && (
                <button
                  onClick={() => onScreenshotEdit(index)}
                  className="mt-2 text-blue-500 hover:text-blue-600"
                >
                  Edit
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
      {isLoading && (
        <div className="flex justify-center items-center mt-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        </div>
      )}
      {renderPagination()}
    </div>
  );
};

const formatTime = (seconds) => {
  const date = new Date(seconds * 1000);
  const hours = date.getUTCHours();
  const minutes = date.getUTCMinutes();
  const secs = date.getUTCSeconds();
  
  if (hours > 0) {
    return `${hours}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  }
  return `${minutes}:${String(secs).padStart(2, '0')}`;
};

export default ScreenshotGallery;
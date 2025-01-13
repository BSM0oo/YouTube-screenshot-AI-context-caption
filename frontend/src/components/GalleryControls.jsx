import React from 'react';

const GalleryControls = ({
  videoTitle,
  sortAscending,
  groupByType,
  editMode,
  onSortToggle,
  onGroupToggle,
  onEditToggle
}) => {
  return (
    <div className="space-y-8">
      {videoTitle && (
        <h1 className="text-2xl font-bold text-gray-800">{videoTitle}</h1>
      )}
      
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 sm:gap-0">
        <h2 className="text-2xl font-bold">Screenshots & Notes</h2>
        <div className="flex gap-2 w-full sm:w-auto">
          <button
            onClick={onSortToggle}
            className="flex-1 sm:flex-none text-xs sm:text-sm border border-gray-300 hover:border-gray-400 bg-white hover:bg-gray-50 text-gray-800 hover:text-gray-900 px-2 sm:px-3 py-1 rounded"
          >
            {sortAscending ? '↑ Oldest First' : '↓ Newest First'}
          </button>
          <button
            onClick={onGroupToggle}
            className="flex-1 sm:flex-none text-xs sm:text-sm border border-gray-300 hover:border-gray-400 bg-white hover:bg-gray-50 text-gray-600 hover:text-gray-800 px-2 sm:px-3 py-1 rounded"
          >
            {groupByType ? 'Show Chronological' : 'Group by Type'}
          </button>
          <button
            onClick={onEditToggle}
            className="flex-1 sm:flex-none text-xs sm:text-sm border border-gray-300 hover:border-gray-400 bg-white hover:bg-gray-50 text-gray-600 hover:text-gray-800 px-2 sm:px-3 py-1 rounded"
          >
            {editMode ? 'Save Changes' : 'Edit Captions'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default GalleryControls;
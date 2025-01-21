import React from 'react';

const GalleryControls = ({
  videoTitle,
  sortAscending,
  groupByType,
  editMode,
  reorderMode,
  onSortToggle,
  onGroupToggle,
  onEditToggle,
  onReorderToggle,
  isMainContentVisible,
  setIsMainContentVisible
}) => {
  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">Screenshots & Notes</h2>
      </div>
      
      {/* Reorder Mode Instructions */}
      {reorderMode && (
        <div className="w-full bg-green-50 border border-green-200 rounded-lg p-4">
          <h3 className="text-green-800 font-medium mb-2 flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Reorder Mode Active
          </h3>
          <ul className="text-green-700 text-sm space-y-1">
            <li>• Click and drag the ⋮⋮ handle in the top-left corner of any screenshot to reorder</li>
            <li>• Drag screenshots up or down to change their order</li>
            <li>• Click 'Done Reordering' when finished</li>
            <li>• Note: Prompt responses cannot be reordered</li>
          </ul>
        </div>
      )}
    </div>
  );
};

export default GalleryControls;
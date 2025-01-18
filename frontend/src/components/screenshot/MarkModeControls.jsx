import React from 'react';
import { Button } from '@/components/ui/button';

const MarkModeControls = ({
  markedTimestamps,
  onMark,
  onCapture,
  onClear,
  processWithCaptions,
  processingScreenshot,
  disabled
}) => {
  return (
    <div className="space-y-4">
      <Button
        onClick={onMark}
        className="w-full bg-blue-500 hover:bg-blue-600 text-white"
        disabled={processingScreenshot || disabled}
      >
        Mark for Screenshot {processWithCaptions ? '+ Caption' : 'Only'}
      </Button>
      
      {markedTimestamps.length > 0 && (
        <div className="space-y-4">
          <div className="text-sm text-gray-600">
            {markedTimestamps.length} timestamp{markedTimestamps.length !== 1 ? 's' : ''} marked
          </div>
          <Button
            onClick={onCapture}
            className="w-full bg-green-500 hover:bg-green-600 text-white"
            disabled={processingScreenshot || disabled}
          >
            Capture All Marked Screenshots
          </Button>
          <Button
            onClick={onClear}
            className="w-full bg-red-500 hover:bg-red-600 text-white"
            disabled={processingScreenshot}
          >
            Clear Marked Timestamps
          </Button>
        </div>
      )}
    </div>
  );
};

export default MarkModeControls;
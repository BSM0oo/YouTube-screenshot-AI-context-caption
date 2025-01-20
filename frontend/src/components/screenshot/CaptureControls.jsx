import React from 'react';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

const CaptureControls = ({
  mode,
  onCapture,
  disabled,
  processing,
  burstCount,
  screenshotMode
}) => {
  const getButtonText = () => {
    if (processing) {
      return mode === 'burst' ? 'Capturing Screenshots...' : 'Processing Screenshot...';
    }
    if (screenshotMode === 'mark') {
      return 'Use Mark Controls';
    }
    if (screenshotMode === 'gif') {
      return 'Use GIF Controls';
    }
    if (mode === 'burst') {
      return `Take ${burstCount} Screenshots`;
    }
    return 'Take Screenshot';
  };

  return (
    <Button
      onClick={onCapture}
      className="min-w-[180px] bg-green-500 text-white hover:bg-green-600 disabled:bg-gray-300"
      disabled={disabled}
    >
      {processing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
      {getButtonText()}
    </Button>
  );
};

export default CaptureControls;
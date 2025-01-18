import React from 'react';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

const CaptureControls = ({
  mode,
  onCapture,
  disabled,
  processing,
  burstCount
}) => {
  return (
    <Button
      onClick={onCapture}
      className="w-full bg-green-500 text-white hover:bg-green-600 mt-4"
      disabled={disabled || processing}
    >
      {processing ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          {mode === 'burst' ? 'Capturing Screenshots...' : 'Processing Screenshot...'}
        </>
      ) : mode === 'single' ? (
        'Take Screenshot'
      ) : (
        `Take ${burstCount} Screenshots`
      )}
    </Button>
  );
};

export default CaptureControls;
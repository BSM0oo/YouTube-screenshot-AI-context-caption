import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';
// Using window.alert instead of toast for simplicity
// TODO: Implement proper toast functionality later

const GifCaptureManager = ({ videoId, currentTime, onGifCaptured }) => {
  const [isCapturing, setIsCapturing] = useState(false);
  const [duration, setDuration] = useState(3);
  const [fps, setFps] = useState(10);
  // Removed toast for now

  const handleCaptureGif = async () => {
    if (!videoId) {
      window.alert(
        "Error: No video loaded"
      );
      return;
    }

    try {
      setIsCapturing(true);
      const response = await fetch('/api/capture-gif', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          video_id: videoId,
          start_time: currentTime,
          duration: parseFloat(duration),
          fps: parseInt(fps),
          width: 480, // Fixed width for consistency
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to capture GIF');
      }

      const data = await response.json();
      onGifCaptured(data.gif_data, currentTime);
      
      window.alert(
        "GIF captured successfully"
      );
    } catch (error) {
      console.error('Error capturing GIF:', error);
      window.alert(
        "Error: Failed to capture GIF"
      );
    } finally {
      setIsCapturing(false);
    }
  };

  return (
    <Card className="w-full">
      <CardContent className="pt-6">
        <div className="space-y-4">
          <div className="flex flex-col space-y-2">
            <Label htmlFor="duration">Duration (seconds)</Label>
            <Input
              id="duration"
              type="number"
              min="1"
              max="10"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              className="w-full"
            />
          </div>

          <div className="flex flex-col space-y-2">
            <Label htmlFor="fps">Frames per second</Label>
            <Input
              id="fps"
              type="number"
              min="5"
              max="30"
              value={fps}
              onChange={(e) => setFps(e.target.value)}
              className="w-full"
            />
          </div>

          <Button
            onClick={handleCaptureGif}
            disabled={isCapturing}
            className="w-full"
          >
            {isCapturing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Capturing GIF...
              </>
            ) : (
              'Capture GIF'
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default GifCaptureManager;
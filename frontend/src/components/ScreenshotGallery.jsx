import React, { useState } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../config';

const ScreenshotGallery = ({
  screenshots,
  onScreenshotsUpdate,
  customPrompt
}) => {
  const [visibleNotes, setVisibleNotes] = useState({});
  const [processingScreenshot, setProcessingScreenshot] = useState(false);
  const [error, setError] = useState('');

  const formatTime = (seconds) => {
    const date = new Date(seconds * 1000);
    return date.toISOString().substr(11, 8);
  };

  const toggleNotes = (index) => {
    setVisibleNotes(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  const regenerateCaption = async (screenshotIndex) => {
    try {
      setProcessingScreenshot(true);
      const screenshot = screenshots[screenshotIndex];
      
      const response = await axios.post(`${API_BASE_URL}/api/generate-caption`, {
        timestamp: screenshot.timestamp,
        image_data: screenshot.image,
        transcript_context: screenshot.transcriptContext,
        prompt: customPrompt
      });

      const updatedScreenshots = [...screenshots];
      updatedScreenshots[screenshotIndex] = {
        ...screenshot,
        caption: response.data.caption
      };
      onScreenshotsUpdate(updatedScreenshots);
    } catch (error) {
      setError('Error regenerating caption: ' + error.message);
    } finally {
      setProcessingScreenshot(false);
    }
  };

  const updateScreenshotNotes = (index, notes) => {
    const updatedScreenshots = [...screenshots];
    updatedScreenshots[index] = {
      ...screenshots[index],
      notes
    };
    onScreenshotsUpdate(updatedScreenshots);
  };

  const updateScreenshotCaption = (index, caption) => {
    const updatedScreenshots = [...screenshots];
    updatedScreenshots[index] = {
      ...screenshots[index],
      caption
    };
    onScreenshotsUpdate(updatedScreenshots);
  };

  return (
    <div className="space-y-4">
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {screenshots.map((screenshot, index) => (
        <div key={index} className="bg-white border rounded-lg p-4">
          <h3 className="font-bold text-xl mb-4">Screenshot {index + 1}</h3>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="relative">
              <img 
                src={screenshot.image} 
                alt={`Screenshot ${index + 1}`}
                className="w-full rounded"
              />
              <p className="text-sm text-gray-600 mt-2">
                Timestamp: {formatTime(screenshot.timestamp)}
              </p>
            </div>
            <div className="space-y-4">
              <div>
                <h4 className="font-medium mb-2">Caption:</h4>
                <textarea
                  value={screenshot.caption || ''}
                  onChange={(e) => updateScreenshotCaption(index, e.target.value)}
                  className="w-full p-2 border rounded min-h-[12rem] lg:min-h-[8rem] max-h-[20rem] h-auto resize-y"
                  placeholder="Screenshot caption..."
                />
                <button
                  onClick={() => regenerateCaption(index)}
                  disabled={processingScreenshot}
                  className="mt-2 text-sm bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 disabled:opacity-50"
                >
                  Regenerate Caption
                </button>
              </div>
              <div>
                <div className="flex justify-between items-center">
                  <button
                    onClick={() => toggleNotes(index)}
                    className="text-indigo-600 hover:text-indigo-800 font-medium"
                  >
                    {visibleNotes[index] ? 'Hide Notes' : 'Add Notes'}
                  </button>
                </div>
                {visibleNotes[index] && (
                  <textarea
                    value={screenshot.notes || ''}
                    onChange={(e) => updateScreenshotNotes(index, e.target.value)}
                    placeholder="Add notes for this screenshot..."
                    className="w-full p-2 border rounded h-32 mt-2"
                  />
                )}
              </div>
              <div>
                <h4 className="font-medium mb-2">Context:</h4>
                <p className="text-sm text-gray-700 italic">
                  {screenshot.transcriptContext}
                </p>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ScreenshotGallery;
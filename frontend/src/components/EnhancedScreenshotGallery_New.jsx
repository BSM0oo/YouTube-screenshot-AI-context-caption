import React, { useState } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../config';
import DraggableGalleryGrid from './DraggableGalleryGrid';
import GalleryControls from './GalleryControls';

const EnhancedScreenshotGallery = ({
  screenshots,
  onScreenshotsUpdate,
  customPrompt,
  videoTitle,
  isMainContentVisible,
  setIsMainContentVisible
}) => {
  const [processingScreenshot, setProcessingScreenshot] = useState(false);
  const [error, setError] = useState('');
  const [editMode, setEditMode] = useState(false);
  const [groupByType, setGroupByType] = useState(false);
  const [expandedScreenshot, setExpandedScreenshot] = useState(null);
  const [sortAscending, setSortAscending] = useState(true);
  const [reorderMode, setReorderMode] = useState(false);

  const regenerateCaption = async (index) => {
    try {
      setProcessingScreenshot(true);
      const screenshot = screenshots[index];
      
      const response = await axios.post(`${API_BASE_URL}/api/generate-structured-caption`, {
        timestamp: screenshot.timestamp,
        image_data: screenshot.image,
        transcript_context: screenshot.transcriptContext,
        prompt: customPrompt
      });

      const updatedScreenshots = [...screenshots];
      updatedScreenshots[index] = {
        ...screenshot,
        caption: response.data.structured_caption,
        content_type: response.data.content_type
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

  const updatePromptResponse = (index, updatedPromptResponse) => {
    const updatedScreenshots = [...screenshots];
    updatedScreenshots[index] = {
      ...screenshots[index],
      ...updatedPromptResponse
    };
    onScreenshotsUpdate(updatedScreenshots);
  };

  const deleteScreenshot = (index) => {
    const updatedScreenshots = screenshots.filter((_, i) => i !== index);
    onScreenshotsUpdate(updatedScreenshots);
  };

  const sortScreenshots = (shots) => {
    return [...shots].sort((a, b) => {
      const timeA = a.timestamp || 0;
      const timeB = b.timestamp || 0;
      return sortAscending ? timeA - timeB : timeB - timeA;
    });
  };

  const groupScreenshotsByType = () => {
    const groups = {};
    const sortedShots = sortScreenshots(screenshots);
    sortedShots.forEach((screenshot, index) => {
      const type = screenshot.type === 'prompt_response' ? 'prompt_response' : (screenshot.content_type || 'other');
      if (!groups[type]) {
        groups[type] = [];
      }
      groups[type].push({ ...screenshot, originalIndex: index });
    });
    return groups;
  };

  if (!screenshots.length) return null;

  const groupedScreenshots = groupByType ? groupScreenshotsByType() : null;

  return (
    <div className="space-y-8 print:space-y-4 print:mx-0 print:w-full print:max-w-full">
      <div className="print:fixed print:top-0 print:right-4 print:text-sm print:text-gray-500">
        {new Date().toLocaleDateString()}
      </div>
      <GalleryControls
        videoTitle={videoTitle}
        sortAscending={sortAscending}
        groupByType={groupByType}
        editMode={editMode}
        reorderMode={reorderMode}
        onSortToggle={() => setSortAscending(!sortAscending)}
        onGroupToggle={() => setGroupByType(!groupByType)}
        onEditToggle={() => setEditMode(!editMode)}
        onReorderToggle={() => setReorderMode(!reorderMode)}
        isMainContentVisible={isMainContentVisible}
        setIsMainContentVisible={setIsMainContentVisible}
      />

      <DraggableGalleryGrid
        screenshots={sortScreenshots(screenshots)}
        groupByType={groupByType}
        reorderMode={reorderMode}
        groupedScreenshots={groupedScreenshots}
        editMode={editMode}
        expandedScreenshot={expandedScreenshot}
        onUpdateNotes={updateScreenshotNotes}
        onUpdateCaption={updateScreenshotCaption}
        onRegenerateCaption={regenerateCaption}
        onDeleteScreenshot={deleteScreenshot}
        onUpdatePromptResponse={updatePromptResponse}
        setExpandedScreenshot={setExpandedScreenshot}
        onReorderScreenshots={onScreenshotsUpdate}
      />

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}
    </div>
  );
};

export default EnhancedScreenshotGallery;
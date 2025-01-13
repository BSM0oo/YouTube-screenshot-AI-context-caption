import React from 'react';
import { getContentTypeIcon } from '../utils/iconUtils.jsx';
import ScreenshotCard from './ScreenshotCard';
import PromptResponseCard from './PromptResponseCard';

const GalleryGrid = ({
  screenshots,
  groupByType,
  groupedScreenshots,
  editMode,
  expandedScreenshot,
  onUpdateNotes,
  onUpdateCaption,
  onRegenerateCaption,
  onDeleteScreenshot,
  onUpdatePromptResponse,
  setExpandedScreenshot
}) => {
  return (
    <>
      {groupByType ? (
        // Grouped view
        Object.entries(groupedScreenshots).map(([type, typeScreenshots]) => (
          <div key={type} className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              {type !== 'prompt_response' && getContentTypeIcon(type)}
              <h3 className="text-xl font-semibold capitalize">
                {type === 'prompt_response' ? 'Prompt Responses' : type}
              </h3>
              <span className="text-gray-500">({typeScreenshots.length})</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {typeScreenshots.map(({ originalIndex, ...screenshot }) => (
                screenshot.type === 'prompt_response' ? (
                  <PromptResponseCard
                    key={originalIndex}
                    screenshot={screenshot}
                    editMode={editMode}
                    index={originalIndex}
                    onUpdatePromptResponse={onUpdatePromptResponse}
                  />
                ) : (
                  <ScreenshotCard
                    key={originalIndex}
                    screenshot={screenshot}
                    index={originalIndex}
                    editMode={editMode}
                    onUpdateNotes={onUpdateNotes}
                    onUpdateCaption={onUpdateCaption}
                    onRegenerateCaption={onRegenerateCaption}
                    onDeleteScreenshot={onDeleteScreenshot}
                    expanded={expandedScreenshot === originalIndex}
                    onToggleExpand={() => setExpandedScreenshot(
                      expandedScreenshot === originalIndex ? null : originalIndex
                    )}
                  />
                )
              ))}
            </div>
          </div>
        ))
      ) : (
        // Chronological view
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {screenshots.map((screenshot, index) => (
            screenshot.type === 'prompt_response' ? (
              <PromptResponseCard
                key={index}
                screenshot={screenshot}
                editMode={editMode}
                index={index}
                onUpdatePromptResponse={onUpdatePromptResponse}
              />
            ) : (
              <ScreenshotCard
                key={index}
                screenshot={screenshot}
                index={index}
                editMode={editMode}
                onUpdateNotes={onUpdateNotes}
                onUpdateCaption={onUpdateCaption}
                onRegenerateCaption={onRegenerateCaption}
                onDeleteScreenshot={onDeleteScreenshot}
                expanded={expandedScreenshot === index}
                onToggleExpand={() => setExpandedScreenshot(
                  expandedScreenshot === index ? null : index
                )}
              />
            )
          ))}
        </div>
      )}
    </>
  );
};

export default GalleryGrid;
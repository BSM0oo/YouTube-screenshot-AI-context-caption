import React from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { getContentTypeIcon } from '../utils/iconUtils.jsx';
import ScreenshotCard from './ScreenshotCard';
import PromptResponseCard from './PromptResponseCard';

const DraggableGalleryGrid = ({
  reorderMode,
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
  setExpandedScreenshot,
  onReorderScreenshots
}) => {
  const handleDragEnd = (result) => {
    // Drop outside the list
    if (!result.destination) {
      return;
    }

    // Reorder the screenshots array
    const startIndex = result.source.index;
    const endIndex = result.destination.index;
    
    if (startIndex === endIndex) {
      return;
    }

    const newScreenshots = Array.from(screenshots);
    const [removed] = newScreenshots.splice(startIndex, 1);
    newScreenshots.splice(endIndex, 0, removed);

    onReorderScreenshots(newScreenshots);
  };

  if (groupByType) {
    // For now, disable drag and drop in grouped view
    return (
      <div className="print:mx-0 print:w-full print:max-w-none print:p-0">
        {Object.entries(groupedScreenshots).map(([type, typeScreenshots]) => (
          <div key={type} className="mb-8 print:mb-4">
            <div className="flex items-center gap-2 mb-4 print:mb-2">
              {type !== 'prompt_response' && getContentTypeIcon(type)}
              <h3 className="text-xl font-semibold capitalize print:text-lg">
                {type === 'prompt_response' ? 'Prompt Responses' : type}
              </h3>
              <span className="text-gray-500">({typeScreenshots.length})</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 print:block print:space-y-8 print:w-full">
              {typeScreenshots.map(({ originalIndex, ...screenshot }) => (
                screenshot.type === 'prompt_response' ? (
                  <PromptResponseCard
                    key={originalIndex}
                    screenshot={screenshot}
                    index={originalIndex}
                    onUpdatePromptResponse={onUpdatePromptResponse}
                    onDeletePromptResponse={onDeleteScreenshot}
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
        ))}
      </div>
    );
  }

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <Droppable droppableId="screenshots">
        {(provided, snapshot) => (
          <div 
            {...provided.droppableProps}
            ref={provided.innerRef}
            className={`grid grid-cols-1 md:grid-cols-2 gap-8 print:block print:space-y-8 print:w-full ${snapshot.isDraggingOver ? 'bg-blue-50/50 rounded-lg p-4' : ''}`}
          >
            {screenshots.map((screenshot, index) => (
              <Draggable 
                key={`${screenshot.timestamp}-${index}`} 
                draggableId={`${screenshot.timestamp}-${index}`} 
                index={index}
                isDragDisabled={!reorderMode || screenshot.type === 'prompt_response'}
              >
                {(provided, draggableSnapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                    className={`${draggableSnapshot.isDragging ? 'opacity-75 rotate-1' : ''}`}
                    style={{
                      ...provided.draggableProps.style,
                      transition: draggableSnapshot.isDragging ? 'none' : 'all 0.2s',
                      transform: draggableSnapshot.isDragging 
                        ? `${provided.draggableProps.style.transform} rotate(1deg)` 
                        : provided.draggableProps.style.transform
                    }}
                  >
                    <div className="relative">
                      {/* Visual indicator for drag handle */}
                      {reorderMode && screenshot.type !== 'prompt_response' && (
                        <div className="absolute top-2 left-2 z-10 bg-black/50 text-white px-2 py-1 rounded text-sm print:hidden">
                          Drag to reorder
                        </div>
                      )}
                      {screenshot.type === 'prompt_response' ? (
                        <PromptResponseCard
                          screenshot={screenshot}
                          editMode={editMode}
                          index={index}
                          onUpdatePromptResponse={onUpdatePromptResponse}
                          onDeletePromptResponse={onDeleteScreenshot}
                        />
                      ) : (
                        <ScreenshotCard
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
                      )}
                    </div>
                  </div>
                )}
              </Draggable>
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </DragDropContext>
  );
};

export default DraggableGalleryGrid;
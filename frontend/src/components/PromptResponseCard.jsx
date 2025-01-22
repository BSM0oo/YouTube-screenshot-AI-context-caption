import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';

const PromptResponseCard = ({ screenshot, index, onUpdatePromptResponse, onDeletePromptResponse }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [tempPrompt, setTempPrompt] = useState(screenshot.prompt);
  const [tempResponse, setTempResponse] = useState(screenshot.response);

  const handleSave = () => {
    onUpdatePromptResponse(index, {
      ...screenshot,
      prompt: tempPrompt,
      response: tempResponse
    });
    setIsEditing(false);
  };

  const handleCancel = () => {
    setTempPrompt(screenshot.prompt);
    setTempResponse(screenshot.response);
    setIsEditing(false);
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="p-6 space-y-4">
        {isEditing ? (
          <>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Query:</label>
              <textarea
                value={tempPrompt}
                onChange={(e) => setTempPrompt(e.target.value)}
                className="w-full min-h-[80px] p-3 border rounded-md resize-y text-sm font-sans"
                placeholder="Enter your query..."
              />
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Response:</label>
              <textarea
                value={tempResponse}
                onChange={(e) => setTempResponse(e.target.value)}
                className="w-full min-h-[200px] p-3 border rounded-md resize-y text-sm font-sans"
                placeholder="Enter the response..."
              />
            </div>
            <div className="flex justify-end space-x-2 mt-4">
              <button
                onClick={handleCancel}
                className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="px-3 py-1 text-sm bg-blue-500 text-white rounded-md hover:bg-blue-600"
              >
                Save Changes
              </button>
            </div>
          </>
        ) : (
          <>
            <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
              <p className="text-blue-800 font-medium">Query:</p>
              <p className="text-blue-900">{screenshot.prompt}</p>
            </div>
            <div className="prose prose-sm max-w-none">
              <div className="markdown-content">
                <ReactMarkdown
                  components={{
                    ul: ({node, ...props}) => (
                      <ul className="list-disc pl-4 space-y-1 mb-4" {...props} />
                    ),
                    li: ({node, ...props}) => (
                      <li className="ml-4" {...props} />
                    ),
                    h2: ({node, ...props}) => (
                      <h2 className="text-lg font-bold mt-4 mb-2" {...props} />
                    ),
                    p: ({node, ...props}) => (
                      <p className="mb-4" {...props} />
                    ),
                    strong: ({node, ...props}) => (
                      <strong className="font-bold" {...props} />
                    )
                  }}
                >
                  {screenshot.response}
                </ReactMarkdown>
              </div>
            </div>
              <div className="flex items-center gap-4 mt-4 print:hidden">
              <button
              onClick={() => {
              if (window.confirm('Are you sure you want to delete this query?')) {
              onDeletePromptResponse(index);
              }
              }}
              className="text-red-600 hover:text-red-800"
              >
              Delete
              </button>
                <button
                  onClick={() => setIsEditing(!isEditing)}
                  className="text-gray-600 hover:text-gray-800"
                >
                  {isEditing ? 'Save Changes' : 'Edit'}
                </button>
              </div>
        </>
      )}
      </div>
    </div>
  );
};

export default PromptResponseCard;
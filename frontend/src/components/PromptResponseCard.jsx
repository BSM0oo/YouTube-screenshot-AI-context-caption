import React from 'react';
import ReactMarkdown from 'react-markdown';

const PromptResponseCard = ({ screenshot, editMode, index, onUpdatePromptResponse }) => {
  const handleUpdate = (field, value) => {
    onUpdatePromptResponse(index, {
      ...screenshot,
      [field]: value
    });
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="p-6 space-y-4">
        {editMode ? (
          <>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Query:</label>
              <textarea
                value={screenshot.prompt}
                onChange={(e) => handleUpdate('prompt', e.target.value)}
                className="w-full min-h-[80px] p-3 border rounded-md resize-y text-sm font-sans"
                placeholder="Enter your query..."
              />
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Response:</label>
              <textarea
                value={screenshot.response}
                onChange={(e) => handleUpdate('response', e.target.value)}
                className="w-full min-h-[200px] p-3 border rounded-md resize-y text-sm font-sans"
                placeholder="Enter the response..."
              />
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
          </>
        )}
      </div>
    </div>
  );
};

export default PromptResponseCard;
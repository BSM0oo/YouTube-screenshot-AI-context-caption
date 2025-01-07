import React, { useState } from 'react';

const FullTranscriptViewer = ({ transcript }) => {
  const [isVisible, setIsVisible] = useState(false);

  if (!transcript || transcript.length === 0) return null;

  const formattedTranscript = transcript
    .map(item => {
      const time = new Date(item.start * 1000).toISOString().substr(11, 8);
      return `[${time}] ${item.text}`;
    })
    .join('\n');

  return (
    <div className="bg-white rounded-lg p-6 border mt-8 print:block">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Full Transcript</h2>
        <button
          onClick={() => setIsVisible(!isVisible)}
          className="text-gray-600 hover:text-gray-800 print:hidden"
        >
          {isVisible ? 'Hide Transcript' : 'Show Transcript'}
        </button>
      </div>

      {(isVisible || true) && ( // Always render content for printing
        <div className={`prose max-w-none ${!isVisible ? 'hidden print:block' : ''}`}>
          <pre className="whitespace-pre-wrap font-sans text-gray-700 leading-relaxed">
            {formattedTranscript}
          </pre>
        </div>
      )}
    </div>
  );
};

export default FullTranscriptViewer;
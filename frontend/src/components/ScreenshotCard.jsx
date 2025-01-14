import React, { useState } from 'react';
import { getContentTypeIcon } from '../utils/iconUtils.jsx';
import ReactMarkdown from 'react-markdown';

const ScreenshotCard = ({
  screenshot,
  index,
  editMode,
  onUpdateNotes,
  onUpdateCaption,
  onRegenerateCaption,
  onDeleteScreenshot,
  expanded,
  onToggleExpand
}) => {
  const [showNotes, setShowNotes] = useState(false);
  const [showTranscript, setShowTranscript] = useState(false); // Default to hiding transcript

  const parseStructuredCaption = (caption) => {
    try {
      const parts = caption.split('\n\n').filter(Boolean);
      return {
        topic: parts[0]?.replace('TOPIC HEADING: ', '').trim(),
        context: parts[1]?.replace('CONTEXT: ', '').trim(),
        points: parts[2]?.replace('KEY POINTS: ', '')
          .split('\n')
          .filter(point => point.trim())
          .map(point => point.trim().replace(/^[•-]\s*/, ''))
      };
    } catch (error) {
      console.error('Error parsing caption:', error);
      return { topic: '', context: '', points: [] };
    }
  };

  const formatTranscript = (transcriptContext) => {
    if (!transcriptContext) return 'No transcript context available';
    return transcriptContext
      .split('\n')
      .map(line => line.trim())
      .filter(Boolean)
      .join(' ');
  };

  const { topic, context, points } = parseStructuredCaption(screenshot.caption);

  return (
    <div className={`bg-white rounded-lg shadow-md overflow-hidden print:w-full print:max-w-none ${expanded ? 'col-span-2' : ''}`}>
      <div className="relative">
        <img 
          src={screenshot.image} 
          alt={`Screenshot ${index + 1}`}
          className={`w-full object-cover print:object-contain print:max-w-full ${expanded ? 'max-h-[600px]' : 'max-h-[300px]'}`}
          onClick={onToggleExpand}
          loading="lazy"
        />
        <div className="absolute top-2 right-2 bg-black/50 text-white px-2 py-1 rounded text-sm print:text-black print:bg-transparent">
          {new Date(screenshot.timestamp * 1000).toISOString().substr(11, 8)}
        </div>
        {screenshot.content_type && (
          <div className="absolute top-2 left-2">
            {getContentTypeIcon(screenshot.content_type)}
          </div>
        )}
      </div>
      
      <div className="p-6 space-y-4 print:p-4">
        {editMode ? (
          <textarea
            value={screenshot.caption}
            onChange={(e) => onUpdateCaption(index, e.target.value)}
            className="w-full min-h-[200px] p-3 border rounded-md resize-y text-sm font-sans"
            placeholder="Caption text..."
          />
        ) : (
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-gray-900">{topic}</h3>
            {context && (
              <p className="text-gray-600 print:text-gray-800">{context}</p>
            )}
            <ul className="space-y-2">
              {points?.map((point, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="text-blue-500 mt-1 print:text-black">•</span>
                  <span className="print:text-black">{point}</span>
                </li>
              ))}
            </ul>
            {showTranscript && screenshot.transcriptContext && (
              <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200 print:bg-white print:border-gray-300">
                <h4 className="text-sm font-medium text-gray-700 mb-2">Transcript Context:</h4>
                <p className="text-sm text-gray-600 font-sans print:text-gray-800">
                  {formatTranscript(screenshot.transcriptContext)}
                </p>
              </div>
            )}
          </div>
        )}
        
        <div className="flex flex-wrap items-center gap-4 print:hidden">
          <button
            onClick={() => setShowNotes(!showNotes)}
            className="text-gray-600 hover:text-gray-800"
          >
            {showNotes ? 'Hide Notes' : 'Show Notes'}
          </button>
          {screenshot.transcriptContext && (
            <button
              onClick={() => setShowTranscript(!showTranscript)}
              className="text-gray-600 hover:text-gray-800"
            >
              {showTranscript ? 'Hide Transcript' : 'Show Transcript'}
            </button>
          )}
          <button
            onClick={() => onRegenerateCaption(index)}
            className="text-gray-600 hover:text-gray-800"
          >
            Regenerate Caption
          </button>
          <button
            onClick={() => {
              if (window.confirm('Are you sure you want to delete this screenshot?')) {
                onDeleteScreenshot(index);
              }
            }}
            className="text-red-600 hover:text-red-800"
          >
            Delete
          </button>

        </div>

        {showNotes && (
          <textarea
            value={screenshot.notes || ''}
            onChange={(e) => onUpdateNotes(index, e.target.value)}
            placeholder="Add notes..."
            className="w-full min-h-[100px] p-3 border rounded-md resize-y print:hidden"
          />
        )}
      </div>
    </div>
  );
};

export default ScreenshotCard;
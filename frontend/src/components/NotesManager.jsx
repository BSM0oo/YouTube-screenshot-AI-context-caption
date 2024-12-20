import React, { useState } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../config';

const NotesManager = ({
  videoId,
  notes,
  onNotesChange,
  screenshots,
  transcriptAnalysis
}) => {
  const [showNotes, setShowNotes] = useState(true);
  const [isPrinting, setIsPrinting] = useState(false);
  const [error, setError] = useState('');

  const formatTime = (seconds) => {
    const date = new Date(seconds * 1000);
    return date.toISOString().substr(11, 8);
  };

  const handlePrint = () => {
    setIsPrinting(true);
    setTimeout(() => {
      window.print();
      setIsPrinting(false);
    }, 100);
  };

  const exportNotes = async (format = 'markdown') => {
    try {
      let content = `# Video Notes: ${videoId}\n\n`;
      content += `${notes}\n\n`;
      
      screenshots.forEach((screenshot, index) => {
        content += `## Screenshot ${index + 1}\n`;
        content += `![Screenshot ${index + 1}](${screenshot.image})\n\n`;
        content += `**Timestamp:** ${formatTime(screenshot.timestamp)}\n\n`;
        content += `**Caption:** ${screenshot.caption}\n\n`;
        
        const cleanContext = screenshot.transcriptContext
          .split('\n\n')
          .map(line => line.replace(/\[\d{2}:\d{2}:\d{2}\]\s*/, ''))
          .join(' ')
          .trim();
        
        content += `**Context:** ${cleanContext}\n\n`;
        
        if (screenshot.notes) {
          content += `**Notes:** ${screenshot.notes}\n\n`;
        }
        content += '---\n\n';
      });

      if (transcriptAnalysis) {
        content += `## Generated Transcript Outline\n\n${transcriptAnalysis}\n\n`;
      }

      if (format === 'markdown') {
        const blob = new Blob([content], { type: 'text/markdown' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'notes.md';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      } else if (format === 'html') {
        const htmlContent = `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Video Notes: ${videoId}</title>
            <style>
              body { 
                font-family: system-ui, -apple-system, sans-serif;
                line-height: 1.6;
                max-width: 800px;
                margin: 0 auto;
                padding: 2rem;
              }
              img { max-width: 100%; height: auto; }
              hr { margin: 2rem 0; }
            </style>
          </head>
          <body>
            ${content.replace(/\n/g, '<br>')
                     .replace(/^# (.*)/gm, '<h1>$1</h1>')
                     .replace(/^## (.*)/gm, '<h2>$1</h2>')
                     .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                     .replace(/!\[(.*?)\]\((.*?)\)/g, '<img src="$2" alt="$1">')}
          </body>
          </html>
        `;

        const blob = new Blob([htmlContent], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'notes.html';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }
    } catch (error) {
      setError('Error exporting notes: ' + error.message);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-bold">Global Notes</h2>
        <button
          onClick={() => setShowNotes(!showNotes)}
          className="text-gray-600 hover:text-gray-800"
        >
          {showNotes ? 'Hide Notes' : 'Show Notes'}
        </button>
      </div>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}
      
      {showNotes && (
        <div className="bg-white rounded-lg p-4 border">
          <textarea
            value={notes}
            onChange={(e) => onNotesChange(e.target.value)}
            placeholder="Add your notes here..."
            className="w-full h-40 p-2 border rounded"
          />
          <div className="flex flex-col sm:flex-row gap-2 mt-4">
            <button
              onClick={() => exportNotes('markdown')}
              className="w-full sm:flex-1 bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-600 text-sm sm:text-base"
            >
              Export as Markdown
            </button>
            <button
              onClick={() => exportNotes('html')}
              className="w-full sm:flex-1 bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-600 text-sm sm:text-base"
            >
              Save as HTML
            </button>
            <button
              onClick={handlePrint}
              className="w-full sm:flex-1 bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-600 text-sm sm:text-base"
            >
              Print / Save as PDF
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotesManager;
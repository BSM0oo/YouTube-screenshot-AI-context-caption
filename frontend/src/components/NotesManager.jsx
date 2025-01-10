import React, { useState, useEffect } from 'react';
import { generateExportContent } from '../utils/exportUtils';
import '../styles/ExportStyles.css';

const NotesManager = ({
  title = "Notes & Export Options",
  showButtonText = (isVisible) => isVisible ? 'Hide Notes & Export Options' : 'Show Notes & Export Options',
  videoId,
  videoTitle,
  videoDescription,
  notes,
  onNotesChange,
  screenshots,
  transcriptAnalysis,
  transcript
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isPrinting, setIsPrinting] = useState(false);
  const [error, setError] = useState('');
  const [exportData, setExportData] = useState(null);

  // Prepare export data whenever props change
  useEffect(() => {
    setExportData({
      videoTitle,
      videoId,
      videoDescription,
      notes,
      screenshots: screenshots || [],
      transcriptAnalysis,
      transcript
    });
  }, [videoTitle, videoId, videoDescription, notes, screenshots, transcriptAnalysis, transcript]);

  const handleExport = async (format = 'markdown') => {
    try {
      if (!exportData) {
        throw new Error('No data available for export');
      }

      const content = generateExportContent({
        ...exportData,
        format
      });

      const mimeTypes = {
        markdown: 'text/markdown',
        html: 'text/html'
      };

      const extensions = {
        markdown: 'md',
        html: 'html'
      };

      const blob = new Blob([content], { type: mimeTypes[format] });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${exportData.videoTitle || 'video'}_notes.${extensions[format]}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Export error:', error);
      setError('Error exporting notes: ' + error.message);
    }
  };

  const handlePrint = () => {
    setIsPrinting(true);
    
    try {
      const printContent = generateExportContent({
        ...exportData,
        format: 'html'
      });

      // Create print iframe
      const printFrame = document.createElement('iframe');
      printFrame.style.position = 'fixed';
      printFrame.style.right = '0';
      printFrame.style.bottom = '0';
      printFrame.style.width = '0';
      printFrame.style.height = '0';
      printFrame.style.border = 'none';
      
      document.body.appendChild(printFrame);
      
      // Write content to iframe
      printFrame.contentDocument.write(printContent);
      printFrame.contentDocument.close();

      // Wait for all images to load before printing
      Promise.all(
        Array.from(printFrame.contentDocument.images)
          .map(img => {
            if (img.complete) return Promise.resolve();
            return new Promise(resolve => {
              img.onload = resolve;
              img.onerror = resolve;
            });
          })
      ).then(() => {
        printFrame.contentWindow.print();
        
        // Cleanup after print
        setTimeout(() => {
          document.body.removeChild(printFrame);
          setIsPrinting(false);
        }, 500);
      });
    } catch (error) {
      console.error('Print error:', error);
      setError('Error preparing print layout: ' + error.message);
      setIsPrinting(false);
    }
  };

  return (
    <div className="bg-white rounded-lg p-4 border">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">{title}</h2>
        <button
          onClick={() => setIsVisible(!isVisible)}
          className="text-gray-600 hover:text-gray-800"
        >
          {showButtonText(isVisible)}
        </button>
      </div>
      
      {isVisible && (
        <div className="space-y-4">
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
              <span className="block sm:inline">{error}</span>
              <button
                onClick={() => setError('')}
                className="absolute top-0 right-0 px-4 py-3"
              >
                ×
              </button>
            </div>
          )}
          
          <div className="bg-white rounded-lg p-6 border shadow-sm">
            <textarea
              value={notes}
              onChange={(e) => onNotesChange(e.target.value)}
              placeholder="Add your notes here..."
              className="w-full h-40 p-3 border rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-shadow duration-200"
            />
            
            <div className="flex flex-col sm:flex-row gap-3 mt-6">
              <button
                onClick={() => handleExport('markdown')}
                disabled={isPrinting}
                className="flex-1 bg-purple-500 text-white px-6 py-3 rounded-md hover:bg-purple-600 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isPrinting ? 'Processing...' : 'Export as Markdown'}
              </button>
              
              <button
                onClick={() => handleExport('html')}
                disabled={isPrinting}
                className="flex-1 bg-purple-500 text-white px-6 py-3 rounded-md hover:bg-purple-600 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isPrinting ? 'Processing...' : 'Export as HTML'}
              </button>
              
              <button
                onClick={handlePrint}
                disabled={isPrinting}
                className="flex-1 bg-purple-500 text-white px-6 py-3 rounded-md hover:bg-purple-600 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isPrinting ? 'Preparing PDF...' : 'Save as PDF'}
              </button>
            </div>
            
            <p className="mt-4 text-sm text-gray-600">
              Note: PDF export will open your system print dialog. Select "Save as PDF" option.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotesManager;
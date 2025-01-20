import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Loader2, Save } from "lucide-react";

const SaveContentButton = ({
  screenshots,
  videoInfo,
  transcriptAnalysis,
  transcript,
  disabled = false
}) => {
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');

  const formatDate = () => {
    const now = new Date();
    return now.toISOString().split('T')[0];
  };

  const generateHTML = () => {
    const sections = [];
    
    // Add video info
    if (videoInfo) {
      sections.push(`
        <section class="video-info">
          <h2>Video Information</h2>
          <h3>${videoInfo.title || 'Untitled'}</h3>
          ${videoInfo.description ? `<p>${videoInfo.description}</p>` : ''}
        </section>
      `);
    }

    // Add transcript analysis
    if (transcriptAnalysis) {
      sections.push(`
        <section class="transcript-analysis">
          <h2>Transcript Analysis</h2>
          <div class="content">
            ${transcriptAnalysis}
          </div>
        </section>
      `);
    }

    // Add screenshots
    if (screenshots && screenshots.length > 0) {
      const screenshotsHTML = screenshots.map(screenshot => {
        let content = '';
        
        if (screenshot.type === 'prompt_response') {
          content = `
            <div class="prompt-response">
              <p><strong>Prompt:</strong> ${screenshot.prompt}</p>
              <p><strong>Response:</strong> ${screenshot.response}</p>
            </div>
          `;
        } else {
          content = `
            <div class="screenshot">
              ${screenshot.image ? `<img src="${screenshot.image}" alt="Screenshot" />` : ''}
              ${screenshot.caption ? `<p class="caption">${screenshot.caption}</p>` : ''}
              ${screenshot.notes ? `<p class="notes">${screenshot.notes}</p>` : ''}
            </div>
          `;
        }
        
        return `
          <div class="screenshot-container">
            <p class="timestamp">Timestamp: ${screenshot.timestamp}</p>
            ${content}
          </div>
        `;
      }).join('');

      sections.push(`
        <section class="screenshots">
          <h2>Screenshots and Notes</h2>
          <div class="screenshots-grid">
            ${screenshotsHTML}
          </div>
        </section>
      `);
    }

    // Add full transcript
    if (transcript && transcript.length > 0) {
      const transcriptHTML = transcript.map(entry => `
        <div class="transcript-entry">
          <span class="timestamp">${entry.time}</span>
          <span class="text">${entry.text}</span>
        </div>
      `).join('');

      sections.push(`
        <section class="full-transcript">
          <h2>Full Transcript</h2>
          <div class="transcript-content">
            ${transcriptHTML}
          </div>
        </section>
      `);
    }

    // Combine all sections with basic styling
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>${videoInfo?.title || 'Video Notes'}</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; max-width: 1200px; margin: 0 auto; padding: 20px; }
          h2 { margin-top: 2em; color: #2d3748; }
          h3 { color: #4a5568; }
          .screenshot-container { margin-bottom: 2em; border: 1px solid #e2e8f0; padding: 1em; border-radius: 8px; }
          .screenshot img { max-width: 100%; height: auto; }
          .caption { font-weight: 500; margin-top: 1em; }
          .notes { color: #4a5568; font-style: italic; }
          .timestamp { color: #718096; font-size: 0.9em; }
          .screenshots-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 20px; }
          .prompt-response { background: #f7fafc; padding: 1em; border-radius: 4px; }
          .transcript-entry { margin-bottom: 1em; }
          .transcript-entry .timestamp { display: inline-block; width: 80px; }
          section { margin-bottom: 3em; }
          @media print {
            body { max-width: none; }
            .screenshot-container { break-inside: avoid; }
            section { break-before: page; }
            h2 { break-after: avoid; }
          }
        </style>
      </head>
      <body>
        ${sections.join('\n')}
      </body>
      </html>
    `;
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      setError('');

      const html = generateHTML();
      if (!html) {
        throw new Error('Failed to generate HTML content');
      }

      const title = videoInfo?.title || 'untitled';
      const date = formatDate();
      const safeTitle = title.replace(/[^a-z0-9]/gi, '_').toLowerCase();
      const filename = `${safeTitle}_${date}.html`;

      const response = await fetch('/api/save-content', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: html,
          filename: filename
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || `Server error: ${response.status}`);
      }

      const result = await response.json();
      console.log('Save result:', result);
      alert(`Content saved successfully to ${result.path}`);
    } catch (err) {
      console.error('Error saving content:', err);
      setError(`Failed to save content: ${err.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="mt-8 pb-4 text-center text-sm text-gray-500">
      <Button 
        onClick={handleSave}
        disabled={disabled || isSaving}
        variant="ghost"
        className="text-gray-500 hover:text-gray-700"
      >
        {isSaving ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Saving...
          </>
        ) : (
          <>
            <Save className="mr-2 h-4 w-4" />
            Save Page Content
          </>
        )}
      </Button>
      {error && (
        <div className="mt-2 text-xs text-red-600">
          {error}
        </div>
      )}
    </div>
  );
};

export default SaveContentButton;
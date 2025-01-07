// exportUtils.js

export const formatTime = (seconds) => {
  const date = new Date(seconds * 1000);
  return date.toISOString().substr(11, 8);
};

const formatLinks = (text, isHTML) => {
  if (!text) return '';
  
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  const socialRegex = /([A-Za-z]+:)\s*([^\n]+)/g;
  
  let formattedText = text;
  
  if (isHTML) {
    // Convert URLs to clickable links
    formattedText = formattedText.replace(urlRegex, (url) => 
      `<a href="${url}" target="_blank" rel="noopener noreferrer">${url}</a>`
    );
    
    // Format social media handles and other labeled items
    formattedText = formattedText.replace(socialRegex, (match, label, content) =>
      `<div class="description-item"><strong>${label}</strong> ${content}</div>`
    );
  }
  
  return formattedText;
};

const generateTranscript = (transcript, isHTML) => {
  if (!transcript?.length) return '';
  
  const formattedTranscript = transcript.map(item => {
    const timestamp = formatTime(item.start);
    return isHTML
      ? `<span class="timestamp">${timestamp}</span> <span class="transcript-text">${item.text}</span>`
      : `${timestamp} ${item.text}`;
  }).join(' ');  // Join with space instead of newline

  return isHTML
    ? `<div class="transcript-content">${formattedTranscript}</div>`
    : formattedTranscript;
};

export const generateExportContent = ({
  videoTitle,
  videoId,
  videoDescription,
  notes,
  screenshots,
  transcriptAnalysis,
  transcript,
  format = 'markdown'
}) => {
  const isHTML = format === 'html';
  const newline = '\n';
  
  // Wrapper functions for formatting
  const h1 = (text) => isHTML 
    ? `<h1 class="export-title">${text}</h1>` 
    : `# ${text}`;
  
  const h2 = (text) => isHTML 
    ? `<h2 class="export-subtitle">${text}</h2>` 
    : `## ${text}`;
  
  const section = (content, className) => isHTML 
    ? `<section class="${className}">${content}</section>` 
    : content;
  
  // Build content sections
  let content = [];

  // Title and metadata
  content.push(h1(videoTitle || 'Video Notes'));
  content.push(section(
    `Video ID: ${videoId}${newline}Date: ${new Date().toLocaleDateString()}`,
    'metadata'
  ));

  // Description section
  if (videoDescription?.trim()) {
    content.push(h2('Video Description'));
    content.push(section(
      formatLinks(videoDescription, isHTML),
      'video-description'
    ));
  }

  // Notes section
  if (notes?.trim()) {
    content.push(h2('Notes'));
    content.push(section(notes, 'notes-section'));
  }

  // Screenshots section
  if (screenshots?.length) {
    content.push(h2('Screenshots and Annotations'));
    screenshots.forEach((screenshot, index) => {
      const screenshotContent = [
        isHTML 
          ? `<img src="${screenshot.image}" alt="Screenshot ${index + 1}" class="screenshot-image">` 
          : `![Screenshot ${index + 1}](${screenshot.image})`,
        
        '<div class="screenshot-caption">',
        '<ul>',
        ...screenshot.caption.split('\n')
          .map(line => line.trim())
          .filter(line => line)
          .map(line => `<li>${line}</li>`),
        '</ul>',
        '</div>'
      ].join('\n');

      content.push(section(screenshotContent, 'screenshot-container'));
    });
  }

  // Transcript analysis section
  if (transcriptAnalysis?.trim()) {
    content.push(h2('Transcript Analysis'));
    const formattedAnalysis = isHTML
      ? transcriptAnalysis
          .split('\n')
          .map(line => {
            if (line.match(/^\d+\./)) return `<h3>${line}</h3>`;
            if (line.trim().startsWith('-')) return `<div class="analysis-item">${line}</div>`;
            return `<p>${line}</p>`;
          })
          .join('\n')
      : transcriptAnalysis;

    content.push(section(formattedAnalysis, 'transcript-analysis'));
  }

  // Full transcript section
  if (transcript?.length) {
    content.push(h2('Full Transcript'));
    content.push(section(generateTranscript(transcript, isHTML), 'transcript-section'));
  }

  // Format-specific wrappers
  if (isHTML) {
    return `<!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${videoTitle || 'Video Notes'}</title>
        <style>
          /* Critical styles for initial render */
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.5; }
          .export-container { max-width: none; margin: 0 auto; padding: 2rem; }
          .transcript-section { font-size: 0.95rem; line-height: 1.5; }
          .transcript-content { display: inline; white-space: normal; }
          .timestamp { font-family: ui-monospace, monospace; color: #555; display: inline; margin-right: 0.25rem; }
          .transcript-text { display: inline; margin-right: 0.5rem; }
          @media print {
            body { font-family: "Times New Roman", serif; }
            .export-container { padding: 0; }
          }
        </style>
        <link rel="stylesheet" href="export-styles.css">
      </head>
      <body>
        <div class="export-container">
          ${content.join('\n\n')}
        </div>
      </body>
      </html>`;
  }

  return content.join('\n\n');
};
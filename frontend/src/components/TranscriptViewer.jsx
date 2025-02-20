import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../config';

const TranscriptViewer = ({
  transcript,
  currentTime,
  onTimeClick,
  onAnalysisGenerated
}) => {
  const [analyzingTranscript, setAnalyzingTranscript] = useState(false);
  const [error, setError] = useState('');
  const transcriptRef = useRef(null);

  const formatTime = (seconds) => {
    const date = new Date(seconds * 1000);
    return date.toISOString().substr(11, 8);
  };

  // Handle auto-scrolling of transcript
  useEffect(() => {
    if (transcriptRef.current) {

      const transcriptElement = transcriptRef.current;
      const timestampElements = transcriptElement.getElementsByClassName('timestamp');
      
      for (let element of timestampElements) {
        const elementTime = parseFloat(element.dataset.time);
        if (elementTime >= currentTime) {
          const elementTop = element.offsetTop - transcriptElement.offsetTop;
          const scrollPosition = elementTop - transcriptElement.clientHeight / 2 + element.clientHeight / 2;

          transcriptElement.scrollTo({
            top: scrollPosition,
            behavior: 'smooth'
          });
          break;
        }
      }
    }
  }, [currentTime]);

  const analyzeTranscript = async () => {
    if (!transcript.length) return;
    
    try {
      setAnalyzingTranscript(true);
      setError('');
      
      const fullTranscript = transcript
        .map(entry => `[${formatTime(entry.start)}] ${entry.text}`)
        .join('\n');
      
      const response = await axios.post(`${API_BASE_URL}/api/analyze-transcript`, {
        transcript: fullTranscript
      });
      
      onAnalysisGenerated(response.data.analysis);
    } catch (error) {
      setError('Error analyzing transcript: ' + error.message);
    } finally {
      setAnalyzingTranscript(false);
    }
  };

  return (
    <div className="space-y-4">
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {transcript.length > 0 && (
        <div className="border rounded-lg p-4 bg-white overflow-hidden">
          <h2 className="text-lg font-bold mb-4">Transcript</h2>
          <div 
            className="h-[300px] overflow-y-auto space-y-2 scroll-smooth"
            ref={transcriptRef}
            style={{ scrollBehavior: 'smooth' }}
          >
            {transcript.map((item, index) => (
              <p 
                key={index} 
                className={`text-sm cursor-pointer hover:bg-gray-100 p-1 rounded ${
                  item.start <= currentTime && currentTime < (transcript[index + 1]?.start || Infinity)
                    ? 'bg-yellow-100'
                    : ''
                }`}
                onClick={() => onTimeClick(item.start)}
              >
                <span 
                  className="timestamp text-gray-500 font-mono"
                  data-time={item.start}
                >
                  {formatTime(item.start)}
                </span>
                : {item.text}
              </p>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default TranscriptViewer;
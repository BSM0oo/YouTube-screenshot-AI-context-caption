import { useState, useEffect } from 'react';
import { API_BASE_URL } from '../../config';

const SCREENSHOTS_PER_PAGE = 12;

export const useScreenshots = (initialScreenshots = []) => {
  const [screenshots, setScreenshots] = useState(initialScreenshots);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);

  // Calculate total pages
  const totalPages = Math.ceil(screenshots.length / SCREENSHOTS_PER_PAGE);

  // Get current page screenshots
  const getCurrentPageScreenshots = () => {
    const startIndex = (currentPage - 1) * SCREENSHOTS_PER_PAGE;
    const endIndex = startIndex + SCREENSHOTS_PER_PAGE;
    return screenshots.slice(startIndex, endIndex);
  };

  // Add new screenshots
  const addScreenshots = (newScreenshots) => {
    setScreenshots(prev => {
      const updated = [...prev, ...newScreenshots];
      // If we have too many screenshots, remove the oldest ones
      if (updated.length > 50) {
        return updated.slice(-50);
      }
      return updated;
    });
  };

  // Clean up old screenshots
  const cleanupScreenshots = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`${API_BASE_URL}/api/cleanup-screenshots`, {
        method: 'POST'
      });
      if (!response.ok) {
        throw new Error('Failed to cleanup screenshots');
      }
    } catch (error) {
      console.error('Screenshot cleanup failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Navigation functions
  const nextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(prev => prev + 1);
    }
  };

  const previousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(prev => prev - 1);
    }
  };

  const goToPage = (pageNumber) => {
    if (pageNumber >= 1 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber);
    }
  };

  // Run cleanup periodically
  useEffect(() => {
    const cleanup = async () => {
      await cleanupScreenshots();
    };
    
    // Run cleanup every 5 minutes
    const interval = setInterval(cleanup, 5 * 60 * 1000);
    
    return () => {
      clearInterval(interval);
    };
  }, []);

  return {
    screenshots: getCurrentPageScreenshots(),
    currentPage,
    totalPages,
    isLoading,
    addScreenshots,
    nextPage,
    previousPage,
    goToPage
  };
};
import React, { useEffect } from 'react';
import { printStyles } from '../styles/printStyles';
import { appStyles } from '../styles/appStyles';

const MainLayout = ({ 
  children, 
  isFullWidth = false,
  videoInfo = null,
  error = null 
}) => {
  // Add styles to head
  useEffect(() => {
    const style = document.createElement('style');
    style.innerHTML = printStyles + appStyles;
    document.head.appendChild(style);
    return () => document.head.removeChild(style);
  }, []);

  return (
    <div className="app-container bg-gray-50">
      <div className={`content-container ${!isFullWidth ? 'constrained' : ''}`}>
        {/* Title section - always visible */}
        <div className="flex flex-col w-full mb-4">
          <div className="flex flex-col w-full">
            <h1 className="text-2xl sm:text-3xl font-bold mb-3">YouTube Notes App</h1>
            {videoInfo?.title && (
              <div className="bg-blue-50 border-l-4 border-blue-500 pl-4 py-2 pr-3 rounded-r-lg">
                <h2 className="text-xl sm:text-2xl font-semibold text-blue-900 leading-tight">
                  {videoInfo.title}
                </h2>
              </div>
            )}
          </div>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4 w-full">
            {error}
          </div>
        )}

        {children}
      </div>
    </div>
  );
};

export default MainLayout;
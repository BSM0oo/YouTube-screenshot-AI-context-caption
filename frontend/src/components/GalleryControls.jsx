import React from 'react';
import { MoreHorizontal, ArrowUpDown, Grid, Edit, Move, Eye } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuCheckboxItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

const GalleryControls = ({
  videoTitle,
  sortAscending,
  groupByType,
  editMode,
  reorderMode,
  onSortToggle,
  onGroupToggle,
  onEditToggle,
  onReorderToggle,
  isMainContentVisible,
  setIsMainContentVisible
}) => {
  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 sm:gap-0 mb-4">
        <div className="flex items-center gap-4">
          <h2 className="text-2xl font-bold">Screenshots & Notes</h2>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="secondary" size="sm" className="gap-2">
                <MoreHorizontal className="h-4 w-4" />
                View Options
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-[200px]">
              <DropdownMenuLabel>Display Options</DropdownMenuLabel>
              <DropdownMenuCheckboxItem
                checked={!isMainContentVisible}
                onCheckedChange={(checked) => setIsMainContentVisible(!checked)}
                className="gap-2"
              >
                <Eye className="h-4 w-4" />
                Hide Video & Transcript
              </DropdownMenuCheckboxItem>

              <DropdownMenuSeparator />

              <DropdownMenuCheckboxItem
                checked={sortAscending}
                onCheckedChange={onSortToggle}
                className="gap-2"
              >
                <ArrowUpDown className="h-4 w-4" />
                Oldest First
              </DropdownMenuCheckboxItem>

              <DropdownMenuCheckboxItem
                checked={groupByType}
                onCheckedChange={onGroupToggle}
                className="gap-2"
              >
                <Grid className="h-4 w-4" />
                Group by Type
              </DropdownMenuCheckboxItem>

              <DropdownMenuSeparator />

              <DropdownMenuItem onClick={onEditToggle} className="gap-2">
                <Edit className="h-4 w-4" />
                {editMode ? 'Save Changes' : 'Edit Captions'}
              </DropdownMenuItem>

              <DropdownMenuItem onClick={onReorderToggle} className="gap-2">
                <Move className="h-4 w-4" />
                {reorderMode ? 'Finish Reordering' : 'Reorder Screenshots'}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
        <button
          onClick={onSortToggle}
          className="flex-1 sm:flex-none text-xs sm:text-sm border border-gray-300 hover:border-gray-400 bg-white hover:bg-gray-50 text-gray-800 hover:text-gray-900 px-2 sm:px-3 py-1 rounded"
        >
          {sortAscending ? '↑ Oldest First' : '↓ Newest First'}
        </button>
        <button
          onClick={onGroupToggle}
          className="flex-1 sm:flex-none text-xs sm:text-sm border border-gray-300 hover:border-gray-400 bg-white hover:bg-gray-50 text-gray-600 hover:text-gray-800 px-2 sm:px-3 py-1 rounded"
        >
          {groupByType ? 'Show Chronological' : 'Group by Type'}
        </button>
        <div className="flex gap-2">
          <button
            onClick={onEditToggle}
            className="text-xs sm:text-sm border border-gray-300 hover:border-gray-400 bg-white hover:bg-gray-50 text-gray-600 hover:text-gray-800 px-2 sm:px-3 py-1 rounded"
          >
            {editMode ? 'Save Changes' : 'Edit Captions'}
          </button>
          <button
            onClick={onReorderToggle}
            className={`text-xs sm:text-sm border px-2 sm:px-3 py-1 rounded flex items-center gap-1 ${
              reorderMode 
                ? 'bg-green-100 text-green-800 border-green-300 hover:bg-green-200' 
                : 'bg-white hover:bg-gray-50 text-gray-600 hover:text-gray-800 border-gray-300'
            }`}
          >
            {reorderMode ? (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Finish Reordering
              </>
            ) : (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
                Reorder Screenshots
              </>
            )}
          </button>
        </div>
        </div>
      </div>
      
      {/* Reorder Mode Instructions */}
      {reorderMode && (
        <div className="w-full bg-green-50 border border-green-200 rounded-lg p-4">
          <h3 className="text-green-800 font-medium mb-2 flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Reorder Mode Active
          </h3>
          <ul className="text-green-700 text-sm space-y-1">
            <li>• Click and drag the ⋮⋮ handle in the top-left corner of any screenshot to reorder</li>
            <li>• Drag screenshots up or down to change their order</li>
            <li>• Click 'Done Reordering' when finished</li>
            <li>• Note: Prompt responses cannot be reordered</li>
          </ul>
        </div>
      )}
    </div>
  );
};

export default GalleryControls;
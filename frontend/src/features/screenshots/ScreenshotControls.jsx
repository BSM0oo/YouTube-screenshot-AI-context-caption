import React from 'react';
import { MoreHorizontal, ArrowUpDown, Grid, Edit, Move, Eye } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

const ScreenshotControls = ({
  sortOldestFirst,
  setSortOldestFirst,
  groupByType,
  setGroupByType,
  onEditCaptions,
  onReorderScreenshots,
  reorderMode,
  isMainContentVisible,
  setIsMainContentVisible
}) => {
  return (
    <div className="flex flex-col gap-4 w-full">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
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
            checked={sortOldestFirst}
            onCheckedChange={setSortOldestFirst}
            className="gap-2"
          >
            <ArrowUpDown className="h-4 w-4" />
            Oldest First
          </DropdownMenuCheckboxItem>

          <DropdownMenuCheckboxItem
            checked={groupByType}
            onCheckedChange={setGroupByType}
            className="gap-2"
          >
            <Grid className="h-4 w-4" />
            Group by Type
          </DropdownMenuCheckboxItem>

          <DropdownMenuSeparator />
          
          <DropdownMenuItem onClick={onEditCaptions} className="gap-2">
            <Edit className="h-4 w-4" />
            Edit Captions
          </DropdownMenuItem>

          <DropdownMenuItem onClick={onReorderScreenshots} className="gap-2">
            <Move className="h-4 w-4" />
            Reorder Screenshots
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
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

export default ScreenshotControls;
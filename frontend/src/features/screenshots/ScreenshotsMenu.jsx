import React from 'react';
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem,
  DropdownMenuGroup,
} from "@/components/ui/dropdown-menu";
import { MoreVertical, ChevronUp, LayoutGrid, Settings, Eye, FileText, Edit } from "lucide-react";

const ScreenshotsMenu = ({
  isMainContentVisible,
  setIsMainContentVisible,
  outlinePosition,
  setOutlinePosition,
  sortOldestFirst,
  setSortOldestFirst,
  groupByType,
  setGroupByType,
  onEditCaptions,
  onReorderScreenshots
}) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-8 w-8 p-0">
          <span className="sr-only">Open menu</span>
          <MoreVertical className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[200px]">
        <DropdownMenuLabel>View Options</DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        <DropdownMenuGroup>
          <DropdownMenuItem onClick={() => setIsMainContentVisible(!isMainContentVisible)}>
            <Eye className="mr-2 h-4 w-4" />
            {isMainContentVisible ? 'Hide Video & Transcript' : 'Show Video & Transcript'}
          </DropdownMenuItem>

          <DropdownMenuSeparator />

          <DropdownMenuLabel className="text-sm font-medium">Outline Position</DropdownMenuLabel>
          <DropdownMenuCheckboxItem
            checked={outlinePosition === 'before'}
            onCheckedChange={() => setOutlinePosition('before')}
          >
            <FileText className="mr-2 h-4 w-4" />
            Before Screenshots
          </DropdownMenuCheckboxItem>
          <DropdownMenuCheckboxItem
            checked={outlinePosition === 'after'}
            onCheckedChange={() => setOutlinePosition('after')}
          >
            <FileText className="mr-2 h-4 w-4" />
            After Screenshots
          </DropdownMenuCheckboxItem>

          <DropdownMenuSeparator />

          <DropdownMenuCheckboxItem
            checked={sortOldestFirst}
            onCheckedChange={(checked) => setSortOldestFirst(checked)}
          >
            <ChevronUp className="mr-2 h-4 w-4" />
            Oldest First
          </DropdownMenuCheckboxItem>

          <DropdownMenuCheckboxItem
            checked={groupByType}
            onCheckedChange={(checked) => setGroupByType(checked)}
          >
            <LayoutGrid className="mr-2 h-4 w-4" />
            Group by Type
          </DropdownMenuCheckboxItem>
        </DropdownMenuGroup>

        <DropdownMenuSeparator />
        
        <DropdownMenuGroup>
          <DropdownMenuItem onClick={onEditCaptions}>
            <Edit className="mr-2 h-4 w-4" />
            Edit Captions
          </DropdownMenuItem>
          <DropdownMenuItem onClick={onReorderScreenshots}>
            <Settings className="mr-2 h-4 w-4" />
            Reorder Screenshots
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default ScreenshotsMenu;
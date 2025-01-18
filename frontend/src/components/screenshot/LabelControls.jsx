import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';

const LabelControls = ({
  enableLabel,
  setEnableLabel,
  labelText,
  setLabelText,
  fontSize,
  setFontSize,
  textColor,
  setTextColor,
  renderCaptureButton
}) => {
  // Preview text for font size demo
  const [previewText, setPreviewText] = useState("Sample Text");

  return (
    <div className="space-y-4 p-4 border rounded-lg bg-gray-50">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Switch
            id="label-toggle"
            checked={enableLabel}
            onCheckedChange={setEnableLabel}
          />
          <Label htmlFor="label-toggle">Label Image</Label>
        </div>
        {renderCaptureButton && renderCaptureButton()}
      </div>

      {enableLabel && (
        <>
          <div className="space-y-2">
            <Label htmlFor="label-text">Label Text</Label>
            <Input
              id="label-text"
              value={labelText}
              onChange={(e) => setLabelText(e.target.value)}
              placeholder="Enter text to overlay on image..."
              className="w-full"
            />
          </div>

          <div className="flex space-x-4 items-end">
            <div className="space-y-2">
              <Label htmlFor="font-size">Font Size (px)</Label>
              <Input
                id="font-size"
                type="number"
                min="20"
                max="200"
                value={fontSize}
                onChange={(e) => setFontSize(Number(e.target.value))}
                className="w-32"
              />
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="color-toggle"
                checked={textColor === 'white'}
                onCheckedChange={(checked) => setTextColor(checked ? 'white' : 'black')}
              />
              <Label htmlFor="color-toggle">
                {textColor === 'white' ? 'White' : 'Black'} Text
              </Label>
            </div>
          </div>

          <div className="mt-4">
            <Label>Preview:</Label>
            <div 
              className="w-full h-32 bg-gray-200 rounded-lg mt-2 flex items-center justify-center overflow-hidden"
              style={{
                fontSize: `${fontSize}px`,
                lineHeight: 1.2
              }}
            >
              {labelText || "Sample Text"}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default LabelControls;
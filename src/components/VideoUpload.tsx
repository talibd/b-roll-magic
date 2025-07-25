import React, { useRef, useState } from 'react';
import { Upload, Film, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface VideoUploadProps {
  onVideoUpload: (file: File) => void;
  isProcessing?: boolean;
}

export const VideoUpload: React.FC<VideoUploadProps> = ({ onVideoUpload, isProcessing }) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [uploadedVideo, setUploadedVideo] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const files = e.dataTransfer.files;
    if (files.length > 0 && files[0].type.startsWith('video/')) {
      handleVideoFile(files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('video/')) {
      handleVideoFile(file);
    }
  };

  const handleVideoFile = (file: File) => {
    setUploadedVideo(file);
    onVideoUpload(file);
  };

  const clearVideo = () => {
    setUploadedVideo(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  if (uploadedVideo) {
    return (
      <div className="relative">
        <div className="bg-card border border-border rounded-lg p-6 shadow-elegant">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Film className="w-5 h-5 text-primary" />
              <div>
                <h3 className="font-medium">{uploadedVideo.name}</h3>
                <p className="text-sm text-muted-foreground">
                  {(uploadedVideo.size / (1024 * 1024)).toFixed(2)} MB
                </p>
              </div>
            </div>
            {!isProcessing && (
              <Button variant="ghost" size="icon" onClick={clearVideo}>
                <X className="w-4 h-4" />
              </Button>
            )}
          </div>
          
          <video
            src={URL.createObjectURL(uploadedVideo)}
            controls
            className="w-full rounded-lg"
            style={{ maxHeight: '300px' }}
          />
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "border-2 border-dashed border-border rounded-lg p-8 text-center transition-all duration-300 cursor-pointer hover:border-primary/50 hover:bg-gradient-secondary",
        isDragOver && "border-primary bg-gradient-secondary scale-105"
      )}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={() => fileInputRef.current?.click()}
    >
      <Upload className="w-12 h-12 text-primary mx-auto mb-4" />
      <h3 className="text-lg font-semibold mb-2">Upload Your Video</h3>
      <p className="text-muted-foreground mb-4">
        Drag and drop your video file here, or click to browse
      </p>
      <Button variant="magic" size="lg">
        Choose Video File
      </Button>
      
      <input
        ref={fileInputRef}
        type="file"
        accept="video/*"
        onChange={handleFileChange}
        className="hidden"
      />
    </div>
  );
};
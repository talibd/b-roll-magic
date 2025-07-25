import React from 'react';
import { Loader2, CheckCircle, Clock, Wand2 } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

interface ProcessingStatusProps {
  status: 'uploading' | 'extracting' | 'generating' | 'complete';
  progress: number;
}

export const ProcessingStatus: React.FC<ProcessingStatusProps> = ({ status, progress }) => {
  const getStatusInfo = () => {
    switch (status) {
      case 'uploading':
        return {
          icon: <Clock className="w-5 h-5 text-primary" />,
          title: 'Processing Video',
          description: 'Analyzing your video content...'
        };
      case 'extracting':
        return {
          icon: <Loader2 className="w-5 h-5 text-primary animate-spin" />,
          title: 'Extracting Subtitles',
          description: 'Using AI to transcribe audio content...'
        };
      case 'generating':
        return {
          icon: <Wand2 className="w-5 h-5 text-primary animate-pulse" />,
          title: 'Generating B-roll',
          description: 'Creating contextual image suggestions...'
        };
      case 'complete':
        return {
          icon: <CheckCircle className="w-5 h-5 text-green-500" />,
          title: 'Processing Complete!',
          description: 'Your B-roll suggestions are ready.'
        };
    }
  };

  const statusInfo = getStatusInfo();

  return (
    <div className="bg-card border border-border rounded-lg p-6 shadow-elegant">
      <div className="flex items-center gap-3 mb-4">
        {statusInfo.icon}
        <div>
          <h3 className="font-semibold">{statusInfo.title}</h3>
          <p className="text-sm text-muted-foreground">{statusInfo.description}</p>
        </div>
      </div>
      
      <Progress value={progress} className="mb-2" />
      <p className="text-xs text-muted-foreground text-right">{progress}% complete</p>
    </div>
  );
};
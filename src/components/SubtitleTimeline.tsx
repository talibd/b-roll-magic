import React from 'react';
import { Clock, Download, Image as ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export interface SubtitleSegment {
  id: string;
  startTime: number;
  endTime: number;
  text: string;
  keywords: string[];
  brollImage?: string;
}

interface SubtitleTimelineProps {
  segments: SubtitleSegment[];
  onDownloadSrt: () => void;
  onExportStoryboard: () => void;
}

export const SubtitleTimeline: React.FC<SubtitleTimelineProps> = ({ 
  segments, 
  onDownloadSrt, 
  onExportStoryboard 
}) => {
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <Card className="shadow-elegant">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Subtitle Timeline
          </CardTitle>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={onDownloadSrt}>
              <Download className="w-4 h-4 mr-2" />
              Download SRT
            </Button>
            <Button variant="magic" size="sm" onClick={onExportStoryboard}>
              <ImageIcon className="w-4 h-4 mr-2" />
              Export Storyboard
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4 max-h-96 overflow-y-auto">
          {segments.map((segment) => (
            <div key={segment.id} className="border border-border rounded-lg p-4 hover:bg-gradient-secondary transition-all duration-300">
              <div className="flex gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-sm font-mono bg-muted px-2 py-1 rounded">
                      {formatTime(segment.startTime)} - {formatTime(segment.endTime)}
                    </span>
                  </div>
                  <p className="text-sm mb-2">{segment.text}</p>
                  <div className="flex flex-wrap gap-1">
                    {segment.keywords.map((keyword, index) => (
                      <span
                        key={index}
                        className="inline-block bg-primary/10 text-primary text-xs px-2 py-1 rounded-full"
                      >
                        {keyword}
                      </span>
                    ))}
                  </div>
                </div>
                {segment.brollImage && (
                  <div className="w-24 h-16 bg-muted rounded-lg overflow-hidden flex-shrink-0">
                    <img
                      src={segment.brollImage}
                      alt={`B-roll for: ${segment.keywords.join(', ')}`}
                      className="w-full h-full object-cover hover:scale-110 transition-transform duration-300"
                    />
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
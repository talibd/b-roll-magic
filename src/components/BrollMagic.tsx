import React, { useState } from 'react';
import { Wand2, Sparkles } from 'lucide-react';
import { VideoUpload } from './VideoUpload';
import { ProcessingStatus } from './ProcessingStatus';
import { SubtitleTimeline, SubtitleSegment } from './SubtitleTimeline';
import { toast } from '@/hooks/use-toast';

// Import B-roll images
import brollCoding from '@/assets/broll-coding.jpg';
import brollCity from '@/assets/broll-city.jpg';
import brollMeeting from '@/assets/broll-meeting.jpg';
import brollCoffee from '@/assets/broll-coffee.jpg';

type ProcessingState = 'idle' | 'uploading' | 'extracting' | 'generating' | 'complete';

export const BrollMagic: React.FC = () => {
  const [processingState, setProcessingState] = useState<ProcessingState>('idle');
  const [progress, setProgress] = useState(0);
  const [segments, setSegments] = useState<SubtitleSegment[]>([]);

  const mockSubtitleData: Omit<SubtitleSegment, 'id' | 'brollImage'>[] = [
    {
      startTime: 0,
      endTime: 3.5,
      text: "Welcome to our tutorial on building modern web applications.",
      keywords: ["tutorial", "web", "applications"]
    },
    {
      startTime: 3.5,
      endTime: 8.2,
      text: "Today we'll be coding a React application with TypeScript and modern tooling.",
      keywords: ["coding", "React", "TypeScript"]
    },
    {
      startTime: 8.2,
      endTime: 12.8,
      text: "First, let's set up our development environment and install the necessary packages.",
      keywords: ["development", "environment", "packages"]
    },
    {
      startTime: 12.8,
      endTime: 18.5,
      text: "Our team has been working on this project for several months in our downtown office.",
      keywords: ["team", "project", "office"]
    },
    {
      startTime: 18.5,
      endTime: 23.1,
      text: "Let me grab a coffee and then we'll dive into the implementation details.",
      keywords: ["coffee", "implementation", "details"]
    },
    {
      startTime: 23.1,
      endTime: 28.7,
      text: "The architecture we're building scales well across different city environments.",
      keywords: ["architecture", "scales", "city"]
    }
  ];

  const brollImages = [brollCoding, brollMeeting, brollCoding, brollMeeting, brollCoffee, brollCity];

  const processVideo = async (file: File) => {
    setProcessingState('uploading');
    setProgress(10);

    // Simulate processing steps
    await new Promise(resolve => setTimeout(resolve, 800));
    
    setProcessingState('extracting');
    setProgress(30);
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    setProgress(60);
    setProcessingState('generating');
    await new Promise(resolve => setTimeout(resolve, 1200));
    
    setProgress(90);
    await new Promise(resolve => setTimeout(resolve, 800));

    // Generate final segments with B-roll images
    const finalSegments: SubtitleSegment[] = mockSubtitleData.map((segment, index) => ({
      ...segment,
      id: `segment-${index}`,
      brollImage: brollImages[index]
    }));

    setSegments(finalSegments);
    setProgress(100);
    setProcessingState('complete');
    
    toast({
      title: "Processing Complete! 🎉",
      description: "Your B-roll suggestions are ready to view.",
    });
  };

  const downloadSrt = () => {
    const srtContent = segments
      .map((segment, index) => {
        const formatSrtTime = (seconds: number) => {
          const hours = Math.floor(seconds / 3600);
          const mins = Math.floor((seconds % 3600) / 60);
          const secs = Math.floor(seconds % 60);
          const ms = Math.floor((seconds % 1) * 1000);
          return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')},${ms.toString().padStart(3, '0')}`;
        };

        return `${index + 1}\n${formatSrtTime(segment.startTime)} --> ${formatSrtTime(segment.endTime)}\n${segment.text}\n`;
      })
      .join('\n');

    const blob = new Blob([srtContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'subtitles.srt';
    a.click();
    URL.revokeObjectURL(url);

    toast({
      title: "SRT Downloaded",
      description: "Subtitle file has been saved to your device.",
    });
  };

  const exportStoryboard = () => {
    const storyboard = {
      title: "B-roll Storyboard",
      timestamp: new Date().toISOString(),
      segments: segments.map(segment => ({
        timeRange: `${segment.startTime}s - ${segment.endTime}s`,
        text: segment.text,
        keywords: segment.keywords,
        brollImage: segment.brollImage,
        suggestions: segment.keywords.map(keyword => `Stock footage: ${keyword}`)
      }))
    };

    const blob = new Blob([JSON.stringify(storyboard, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'storyboard.json';
    a.click();
    URL.revokeObjectURL(url);

    toast({
      title: "Storyboard Exported",
      description: "Your B-roll storyboard has been saved as JSON.",
    });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Header */}
      <div className="bg-gradient-primary text-primary-foreground">
        <div className="container mx-auto px-4 py-12">
          <div className="text-center">
            <div className="flex items-center justify-center gap-3 mb-4">
              <Wand2 className="w-8 h-8" />
              <h1 className="text-4xl font-bold">B-roll Magic</h1>
              <Sparkles className="w-8 h-8" />
            </div>
            <p className="text-lg opacity-90 max-w-2xl mx-auto">
              Transform your videos with AI-powered subtitle extraction and contextual B-roll suggestions. 
              Upload your video and watch as we automatically generate beautiful supplementary content.
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-8">
          
          {/* Upload Section */}
          <VideoUpload 
            onVideoUpload={processVideo} 
            isProcessing={processingState !== 'idle' && processingState !== 'complete'}
          />

          {/* Processing Status */}
          {processingState !== 'idle' && (
            <ProcessingStatus status={processingState} progress={progress} />
          )}

          {/* Results */}
          {processingState === 'complete' && segments.length > 0 && (
            <SubtitleTimeline
              segments={segments}
              onDownloadSrt={downloadSrt}
              onExportStoryboard={exportStoryboard}
            />
          )}

          {/* Features Info */}
          {processingState === 'idle' && (
            <div className="grid md:grid-cols-3 gap-6 mt-12">
              <div className="text-center p-6 bg-card border border-border rounded-lg shadow-elegant">
                <div className="w-12 h-12 bg-gradient-primary rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Wand2 className="w-6 h-6 text-primary-foreground" />
                </div>
                <h3 className="font-semibold mb-2">AI Subtitle Extraction</h3>
                <p className="text-sm text-muted-foreground">
                  Advanced AI automatically transcribes your video content with high accuracy
                </p>
              </div>
              
              <div className="text-center p-6 bg-card border border-border rounded-lg shadow-elegant">
                <div className="w-12 h-12 bg-gradient-primary rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Sparkles className="w-6 h-6 text-primary-foreground" />
                </div>
                <h3 className="font-semibold mb-2">Smart B-roll Suggestions</h3>
                <p className="text-sm text-muted-foreground">
                  Contextual image suggestions based on your content keywords and themes
                </p>
              </div>
              
              <div className="text-center p-6 bg-card border border-border rounded-lg shadow-elegant">
                <div className="w-12 h-12 bg-gradient-primary rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Sparkles className="w-6 h-6 text-primary-foreground" />
                </div>
                <h3 className="font-semibold mb-2">Export Ready</h3>
                <p className="text-sm text-muted-foreground">
                  Download SRT files and export storyboards for your editing workflow
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
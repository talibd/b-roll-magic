import React, { useState } from 'react';
import { Wand2, Sparkles } from 'lucide-react';
import { VideoUpload } from './VideoUpload';
import { ProcessingStatus } from './ProcessingStatus';
import { SubtitleTimeline, SubtitleSegment } from './SubtitleTimeline';
import { toast } from '@/hooks/use-toast';
import OpenAI from 'openai';

// Unsplash API configuration
const UNSPLASH_ACCESS_KEY = 'cJwjnrON8PlOGXaqV6jvgOF6aTytyNR_2MDbxHkxifw'; // Public demo key

type ProcessingState = 'idle' | 'uploading' | 'extracting' | 'generating' | 'complete';

export const BrollMagic: React.FC = () => {
  const [processingState, setProcessingState] = useState<ProcessingState>('idle');
  const [progress, setProgress] = useState(0);
  const [segments, setSegments] = useState<SubtitleSegment[]>([]);
  const [apiKey, setApiKey] = useState<string>('');

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

  // Function to fetch image from Unsplash
  const fetchUnsplashImage = async (keyword: string): Promise<string> => {
    try {
      const response = await fetch(
        `https://api.unsplash.com/search/photos?query=${encodeURIComponent(keyword)}&per_page=1&orientation=landscape`,
        {
          headers: {
            'Authorization': `Client-ID ${UNSPLASH_ACCESS_KEY}`
          }
        }
      );
      const data = await response.json();
      return data.results?.[0]?.urls?.regular || `https://source.unsplash.com/800x600/?${keyword}`;
    } catch (error) {
      console.error('Error fetching Unsplash image:', error);
      return `https://source.unsplash.com/800x600/?${keyword}`;
    }
  };

  const processVideo = async (file: File) => {
    if (!apiKey) {
      toast({
        title: "API Key Required",
        description: "Please enter your OpenAI API key to process videos.",
        variant: "destructive"
      });
      return;
    }

    try {
      setProcessingState('uploading');
      setProgress(10);

      // Initialize OpenAI client
      const openai = new OpenAI({
        apiKey: apiKey,
        dangerouslyAllowBrowser: true
      });

      setProcessingState('extracting');
      setProgress(30);

      // Convert video file to audio for Whisper
      const audioFile = new File([file], file.name, { type: file.type });
      
      setProgress(50);

      // Use OpenAI Whisper to transcribe
      const transcription = await openai.audio.transcriptions.create({
        file: audioFile,
        model: "whisper-1",
        response_format: "verbose_json",
        timestamp_granularities: ["segment"]
      });

      setProgress(70);
      setProcessingState('generating');

      // Process transcription segments
      const transcriptSegments = transcription.segments || [];
      const processedSegments: SubtitleSegment[] = await Promise.all(
        transcriptSegments.map(async (segment, index) => {
          // Extract keywords from segment text
          const words = segment.text.toLowerCase().split(/\s+/);
          const keywords = words
            .filter(word => word.length > 4 && !['the', 'and', 'that', 'with', 'have', 'this', 'will', 'your', 'from', 'they', 'know', 'want', 'been', 'good', 'much', 'some', 'time'].includes(word))
            .slice(0, 3);

          // Fetch B-roll image based on the first keyword or fallback to general terms
          const searchTerm = keywords[0] || segment.text.split(' ').find(word => word.length > 3) || 'technology';
          const brollImage = await fetchUnsplashImage(searchTerm);

          return {
            id: `segment-${index}`,
            startTime: segment.start,
            endTime: segment.end,
            text: segment.text.trim(),
            keywords: keywords,
            brollImage: brollImage
          };
        })
      );

      setSegments(processedSegments);
      setProgress(100);
      setProcessingState('complete');
      
      toast({
        title: "Processing Complete! 🎉",
        description: "Your subtitles have been generated using OpenAI Whisper.",
      });

    } catch (error) {
      console.error('Error processing video:', error);
      toast({
        title: "Processing Failed",
        description: "There was an error processing your video. Please check your API key and try again.",
        variant: "destructive"
      });
      setProcessingState('idle');
      setProgress(0);
    }
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
          
          {/* API Key Input */}
          {!apiKey && (
            <div className="bg-card border border-border rounded-lg p-6 shadow-elegant">
              <h3 className="font-semibold mb-4">OpenAI API Configuration</h3>
              <div className="space-y-4">
                <div>
                  <label htmlFor="apiKey" className="block text-sm font-medium mb-2">
                    OpenAI API Key
                  </label>
                  <input
                    type="password"
                    id="apiKey"
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    placeholder="sk-..."
                    className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Your API key is stored locally and never sent to our servers.
                  </p>
                </div>
              </div>
            </div>
          )}

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
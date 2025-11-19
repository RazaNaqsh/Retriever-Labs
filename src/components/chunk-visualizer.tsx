import { useState } from 'react';
import { FileText, Scissors, Upload, ArrowRight, Loader2 } from 'lucide-react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { Badge } from './ui/badge';
import type { Chunk } from '../App';
import type { Theme } from '../App';

type ChunkVisualizerProps = {
  chunks: Chunk[];
  setChunks: (chunks: Chunk[]) => void;
  onNext: () => void;
  theme: Theme;
};

// Mock function to generate embeddings
function generateMockEmbedding(): number[] {
  return Array.from({ length: 3 }, () => Math.random() * 2 - 1);
}

// Function to find overlap between consecutive chunks
function findOverlap(text1: string, text2: string, minOverlap: number = 20): { start: string; end: string } | null {
  const words1 = text1.split(' ');
  const words2 = text2.split(' ');
  
  // Check for overlap at the end of text1 and start of text2
  for (let i = Math.min(minOverlap, words1.length); i > 0; i--) {
    const end1 = words1.slice(-i).join(' ');
    const start2 = words2.slice(0, i).join(' ');
    
    if (end1.toLowerCase() === start2.toLowerCase()) {
      return { start: start2, end: end1 };
    }
  }
  
  return null;
}

// Function to chunk text
function chunkText(text: string, chunkSize: number = 200, overlapSize: number = 30): Chunk[] {
  const sentences = text.match(/[^.!?]+[.!?]+/g) || [text];
  const chunks: Chunk[] = [];
  let currentChunk = '';
  let chunkId = 0;
  let previousChunkText = '';

  sentences.forEach((sentence) => {
    if ((currentChunk + sentence).length > chunkSize && currentChunk.length > 0) {
      const chunkText = currentChunk.trim();
      const overlap = previousChunkText ? findOverlap(previousChunkText, chunkText) : null;
      
      chunks.push({
        id: `chunk-${chunkId++}`,
        text: chunkText,
        embedding: generateMockEmbedding(),
        overlapStart: overlap?.start,
        overlapEnd: overlap?.end,
      });
      
      // Create overlap for next chunk
      const words = currentChunk.trim().split(' ');
      const overlapWords = Math.min(overlapSize, Math.floor(words.length / 2));
      previousChunkText = chunkText;
      currentChunk = words.slice(-overlapWords).join(' ') + ' ' + sentence;
    } else {
      currentChunk += sentence;
    }
  });

  if (currentChunk.trim()) {
    const chunkText = currentChunk.trim();
    const overlap = previousChunkText ? findOverlap(previousChunkText, chunkText) : null;
    
    chunks.push({
      id: `chunk-${chunkId}`,
      text: chunkText,
      embedding: generateMockEmbedding(),
      overlapStart: overlap?.start,
      overlapEnd: overlap?.end,
    });
  }

  return chunks;
}

export function ChunkVisualizer({ chunks, setChunks, onNext, theme }: ChunkVisualizerProps) {
  const [inputText, setInputText] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  
  const isNeon = theme === 'neon';

  const handleTextSubmit = () => {
    if (inputText.trim()) {
      setIsProcessing(true);
      // Simulate processing time
      setTimeout(() => {
        const newChunks = chunkText(inputText);
        setChunks(newChunks);
        setIsProcessing(false);
      }, 800);
    }
  };

  const handleFileUpload = (file: File) => {
    setIsProcessing(true);
    const reader = new FileReader();
    reader.onload = (e) => {
      // Simulate processing time for file upload
      setTimeout(() => {
        const text = e.target?.result as string;
        const newChunks = chunkText(text);
        setChunks(newChunks);
        setInputText(text);
        setIsProcessing(false);
      }, 1500);
    };
    reader.readAsText(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file && file.type === 'text/plain') {
      handleFileUpload(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const loadSampleText = () => {
    const sampleText = `Retrieval Augmented Generation (RAG) is a technique that combines the power of large language models with external knowledge retrieval. This approach allows AI systems to access up-to-date information and domain-specific knowledge that wasn't part of their training data. The process works in three main steps. First, documents are split into smaller chunks for efficient processing. Second, these chunks are converted into embeddings, which are numerical representations that capture semantic meaning. Third, when a user asks a question, the system retrieves the most relevant chunks and uses them to generate an informed response. This technique significantly improves the accuracy and reliability of AI-generated content.`;
    setInputText(sampleText);
    setIsProcessing(true);
    setTimeout(() => {
      const newChunks = chunkText(sampleText);
      setChunks(newChunks);
      setIsProcessing(false);
    }, 800);
  };

  return (
    <>
      {/* Loading Modal */}
      {isProcessing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <Card className={`p-8 ${
            isNeon 
              ? 'bg-[#141420] border-2 border-[#00f0ff]/30 shadow-[0_0_40px_rgba(0,240,255,0.3)]' 
              : 'bg-white border-2 border-indigo-200 shadow-2xl'
          }`}>
            <div className="flex flex-col items-center gap-4">
              <Loader2 className={`size-12 animate-spin ${isNeon ? 'text-[#00f0ff]' : 'text-indigo-600'}`} />
              <div className="text-center">
                <h3 className={isNeon ? 'text-[#00f0ff]' : 'text-indigo-700'}>Processing Document</h3>
                <p className={`text-sm mt-1 ${isNeon ? 'text-[#9090aa]' : 'text-gray-600'}`}>
                  Analyzing and chunking your text...
                </p>
              </div>
            </div>
          </Card>
        </div>
      )}

      <div className="space-y-8">
        <div className="text-center">
          <h2 className={isNeon ? 'text-[#00f0ff] mb-2' : 'text-indigo-700 mb-2'}>Step 1: Chunk Your Content</h2>
          <p className={isNeon ? 'text-[#9090aa]' : 'text-gray-600'}>
            Upload a document or paste text to split it into manageable chunks
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Input Section */}
          <Card className={`p-6 ${
            isNeon 
              ? 'bg-[#141420]/80 backdrop-blur-sm border-2 border-[#00f0ff]/20 shadow-[0_0_20px_rgba(0,240,255,0.1)]' 
              : 'bg-white/80 backdrop-blur-sm border-2 border-indigo-100'
          }`}>
            <div className="flex items-center gap-2 mb-4">
              <FileText className={`size-5 ${isNeon ? 'text-[#00f0ff]' : 'text-indigo-600'}`} />
              <h3 className={isNeon ? 'text-[#00f0ff]' : 'text-indigo-700'}>Input</h3>
            </div>

            <div className="space-y-4">
              {/* File Upload Area */}
              <div
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                className={`
                  border-2 border-dashed rounded-lg p-8 text-center transition-all
                  ${isDragging 
                    ? isNeon 
                      ? 'border-[#00f0ff] bg-[#00f0ff]/5 shadow-[0_0_30px_rgba(0,240,255,0.2)]' 
                      : 'border-indigo-500 bg-indigo-50'
                    : isNeon
                    ? 'border-[#2a2a40] hover:border-[#00f0ff]/50'
                    : 'border-gray-300 hover:border-indigo-400'
                  }
                `}
              >
                <Upload className={`size-10 mx-auto mb-3 ${isNeon ? 'text-[#6060a0]' : 'text-gray-400'}`} />
                <p className={`mb-2 ${isNeon ? 'text-[#9090aa]' : 'text-gray-600'}`}>
                  Drag and drop a .txt file here
                </p>
                <p className={`text-sm ${isNeon ? 'text-[#6060a0]' : 'text-gray-500'}`}>or</p>
                <label>
                  <input
                    type="file"
                    accept=".txt"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleFileUpload(file);
                    }}
                  />
                  <span className="inline-block mt-2">
                    <Button 
                      variant="outline" 
                      className={`cursor-pointer ${
                        isNeon 
                          ? 'border-[#00f0ff]/30 text-[#00f0ff] hover:bg-[#00f0ff]/10' 
                          : 'border-indigo-300 text-indigo-700 hover:bg-indigo-50'
                      }`} 
                      type="button"
                    >
                      Browse Files
                    </Button>
                  </span>
                </label>
              </div>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className={`w-full border-t ${isNeon ? 'border-[#2a2a40]' : 'border-gray-300'}`} />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className={`px-2 ${isNeon ? 'bg-[#141420] text-[#6060a0]' : 'bg-white text-gray-500'}`}>OR</span>
                </div>
              </div>

              {/* Text Input */}
              <Textarea
                placeholder="Paste your text here..."
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                className={`min-h-[200px] resize-none ${
                  isNeon 
                    ? 'bg-[#1a1a2e] border-[#2a2a40] text-[#e0e0ff] placeholder:text-[#6060a0] focus:border-[#00f0ff]/50' 
                    : 'bg-white border-gray-300 text-gray-900 placeholder:text-gray-400 focus:border-indigo-500'
                }`}
              />

              <div className="flex gap-2">
                <Button 
                  onClick={handleTextSubmit} 
                  className={`flex-1 ${
                    isNeon 
                      ? 'bg-gradient-to-r from-[#00f0ff] to-[#00c0ff] hover:from-[#00c0ff] hover:to-[#00f0ff] text-black shadow-[0_0_20px_rgba(0,240,255,0.3)]' 
                      : 'bg-indigo-600 hover:bg-indigo-700 text-white'
                  }`}
                  disabled={isProcessing}
                >
                  <Scissors className="size-4 mr-2" />
                  Generate Chunks
                </Button>
                <Button 
                  onClick={loadSampleText} 
                  variant="outline" 
                  className={isNeon ? 'border-[#8b5cf6]/30 text-[#8b5cf6] hover:bg-[#8b5cf6]/10' : 'border-indigo-300 text-indigo-700 hover:bg-indigo-50'}
                  disabled={isProcessing}
                >
                  Load Sample
                </Button>
              </div>
            </div>
          </Card>

          {/* Chunks Output */}
          <Card className={`p-6 ${
            isNeon 
              ? 'bg-[#141420]/80 backdrop-blur-sm border-2 border-[#8b5cf6]/20 shadow-[0_0_20px_rgba(139,92,246,0.1)]' 
              : 'bg-white/80 backdrop-blur-sm border-2 border-purple-100'
          }`}>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Scissors className={`size-5 ${isNeon ? 'text-[#8b5cf6]' : 'text-purple-600'}`} />
                <h3 className={isNeon ? 'text-[#8b5cf6]' : 'text-purple-700'}>Generated Chunks</h3>
              </div>
              {chunks.length > 0 && (
                <Badge 
                  variant="secondary" 
                  className={isNeon ? 'bg-[#8b5cf6]/20 text-[#8b5cf6] border-[#8b5cf6]/30' : 'bg-purple-100 text-purple-700 border-purple-200'}
                >
                  {chunks.length} chunks
                </Badge>
              )}
            </div>

            <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
              {chunks.length === 0 ? (
                <div className={`text-center py-12 ${isNeon ? 'text-[#6060a0]' : 'text-gray-400'}`}>
                  <Scissors className="size-12 mx-auto mb-3 opacity-50" />
                  <p>No chunks generated yet</p>
                  <p className="text-sm mt-1">Upload or paste text to get started</p>
                </div>
              ) : (
                chunks.map((chunk, index) => (
                  <Card 
                    key={chunk.id} 
                    className={`p-4 ${
                      isNeon 
                        ? 'bg-gradient-to-br from-[#8b5cf6]/10 to-[#00f0ff]/10 border border-[#8b5cf6]/30 hover:shadow-[0_0_15px_rgba(139,92,246,0.3)]' 
                        : 'bg-gradient-to-br from-purple-50 to-indigo-50 border border-purple-200 hover:shadow-md'
                    } transition-all`}
                  >
                    <div className="flex items-start gap-3">
                      <Badge 
                        className={isNeon 
                          ? 'bg-gradient-to-r from-[#8b5cf6] to-[#00f0ff] shrink-0 shadow-[0_0_10px_rgba(139,92,246,0.5)]' 
                          : 'bg-gradient-to-r from-purple-600 to-indigo-600 shrink-0'
                        }
                      >
                        {index + 1}
                      </Badge>
                      <div className="flex-1">
                        <p className={`text-sm leading-relaxed ${isNeon ? 'text-[#c0c0ff]' : 'text-gray-700'}`}>
                          {chunk.text}
                        </p>
                        <div className="flex items-center gap-3 mt-2 flex-wrap">
                          <Badge 
                            variant="outline" 
                            className={`text-xs ${
                              isNeon 
                                ? 'border-[#00f0ff]/30 text-[#00f0ff]' 
                                : 'border-indigo-300 text-indigo-700'
                            }`}
                          >
                            {chunk.text.length} chars
                          </Badge>
                          {chunk.overlapStart && (
                            <Badge 
                              variant="outline" 
                              className={`text-xs ${
                                isNeon 
                                  ? 'border-[#39ff14]/30 text-[#39ff14]' 
                                  : 'border-green-300 text-green-700'
                              }`}
                            >
                              Overlap: {chunk.overlapStart.split(' ').length} words
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </Card>
                ))
              )}
            </div>
          </Card>
        </div>

        {/* Next Button */}
        {chunks.length > 0 && (
          <div className="flex justify-end">
            <Button 
              onClick={onNext} 
              size="lg" 
              className={isNeon 
                ? 'bg-gradient-to-r from-[#00f0ff] to-[#8b5cf6] hover:from-[#00c0ff] hover:to-[#7c4ce6] text-black shadow-[0_0_30px_rgba(0,240,255,0.4)]' 
                : 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white'
              }
            >
              Continue to Similarity Analysis
              <ArrowRight className="size-4 ml-2" />
            </Button>
          </div>
        )}
      </div>
    </>
  );
}

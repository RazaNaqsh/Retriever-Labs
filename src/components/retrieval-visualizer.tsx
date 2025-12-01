import { useState } from 'react';
import { ArrowLeft, Send, Sparkles, FileText } from 'lucide-react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { Badge } from './ui/badge';
import type { Chunk } from '../App';
import type { Theme } from '../App';

type RetrievalVisualizerProps = {
  chunks: Chunk[];
  onBack: () => void;
  theme: Theme;
};

function cosineSimilarity(a: number[], b: number[]): number {
  const dotProduct = a.reduce((sum, val, i) => sum + val * b[i], 0);
  const magnitudeA = Math.sqrt(a.reduce((sum, val) => sum + val * val, 0));
  const magnitudeB = Math.sqrt(b.reduce((sum, val) => sum + val * val, 0));
  return dotProduct / (magnitudeA * magnitudeB);
}

type Message = {
  query: string;
  response: string;
  retrievedChunks: { chunk: Chunk; similarity: number }[];
};

export function RetrievalVisualizer({ chunks, onBack, theme }: RetrievalVisualizerProps) {
  const [query, setQuery] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  
  const isNeon = theme === 'neon';

  const handleSubmit = () => {
    if (!query.trim() || chunks.length === 0) return;

    setIsGenerating(true);

    // Simulate query embedding
    const queryEmbedding = Array.from({ length: 3 }, () => Math.random() * 2 - 1);

    // Calculate similarities and retrieve top chunks
    const similarities = chunks
      .filter(chunk => chunk.embedding && chunk.embedding.length >= 3)
      .map((chunk) => ({
        chunk,
        similarity: cosineSimilarity(chunk.embedding!, queryEmbedding),
      }))
      .sort((a, b) => b.similarity - a.similarity);

    const topChunks = similarities.slice(0, 3);

    if (topChunks.length === 0) {
      setIsGenerating(false);
      return;
    }

    // Simulate response generation
    setTimeout(() => {
      const mockResponse = `Based on the retrieved context, ${query.toLowerCase().includes('how') ? 'the process involves' : 'we can understand that'} the information from the most relevant chunks. ${topChunks[0].chunk.text.substring(0, 150)}... This demonstrates the key concepts related to your query.`;

      setMessages([...messages, {
        query,
        response: mockResponse,
        retrievedChunks: topChunks,
      }]);

      setQuery('');
      setIsGenerating(false);
    }, 1500);
  };

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className={`mb-2 ${isNeon ? 'text-[#ff00ff]' : 'text-indigo-700'}`}>Step 3: Generate Responses</h2>
        <p className={isNeon ? 'text-[#9090aa]' : 'text-gray-600'}>
          Ask questions and see how retrieved chunks enhance AI responses
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {/* Query Input */}
        <Card className={`md:col-span-2 p-6 ${isNeon ? 'bg-[#141420]/80 backdrop-blur-sm border-2 border-[#00f0ff]/20 shadow-[0_0_20px_rgba(0,240,255,0.1)]' : 'bg-white/80 backdrop-blur-sm border-2 border-indigo-100'}`}>
          <div className="flex items-center gap-2 mb-4">
            <Send className={`size-5 ${isNeon ? 'text-[#00f0ff]' : 'text-indigo-600'}`} />
            <h3 className={isNeon ? 'text-[#00f0ff]' : 'text-indigo-700'}>Ask a Question</h3>
          </div>

          <div className="space-y-4">
            <Textarea
              placeholder="Ask a question about your document..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmit();
                }
              }}
              className={`min-h-[100px] resize-none ${isNeon ? 'bg-[#1a1a2e] border-[#2a2a40] text-[#e0e0ff] placeholder:text-[#6060a0] focus:border-[#00f0ff]/50' : ''}`}
              disabled={isGenerating}
            />

            <Button 
              onClick={handleSubmit} 
              className={`w-full ${isNeon ? 'bg-linear-to-r from-[#00f0ff] to-[#00c0ff] hover:from-[#00c0ff] hover:to-[#00f0ff] text-black shadow-[0_0_20px_rgba(0,240,255,0.3)]' : 'bg-indigo-600 hover:bg-indigo-700'}`}
              disabled={isGenerating || !query.trim()}
            >
              {isGenerating ? (
                <>
                  <Sparkles className="size-4 mr-2 animate-spin" />
                  Generating Response...
                </>
              ) : (
                <>
                  <Send className="size-4 mr-2" />
                  Generate Response
                </>
              )}
            </Button>

            <div className={`pt-4 border-t ${isNeon ? 'border-[#2a2a40]' : 'border-gray-200'}`}>
              <p className={`text-sm mb-3 ${isNeon ? 'text-[#9090aa]' : 'text-gray-600'}`}>Try these sample questions:</p>
              <div className="space-y-2">
                <Button
                  variant="outline"
                  size="sm"
                  className={`w-full justify-start text-sm ${isNeon ? 'border-[#00f0ff]/30 text-[#00f0ff] hover:bg-[#00f0ff]/10' : ''}`}
                  onClick={() => setQuery("What is Retrieval Augmented Generation?")}
                  disabled={isGenerating}
                >
                  What is Retrieval Augmented Generation?
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className={`w-full justify-start text-sm ${isNeon ? 'border-[#00f0ff]/30 text-[#00f0ff] hover:bg-[#00f0ff]/10' : ''}`}
                  onClick={() => setQuery("How are documents processed in RAG?")}
                  disabled={isGenerating}
                >
                  How are documents processed in RAG?
                </Button>
              </div>
            </div>
          </div>
        </Card>

        {/* Info Panel */}
        <Card className={`p-6 ${isNeon ? 'bg-linear-to-br from-[#8b5cf6]/10 to-[#00f0ff]/10 border-2 border-[#8b5cf6]/30 shadow-[0_0_20px_rgba(139,92,246,0.1)]' : 'bg-linear-to-br from-purple-50 to-indigo-50 border-2 border-purple-100'}`}>
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className={`size-5 ${isNeon ? 'text-[#8b5cf6]' : 'text-purple-600'}`} />
            <h3 className={isNeon ? 'text-[#8b5cf6]' : 'text-purple-700'}>How It Works</h3>
          </div>
          
          <div className={`space-y-3 text-sm ${isNeon ? 'text-[#c0c0ff]' : 'text-gray-700'}`}>
            <div className="flex gap-3">
              <div className={`shrink-0 size-6 rounded-full flex items-center justify-center ${isNeon ? 'bg-linear-to-r from-[#8b5cf6] to-[#00f0ff] text-black shadow-[0_0_10px_rgba(139,92,246,0.5)]' : 'bg-purple-600 text-white'}`}>
                1
              </div>
              <p>Your query is converted to an embedding vector</p>
            </div>
            <div className="flex gap-3">
              <div className={`shrink-0 size-6 rounded-full flex items-center justify-center ${isNeon ? 'bg-linear-to-r from-[#8b5cf6] to-[#00f0ff] text-black shadow-[0_0_10px_rgba(139,92,246,0.5)]' : 'bg-purple-600 text-white'}`}>
                2
              </div>
              <p>Most similar chunks are retrieved using cosine similarity</p>
            </div>
            <div className="flex gap-3">
              <div className={`shrink-0 size-6 rounded-full flex items-center justify-center ${isNeon ? 'bg-linear-to-r from-[#8b5cf6] to-[#00f0ff] text-black shadow-[0_0_10px_rgba(139,92,246,0.5)]' : 'bg-purple-600 text-white'}`}>
                3
              </div>
              <p>Retrieved context is used to generate an informed response</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Conversation History */}
      <div className="space-y-6">
        {messages.map((message, index) => (
          <div key={index} className="space-y-4">
            {/* Query */}
            <div className="flex justify-end">
              <Card className={isNeon ? 'max-w-2xl p-4 bg-linear-to-r from-[#00f0ff] to-[#00c0ff] text-black border-0 shadow-[0_0_20px_rgba(0,240,255,0.4)]' : 'max-w-2xl p-4 bg-indigo-600 text-white border-0'}>
                <p className="leading-relaxed">{message.query}</p>
              </Card>
            </div>

            {/* Retrieved Chunks */}
            <Card className={`p-6 ${isNeon ? 'bg-[#141420]/80 backdrop-blur-sm border-2 border-[#39ff14]/20 shadow-[0_0_20px_rgba(57,255,20,0.1)]' : 'bg-white/80 backdrop-blur-sm border-2 border-green-100'}`}>
              <div className="flex items-center gap-2 mb-4">
                <FileText className={`size-5 ${isNeon ? 'text-[#39ff14]' : 'text-green-600'}`} />
                <h4 className={isNeon ? 'text-[#39ff14]' : 'text-green-700'}>Retrieved Chunks</h4>
                <Badge variant="secondary" className={isNeon ? 'bg-[#39ff14]/20 text-[#39ff14] border-[#39ff14]/30' : ''}>{message.retrievedChunks.length} chunks</Badge>
              </div>

              <div className="grid md:grid-cols-3 gap-3">
                {message.retrievedChunks.map((item, idx) => (
                  <Card key={item.chunk.id} className={`p-4 ${isNeon ? 'bg-linear-to-br from-[#39ff14]/10 to-[#00ff00]/10 border border-[#39ff14]/30 hover:shadow-[0_0_15px_rgba(57,255,20,0.3)]' : 'bg-linear-to-br from-green-50 to-emerald-50 border border-green-200'} transition-all`}>
                    <div className="flex items-start justify-between mb-2">
                      <Badge className={isNeon ? 'bg-linear-to-r from-[#39ff14] to-[#00ff00] text-black shadow-[0_0_10px_rgba(57,255,20,0.5)]' : 'bg-green-600'}>
                        Rank {idx + 1}
                      </Badge>
                      <Badge variant="outline" className={isNeon ? 'text-[#39ff14] border-[#39ff14]/50' : 'text-green-700 border-green-300'}>
                        {(item.similarity * 100).toFixed(0)}% match
                      </Badge>
                    </div>
                    <p className={`text-sm leading-relaxed line-clamp-4 ${isNeon ? 'text-[#c0c0ff]' : 'text-gray-700'}`}>
                      {item.chunk.text}
                    </p>
                  </Card>
                ))}
              </div>
            </Card>

            {/* Response */}
            <div className="flex justify-start">
              <Card className={`max-w-2xl p-4 ${isNeon ? 'bg-linear-to-br from-[#8b5cf6]/10 to-[#ff00ff]/10 border-2 border-[#8b5cf6]/30 shadow-[0_0_20px_rgba(139,92,246,0.2)]' : 'bg-linear-to-br from-purple-50 to-indigo-50 border-2 border-purple-200'}`}>
                <div className="flex items-center gap-2 mb-3">
                  <Sparkles className={`size-4 ${isNeon ? 'text-[#8b5cf6]' : 'text-purple-600'}`} />
                  <span className={`text-sm ${isNeon ? 'text-[#8b5cf6]' : 'text-purple-700'}`}>AI Response</span>
                </div>
                <p className={`leading-relaxed ${isNeon ? 'text-[#c0c0ff]' : 'text-gray-700'}`}>{message.response}</p>
              </Card>
            </div>
          </div>
        ))}

        {messages.length === 0 && (
          <Card className={`p-12 text-center border-2 border-dashed ${isNeon ? 'bg-[#141420]/50 backdrop-blur-sm border-[#2a2a40]' : 'bg-white/50 backdrop-blur-sm border-gray-300'}`}>
            <Sparkles className={`size-12 mx-auto mb-3 ${isNeon ? 'text-[#6060a0]' : 'text-gray-400'}`} />
            <p className={isNeon ? 'text-[#9090aa]' : 'text-gray-500'}>No queries yet</p>
            <p className={`text-sm mt-1 ${isNeon ? 'text-[#6060a0]' : 'text-gray-400'}`}>Ask a question to see retrieval-augmented generation in action</p>
          </Card>
        )}
      </div>

      {/* Back Button */}
      <div className="flex justify-start">
        <Button onClick={onBack} variant="outline" size="lg" className={isNeon ? 'border-[#ff00ff]/30 text-[#ff00ff] hover:bg-[#ff00ff]/10' : ''}>
          <ArrowLeft className="size-4 mr-2" />
          Back to Similarity Analysis
        </Button>
      </div>
    </div>
  );
}
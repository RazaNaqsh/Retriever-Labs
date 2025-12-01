import { useState } from 'react';
import { ArrowRight, ArrowLeft, Search, Activity, Box, Maximize2 } from 'lucide-react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Badge } from './ui/badge';
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend } from 'recharts';
import { Embedding3DView } from './embedding-3d-view';
import type { Chunk } from '../App';
import type { Theme } from '../App';

type SimilarityVisualizerProps = {
  chunks: Chunk[];
  queryEmbedding: number[] | null;
  setQueryEmbedding: (embedding: number[] | null) => void;
  onNext: () => void;
  onBack: () => void;
  theme: Theme;
};

type ViewMode = '2d' | '3d';

function cosineSimilarity(a: number[], b: number[]): number {
  const dotProduct = a.reduce((sum, val, i) => sum + val * b[i], 0);
  const magnitudeA = Math.sqrt(a.reduce((sum, val) => sum + val * val, 0));
  const magnitudeB = Math.sqrt(b.reduce((sum, val) => sum + val * val, 0));
  return dotProduct / (magnitudeA * magnitudeB);
}

export function SimilarityVisualizer({ chunks, queryEmbedding, setQueryEmbedding, onNext, onBack, theme }: SimilarityVisualizerProps) {
  const [queryText, setQueryText] = useState('');
  const [similarities, setSimilarities] = useState<{ chunkId: string; similarity: number; text: string }[]>([]);
  const [viewMode, setViewMode] = useState<ViewMode>('2d');
  
  const isNeon = theme === 'neon';

  const handleQuerySubmit = () => {
    if (queryText.trim()) {
      const mockQueryEmbedding = Array.from({ length: 3 }, () => Math.random() * 2 - 1);
      setQueryEmbedding(mockQueryEmbedding);

      const sims = chunks.map((chunk) => ({
        chunkId: chunk.id,
        similarity: cosineSimilarity(chunk.embedding!, mockQueryEmbedding),
        text: chunk.text,
      })).sort((a, b) => b.similarity - a.similarity);

      setSimilarities(sims);
    }
  };

  // Prepare data for embedding visualization
  const chunkEmbeddings = chunks
    .filter(chunk => chunk.embedding && chunk.embedding.length >= 3)
    .map((chunk, index) => ({
      name: `Chunk ${index + 1}`,
      x: chunk.embedding![0],
      y: chunk.embedding![1],
      id: chunk.id,
    }));

  const queryData = (queryEmbedding && queryEmbedding.length >= 3) ? [{
    name: 'Query',
    x: queryEmbedding[0],
    y: queryEmbedding[1],
    id: 'query',
  }] : [];

  // Prepare data for similarity chart
  const similarityData = similarities.map((sim) => ({
    name: `Chunk ${chunks.findIndex(c => c.id === sim.chunkId) + 1}`,
    similarity: Number((sim.similarity * 100).toFixed(1)),
    chunkId: sim.chunkId,
  }));

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className={`mb-2 ${isNeon ? 'text-[#8b5cf6]' : 'text-indigo-700'}`}>Step 2: Explore Similarity</h2>
        <p className={isNeon ? 'text-[#9090aa]' : 'text-gray-600'}>
          Visualize embeddings and compute similarity scores
        </p>
      </div>

      <Tabs defaultValue="embeddings" className="w-full">
        <TabsList className={`grid w-full max-w-md mx-auto grid-cols-2 ${isNeon ? 'bg-[#1a1a2e] border border-[#8b5cf6]/30' : 'bg-white'}`}>
          <TabsTrigger value="embeddings" className={isNeon ? 'data-[state=active]:bg-[#8b5cf6]/20 data-[state=active]:text-[#8b5cf6] text-gray-400' : ''}>
            <Activity className="size-4 mr-2" />
            Embedding Space
          </TabsTrigger>
          <TabsTrigger value="similarity" className={isNeon ? 'data-[state=active]:bg-[#ff00ff]/20 data-[state=active]:text-[#ff00ff] text-gray-400' : ''}>
            <Search className="size-4 mr-2" />
            Similarity Search
          </TabsTrigger>
        </TabsList>

        <TabsContent value="embeddings" className="mt-6">
          <Card className={`p-6 ${isNeon ? 'bg-[#141420]/80 backdrop-blur-sm border-2 border-[#8b5cf6]/20 shadow-[0_0_20px_rgba(139,92,246,0.1)]' : 'bg-white/80 backdrop-blur-sm border-2 border-indigo-100'}`}>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className={`mb-2 ${isNeon ? 'text-[#8b5cf6]' : 'text-indigo-700'}`}>Embedding Visualization</h3>
                <p className={`text-sm ${isNeon ? 'text-[#9090aa]' : 'text-gray-600'}`}>
                  Each chunk is represented as a point in embedding space. Closer points have similar semantic meaning.
                </p>
              </div>
              
              {/* View Mode Toggle */}
              <div className={`flex gap-2 p-1 rounded-lg ${isNeon ? 'bg-[#1a1a2e] border border-[#8b5cf6]/30' : 'bg-gray-100'}`}>
                <button
                  onClick={() => setViewMode('2d')}
                  className={`
                    px-3 py-2 rounded-md transition-all flex items-center gap-2
                    ${viewMode === '2d'
                      ? isNeon
                        ? 'bg-[#8b5cf6]/20 text-[#8b5cf6] shadow-[0_0_10px_rgba(139,92,246,0.3)]'
                        : 'bg-indigo-600 text-white'
                      : isNeon
                      ? 'text-[#9090aa] hover:text-[#e0e0ff]'
                      : 'text-gray-600 hover:text-gray-900'
                    }
                  `}
                >
                  <Maximize2 className="size-4" />
                  2D
                </button>
                <button
                  onClick={() => setViewMode('3d')}
                  className={`
                    px-3 py-2 rounded-md transition-all flex items-center gap-2
                    ${viewMode === '3d'
                      ? isNeon
                        ? 'bg-[#8b5cf6]/20 text-[#8b5cf6] shadow-[0_0_10px_rgba(139,92,246,0.3)]'
                        : 'bg-indigo-600 text-white'
                      : isNeon
                      ? 'text-[#9090aa] hover:text-[#e0e0ff]'
                      : 'text-gray-600 hover:text-gray-900'
                    }
                  `}
                >
                  <Box className="size-4" />
                  3D
                </button>
              </div>
            </div>

            <div className={`rounded-lg p-4 ${isNeon ? 'bg-linear-to-br from-[#1a1a2e] to-[#0a0a0f] border border-[#8b5cf6]/20' : 'bg-linear-to-br from-indigo-50 to-purple-50'}`}>
              {viewMode === '2d' ? (
                <ResponsiveContainer width="100%" height={400}>
                  <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke={isNeon ? '#2a2a40' : '#e0e7ff'} />
                    <XAxis type="number" dataKey="x" name="Dimension 1" stroke={isNeon ? '#8b5cf6' : '#6366f1'} />
                    <YAxis type="number" dataKey="y" name="Dimension 2" stroke={isNeon ? '#8b5cf6' : '#6366f1'} />
                    <Tooltip 
                      cursor={{ strokeDasharray: '3 3' }}
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          const data = payload[0].payload;
                          const chunk = chunks.find(c => c.id === data.id);
                          return (
                            <div className={`p-3 rounded-lg shadow-lg max-w-xs ${
                              isNeon 
                                ? 'bg-[#1a1a2e] border-2 border-[#8b5cf6] text-[#e0e0ff]' 
                                : 'bg-white border-2 border-indigo-200 text-gray-900'
                            }`}>
                              <div className={`mb-1 ${isNeon ? 'text-[#8b5cf6]' : 'text-indigo-700'}`}>
                                {data.name}
                              </div>
                              <div className={`text-sm ${isNeon ? 'text-[#c0c0ff]' : 'text-gray-700'}`}>
                                {chunk ? `${chunk.text.substring(0, 120)}${chunk.text.length > 120 ? '...' : ''}` : data.name}
                              </div>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Scatter data={chunkEmbeddings} fill={isNeon ? '#8b5cf6' : '#6366f1'} name="Chunks" />
                    {queryData.length > 0 && (
                      <Scatter data={queryData} fill={isNeon ? '#ff00ff' : '#ec4899'} name="Query" />
                    )}
                  </ScatterChart>
                </ResponsiveContainer>
              ) : (
                <Embedding3DView chunks={chunks} queryEmbedding={queryEmbedding} theme={theme} />
              )}
            </div>

            <div className="mt-4 flex gap-4 text-sm">
              <div className="flex items-center gap-2">
                <div className={`size-3 rounded-full ${isNeon ? 'bg-[#8b5cf6] shadow-[0_0_10px_rgba(139,92,246,0.8)]' : 'bg-indigo-600'}`} />
                <span className={isNeon ? 'text-[#9090aa]' : 'text-gray-600'}>Document Chunks</span>
              </div>
              {queryEmbedding && (
                <div className="flex items-center gap-2">
                  <div className={`size-3 rounded-full ${isNeon ? 'bg-[#ff00ff] shadow-[0_0_10px_rgba(255,0,255,0.8)]' : 'bg-pink-600'}`} />
                  <span className={isNeon ? 'text-[#9090aa]' : 'text-gray-600'}>Query</span>
                </div>
              )}
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="similarity" className="mt-6">
          <div className="grid md:grid-cols-2 gap-6">
            <Card className={`p-6 ${isNeon ? 'bg-[#141420]/80 backdrop-blur-sm border-2 border-[#ff00ff]/20 shadow-[0_0_20px_rgba(255,0,255,0.1)]' : 'bg-white/80 backdrop-blur-sm border-2 border-purple-100'}`}>
              <div className="flex items-center gap-2 mb-4">
                <Search className={`size-5 ${isNeon ? 'text-[#ff00ff]' : 'text-purple-600'}`} />
                <h3 className={isNeon ? 'text-[#ff00ff]' : 'text-purple-700'}>Query Input</h3>
              </div>

              <div className="space-y-4">
                <Input
                  placeholder="Enter your query..."
                  value={queryText}
                  onChange={(e) => setQueryText(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleQuerySubmit()}
                  className={isNeon ? 'bg-[#1a1a2e] border-[#2a2a40] text-[#e0e0ff] placeholder:text-[#6060a0] focus:border-[#ff00ff]/50' : ''}
                />

                <Button onClick={handleQuerySubmit} className={`w-full ${isNeon ? 'bg-linear-to-r from-[#ff00ff] to-[#ff0080] hover:from-[#ff0080] hover:to-[#ff00ff] text-black shadow-[0_0_20px_rgba(255,0,255,0.3)]' : 'bg-purple-600 hover:bg-purple-700'}`}>
                  <Search className="size-4 mr-2" />
                  Compute Similarity
                </Button>

                <div className={`pt-4 border-t ${isNeon ? 'border-[#2a2a40]' : 'border-gray-200'}`}>
                  <p className={`text-sm mb-3 ${isNeon ? 'text-[#9090aa]' : 'text-gray-600'}`}>Try these sample queries:</p>
                  <div className="space-y-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className={`w-full justify-start ${isNeon ? 'border-[#ff00ff]/30 text-[#ff00ff] hover:bg-[#ff00ff]/10' : ''}`}
                      onClick={() => {
                        const query = "How does RAG work?";
                        setQueryText(query);
                        const mockQueryEmbedding = Array.from({ length: 3 }, () => Math.random() * 2 - 1);
                        setQueryEmbedding(mockQueryEmbedding);
                        const sims = chunks.map((chunk) => ({
                          chunkId: chunk.id,
                          similarity: cosineSimilarity(chunk.embedding!, mockQueryEmbedding),
                          text: chunk.text,
                        })).sort((a, b) => b.similarity - a.similarity);
                        setSimilarities(sims);
                      }}
                    >
                      How does RAG work?
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className={`w-full justify-start ${isNeon ? 'border-[#ff00ff]/30 text-[#ff00ff] hover:bg-[#ff00ff]/10' : ''}`}
                      onClick={() => {
                        const query = "What are embeddings?";
                        setQueryText(query);
                        const mockQueryEmbedding = Array.from({ length: 3 }, () => Math.random() * 2 - 1);
                        setQueryEmbedding(mockQueryEmbedding);
                        const sims = chunks.map((chunk) => ({
                          chunkId: chunk.id,
                          similarity: cosineSimilarity(chunk.embedding!, mockQueryEmbedding),
                          text: chunk.text,
                        })).sort((a, b) => b.similarity - a.similarity);
                        setSimilarities(sims);
                      }}
                    >
                      What are embeddings?
                    </Button>
                  </div>
                </div>
              </div>
            </Card>

            <Card className={`p-6 ${isNeon ? 'bg-[#141420]/80 backdrop-blur-sm border-2 border-[#00f0ff]/20 shadow-[0_0_20px_rgba(0,240,255,0.1)]' : 'bg-white/80 backdrop-blur-sm border-2 border-indigo-100'}`}>
              <div className="flex items-center gap-2 mb-4">
                <Activity className={`size-5 ${isNeon ? 'text-[#00f0ff]' : 'text-indigo-600'}`} />
                <h3 className={isNeon ? 'text-[#00f0ff]' : 'text-indigo-700'}>Similarity Scores</h3>
              </div>

              {similarities.length === 0 ? (
                <div className={`text-center py-12 ${isNeon ? 'text-[#6060a0]' : 'text-gray-400'}`}>
                  <Search className="size-12 mx-auto mb-3 opacity-50" />
                  <p>No query yet</p>
                  <p className="text-sm mt-1">Enter a query to see similarity scores</p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className={`rounded-lg p-4 ${isNeon ? 'bg-linear-to-br from-[#1a1a2e] to-[#0a0a0f] border border-[#00f0ff]/20' : 'bg-linear-to-br from-indigo-50 to-purple-50'}`}>
                    <ResponsiveContainer width="100%" height={250}>
                      <BarChart data={similarityData}>
                        <CartesianGrid strokeDasharray="3 3" stroke={isNeon ? '#2a2a40' : '#e0e7ff'} />
                        <XAxis dataKey="name" stroke={isNeon ? '#00f0ff' : '#6366f1'} />
                        <YAxis stroke={isNeon ? '#00f0ff' : '#6366f1'} />
                        <Tooltip 
                          contentStyle={{ background: isNeon ? '#1a1a2e' : 'white', border: isNeon ? '2px solid #00f0ff' : '2px solid #e0e7ff', borderRadius: '8px', color: isNeon ? '#e0e0ff' : '#000' }}
                        />
                        <Legend />
                        <Bar dataKey="similarity" fill={isNeon ? '#00f0ff' : '#6366f1'} name="Similarity %" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>

                  <div className="space-y-2 max-h-[200px] overflow-y-auto">
                    {similarities.slice(0, 5).map((sim, index) => (
                      <div key={sim.chunkId} className={`flex items-start gap-3 p-3 rounded-lg border transition-all ${isNeon ? 'bg-[#1a1a2e] border-[#00f0ff]/30 hover:shadow-[0_0_15px_rgba(0,240,255,0.2)]' : 'bg-white border-indigo-100'}`}>
                        <Badge className={index === 0 
                          ? isNeon 
                            ? "bg-linear-to-r from-[#39ff14] to-[#00ff00] text-black shadow-[0_0_10px_rgba(57,255,20,0.5)]" 
                            : "bg-green-600"
                          : isNeon 
                            ? "bg-linear-to-r from-[#00f0ff] to-[#00c0ff] text-black shadow-[0_0_10px_rgba(0,240,255,0.5)]"
                            : "bg-indigo-600"
                        }>
                          {(sim.similarity * 100).toFixed(1)}%
                        </Badge>
                        <p className={`text-sm leading-relaxed flex-1 ${isNeon ? 'text-[#c0c0ff]' : 'text-gray-700'}`}>
                          {sim.text.substring(0, 100)}...
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Navigation */}
      <div className="flex justify-between">
        <Button onClick={onBack} variant="outline" size="lg" className={isNeon ? 'border-[#8b5cf6]/30 text-[#8b5cf6] hover:bg-[#8b5cf6]/10' : ''}>
          <ArrowLeft className="size-4 mr-2" />
          Back to Chunking
        </Button>
        <Button onClick={onNext} size="lg" className={isNeon ? 'bg-linear-to-r from-[#8b5cf6] to-[#ff00ff] hover:from-[#7c4ce6] hover:to-[#ff0080] text-black shadow-[0_0_30px_rgba(139,92,246,0.4)]' : 'bg-indigo-600 hover:bg-indigo-700'}>
          Continue to Retrieval
          <ArrowRight className="size-4 ml-2" />
        </Button>
      </div>
    </div>
  );
}
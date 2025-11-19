import { useState } from 'react';
import { HeroSection } from './components/hero-section';
import { StageStepper } from './components/stage-stepper';
import { ChunkVisualizer } from './components/chunk-visualizer';
import { SimilarityVisualizer } from './components/similarity-visualizer';
import { RetrievalVisualizer } from './components/retrieval-visualizer';

export type Chunk = {
  id: string;
  text: string;
  embedding?: number[];
  overlapStart?: string;
  overlapEnd?: string;
};

export type Theme = 'neon' | 'light';

export default function App() {
  const [currentStage, setCurrentStage] = useState(0);
  const [chunks, setChunks] = useState<Chunk[]>([]);
  const [queryEmbedding, setQueryEmbedding] = useState<number[] | null>(null);
  const [theme, setTheme] = useState<Theme>('neon');

  const stages = [
    { id: 0, title: 'Chunk Visualizer', description: 'Split text into chunks' },
    { id: 1, title: 'Similarity Visualizer', description: 'Explore embeddings' },
    { id: 2, title: 'Retrieval Visualizer', description: 'Generate responses' },
  ];

  return (
    <div className={`min-h-screen ${theme === 'neon' ? 'bg-[#0a0a0f] bg-[radial-gradient(ellipse_at_top,#1a0a2e,#0a0a0f)]' : 'bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50'}`}>
      <HeroSection theme={theme} setTheme={setTheme} />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <StageStepper 
          stages={stages} 
          currentStage={currentStage}
          onStageChange={setCurrentStage}
          theme={theme}
        />

        <div className="mt-12">
          {currentStage === 0 && (
            <ChunkVisualizer 
              chunks={chunks}
              setChunks={setChunks}
              onNext={() => setCurrentStage(1)}
              theme={theme}
            />
          )}
          
          {currentStage === 1 && (
            <SimilarityVisualizer 
              chunks={chunks}
              queryEmbedding={queryEmbedding}
              setQueryEmbedding={setQueryEmbedding}
              onNext={() => setCurrentStage(2)}
              onBack={() => setCurrentStage(0)}
              theme={theme}
            />
          )}
          
          {currentStage === 2 && (
            <RetrievalVisualizer 
              chunks={chunks}
              onBack={() => setCurrentStage(1)}
              theme={theme}
            />
          )}
        </div>
      </div>
    </div>
  );
}
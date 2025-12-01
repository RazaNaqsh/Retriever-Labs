import { Sparkles, Sun, Moon } from 'lucide-react';
import { Button } from './ui/button';
import type { Theme } from '../App';

type HeroSectionProps = {
  theme: Theme;
  setTheme: (theme: Theme) => void;
};

export function HeroSection({ theme, setTheme }: HeroSectionProps) {
  const isNeon = theme === 'neon';

  return (
    <div className={`relative overflow-hidden ${isNeon ? 'bg-linear-to-br from-[#0a0a0f] via-[#1a0a2e] to-[#0a0a0f] border-b border-[#00f0ff]/20' : 'bg-linear-to-r from-indigo-600 via-purple-600 to-blue-600'} py-24`}>
      {/* Backgrounds */}
      {isNeon ? (
        <>
          {/* Animated grid background */}
          <div className="absolute inset-0 bg-[linear-gradient(rgba(0,240,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(0,240,255,0.03)_1px,transparent_1px)] bg-size-[50px_50px]" />
          
          {/* Neon glow orbs */}
          <div className="absolute top-0 right-1/4 w-96 h-96 bg-[#00f0ff]/10 rounded-full blur-[120px] animate-pulse" />
          <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-[#ff00ff]/10 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '1s' }} />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-[#8b5cf6]/5 rounded-full blur-[150px]" />
        </>
      ) : (
        <>
          <div className="absolute inset-0 bg-grid-white/[0.05] bg-size-[32px_32px]" />
          <div className="absolute top-0 right-0 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl" />
        </>
      )}
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Theme Toggle Button */}
        <div className="flex justify-end mb-4">
          <Button
            onClick={() => setTheme(isNeon ? 'light' : 'neon')}
            className={`${
              isNeon 
                ? 'bg-linear-to-r from-[#00f0ff]/20 to-[#8b5cf6]/20 border border-[#00f0ff]/30 text-[#00f0ff] hover:bg-[#00f0ff]/30' 
                : 'bg-white/20 border border-white/30 text-white hover:bg-white/30'
            } backdrop-blur-sm`}
            variant="outline"
          >
            {isNeon ? (
              <>
                <Sun className="size-4 mr-2" />
                Light Mode
              </>
            ) : (
              <>
                <Moon className="size-4 mr-2" />
                Neon Mode
              </>
            )}
          </Button>
        </div>

        <div className="text-center">
          <div className={`inline-flex items-center gap-2 px-5 py-2 rounded-full ${
            isNeon 
              ? 'bg-linear-to-r from-[#00f0ff]/10 to-[#8b5cf6]/10 backdrop-blur-sm border border-[#00f0ff]/30 shadow-[0_0_20px_rgba(0,240,255,0.3)]' 
              : 'bg-white/10 backdrop-blur-sm border border-white/20'
          } mb-8`}>
            <Sparkles className={`size-4 ${isNeon ? 'text-[#00f0ff] animate-pulse' : 'text-yellow-300'}`} />
            <span className={isNeon ? 'text-[#00f0ff]' : 'text-white/90'}>Interactive RAG Visualization</span>
          </div>
          
          <h1 className={`mb-6 text-5xl ${
            isNeon 
              ? 'text-transparent bg-clip-text bg-linear-to-r from-[#00f0ff] via-[#8b5cf6] to-[#ff00ff] drop-shadow-[0_0_30px_rgba(0,240,255,0.5)]' 
              : 'text-white'
          }`}>
            Retriever Labs
          </h1>
          
          <p className={`text-xl max-w-2xl mx-auto mb-4 ${isNeon ? 'text-[#c0c0ff]' : 'text-white/80'}`}>
            Visualize how Retrieval Augmented Generation works
          </p>
          
          <p className={`max-w-xl mx-auto ${isNeon ? 'text-[#8080b0]' : 'text-white/60'}`}>
            Explore the three stages of RAG: chunking documents, computing similarity, and generating contextual responses
          </p>
        </div>
      </div>
    </div>
  );
}
import { Check } from 'lucide-react';
import type { Theme } from '../App';

type Stage = {
  id: number;
  title: string;
  description: string;
};

type StageStepperProps = {
  stages: Stage[];
  currentStage: number;
  onStageChange: (stage: number) => void;
  theme: Theme;
};

export function StageStepper({ stages, currentStage, onStageChange, theme }: StageStepperProps) {
  const isNeon = theme === 'neon';

  const getNeonColor = (index: number) => {
    const colors = ['#00f0ff', '#8b5cf6', '#ff00ff'];
    return colors[index % colors.length];
  };

  const getLightColor = (index: number) => {
    const colors = ['#6366f1', '#8b5cf6', '#ec4899'];
    return colors[index % colors.length];
  };

  const getColor = (index: number) => isNeon ? getNeonColor(index) : getLightColor(index);

  return (
    <div className="relative py-8">
      {/* Background glow effect - only for neon theme */}
      {isNeon && (
        <div className="absolute inset-0 flex justify-center items-center pointer-events-none">
          <div 
            className="absolute w-[600px] h-[200px] opacity-20 blur-[100px] rounded-full transition-all duration-700"
            style={{
              background: `radial-gradient(circle, ${getNeonColor(currentStage)} 0%, transparent 70%)`,
              transform: `translateX(${(currentStage - 1) * 200}px)`,
            }}
          />
        </div>
      )}

      <div className="relative flex items-center justify-between max-w-4xl mx-auto">
        {stages.map((stage, index) => {
          const isActive = currentStage === stage.id;
          const isCompleted = currentStage > stage.id;
          const color = getColor(index);

          return (
            <div key={stage.id} className="flex-1 relative">
              <div className="flex flex-col items-center">
                {/* Stage button */}
                <button
                  onClick={() => onStageChange(stage.id)}
                  className="relative group"
                >
                  {/* Outer glow ring - neon only */}
                  {isNeon && (
                    <div
                      className={`
                        absolute inset-0 rounded-full transition-all duration-500
                        ${isActive ? 'animate-pulse' : ''}
                      `}
                      style={{
                        boxShadow: isActive 
                          ? `0 0 30px ${color}, 0 0 60px ${color}40`
                          : isCompleted
                          ? `0 0 15px ${color}80`
                          : 'none',
                      }}
                    />
                  )}
                  
                  {/* Main circle */}
                  <div
                    className={`
                      relative size-16 rounded-full flex items-center justify-center
                      transition-all duration-500 border-2
                      ${isActive 
                        ? 'bg-linear-to-br scale-110' 
                        : isCompleted
                        ? 'bg-linear-to-br'
                        : isNeon 
                        ? 'bg-[#1a1a2e] border-[#2a2a40]'
                        : 'bg-white border-gray-200'
                      }
                      group-hover:scale-110
                    `}
                    style={{
                      borderColor: (isActive || isCompleted) ? color : undefined,
                      backgroundImage: (isActive || isCompleted)
                        ? isNeon 
                          ? `linear-gradient(135deg, ${color}20, ${color}10)`
                          : `linear-gradient(135deg, ${color}30, ${color}20)`
                        : undefined,
                      boxShadow: !isNeon && (isActive || isCompleted) 
                        ? `0 4px 12px ${color}40`
                        : undefined,
                    }}
                  >
                    {/* Inner glow - neon only */}
                    {isNeon && (isActive || isCompleted) && (
                      <div 
                        className="absolute inset-2 rounded-full opacity-50"
                        style={{
                          background: `radial-gradient(circle, ${color}40, transparent)`,
                        }}
                      />
                    )}
                    
                    {/* Icon/Number */}
                    <div className="relative z-10">
                      {isCompleted ? (
                        <Check 
                          className="size-7" 
                          style={{ color }}
                        />
                      ) : (
                        <span
                          className="text-xl transition-colors"
                          style={{ 
                            color: isActive ? color : isNeon ? '#6060a0' : '#9ca3af'
                          }}
                        >
                          {stage.id + 1}
                        </span>
                      )}
                    </div>
                  </div>
                </button>
                
                {/* Label */}
                <div className="mt-4 text-center max-w-[150px]">
                  <div 
                    className="transition-all duration-300"
                    style={{
                      color: isActive ? color : isNeon ? '#9090aa' : '#6b7280',
                    }}
                  >
                    {stage.title}
                  </div>
                  <div className={`text-xs mt-1 leading-tight ${isNeon ? 'text-[#6060a0]' : 'text-gray-500'}`}>
                    {stage.description}
                  </div>
                </div>
              </div>
              
              {/* Connector line */}
              {index < stages.length - 1 && (
                <div className="absolute top-8 left-[calc(50%+2rem)] right-0 h-0.5 z-0">
                  {/* Background line */}
                  <div className={`h-full relative overflow-hidden ${isNeon ? 'bg-[#2a2a40]' : 'bg-gray-200'}`}>
                    {/* Animated progress line */}
                    <div 
                      className="h-full absolute left-0 top-0 transition-all duration-700 ease-out"
                      style={{
                        width: currentStage > stage.id ? '100%' : '0%',
                        background: `linear-gradient(90deg, ${getColor(index)}, ${getColor(index + 1)})`,
                        boxShadow: currentStage > stage.id && isNeon
                          ? `0 0 10px ${getColor(index)}, 0 0 20px ${getColor(index + 1)}`
                          : 'none',
                      }}
                    />
                    
                    {/* Animated flowing particles effect - neon only */}
                    {isNeon && currentStage > stage.id && (
                      <div
                        className="h-full absolute left-0 top-0 w-full overflow-hidden"
                        style={{
                          background: `linear-gradient(90deg, transparent, ${getColor(index)}60, transparent)`,
                          animation: 'flow 2s linear infinite',
                        }}
                      />
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <style>{`
        @keyframes flow {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(100%);
          }
        }
      `}</style>
    </div>
  );
}
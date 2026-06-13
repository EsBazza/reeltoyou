'use client';

import { Heart } from 'lucide-react';

interface ProgressIndicatorProps {
  currentStep: 'movie' | 'quote' | 'clip' | 'dedication';
  onStepClick?: (step: 'movie' | 'quote' | 'clip' | 'dedication') => void;
  completedSteps: Set<'movie' | 'quote' | 'clip' | 'dedication'>;
}

export function ProgressIndicator({ currentStep, onStepClick, completedSteps }: ProgressIndicatorProps) {
  const steps = [
    { id: 'movie', label: 'Film' },
    { id: 'quote', label: 'Line' },
    { id: 'clip', label: 'Scene' },
    { id: 'dedication', label: 'Note' },
  ] as const;

  return (
    <nav className="w-full flex items-center justify-between px-2 mb-12">
      {steps.map((step, index) => {
        const isActive = currentStep === step.id;
        const isCompleted = completedSteps.has(step.id);
        const isLast = index === steps.length - 1;

        return (
          <div key={step.id} className="flex items-center flex-1 last:flex-initial">
            <button
              onClick={() => isCompleted || isActive ? onStepClick?.(step.id) : null}
              disabled={!isCompleted && !isActive}
              className={`group flex flex-col items-center space-y-2 focus:outline-none transition-all ${
                isActive ? 'opacity-100' : isCompleted ? 'opacity-60 hover:opacity-100' : 'opacity-20'
              }`}
            >
              <div className="relative flex items-center justify-center">
                {isActive && (
                  <div className="absolute -inset-2 rounded-full bg-accent/10 animate-ping duration-[2000ms]" />
                )}
                <div className={`transition-all duration-500 ${isActive ? 'scale-110' : 'scale-100'}`}>
                  {isCompleted || isActive ? (
                    <Heart className={`w-4 h-4 transition-colors ${
                      isActive ? 'text-accent fill-current' : 'text-foreground fill-current opacity-40'
                    }`} />
                  ) : (
                    <div className="w-2 h-2 rounded-full bg-muted-color" />
                  )}
                </div>
              </div>
              <span className={`text-[9px] font-serif uppercase tracking-widest transition-colors ${
                isActive ? 'text-accent font-bold' : 'text-gray-400'
              }`}>
                {step.label}
              </span>
            </button>
            
            {!isLast && (
              <div className={`flex-1 h-px mx-4 transition-colors ${
                isCompleted ? 'bg-accent/20' : 'bg-muted-color/20'
              }`} />
            )}
          </div>
        );
      })}
    </nav>
  );
}

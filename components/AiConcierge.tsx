import React, { useState } from 'react';
import { Sparkles, ArrowRight, AlertCircle, CheckCircle2 } from 'lucide-react';
import { getSmartRecommendation, Recommendation } from '../services/geminiService';
import { ServiceCategory } from '../types';

interface AiConciergeProps {
  onRecommendation: (category: ServiceCategory) => void;
}

const AiConcierge: React.FC<AiConciergeProps> = ({ onRecommendation }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [problem, setProblem] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<Recommendation | null>(null);

  const handleAnalyze = async () => {
    if (!problem.trim()) return;
    setLoading(true);
    setResult(null);
    
    const rec = await getSmartRecommendation(problem);
    setResult(rec);
    setLoading(false);
  };

  if (!isOpen) {
    return (
      <button 
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 bg-gradient-to-r from-stone-800 to-stone-900 border border-stone-700 text-stone-200 px-5 py-3 rounded-full shadow-xl shadow-black/20 hover:shadow-2xl transition-all transform hover:-translate-y-0.5 group"
      >
        <Sparkles className="w-4 h-4 text-amber-500 group-hover:text-amber-400" />
        <span className="font-medium text-sm">Unsure what you need?</span>
      </button>
    );
  }

  return (
    <div className="bg-stone-900 rounded-2xl shadow-2xl border border-stone-800 p-6 max-w-md w-full animate-fade-in relative overflow-hidden">
        {/* Background decorative element */}
        <div className="absolute top-0 right-0 -mt-8 -mr-8 w-32 h-32 bg-amber-600/10 rounded-full blur-3xl opacity-50 pointer-events-none"></div>

        <div className="relative">
            <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-stone-950 rounded-lg border border-stone-800">
                        <Sparkles className="w-4 h-4 text-amber-500" />
                    </div>
                    <h3 className="font-serif font-bold text-lg text-stone-100">Service Assistant</h3>
                </div>
                <button onClick={() => setIsOpen(false)} className="text-stone-500 hover:text-stone-300 text-sm">Close</button>
            </div>

            {!result ? (
                <>
                    <p className="text-stone-400 text-sm mb-4">Describe your home issue in plain English. Our AI will match you with the right expert.</p>
                    <textarea 
                        value={problem}
                        onChange={(e) => setProblem(e.target.value)}
                        placeholder="e.g., My kitchen sink is draining very slowly and making a gurgling sound..."
                        className="w-full p-3 bg-stone-950 border border-stone-800 rounded-xl text-stone-200 text-sm focus:ring-1 focus:ring-amber-600 focus:outline-none resize-none h-24 mb-4 placeholder:text-stone-700"
                    />
                    <button 
                        onClick={handleAnalyze}
                        disabled={loading || !problem}
                        className="w-full bg-stone-100 text-stone-900 py-2.5 rounded-lg font-bold text-sm hover:bg-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center"
                    >
                        {loading ? (
                            <span className="flex items-center gap-2">
                                <span className="w-4 h-4 border-2 border-stone-400 border-t-stone-900 rounded-full animate-spin"></span>
                                Analyzing...
                            </span>
                        ) : 'Find Expert'}
                    </button>
                </>
            ) : (
                <div className="space-y-4">
                    <div className="bg-stone-950 p-4 rounded-xl border border-stone-800">
                        <div className="flex items-center gap-2 mb-2">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-stone-500">Recommendation</span>
                            {result.urgency === 'HIGH' && <span className="bg-red-900/30 text-red-400 border border-red-900/50 text-[10px] font-bold px-2 py-0.5 rounded-full">HIGH PRIORITY</span>}
                        </div>
                        <h4 className="font-serif text-xl font-bold text-stone-100 mb-1">{result.category}</h4>
                        <p className="text-sm text-stone-400 leading-relaxed">{result.reasoning}</p>
                    </div>
                    
                    <button 
                        onClick={() => onRecommendation(result.category)}
                        className="w-full flex items-center justify-between bg-amber-600 text-stone-950 px-4 py-3 rounded-lg hover:bg-amber-500 transition-colors group"
                    >
                        <span className="font-bold text-sm">View {result.category} Pros</span>
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </button>
                    
                    <button onClick={() => setResult(null)} className="w-full text-center text-stone-600 text-xs hover:text-stone-400">
                        Start over
                    </button>
                </div>
            )}
        </div>
    </div>
  );
};

export default AiConcierge;

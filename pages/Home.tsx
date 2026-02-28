
import React from 'react';
import { Search, MapPin, ArrowRight, Sparkles } from 'lucide-react';
import { ServiceCategory } from '../types';
import AiConcierge from '../components/AiConcierge';

interface HomeProps {
  onSearch: (category?: ServiceCategory) => void;
}

const Home: React.FC<HomeProps> = ({ onSearch }) => {
  return (
    <div className="min-h-[calc(100vh-64px)]">
      {/* Hero Section */}
      <section className="relative w-full h-[600px] flex items-center">
        {/* Background Image with Overlay */}
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?q=80&w=2000&auto=format&fit=crop" 
            alt="Professional Handyman" 
            className="w-full h-full object-cover object-center"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-stone-950 via-stone-950/90 to-stone-950/30"></div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 w-full">
            <div className="max-w-2xl">
                <h1 className="font-serif text-5xl md:text-7xl font-bold text-stone-100 leading-[1.1] mb-8 tracking-tight drop-shadow-2xl">
                    Easy, reliable way to <br/>
                    take care of <br/>
                    <span className="text-premium-gold">your home.</span>
                </h1>
                <p className="text-xl text-stone-300 mb-10 max-w-xl leading-relaxed drop-shadow-lg font-light">
                    We provide you with the best people to help take care of your home. Connect with vetted local professionals who take pride in their craft.
                </p>

                <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
                    <button 
                        onClick={() => onSearch()}
                        className="bg-premium-gold btn-shine text-stone-950 px-8 py-4 rounded-xl font-bold text-lg shadow-2xl shadow-amber-900/40 flex items-center gap-3 transition-transform hover:scale-[1.02]"
                    >
                        <Search className="w-5 h-5" />
                        Get Started
                    </button>
                    <div className="hidden md:block w-px h-12 bg-stone-700 mx-2"></div>
                    <AiConcierge onRecommendation={(cat) => onSearch(cat)} />
                </div>
            </div>
        </div>
      </section>

      {/* Categories List Section */}
      <section className="bg-stone-900 py-20 border-t border-stone-800">
        <div className="max-w-7xl mx-auto px-4">
            <div className="flex justify-between items-end mb-10">
                <div>
                    <h2 className="font-serif text-3xl text-stone-100 font-bold mb-3">Popular Services</h2>
                    <p className="text-stone-500">Explore our comprehensive range of home services.</p>
                </div>
                <button onClick={() => onSearch()} className="hidden md:flex items-center gap-1 text-amber-500 font-medium hover:gap-2 hover:text-amber-400 transition-all">
                    View all <ArrowRight className="w-4 h-4" />
                </button>
            </div>

            {/* Simple Text List */}
            <div className="max-w-2xl">
                <div className="flex flex-col gap-3">
                    {[
                        ServiceCategory.CLEANING,
                        ServiceCategory.ELECTRICIAN,
                        ServiceCategory.PLUMBER,
                        ServiceCategory.HVAC,
                    ].map((cat) => (
                        <button 
                            key={cat}
                            onClick={() => onSearch(cat)}
                            className="w-full text-left py-4 px-6 bg-stone-950 border border-stone-800 rounded-xl hover:border-amber-600/50 hover:bg-stone-800 transition-all group flex items-center justify-between"
                        >
                            <span className="font-serif text-lg text-stone-300 group-hover:text-premium-gold transition-colors flex items-center gap-3">
                                <span className="w-1.5 h-1.5 rounded-full bg-stone-600 group-hover:bg-amber-500 transition-colors"></span>
                                {cat}
                            </span>
                            <ArrowRight className="w-4 h-4 text-stone-600 group-hover:text-amber-500 opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all" />
                        </button>
                    ))}
                </div>
            </div>
            
            <div className="mt-6 md:hidden">
                 <button onClick={() => onSearch()} className="w-full py-3 bg-stone-800 text-stone-300 rounded-xl font-medium hover:bg-stone-700 transition-colors flex items-center justify-center gap-2">
                    View All Services <ArrowRight className="w-4 h-4" />
                </button>
            </div>
        </div>
      </section>

      {/* Trust Section */}
      <section className="py-24 max-w-7xl mx-auto px-4 text-center border-t border-stone-800/50 bg-stone-950">
          <h2 className="font-serif text-3xl md:text-4xl text-stone-100 font-bold mb-16">Why neighbors trust ServiceLink</h2>
          <div className="grid md:grid-cols-3 gap-12">
              <div className="flex flex-col items-center group">
                  <div className="w-16 h-16 bg-stone-900 border border-stone-800 rounded-full flex items-center justify-center mb-6 text-amber-500 shadow-xl shadow-black/40 group-hover:border-amber-600/30 transition-colors">
                    <MapPin className="w-8 h-8 icon-gold-glow" />
                  </div>
                  <h3 className="text-lg font-bold text-stone-200 mb-3 group-hover:text-amber-500 transition-colors">Truly Local</h3>
                  <p className="text-stone-500 leading-relaxed max-w-xs">We prioritize providers within 5 miles of your home to ensure quick response times.</p>
              </div>
              <div className="flex flex-col items-center group">
                  <div className="w-16 h-16 bg-stone-900 border border-stone-800 rounded-full flex items-center justify-center mb-6 text-amber-500 shadow-xl shadow-black/40 group-hover:border-amber-600/30 transition-colors">
                    <Search className="w-8 h-8 icon-gold-glow" />
                  </div>
                  <h3 className="text-lg font-bold text-stone-200 mb-3 group-hover:text-amber-500 transition-colors">Vetted Humans</h3>
                  <p className="text-stone-500 leading-relaxed max-w-xs">Every provider goes through an ID check and skill verification process.</p>
              </div>
              <div className="flex flex-col items-center group">
                  <div className="w-16 h-16 bg-stone-900 border border-stone-800 rounded-full flex items-center justify-center mb-6 text-amber-500 shadow-xl shadow-black/40 group-hover:border-amber-600/30 transition-colors">
                    <Sparkles className="w-8 h-8 icon-gold-glow" />
                  </div>
                  <h3 className="text-lg font-bold text-stone-200 mb-3 group-hover:text-amber-500 transition-colors">Fair Pricing</h3>
                  <p className="text-stone-500 leading-relaxed max-w-xs">Transparent hourly rates. No hidden fees or surprise upcharges.</p>
              </div>
          </div>
      </section>
    </div>
  );
};

export default Home;

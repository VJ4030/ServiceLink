
import React from 'react';
import { Provider } from '../types';
import { Star, Shield, MapPin, Award } from 'lucide-react';

interface ServiceCardProps {
  provider: Provider;
  onClick: (provider: Provider) => void;
}

const ServiceCard: React.FC<ServiceCardProps> = ({ provider, onClick }) => {
  return (
    <div 
      onClick={() => onClick(provider)}
      className="group bg-stone-900 rounded-xl border border-stone-800 shadow-lg hover:shadow-amber-900/10 hover:border-amber-500/30 transition-all duration-300 ease-out hover:scale-[1.02] cursor-pointer overflow-hidden flex flex-col relative"
    >
      {provider.imageUrl && (
        <div className="relative h-48 overflow-hidden">
          <img 
            src={provider.imageUrl} 
            alt={provider.name} 
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out opacity-90 group-hover:opacity-100"
          />
          <div className="absolute top-3 left-3 flex flex-col gap-1">
              {provider.verified && (
                <div className="bg-stone-950/80 backdrop-blur-md border border-stone-800 px-2.5 py-1 rounded-full flex items-center gap-1.5 shadow-sm w-fit">
                  <Shield className="w-3 h-3 text-emerald-500 fill-current" />
                  <span className="text-[10px] font-bold text-stone-200 uppercase tracking-wide">Verified</span>
                </div>
              )}
              {/* Performance Badge */}
              {provider.badge && provider.badge !== 'New' && (
                  <div className={`backdrop-blur-md border px-2.5 py-1 rounded-full flex items-center gap-1.5 shadow-sm w-fit ${
                      provider.badge === 'Elite' ? 'bg-amber-950/80 border-amber-500/50 text-amber-400' :
                      provider.badge === 'Top Rated' ? 'bg-blue-950/80 border-blue-500/50 text-blue-400' :
                      'bg-stone-950/80 border-stone-700 text-stone-300'
                  }`}>
                      <Award className="w-3 h-3 fill-current" />
                      <span className="text-[10px] font-bold uppercase tracking-wide">{provider.badge}</span>
                  </div>
              )}
          </div>
          {/* Subtle gold overlay gradient on hover */}
          <div className="absolute inset-0 bg-gradient-to-t from-stone-900 via-transparent to-transparent opacity-60"></div>
        </div>
      )}
      
      <div className="p-5 flex flex-col flex-grow relative">
        <div className="flex justify-between items-start mb-2">
          <div>
            <h3 className="font-serif font-bold text-lg text-stone-200 group-hover:text-amber-500 transition-colors">{provider.name}</h3>
            <p className="text-xs text-stone-500 font-medium uppercase tracking-wider mt-0.5">{provider.category}</p>
          </div>
          <div className="flex flex-col items-end">
             <div className="flex items-center gap-1 bg-amber-900/20 border border-amber-600/20 px-2 py-0.5 rounded text-amber-500">
              <Star className="w-3.5 h-3.5 fill-current" />
              <span className="text-sm font-bold">{provider.rating}</span>
            </div>
            <span className="text-xs text-stone-500 mt-1">{provider.reviewCount} reviews</span>
          </div>
        </div>

        <p className="text-stone-400 text-sm line-clamp-2 mb-4 leading-relaxed font-light">
          {provider.description}
        </p>

        <div className="mt-auto flex items-center justify-between border-t border-stone-800 pt-4 group-hover:border-stone-700 transition-colors">
          <div className="flex items-center text-xs text-stone-500 gap-1.5">
            <MapPin className="w-3.5 h-3.5" />
            <span className="truncate max-w-[120px]">{provider.distance}</span>
          </div>
          <div className="text-stone-200 font-bold font-serif">
            ₹{provider.hourlyRate}<span className="text-stone-600 font-sans font-normal text-xs ml-0.5">/hr</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ServiceCard;

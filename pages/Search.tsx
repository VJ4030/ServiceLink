
import React, { useState, useEffect, useMemo } from 'react';
import { ServiceCategory, Provider, User, UserRole } from '../types';
import ServiceCard from '../components/ServiceCard';
import { Filter, X, Zap, AlertTriangle } from 'lucide-react';
import { SERVICE_CATALOG } from '../mockData';

interface SearchProps {
  initialCategory?: ServiceCategory;
  providers: Provider[]; 
  onSelectProvider: (provider: Provider) => void;
  user: User | null;
  onEmergencyBook?: (details: any) => void;
}

const Search: React.FC<SearchProps> = ({ initialCategory, providers, onSelectProvider, user, onEmergencyBook }) => {
  const [selectedCategory, setSelectedCategory] = useState<ServiceCategory | 'All'>('All');
  const [filteredProviders, setFilteredProviders] = useState<Provider[]>(providers);
  const [showFilters, setShowFilters] = useState(false);

  // --- EMERGENCY BOOKING STATE ---
  const [showEmergencyForm, setShowEmergencyForm] = useState(false);
  const [emCategory, setEmCategory] = useState<ServiceCategory | ''>('');
  const [emServiceId, setEmServiceId] = useState('');
  const [emAddressId, setEmAddressId] = useState(user?.addresses[0]?.id || '');
  const [emDescription, setEmDescription] = useState('');
  const [emConfirmed, setEmConfirmed] = useState(false);

  // Reset emergency form if user changes (or logs out)
  useEffect(() => {
      setEmAddressId(user?.addresses[0]?.id || '');
  }, [user]);

  // Pricing Calculation for Emergency Form
  const emPricing = useMemo(() => {
      if (!emCategory || !emServiceId) return null;
      const services = SERVICE_CATALOG[emCategory as ServiceCategory] || [];
      const service = services.find(s => s.id === emServiceId);
      if (!service) return null;

      const basePrice = service.basePrice;
      const providerExtra = 50;
      const newBase = basePrice + providerExtra;
      const tax = newBase * 0.18;
      const platformFee = 150; // UPDATED FIXED EMERGENCY FEE
      const total = newBase + tax + platformFee;

      return { basePrice, providerExtra, tax, platformFee, total, serviceName: service.name };
  }, [emCategory, emServiceId]);

  const handleEmergencySubmit = (e: React.FormEvent) => {
      e.preventDefault();
      if (!emConfirmed) {
          alert("You must confirm this is a genuine emergency.");
          return;
      }
      if (!onEmergencyBook || !emPricing || !user) return;

      const address = user.addresses.find(a => a.id === emAddressId)?.fullAddress || "Address not found";

      onEmergencyBook({
          category: emCategory,
          serviceType: emPricing.serviceName,
          description: emDescription,
          address: address,
          billing: {
              subtotal: emPricing.basePrice + emPricing.providerExtra,
              tax: emPricing.tax,
              platformFee: emPricing.platformFee,
              total: emPricing.total
          }
      });
      // Reset and close
      setEmCategory('');
      setEmServiceId('');
      setEmDescription('');
      setEmConfirmed(false);
      setShowEmergencyForm(false);
  };

  useEffect(() => {
    if (initialCategory) {
      setSelectedCategory(initialCategory);
    }
  }, [initialCategory]);

  useEffect(() => {
    let result = providers;
    if (selectedCategory !== 'All') {
      result = result.filter(p => p.category === selectedCategory);
    }
    // SORT BY PERFORMANCE SCORE (Highest First)
    result = [...result].sort((a, b) => (b.performanceScore || 0) - (a.performanceScore || 0));
    setFilteredProviders(result);
  }, [selectedCategory, providers]);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      
      {/* --- EMERGENCY BOOKING SECTION (TOP) --- */}
      {user?.role === UserRole.CUSTOMER && (
          <div className="mb-10 animate-fade-in">
              {!showEmergencyForm ? (
                  <button 
                      onClick={() => setShowEmergencyForm(true)}
                      className="w-full bg-red-900/10 border border-red-900/30 hover:bg-red-900/20 text-red-500 font-bold py-4 rounded-xl flex items-center justify-center gap-3 transition-all group shadow-lg shadow-red-900/5 hover:scale-[1.01]"
                  >
                      <Zap className="w-5 h-5 group-hover:scale-110 transition-transform" />
                      Request Emergency Service
                  </button>
              ) : (
                  <div className="bg-stone-900 border border-red-900/30 rounded-2xl overflow-hidden shadow-2xl animate-fade-in relative">
                       <button onClick={() => setShowEmergencyForm(false)} className="absolute top-4 right-4 text-stone-500 hover:text-stone-300">
                           <X className="w-5 h-5" />
                       </button>
                       
                       <div className="bg-red-900/10 p-6 border-b border-red-900/20 flex items-center gap-3">
                           <div className="p-2 bg-red-600 rounded-lg text-white shadow-lg shadow-red-600/20 animate-pulse">
                               <Zap className="w-6 h-6" />
                           </div>
                           <div>
                               <h3 className="text-xl font-bold text-red-500">Emergency Response</h3>
                               <p className="text-red-400/70 text-sm">Priority dispatch for urgent home issues. 5x penalty for misuse.</p>
                           </div>
                       </div>

                       <form onSubmit={handleEmergencySubmit} className="p-6 md:p-8 space-y-6">
                           <div className="grid md:grid-cols-2 gap-6">
                               <div>
                                   <label className="block text-xs font-bold text-stone-500 uppercase mb-2">Category</label>
                                   <select 
                                       required
                                       value={emCategory}
                                       onChange={(e) => { setEmCategory(e.target.value as ServiceCategory); setEmServiceId(''); }}
                                       className="w-full bg-stone-950 border border-stone-800 rounded-lg p-3 text-stone-200 focus:border-red-500 focus:outline-none"
                                   >
                                       <option value="">Select Category</option>
                                       {Object.values(ServiceCategory).map(cat => (
                                           <option key={cat} value={cat}>{cat}</option>
                                       ))}
                                   </select>
                               </div>
                               <div>
                                   <label className="block text-xs font-bold text-stone-500 uppercase mb-2">Service Type</label>
                                   <select 
                                       required
                                       value={emServiceId}
                                       onChange={(e) => setEmServiceId(e.target.value)}
                                       disabled={!emCategory}
                                       className="w-full bg-stone-950 border border-stone-800 rounded-lg p-3 text-stone-200 focus:border-red-500 focus:outline-none disabled:opacity-50"
                                   >
                                       <option value="">Select Service</option>
                                       {emCategory && SERVICE_CATALOG[emCategory as ServiceCategory]?.map(s => (
                                           <option key={s.id} value={s.id}>{s.name}</option>
                                       ))}
                                   </select>
                               </div>
                           </div>

                           <div>
                                <label className="block text-xs font-bold text-stone-500 uppercase mb-2">Location</label>
                                <select 
                                     required
                                     value={emAddressId}
                                     onChange={(e) => setEmAddressId(e.target.value)}
                                     className="w-full bg-stone-950 border border-stone-800 rounded-lg p-3 text-stone-200 focus:border-red-500 focus:outline-none"
                                >
                                    {user.addresses.map(addr => (
                                        <option key={addr.id} value={addr.id}>{addr.label} - {addr.fullAddress}</option>
                                    ))}
                                </select>
                           </div>

                           <div>
                                <label className="block text-xs font-bold text-stone-500 uppercase mb-2">Description</label>
                                <textarea 
                                    required
                                    value={emDescription}
                                    onChange={(e) => setEmDescription(e.target.value)}
                                    placeholder="Describe the emergency..."
                                    className="w-full bg-stone-950 border border-stone-800 rounded-lg p-3 text-stone-200 focus:border-red-500 focus:outline-none resize-none h-24"
                                />
                           </div>

                           {emPricing && (
                               <div className="bg-stone-950 p-4 rounded-xl border border-stone-800 flex justify-between items-center">
                                   <span className="text-stone-400 text-sm">Estimated Total (incl. Emergency Fee)</span>
                                   <span className="text-xl font-bold text-red-500">₹{emPricing.total.toFixed(0)}</span>
                               </div>
                           )}

                           <div className="flex items-start gap-3 p-4 bg-red-900/5 rounded-xl border border-red-900/20">
                               <input 
                                   type="checkbox" 
                                   id="emConfirm"
                                   checked={emConfirmed}
                                   onChange={(e) => setEmConfirmed(e.target.checked)}
                                   className="mt-1"
                               />
                               <label htmlFor="emConfirm" className="text-sm text-stone-400 cursor-pointer">
                                   I confirm this is a genuine emergency. I understand that a <strong className="text-stone-200">5x penalty</strong> applies if this feature is misused for non-urgent tasks.
                               </label>
                           </div>

                           <button 
                               type="submit"
                               disabled={!emConfirmed || !emPricing}
                               className="w-full bg-red-600 btn-shine text-white font-bold py-4 rounded-xl shadow-lg shadow-red-900/40 hover:bg-red-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                           >
                               <Zap className="w-5 h-5 fill-white" />
                               Book Emergency Service
                           </button>
                       </form>
                  </div>
              )}
          </div>
      )}

      {/* --- FILTERS & SEARCH HEADER --- */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
         <div>
            <h1 className="font-serif text-3xl font-bold text-stone-100 mb-2">Find a Professional</h1>
            <p className="text-stone-500">Browse top-rated providers for your home needs.</p>
         </div>
         
         <button 
            onClick={() => setShowFilters(!showFilters)}
            className="md:hidden flex items-center gap-2 px-4 py-2 bg-stone-900 border border-stone-800 rounded-lg text-stone-300"
         >
             <Filter className="w-4 h-4" /> Filters
         </button>
      </div>

      {/* Category Chips */}
      <div className={`flex gap-3 overflow-x-auto pb-4 mb-8 custom-scrollbar ${showFilters ? 'block' : 'hidden md:flex'}`}>
          <button
              onClick={() => setSelectedCategory('All')}
              className={`px-4 py-2 rounded-full text-sm font-bold whitespace-nowrap transition-all border ${
                  selectedCategory === 'All' 
                  ? 'bg-amber-600 text-stone-900 border-amber-600 shadow-lg shadow-amber-900/20' 
                  : 'bg-stone-900 text-stone-400 border-stone-800 hover:border-stone-600'
              }`}
          >
              All Services
          </button>
          {Object.values(ServiceCategory).map(category => (
              <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-4 py-2 rounded-full text-sm font-bold whitespace-nowrap transition-all border ${
                      selectedCategory === category 
                      ? 'bg-amber-600 text-stone-900 border-amber-600 shadow-lg shadow-amber-900/20' 
                      : 'bg-stone-900 text-stone-400 border-stone-800 hover:border-stone-600'
                  }`}
              >
                  {category}
              </button>
          ))}
      </div>

      {/* --- PROVIDERS GRID --- */}
      {filteredProviders.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProviders.map(provider => (
            <ServiceCard 
              key={provider.id} 
              provider={provider} 
              onClick={onSelectProvider}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-stone-900 rounded-2xl border border-stone-800 border-dashed">
          <div className="w-16 h-16 bg-stone-950 rounded-full flex items-center justify-center mx-auto mb-4">
             <Filter className="w-8 h-8 text-stone-700" />
          </div>
          <h3 className="text-xl font-bold text-stone-300 mb-2">No providers found</h3>
          <p className="text-stone-500">Try selecting a different category or check back later.</p>
          <button 
             onClick={() => setSelectedCategory('All')}
             className="mt-6 px-6 py-2 bg-stone-800 hover:bg-stone-700 text-stone-300 rounded-lg text-sm font-bold transition-colors"
          >
             Clear Filters
          </button>
        </div>
      )}
    </div>
  );
};

export default Search;

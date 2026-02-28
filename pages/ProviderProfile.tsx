
import React from 'react';
import { Provider } from '../types';
import { Star, MapPin, Clock, ShieldCheck, ArrowLeft } from 'lucide-react';

interface ProviderProfileProps {
  provider: Provider;
  onBack: () => void;
  onBook: () => void;
}

const ProviderProfile: React.FC<ProviderProfileProps> = ({ provider, onBack, onBook }) => {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8 animate-fade-in">
      <button onClick={onBack} className="flex items-center gap-2 text-stone-500 hover:text-stone-200 mb-6 transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back to Search
      </button>

      <div className="bg-stone-900 rounded-2xl shadow-xl border border-stone-800 overflow-hidden">
        {/* Header */}
        <div className="p-8 md:p-10 border-b border-stone-800">
            <div className="flex flex-col md:flex-row gap-8 items-start">
                {provider.imageUrl && (
                  <img 
                      src={provider.imageUrl} 
                      alt={provider.name} 
                      className="w-32 h-32 md:w-40 md:h-40 rounded-2xl object-cover shadow-2xl border-2 border-stone-800"
                  />
                )}
                <div className="flex-1 w-full">
                    <div className="flex justify-between items-start">
                        <div>
                            <h1 className="font-serif text-3xl font-bold text-premium-gold mb-2">{provider.name}</h1>
                            <p className="text-stone-400 font-medium text-lg mb-4">{provider.category}</p>
                        </div>
                        <div className="text-right hidden md:block">
                            <div className="text-3xl font-bold text-premium-gold font-serif">₹{provider.hourlyRate}</div>
                            <div className="text-stone-600 text-sm">per hour</div>
                        </div>
                    </div>

                    <div className="flex flex-wrap gap-4 text-sm text-stone-400 mb-8">
                        <div className="flex items-center gap-1.5">
                            <Star className="w-4 h-4 text-amber-500 fill-current" />
                            <span className="font-bold text-stone-200">{provider.rating}</span>
                            <span>({provider.reviewCount} reviews)</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <MapPin className="w-4 h-4 text-stone-500" />
                            <span>{provider.location}</span>
                        </div>
                        {provider.verified && (
                            <div className="flex items-center gap-1.5 text-emerald-400 bg-emerald-950/30 border border-emerald-900/50 px-2 py-0.5 rounded-full">
                                <ShieldCheck className="w-4 h-4" />
                                <span className="font-medium text-xs uppercase tracking-wide">Identity Verified</span>
                            </div>
                        )}
                    </div>

                    <div className="md:hidden mb-6 flex justify-between items-center border-t border-b border-stone-800 py-3">
                        <span className="text-stone-500">Hourly Rate</span>
                        <div className="text-2xl font-bold text-premium-gold">₹{provider.hourlyRate}</div>
                    </div>

                    <button 
                        onClick={onBook}
                        className="w-full md:w-auto bg-premium-gold btn-shine text-stone-950 px-8 py-3.5 rounded-xl font-bold text-sm shadow-lg shadow-amber-900/20 hover:shadow-xl transition-all transform active:scale-95"
                    >
                        Request Booking
                    </button>
                </div>
            </div>
        </div>

        {/* Content */}
        <div className="p-8 md:p-10 grid md:grid-cols-3 gap-12">
            <div className="md:col-span-2 space-y-10">
                <section>
                    <h3 className="font-serif text-xl font-bold text-stone-200 mb-4">About</h3>
                    <p className="text-stone-400 leading-relaxed text-lg font-light">{provider.description}</p>
                </section>

                <section>
                    <h3 className="font-serif text-xl font-bold text-stone-200 mb-4">Reviews</h3>
                    <div className="space-y-6">
                        {provider.reviews.length > 0 ? provider.reviews.map(review => (
                            <div key={review.id} className="bg-stone-950/50 border border-stone-800 p-6 rounded-xl">
                                <div className="flex justify-between items-center mb-3">
                                    <span className="font-bold text-stone-300">{review.author}</span>
                                    <span className="text-xs text-stone-600">{review.date}</span>
                                </div>
                                <div className="flex text-amber-500 mb-2">
                                    {[...Array(5)].map((_, i) => (
                                        <Star key={i} className={`w-3 h-3 ${i < review.rating ? 'fill-current' : 'text-stone-800'}`} />
                                    ))}
                                </div>
                                <p className="text-stone-400 text-sm leading-relaxed">{review.text}</p>
                            </div>
                        )) : (
                            <p className="text-stone-600 italic">No reviews yet.</p>
                        )}
                    </div>
                </section>
            </div>

            <div className="space-y-8">
                <section>
                    <h3 className="font-serif text-xl font-bold text-stone-200 mb-4">Skills</h3>
                    <div className="flex flex-wrap gap-2">
                        {provider.skills.map(skill => (
                            <span key={skill} className="bg-stone-800 border border-stone-700 px-3 py-1.5 rounded-lg text-sm text-stone-300">
                                {skill}
                            </span>
                        ))}
                    </div>
                </section>

                <section className="bg-stone-950 p-6 rounded-xl border border-stone-800">
                    <h3 className="font-serif text-lg font-bold text-stone-200 mb-4 flex items-center gap-2">
                        <Clock className="w-5 h-5 text-amber-500" /> Availability
                    </h3>
                    <div className="space-y-3 text-sm text-stone-400">
                        <div className="flex justify-between border-b border-stone-900 pb-2"><span>Mon - Fri</span> <span className="font-semibold text-stone-300">8am - 6pm</span></div>
                        <div className="flex justify-between border-b border-stone-900 pb-2"><span>Sat</span> <span className="font-semibold text-stone-300">9am - 2pm</span></div>
                        <div className="flex justify-between text-stone-600"><span>Sun</span> <span>Closed</span></div>
                    </div>
                </section>
            </div>
        </div>
      </div>
    </div>
  );
};

export default ProviderProfile;

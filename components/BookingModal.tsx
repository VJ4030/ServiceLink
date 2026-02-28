
import React, { useState, useEffect } from 'react';
import { X, Calendar, Clock, AlertCircle, MapPin, Tag, ChevronRight, Ban, Layers, Zap, Sun, Moon, Sunrise } from 'lucide-react';
import { Provider, User, Address, ServiceCategory, Booking } from '../types';
import { SERVICE_CATALOG, MOCK_BOOKINGS } from '../mockData';

interface BookingModalProps {
  provider: Provider;
  currentUser: User;
  onClose: () => void;
  onConfirm: (bookingDetails: any) => void;
}

const BookingModal: React.FC<BookingModalProps> = ({ provider, currentUser, onClose, onConfirm }) => {
  const [date, setDate] = useState('');
  const [selectedSlot, setSelectedSlot] = useState<"8-12" | "12-4" | "4-8" | null>(null);
  const [description, setDescription] = useState('');
  const [selectedAddressId, setSelectedAddressId] = useState(
    currentUser.addresses.find(a => a.isPrimary)?.id || currentUser.addresses[0]?.id || ''
  );
  
  // Queue Type State
  const [queueType, setQueueType] = useState<'standard' | 'priority'>('standard');
  const [dateError, setDateError] = useState('');

  // Service Selection Logic
  const availableServices = SERVICE_CATALOG[provider.category] || [];
  const [selectedServiceId, setSelectedServiceId] = useState(availableServices[0]?.id || '');
  
  // Derived Pricing
  const selectedService = availableServices.find(s => s.id === selectedServiceId);
  // Use custom pricing if set for the specific service, otherwise fallback to service base price or provider hourly rate
  const basePrice = (provider.customPricing && selectedService && provider.customPricing[selectedServiceId]) 
      ? provider.customPricing[selectedServiceId] 
      : (selectedService ? selectedService.basePrice : provider.hourlyRate);

  const estimatedTax = Math.round(basePrice * 0.18);
  
  // Dynamic Platform Fee Calculation
  const platformFee = queueType === 'priority' ? 100 : 50;
  
  const estimatedTotal = basePrice + estimatedTax + platformFee;

  useEffect(() => {
    if (!date) {
        setDateError('');
        return;
    }

    const selectedDateObj = new Date(date);
    const dayOfWeek = selectedDateObj.toLocaleDateString('en-US', { weekday: 'short' }); // "Mon", "Tue"
    const dateString = date; // YYYY-MM-DD

    // 1. Check if date is blocked
    if (provider.availability?.blockedDates.includes(dateString)) {
        setDateError('Provider is unavailable on this date.');
        return;
    }

    // 2. Check if day is working day
    if (provider.availability?.days && !provider.availability.days.includes(dayOfWeek)) {
        setDateError(`Provider does not work on ${dayOfWeek}s.`);
        return;
    }

    setDateError('');
  }, [date, provider]);

  const getSlotAvailability = (slot: "8-12" | "12-4" | "4-8") => {
      if (!date) return false;
      const today = new Date();
      const selectedDate = new Date(date);
      const isToday = selectedDate.toDateString() === today.toDateString();
      const currentHour = today.getHours();

      // Block past slots if booking for today
      if (isToday) {
          if (slot === "8-12" && currentHour >= 12) return false;
          if (slot === "12-4" && currentHour >= 16) return false;
          if (slot === "4-8" && currentHour >= 20) return false;
      }
      return true;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const selectedAddress = currentUser.addresses.find(a => a.id === selectedAddressId);
    
    // Construct ISO Date
    const bookingDate = new Date(date);
    const serviceDateISO = bookingDate.toISOString();

    onConfirm({
        providerId: provider.id,
        customerId: currentUser.id,
        customerName: currentUser.name,
        providerName: provider.name,
        serviceDate: serviceDateISO,
        timeSlot: selectedSlot, 
        category: provider.category,
        serviceType: selectedService ? selectedService.name : "General Service",
        bookingQueueType: queueType,
        billing: {
            subtotal: basePrice,
            tax: estimatedTax,
            platformFee: platformFee,
            total: estimatedTotal
        },
        description: description,
        address: selectedAddress ? selectedAddress.fullAddress : "No address provided"
    });
  };

  // Get current date for min attribute
  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-stone-950/80 backdrop-blur-sm" onClick={onClose}></div>
      
      <div className="relative bg-stone-900 rounded-2xl shadow-2xl border border-stone-800 max-w-lg w-full overflow-hidden animate-fade-in-up flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-stone-950 px-6 py-4 border-b border-stone-800 flex justify-between items-center flex-shrink-0">
          <h3 className="font-serif text-lg font-bold text-stone-100">Request Service</h3>
          <button onClick={onClose} className="text-stone-500 hover:text-stone-300 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 md:p-8 overflow-y-auto custom-scrollbar">
            <div className="flex items-center gap-4 mb-6">
                {provider.imageUrl && (
                  <img src={provider.imageUrl} alt="" className="w-14 h-14 rounded-full object-cover border-2 border-stone-700 shadow-md" />
                )}
                <div>
                    <div className="text-xs text-stone-500 font-bold uppercase tracking-wide">Booking with</div>
                    <div className="font-serif text-xl font-bold text-premium-gold">{provider.name}</div>
                    <div className="text-sm text-stone-400">{provider.category}</div>
                </div>
            </div>

            <div className="space-y-6">
                {/* Service Type Selection */}
                <div>
                    <label className="block text-xs font-semibold text-stone-400 mb-2 uppercase tracking-wide">Select Service</label>
                    <div className="space-y-2">
                        {availableServices.map(service => {
                            const isSelected = selectedServiceId === service.id;
                            // Display custom price if available for this specific service
                            const priceDisplay = (provider.customPricing && provider.customPricing[service.id]) 
                                ? provider.customPricing[service.id] 
                                : service.basePrice;

                            return (
                                <label 
                                    key={service.id} 
                                    className={`flex items-center gap-3 p-4 rounded-lg border cursor-pointer transition-all ${
                                        isSelected
                                        ? 'bg-amber-900/10 border-amber-600/50' 
                                        : 'bg-stone-950 border-stone-800 hover:border-stone-700'
                                    }`}
                                >
                                    <div className="flex-shrink-0">
                                        <input 
                                            type="radio" 
                                            name="service" 
                                            value={service.id} 
                                            checked={isSelected}
                                            onChange={() => setSelectedServiceId(service.id)}
                                            className="text-amber-600 focus:ring-amber-600 bg-stone-900 border-stone-700 accent-amber-500"
                                        />
                                    </div>
                                    
                                    <div className="flex-1 flex justify-between items-center">
                                        <span className={`text-sm font-medium ${isSelected ? 'text-amber-200' : 'text-stone-300'}`}>
                                            {service.name}
                                        </span>
                                        <span className="text-sm font-bold text-stone-200">₹{priceDisplay}</span>
                                    </div>
                                </label>
                            );
                        })}
                    </div>
                </div>

                {/* Date Selection */}
                <div>
                    <label className="block text-xs font-semibold text-stone-400 mb-2 uppercase tracking-wide">Select Date</label>
                    <div className="relative">
                        <Calendar className="absolute left-3 top-3 w-4 h-4 text-stone-500" />
                        <input 
                            type="date" 
                            required
                            min={today}
                            value={date}
                            onChange={(e) => {
                                setDate(e.target.value);
                                setSelectedSlot(null);
                            }}
                            className="w-full pl-10 pr-4 py-2.5 bg-stone-950 border border-stone-800 rounded-lg text-sm text-stone-200 focus:ring-1 focus:ring-amber-600 focus:outline-none [color-scheme:dark]"
                        />
                    </div>
                    {dateError && (
                        <div className="flex items-center gap-2 mt-2 text-red-400 text-xs">
                            <AlertCircle className="w-3 h-3" /> {dateError}
                        </div>
                    )}
                </div>

                {/* FIXED TIME SLOTS */}
                {date && !dateError && (
                    <div className="animate-fade-in">
                        <label className="block text-xs font-semibold text-stone-400 mb-2 uppercase tracking-wide">Select Time Slot</label>
                        <div className="grid grid-cols-3 gap-3">
                            <button
                                type="button"
                                disabled={!getSlotAvailability("8-12")}
                                onClick={() => setSelectedSlot("8-12")}
                                className={`flex flex-col items-center justify-center p-3 rounded-xl border transition-all ${
                                    selectedSlot === "8-12"
                                    ? 'bg-amber-600 text-stone-900 border-amber-600 shadow-lg'
                                    : 'bg-stone-950 text-stone-300 border-stone-800 hover:border-amber-500/50'
                                } disabled:opacity-30 disabled:cursor-not-allowed`}
                            >
                                <Sunrise className="w-5 h-5 mb-1" />
                                <span className="text-xs font-bold">Morning</span>
                                <span className="text-[10px] opacity-80">8 AM - 12 PM</span>
                            </button>

                            <button
                                type="button"
                                disabled={!getSlotAvailability("12-4")}
                                onClick={() => setSelectedSlot("12-4")}
                                className={`flex flex-col items-center justify-center p-3 rounded-xl border transition-all ${
                                    selectedSlot === "12-4"
                                    ? 'bg-amber-600 text-stone-900 border-amber-600 shadow-lg'
                                    : 'bg-stone-950 text-stone-300 border-stone-800 hover:border-amber-500/50'
                                } disabled:opacity-30 disabled:cursor-not-allowed`}
                            >
                                <Sun className="w-5 h-5 mb-1" />
                                <span className="text-xs font-bold">Afternoon</span>
                                <span className="text-[10px] opacity-80">12 PM - 4 PM</span>
                            </button>

                            <button
                                type="button"
                                disabled={!getSlotAvailability("4-8")}
                                onClick={() => setSelectedSlot("4-8")}
                                className={`flex flex-col items-center justify-center p-3 rounded-xl border transition-all ${
                                    selectedSlot === "4-8"
                                    ? 'bg-amber-600 text-stone-900 border-amber-600 shadow-lg'
                                    : 'bg-stone-950 text-stone-300 border-stone-800 hover:border-amber-500/50'
                                } disabled:opacity-30 disabled:cursor-not-allowed`}
                            >
                                <Moon className="w-5 h-5 mb-1" />
                                <span className="text-xs font-bold">Evening</span>
                                <span className="text-[10px] opacity-80">4 PM - 8 PM</span>
                            </button>
                        </div>
                    </div>
                )}

                {/* Location */}
                <div>
                    <label className="block text-xs font-semibold text-stone-400 mb-2 uppercase tracking-wide">Service Location</label>
                    <div className="relative">
                        <MapPin className="absolute left-3 top-3 w-4 h-4 text-stone-500" />
                        <select 
                             value={selectedAddressId}
                             onChange={(e) => setSelectedAddressId(e.target.value)}
                             className="w-full pl-10 pr-4 py-2.5 bg-stone-950 border border-stone-800 rounded-lg text-sm text-stone-200 focus:ring-1 focus:ring-amber-600 focus:outline-none"
                        >
                            {currentUser.addresses.map(addr => (
                                <option key={addr.id} value={addr.id}>{addr.label} - {addr.fullAddress.substring(0, 30)}...</option>
                            ))}
                        </select>
                    </div>
                    {currentUser.addresses.length === 0 && <p className="text-xs text-red-400 mt-1">Please add an address in your dashboard first.</p>}
                </div>

                {/* Description */}
                <div>
                    <label className="block text-xs font-semibold text-stone-400 mb-2 uppercase tracking-wide">Describe the issue</label>
                    <textarea 
                        required
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Be as specific as possible (e.g., Fan is making a noise)"
                        className="w-full p-3 bg-stone-950 border border-stone-800 rounded-lg text-sm text-stone-200 focus:ring-1 focus:ring-amber-600 focus:outline-none resize-none h-20 placeholder:text-stone-700"
                    ></textarea>
                </div>

                {/* Booking Priority Queue Options */}
                <div>
                    <label className="block text-xs font-semibold text-stone-400 mb-2 uppercase tracking-wide flex items-center gap-2">
                        <Layers className="w-4 h-4 text-amber-500" /> Booking Queue Preference
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                        <div 
                            onClick={() => setQueueType('standard')}
                            className={`p-3 rounded-xl border cursor-pointer transition-all ${
                                queueType === 'standard' 
                                ? 'bg-stone-800 border-amber-600/50 shadow-md' 
                                : 'bg-stone-950 border-stone-800 hover:border-stone-700'
                            }`}
                        >
                            <div className="flex items-center justify-between mb-1">
                                <span className={`text-sm font-bold ${queueType === 'standard' ? 'text-stone-100' : 'text-stone-400'}`}>Standard</span>
                                <span className="text-xs font-bold text-stone-500">₹50</span>
                            </div>
                            <p className="text-[10px] text-stone-500 leading-tight">Normal order within {selectedSlot ? 'selected' : 'the'} slot.</p>
                        </div>

                        <div 
                            onClick={() => setQueueType('priority')}
                            className={`p-3 rounded-xl border cursor-pointer transition-all ${
                                queueType === 'priority' 
                                ? 'bg-amber-900/10 border-amber-500 shadow-[0_0_15px_rgba(212,175,55,0.1)]' 
                                : 'bg-stone-950 border-stone-800 hover:border-stone-700'
                            }`}
                        >
                            <div className="flex items-center justify-between mb-1">
                                <span className={`text-sm font-bold ${queueType === 'priority' ? 'text-amber-500' : 'text-stone-400'}`}>Priority</span>
                                <span className="text-xs font-bold text-premium-gold">₹100</span>
                            </div>
                            <p className="text-[10px] text-stone-500 leading-tight">First preference within {selectedSlot ? 'selected' : 'the'} slot.</p>
                        </div>
                    </div>
                </div>
                
                {/* Billing Summary */}
                <div className="bg-stone-950 p-4 rounded-lg border border-stone-800 space-y-2">
                    <div className="flex justify-between text-xs text-stone-400">
                        <span>Service Base Price</span>
                        <span>₹{basePrice}</span>
                    </div>
                    <div className="flex justify-between text-xs text-stone-400">
                        <span>Estimated Tax (18%)</span>
                        <span>₹{estimatedTax}</span>
                    </div>
                    <div className="flex justify-between text-xs text-stone-400">
                        <span>Platform Fee ({queueType === 'priority' ? 'Priority' : 'Standard'})</span>
                        <span className={queueType === 'priority' ? 'text-amber-500 font-bold' : ''}>₹{platformFee}</span>
                    </div>
                    <div className="flex justify-between text-sm font-bold text-premium-gold border-t border-stone-800 pt-2 mt-2">
                        <span>Estimated Total</span>
                        <span>₹{estimatedTotal}</span>
                    </div>
                </div>
            </div>

            <div className="mt-8 pt-6 border-t border-stone-800 flex justify-end gap-3">
                <button type="button" onClick={onClose} className="px-5 py-2.5 text-stone-400 font-medium hover:bg-stone-800 rounded-lg transition-colors text-sm">Cancel</button>
                <button 
                    type="submit" 
                    disabled={currentUser.addresses.length === 0 || !selectedSlot}
                    className="px-8 py-2.5 bg-premium-gold btn-shine text-stone-900 font-bold rounded-lg shadow-lg shadow-amber-900/20 text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-xl transition-all"
                >
                    Confirm Booking
                </button>
            </div>
        </form>
      </div>
    </div>
  );
};

export default BookingModal;

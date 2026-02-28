
import React, { useState, useMemo, useEffect } from 'react';
import { Booking, User, UserRole, Address, Provider, WithdrawalRequest, WalletTransaction } from '../types';
import { Calendar, CheckCircle2, Clock, MapPin, Plus, Trash2, Home, XCircle, CreditCard, Star, FileText, Ban, Wallet, TrendingUp, LayoutDashboard, Edit, Save, X, AlertTriangle, Zap, Users, IndianRupee, ArrowDownLeft, Clock3, Briefcase, Layers, Sunrise, Sun, Moon, Eye, Download, CalendarX, Camera, Banknote, Landmark } from 'lucide-react';
import { jsPDF } from "jspdf";
import { SERVICE_CATALOG } from '../mockData';

interface DashboardProps {
  user: User;
  bookings: Booking[];
  providers?: Provider[]; 
  withdrawalRequests?: WithdrawalRequest[];
  walletTransactions?: WalletTransaction[];
  onAddAddress: (address: Address) => void;
  onDeleteAddress: (id: string) => void;
  onUpdateStatus: (bookingId: string, status: Booking['status']) => void;
  onPayment: (bookingId: string) => void;
  onReview: (bookingId: string, rating: number, text: string) => void;
  onCancelBooking: (bookingId: string) => void;
  onUpdateProviderProfile?: (provider: Provider) => void;
  onRequestWithdrawal?: (amount: number) => void;
  onUpdateProviderPrice?: (serviceId: string, newPrice: number) => void;
}

// Internal CountUp Component for Animations
const CountUp = ({ end, duration = 1500, prefix = '' }: { end: number, duration?: number, prefix?: string }) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let startTimestamp: number | null = null;
    const step = (timestamp: number) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      
      const easeOut = (x: number): number => x === 1 ? 1 : 1 - Math.pow(2, -10 * x);
      
      setCount(Math.floor(easeOut(progress) * end));
      
      if (progress < 1) {
        window.requestAnimationFrame(step);
      }
    };
    window.requestAnimationFrame(step);
  }, [end, duration]);

  return <>{prefix}{count.toLocaleString()}</>;
};

// Helper to convert number to Roman Numeral
const getRomanNumeral = (num: number): string => {
  const lookup: { [key: string]: number } = {M:1000,CM:900,D:500,CD:400,C:100,XC:90,L:50,XL:40,X:10,IX:9,V:5,IV:4,I:1};
  let roman = '';
  for ( let i in lookup ) {
    while ( num >= lookup[i] ) {
      roman += i;
      num -= lookup[i];
    }
  }
  return roman;
};

// Helper for slot display
const getSlotDisplay = (slot?: string) => {
    if (slot === '8-12') return { icon: Sunrise, label: 'Morning (8-12)' };
    if (slot === '12-4') return { icon: Sun, label: 'Afternoon (12-4)' };
    if (slot === '4-8') return { icon: Moon, label: 'Evening (4-8)' };
    return { icon: Clock, label: 'Flexible' };
};

const Dashboard: React.FC<DashboardProps> = ({ 
  user, 
  bookings,
  providers = [],
  withdrawalRequests = [],
  walletTransactions = [],
  onAddAddress, 
  onDeleteAddress,
  onUpdateStatus,
  onPayment,
  onReview,
  onCancelBooking,
  onUpdateProviderProfile,
  onRequestWithdrawal,
  onUpdateProviderPrice
}) => {
  const [activeTab, setActiveTab] = useState<'OVERVIEW' | 'EARNINGS' | 'WALLET' | 'BUSINESS'>('OVERVIEW');
  const [newAddress, setNewAddress] = useState('');
  const [newAddressLabel, setNewAddressLabel] = useState('Home');
  const [showAddAddr, setShowAddAddr] = useState(false);
  
  // Wallet State
  const [withdrawalAmount, setWithdrawalAmount] = useState('');
  const [selectedReceipt, setSelectedReceipt] = useState<WalletTransaction | null>(null);

  // Business Tab State
  const [editingPriceId, setEditingPriceId] = useState<string | null>(null);
  const [tempPrice, setTempPrice] = useState<number>(0);

  // States for Review Modal
  const [reviewBookingId, setReviewBookingId] = useState<string | null>(null);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewText, setReviewText] = useState('');

  // States for Payment Modal (Receipt View)
  const [paymentBooking, setPaymentBooking] = useState<Booking | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<'UPI' | 'CARD' | 'CASH' | 'NET'>('UPI');
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);

  // States for Edit Profile Modal
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [editFormData, setEditFormData] = useState<Provider | null>(null);
  const [newProfileImage, setNewProfileImage] = useState<File | null>(null);
  const [blockedDateInput, setBlockedDateInput] = useState('');

  // Filter bookings based on role & Sort logic
  const myBookings = useMemo(() => {
    const userBookings = bookings.filter(b => 
        user.role === UserRole.PROVIDER 
        ? b.providerId === user.providerProfileId 
        : b.customerId === user.id
    );

    // Sorting Logic: Emergency > Date > Slot > Queue
    return userBookings.sort((a, b) => {
        // 1. Emergency
        if (a.isEmergency && !b.isEmergency) return -1;
        if (!a.isEmergency && b.isEmergency) return 1;

        // 2. Date Comparison
        const dateA = new Date(a.serviceDate).setHours(0,0,0,0);
        const dateB = new Date(b.serviceDate).setHours(0,0,0,0);
        if (dateA !== dateB) return dateA - dateB;

        // 3. Slot Comparison
        const slotOrder = { '8-12': 1, '12-4': 2, '4-8': 3 };
        // @ts-ignore
        const slotA = a.timeSlot ? slotOrder[a.timeSlot] : 99;
        // @ts-ignore
        const slotB = b.timeSlot ? slotOrder[b.timeSlot] : 99;
        if (slotA !== slotB) return slotA - slotB;

        // 4. Queue Priority
        if (a.bookingQueueType === 'priority' && b.bookingQueueType !== 'priority') return -1;
        if (a.bookingQueueType !== 'priority' && b.bookingQueueType === 'priority') return 1;

        return 0;
    });
  }, [bookings, user]);

  // Provider Stats
  const currentProvider = user.role === UserRole.PROVIDER ? providers.find(p => p.id === user.providerProfileId) : null;
  const myTransactions = user.role === UserRole.PROVIDER ? walletTransactions.filter(t => t.providerId === user.providerProfileId).sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()) : [];

  const handleWithdrawalSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      if (!currentProvider || !onRequestWithdrawal) return;
      const amount = Number(withdrawalAmount);
      if (amount <= 0) return;
      
      const maxWithdrawable = currentProvider.walletBalance + currentProvider.negativeBalanceLimit;
      if (amount > maxWithdrawable) {
          alert(`Withdrawal amount cannot exceed total available limit (₹${maxWithdrawable}).`);
          return;
      }
      onRequestWithdrawal(amount);
      setWithdrawalAmount('');
  };

  const handlePriceEditStart = (serviceId: string, currentPrice: number) => {
      setEditingPriceId(serviceId);
      setTempPrice(currentPrice);
  };

  const handlePriceSave = (serviceId: string) => {
      if (tempPrice <= 0) {
          alert("Price must be greater than 0");
          return;
      }
      if (onUpdateProviderPrice) {
          onUpdateProviderPrice(serviceId, tempPrice);
      }
      setEditingPriceId(null);
  };

  // --- EARNINGS ANALYTICS (Provider Only) ---
  const earningsStats = useMemo(() => {
    if (user.role !== UserRole.PROVIDER) return null;

    // 1. Filter for Completed/Paid (Revenue Realized)
    const completedBookings = myBookings.filter(b => b.status === 'COMPLETED' || b.status === 'PAID');
    
    // 2. Filter for Pending (Potential Revenue)
    const pendingBookings = myBookings.filter(b => b.status === 'PENDING' || b.status === 'CONFIRMED');

    // 3. Calculate Totals
    const totalEarnings = completedBookings.reduce((sum, b) => sum + b.billing.subtotal, 0);
    const pendingAmount = pendingBookings.reduce((sum, b) => sum + b.billing.subtotal, 0);

    // 4. This Month
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    const thisMonthEarnings = completedBookings
        .filter(b => {
            const d = new Date(b.serviceDate);
            return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
        })
        .reduce((sum, b) => sum + b.billing.subtotal, 0);

    // 5. Customer Revenue Breakdown
    const customerMap: Record<string, number> = {};
    completedBookings.forEach(b => {
        const name = b.customerName || "Unknown Customer";
        customerMap[name] = (customerMap[name] || 0) + b.billing.subtotal;
    });

    const customerBreakdown = Object.entries(customerMap)
        .map(([name, amount]) => ({ name, amount }))
        .sort((a, b) => b.amount - a.amount);

    return {
        totalEarnings,
        thisMonthEarnings,
        pendingAmount,
        completedCount: completedBookings.length,
        customerBreakdown,
        transactions: completedBookings
    };
  }, [myBookings, user.role]);


  const handleAddAddress = (e: React.FormEvent) => {
    e.preventDefault();
    if (newAddress) {
      onAddAddress({
        id: `addr-${Date.now()}`,
        label: newAddressLabel,
        fullAddress: newAddress,
        isPrimary: user.addresses.length === 0
      });
      setNewAddress('');
      setShowAddAddr(false);
    }
  };

  const handleReviewSubmit = () => {
    if (reviewBookingId && reviewText) {
      onReview(reviewBookingId, reviewRating, reviewText);
      setReviewBookingId(null);
      setReviewText('');
      setReviewRating(5);
    }
  };

  const generateReceipt = (booking: Booking) => {
    const doc = new jsPDF();
    const txnId = booking.billing.transactionId || `TXN${Date.now()}`;
    const date = booking.billing.paidAt ? new Date(booking.billing.paidAt).toLocaleDateString() : new Date().toLocaleDateString();

    doc.setFillColor(5, 5, 5);
    doc.rect(0, 0, 210, 297, 'F');
    doc.setDrawColor(212, 175, 55);
    doc.setLineWidth(1.5);
    doc.line(0, 15, 210, 15);
    doc.setFont("times", "bold"); 
    doc.setFontSize(32);
    doc.setTextColor(212, 175, 55);
    doc.text("ServiceLink", 20, 35);
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal"); 
    doc.setTextColor(163, 163, 163);
    doc.text("Premium Local Services", 20, 42);
    doc.setFontSize(10);
    doc.setTextColor(245, 245, 245);
    doc.text(`INVOICE #: ${booking.id.toUpperCase()}`, 130, 35);
    doc.setTextColor(163, 163, 163);
    doc.text(`Date: ${date}`, 130, 41);
    doc.text(`Transaction ID: ${txnId}`, 130, 47);
    doc.setDrawColor(50, 50, 50);
    doc.setLineWidth(0.2);
    doc.line(20, 55, 190, 55);
    doc.setFontSize(9);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(212, 175, 55);
    doc.text("SERVICE PROVIDER", 20, 70);
    doc.text("BILLED TO", 120, 70);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(245, 245, 245);
    doc.setFontSize(12);
    doc.text(booking.providerName, 20, 78);
    doc.setFontSize(10);
    doc.setTextColor(163, 163, 163);
    doc.text(booking.category, 20, 84);
    doc.setTextColor(245, 245, 245);
    doc.setFontSize(12);
    doc.text(booking.customerName, 120, 78);
    doc.setFontSize(10);
    doc.setTextColor(163, 163, 163);
    const splitAddr = doc.splitTextToSize(booking.address, 80);
    doc.text(splitAddr, 120, 84);
    let y = 115;
    doc.setFillColor(28, 28, 28);
    doc.rect(20, y - 8, 170, 12, 'F');
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(212, 175, 55);
    doc.text("DESCRIPTION", 25, y);
    doc.text("AMOUNT", 165, y);
    y += 18;
    doc.setFont("helvetica", "normal");
    doc.setTextColor(229, 229, 229);
    doc.text(booking.serviceType, 25, y);
    doc.text(`Rs. ${booking.billing.subtotal.toFixed(2)}`, 165, y);
    y += 12;
    doc.text("Platform Fee", 25, y);
    doc.text(`Rs. ${booking.billing.platformFee.toFixed(2)}`, 165, y);
    y += 12;
    doc.text("Tax (GST 18%)", 25, y);
    doc.text(`Rs. ${booking.billing.tax.toFixed(2)}`, 165, y);
    y += 20;
    
    if (booking.penaltyApplied) {
        doc.setTextColor(220, 38, 38);
        doc.text("MISUSE PENALTY (5x)", 25, y);
        doc.text("APPLIED", 165, y);
        y += 15;
    }

    doc.setDrawColor(212, 175, 55);
    doc.setLineWidth(0.5);
    doc.line(20, y - 5, 190, y - 5);
    y += 5;
    doc.setFont("times", "bold");
    doc.setFontSize(16);
    doc.setTextColor(212, 175, 55);
    doc.text("TOTAL PAID", 100, y);
    doc.text(`Rs. ${booking.billing.total.toFixed(2)}`, 165, y);
    doc.setFontSize(8);
    doc.setFont("helvetica", "italic");
    doc.setTextColor(82, 82, 82);
    doc.text("Thank you for choosing ServiceLink.", 105, 275, { align: 'center' });
    doc.text("This receipt is computer generated.", 105, 280, { align: 'center' });
    doc.setFillColor(212, 175, 55); 
    doc.rect(0, 292, 210, 5, 'F');
    doc.save(`ServiceLink_Receipt_${booking.id}.pdf`);
  };

  const handlePay = async () => {
    if (paymentBooking) {
        setIsProcessingPayment(true);
        // Simulate processing delay
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        generateReceipt(paymentBooking);
        onPayment(paymentBooking.id);
        
        setIsProcessingPayment(false);
        setPaymentBooking(null);
    }
  };

  const canCancel = (booking: Booking): boolean => {
    if (!booking.createdAt) return false;
    const createdTime = new Date(booking.createdAt).getTime();
    if (isNaN(createdTime)) return false;
    const currentTime = Date.now();
    const diffInMinutes = (currentTime - createdTime) / 1000 / 60;
    return diffInMinutes <= 30 && (booking.status === 'PENDING' || booking.status === 'CONFIRMED');
  };

  // --- EDIT PROFILE HANDLERS ---
  const openEditProfile = () => {
      if (user.role === UserRole.PROVIDER && user.providerProfileId) {
          const currentProvider = providers.find(p => p.id === user.providerProfileId);
          if (currentProvider) {
              const providerWithDefaults = {
                  ...currentProvider,
                  availability: currentProvider.availability || {
                      days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
                      startTime: '09:00',
                      endTime: '18:00',
                      blockedDates: []
                  }
              };
              setEditFormData(providerWithDefaults);
              setNewProfileImage(null);
              setIsEditProfileOpen(true);
          }
      }
  };

  const handleProfileImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files[0]) {
          const file = e.target.files[0];
          const MAX_SIZE = 5 * 1024 * 1024;
          const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

          if (!ALLOWED_TYPES.includes(file.type)) {
              alert(`Invalid file type. Please upload a valid image (JPG, PNG, or WEBP).`);
              return;
          }
          if (file.size > MAX_SIZE) {
              alert(`File is too large. Maximum size allowed is 5MB.`);
              return;
          }
          setNewProfileImage(file);
      }
  };

  const handleEditFormSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      if (!editFormData || !onUpdateProviderProfile) return;

      let updatedProvider = { ...editFormData };
      if (newProfileImage) {
          const imageUrl = URL.createObjectURL(newProfileImage);
          updatedProvider.imageUrl = imageUrl;
      }
      onUpdateProviderProfile(updatedProvider);
      setIsEditProfileOpen(false);
  };

  const handleSkillsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (!editFormData) return;
      const skillsArray = e.target.value.split(',').map(s => s.trim()).filter(s => s !== '');
      setEditFormData({ ...editFormData, skills: skillsArray });
  };

  // Availability Logic
  const toggleDay = (day: string) => {
      if (!editFormData?.availability) return;
      const days = editFormData.availability.days.includes(day)
          ? editFormData.availability.days.filter(d => d !== day)
          : [...editFormData.availability.days, day];
      setEditFormData({ ...editFormData, availability: { ...editFormData.availability, days } });
  };

  const addBlockedDate = () => {
      if (!editFormData?.availability || !blockedDateInput) return;
      if (!editFormData.availability.blockedDates.includes(blockedDateInput)) {
          setEditFormData({
              ...editFormData,
              availability: {
                  ...editFormData.availability,
                  blockedDates: [...editFormData.availability.blockedDates, blockedDateInput]
              }
          });
      }
      setBlockedDateInput('');
  };

  const removeBlockedDate = (date: string) => {
      if (!editFormData?.availability) return;
      setEditFormData({
          ...editFormData,
          availability: {
              ...editFormData.availability,
              blockedDates: editFormData.availability.blockedDates.filter(d => d !== date)
          }
      });
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-12 animate-fade-in min-h-screen">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10 gap-6">
        <div>
            <h1 className="font-serif text-3xl font-bold text-stone-100 flex items-center gap-3">
              {user.role === UserRole.PROVIDER ? 'Business Dashboard' : 'My Account'}
              {user.role === UserRole.PROVIDER && (
                  <button 
                    onClick={openEditProfile}
                    className="p-1.5 bg-stone-800 border border-stone-700 rounded-lg hover:bg-stone-700 text-amber-500 transition-colors"
                    title="Edit Profile"
                  >
                      <Edit className="w-4 h-4" />
                  </button>
              )}
            </h1>
            <p className="text-stone-500 mt-2">Welcome back, <span className="text-stone-300">{user.name}</span></p>
        </div>
        
        {/* Role Based Tabs */}
        <div className="flex bg-stone-900 border border-stone-800 rounded-xl p-1 shadow-lg">
             <button 
                onClick={() => setActiveTab('OVERVIEW')}
                className={`px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-all ${activeTab === 'OVERVIEW' ? 'bg-stone-800 text-stone-100 shadow' : 'text-stone-500 hover:text-stone-300'}`}
             >
               <LayoutDashboard className="w-4 h-4" /> Overview
             </button>

             {user.role === UserRole.PROVIDER && (
                 <>
                    <button 
                        onClick={() => setActiveTab('EARNINGS')}
                        className={`px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-all ${activeTab === 'EARNINGS' ? 'bg-stone-800 text-premium-gold shadow' : 'text-stone-500 hover:text-stone-300'}`}
                    >
                        <TrendingUp className="w-4 h-4" /> Earnings
                    </button>
                    <button 
                        onClick={() => setActiveTab('WALLET')}
                        className={`px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-all ${activeTab === 'WALLET' ? 'bg-stone-800 text-premium-gold shadow' : 'text-stone-500 hover:text-stone-300'}`}
                    >
                        <Wallet className="w-4 h-4" /> Wallet
                    </button>
                    <button 
                        onClick={() => setActiveTab('BUSINESS')}
                        className={`px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-all ${activeTab === 'BUSINESS' ? 'bg-stone-800 text-premium-gold shadow' : 'text-stone-500 hover:text-stone-300'}`}
                    >
                        <Briefcase className="w-4 h-4" /> My Business
                    </button>
                 </>
             )}
        </div>
      </div>

      {/* ----------------- PROVIDER BUSINESS TAB ----------------- */}
      {user.role === UserRole.PROVIDER && activeTab === 'BUSINESS' && currentProvider && (
          <div className="space-y-8 animate-fade-in">
              <div className="bg-stone-900 border border-stone-800 rounded-2xl p-6 shadow-xl">
                  <h3 className="font-serif text-lg font-bold text-stone-100 mb-6 flex items-center gap-2">
                      <Briefcase className="w-5 h-5 text-amber-500" /> Manage Services & Pricing
                  </h3>
                  
                  <div className="overflow-x-auto">
                      <table className="w-full text-left text-sm">
                          <thead>
                              <tr className="bg-stone-950 border-b border-stone-800 text-stone-400">
                                  <th className="px-6 py-4 font-bold uppercase tracking-wider text-xs">Service Name</th>
                                  <th className="px-6 py-4 font-bold uppercase tracking-wider text-xs text-right">Global Base Price</th>
                                  <th className="px-6 py-4 font-bold uppercase tracking-wider text-xs text-right">My Price</th>
                                  <th className="px-6 py-4 font-bold uppercase tracking-wider text-xs text-right">Actions</th>
                              </tr>
                          </thead>
                          <tbody className="divide-y divide-stone-800">
                              {SERVICE_CATALOG[currentProvider.category].map((service, index) => {
                                  const customPrice = currentProvider.customPricing?.[service.id];
                                  const isEditing = editingPriceId === service.id;

                                  return (
                                      <tr key={service.id} className="hover:bg-stone-800/30 transition-colors">
                                          <td className="px-6 py-4">
                                              <div className="flex items-center gap-3">
                                                  <div className="w-10 h-10 rounded-lg bg-stone-950 border border-stone-800 flex items-center justify-center font-serif font-bold text-premium-gold text-xs shadow-inner">
                                                      {getRomanNumeral(index + 1)}
                                                  </div>
                                                  <span className="font-medium text-stone-200">{service.name}</span>
                                              </div>
                                          </td>
                                          <td className="px-6 py-4 text-right text-stone-500">
                                              ₹{service.basePrice}
                                          </td>
                                          <td className="px-6 py-4 text-right font-bold text-premium-gold">
                                              {isEditing ? (
                                                  <input 
                                                      type="number"
                                                      value={tempPrice}
                                                      min="1"
                                                      onChange={(e) => setTempPrice(Number(e.target.value))}
                                                      className="w-24 bg-stone-950 border border-amber-600 rounded px-2 py-1 text-right text-stone-200 focus:outline-none"
                                                      autoFocus
                                                  />
                                              ) : (
                                                  <span>₹{customPrice || service.basePrice}</span>
                                              )}
                                          </td>
                                          <td className="px-6 py-4 text-right">
                                              {isEditing ? (
                                                  <div className="flex justify-end gap-2">
                                                      <button 
                                                          onClick={() => handlePriceSave(service.id)}
                                                          className="p-1.5 bg-emerald-900/30 text-emerald-400 rounded hover:bg-emerald-900/50 border border-emerald-900/50"
                                                      >
                                                          <Save className="w-4 h-4" />
                                                      </button>
                                                      <button 
                                                          onClick={() => setEditingPriceId(null)}
                                                          className="p-1.5 bg-stone-800 text-stone-400 rounded hover:bg-stone-700 border border-stone-700"
                                                      >
                                                          <X className="w-4 h-4" />
                                                      </button>
                                                  </div>
                                              ) : (
                                                  <button 
                                                      onClick={() => handlePriceEditStart(service.id, customPrice || service.basePrice)}
                                                      className="text-stone-500 hover:text-amber-500 transition-colors flex items-center gap-1 ml-auto text-xs font-bold"
                                                  >
                                                      <Edit className="w-3 h-3" /> Edit
                                                  </button>
                                              )}
                                          </td>
                                      </tr>
                                  );
                              })}
                          </tbody>
                      </table>
                  </div>
              </div>
          </div>
      )}

      {/* ----------------- PROVIDER WALLET TAB ----------------- */}
      {user.role === UserRole.PROVIDER && activeTab === 'WALLET' && currentProvider && (
          <div className="space-y-8 animate-fade-in">
              {/* Overdraft Warning Banner */}
              {currentProvider.isNegativeActive && currentProvider.negativeDueDate && (
                  <div className="bg-red-900/10 border border-red-900/30 rounded-xl p-4 flex items-start gap-4 shadow-lg animate-pulse">
                      <div className="p-2 bg-red-950 border border-red-900/50 rounded-full">
                          <AlertTriangle className="w-6 h-6 text-red-500" />
                      </div>
                      <div>
                          <h4 className="text-red-500 font-bold text-lg mb-1">Overdraft Warning</h4>
                          <p className="text-stone-400 text-sm">
                              Your wallet balance is negative. Please repay by <span className="text-stone-200 font-bold">{new Date(currentProvider.negativeDueDate).toLocaleDateString()}</span> to avoid a 3x penalty.
                          </p>
                      </div>
                  </div>
              )}

              {/* Wallet Stats Summary */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Current Balance */}
                  <div className={`bg-stone-900 border ${currentProvider.walletBalance < 0 ? 'border-red-900/50' : 'border-stone-800'} p-6 rounded-2xl shadow-xl relative overflow-hidden group`}>
                      <div className={`absolute top-0 right-0 w-32 h-32 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none ${currentProvider.walletBalance < 0 ? 'bg-red-500/5' : 'bg-amber-500/5'}`}></div>
                      <div className="flex items-center gap-3 mb-4">
                          <div className={`p-3 bg-stone-950 border rounded-xl shadow-inner ${currentProvider.walletBalance < 0 ? 'border-red-900/30 text-red-500' : 'border-stone-800 text-amber-500'}`}>
                              <Wallet className="w-6 h-6 icon-gold-glow" />
                          </div>
                          <div>
                              <p className="text-xs text-stone-500 font-bold uppercase tracking-wider">Available Balance</p>
                              <p className={`text-2xl font-serif font-bold ${currentProvider.walletBalance < 0 ? 'text-red-500' : 'text-premium-gold'}`}>
                                  <CountUp end={currentProvider.walletBalance} prefix="₹" />
                              </p>
                          </div>
                      </div>
                      <p className="text-xs text-stone-600">
                          {currentProvider.walletBalance < 0 
                            ? "Please recharge or earn to clear dues" 
                            : "Funds available for withdrawal"}
                      </p>
                  </div>

                  {/* Total Earned */}
                  <div className="bg-stone-900 border border-stone-800 p-6 rounded-2xl shadow-xl relative overflow-hidden group">
                      <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none"></div>
                      <div className="flex items-center gap-3 mb-4">
                          <div className="p-3 bg-stone-950 border border-stone-800 rounded-xl text-emerald-500 shadow-inner">
                              <IndianRupee className="w-6 h-6" />
                          </div>
                          <div>
                              <p className="text-xs text-stone-500 font-bold uppercase tracking-wider">Total Earned</p>
                              <p className="text-2xl font-serif font-bold text-stone-200">
                                  <CountUp end={currentProvider.totalEarned} prefix="₹" />
                              </p>
                          </div>
                      </div>
                      <p className="text-xs text-stone-600">Lifetime earnings on platform</p>
                  </div>

                  {/* Total Withdrawn */}
                  <div className="bg-stone-900 border border-stone-800 p-6 rounded-2xl shadow-xl relative overflow-hidden group">
                      <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none"></div>
                      <div className="flex items-center gap-3 mb-4">
                          <div className="p-3 bg-stone-950 border border-stone-800 rounded-xl text-blue-500 shadow-inner">
                              <ArrowDownLeft className="w-6 h-6" />
                          </div>
                          <div>
                              <p className="text-xs text-stone-500 font-bold uppercase tracking-wider">Total Withdrawn</p>
                              <p className="text-2xl font-serif font-bold text-stone-200">
                                  <CountUp end={currentProvider.totalWithdrawn} prefix="₹" />
                              </p>
                          </div>
                      </div>
                      <p className="text-xs text-stone-600">Successfully transferred to bank</p>
                  </div>
              </div>

              <div className="grid lg:grid-cols-3 gap-8">
                  {/* Withdrawal Request Form */}
                  <div className="lg:col-span-1">
                      <div className="bg-stone-900 border border-stone-800 rounded-2xl p-6 shadow-xl h-full">
                          <h3 className="font-serif text-lg font-bold text-stone-100 mb-4 flex items-center gap-2">
                              <CreditCard className="w-5 h-5 text-amber-500" /> Request Withdrawal
                          </h3>
                          <form onSubmit={handleWithdrawalSubmit} className="space-y-4">
                              <div>
                                  <label className="block text-xs font-bold text-stone-500 uppercase mb-2">Amount to Withdraw</label>
                                  <div className="relative">
                                      <span className="absolute left-4 top-3 text-stone-500 font-bold">₹</span>
                                      <input 
                                          type="number" 
                                          required
                                          min="1"
                                          value={withdrawalAmount}
                                          onChange={(e) => setWithdrawalAmount(e.target.value)}
                                          className="w-full pl-8 pr-4 py-3 bg-stone-950 border border-stone-800 rounded-xl text-stone-200 focus:ring-1 focus:ring-amber-600 focus:outline-none font-medium"
                                          placeholder="0.00"
                                      />
                                  </div>
                                  <div className="text-xs text-stone-600 mt-2 flex justify-between">
                                      <span>Available: ₹{currentProvider.walletBalance}</span>
                                      <span className="text-amber-600">Max w/ Overdraft: ₹{currentProvider.walletBalance + currentProvider.negativeBalanceLimit}</span>
                                  </div>
                              </div>
                              <button 
                                  type="submit"
                                  disabled={!withdrawalAmount || Number(withdrawalAmount) <= 0}
                                  className="w-full bg-premium-gold btn-shine text-stone-950 font-bold py-3 rounded-xl shadow-lg shadow-amber-900/20 hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                  Confirm Withdrawal
                              </button>
                          </form>
                      </div>
                  </div>

                  {/* Wallet Transaction History (Receipts) */}
                  <div className="lg:col-span-2">
                      <div className="bg-stone-900 border border-stone-800 rounded-2xl overflow-hidden shadow-xl h-full flex flex-col">
                          <div className="px-6 py-4 border-b border-stone-800 flex justify-between items-center bg-stone-950">
                              <h3 className="font-serif text-lg font-bold text-stone-100 flex items-center gap-2">
                                  <Clock3 className="w-5 h-5 text-amber-500" /> Transaction History
                              </h3>
                          </div>
                          <div className="overflow-x-auto flex-1">
                              <table className="w-full text-left text-sm">
                                  <thead>
                                      <tr className="bg-stone-950 border-b border-stone-800 text-stone-400">
                                          <th className="px-6 py-4 font-bold uppercase tracking-wider text-xs">Date</th>
                                          <th className="px-6 py-4 font-bold uppercase tracking-wider text-xs">Type</th>
                                          <th className="px-6 py-4 font-bold uppercase tracking-wider text-xs text-right">Amount</th>
                                          <th className="px-6 py-4 font-bold uppercase tracking-wider text-xs text-right">Balance</th>
                                          <th className="px-6 py-4 font-bold uppercase tracking-wider text-xs text-right">Details</th>
                                      </tr>
                                  </thead>
                                  <tbody className="divide-y divide-stone-800">
                                      {myTransactions.length > 0 ? (
                                          myTransactions.map(txn => (
                                              <tr key={txn.id} className="hover:bg-stone-800/30 transition-colors">
                                                  <td className="px-6 py-4 text-stone-400">
                                                      {new Date(txn.date).toLocaleDateString()}
                                                  </td>
                                                  <td className="px-6 py-4">
                                                      <span className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wide border ${
                                                          txn.type === 'EARNING_CREDIT' ? 'bg-emerald-900/20 text-emerald-400 border-emerald-900/30' :
                                                          txn.type === 'LATE_PENALTY' ? 'bg-red-900/20 text-red-400 border-red-900/30' :
                                                          txn.type === 'OVERDRAFT_WITHDRAWAL' ? 'bg-orange-900/20 text-orange-400 border-orange-900/30' :
                                                          txn.type === 'NORMAL_WITHDRAWAL' ? 'bg-blue-900/20 text-blue-400 border-blue-900/30' :
                                                          'bg-stone-800 text-stone-400 border-stone-700'
                                                      }`}>
                                                          {txn.type.replace(/_/g, ' ')}
                                                      </span>
                                                  </td>
                                                  <td className={`px-6 py-4 text-right font-bold ${
                                                      txn.type === 'EARNING_CREDIT' ? 'text-emerald-400' : 'text-red-400'
                                                  }`}>
                                                      {txn.type === 'EARNING_CREDIT' ? '+' : '-'}₹{txn.amount.toLocaleString()}
                                                  </td>
                                                  <td className="px-6 py-4 text-right font-mono text-stone-300">
                                                      ₹{txn.newBalance.toLocaleString()}
                                                  </td>
                                                  <td className="px-6 py-4 text-right">
                                                      <button 
                                                          onClick={() => setSelectedReceipt(txn)}
                                                          className="text-stone-500 hover:text-amber-500 transition-colors"
                                                      >
                                                          <Eye className="w-4 h-4" />
                                                      </button>
                                                  </td>
                                              </tr>
                                          ))
                                      ) : (
                                          <tr>
                                              <td colSpan={5} className="px-6 py-12 text-center text-stone-500 italic">No transactions found.</td>
                                          </tr>
                                      )}
                                  </tbody>
                              </table>
                          </div>
                      </div>
                  </div>
              </div>
          </div>
      )}

      {/* ----------------- PROVIDER EARNINGS DASHBOARD ----------------- */}
      {user.role === UserRole.PROVIDER && activeTab === 'EARNINGS' && earningsStats && (
          <div className="space-y-8 animate-fade-in">
              {/* Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="bg-stone-900 border border-stone-800 p-6 rounded-2xl shadow-lg relative overflow-hidden group">
                      <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/5 rounded-full blur-2xl -mr-6 -mt-6 transition-all group-hover:bg-amber-500/10"></div>
                      <div className="flex justify-between items-start mb-4">
                          <div className="p-2 bg-stone-950 rounded-lg border border-stone-800 text-amber-500"><Wallet className="w-5 h-5"/></div>
                          <span className="text-[10px] font-bold text-stone-500 uppercase tracking-widest bg-stone-950 px-2 py-1 rounded">Lifetime</span>
                      </div>
                      <div className="text-3xl font-serif font-bold text-stone-100">
                          <CountUp end={earningsStats.totalEarnings} prefix="₹" />
                      </div>
                      <div className="text-xs text-stone-500 mt-1">Total Earnings</div>
                  </div>

                  <div className="bg-stone-900 border border-stone-800 p-6 rounded-2xl shadow-lg relative overflow-hidden group">
                      <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full blur-2xl -mr-6 -mt-6 transition-all group-hover:bg-emerald-500/10"></div>
                      <div className="flex justify-between items-start mb-4">
                          <div className="p-2 bg-stone-950 rounded-lg border border-stone-800 text-emerald-500"><TrendingUp className="w-5 h-5"/></div>
                          <span className="text-[10px] font-bold text-stone-500 uppercase tracking-widest bg-stone-950 px-2 py-1 rounded">This Month</span>
                      </div>
                      <div className="text-3xl font-serif font-bold text-stone-100">
                          <CountUp end={earningsStats.thisMonthEarnings} prefix="₹" />
                      </div>
                      <div className="text-xs text-stone-500 mt-1">Monthly Performance</div>
                  </div>
              </div>

              {/* Customer Breakdown */}
               <div className="bg-stone-900 border border-stone-800 p-6 rounded-2xl shadow-lg">
                  <h3 className="font-serif text-lg font-bold text-stone-100 mb-6 flex items-center gap-2">
                      <Users className="w-5 h-5 text-amber-500" /> Top Customers
                  </h3>
                   <div className="space-y-4">
                        {earningsStats.customerBreakdown.map((c, i) => (
                             <div key={i} className="flex justify-between items-center p-3 bg-stone-950 rounded-lg border border-stone-800">
                                 <span className="font-medium text-stone-300">{c.name}</span>
                                 <span className="font-bold text-premium-gold">₹{c.amount}</span>
                             </div>
                        ))}
                   </div>
               </div>
          </div>
      )}

      {/* ----------------- OVERVIEW TAB (DEFAULT) ----------------- */}
      {activeTab === 'OVERVIEW' && (
          <div className="space-y-8 animate-fade-in">
              {user.role === UserRole.CUSTOMER && (
                  <div className="space-y-6">
                      <div className="flex justify-between items-center">
                          <h3 className="font-serif text-xl font-bold text-stone-100">Active Bookings</h3>
                      </div>
                      
                      {myBookings.length > 0 ? (
                        <div className="grid gap-4">
                          {myBookings.map(booking => {
                            const slotInfo = getSlotDisplay(booking.timeSlot);
                            return (
                              <div key={booking.id} className="bg-stone-900 border border-stone-800 rounded-2xl p-6 shadow-lg hover:border-amber-600/30 transition-all">
                                <div className="flex justify-between items-start mb-4">
                                  <div>
                                     <div className="flex items-center gap-2 mb-1">
                                        <h4 className="font-bold text-stone-200 text-lg">{booking.serviceType}</h4>
                                        {booking.bookingQueueType === 'priority' && (
                                            <span className="px-2 py-0.5 bg-amber-900/30 text-amber-500 text-[10px] font-bold uppercase rounded border border-amber-900/50 flex items-center gap-1">
                                                <Layers className="w-3 h-3"/> Priority
                                            </span>
                                        )}
                                        {booking.isEmergency && (
                                            <span className="px-2 py-0.5 bg-red-900/30 text-red-500 text-[10px] font-bold uppercase rounded border border-red-900/50 flex items-center gap-1 animate-pulse">
                                                <Zap className="w-3 h-3"/> Emergency
                                            </span>
                                        )}
                                     </div>
                                     <p className="text-stone-500 text-sm">Provider: <span className="text-stone-300 font-medium">{booking.providerName}</span></p>
                                  </div>
                                  <div className="text-right">
                                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide border ${
                                      booking.status === 'CONFIRMED' ? 'bg-blue-900/20 text-blue-400 border-blue-900/30' :
                                      booking.status === 'COMPLETED' ? 'bg-emerald-900/20 text-emerald-400 border-emerald-900/30' :
                                      booking.status === 'PAID' ? 'bg-amber-900/20 text-amber-500 border-amber-900/30' :
                                      booking.status === 'REJECTED' || booking.status === 'CANCELLED' ? 'bg-red-900/20 text-red-400 border-red-900/30' :
                                      'bg-stone-800 text-stone-400 border-stone-700'
                                    }`}>
                                      {booking.status}
                                    </span>
                                  </div>
                                </div>
                                
                                <div className="flex flex-wrap gap-4 text-sm text-stone-400 mb-6 bg-stone-950 p-4 rounded-xl border border-stone-800">
                                  <div className="flex items-center gap-2">
                                    <Calendar className="w-4 h-4 text-stone-500" />
                                    {new Date(booking.serviceDate).toLocaleDateString()}
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <slotInfo.icon className="w-4 h-4 text-stone-500" />
                                    {slotInfo.label}
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <div className="font-bold text-premium-gold">₹{booking.billing.total}</div>
                                  </div>
                                </div>

                                <div className="flex flex-wrap gap-3 pt-4 border-t border-stone-800">
                                    {booking.status === 'COMPLETED' && (
                                      <button 
                                        onClick={() => setPaymentBooking(booking)}
                                        className="flex items-center gap-2 px-4 py-2 bg-premium-gold btn-shine text-stone-900 rounded-lg text-sm font-bold shadow-lg shadow-amber-900/20 hover:shadow-xl transition-all"
                                      >
                                        <CreditCard className="w-4 h-4" /> Pay Now
                                      </button>
                                    )}
                                    {booking.status === 'PAID' && !booking.review && (
                                      <button 
                                        onClick={() => setReviewBookingId(booking.id)}
                                        className="flex items-center gap-2 px-4 py-2 bg-stone-800 text-stone-200 rounded-lg text-sm font-bold hover:bg-stone-700 transition-colors border border-stone-700"
                                      >
                                        <Star className="w-4 h-4" /> Leave Review
                                      </button>
                                    )}
                                    {booking.status === 'PAID' && (
                                      <button 
                                        onClick={() => { setPaymentBooking(booking); generateReceipt(booking); }}
                                        className="flex items-center gap-2 px-4 py-2 bg-stone-800 text-stone-400 rounded-lg text-sm font-bold hover:bg-stone-700 transition-colors border border-stone-700"
                                      >
                                        <Download className="w-4 h-4" /> Receipt
                                      </button>
                                    )}
                                    {(booking.status === 'PENDING' || booking.status === 'CONFIRMED') && (
                                       <button 
                                         onClick={() => onCancelBooking(booking.id)}
                                         className="flex items-center gap-2 px-4 py-2 bg-red-900/10 text-red-500 rounded-lg text-sm font-bold hover:bg-red-900/20 transition-colors border border-red-900/30 ml-auto"
                                       >
                                         <Ban className="w-4 h-4" /> Cancel
                                       </button>
                                    )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <div className="text-center py-20 bg-stone-900 rounded-2xl border border-stone-800 border-dashed">
                           <div className="w-16 h-16 bg-stone-950 rounded-full flex items-center justify-center mx-auto mb-4">
                              <CalendarX className="w-8 h-8 text-stone-700" />
                           </div>
                           <p className="text-stone-500 font-medium">No active bookings yet.</p>
                           <p className="text-stone-600 text-sm mt-2">Find a pro to get started!</p>
                        </div>
                      )}
                      
                      {/* Customer Address Management */}
                      <div className="mt-12 bg-stone-900 border border-stone-800 rounded-2xl p-6 shadow-xl">
                          <div className="flex justify-between items-center mb-6">
                              <h3 className="font-serif text-lg font-bold text-stone-100 flex items-center gap-2">
                                  <MapPin className="w-5 h-5 text-amber-500" /> Saved Addresses
                              </h3>
                              <button onClick={() => setShowAddAddr(!showAddAddr)} className="text-sm font-bold text-amber-500 hover:text-amber-400 flex items-center gap-1">
                                  <Plus className="w-4 h-4" /> Add New
                              </button>
                          </div>
                          
                          {showAddAddr && (
                              <form onSubmit={handleAddAddress} className="mb-6 p-4 bg-stone-950 rounded-xl border border-stone-800 animate-fade-in">
                                  <div className="grid gap-3 mb-3">
                                      <input 
                                          type="text" 
                                          placeholder="Label (e.g. Home, Office)" 
                                          className="w-full p-2 bg-stone-900 border border-stone-800 rounded-lg text-stone-200 text-sm focus:border-amber-600 focus:outline-none"
                                          value={newAddressLabel}
                                          onChange={(e) => setNewAddressLabel(e.target.value)}
                                          required
                                      />
                                      <input 
                                          type="text" 
                                          placeholder="Full Address" 
                                          className="w-full p-2 bg-stone-900 border border-stone-800 rounded-lg text-stone-200 text-sm focus:border-amber-600 focus:outline-none"
                                          value={newAddress}
                                          onChange={(e) => setNewAddress(e.target.value)}
                                          required
                                      />
                                  </div>
                                  <div className="flex justify-end gap-2">
                                      <button type="button" onClick={() => setShowAddAddr(false)} className="px-3 py-1.5 text-xs text-stone-400 hover:text-stone-200">Cancel</button>
                                      <button type="submit" className="px-3 py-1.5 bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-bold rounded-lg border border-stone-700">Save</button>
                                  </div>
                              </form>
                          )}

                          <div className="space-y-3">
                              {user.addresses.map(addr => (
                                  <div key={addr.id} className="flex justify-between items-center p-3 bg-stone-950 rounded-lg border border-stone-800 group hover:border-stone-700 transition-colors">
                                      <div className="flex items-center gap-3">
                                          <div className={`p-2 rounded-full ${addr.isPrimary ? 'bg-amber-900/20 text-amber-500' : 'bg-stone-900 text-stone-500'}`}>
                                              <Home className="w-4 h-4" />
                                          </div>
                                          <div>
                                              <div className="font-bold text-stone-200 text-sm flex items-center gap-2">
                                                  {addr.label}
                                                  {addr.isPrimary && <span className="text-[10px] bg-stone-800 text-stone-400 px-1.5 py-0.5 rounded">Primary</span>}
                                              </div>
                                              <div className="text-xs text-stone-500 truncate max-w-xs">{addr.fullAddress}</div>
                                          </div>
                                      </div>
                                      {!addr.isPrimary && (
                                          <button onClick={() => onDeleteAddress(addr.id)} className="text-stone-600 hover:text-red-500 p-2 opacity-0 group-hover:opacity-100 transition-all">
                                              <Trash2 className="w-4 h-4" />
                                          </button>
                                      )}
                                  </div>
                              ))}
                          </div>
                      </div>
                  </div>
              )}

              {user.role === UserRole.PROVIDER && (
                  <div className="space-y-6">
                      <div className="flex justify-between items-center">
                          <h3 className="font-serif text-xl font-bold text-stone-100">Job Requests</h3>
                      </div>
                      
                      {myBookings.length > 0 ? (
                        <div className="grid gap-4">
                          {myBookings.map(booking => {
                             const slotInfo = getSlotDisplay(booking.timeSlot);
                             return (
                              <div key={booking.id} className={`bg-stone-900 border rounded-2xl p-6 shadow-lg transition-all ${booking.status === 'PENDING' ? 'border-amber-600/50 shadow-amber-900/10' : 'border-stone-800 hover:border-stone-700'}`}>
                                {/* ... (Provider booking card logic remains same) ... */}
                                <div className="flex justify-between items-start mb-4">
                                  <div>
                                     <div className="flex items-center gap-2 mb-1">
                                        <h4 className="font-bold text-stone-200 text-lg">{booking.serviceType}</h4>
                                        {booking.bookingQueueType === 'priority' && (
                                            <span className="px-2 py-0.5 bg-amber-900/30 text-amber-500 text-[10px] font-bold uppercase rounded border border-amber-900/50 flex items-center gap-1">
                                                <Layers className="w-3 h-3"/> Priority
                                            </span>
                                        )}
                                        {booking.isEmergency && (
                                            <span className="px-2 py-0.5 bg-red-900/30 text-red-500 text-[10px] font-bold uppercase rounded border border-red-900/50 flex items-center gap-1 animate-pulse">
                                                <Zap className="w-3 h-3"/> Emergency
                                            </span>
                                        )}
                                     </div>
                                     <p className="text-stone-500 text-sm">Customer: <span className="text-stone-300 font-medium">{booking.customerName}</span></p>
                                     <p className="text-stone-500 text-xs mt-1 max-w-md line-clamp-2">{booking.description}</p>
                                  </div>
                                  <div className="text-right">
                                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide border ${
                                      booking.status === 'CONFIRMED' ? 'bg-blue-900/20 text-blue-400 border-blue-900/30' :
                                      booking.status === 'COMPLETED' ? 'bg-emerald-900/20 text-emerald-400 border-emerald-900/30' :
                                      booking.status === 'PAID' ? 'bg-amber-900/20 text-amber-500 border-amber-900/30' :
                                      booking.status === 'REJECTED' || booking.status === 'CANCELLED' ? 'bg-red-900/20 text-red-400 border-red-900/30' :
                                      booking.status === 'PENDING' ? 'bg-amber-600 text-stone-900 border-amber-600 shadow-lg shadow-amber-900/20 animate-pulse' : 
                                      'bg-stone-800 text-stone-400 border-stone-700'
                                    }`}>
                                      {booking.status}
                                    </span>
                                  </div>
                                </div>
                                
                                <div className="grid md:grid-cols-2 gap-4 text-sm text-stone-400 mb-6 bg-stone-950 p-4 rounded-xl border border-stone-800">
                                  <div className="flex items-center gap-2">
                                    <Calendar className="w-4 h-4 text-stone-500" />
                                    {new Date(booking.serviceDate).toLocaleDateString()}
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <slotInfo.icon className="w-4 h-4 text-stone-500" />
                                    {slotInfo.label}
                                  </div>
                                  <div className="flex items-center gap-2 col-span-2 md:col-span-1">
                                    <MapPin className="w-4 h-4 text-stone-500 flex-shrink-0" />
                                    <span className="truncate">{booking.address}</span>
                                  </div>
                                   <div className="flex items-center gap-2 col-span-2 md:col-span-1">
                                    <span className="text-xs font-bold uppercase text-stone-500">Earnings:</span>
                                    <span className="font-bold text-premium-gold">₹{booking.billing.subtotal}</span>
                                  </div>
                                </div>

                                <div className="flex flex-wrap gap-3 pt-4 border-t border-stone-800">
                                    {booking.status === 'PENDING' && (
                                      <>
                                        <button 
                                          onClick={() => onUpdateStatus(booking.id, 'CONFIRMED')}
                                          className="flex items-center gap-2 px-6 py-2 bg-premium-gold btn-shine text-stone-900 rounded-lg text-sm font-bold shadow-lg shadow-amber-900/20 hover:shadow-xl transition-all"
                                        >
                                          <CheckCircle2 className="w-4 h-4" /> Accept Job
                                        </button>
                                        <button 
                                          onClick={() => onUpdateStatus(booking.id, 'REJECTED')}
                                          className="flex items-center gap-2 px-6 py-2 bg-stone-800 text-stone-400 rounded-lg text-sm font-bold hover:bg-stone-700 hover:text-stone-200 transition-colors border border-stone-700"
                                        >
                                          <XCircle className="w-4 h-4" /> Decline
                                        </button>
                                      </>
                                    )}
                                    {booking.status === 'CONFIRMED' && (
                                      <button 
                                        onClick={() => onUpdateStatus(booking.id, 'COMPLETED')}
                                        className="flex items-center gap-2 px-6 py-2 bg-emerald-600 text-white rounded-lg text-sm font-bold shadow-lg shadow-emerald-900/20 hover:bg-emerald-500 transition-all w-full md:w-auto justify-center"
                                      >
                                        <CheckCircle2 className="w-4 h-4" /> Mark Completed
                                      </button>
                                    )}
                                </div>
                              </div>
                             );
                          })}
                        </div>
                      ) : (
                        <div className="text-center py-20 bg-stone-900 rounded-2xl border border-stone-800 border-dashed">
                           <div className="w-16 h-16 bg-stone-950 rounded-full flex items-center justify-center mx-auto mb-4">
                              <Briefcase className="w-8 h-8 text-stone-700" />
                           </div>
                           <p className="text-stone-500 font-medium">No job requests yet.</p>
                           <p className="text-stone-600 text-sm mt-2">New jobs will appear here instantly.</p>
                        </div>
                      )}
                  </div>
              )}
          </div>
      )}

      {/* --- PAYMENT MODAL (For Customer) --- */}
      {paymentBooking && paymentBooking.status === 'COMPLETED' && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-stone-950/80 backdrop-blur-sm animate-fade-in">
              <div className="bg-stone-900 border border-stone-800 rounded-2xl max-w-md w-full shadow-2xl relative overflow-hidden">
                  <button 
                    onClick={() => setPaymentBooking(null)}
                    disabled={isProcessingPayment}
                    className="absolute top-4 right-4 text-stone-500 hover:text-stone-300 disabled:opacity-0"
                  >
                      <X className="w-5 h-5" />
                  </button>

                  <div className="bg-stone-950 px-6 py-6 border-b border-stone-800">
                      <h3 className="font-serif text-xl font-bold text-stone-100 mb-1">Complete Payment</h3>
                      <p className="text-stone-500 text-xs">Booking ID: {paymentBooking.id.toUpperCase()}</p>
                  </div>

                  <div className="p-6 space-y-6">
                      {/* Bill Summary */}
                      <div className="bg-stone-950 rounded-xl border border-stone-800 p-4">
                          <div className="flex justify-between text-xs text-stone-400 mb-2">
                              <span>Service Total</span>
                              <span>₹{paymentBooking.billing.subtotal}</span>
                          </div>
                          <div className="flex justify-between text-xs text-stone-400 mb-2">
                              <span>Platform Fee</span>
                              <span>₹{paymentBooking.billing.platformFee}</span>
                          </div>
                          <div className="flex justify-between text-xs text-stone-400 mb-3">
                              <span>Taxes (18%)</span>
                              <span>₹{paymentBooking.billing.tax}</span>
                          </div>
                          <div className="flex justify-between items-center pt-3 border-t border-stone-800">
                              <span className="font-bold text-stone-200">Total Payable</span>
                              <span className="font-serif text-xl font-bold text-premium-gold">₹{paymentBooking.billing.total}</span>
                          </div>
                      </div>

                      {/* Payment Method Selection */}
                      <div>
                          <label className="block text-xs font-bold text-stone-500 uppercase mb-3">Select Payment Method</label>
                          <div className="space-y-2">
                              <label className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all ${paymentMethod === 'UPI' ? 'bg-amber-900/10 border-amber-600/50' : 'bg-stone-950 border-stone-800 hover:border-stone-700'}`}>
                                  <input type="radio" name="payment" className="accent-amber-500" checked={paymentMethod === 'UPI'} onChange={() => setPaymentMethod('UPI')} />
                                  <div className="w-8 h-8 rounded bg-stone-800 flex items-center justify-center text-stone-400"><Zap className="w-4 h-4"/></div>
                                  <span className="text-sm font-medium text-stone-200">UPI / GPay / PhonePe</span>
                              </label>
                              
                              <label className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all ${paymentMethod === 'CARD' ? 'bg-amber-900/10 border-amber-600/50' : 'bg-stone-950 border-stone-800 hover:border-stone-700'}`}>
                                  <input type="radio" name="payment" className="accent-amber-500" checked={paymentMethod === 'CARD'} onChange={() => setPaymentMethod('CARD')} />
                                  <div className="w-8 h-8 rounded bg-stone-800 flex items-center justify-center text-stone-400"><CreditCard className="w-4 h-4"/></div>
                                  <span className="text-sm font-medium text-stone-200">Credit / Debit Card</span>
                              </label>

                              <label className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all ${paymentMethod === 'NET' ? 'bg-amber-900/10 border-amber-600/50' : 'bg-stone-950 border-stone-800 hover:border-stone-700'}`}>
                                  <input type="radio" name="payment" className="accent-amber-500" checked={paymentMethod === 'NET'} onChange={() => setPaymentMethod('NET')} />
                                  <div className="w-8 h-8 rounded bg-stone-800 flex items-center justify-center text-stone-400"><Landmark className="w-4 h-4"/></div>
                                  <span className="text-sm font-medium text-stone-200">Net Banking</span>
                              </label>

                              <label className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all ${paymentMethod === 'CASH' ? 'bg-amber-900/10 border-amber-600/50' : 'bg-stone-950 border-stone-800 hover:border-stone-700'}`}>
                                  <input type="radio" name="payment" className="accent-amber-500" checked={paymentMethod === 'CASH'} onChange={() => setPaymentMethod('CASH')} />
                                  <div className="w-8 h-8 rounded bg-stone-800 flex items-center justify-center text-stone-400"><Banknote className="w-4 h-4"/></div>
                                  <span className="text-sm font-medium text-stone-200">Cash on Delivery</span>
                              </label>
                          </div>
                      </div>

                      {/* Card Input Simulation */}
                      {paymentMethod === 'CARD' && (
                          <div className="animate-fade-in space-y-3">
                              <input type="text" placeholder="Card Number" className="w-full bg-stone-950 border border-stone-800 rounded-lg p-2.5 text-sm text-stone-200 focus:border-amber-600 focus:outline-none" />
                              <div className="grid grid-cols-2 gap-3">
                                  <input type="text" placeholder="MM/YY" className="w-full bg-stone-950 border border-stone-800 rounded-lg p-2.5 text-sm text-stone-200 focus:border-amber-600 focus:outline-none" />
                                  <input type="text" placeholder="CVV" className="w-full bg-stone-950 border border-stone-800 rounded-lg p-2.5 text-sm text-stone-200 focus:border-amber-600 focus:outline-none" />
                              </div>
                          </div>
                      )}

                      <button 
                          onClick={handlePay}
                          disabled={isProcessingPayment}
                          className="w-full py-3.5 bg-premium-gold btn-shine text-stone-900 rounded-xl font-bold shadow-lg shadow-amber-900/20 hover:shadow-xl transition-all disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                      >
                          {isProcessingPayment ? (
                              <>
                                  <span className="w-4 h-4 border-2 border-stone-900 border-t-transparent rounded-full animate-spin"></span>
                                  Processing...
                              </>
                          ) : (
                              <>Pay ₹{paymentBooking.billing.total}</>
                          )}
                      </button>
                  </div>
              </div>
          </div>
      )}

      {/* --- REVIEW MODAL --- */}
      {reviewBookingId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-stone-900 border border-stone-800 rounded-2xl max-w-md w-full p-6 shadow-2xl">
             <h3 className="font-serif text-xl font-bold text-stone-100 mb-4 text-center">Rate your experience</h3>
             <div className="flex justify-center gap-2 mb-6">
                {[1, 2, 3, 4, 5].map((star) => (
                   <button 
                      key={star} 
                      type="button" 
                      onClick={() => setReviewRating(star)}
                      className={`transition-transform hover:scale-110 ${star <= reviewRating ? 'text-amber-500' : 'text-stone-700'}`}
                   >
                      <Star className="w-8 h-8 fill-current" />
                   </button>
                ))}
             </div>
             <textarea 
                value={reviewText}
                onChange={(e) => setReviewText(e.target.value)}
                placeholder="Write a short review..."
                className="w-full p-3 bg-stone-950 border border-stone-800 rounded-xl text-stone-200 text-sm focus:border-amber-600 focus:outline-none resize-none h-24 mb-4"
             ></textarea>
             <div className="flex gap-3">
                <button onClick={() => setReviewBookingId(null)} className="flex-1 py-2.5 bg-stone-800 text-stone-400 rounded-lg font-bold text-sm hover:bg-stone-700">Cancel</button>
                <button onClick={handleReviewSubmit} className="flex-1 py-2.5 bg-premium-gold text-stone-900 rounded-lg font-bold text-sm shadow-lg hover:shadow-xl">Submit</button>
             </div>
          </div>
        </div>
      )}

      {/* --- EDIT PROFILE MODAL (Provider) --- */}
      {isEditProfileOpen && editFormData && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/80 backdrop-blur-sm animate-fade-in overflow-y-auto">
              <div className="bg-stone-900 border border-stone-800 rounded-2xl max-w-2xl w-full shadow-2xl relative my-8">
                   <button onClick={() => setIsEditProfileOpen(false)} className="absolute top-4 right-4 text-stone-500 hover:text-stone-300">
                       <X className="w-6 h-6" />
                   </button>
                   
                   <div className="p-6 border-b border-stone-800">
                       <h3 className="font-serif text-xl font-bold text-stone-100">Edit Business Profile</h3>
                   </div>
                   
                   <form onSubmit={handleEditFormSubmit} className="p-6 space-y-6 max-h-[70vh] overflow-y-auto custom-scrollbar">
                       {/* Profile Image */}
                       <div className="flex items-center gap-6">
                           <div className="w-20 h-20 rounded-xl bg-stone-950 border border-stone-800 flex items-center justify-center overflow-hidden">
                               {newProfileImage ? (
                                   <img src={URL.createObjectURL(newProfileImage)} alt="New" className="w-full h-full object-cover" />
                               ) : (
                                   <img src={editFormData.imageUrl} alt="Current" className="w-full h-full object-cover" />
                               )}
                           </div>
                           <div>
                               <label className="block text-sm font-bold text-stone-400 mb-2">Profile Photo</label>
                               <label className="cursor-pointer bg-stone-800 hover:bg-stone-700 text-stone-300 px-4 py-2 rounded-lg text-xs font-bold border border-stone-700 transition-colors inline-flex items-center gap-2">
                                   <Camera className="w-3 h-3" /> Change Photo
                                   <input type="file" accept="image/*" className="hidden" onChange={handleProfileImageChange} />
                               </label>
                           </div>
                       </div>

                       <div className="grid md:grid-cols-2 gap-4">
                           <div>
                               <label className="block text-xs font-bold text-stone-500 uppercase mb-1.5">Business Name</label>
                               <input 
                                   type="text" 
                                   value={editFormData.name} 
                                   onChange={(e) => setEditFormData({...editFormData, name: e.target.value})}
                                   className="w-full bg-stone-950 border border-stone-800 rounded-lg p-2.5 text-stone-200 focus:border-amber-600 focus:outline-none"
                               />
                           </div>
                           <div>
                               <label className="block text-xs font-bold text-stone-500 uppercase mb-1.5">Phone</label>
                               <input 
                                   type="text" 
                                   value={editFormData.phone || ''} 
                                   onChange={(e) => setEditFormData({...editFormData, phone: e.target.value})}
                                   className="w-full bg-stone-950 border border-stone-800 rounded-lg p-2.5 text-stone-200 focus:border-amber-600 focus:outline-none"
                               />
                           </div>
                       </div>

                       <div>
                           <label className="block text-xs font-bold text-stone-500 uppercase mb-1.5">Description</label>
                           <textarea 
                               value={editFormData.description} 
                               onChange={(e) => setEditFormData({...editFormData, description: e.target.value})}
                               className="w-full bg-stone-950 border border-stone-800 rounded-lg p-2.5 text-stone-200 focus:border-amber-600 focus:outline-none resize-none h-24"
                           />
                       </div>

                       <div>
                           <label className="block text-xs font-bold text-stone-500 uppercase mb-1.5">Skills (comma separated)</label>
                           <input 
                               type="text" 
                               value={editFormData.skills.join(', ')} 
                               onChange={handleSkillsChange}
                               className="w-full bg-stone-950 border border-stone-800 rounded-lg p-2.5 text-stone-200 focus:border-amber-600 focus:outline-none"
                           />
                       </div>

                       {/* Availability Section */}
                       <div className="bg-stone-950 p-4 rounded-xl border border-stone-800">
                           <h4 className="font-bold text-stone-300 text-sm mb-3">Availability Settings</h4>
                           
                           <div className="mb-4">
                               <label className="block text-xs font-bold text-stone-500 mb-2">Working Days</label>
                               <div className="flex gap-2 flex-wrap">
                                   {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
                                       <button
                                           key={day}
                                           type="button"
                                           onClick={() => toggleDay(day)}
                                           className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-colors ${
                                               editFormData.availability?.days.includes(day)
                                               ? 'bg-amber-900/20 text-amber-500 border-amber-900/50'
                                               : 'bg-stone-900 text-stone-500 border-stone-800'
                                           }`}
                                       >
                                           {day}
                                       </button>
                                   ))}
                               </div>
                           </div>

                           <div className="grid grid-cols-2 gap-4 mb-4">
                               <div>
                                   <label className="block text-xs font-bold text-stone-500 mb-1">Start Time</label>
                                   <input 
                                       type="time" 
                                       value={editFormData.availability?.startTime} 
                                       onChange={(e) => setEditFormData({ ...editFormData, availability: { ...editFormData.availability!, startTime: e.target.value } })}
                                       className="w-full bg-stone-900 border border-stone-800 rounded-lg p-2 text-stone-200 text-sm"
                                   />
                               </div>
                               <div>
                                   <label className="block text-xs font-bold text-stone-500 mb-1">End Time</label>
                                   <input 
                                       type="time" 
                                       value={editFormData.availability?.endTime} 
                                       onChange={(e) => setEditFormData({ ...editFormData, availability: { ...editFormData.availability!, endTime: e.target.value } })}
                                       className="w-full bg-stone-900 border border-stone-800 rounded-lg p-2 text-stone-200 text-sm"
                                   />
                               </div>
                           </div>

                           <div>
                               <label className="block text-xs font-bold text-stone-500 mb-2">Blocked Dates (Leaves)</label>
                               <div className="flex gap-2 mb-2">
                                   <input 
                                       type="date" 
                                       value={blockedDateInput} 
                                       onChange={(e) => setBlockedDateInput(e.target.value)}
                                       className="bg-stone-900 border border-stone-800 rounded-lg p-2 text-stone-200 text-sm [color-scheme:dark]"
                                   />
                                   <button 
                                       type="button" 
                                       onClick={addBlockedDate}
                                       disabled={!blockedDateInput}
                                       className="bg-stone-800 hover:bg-stone-700 text-stone-300 px-3 py-2 rounded-lg text-xs font-bold transition-colors"
                                   >
                                       Block Date
                                   </button>
                               </div>
                               <div className="flex flex-wrap gap-2">
                                   {editFormData.availability?.blockedDates.map(date => (
                                       <div key={date} className="flex items-center gap-1 bg-red-900/10 border border-red-900/30 text-red-400 px-2 py-1 rounded text-xs">
                                           {date}
                                           <button type="button" onClick={() => removeBlockedDate(date)} className="hover:text-red-300"><X className="w-3 h-3"/></button>
                                       </div>
                                   ))}
                               </div>
                           </div>
                       </div>
                   </form>

                   <div className="p-6 border-t border-stone-800 flex justify-end gap-3 bg-stone-900 rounded-b-2xl">
                       <button onClick={() => setIsEditProfileOpen(false)} className="px-5 py-2.5 bg-stone-800 text-stone-400 rounded-xl font-bold text-sm hover:bg-stone-700 transition-colors">Cancel</button>
                       <button onClick={handleEditFormSubmit} className="px-5 py-2.5 bg-premium-gold text-stone-900 rounded-xl font-bold text-sm shadow-lg hover:shadow-xl transition-all">Save Changes</button>
                   </div>
              </div>
          </div>
      )}

      {/* --- RECEIPT PREVIEW MODAL --- */}
      {selectedReceipt && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-stone-950/90 backdrop-blur-sm animate-fade-in">
              <div className="bg-stone-900 border border-stone-700 rounded-xl max-w-sm w-full p-0 shadow-2xl overflow-hidden relative">
                  <button onClick={() => setSelectedReceipt(null)} className="absolute top-2 right-2 text-stone-500 hover:text-stone-300 p-2">
                      <X className="w-5 h-5" />
                  </button>
                  
                  {/* Digital Receipt Design */}
                  <div className="bg-stone-100 p-6 text-stone-900">
                      <div className="text-center border-b-2 border-dashed border-stone-300 pb-4 mb-4">
                          <div className="font-serif font-bold text-2xl tracking-tight mb-1">ServiceLink</div>
                          <div className="text-[10px] text-stone-500 uppercase tracking-widest">Transaction Receipt</div>
                      </div>

                      <div className="space-y-3 text-sm">
                          <div className="flex justify-between">
                              <span className="text-stone-500">Date</span>
                              <span className="font-mono font-bold">{new Date(selectedReceipt.date).toLocaleDateString()}</span>
                          </div>
                          <div className="flex justify-between">
                              <span className="text-stone-500">Time</span>
                              <span className="font-mono font-bold">{new Date(selectedReceipt.date).toLocaleTimeString()}</span>
                          </div>
                          <div className="flex justify-between">
                              <span className="text-stone-500">Type</span>
                              <span className="font-bold uppercase text-xs bg-stone-200 px-1.5 py-0.5 rounded">{selectedReceipt.type.replace(/_/g, ' ')}</span>
                          </div>
                          <div className="flex justify-between">
                              <span className="text-stone-500">Txn ID</span>
                              <span className="font-mono text-[10px]">{selectedReceipt.id.substr(0, 16)}...</span>
                          </div>
                      </div>

                      <div className="my-6 border-t-2 border-b-2 border-stone-300 py-4 text-center">
                           <div className="text-stone-500 text-xs uppercase mb-1">Amount</div>
                           <div className={`text-3xl font-bold font-mono ${
                               selectedReceipt.type === 'EARNING_CREDIT' ? 'text-emerald-600' : 'text-stone-900'
                           }`}>
                               {selectedReceipt.type === 'EARNING_CREDIT' ? '+' : '-'}₹{selectedReceipt.amount.toLocaleString()}
                           </div>
                      </div>

                      <div className="space-y-2 text-xs text-stone-600">
                           <div className="flex justify-between">
                               <span>Opening Balance</span>
                               <span className="font-mono">₹{selectedReceipt.previousBalance.toLocaleString()}</span>
                           </div>
                           <div className="flex justify-between font-bold text-stone-900">
                               <span>Closing Balance</span>
                               <span className="font-mono">₹{selectedReceipt.newBalance.toLocaleString()}</span>
                           </div>
                      </div>

                      <div className="mt-6 pt-4 border-t border-stone-200 text-center">
                          <p className="text-stone-500 text-[10px] italic">{selectedReceipt.description}</p>
                          <div className="mt-4 text-[10px] text-stone-400 font-mono">Auth: {selectedReceipt.id}</div>
                      </div>
                  </div>
                  
                  {/* Receipt Bottom Edge (Jagged) */}
                  <div className="h-4 bg-stone-100 relative">
                      <div className="absolute top-0 left-0 w-full h-full" style={{
                          background: "linear-gradient(45deg, transparent 33.333%, #1c1917 33.333%, #1c1917 66.667%, transparent 66.667%), linear-gradient(-45deg, transparent 33.333%, #1c1917 33.333%, #1c1917 66.667%, transparent 66.667%)",
                          backgroundSize: "10px 20px",
                          backgroundPosition: "0 10px"
                      }}></div>
                  </div>
              </div>
          </div>
      )}

    </div>
  );
};

export default Dashboard;

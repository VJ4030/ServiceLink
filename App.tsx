
import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Search from './pages/Search';
import ProviderProfile from './pages/ProviderProfile';
import Dashboard from './pages/Dashboard';
import AdminDashboard from './pages/AdminDashboard';
import BookingModal from './components/BookingModal';
import { HowItWorks, Pricing, AboutUs, Careers, TrustSafety, JoinPro, SuccessStories, ProResources } from './pages/StaticPages';
import { Login, Register } from './components/Auth';
import { UserRole, ServiceCategory, Provider, User, Booking, Address, Review, Notification, WithdrawalRequest, WalletTransaction } from './types';
import { MOCK_PROVIDERS, MOCK_BOOKINGS, MOCK_USER, MOCK_USERS, SERVICE_CATALOG } from './mockData';

// Increment this version when mock data structure changes to force client reset
const APP_DATA_VERSION = 'v1.24'; 

function App() {
  const [page, setPage] = useState('home');
  const [user, setUser] = useState<User | null>(null);
  
  // --- STATE PERSISTENCE & INITIALIZATION ---
  const loadState = <T,>(key: string, fallback: T): T => {
    const savedVersion = localStorage.getItem('serviceLink_version');
    if (savedVersion !== APP_DATA_VERSION) {
      return fallback; 
    }
    const saved = localStorage.getItem(key);
    return saved ? JSON.parse(saved) : fallback;
  };

  // --- SCORE CALCULATION LOGIC ---
  const calculateProviderScore = (provider: Provider, allBookings: Booking[], allTransactions: WalletTransaction[]) => {
      const providerBookings = allBookings.filter(b => b.providerId === provider.id);
      const totalJobs = providerBookings.length;
      
      if (totalJobs === 0) return { score: 60, badge: 'New' as const }; // Default

      // 1. Rating (30%)
      const ratingScore = (provider.rating / 5) * 30;

      // 2. Completion Rate (25%)
      const completed = providerBookings.filter(b => b.status === 'COMPLETED' || b.status === 'PAID').length;
      const completionRate = completed / totalJobs;
      const completionScore = completionRate * 25;

      // 3. Response/Reliability (20%) - Proxy: Rejection Rate
      // Low rejection = High response score
      const rejected = providerBookings.filter(b => b.status === 'REJECTED').length;
      const responseRate = totalJobs > 0 ? (totalJobs - rejected) / totalJobs : 1;
      const responseScore = responseRate * 20;

      // 4. Cancellation Rate (15%)
      const cancelled = providerBookings.filter(b => b.status === 'CANCELLED').length;
      const cancellationRate = totalJobs > 0 ? cancelled / totalJobs : 0;
      const cancellationScore = (1 - cancellationRate) * 15;

      // 5. Wallet Stability (10%)
      const hasPenalties = allTransactions.some(t => t.providerId === provider.id && t.type === 'LATE_PENALTY');
      const isNegative = provider.walletBalance < 0;
      let walletScore = 10;
      if (hasPenalties) walletScore -= 5;
      if (isNegative) walletScore -= 5;
      if (walletScore < 0) walletScore = 0;

      const totalScore = Math.min(100, Math.round(ratingScore + completionScore + responseScore + cancellationScore + walletScore));

      let badge: 'Elite' | 'Top Rated' | 'Reliable' | 'New' = 'New';
      if (totalScore >= 90) badge = 'Elite';
      else if (totalScore >= 75) badge = 'Top Rated';
      else if (totalScore >= 60) badge = 'Reliable';

      return { score: totalScore, badge };
  };

  // Initialize providers with default wallet values if missing
  const initProviders = (providers: Provider[], bookings: Booking[] = [], transactions: WalletTransaction[] = []) => {
      return providers.map(p => {
          const base = {
            ...p,
            walletBalance: p.walletBalance ?? 0,
            totalEarned: p.totalEarned ?? 0,
            totalWithdrawn: p.totalWithdrawn ?? 0,
            negativeBalanceLimit: p.negativeBalanceLimit ?? 500,
            isNegativeActive: p.isNegativeActive ?? false,
            customPricing: p.customPricing ?? {},
            performanceScore: p.performanceScore ?? 60,
            badge: p.badge ?? 'New'
          };
          
          // Initial Score Calculation
          if (bookings.length > 0) {
             const stats = calculateProviderScore(base, bookings, transactions);
             base.performanceScore = stats.score;
             base.badge = stats.badge;
          }
          return base;
      });
  };

  const [users, setUsers] = useState<User[]>(() => loadState('serviceLink_users', MOCK_USERS));
  const [bookings, setBookings] = useState<Booking[]>(() => loadState('serviceLink_bookings', MOCK_BOOKINGS));
  const [walletTransactions, setWalletTransactions] = useState<WalletTransaction[]>(() => loadState('serviceLink_transactions', []));
  // Initialize Providers dependent on Bookings/Transactions loaded first
  const [providers, setProviders] = useState<Provider[]>(() => initProviders(loadState('serviceLink_providers', MOCK_PROVIDERS), loadState('serviceLink_bookings', MOCK_BOOKINGS), loadState('serviceLink_transactions', [])));
  
  const [notifications, setNotifications] = useState<Notification[]>(() => loadState('serviceLink_notifications', []));
  const [withdrawalRequests, setWithdrawalRequests] = useState<WithdrawalRequest[]>(() => loadState('serviceLink_withdrawals', []));

  const [selectedCategory, setSelectedCategory] = useState<ServiceCategory | undefined>(undefined);
  const [selectedProvider, setSelectedProvider] = useState<Provider | null>(null);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);

  // Sync state to local storage
  useEffect(() => {
    localStorage.setItem('serviceLink_version', APP_DATA_VERSION);
    localStorage.setItem('serviceLink_bookings', JSON.stringify(bookings));
  }, [bookings]);

  useEffect(() => {
    localStorage.setItem('serviceLink_version', APP_DATA_VERSION);
    localStorage.setItem('serviceLink_providers', JSON.stringify(providers));
  }, [providers]);

  useEffect(() => {
    localStorage.setItem('serviceLink_version', APP_DATA_VERSION);
    localStorage.setItem('serviceLink_users', JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    localStorage.setItem('serviceLink_version', APP_DATA_VERSION);
    localStorage.setItem('serviceLink_notifications', JSON.stringify(notifications));
  }, [notifications]);

  useEffect(() => {
    localStorage.setItem('serviceLink_version', APP_DATA_VERSION);
    localStorage.setItem('serviceLink_withdrawals', JSON.stringify(withdrawalRequests));
  }, [withdrawalRequests]);

  useEffect(() => {
    localStorage.setItem('serviceLink_version', APP_DATA_VERSION);
    localStorage.setItem('serviceLink_transactions', JSON.stringify(walletTransactions));
  }, [walletTransactions]);

  // --- RECALCULATE SCORE WRAPPER ---
  // Helper to update scores with fresh data
  const updateProviderScoresWithData = (providerId: string, currentBookings: Booking[], currentTransactions: WalletTransaction[]) => {
      setProviders(prev => prev.map(p => {
          if (p.id === providerId) {
              const stats = calculateProviderScore(p, currentBookings, currentTransactions);
              return { ...p, performanceScore: stats.score, badge: stats.badge };
          }
          return p;
      }));
  };

  // --- PENALTY CHECK SIMULATION ---
  // Run once on load to check for overdue negative balances
  useEffect(() => {
      const now = new Date();
      
      setProviders(prevProviders => prevProviders.map(p => {
          if (p.isNegativeActive && p.negativeDueDate) {
              const dueDate = new Date(p.negativeDueDate);
              
              // If due date is passed and balance is still negative
              if (now > dueDate && p.walletBalance < 0) {
                  const penaltyAmount = Math.abs(p.walletBalance) * 3;
                  const previousBalance = p.walletBalance;
                  const newBalance = p.walletBalance - penaltyAmount;
                  
                  // Log Penalty Transaction (Receipt)
                  const penaltyTxn: WalletTransaction = {
                      id: `txn_pen_${Date.now()}_${p.id.substr(-4)}`,
                      providerId: p.id,
                      providerName: p.name,
                      amount: penaltyAmount,
                      type: 'LATE_PENALTY',
                      date: now.toISOString(),
                      previousBalance: previousBalance,
                      newBalance: newBalance,
                      status: 'completed',
                      description: '3x Penalty for delayed overdraft repayment'
                  };
                  
                  // Update Transactions State
                  const newTxns = [penaltyTxn, ...walletTransactions];
                  setWalletTransactions(newTxns);
                  
                  handleSendNotification(p.id, `Urgent: 3x Penalty of ₹${penaltyAmount} charged for overdue negative balance.`, 'ERROR');

                  const updatedProvider = {
                      ...p,
                      walletBalance: newBalance,
                      negativeDueDate: new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000).toISOString()
                  };

                  // Recalculate Score immediately due to penalty
                  const stats = calculateProviderScore(updatedProvider, bookings, newTxns);
                  return { ...updatedProvider, performanceScore: stats.score, badge: stats.badge };
              }
          }
          return p;
      }));
  }, []);

  // Router Logic with Auth Guard
  const handleNavigate = (target: string, category?: ServiceCategory) => {
    const protectedRoutes = ['profile', 'dashboard', 'admin'];
    // NOTE: 'search', 'how-it-works' etc are public
    
    if (!user && protectedRoutes.includes(target)) {
      alert("Please login or register to access services.");
      setPage('login');
      return;
    }
    
    if (target === 'admin' && user?.role !== UserRole.ADMIN) {
        alert("Access Denied: Admin only.");
        return;
    }

    setPage(target);
    if (category) setSelectedCategory(category);
    window.scrollTo(0, 0);
  };

  // --- NOTIFICATION LOGIC ---
  const handleSendNotification = (userId: string, message: string, type: Notification['type'], relatedId?: string) => {
      const newNotif: Notification = {
          id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          userId,
          message,
          type,
          read: false,
          createdAt: new Date().toISOString(),
          relatedId
      };
      setNotifications(prev => [newNotif, ...prev]);
  };

  const handleMarkAsRead = (id: string) => {
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const handleClearNotifications = () => {
      if (user) {
          setNotifications(prev => prev.filter(n => n.userId !== user.id));
      }
  };

  // --- ACTIONS (The "Backend" Logic) ---

  const handleUpdateBookingStatus = (bookingId: string, status: Booking['status']) => {
    let updatedBookingsList: Booking[] = [];
    
    setBookings(prevBookings => {
        const updated = prevBookings.map(b => b.id === bookingId ? { ...b, status: status } : b);
        updatedBookingsList = updated;
        return updated;
    });

    const booking = bookings.find(b => b.id === bookingId);
    
    if (booking) {
        // WALLET LOGIC: Credit provider when booking is COMPLETED
        if (status === 'COMPLETED' && booking.status !== 'COMPLETED' && booking.status !== 'PAID') {
            const amountToCredit = booking.billing.subtotal; // Net amount (service charge)
            
            setProviders(prevProviders => prevProviders.map(p => {
                if (p.id === booking.providerId) {
                    const previousBalance = p.walletBalance;
                    const newBalance = p.walletBalance + amountToCredit;
                    
                    // Create Earning Receipt
                    const earningTxn: WalletTransaction = {
                        id: `txn_earn_${Date.now()}`,
                        providerId: p.id,
                        providerName: p.name,
                        amount: amountToCredit,
                        type: 'EARNING_CREDIT',
                        date: new Date().toISOString(),
                        previousBalance: previousBalance,
                        newBalance: newBalance,
                        status: 'completed',
                        referenceId: bookingId,
                        description: `Earnings for booking #${booking.id.toUpperCase()}`
                    };
                    
                    const newTxns = [earningTxn, ...walletTransactions];
                    setWalletTransactions(newTxns);

                    // Check if positive balance restores logic
                    const isNowPositive = newBalance >= 0;
                    
                    const updatedProvider = {
                        ...p,
                        walletBalance: newBalance,
                        totalEarned: p.totalEarned + amountToCredit,
                        isNegativeActive: isNowPositive ? false : p.isNegativeActive,
                        negativeDueDate: isNowPositive ? undefined : p.negativeDueDate
                    };

                    // Update Score (Completion + Wallet)
                    const stats = calculateProviderScore(updatedProvider, updatedBookingsList, newTxns);
                    return { ...updatedProvider, performanceScore: stats.score, badge: stats.badge };
                }
                return p;
            }));
            
            handleSendNotification(booking.providerId, `Wallet Credited: ₹${amountToCredit} for booking #${booking.id.toUpperCase()}`, 'SUCCESS', bookingId);
        } else {
            // If status update is NOT completion (e.g. Cancelled, Rejected), just update score
            updateProviderScoresWithData(booking.providerId, updatedBookingsList, walletTransactions);
        }

        // Notifications
        if (status === 'CONFIRMED') {
            handleSendNotification(booking.customerId, `Booking accepted! ${booking.providerName} will arrive on ${new Date(booking.serviceDate).toLocaleDateString()}.`, 'SUCCESS', bookingId);
        } else if (status === 'REJECTED') {
            handleSendNotification(booking.customerId, `Booking request rejected by ${booking.providerName}.`, 'ERROR', bookingId);
        } else if (status === 'COMPLETED') {
            handleSendNotification(booking.customerId, `Service completed by ${booking.providerName}. Please leave a review!`, 'INFO', bookingId);
        }
    }
  };

  const handleUpdateProviderPrice = (serviceId: string, newPrice: number) => {
      if (!user || user.role !== UserRole.PROVIDER || !user.providerProfileId) return;

      setProviders(prev => prev.map(p => {
          if (p.id === user.providerProfileId) {
              const updatedCustomPricing = { ...p.customPricing, [serviceId]: newPrice };
              return { ...p, customPricing: updatedCustomPricing };
          }
          return p;
      }));
      alert("Price updated successfully.");
  };

  const handleRequestWithdrawal = (amount: number) => {
      if (!user || user.role !== UserRole.PROVIDER || !user.providerProfileId) return;
      
      const provider = providers.find(p => p.id === user.providerProfileId);
      if (!provider) return;

      // OVERDRAFT LOGIC
      const overdraftLimit = provider.negativeBalanceLimit || 500;
      const maxWithdrawable = provider.walletBalance + overdraftLimit;

      if (amount > maxWithdrawable) {
          alert(`Insufficient funds. Including overdraft, you can withdraw up to ₹${maxWithdrawable}.`);
          return;
      }

      const requestId = `wd_${Date.now()}`;
      const newRequest: WithdrawalRequest = {
          id: requestId,
          providerId: provider.id,
          providerName: provider.name,
          amount,
          status: 'PENDING',
          date: new Date().toISOString()
      };

      setWithdrawalRequests([newRequest, ...withdrawalRequests]);

      // Generate PENDING Receipt
      const requestTxn: WalletTransaction = {
          id: `txn_req_${Date.now()}`,
          providerId: provider.id,
          providerName: provider.name,
          amount: amount,
          type: 'WITHDRAWAL_REQUEST',
          date: new Date().toISOString(),
          previousBalance: provider.walletBalance,
          newBalance: provider.walletBalance, // No change yet
          status: 'pending',
          referenceId: requestId,
          description: 'Withdrawal requested'
      };
      setWalletTransactions(prev => [requestTxn, ...prev]);

      alert("Withdrawal request submitted. Waiting for admin approval.");
  };

  const handleWithdrawalAction = (requestId: string, action: 'APPROVED' | 'REJECTED') => {
      const request = withdrawalRequests.find(r => r.id === requestId);
      if (!request) return;

      if (action === 'APPROVED') {
          // Deduct from wallet and add to withdrawn
          setProviders(prev => prev.map(p => {
              if (p.id === request.providerId) {
                  const previousBalance = p.walletBalance;
                  const newBalance = p.walletBalance - request.amount;
                  const isOverdraft = newBalance < 0;
                  
                  // Handle Overdraft Activation
                  let negativeDueDate = p.negativeDueDate;
                  if (isOverdraft && !p.isNegativeActive) {
                      const dueDate = new Date();
                      dueDate.setDate(dueDate.getDate() + 5); // 5 days from now
                      negativeDueDate = dueDate.toISOString();
                  }

                  // Determine Transaction Type
                  const txnType = isOverdraft ? 'OVERDRAFT_WITHDRAWAL' : 'NORMAL_WITHDRAWAL';

                  // Generate Approved Receipt
                  const approvedTxn: WalletTransaction = {
                      id: `txn_app_${Date.now()}`,
                      providerId: p.id,
                      providerName: p.name,
                      amount: request.amount,
                      type: txnType,
                      date: new Date().toISOString(),
                      previousBalance: previousBalance,
                      newBalance: newBalance,
                      status: 'completed',
                      approvedBy: 'ADMIN_SYS',
                      referenceId: requestId,
                      description: isOverdraft ? 'Overdraft withdrawal processed' : 'Standard withdrawal processed'
                  };
                  
                  const newTxns = [approvedTxn, ...walletTransactions];
                  setWalletTransactions(newTxns);

                  if (isOverdraft && !p.isNegativeActive) {
                       handleSendNotification(p.id, `Overdraft Activated. Please repay ₹${Math.abs(newBalance)} within 5 days to avoid 3x penalty.`, 'WARNING');
                  }

                  const updatedProvider = {
                      ...p,
                      walletBalance: newBalance,
                      totalWithdrawn: p.totalWithdrawn + request.amount,
                      isNegativeActive: isOverdraft,
                      negativeDueDate: isOverdraft ? negativeDueDate : undefined
                  };

                  // Update score (Wallet impact)
                  const stats = calculateProviderScore(updatedProvider, bookings, newTxns);
                  return { ...updatedProvider, performanceScore: stats.score, badge: stats.badge };
              }
              return p;
          }));
          handleSendNotification(request.providerId, `Withdrawal of ₹${request.amount} Approved! Funds transferred.`, 'SUCCESS');
      } else {
          // Log Rejection
          const provider = providers.find(p => p.id === request.providerId);
          const currentBalance = provider ? provider.walletBalance : 0;

          const rejectTxn: WalletTransaction = {
              id: `txn_rej_${Date.now()}`,
              providerId: request.providerId,
              providerName: request.providerName,
              amount: request.amount,
              type: 'WITHDRAWAL_REJECTED',
              date: new Date().toISOString(),
              previousBalance: currentBalance,
              newBalance: currentBalance,
              status: 'rejected',
              referenceId: requestId,
              description: 'Withdrawal rejected by admin'
          };
          setWalletTransactions(prev => [rejectTxn, ...prev]);
          handleSendNotification(request.providerId, `Withdrawal of ₹${request.amount} Rejected by Admin.`, 'ERROR');
      }

      setWithdrawalRequests(prev => prev.map(r => 
          r.id === requestId ? { ...r, status: action } : r
      ));
  };

  const handlePayment = (bookingId: string) => {
    const updatedBookings = bookings.map(b => 
        b.id === bookingId ? { 
            ...b, 
            status: 'PAID' as const, 
            billing: { ...b.billing, paidAt: new Date().toISOString(), transactionId: `TXN${Date.now()}` }
        } : b
    );
    setBookings(updatedBookings);
    
    // Notify Provider of Payment
    const booking = bookings.find(b => b.id === bookingId);
    if (booking) {
        handleSendNotification(booking.providerId, `Payment received from ${booking.customerName} for ${booking.serviceType}.`, 'SUCCESS', bookingId);
        // Score update on PAID status
        updateProviderScoresWithData(booking.providerId, updatedBookings, walletTransactions);
    }
    
    alert("Payment Successful! Receipt generated.");
  };

  const handleSubmitReview = (bookingId: string, rating: number, text: string) => {
    const booking = bookings.find(b => b.id === bookingId);
    if (!booking) return;

    const newReview: Review = {
        id: `rev_${Date.now()}`,
        author: booking.customerName,
        rating,
        text,
        date: new Date().toISOString().split('T')[0],
        verifiedBooking: true
    };

    const updatedBookings = bookings.map(b => 
        b.id === bookingId ? { ...b, review: newReview } : b
    );
    setBookings(updatedBookings);

    setProviders(prevProviders => prevProviders.map(p => {
        if (p.id === booking.providerId) {
            const newCount = p.reviewCount + 1;
            const newRating = parseFloat(((p.rating * p.reviewCount + rating) / newCount).toFixed(1));
            
            const updatedProvider = {
                ...p,
                rating: newRating,
                reviewCount: newCount,
                reviews: [newReview, ...p.reviews]
            };
            
            // Recalculate Score with new Rating
            const stats = calculateProviderScore(updatedProvider, updatedBookings, walletTransactions);
            return { ...updatedProvider, performanceScore: stats.score, badge: stats.badge };
        }
        return p;
    }));

    // Notify Provider of Review
    handleSendNotification(booking.providerId, `New ${rating}-star review from ${booking.customerName}!`, 'INFO', bookingId);

    alert("Review submitted! Thank you.");
  };

  const handleUpdateProviderProfile = (updatedProvider: Provider) => {
      setProviders(prevProviders => prevProviders.map(p => 
          p.id === updatedProvider.id ? updatedProvider : p
      ));

      setUsers(prevUsers => prevUsers.map(u => {
          if (u.providerProfileId === updatedProvider.id) {
              return { 
                  ...u, 
                  name: updatedProvider.name,
                  phone: updatedProvider.phone || u.phone 
              };
          }
          return u;
      }));

      if (user && user.providerProfileId === updatedProvider.id) {
          setUser(prev => prev ? {
              ...prev,
              name: updatedProvider.name,
              phone: updatedProvider.phone || prev.phone
          } : null);
      }

      alert("Profile updated successfully!");
  };

  const handleBookingConfirm = (bookingDetails: any) => {
    // --- SERVER SIDE VALIDATION SIMULATION ---
    const queueType = bookingDetails.bookingQueueType === 'priority' ? 'priority' : 'standard';
    const correctPlatformFee = queueType === 'priority' ? 100 : 50;
    
    // Validate Time Slot
    if (!bookingDetails.timeSlot || !['8-12', '12-4', '4-8'].includes(bookingDetails.timeSlot)) {
        alert("Invalid time slot.");
        return;
    }

    // Recalculate total with validated platform fee
    const correctBilling = {
        ...bookingDetails.billing,
        platformFee: correctPlatformFee,
        total: bookingDetails.billing.subtotal + bookingDetails.billing.tax + correctPlatformFee
    };

    const newBooking: Booking = {
      id: `b_${Date.now()}`,
      status: 'PENDING',
      createdAt: new Date().toISOString(),
      ...bookingDetails,
      bookingQueueType: queueType,
      billing: correctBilling,
      timeSlot: bookingDetails.timeSlot // Persist the slot
    };
    
    const updatedBookings = [newBooking, ...bookings];
    setBookings(updatedBookings);
    setIsBookingModalOpen(false);

    // Notify Provider of New Booking
    handleSendNotification(bookingDetails.providerId, `New ${queueType} booking in ${bookingDetails.timeSlot} slot from ${bookingDetails.customerName}.`, 'INFO', newBooking.id);
    
    // Update Score (Pending bookings might affect Completion Rate denominator if we consider total assigned)
    updateProviderScoresWithData(bookingDetails.providerId, updatedBookings, walletTransactions);

    alert("Booking Request Sent! Check your dashboard.");
    setPage('dashboard');
  };

  // --- EMERGENCY BOOKING HANDLER ---
  const handleEmergencyBooking = (details: any) => {
      // Auto-assign logic: Find an approved provider in the category
      const availableProviders = providers.filter(p => p.category === details.category && p.status === 'approved');
      
      // For demo, just pick the first one, or random
      const assignedProvider = availableProviders.length > 0 ? availableProviders[0] : null;

      if (!assignedProvider) {
          alert("No providers available for emergency in this category at the moment.");
          return;
      }

      // RECALCULATE BILLING BASED ON ASSIGNED PROVIDER'S CUSTOM PRICING
      // details.billing comes from Search.tsx based on global catalogue prices.
      // We must check if the assigned provider has a custom price for the service.
      
      let finalBilling = { ...details.billing };
      
      // Try to find the service ID from catalog to lookup custom pricing
      const services = SERVICE_CATALOG[details.category as ServiceCategory] || [];
      const serviceItem = services.find(s => s.name === details.serviceType); // Match by name as ID wasn't passed in details root (it's in search state)
      
      // ENFORCE EMERGENCY FEE
      const emergencyPlatformFee = 150;

      if (serviceItem) {
          const customPrice = assignedProvider.customPricing?.[serviceItem.id];
          if (customPrice) {
              // Recalculate based on custom price
              const basePrice = customPrice;
              const providerExtra = 50; // Surcharge fixed
              const newSubtotal = basePrice + providerExtra;
              const tax = newSubtotal * 0.18;
              const total = newSubtotal + tax + emergencyPlatformFee;
              
              finalBilling = {
                  subtotal: newSubtotal,
                  tax: tax,
                  platformFee: emergencyPlatformFee,
                  total: total
              };
          } else {
              // Recalculate using base price but ensure platform fee is 150
              const basePrice = serviceItem.basePrice;
              const providerExtra = 50;
              const newSubtotal = basePrice + providerExtra;
              const tax = newSubtotal * 0.18;
              const total = newSubtotal + tax + emergencyPlatformFee;

              finalBilling = {
                  subtotal: newSubtotal,
                  tax: tax,
                  platformFee: emergencyPlatformFee,
                  total: total
              };
          }
      }

      const newBooking: Booking = {
          id: `b_em_${Date.now()}`,
          providerId: assignedProvider.id,
          customerId: user?.id || '',
          customerName: user?.name || '',
          providerName: assignedProvider.name,
          serviceDate: new Date().toISOString(), // Immediate
          // bookingTime: "URGENT", // Removed or ignored in display
          status: 'PENDING',
          createdAt: new Date().toISOString(),
          ...details, // category, description, address, isEmergency, emergencyConfirmed
          bookingQueueType: 'emergency', // Explicitly Emergency Queue
          billing: finalBilling,
          isEmergency: true,
          emergencyConfirmed: true,
          emergencyChargeApplied: true
      };

      const updatedBookings = [newBooking, ...bookings];
      setBookings(updatedBookings);
      
      // High Priority Notification
      handleSendNotification(assignedProvider.id, `URGENT: Emergency booking for ${details.serviceType}!`, 'WARNING', newBooking.id);
      
      // Update Score
      updateProviderScoresWithData(assignedProvider.id, updatedBookings, walletTransactions);

      alert(`Emergency Booking Placed. ${assignedProvider.name} has been notified.`);
  };

  // --- ADMIN PENALTY HANDLER ---
  const handleApplyPenalty = (bookingId: string) => {
      setBookings(prev => prev.map(b => {
          if (b.id === bookingId) {
              const currentTotal = b.billing.total;
              const penaltyTotal = currentTotal * 5;
              
              // Notify Customer
              handleSendNotification(b.customerId, `Penalty Applied: Your booking #${b.id.toUpperCase()} has been charged 5x due to misuse of Emergency feature.`, 'ERROR', b.id);
              
              return {
                  ...b,
                  penaltyApplied: true,
                  billing: {
                      ...b.billing,
                      total: penaltyTotal
                  },
                  description: b.description + " [PENALTY APPLIED: MISUSE OF EMERGENCY]"
              };
          }
          return b;
      }));
  };
  
  const handleCancelBooking = (bookingId: string) => {
      const booking = bookings.find(b => b.id === bookingId);
      if(!booking) return;

      if (!booking.createdAt) {
          alert("Error: Missing booking creation date. Cannot verify cancellation window.");
          return;
      }

      const createdTime = new Date(booking.createdAt).getTime();
      const currentTime = Date.now();
      
      if (isNaN(createdTime)) {
          alert("Error: Invalid booking date format.");
          return;
      }

      const diffInMinutes = (currentTime - createdTime) / 1000 / 60;

      if (diffInMinutes > 30) {
          alert("Cancellation is only allowed within 30 minutes of booking creation.");
          return;
      }

      if (booking.status !== 'PENDING' && booking.status !== 'CONFIRMED') {
           alert("This booking cannot be cancelled in its current status.");
           return;
      }

      if (confirm("Are you sure you want to cancel this booking? This action cannot be undone.")) {
           // Notify Provider of Cancellation
           handleSendNotification(booking.providerId, `Booking cancelled by ${booking.customerName}.`, 'WARNING', bookingId);
           
           let updatedBookingsList: Booking[] = [];
           // Directly update status without triggering other notifications in handleUpdateBookingStatus
           setBookings(prev => {
                const updated = prev.map(b => b.id === bookingId ? { ...b, status: 'CANCELLED' as const } : b);
                updatedBookingsList = updated;
                return updated;
           });

           // Update Score (Cancellation impacts)
           updateProviderScoresWithData(booking.providerId, updatedBookingsList, walletTransactions);
      }
  };

  const handleUpdateProviderStatus = (providerId: string, status: 'approved' | 'rejected') => {
      const verificationStatus = status === 'approved' ? 'verified' : 'rejected';
      setProviders(prev => prev.map(p => 
          p.id === providerId ? { ...p, status: status, verificationStatus: verificationStatus } : p
      ));
  };

  const handleDeleteUser = (userId: string) => {
      const userToDelete = users.find(u => u.id === userId);
      
      if (!userToDelete) {
          console.warn(`User with ID ${userId} not found in state.`);
          setProviders(prev => prev.filter(p => p.id !== userId));
          setUsers(prev => prev.filter(u => u.id !== userId));
          return;
      }

      const targetProviderId = userToDelete.providerProfileId;
      const isProviderRole = userToDelete.role === UserRole.PROVIDER;

      setUsers(prevUsers => prevUsers.filter(u => u.id !== userId));

      setProviders(prevProviders => prevProviders.filter(p => {
          if (p.id === userId) return false; 
          if (isProviderRole && targetProviderId && p.id === targetProviderId) return false;
          return true;
      }));

      alert(`${userToDelete.name} has been removed.`);
  };

  // --- AUTH Handlers ---
  const handleLogin = (username: string, role: UserRole) => {
    const existingUser = users.find(u => u.username === username && u.role === role);
    
    if (existingUser) {
        if (existingUser.role === UserRole.PROVIDER && existingUser.providerProfileId) {
            const providerProfile = providers.find(p => p.id === existingUser.providerProfileId);
            
            if (providerProfile) {
                if (providerProfile.status !== 'approved' || providerProfile.verificationStatus !== 'verified') {
                    alert("Your account is under identity verification. Please wait for admin approval.");
                    return;
                }
            }
        }
    
        setUser(existingUser);
        setPage(role === UserRole.ADMIN ? 'admin' : (role === UserRole.PROVIDER ? 'dashboard' : 'search'));
        return;
    }

    if (role === UserRole.ADMIN && username === 'admin') {
        const adminUser: User = {
            id: 'admin_1',
            name: 'System Admin',
            username: 'admin',
            email: 'admin@servicelink.com',
            phone: '0000000000',
            role: UserRole.ADMIN,
            addresses: []
        };
        setUser(adminUser);
        setPage('admin');
        return;
    }

    let userId = role === UserRole.PROVIDER ? `p_${username}` : `u_${username}`;
    let userAddresses: Address[] = [];
    
    if (role === UserRole.CUSTOMER && username === 'amitp') {
      userId = 'u1';
      userAddresses = MOCK_USER.addresses;
    }

    const mockUser: User = {
      id: userId,
      name: username === 'amitp' ? 'Amit Patel' : username, 
      username: username,
      email: `${username.replace(' ', '').toLowerCase()}@example.com`,
      phone: '9999999999',
      role: role,
      addresses: userAddresses,
      providerProfileId: role === UserRole.PROVIDER ? `p_${username}` : undefined
    };
    
    if (role === UserRole.PROVIDER) {
       const existingProvider = providers.find(p => p.name === username || p.id === mockUser.id);
       
       if (username === 'Rajesh Kumar') {
           const rajesh = providers.find(p => p.id === 'prov_rajesh');
           if (rajesh) {
               mockUser.providerProfileId = rajesh.id;
               mockUser.name = rajesh.name;
           }
       } else if (existingProvider) {
         mockUser.providerProfileId = existingProvider.id;
       }
    }

    setUser(mockUser);
    if (role === UserRole.PROVIDER) {
      setPage('dashboard');
    } else {
      setPage('search');
    }
  };

  const handleRegister = (userData: any) => {
    const newUserId = `u_${Date.now()}`;
    const newUser: User = { ...userData, id: newUserId };

    if (newUser.role === UserRole.PROVIDER) {
      const newProvider: Provider = {
        id: `p_${Date.now()}`,
        name: newUser.name,
        category: userData.serviceDetails.category,
        rating: 5.0,
        reviewCount: 0,
        hourlyRate: 500, 
        location: userData.serviceDetails.location,
        distance: "0.5 km",
        imageUrl: userData.profileImage || `https://ui-avatars.com/api/?name=${encodeURIComponent(newUser.name)}&background=random`, 
        aadhaarImageUrl: userData.aadhaarImage,
        description: "New to ServiceLink! Dedicated professional ready to help.",
        skills: [userData.serviceDetails.category],
        reviews: [],
        verified: false,
        email: newUser.email,
        phone: newUser.phone,
        status: 'pending', 
        verificationStatus: 'pending',
        walletBalance: 0,
        totalEarned: 0,
        totalWithdrawn: 0,
        negativeBalanceLimit: 500,
        isNegativeActive: false,
        customPricing: {},
        performanceScore: 60, // Default for New
        badge: 'New'
      };
      setProviders([...providers, newProvider]);
      newUser.providerProfileId = newProvider.id;
      
      setUsers([...users, newUser]);

      alert("Account created! Please wait for identity verification and admin approval.");
      setPage('login');
    } else {
      setUsers([...users, newUser]);
      setUser(newUser);
      setPage('search');
    }
  };

  const handleLogout = () => {
    setUser(null);
    setPage('home');
  };

  const handleProviderSelect = (provider: Provider) => {
    setSelectedProvider(provider);
    setPage('profile');
    window.scrollTo(0, 0);
  };

  const handleBookingStart = () => {
    if (!user) {
      alert("Please sign in to book a service.");
      setPage('login');
      return;
    }
    if (user.role === UserRole.PROVIDER || user.role === UserRole.ADMIN) {
      alert("Only customers can book services.");
      return;
    }
    setIsBookingModalOpen(true);
  };

  const handleAddAddress = (address: Address) => {
    if (user) {
      const updatedUser = { ...user, addresses: [...user.addresses, address] };
      setUser(updatedUser);
      setUsers(users.map(u => u.id === user.id ? updatedUser : u));
    }
  };

  const handleDeleteAddress = (id: string) => {
    if (user) {
      const updatedUser = { ...user, addresses: user.addresses.filter(a => a.id !== id) };
      setUser(updatedUser);
      setUsers(users.map(u => u.id === user.id ? updatedUser : u));
    }
  };

  // Helper for footer navigation (scrollTo top)
  const handleFooterNav = (target: string) => {
      setPage(target);
      window.scrollTo(0, 0);
  };

  return (
    <div className="min-h-screen text-stone-200 antialiased font-sans selection:bg-amber-600/30 selection:text-white">
      <Navbar 
        user={user} 
        notifications={notifications}
        setPage={handleNavigate} 
        onLogout={handleLogout} 
        onMarkAsRead={handleMarkAsRead}
        onClearNotifications={handleClearNotifications}
      />
      
      <main>
        {page === 'home' && (
          <Home onSearch={(cat) => handleNavigate('search', cat)} />
        )}
        
        {page === 'login' && (
          <Login onLogin={handleLogin} onSwitchToRegister={() => setPage('register')} />
        )}

        {page === 'register' && (
          <Register onRegister={handleRegister} onSwitchToLogin={() => setPage('login')} />
        )}

        {page === 'search' && (
          <Search 
            initialCategory={selectedCategory} 
            providers={providers.filter(p => p.status === 'approved')} 
            onSelectProvider={handleProviderSelect}
            user={user}
            onEmergencyBook={handleEmergencyBooking}
          />
        )}

        {page === 'profile' && selectedProvider && (
          <ProviderProfile 
            provider={selectedProvider} 
            onBack={() => setPage('search')}
            onBook={handleBookingStart}
          />
        )}

        {page === 'dashboard' && user && (
          <Dashboard 
            user={user} 
            bookings={bookings}
            providers={providers}
            withdrawalRequests={withdrawalRequests}
            walletTransactions={walletTransactions}
            onAddAddress={handleAddAddress}
            onDeleteAddress={handleDeleteAddress}
            onUpdateStatus={handleUpdateBookingStatus}
            onPayment={handlePayment}
            onReview={handleSubmitReview}
            onCancelBooking={handleCancelBooking}
            onUpdateProviderProfile={handleUpdateProviderProfile}
            onRequestWithdrawal={handleRequestWithdrawal}
            onUpdateProviderPrice={handleUpdateProviderPrice}
          />
        )}

        {page === 'admin' && user?.role === UserRole.ADMIN && (
          <AdminDashboard 
            users={users}
            providers={providers}
            bookings={bookings} 
            withdrawalRequests={withdrawalRequests}
            walletTransactions={walletTransactions}
            onUpdateProviderStatus={handleUpdateProviderStatus}
            onDeleteUser={handleDeleteUser}
            onApplyPenalty={handleApplyPenalty}
            onWithdrawalAction={handleWithdrawalAction}
          />
        )}

        {/* STATIC PAGES */}
        {page === 'how-it-works' && <HowItWorks />}
        {page === 'pricing' && <Pricing />}
        {page === 'about' && <AboutUs />}
        {page === 'careers' && <Careers />}
        {page === 'trust-safety' && <TrustSafety />}
        {page === 'join-pro' && <JoinPro onRegister={() => setPage('register')} />}
        {page === 'success-stories' && <SuccessStories />}
        {page === 'pro-resources' && <ProResources />}

      </main>

      {page !== 'login' && page !== 'register' && (
        <footer className="bg-stone-900 text-stone-500 py-12 mt-20 border-t border-stone-800">
          <div className="max-w-7xl mx-auto px-4 grid md:grid-cols-4 gap-8">
              <div>
                  <div className="font-serif text-stone-100 text-xl font-bold mb-4">ServiceLink</div>
                  <p className="text-sm leading-relaxed">Connecting neighbors with trusted local professionals. Built with care for real communities.</p>
              </div>
              <div>
                  <h4 className="text-stone-100 font-bold mb-4">Platform</h4>
                  <ul className="space-y-2 text-sm">
                      <li onClick={() => handleFooterNav('search')} className="hover:text-stone-300 cursor-pointer">Browse Pros</li>
                      <li onClick={() => handleFooterNav('how-it-works')} className="hover:text-stone-300 cursor-pointer">How it Works</li>
                      <li onClick={() => handleFooterNav('pricing')} className="hover:text-stone-300 cursor-pointer">Pricing</li>
                  </ul>
              </div>
              <div>
                  <h4 className="text-stone-100 font-bold mb-4">Company</h4>
                  <ul className="space-y-2 text-sm">
                      <li onClick={() => handleFooterNav('about')} className="hover:text-stone-300 cursor-pointer">About Us</li>
                      <li onClick={() => handleFooterNav('careers')} className="hover:text-stone-300 cursor-pointer">Careers</li>
                      <li onClick={() => handleFooterNav('trust-safety')} className="hover:text-stone-300 cursor-pointer">Trust & Safety</li>
                  </ul>
              </div>
              <div>
                  <h4 className="text-stone-100 font-bold mb-4">For Pros</h4>
                  <ul className="space-y-2 text-sm">
                      <li onClick={() => handleFooterNav('join-pro')} className="hover:text-stone-300 cursor-pointer">Join as a Pro</li>
                      <li onClick={() => handleFooterNav('success-stories')} className="hover:text-stone-300 cursor-pointer">Success Stories</li>
                      <li onClick={() => handleFooterNav('pro-resources')} className="hover:text-stone-300 cursor-pointer">Pro Resources</li>
                  </ul>
              </div>
          </div>
          <div className="max-w-7xl mx-auto px-4 mt-12 pt-8 border-t border-stone-800 text-xs text-center text-stone-600">
              © {new Date().getFullYear()} ServiceLink Inc. All rights reserved.
          </div>
        </footer>
      )}

      {isBookingModalOpen && selectedProvider && user && (
        <BookingModal 
            provider={selectedProvider} 
            currentUser={user}
            onClose={() => setIsBookingModalOpen(false)} 
            onConfirm={handleBookingConfirm} 
        />
      )}
    </div>
  );
}

export default App;

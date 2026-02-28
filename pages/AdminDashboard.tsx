
import React, { useState, useEffect, useMemo } from 'react';
import { User, UserRole, Provider, Booking, WithdrawalRequest, WalletTransaction } from '../types';
import { Shield, Search, UserX, CheckCircle, XCircle, FileText, TrendingUp, DollarSign, Calendar, Layers, AlertTriangle, Gavel, Wallet, ArrowRightLeft, ScrollText, Filter, Activity, Star, Users, Zap } from 'lucide-react';

interface AdminDashboardProps {
  users: User[];
  providers: Provider[];
  bookings: Booking[];
  withdrawalRequests?: WithdrawalRequest[];
  walletTransactions?: WalletTransaction[];
  onUpdateProviderStatus: (providerId: string, status: 'approved' | 'rejected') => void;
  onDeleteUser: (userId: string) => void;
  onApplyPenalty?: (bookingId: string) => void;
  onWithdrawalAction?: (requestId: string, action: 'APPROVED' | 'REJECTED') => void;
}

// Internal CountUp Component for Animations (Reused for consistency)
const CountUp = ({ end, duration = 1500, prefix = '', suffix = '' }: { end: number, duration?: number, prefix?: string, suffix?: string }) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let startTimestamp: number | null = null;
    const step = (timestamp: number) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      const easeOut = (x: number): number => x === 1 ? 1 : 1 - Math.pow(2, -10 * x);
      setCount(Math.floor(easeOut(progress) * end));
      if (progress < 1) window.requestAnimationFrame(step);
    };
    window.requestAnimationFrame(step);
  }, [end, duration]);

  return <>{prefix}{count.toLocaleString()}{suffix}</>;
};

const AdminDashboard: React.FC<AdminDashboardProps> = ({ 
    users, 
    providers, 
    bookings, 
    withdrawalRequests = [],
    walletTransactions = [],
    onUpdateProviderStatus, 
    onApplyPenalty,
    onWithdrawalAction
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'ALL' | 'CUSTOMER' | 'PROVIDER' | 'PENDING' | 'BOOKINGS' | 'REVENUE' | 'WITHDRAWALS' | 'LOGS'>('ALL');
  
  // Transaction Filters
  const [txnFilterProvider, setTxnFilterProvider] = useState<string>('all');
  const [txnFilterType, setTxnFilterType] = useState<string>('all');

  // --- SMART INSIGHTS AGGREGATION ---
  const insights = useMemo(() => {
    const todayStr = new Date().toISOString().split('T')[0];
    
    // 1. Revenue & Jobs Today
    let todayRev = 0;
    let todayJobs = 0;
    
    // 2. Service Demand
    const catCounts: Record<string, number> = {};

    bookings.forEach(b => {
        // Date Check (using serviceDate for operational activity)
        const jobDate = b.serviceDate.split('T')[0];
        if (jobDate === todayStr && (b.status === 'COMPLETED' || b.status === 'PAID')) {
            todayRev += b.billing.platformFee;
            todayJobs += 1;
        }

        // Demand Aggregation
        catCounts[b.category] = (catCounts[b.category] || 0) + 1;
    });

    let topService = 'N/A';
    let maxCount = 0;
    Object.entries(catCounts).forEach(([cat, count]) => {
        if (count > maxCount) {
            maxCount = count;
            topService = cat;
        }
    });

    // 3. Provider Metrics
    let bestProv = null;
    let maxScore = -1;
    let negativeCount = 0;
    let activeCount = 0;

    providers.forEach(p => {
        if (p.performanceScore > maxScore) {
            maxScore = p.performanceScore;
            bestProv = p;
        }
        if (p.walletBalance < 0) negativeCount++;
        if (p.status === 'approved') activeCount++;
    });

    return {
        todayRevenue: todayRev,
        todayJobs: todayJobs,
        mostDemanded: topService,
        bestProviderName: bestProv ? (bestProv as Provider).name : 'N/A',
        bestProviderScore: maxScore > -1 ? maxScore : 0,
        negativeWallets: negativeCount,
        activeProviders: activeCount
    };
  }, [bookings, providers]);

  // --- REVENUE CALCULATION LOGIC (Detailed) ---
  const revenueStats = useMemo(() => {
    const completedBookings = bookings.filter(b => b.status === 'COMPLETED' || b.status === 'PAID');
    const totalRevenue = completedBookings.reduce((sum, b) => sum + b.billing.platformFee, 0);
    const categoryAgg: Record<string, number> = {};
    completedBookings.forEach(b => {
        categoryAgg[b.category] = (categoryAgg[b.category] || 0) + b.billing.platformFee;
    });
    const categoryData = Object.entries(categoryAgg)
        .map(([name, value]) => ({ name, value }))
        .sort((a, b) => b.value - a.value);

    return { totalRevenue, categoryData, detailedList: completedBookings.sort((a, b) => new Date(b.serviceDate).getTime() - new Date(a.serviceDate).getTime()) };
  }, [bookings]);

  // Helper to get provider status for a user row
  const getProviderStatus = (user: User) => {
    if (user.role !== UserRole.PROVIDER || !user.providerProfileId) return null;
    const provider = providers.find(p => p.id === user.providerProfileId);
    return provider ? provider.status : null;
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    let matchesTab = true;
    if (activeTab === 'ALL') matchesTab = true;
    else if (activeTab === 'PENDING') matchesTab = getProviderStatus(user) === 'pending';
    else if (['REVENUE', 'BOOKINGS', 'WITHDRAWALS', 'LOGS'].includes(activeTab)) matchesTab = false;
    else matchesTab = user.role === activeTab;

    return matchesSearch && matchesTab && user.role !== UserRole.ADMIN;
  });

  const pendingWithdrawals = withdrawalRequests.filter(r => r.status === 'PENDING');

  const sortedLogs = useMemo(() => {
      let logs = [...walletTransactions];
      if (txnFilterProvider !== 'all') logs = logs.filter(l => l.providerId === txnFilterProvider);
      if (txnFilterType !== 'all') logs = logs.filter(l => l.type === txnFilterType);
      return logs.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [walletTransactions, txnFilterProvider, txnFilterType]);

  return (
    <div className="max-w-6xl mx-auto px-4 py-12 min-h-screen">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
        <div>
            <h1 className="font-serif text-3xl font-bold text-stone-100 flex items-center gap-3">
              <Shield className="w-8 h-8 text-amber-500 icon-gold-glow" />
              Admin Control Panel
            </h1>
            <p className="text-stone-500 mt-2">Manage platform users, approvals, and financials.</p>
        </div>
        
        {activeTab !== 'REVENUE' && activeTab !== 'BOOKINGS' && activeTab !== 'WITHDRAWALS' && activeTab !== 'LOGS' && (
            <div className="bg-stone-900 border border-stone-800 rounded-xl px-4 py-2 flex items-center gap-2 w-full md:w-auto focus-within:border-amber-600 transition-colors">
                <Search className="w-4 h-4 text-stone-500" />
                <input 
                type="text" 
                placeholder="Search by name or email" 
                className="bg-transparent border-none focus:outline-none text-stone-200 text-sm w-full md:w-64"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>
        )}
      </div>

      {/* --- SMART INSIGHTS PANEL --- */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-10 animate-fade-in">
          
          {/* 1. Today's Revenue */}
          <div className="bg-stone-900 border border-stone-800 p-4 rounded-2xl shadow-lg relative overflow-hidden group hover:border-amber-900/50 transition-colors">
              <div className="flex items-center gap-2 mb-2 text-stone-500 text-[10px] font-bold uppercase tracking-widest">
                  <DollarSign className="w-3 h-3 text-emerald-500" /> Revenue (Today)
              </div>
              <div className="text-2xl font-serif font-bold text-premium-gold">
                  <CountUp end={insights.todayRevenue} prefix="₹" />
              </div>
          </div>

          {/* 2. Completed Jobs Today */}
          <div className="bg-stone-900 border border-stone-800 p-4 rounded-2xl shadow-lg relative overflow-hidden group hover:border-amber-900/50 transition-colors">
              <div className="flex items-center gap-2 mb-2 text-stone-500 text-[10px] font-bold uppercase tracking-widest">
                  <CheckCircle className="w-3 h-3 text-blue-500" /> Jobs (Today)
              </div>
              <div className="text-2xl font-serif font-bold text-stone-200">
                  <CountUp end={insights.todayJobs} />
              </div>
          </div>

          {/* 3. Most Demanded Service */}
          <div className="bg-stone-900 border border-stone-800 p-4 rounded-2xl shadow-lg relative overflow-hidden group hover:border-amber-900/50 transition-colors">
              <div className="flex items-center gap-2 mb-2 text-stone-500 text-[10px] font-bold uppercase tracking-widest">
                  <TrendingUp className="w-3 h-3 text-amber-500" /> Top Demand
              </div>
              <div className="text-lg font-bold text-stone-200 truncate" title={insights.mostDemanded}>
                  {insights.mostDemanded}
              </div>
          </div>

          {/* 4. Best Provider */}
          <div className="bg-stone-900 border border-stone-800 p-4 rounded-2xl shadow-lg relative overflow-hidden group hover:border-amber-900/50 transition-colors">
              <div className="flex items-center gap-2 mb-2 text-stone-500 text-[10px] font-bold uppercase tracking-widest">
                  <Star className="w-3 h-3 text-yellow-500" /> Top Performer
              </div>
              <div className="text-sm font-bold text-stone-200 truncate mb-1">
                  {insights.bestProviderName}
              </div>
              <div className="text-xs text-amber-500 font-bold bg-amber-900/20 px-2 py-0.5 rounded w-fit">
                  Score: {insights.bestProviderScore}
              </div>
          </div>

          {/* 5. Active Providers */}
          <div className="bg-stone-900 border border-stone-800 p-4 rounded-2xl shadow-lg relative overflow-hidden group hover:border-amber-900/50 transition-colors">
              <div className="flex items-center gap-2 mb-2 text-stone-500 text-[10px] font-bold uppercase tracking-widest">
                  <Users className="w-3 h-3 text-stone-400" /> Active Pros
              </div>
              <div className="text-2xl font-serif font-bold text-stone-200">
                  <CountUp end={insights.activeProviders} />
              </div>
          </div>

          {/* 6. Negative Wallets */}
          <div className={`bg-stone-900 border p-4 rounded-2xl shadow-lg relative overflow-hidden group transition-colors ${insights.negativeWallets > 0 ? 'border-red-900/50 shadow-red-900/10' : 'border-stone-800'}`}>
              <div className="flex items-center gap-2 mb-2 text-stone-500 text-[10px] font-bold uppercase tracking-widest">
                  <AlertTriangle className={`w-3 h-3 ${insights.negativeWallets > 0 ? 'text-red-500 animate-pulse' : 'text-stone-600'}`} /> Overdrafts
              </div>
              <div className={`text-2xl font-serif font-bold ${insights.negativeWallets > 0 ? 'text-red-500' : 'text-stone-200'}`}>
                  <CountUp end={insights.negativeWallets} />
              </div>
          </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-8 border-b border-stone-800 pb-1 overflow-x-auto">
        {['ALL', 'PENDING', 'CUSTOMER', 'PROVIDER', 'BOOKINGS', 'WITHDRAWALS', 'REVENUE', 'LOGS'].map(tab => (
            <button
                key={tab}
                onClick={() => setActiveTab(tab as any)}
                className={`px-4 py-2 text-sm font-bold transition-all relative whitespace-nowrap flex items-center gap-2 ${
                    activeTab === tab 
                    ? 'text-premium-gold' 
                    : 'text-stone-500 hover:text-stone-300'
                }`}
            >
                {tab === 'ALL' ? 'All Users' : 
                 tab === 'PENDING' ? 'Pending Requests' : 
                 tab === 'CUSTOMER' ? 'Customers' : 
                 tab === 'BOOKINGS' ? <><FileText className="w-3 h-3"/> Bookings</> :
                 tab === 'WITHDRAWALS' ? <><Wallet className="w-3 h-3"/> Withdrawals {pendingWithdrawals.length > 0 && <span className="bg-amber-600 text-stone-900 text-[10px] px-1.5 rounded-full ml-1">{pendingWithdrawals.length}</span>}</> :
                 tab === 'REVENUE' ? <><DollarSign className="w-3 h-3"/> Revenue</> :
                 tab === 'LOGS' ? <><ScrollText className="w-3 h-3"/> Transactions</> :
                 'Providers'}
                {activeTab === tab && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-premium-gold shadow-[0_0_10px_rgba(212,175,55,0.5)]"></div>}
            </button>
        ))}
      </div>

      {/* --- LOGS TAB --- */}
      {activeTab === 'LOGS' ? (
          <div className="space-y-4 animate-fade-in">
              {/* Filters */}
              <div className="flex flex-wrap gap-4 mb-4 items-center bg-stone-900 p-4 rounded-xl border border-stone-800">
                  <div className="flex items-center gap-2 text-stone-400 text-sm font-bold uppercase tracking-wider">
                      <Filter className="w-4 h-4" /> Filters:
                  </div>
                  <select 
                      value={txnFilterProvider}
                      onChange={(e) => setTxnFilterProvider(e.target.value)}
                      className="bg-stone-950 border border-stone-800 rounded-lg px-3 py-2 text-sm text-stone-200 focus:border-amber-600 focus:outline-none"
                  >
                      <option value="all">All Providers</option>
                      {providers.map(p => (
                          <option key={p.id} value={p.id}>{p.name}</option>
                      ))}
                  </select>
                  <select 
                      value={txnFilterType}
                      onChange={(e) => setTxnFilterType(e.target.value)}
                      className="bg-stone-950 border border-stone-800 rounded-lg px-3 py-2 text-sm text-stone-200 focus:border-amber-600 focus:outline-none"
                  >
                      <option value="all">All Types</option>
                      <option value="NORMAL_WITHDRAWAL">Withdrawal</option>
                      <option value="OVERDRAFT_WITHDRAWAL">Overdraft</option>
                      <option value="LATE_PENALTY">Penalty</option>
                      <option value="EARNING_CREDIT">Earning</option>
                  </select>
              </div>

              <div className="bg-stone-900 border border-stone-800 rounded-2xl overflow-hidden shadow-xl">
                  <div className="px-6 py-4 border-b border-stone-800 bg-stone-950 flex justify-between items-center">
                      <h3 className="font-serif text-lg font-bold text-stone-100 flex items-center gap-2">
                          <ScrollText className="w-5 h-5 text-amber-500" /> Global Transaction Logs
                      </h3>
                      <span className="text-xs text-stone-500">{sortedLogs.length} records found</span>
                  </div>
                  <div className="overflow-x-auto">
                      <table className="w-full text-left text-sm">
                          <thead>
                              <tr className="bg-stone-950 border-b border-stone-800 text-stone-400">
                                  <th className="px-6 py-4 font-bold uppercase tracking-wider text-xs">Date</th>
                                  <th className="px-6 py-4 font-bold uppercase tracking-wider text-xs">Transaction ID</th>
                                  <th className="px-6 py-4 font-bold uppercase tracking-wider text-xs">Provider</th>
                                  <th className="px-6 py-4 font-bold uppercase tracking-wider text-xs">Type</th>
                                  <th className="px-6 py-4 font-bold uppercase tracking-wider text-xs text-right">Prev Balance</th>
                                  <th className="px-6 py-4 font-bold uppercase tracking-wider text-xs text-right">Amount</th>
                                  <th className="px-6 py-4 font-bold uppercase tracking-wider text-xs text-right">New Balance</th>
                              </tr>
                          </thead>
                          <tbody className="divide-y divide-stone-800">
                              {sortedLogs.length > 0 ? (
                                  sortedLogs.map(log => (
                                      <tr key={log.id} className="hover:bg-stone-800/30 transition-colors">
                                          <td className="px-6 py-4 text-stone-400">
                                              {new Date(log.date).toLocaleDateString()} {new Date(log.date).toLocaleTimeString([],{hour:'2-digit', minute:'2-digit'})}
                                          </td>
                                          <td className="px-6 py-4 font-mono text-stone-500 text-xs">
                                              {log.id}
                                          </td>
                                          <td className="px-6 py-4 text-stone-200">
                                              {log.providerName}
                                          </td>
                                          <td className="px-6 py-4">
                                              <span className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wide border ${
                                                   log.type === 'EARNING_CREDIT' ? 'bg-emerald-900/20 text-emerald-400 border-emerald-900/30' :
                                                   log.type === 'LATE_PENALTY' ? 'bg-red-900/20 text-red-400 border-red-900/30' :
                                                   log.type === 'OVERDRAFT_WITHDRAWAL' ? 'bg-orange-900/20 text-orange-400 border-orange-900/30' :
                                                   log.type.includes('WITHDRAWAL') ? 'bg-blue-900/20 text-blue-400 border-blue-900/30' :
                                                   'bg-stone-800 text-stone-400 border-stone-700'
                                              }`}>
                                                  {log.type.replace(/_/g, ' ')}
                                              </span>
                                          </td>
                                          <td className="px-6 py-4 text-right text-stone-500 font-mono text-xs">
                                              ₹{log.previousBalance.toLocaleString()}
                                          </td>
                                          <td className={`px-6 py-4 text-right font-bold ${
                                              log.type === 'EARNING_CREDIT' ? 'text-emerald-400' : 'text-stone-200'
                                          }`}>
                                              {log.type === 'EARNING_CREDIT' ? '+' : ''}₹{log.amount.toLocaleString()}
                                          </td>
                                          <td className={`px-6 py-4 text-right font-mono text-xs ${log.newBalance < 0 ? 'text-red-500' : 'text-stone-500'}`}>
                                              ₹{log.newBalance.toLocaleString()}
                                          </td>
                                      </tr>
                                  ))
                              ) : (
                                  <tr>
                                      <td colSpan={7} className="px-6 py-12 text-center text-stone-500 italic">No transaction logs available.</td>
                                  </tr>
                              )}
                          </tbody>
                      </table>
                  </div>
              </div>
          </div>
      ) : activeTab === 'WITHDRAWALS' ? (
          /* ... (Withdrawals tab code) ... */
          <div className="bg-stone-900 border border-stone-800 rounded-2xl overflow-hidden shadow-xl animate-fade-in">
              <div className="px-6 py-4 border-b border-stone-800 bg-stone-950 flex justify-between items-center">
                  <h3 className="font-serif text-lg font-bold text-stone-100 flex items-center gap-2">
                      <ArrowRightLeft className="w-5 h-5 text-amber-500" /> Pending Withdrawal Requests
                  </h3>
              </div>
              <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                      <thead>
                          <tr className="bg-stone-950 border-b border-stone-800 text-stone-400">
                              <th className="px-6 py-4 font-bold uppercase tracking-wider text-xs">Date</th>
                              <th className="px-6 py-4 font-bold uppercase tracking-wider text-xs">Provider</th>
                              <th className="px-6 py-4 font-bold uppercase tracking-wider text-xs text-right">Amount</th>
                              <th className="px-6 py-4 font-bold uppercase tracking-wider text-xs text-right">Actions</th>
                          </tr>
                      </thead>
                      <tbody className="divide-y divide-stone-800">
                          {pendingWithdrawals.length > 0 ? (
                              pendingWithdrawals.map(request => (
                                  <tr key={request.id} className="hover:bg-stone-800/30 transition-colors">
                                      <td className="px-6 py-4 text-stone-400">
                                          {new Date(request.date).toLocaleDateString()}
                                      </td>
                                      <td className="px-6 py-4">
                                          <div className="font-bold text-stone-200">{request.providerName}</div>
                                          <div className="text-xs text-stone-500 font-mono">ID: {request.providerId}</div>
                                      </td>
                                      <td className="px-6 py-4 text-right font-bold text-stone-200">
                                          ₹{request.amount.toLocaleString()}
                                      </td>
                                      <td className="px-6 py-4 text-right">
                                          <div className="flex justify-end gap-2">
                                              <button 
                                                  onClick={() => onWithdrawalAction && onWithdrawalAction(request.id, 'APPROVED')}
                                                  className="p-1.5 text-emerald-400 hover:bg-emerald-900/30 rounded-lg transition-colors border border-emerald-900/50"
                                                  title="Approve Transfer"
                                              >
                                                  <CheckCircle className="w-4 h-4" />
                                              </button>
                                              <button 
                                                  onClick={() => onWithdrawalAction && onWithdrawalAction(request.id, 'REJECTED')}
                                                  className="p-1.5 text-red-400 hover:bg-red-900/30 rounded-lg transition-colors border border-red-900/50"
                                                  title="Reject Request"
                                              >
                                                  <XCircle className="w-4 h-4" />
                                              </button>
                                          </div>
                                      </td>
                                  </tr>
                              ))
                          ) : (
                              <tr>
                                  <td colSpan={4} className="px-6 py-12 text-center text-stone-500 italic">No pending withdrawal requests.</td>
                              </tr>
                          )}
                      </tbody>
                  </table>
              </div>
          </div>
      ) : activeTab === 'REVENUE' ? (
          /* ... (Revenue tab code) ... */
          <div className="space-y-8 animate-fade-in">
              {/* Summary Card */}
              <div className="bg-stone-900 border border-stone-800 rounded-2xl p-8 flex items-center justify-between shadow-lg relative overflow-hidden">
                 {/* Subtle gradient border effect */}
                 <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-stone-900 via-amber-900/50 to-stone-900"></div>
                 
                 <div>
                    <h2 className="text-stone-500 text-sm font-bold uppercase tracking-widest mb-2">Total Platform Earnings</h2>
                    <div className="text-5xl font-serif font-bold text-premium-gold icon-gold-glow">₹{revenueStats.totalRevenue.toLocaleString()}</div>
                    <p className="text-stone-500 text-xs mt-2">Aggregated from {revenueStats.detailedList.length} completed transactions</p>
                 </div>
                 <div className="w-16 h-16 bg-stone-950 rounded-full flex items-center justify-center border border-amber-900/30 shadow-inner">
                    <TrendingUp className="w-8 h-8 text-amber-500 icon-gold-glow" />
                 </div>
              </div>

              {/* Revenue by Category List (No Charts) */}
              <div className="bg-stone-900 border border-stone-800 rounded-2xl p-8 shadow-xl">
                  <h3 className="font-serif text-lg font-bold text-stone-100 mb-6 flex items-center gap-2">
                      <Layers className="w-5 h-5 text-amber-500" /> Revenue by Service Category
                  </h3>
                  
                  <div className="space-y-5">
                    {revenueStats.categoryData.length > 0 ? (
                        revenueStats.categoryData.map((item) => {
                           const percentage = revenueStats.totalRevenue > 0 
                                ? ((item.value / revenueStats.totalRevenue) * 100).toFixed(1) 
                                : '0';
                           return (
                             <div key={item.name} className="relative group">
                                <div className="flex justify-between items-end mb-2">
                                   <div className="flex items-center gap-3">
                                       <span className="w-2 h-2 rounded-full bg-premium-gold shadow-[0_0_8px_rgba(212,175,55,0.5)]"></span>
                                       <span className="text-stone-200 font-medium text-base">{item.name}</span>
                                   </div>
                                   <div className="text-right flex items-center gap-4">
                                      <span className="text-stone-100 font-bold text-lg">₹{item.value}</span>
                                      <span className="text-amber-500 text-sm font-bold bg-amber-900/20 px-2 py-0.5 rounded border border-amber-600/20">{percentage}%</span>
                                   </div>
                                </div>
                                {/* Progress Bar Background */}
                                <div className="w-full bg-stone-950 rounded-full h-2 overflow-hidden border border-stone-800">
                                   {/* Progress Bar Fill */}
                                   <div 
                                      className="bg-premium-gold h-full rounded-full transition-all duration-1000 ease-out" 
                                      style={{ width: `${percentage}%` }}
                                   ></div>
                                </div>
                             </div>
                           );
                        })
                    ) : (
                        <div className="text-center py-8 text-stone-600 italic">No revenue data available.</div>
                    )}
                  </div>
              </div>
          </div>
      ) : activeTab === 'BOOKINGS' ? (
      /* --- BOOKINGS MANAGEMENT TABLE --- */
      <div className="bg-stone-900 border border-stone-800 rounded-2xl overflow-hidden shadow-xl animate-fade-in">
           <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                    <thead>
                        <tr className="bg-stone-950 border-b border-stone-800 text-stone-400">
                            <th className="px-6 py-4 font-bold uppercase tracking-wider text-xs">ID / Status</th>
                            <th className="px-6 py-4 font-bold uppercase tracking-wider text-xs">Type</th>
                            <th className="px-6 py-4 font-bold uppercase tracking-wider text-xs">Customer</th>
                            <th className="px-6 py-4 font-bold uppercase tracking-wider text-xs">Provider</th>
                            <th className="px-6 py-4 font-bold uppercase tracking-wider text-xs text-right">Amount</th>
                            <th className="px-6 py-4 font-bold uppercase tracking-wider text-xs text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-800">
                        {bookings.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).map(booking => (
                            <tr key={booking.id} className={`hover:bg-stone-800/50 transition-colors ${booking.isEmergency ? 'bg-red-900/5' : ''}`}>
                                <td className="px-6 py-4">
                                    <div className="font-mono text-stone-500 text-xs">#{booking.id.toUpperCase()}</div>
                                    <div className="mt-1">
                                        <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold border uppercase tracking-wide ${
                                            booking.status === 'CONFIRMED' ? 'bg-blue-900/20 text-blue-400 border-blue-900/30' :
                                            booking.status === 'COMPLETED' ? 'bg-emerald-900/20 text-emerald-400 border-emerald-900/30' :
                                            booking.status === 'PAID' ? 'bg-amber-900/20 text-amber-500 border-amber-900/30' :
                                            booking.status === 'REJECTED' || booking.status === 'CANCELLED' ? 'bg-red-900/20 text-red-400 border-red-900/30' :
                                            'bg-stone-800 text-stone-400 border-stone-700'
                                        }`}>
                                            {booking.status}
                                        </span>
                                    </div>
                                    {booking.isEmergency && (
                                        <div className="mt-1 flex items-center gap-1 text-red-500 text-[10px] font-bold uppercase animate-pulse">
                                            <AlertTriangle className="w-3 h-3" /> Emergency
                                        </div>
                                    )}
                                </td>
                                <td className="px-6 py-4 text-stone-300">
                                    {booking.serviceType}
                                </td>
                                <td className="px-6 py-4 text-stone-400">
                                    {booking.customerName}
                                </td>
                                <td className="px-6 py-4 text-stone-400">
                                    {booking.providerName}
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <div className={`font-bold ${booking.penaltyApplied ? 'text-red-500' : 'text-stone-200'}`}>
                                        ₹{booking.billing.total}
                                    </div>
                                    {booking.penaltyApplied && (
                                        <div className="text-[10px] text-red-400 font-bold uppercase">Penalty Applied</div>
                                    )}
                                </td>
                                <td className="px-6 py-4 text-right">
                                    {booking.isEmergency && !booking.penaltyApplied && onApplyPenalty && (
                                        <button 
                                            onClick={() => {
                                                if(confirm("Are you sure you want to apply a 5x penalty for misuse? This action is irreversible.")) {
                                                    onApplyPenalty(booking.id);
                                                }
                                            }}
                                            className="px-3 py-1.5 bg-red-900/20 text-red-500 border border-red-900/50 rounded-lg text-xs font-bold hover:bg-red-900/40 flex items-center gap-1 ml-auto"
                                        >
                                            <Gavel className="w-3 h-3" /> Apply 5x Penalty
                                        </button>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
           </div>
      </div>
      ) : (
      /* --- EXISTING USER MANAGEMENT TABLE --- */
      <div className="bg-stone-900 border border-stone-800 rounded-2xl overflow-hidden shadow-xl animate-fade-in">
        <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
                <thead>
                    <tr className="bg-stone-950 border-b border-stone-800 text-stone-400">
                        <th className="px-6 py-4 font-bold uppercase tracking-wider text-xs">User / Verification</th>
                        <th className="px-6 py-4 font-bold uppercase tracking-wider text-xs">Role</th>
                        <th className="px-6 py-4 font-bold uppercase tracking-wider text-xs">Status</th>
                        <th className="px-6 py-4 font-bold uppercase tracking-wider text-xs">Contact</th>
                        <th className="px-6 py-4 font-bold uppercase tracking-wider text-xs text-right">Actions</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-stone-800">
                    {filteredUsers.length > 0 ? (
                        filteredUsers.map(user => {
                            const providerStatus = getProviderStatus(user);
                            const providerData = user.role === UserRole.PROVIDER && user.providerProfileId 
                                ? providers.find(p => p.id === user.providerProfileId) 
                                : null;

                            return (
                                <tr key={user.id} className="hover:bg-stone-800/50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex items-start gap-4">
                                            {/* Profile Image */}
                                            <div className="flex flex-col items-center gap-1">
                                                <div className="w-10 h-10 rounded-full bg-stone-800 flex items-center justify-center font-bold text-stone-300 overflow-hidden border border-stone-700">
                                                    {providerData?.imageUrl ? (
                                                        <img src={providerData.imageUrl} alt="DP" className="w-full h-full object-cover" />
                                                    ) : (
                                                        user.name.charAt(0)
                                                    )}
                                                </div>
                                                <span className="text-[10px] text-stone-600">DP</span>
                                            </div>

                                            {/* Aadhaar Thumbnail for Pending Providers */}
                                            {providerStatus === 'pending' && providerData?.aadhaarImageUrl && (
                                                <div className="flex flex-col items-center gap-1">
                                                    <div className="w-16 h-10 bg-stone-800 rounded flex items-center justify-center overflow-hidden border border-stone-700">
                                                        <img src={providerData.aadhaarImageUrl} alt="ID" className="w-full h-full object-cover" />
                                                    </div>
                                                    <span className="text-[10px] text-stone-600">ID</span>
                                                </div>
                                            )}

                                            <div>
                                                <div className="font-bold text-stone-200">{user.name}</div>
                                                <div className="text-stone-500 text-xs">@{user.username}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 rounded-md text-xs font-bold border ${
                                            user.role === UserRole.PROVIDER 
                                            ? 'bg-amber-900/20 text-amber-500 border-amber-900/30' 
                                            : 'bg-stone-800 text-stone-400 border-stone-700'
                                        }`}>
                                            {user.role}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        {user.role === UserRole.PROVIDER ? (
                                            <span className={`flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide ${
                                                providerStatus === 'approved' ? 'text-emerald-500' :
                                                providerStatus === 'rejected' ? 'text-red-500' :
                                                'text-amber-500'
                                            }`}>
                                                {providerStatus === 'approved' && <CheckCircle className="w-3 h-3" />}
                                                {providerStatus === 'rejected' && <XCircle className="w-3 h-3" />}
                                                {providerStatus === 'pending' && <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>}
                                                {providerStatus}
                                            </span>
                                        ) : (
                                            <span className="text-stone-600 text-xs">N/A</span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 text-stone-400">
                                        <div>{user.email}</div>
                                        <div className="text-xs text-stone-600">{user.phone}</div>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        {/* Provider Approval Actions */}
                                        {user.role === UserRole.PROVIDER && providerStatus === 'pending' && (
                                            <div className="flex justify-end gap-2">
                                                <button 
                                                    onClick={() => user.providerProfileId && onUpdateProviderStatus(user.providerProfileId, 'approved')}
                                                    className="p-1.5 text-emerald-400 hover:bg-emerald-900/30 rounded-lg transition-colors border border-emerald-900/50"
                                                    title="Verify & Approve Provider"
                                                >
                                                    <CheckCircle className="w-4 h-4" />
                                                </button>
                                                <button 
                                                    onClick={() => user.providerProfileId && onUpdateProviderStatus(user.providerProfileId, 'rejected')}
                                                    className="p-1.5 text-red-400 hover:bg-red-900/30 rounded-lg transition-colors border border-red-900/50"
                                                    title="Reject Provider"
                                                >
                                                    <XCircle className="w-4 h-4" />
                                                </button>
                                            </div>
                                        )}
                                    </td>
                                </tr>
                            );
                        })
                    ) : (
                        <tr>
                            <td colSpan={5} className="px-6 py-12 text-center text-stone-500 flex flex-col items-center">
                                <UserX className="w-12 h-12 mb-3 opacity-20" />
                                No users found in this category.
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
      </div>
      )}
    </div>
  );
};

export default AdminDashboard;

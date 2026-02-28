
import React, { useState, useRef, useEffect } from 'react';
import { User, UserRole, Notification } from '../types';
import { MapPin, Menu, User as UserIcon, ShieldCheck, LogOut, Bell, Check, X } from 'lucide-react';

interface NavbarProps {
  user: User | null;
  notifications?: Notification[];
  setPage: (page: string) => void;
  onLogout: () => void;
  onMarkAsRead?: (id: string) => void;
  onClearNotifications?: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ 
  user, 
  notifications = [], 
  setPage, 
  onLogout,
  onMarkAsRead,
  onClearNotifications
}) => {
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  const [isNotifOpen, setIsNotifOpen] = React.useState(false);
  const notifRef = useRef<HTMLDivElement>(null);

  // Derive location from user's primary address or default
  const userLocation = user?.addresses?.find(a => a.isPrimary)?.fullAddress.split(',').slice(-2).join(', ') || "Bangalore, India";

  // Filter notifications for current user
  const userNotifications = user ? notifications.filter(n => n.userId === user.id).sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()) : [];
  const unreadCount = userNotifications.filter(n => !n.read).length;

  // Click outside to close notification dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setIsNotifOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [notifRef]);

  const handleMarkRead = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (onMarkAsRead) onMarkAsRead(id);
  };

  return (
    <nav className="sticky top-0 z-50 glass-panel border-b border-stone-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center cursor-pointer group" onClick={() => setPage('home')}>
            <div className="flex-shrink-0 flex items-center gap-2">
              <div className="w-8 h-8 bg-premium-gold rounded-lg flex items-center justify-center shadow-lg shadow-amber-900/20 group-hover:shadow-amber-500/20 transition-all duration-500">
                <ShieldCheck className="text-stone-900 w-5 h-5" />
              </div>
              <span className="font-serif font-bold text-xl tracking-tight text-premium-gold">ServiceLink</span>
            </div>
            {user && (
              <div className="hidden md:flex ml-6 items-center space-x-1 text-xs text-stone-400 border border-stone-800 bg-stone-900/50 px-3 py-1.5 rounded-full hover:border-amber-600/30 transition-colors">
                <MapPin className="w-3 h-3 text-amber-500" />
                <span className="truncate max-w-[150px]">{userLocation}</span>
              </div>
            )}
          </div>

          {user ? (
            <div className="hidden md:flex items-center space-x-6">
              <button onClick={() => setPage('search')} className="text-stone-400 hover:text-stone-100 font-medium transition-colors text-sm hover:border-b-2 hover:border-amber-500 pb-1 h-full flex items-center">Find Pros</button>
              <button onClick={() => setPage('dashboard')} className="text-stone-400 hover:text-stone-100 font-medium transition-colors text-sm hover:border-b-2 hover:border-amber-500 pb-1 h-full flex items-center">
                {user.role === UserRole.PROVIDER ? 'My Business' : 'My Bookings'}
              </button>
              <div className="h-6 w-px bg-stone-800"></div>
              
              <div className="flex items-center gap-4">
                {/* Notification Bell */}
                <div className="relative" ref={notifRef}>
                    <button 
                        onClick={() => setIsNotifOpen(!isNotifOpen)}
                        className="p-2 text-stone-400 hover:text-amber-500 hover:bg-stone-900 rounded-full transition-colors relative"
                    >
                        <Bell className="w-5 h-5" />
                        {unreadCount > 0 && (
                            <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-[10px] font-bold flex items-center justify-center rounded-full border-2 border-stone-950">
                                {unreadCount}
                            </span>
                        )}
                    </button>

                    {/* Notification Dropdown */}
                    {isNotifOpen && (
                        <div className="absolute right-0 mt-3 w-80 bg-stone-900 border border-stone-800 rounded-xl shadow-2xl overflow-hidden animate-fade-in origin-top-right">
                             <div className="p-3 border-b border-stone-800 flex justify-between items-center bg-stone-950">
                                 <h3 className="text-sm font-bold text-stone-200">Notifications</h3>
                                 {userNotifications.length > 0 && onClearNotifications && (
                                     <button onClick={onClearNotifications} className="text-xs text-stone-500 hover:text-stone-300">Clear All</button>
                                 )}
                             </div>
                             <div className="max-h-80 overflow-y-auto custom-scrollbar">
                                 {userNotifications.length === 0 ? (
                                     <div className="p-8 text-center text-stone-500 text-xs">
                                         No new notifications.
                                     </div>
                                 ) : (
                                     userNotifications.map(notif => (
                                         <div 
                                            key={notif.id} 
                                            onClick={() => { if(onMarkAsRead) onMarkAsRead(notif.id); setPage('dashboard'); setIsNotifOpen(false); }}
                                            className={`p-4 border-b border-stone-800/50 hover:bg-stone-800 transition-colors cursor-pointer relative group ${!notif.read ? 'bg-stone-800/30' : ''}`}
                                         >
                                             <div className="flex gap-3">
                                                 <div className={`w-2 h-2 mt-1.5 rounded-full flex-shrink-0 ${
                                                     notif.type === 'SUCCESS' ? 'bg-emerald-500' :
                                                     notif.type === 'ERROR' ? 'bg-red-500' :
                                                     notif.type === 'WARNING' ? 'bg-amber-500' :
                                                     'bg-blue-500'
                                                 }`}></div>
                                                 <div>
                                                     <p className={`text-xs leading-relaxed ${notif.read ? 'text-stone-400' : 'text-stone-200 font-medium'}`}>
                                                         {notif.message}
                                                     </p>
                                                     <p className="text-[10px] text-stone-600 mt-1">{new Date(notif.createdAt).toLocaleDateString()} • {new Date(notif.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
                                                 </div>
                                                 {!notif.read && (
                                                     <button 
                                                        onClick={(e) => handleMarkRead(notif.id, e)}
                                                        className="absolute right-2 top-2 p-1 text-stone-600 hover:text-emerald-500 opacity-0 group-hover:opacity-100 transition-opacity"
                                                        title="Mark as read"
                                                     >
                                                         <Check className="w-3 h-3" />
                                                     </button>
                                                 )}
                                             </div>
                                         </div>
                                     ))
                                 )}
                             </div>
                        </div>
                    )}
                </div>

                <button onClick={() => setPage('dashboard')} className="flex items-center gap-2 text-stone-200 font-medium group">
                  <div className="w-8 h-8 rounded-full bg-stone-900 border border-stone-700 flex items-center justify-center group-hover:border-amber-500/50 transition-colors">
                    <UserIcon className="w-4 h-4 text-stone-400 group-hover:text-amber-400" />
                  </div>
                  <span className="text-sm group-hover:text-amber-100 transition-colors">{user.username}</span>
                </button>
                <button onClick={onLogout} className="text-stone-500 hover:text-red-400 transition-colors" title="Logout">
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            </div>
          ) : (
            <div className="hidden md:flex items-center space-x-4">
               <button onClick={() => setPage('login')} className="text-stone-300 hover:text-white font-medium text-sm transition-colors">Sign In</button>
               <button onClick={() => setPage('register')} className="bg-stone-100 text-stone-900 hover:bg-white px-4 py-2 rounded-lg font-bold text-sm transition-all border border-stone-200 shadow-lg shadow-white/5 hover:shadow-white/10">
                 Get Started
               </button>
            </div>
          )}

          <div className="flex items-center md:hidden">
            <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="p-2 text-stone-400 hover:bg-stone-800 rounded-md transition-colors">
              <Menu className="w-6 h-6" />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-stone-900 border-b border-stone-800 px-4 py-4 space-y-3 shadow-lg">
           {user ? (
             <>
               <div className="px-3 py-2 text-stone-500 text-xs uppercase font-bold tracking-wider">Signed in as {user.username}</div>
               <button onClick={() => {setPage('search'); setIsMenuOpen(false)}} className="block w-full text-left px-3 py-2 text-base font-medium text-stone-300 hover:bg-stone-800 rounded-md hover:text-amber-500 transition-colors">Find Pros</button>
               <button onClick={() => {setPage('dashboard'); setIsMenuOpen(false)}} className="block w-full text-left px-3 py-2 text-base font-medium text-stone-300 hover:bg-stone-800 rounded-md hover:text-amber-500 transition-colors">Dashboard</button>
               <button onClick={() => {onLogout(); setIsMenuOpen(false)}} className="block w-full text-left px-3 py-2 text-base font-medium text-red-400 hover:bg-stone-800 rounded-md transition-colors">Sign Out</button>
             </>
           ) : (
             <>
               <button onClick={() => {setPage('login'); setIsMenuOpen(false)}} className="block w-full text-left px-3 py-2 text-base font-medium text-stone-300 hover:bg-stone-800 rounded-md transition-colors">Sign In</button>
               <button onClick={() => {setPage('register'); setIsMenuOpen(false)}} className="block w-full text-left px-3 py-2 text-base font-medium text-amber-500 hover:bg-stone-800 rounded-md transition-colors">Create Account</button>
             </>
           )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;


import React, { useState } from 'react';
import { UserRole, ServiceCategory, User, Address } from '../types';
import { ShieldCheck, User as UserIcon, Briefcase, MapPin, Eye, EyeOff, Zap, Upload, Shield, FileText, Image as ImageIcon, Lock, X } from 'lucide-react';

// --------------- LOGIN COMPONENT ---------------
interface LoginProps {
  onLogin: (username: string, role: UserRole) => void;
  onSwitchToRegister: () => void;
}

export const Login: React.FC<LoginProps> = ({ onLogin, onSwitchToRegister }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole>(UserRole.CUSTOMER);
  const [showPassword, setShowPassword] = useState(false);

  // Admin Access State
  const [isAdminModalOpen, setIsAdminModalOpen] = useState(false);
  const [adminPassword, setAdminPassword] = useState('');
  const [adminError, setAdminError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (username && password) {
      onLogin(username, role);
    }
  };

  const handleAdminSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (adminPassword === '210706') {
        onLogin('admin', UserRole.ADMIN);
    } else {
        setAdminError('Incorrect admin password.');
        setAdminPassword('');
    }
  };

  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center p-4 bg-stone-950">
      <div className="max-w-md w-full bg-stone-900 border border-stone-800 rounded-2xl shadow-2xl overflow-hidden relative">
        <div className="p-8">
          <div className="text-center mb-8">
            <div className="w-12 h-12 bg-premium-gold rounded-xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-amber-900/40">
              <ShieldCheck className="text-stone-900 w-7 h-7" />
            </div>
            <h2 className="font-serif text-3xl font-bold text-stone-100">Welcome Back</h2>
            <p className="text-stone-500 mt-2 text-sm">Sign in to manage your services</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Role Selection */}
            <div className="grid grid-cols-2 gap-2 p-1 bg-stone-950 rounded-lg border border-stone-800">
              <button
                type="button"
                onClick={() => setRole(UserRole.CUSTOMER)}
                className={`flex items-center justify-center gap-2 py-2 rounded-md text-sm font-medium transition-all ${
                  role === UserRole.CUSTOMER 
                    ? 'bg-stone-800 text-stone-100 shadow-sm border border-stone-700' 
                    : 'text-stone-500 hover:text-stone-300'
                }`}
              >
                <UserIcon className="w-4 h-4" /> Customer
              </button>
              <button
                type="button"
                onClick={() => setRole(UserRole.PROVIDER)}
                className={`flex items-center justify-center gap-2 py-2 rounded-md text-sm font-medium transition-all ${
                  role === UserRole.PROVIDER 
                    ? 'bg-stone-800 text-stone-100 shadow-sm border border-stone-700' 
                    : 'text-stone-500 hover:text-stone-300'
                }`}
              >
                <Briefcase className="w-4 h-4" /> Provider
              </button>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-400 mb-1.5 uppercase tracking-wide">Username</label>
              <input 
                type="text" 
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-4 py-3 bg-stone-950 border border-stone-800 rounded-xl text-stone-200 focus:ring-1 focus:ring-amber-600 focus:border-amber-600 focus:outline-none transition-all placeholder:text-stone-700"
                placeholder="Enter your username"
              />
            </div>

            <div className="relative">
              <label className="block text-xs font-semibold text-stone-400 mb-1.5 uppercase tracking-wide">Password</label>
              <input 
                type={showPassword ? "text" : "password"} 
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 bg-stone-950 border border-stone-800 rounded-xl text-stone-200 focus:ring-1 focus:ring-amber-600 focus:border-amber-600 focus:outline-none transition-all placeholder:text-stone-700"
                placeholder="••••••••"
              />
              <button 
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-[34px] text-stone-600 hover:text-stone-400"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            <button 
              type="submit" 
              className="w-full bg-premium-gold btn-shine text-stone-950 font-bold py-3.5 rounded-xl transition-all shadow-lg shadow-amber-900/20 active:scale-[0.98]"
            >
              Sign In
            </button>
          </form>
          
          {/* Demo Access Section - REMOVED DEMO ADMIN */}
          <div className="mt-8 pt-6 border-t border-stone-800">
             <div className="flex items-center gap-2 mb-4 justify-center text-stone-500 text-xs uppercase font-bold tracking-widest">
                <Zap className="w-3 h-3 text-premium-gold" /> Quick Demo Access
             </div>
             <div className="grid grid-cols-2 gap-3 mb-3">
                <button 
                  onClick={() => onLogin('amitp', UserRole.CUSTOMER)}
                  className="px-4 py-2 bg-stone-800 hover:bg-stone-700 text-stone-300 rounded-lg text-xs font-medium border border-stone-700 transition-colors"
                >
                  Demo Customer
                </button>
                <button 
                  onClick={() => onLogin('Rajesh Kumar', UserRole.PROVIDER)}
                  className="px-4 py-2 bg-stone-800 hover:bg-stone-700 text-stone-300 rounded-lg text-xs font-medium border border-stone-700 transition-colors"
                >
                  Demo Provider
                </button>
             </div>
          </div>

          <div className="mt-6 text-center flex flex-col items-center gap-4">
            <p className="text-stone-500 text-sm">
              Don't have an account?{' '}
              <button onClick={onSwitchToRegister} className="text-amber-500 hover:text-amber-400 font-medium hover:underline">
                Create one
              </button>
            </p>
            
            {/* Secured Admin Access Trigger */}
            <button 
                onClick={() => setIsAdminModalOpen(true)}
                className="text-stone-600 hover:text-stone-400 text-xs flex items-center gap-1 transition-colors mt-2"
            >
                <Lock className="w-3 h-3" /> Admin Login
            </button>
          </div>
        </div>
      </div>

      {/* ADMIN PASSWORD MODAL */}
      {isAdminModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/90 backdrop-blur-sm animate-fade-in">
              <div className="bg-stone-900 border border-stone-700 p-6 rounded-2xl w-full max-w-sm shadow-2xl relative">
                  <button 
                    onClick={() => { setIsAdminModalOpen(false); setAdminError(''); setAdminPassword(''); }}
                    className="absolute top-4 right-4 text-stone-500 hover:text-stone-300"
                  >
                      <X className="w-5 h-5" />
                  </button>
                  
                  <div className="text-center mb-6">
                      <div className="w-10 h-10 bg-stone-800 rounded-full flex items-center justify-center mx-auto mb-3">
                          <Shield className="w-5 h-5 text-amber-500" />
                      </div>
                      <h3 className="text-xl font-bold text-stone-100">Admin Access</h3>
                      <p className="text-stone-500 text-sm">Enter security code to continue</p>
                  </div>

                  <form onSubmit={handleAdminSubmit} className="space-y-4">
                      <div>
                          <input 
                              type="password" 
                              value={adminPassword}
                              onChange={(e) => { setAdminPassword(e.target.value); setAdminError(''); }}
                              className="w-full text-center tracking-widest text-xl px-4 py-3 bg-stone-950 border border-stone-800 rounded-xl text-stone-200 focus:ring-1 focus:ring-amber-600 focus:border-amber-600 focus:outline-none placeholder:text-stone-800 placeholder:text-sm placeholder:tracking-normal"
                              placeholder="••••••"
                              autoFocus
                          />
                          {adminError && <p className="text-red-500 text-xs text-center mt-2 font-medium">{adminError}</p>}
                      </div>
                      <button 
                          type="submit"
                          className="w-full bg-stone-100 text-stone-900 font-bold py-3 rounded-xl hover:bg-white transition-colors"
                      >
                          Verify & Login
                      </button>
                  </form>
              </div>
          </div>
      )}
    </div>
  );
};

// --------------- REGISTER COMPONENT ---------------
interface RegisterProps {
  onRegister: (userData: any) => void;
  onSwitchToLogin: () => void;
}

export const Register: React.FC<RegisterProps> = ({ onRegister, onSwitchToLogin }) => {
  const [role, setRole] = useState<UserRole>(UserRole.CUSTOMER);
  const [formData, setFormData] = useState({
    name: '',
    username: '',
    email: '',
    phone: '',
    password: '',
    address: '',
    serviceCategory: ServiceCategory.ELECTRICIAN as ServiceCategory,
  });
  const [profilePhoto, setProfilePhoto] = useState<File | null>(null);
  const [aadhaarPhoto, setAadhaarPhoto] = useState<File | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, setFile: React.Dispatch<React.SetStateAction<File | null>>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const MAX_SIZE = 5 * 1024 * 1024; // 5MB
      const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

      if (!ALLOWED_TYPES.includes(file.type)) {
          alert(`Invalid file type. Please upload a valid image (JPG, PNG, or WEBP).`);
          e.target.value = ''; // Reset input
          return;
      }

      if (file.size > MAX_SIZE) {
          alert(`File is too large. Maximum size allowed is 5MB.`);
          e.target.value = ''; // Reset input
          return;
      }

      setFile(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Construct User Object
    const newUser: Partial<User> = {
      name: formData.name,
      username: formData.username,
      email: formData.email,
      phone: formData.phone,
      role: role,
      password: formData.password,
    };

    if (role === UserRole.CUSTOMER) {
      newUser.addresses = [{
        id: `addr-${Date.now()}`,
        label: 'Home',
        fullAddress: formData.address,
        isPrimary: true
      }];
    } else if (role === UserRole.PROVIDER && !aadhaarPhoto) {
        alert("Aadhaar Card is required for provider verification.");
        return;
    }

    // Handle Profile Photo Mock Upload
    let imageUrl = '';
    if (profilePhoto) {
        imageUrl = URL.createObjectURL(profilePhoto);
    } else {
        // Fallback or Random Avatar if optional and not provided
        imageUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(formData.name)}&background=random`;
    }

    // Handle Aadhaar Mock Upload
    let aadhaarUrl = '';
    if (aadhaarPhoto) {
        aadhaarUrl = URL.createObjectURL(aadhaarPhoto);
    }

    onRegister({ 
        ...newUser, 
        serviceDetails: role === UserRole.PROVIDER ? { category: formData.serviceCategory, location: formData.address } : null,
        profileImage: imageUrl,
        aadhaarImage: aadhaarUrl // New field for App.tsx to handle
    });
  };

  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center p-4 bg-stone-950 py-12">
      <div className="max-w-2xl w-full bg-stone-900 border border-stone-800 rounded-2xl shadow-2xl overflow-hidden">
        <div className="p-8 md:p-10">
          <div className="text-center mb-8">
            <h2 className="font-serif text-3xl font-bold text-stone-100">Create Account</h2>
            <p className="text-stone-500 mt-2 text-sm">Join ServiceLink as a Customer or Provider</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Role Selection */}
            <div className="flex gap-4 justify-center mb-6">
               <label className={`cursor-pointer flex flex-col items-center p-4 border rounded-xl w-32 transition-all ${role === UserRole.CUSTOMER ? 'bg-stone-800 border-amber-600 text-stone-100 shadow-md' : 'bg-stone-950 border-stone-800 text-stone-500 hover:border-stone-600'}`}>
                 <input type="radio" name="role" className="hidden" checked={role === UserRole.CUSTOMER} onChange={() => setRole(UserRole.CUSTOMER)} />
                 <UserIcon className={`w-6 h-6 mb-2 ${role === UserRole.CUSTOMER ? 'text-amber-500' : 'text-stone-600'}`} />
                 <span className="text-xs font-bold">Customer</span>
               </label>
               <label className={`cursor-pointer flex flex-col items-center p-4 border rounded-xl w-32 transition-all ${role === UserRole.PROVIDER ? 'bg-stone-800 border-amber-600 text-stone-100 shadow-md' : 'bg-stone-950 border-stone-800 text-stone-500 hover:border-stone-600'}`}>
                 <input type="radio" name="role" className="hidden" checked={role === UserRole.PROVIDER} onChange={() => setRole(UserRole.PROVIDER)} />
                 <Briefcase className={`w-6 h-6 mb-2 ${role === UserRole.PROVIDER ? 'text-amber-500' : 'text-stone-600'}`} />
                 <span className="text-xs font-bold">Provider</span>
               </label>
            </div>

            {/* Profile Photo - Compulsory for Provider, Optional for Customer */}
            <div className="bg-stone-950 p-4 rounded-xl border border-stone-800">
                <label className="block text-xs font-semibold text-stone-400 mb-2 uppercase tracking-wide">
                    Profile Photo {role === UserRole.PROVIDER && <span className="text-red-500">*</span>}
                </label>
                <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-stone-900 rounded-full flex items-center justify-center border border-stone-700 overflow-hidden">
                        {profilePhoto ? (
                            <img src={URL.createObjectURL(profilePhoto)} alt="Preview" className="w-full h-full object-cover" />
                        ) : (
                            <Upload className="w-5 h-5 text-stone-500" />
                        )}
                    </div>
                    <div className="flex-1">
                        <input 
                            type="file" 
                            accept="image/*"
                            onChange={(e) => handleFileChange(e, setProfilePhoto)}
                            required={role === UserRole.PROVIDER}
                            className="block w-full text-sm text-stone-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-stone-800 file:text-stone-300 hover:file:bg-stone-700 cursor-pointer"
                        />
                        <p className="text-[10px] text-stone-600 mt-2">
                            {role === UserRole.PROVIDER 
                                ? "Required for identity verification and trust." 
                                : "Optional. Helps providers recognize you."}
                        </p>
                    </div>
                </div>
            </div>

            {/* AADHAAR UPLOAD - PROVIDER ONLY */}
            {role === UserRole.PROVIDER && (
                <div className="bg-stone-950 p-4 rounded-xl border border-stone-800 border-dashed border-amber-900/30">
                    <label className="block text-xs font-semibold text-stone-400 mb-2 uppercase tracking-wide flex items-center gap-2">
                        <ImageIcon className="w-4 h-4 text-amber-500"/> Aadhaar Card (Image) <span className="text-red-500">*</span>
                    </label>
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 bg-stone-900 rounded-lg flex items-center justify-center border border-stone-700 overflow-hidden">
                            {aadhaarPhoto ? (
                                <img src={URL.createObjectURL(aadhaarPhoto)} alt="Aadhaar" className="w-full h-full object-cover" />
                            ) : (
                                <Upload className="w-5 h-5 text-stone-500" />
                            )}
                        </div>
                        <div className="flex-1">
                            <input 
                                type="file" 
                                accept="image/*" 
                                onChange={(e) => handleFileChange(e, setAadhaarPhoto)}
                                required
                                className="block w-full text-sm text-stone-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-stone-800 file:text-stone-300 hover:file:bg-stone-700 cursor-pointer"
                            />
                            <p className="text-[10px] text-stone-600 mt-2">
                                Upload a clear image of your Aadhaar card (JPG, PNG, WEBP). Max 5MB.
                            </p>
                        </div>
                    </div>
                </div>
            )}

            <div className="grid md:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-semibold text-stone-400 mb-1.5">Full Name</label>
                <input required name="name" onChange={handleChange} className="w-full px-4 py-2.5 bg-stone-950 border border-stone-800 rounded-lg text-stone-200 focus:border-amber-600 focus:outline-none" placeholder="John Doe" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-stone-400 mb-1.5">Username</label>
                <input required name="username" onChange={handleChange} className="w-full px-4 py-2.5 bg-stone-950 border border-stone-800 rounded-lg text-stone-200 focus:border-amber-600 focus:outline-none" placeholder="johndoe123" />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-semibold text-stone-400 mb-1.5">Email</label>
                <input required type="email" name="email" onChange={handleChange} className="w-full px-4 py-2.5 bg-stone-950 border border-stone-800 rounded-lg text-stone-200 focus:border-amber-600 focus:outline-none" placeholder="john@example.com" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-stone-400 mb-1.5">Phone Number</label>
                <input required type="tel" name="phone" onChange={handleChange} className="w-full px-4 py-2.5 bg-stone-950 border border-stone-800 rounded-lg text-stone-200 focus:border-amber-600 focus:outline-none" placeholder="+91 9876543210" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-400 mb-1.5">Password</label>
              <input required type="password" name="password" onChange={handleChange} className="w-full px-4 py-2.5 bg-stone-950 border border-stone-800 rounded-lg text-stone-200 focus:border-amber-600 focus:outline-none" placeholder="Create a strong password" />
            </div>

            {role === UserRole.CUSTOMER && (
              <div>
                <label className="block text-xs font-semibold text-stone-400 mb-1.5">Primary Address</label>
                <textarea required name="address" onChange={handleChange} className="w-full px-4 py-2.5 bg-stone-950 border border-stone-800 rounded-lg text-stone-200 focus:border-amber-600 focus:outline-none h-24 resize-none" placeholder="Flat No, Building, Street, Area, City, Pincode" />
                <p className="text-xs text-stone-600 mt-1">You can add more addresses later.</p>
              </div>
            )}

            {role === UserRole.PROVIDER && (
              <>
                 <div>
                  <label className="block text-xs font-semibold text-stone-400 mb-1.5">Service Category</label>
                  <select name="serviceCategory" onChange={handleChange} className="w-full px-4 py-2.5 bg-stone-950 border border-stone-800 rounded-lg text-stone-200 focus:border-amber-600 focus:outline-none">
                    {Object.values(ServiceCategory).map(cat => <option key={cat} value={cat}>{cat}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-400 mb-1.5">Base Location</label>
                  <input required name="address" onChange={handleChange} className="w-full px-4 py-2.5 bg-stone-950 border border-stone-800 rounded-lg text-stone-200 focus:border-amber-600 focus:outline-none" placeholder="Where are you based?" />
                </div>
              </>
            )}

            <button 
              type="submit" 
              className="w-full bg-premium-gold btn-shine text-stone-950 font-bold py-3.5 rounded-xl transition-all shadow-lg shadow-amber-900/20 active:scale-[0.98] mt-4"
            >
              Create Account
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-stone-500 text-sm">
              Already have an account?{' '}
              <button onClick={onSwitchToLogin} className="text-amber-500 hover:text-amber-400 font-medium hover:underline">
                Sign In
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

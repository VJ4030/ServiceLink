
export enum UserRole {
  CUSTOMER = 'CUSTOMER',
  PROVIDER = 'PROVIDER',
  ADMIN = 'ADMIN'
}

export enum ServiceCategory {
  ELECTRICIAN = 'Electrician',
  PLUMBER = 'Plumber',
  CARPENTER = 'Carpenter',
  CLEANING = 'Home Cleaning',
  HVAC = 'AC Technician',
  MOVING = 'Movers',
  GARDENING = 'Gardening',
  PAINTER = 'Painter',
  PEST_CONTROL = 'Pest Control',
  APPLIANCE = 'Appliance Repair'
}

export interface ServiceItem {
  id: string;
  name: string;
  basePrice: number;
  image: string;
}

export interface Address {
  id: string;
  label: string;
  fullAddress: string;
  isPrimary: boolean;
}

export interface Review {
  id: string;
  author: string;
  rating: number;
  text: string;
  date: string;
  verifiedBooking: boolean;
}

export interface Availability {
  days: string[]; // ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
  startTime: string; // "09:00"
  endTime: string; // "18:00"
  blockedDates: string[]; // ["2024-12-25", "2024-01-01"] (YYYY-MM-DD)
}

export interface Provider {
  id: string;
  name: string;
  category: ServiceCategory;
  rating: number;
  reviewCount: number;
  hourlyRate: number;
  location: string;
  distance: string;
  imageUrl: string;
  aadhaarImageUrl?: string;
  description: string;
  skills: string[];
  reviews: Review[];
  verified: boolean;
  email?: string;
  phone?: string;
  status: 'pending' | 'approved' | 'rejected';
  verificationStatus: 'pending' | 'verified' | 'rejected';
  availability?: Availability; // New Field for Scheduling
  // Wallet Fields
  walletBalance: number;
  totalEarned: number;
  totalWithdrawn: number;
  // Overdraft Fields
  negativeBalanceLimit: number; // Defaults to 500
  negativeDueDate?: string; // ISO Date String
  isNegativeActive: boolean;
  // Business Fields
  customPricing?: Record<string, number>; // Map of ServiceItem.id -> Custom Price
  // Performance Fields
  performanceScore: number;
  badge: 'Elite' | 'Top Rated' | 'Reliable' | 'New';
}

export interface WithdrawalRequest {
  id: string;
  providerId: string;
  providerName: string;
  amount: number;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  date: string;
}

export interface WalletTransaction {
  id: string; // Unique Transaction ID
  providerId: string;
  providerName: string;
  amount: number;
  type: 'NORMAL_WITHDRAWAL' | 'OVERDRAFT_WITHDRAWAL' | 'AUTO_DEDUCTION' | 'LATE_PENALTY' | 'EARNING_CREDIT' | 'WITHDRAWAL_REQUEST' | 'WITHDRAWAL_REJECTED';
  date: string;
  previousBalance: number; // Snapshot before txn
  newBalance: number;     // Snapshot after txn
  status: 'pending' | 'approved' | 'completed' | 'rejected';
  referenceId?: string;   // Link to Booking or Withdrawal Request
  approvedBy?: string;    // Admin ID if manual
  description?: string;
}

export interface BillingDetails {
  subtotal: number;
  tax: number;
  platformFee: number;
  total: number;
  paymentMethod?: 'ONLINE' | 'CASH';
  transactionId?: string;
  paidAt?: string;
}

export interface Booking {
  id: string;
  providerId: string;
  customerId: string;
  customerName: string;
  providerName: string;
  serviceDate: string; // ISO String for Date
  bookingTime?: string; // Legacy/Display Time
  timeSlot?: "8-12" | "12-4" | "4-8"; // Fixed Time Slot
  status: 'PENDING' | 'CONFIRMED' | 'REJECTED' | 'COMPLETED' | 'PAID' | 'CANCELLED';
  bookingQueueType: 'standard' | 'priority' | 'emergency'; // Queue Logic
  category: ServiceCategory;
  serviceType: string;
  description: string;
  address: string;
  billing: BillingDetails;
  review?: Review;
  createdAt: string;
  isEmergency?: boolean;
  emergencyConfirmed?: boolean;
  emergencyChargeApplied?: boolean;
  penaltyApplied?: boolean;
}

export interface Notification {
  id: string;
  userId: string;
  message: string;
  type: 'INFO' | 'SUCCESS' | 'WARNING' | 'ERROR';
  read: boolean;
  createdAt: string;
  relatedId?: string;
}

export interface User {
  id: string;
  name: string;
  username: string;
  email: string;
  phone: string;
  role: UserRole;
  password?: string;
  addresses: Address[];
  providerProfileId?: string;
}


import React from 'react';
import { Shield, DollarSign, Users, BookOpen, CheckCircle, Star, Heart, Lock } from 'lucide-react';

const PageHeader = ({ title, subtitle }: { title: string, subtitle: string }) => (
  <div className="bg-stone-900 border-b border-stone-800 py-16 px-4 text-center animate-fade-in">
    <h1 className="font-serif text-4xl md:text-5xl font-bold text-premium-gold mb-4">{title}</h1>
    <p className="text-stone-400 max-w-2xl mx-auto text-lg">{subtitle}</p>
  </div>
);

const Section = ({ title, children, className = "" }: { title: string, children?: React.ReactNode, className?: string }) => (
  <div className={`py-12 px-4 max-w-4xl mx-auto ${className}`}>
    <h2 className="font-serif text-2xl font-bold text-stone-100 mb-6 border-l-4 border-amber-500 pl-4">{title}</h2>
    <div className="text-stone-400 leading-relaxed space-y-4">
      {children}
    </div>
  </div>
);

export const HowItWorks = () => (
  <div className="min-h-screen animate-fade-in">
    <PageHeader title="How ServiceLink Works" subtitle="Your trusted path to a well-maintained home." />
    <div className="max-w-5xl mx-auto py-16 px-4 grid md:grid-cols-3 gap-8">
      {[
        { icon: Users, title: "1. Browse Pros", desc: "Explore profiles of verified local professionals with real reviews and transparent pricing." },
        { icon: BookOpen, title: "2. Book Service", desc: "Select a time that works for you. Choose standard, priority, or emergency slots." },
        { icon: CheckCircle, title: "3. Relax", desc: "Your pro arrives on time. Payment is secure and only released when you're satisfied." }
      ].map((step, i) => (
        <div key={i} className="bg-stone-900 border border-stone-800 p-8 rounded-2xl text-center hover:border-amber-500/30 transition-colors">
          <div className="w-16 h-16 bg-stone-950 rounded-full flex items-center justify-center mx-auto mb-6 border border-stone-800">
            <step.icon className="w-8 h-8 text-amber-500" />
          </div>
          <h3 className="font-serif text-xl font-bold text-stone-200 mb-3">{step.title}</h3>
          <p className="text-stone-500">{step.desc}</p>
        </div>
      ))}
    </div>
  </div>
);

export const Pricing = () => (
  <div className="min-h-screen animate-fade-in">
    <PageHeader title="Transparent Pricing" subtitle="Know exactly what you pay. No hidden fees." />
    <div className="max-w-6xl mx-auto py-16 px-4 grid md:grid-cols-3 gap-8">
      {[
        { title: "Standard", price: "₹50", fee: "Platform Fee", features: ["Standard Booking Queue", "Verified Professionals", "Secure Payment", "Support 9AM-6PM"], color: "stone" },
        { title: "Priority", price: "₹100", fee: "Platform Fee", features: ["Jump the Queue", "Top-Rated Pros First", "Extended Support", "Cancellation Protection"], color: "amber" },
        { title: "Emergency", price: "₹150", fee: "Base Fee + Surge", features: ["Immediate Dispatch ( < 60 mins)", "24/7 Response", "Dedicated Coordinator", "Real-time Tracking"], color: "red" }
      ].map((plan, i) => (
        <div key={i} className={`bg-stone-900 border rounded-2xl p-8 flex flex-col ${plan.color === 'amber' ? 'border-amber-500/50 shadow-2xl shadow-amber-900/10' : plan.color === 'red' ? 'border-red-900/50' : 'border-stone-800'}`}>
          <h3 className={`font-serif text-2xl font-bold mb-2 ${plan.color === 'amber' ? 'text-amber-500' : plan.color === 'red' ? 'text-red-500' : 'text-stone-200'}`}>{plan.title}</h3>
          <div className="text-3xl font-bold text-stone-100 mb-1">{plan.price}</div>
          <div className="text-xs text-stone-500 uppercase font-bold tracking-wider mb-8">{plan.fee}</div>
          <ul className="space-y-4 mb-8 flex-1">
            {plan.features.map((f, j) => (
              <li key={j} className="flex items-start gap-3 text-stone-400 text-sm">
                <CheckCircle className={`w-5 h-5 shrink-0 ${plan.color === 'amber' ? 'text-amber-500' : plan.color === 'red' ? 'text-red-500' : 'text-stone-600'}`} />
                {f}
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
    <Section title="Hourly Rates">
      <p>Service providers set their own hourly rates based on expertise. You will see the total estimated cost before confirming any booking. Material costs are charged separately by the provider with receipts.</p>
    </Section>
  </div>
);

export const AboutUs = () => (
  <div className="min-h-screen animate-fade-in">
    <PageHeader title="About ServiceLink" subtitle="Reimagining how neighborhoods connect." />
    <Section title="Our Mission">
      <p>ServiceLink exists to bridge the gap between skilled local professionals and homeowners who need trusted help. We believe in dignity of labor, fair wages, and the peace of mind that comes from a job well done.</p>
    </Section>
    <Section title="Our Vision">
      <p>We envision a world where finding a reliable electrician is as easy as ordering a cab, but with the human connection of a neighbor helping a neighbor. We are building the digital infrastructure for the local service economy.</p>
    </Section>
    <Section title="Why ServiceLink?">
      <ul className="list-disc pl-5 space-y-2">
        <li><strong>Community First:</strong> We prioritize local providers to keep money in your neighborhood.</li>
        <li><strong>Quality Over Quantity:</strong> We manually vet providers rather than flooding the platform.</li>
        <li><strong>Human Centric:</strong> Technology should enable human connection, not replace it.</li>
      </ul>
    </Section>
  </div>
);

export const Careers = () => (
  <div className="min-h-screen animate-fade-in">
    <PageHeader title="Join Our Team" subtitle="Build the future of local services." />
    <Section title="Open Positions">
      <div className="space-y-4">
        {[
          { role: "Senior Full Stack Engineer", loc: "Remote", type: "Full-time" },
          { role: "Product Designer (UI/UX)", loc: "Bangalore", type: "Full-time" },
          { role: "Community Operations Manager", loc: "Mumbai", type: "Full-time" },
        ].map((job, i) => (
          <div key={i} className="flex justify-between items-center bg-stone-900 border border-stone-800 p-6 rounded-xl hover:border-amber-600/30 transition-colors cursor-pointer group">
            <div>
              <h3 className="font-bold text-stone-200 text-lg group-hover:text-amber-500 transition-colors">{job.role}</h3>
              <p className="text-stone-500 text-sm">{job.loc} • {job.type}</p>
            </div>
            <div className="text-stone-600 group-hover:text-amber-500 transition-colors">Apply &rarr;</div>
          </div>
        ))}
      </div>
    </Section>
    <Section title="Culture">
      <p>We work hard, stay humble, and care deeply about our users. If you love solving real-world problems that impact daily lives, you belong here.</p>
    </Section>
  </div>
);

export const TrustSafety = () => (
  <div className="min-h-screen animate-fade-in">
    <PageHeader title="Trust & Safety" subtitle="Your safety is our non-negotiable priority." />
    <div className="max-w-5xl mx-auto py-12 px-4 grid md:grid-cols-2 gap-8">
      <div className="bg-stone-900 p-8 rounded-2xl border border-stone-800">
        <Shield className="w-10 h-10 text-emerald-500 mb-4" />
        <h3 className="font-serif text-xl font-bold text-stone-100 mb-3">Multi-Step Verification</h3>
        <p className="text-stone-400">Every provider on ServiceLink undergoes a rigorous background check, including Aadhaar verification and skill assessment interviews.</p>
      </div>
      <div className="bg-stone-900 p-8 rounded-2xl border border-stone-800">
        <Lock className="w-10 h-10 text-amber-500 mb-4" />
        <h3 className="font-serif text-xl font-bold text-stone-100 mb-3">Secure Payments</h3>
        <p className="text-stone-400">Funds are held in escrow until the job is marked complete. You never have to deal with cash or unsure pricing.</p>
      </div>
      <div className="bg-stone-900 p-8 rounded-2xl border border-stone-800">
        <Heart className="w-10 h-10 text-red-500 mb-4" />
        <h3 className="font-serif text-xl font-bold text-stone-100 mb-3">Insurance Protection</h3>
        <p className="text-stone-400">Services booked through our platform are covered against accidental damages up to ₹10,000.</p>
      </div>
      <div className="bg-stone-900 p-8 rounded-2xl border border-stone-800">
        <Users className="w-10 h-10 text-blue-500 mb-4" />
        <h3 className="font-serif text-xl font-bold text-stone-100 mb-3">Zero Tolerance Policy</h3>
        <p className="text-stone-400">We have a strict zero-tolerance policy for harassment or unprofessional behavior. Our 24/7 safety line is always open.</p>
      </div>
    </div>
  </div>
);

export const JoinPro = ({ onRegister }: { onRegister: () => void }) => (
  <div className="min-h-screen animate-fade-in">
    <PageHeader title="Grow Your Business" subtitle="Join 10,000+ professionals earning more with ServiceLink." />
    <div className="max-w-4xl mx-auto py-12 px-4 text-center">
      <button onClick={onRegister} className="bg-premium-gold btn-shine text-stone-900 px-8 py-4 rounded-xl font-bold text-lg shadow-lg shadow-amber-900/20 hover:scale-105 transition-transform">
        Become a Provider
      </button>
    </div>
    <div className="max-w-5xl mx-auto grid md:grid-cols-3 gap-8 px-4 pb-20">
      {[
        { title: "Keep 100% Tips", desc: "We don't take a cut of your tips. Earn what you deserve." },
        { title: "Flexible Schedule", desc: "You are the boss. Set your own hours and availability." },
        { title: "Instant Payouts", desc: "Withdraw your earnings immediately after job completion." }
      ].map((item, i) => (
        <div key={i} className="text-center p-6 bg-stone-900 rounded-xl border border-stone-800">
          <h3 className="font-bold text-stone-200 text-lg mb-2">{item.title}</h3>
          <p className="text-stone-500">{item.desc}</p>
        </div>
      ))}
    </div>
  </div>
);

export const SuccessStories = () => (
  <div className="min-h-screen animate-fade-in">
    <PageHeader title="Success Stories" subtitle="Real people. Real growth." />
    <div className="max-w-4xl mx-auto py-12 px-4 space-y-8">
      {[
        { name: "Rajesh Kumar", role: "Electrician", quote: "Since joining ServiceLink, my weekly earnings have doubled. The app handles all the scheduling so I can focus on my work.", image: "https://images.unsplash.com/photo-1542909168-82c3e7fdca5c?auto=format&fit=crop&w=150&q=80" },
        { name: "Sarah Jenkins", role: "Home Cleaner", quote: "I love the safety features. Knowing who I am working for and having payment secured beforehand gives me peace of mind.", image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=150&q=80" },
        { name: "David Chen", role: "Plumber", quote: "The dashboard is amazing. I can track my revenue and business growth like a pro. Highly recommended.", image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80" }
      ].map((story, i) => (
        <div key={i} className="bg-stone-900 border border-stone-800 p-8 rounded-2xl flex flex-col md:flex-row items-center gap-6">
          <img src={story.image} alt={story.name} className="w-20 h-20 rounded-full object-cover border-2 border-amber-500/50" />
          <div className="text-center md:text-left">
            <p className="text-stone-300 italic text-lg mb-4">"{story.quote}"</p>
            <div className="font-bold text-premium-gold">{story.name}</div>
            <div className="text-stone-500 text-sm">{story.role}</div>
          </div>
        </div>
      ))}
    </div>
  </div>
);

export const ProResources = () => (
  <div className="min-h-screen animate-fade-in">
    <PageHeader title="Pro Resources" subtitle="Tools and guides to help you succeed." />
    <div className="max-w-5xl mx-auto py-12 px-4 grid md:grid-cols-2 gap-6">
      {[
        { title: "Provider Handbook", desc: "Everything you need to know about using the platform effectively.", icon: BookOpen },
        { title: "Safety Guidelines", desc: "Best practices for maintaining safety on the job.", icon: Shield },
        { title: "Tax & Finance Guide", desc: "How to manage your earnings and taxes as a freelancer.", icon: DollarSign },
        { title: "Customer Service 101", desc: "Tips for getting 5-star ratings every time.", icon: Star },
      ].map((res, i) => (
        <div key={i} className="flex gap-4 bg-stone-900 border border-stone-800 p-6 rounded-xl hover:border-stone-600 transition-colors cursor-pointer">
          <div className="p-3 bg-stone-950 rounded-lg h-fit border border-stone-800">
            <res.icon className="w-6 h-6 text-amber-500" />
          </div>
          <div>
            <h3 className="font-bold text-stone-200 mb-1">{res.title}</h3>
            <p className="text-stone-500 text-sm">{res.desc}</p>
          </div>
        </div>
      ))}
    </div>
  </div>
);


// This file acts as the registry for all service images.
// In a production environment, these URLs would point to a local /public/images/services/ folder.
// e.g., '/images/services/electrician.jpg'

export const DEFAULT_IMAGE = "https://images.unsplash.com/photo-1581578731117-104f2a417954?auto=format&fit=crop&w=400&q=80";

// Map of standardized slugs to image resources
const IMAGE_MAP: Record<string, string> = {
  // --- Service Categories ---
  'electrician': 'https://images.unsplash.com/photo-1621905476438-1951a2900255?auto=format&fit=crop&w=800&q=80',
  'plumber': 'https://images.unsplash.com/photo-1607472586893-edb57bdc0e39?auto=format&fit=crop&w=800&q=80',
  'carpenter': 'https://images.unsplash.com/photo-1616161179563-7c858b47f7d3?auto=format&fit=crop&w=800&q=80',
  'home-cleaning': 'https://images.unsplash.com/photo-1581578731117-104f2a417954?auto=format&fit=crop&w=800&q=80',
  'ac-technician': 'https://images.unsplash.com/photo-1581094794329-c8112a89af12?auto=format&fit=crop&w=800&q=80',
  'movers': 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80',
  'gardening': 'https://images.unsplash.com/photo-1558904541-efa843a96f01?auto=format&fit=crop&w=800&q=80',
  'painter': 'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?auto=format&fit=crop&w=800&q=80',
  'pest-control': 'https://images.unsplash.com/photo-1628135899846-95f247cc961b?auto=format&fit=crop&w=800&q=80',
  'appliance-repair': 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=800&q=80',

  // --- Specific Service Items (Electrician) ---
  'fan-repair-installation': 'https://images.unsplash.com/photo-1618335829737-2228915674e0?q=80&w=600&auto=format&fit=crop',
  'switch-socket-fixing': 'https://images.unsplash.com/photo-1544724569-5f546fd6dd2d?q=80&w=600&auto=format&fit=crop',
  'full-house-wiring': 'https://images.unsplash.com/photo-1558402529-d2638a7023e9?q=80&w=600&auto=format&fit=crop',
  'light-chandelier-installation': 'https://images.unsplash.com/photo-1565814329452-e1efa11c5b89?q=80&w=600&auto=format&fit=crop',
  'ac-power-point-fitting': 'https://images.unsplash.com/photo-1556614134-c71c4c958416?q=80&w=600&auto=format&fit=crop',
  'mcb-fuse-repair': 'https://images.unsplash.com/photo-1621905476438-1951a2900255?q=80&w=600&auto=format&fit=crop',
  'inverter-installation': 'https://plus.unsplash.com/premium_photo-1663045625453-67793d5f137e?q=80&w=600&auto=format&fit=crop',

  // --- Specific Service Items (Plumber) ---
  'tap-mixer-repair': 'https://images.unsplash.com/photo-1585704032915-c3400ca199e7?q=80&w=600&auto=format&fit=crop',
  'drain-pipe-cleaning': 'https://images.unsplash.com/photo-1616469829941-c7200edec809?q=80&w=600&auto=format&fit=crop',
  'basin-sink-installation': 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?q=80&w=600&auto=format&fit=crop',
  'toilet-flush-repair': 'https://images.unsplash.com/photo-1564540582234-a2928574f9d2?q=80&w=600&auto=format&fit=crop',
  'water-tank-cleaning': 'https://images.unsplash.com/photo-1542013936693-884638332954?q=80&w=600&auto=format&fit=crop',
  'shower-installation': 'https://images.unsplash.com/photo-1595846519845-68e298c2edd8?q=80&w=600&auto=format&fit=crop',
  'pipe-leakage-fix': 'https://images.unsplash.com/photo-1607472586893-edb57bdc0e39?q=80&w=600&auto=format&fit=crop',

  // --- Specific Service Items (Carpenter) ---
  'furniture-assembly': 'https://images.unsplash.com/photo-1595428774223-ef52624120d2?q=80&w=600&auto=format&fit=crop',
  'door-window-repair': 'https://images.unsplash.com/photo-1502005097973-6a7082348e28?q=80&w=600&auto=format&fit=crop',
  'custom-shelving-cupboards': 'https://images.unsplash.com/photo-1616161179563-7c858b47f7d3?q=80&w=600&auto=format&fit=crop',
  'lock-installation': 'https://images.unsplash.com/photo-1558211583-d26f610c1eb1?q=80&w=600&auto=format&fit=crop',
  'bed-sofa-repair': 'https://images.unsplash.com/photo-1505693416381-b7c339070e58?q=80&w=600&auto=format&fit=crop',

  // --- Specific Service Items (Cleaning) ---
  'full-home-deep-clean': 'https://images.unsplash.com/photo-1527011046414-4781f1f94f8c?q=80&w=600&auto=format&fit=crop',
  'bathroom-deep-clean': 'https://images.unsplash.com/photo-1550963295-019d8a8a61c5?q=80&w=600&auto=format&fit=crop',
  'kitchen-deep-clean': 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?q=80&w=600&auto=format&fit=crop',
  'sofa-carpet-cleaning': 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?q=80&w=600&auto=format&fit=crop',
  'balcony-cleaning': 'https://images.unsplash.com/photo-1560130958-f752945a0b76?q=80&w=600&auto=format&fit=crop',

  // --- Specific Service Items (HVAC) ---
  'ac-service-split-window': 'https://plus.unsplash.com/premium_photo-1682148174467-68b446a81b7e?q=80&w=600&auto=format&fit=crop',
  'ac-gas-filling': 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?q=80&w=600&auto=format&fit=crop',
  'ac-installation-uninstallation': 'https://images.unsplash.com/photo-1581094794329-c8112a89af12?q=80&w=600&auto=format&fit=crop',
  'pcb-repair': 'https://images.unsplash.com/photo-1517077304055-6e89abbf09b0?q=80&w=600&auto=format&fit=crop',

  // --- Specific Service Items (Moving) ---
  'house-shifting-1bhk': 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=600&auto=format&fit=crop',
  'house-shifting-2-3bhk': 'https://images.unsplash.com/photo-1600518464441-9154a4dea21b?q=80&w=600&auto=format&fit=crop',
  'vehicle-transport': 'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?q=80&w=600&auto=format&fit=crop',

  // --- Specific Service Items (Gardening) ---
  'lawn-mowing': 'https://images.unsplash.com/photo-1558904541-efa843a96f01?q=80&w=600&auto=format&fit=crop',
  'plant-trimming': 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?q=80&w=600&auto=format&fit=crop',
  'plant-potting': 'https://images.unsplash.com/photo-1463320726281-696a4137048a?q=80&w=600&auto=format&fit=crop',

  // --- Specific Service Items (Painter) ---
  'wall-painting': 'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?q=80&w=600&auto=format&fit=crop',
  'waterproofing': 'https://images.unsplash.com/photo-1503387762-592deb58ef4e?q=80&w=600&auto=format&fit=crop',
  'wood-polishing': 'https://images.unsplash.com/photo-1610219580550-934c1182310b?q=80&w=600&auto=format&fit=crop',

  // --- Specific Service Items (Pest Control) ---
  'general-pest-control': 'https://plus.unsplash.com/premium_photo-1682126112523-28c045377f0f?q=80&w=600&auto=format&fit=crop',
  'termite-treatment': 'https://images.unsplash.com/photo-1611158656121-6953e5dc7c81?q=80&w=600&auto=format&fit=crop',
  'bed-bug-treatment': 'https://images.unsplash.com/photo-1598463953832-7203cb06757b?q=80&w=600&auto=format&fit=crop',

  // --- Specific Service Items (Appliance) ---
  'washing-machine-repair': 'https://images.unsplash.com/photo-1626806819282-2c1dc01a5e0c?q=80&w=600&auto=format&fit=crop',
  'refrigerator-repair': 'https://images.unsplash.com/photo-1571175443880-49e1d58b794a?q=80&w=600&auto=format&fit=crop',
  'microwave-oven-repair': 'https://images.unsplash.com/photo-1574269909862-7e1d70bb8078?q=80&w=600&auto=format&fit=crop',

  // --- Provider Profiles (simulated public images) ---
  'provider-volts-sparks': 'https://images.unsplash.com/photo-1565814329452-e1efa11c5b89?auto=format&fit=crop&w=400&q=80',
  'provider-aquaflow': 'https://images.unsplash.com/photo-1607472586893-edb57bdc0e39?auto=format&fit=crop&w=400&q=80',
  'provider-woodcraft': 'https://images.unsplash.com/photo-1504198458649-3128b932f49e?auto=format&fit=crop&w=400&q=80',
  'provider-sparkle': 'https://images.unsplash.com/photo-1527011046414-4781f1f94f8c?auto=format&fit=crop&w=400&q=80',
  'provider-cool-breeze': 'https://images.unsplash.com/photo-1620633887556-3a6d92558f6b?auto=format&fit=crop&w=400&q=80',
  'provider-swift-shifters': 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=400&q=80',
  'provider-green-thumb': 'https://images.unsplash.com/photo-1558904541-efa843a96f01?auto=format&fit=crop&w=400&q=80',
  'provider-rainbow-painters': 'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?auto=format&fit=crop&w=400&q=80',
  'provider-pestguard': 'https://images.unsplash.com/photo-1628135899846-95f247cc961b?auto=format&fit=crop&w=400&q=80',
  'provider-appliance-fix': 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=400&q=80',
  'provider-rajesh': 'https://images.unsplash.com/photo-1542909168-82c3e7fdca5c?auto=format&fit=crop&w=400&q=80',
};

/**
 * Retrieves the image URL for a given service name, category, or provider.
 * Converts input to a URL-friendly slug to lookup in the registry.
 */
export const getServiceImage = (input: string): string => {
  if (!input) return DEFAULT_IMAGE;
  
  // Normalize input: "Home Cleaning" -> "home-cleaning"
  const slug = input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');

  return IMAGE_MAP[slug] || DEFAULT_IMAGE;
};

import React from 'react';

// OASARA Brand Icons - Ocean Teal & Gold Theme
// Primary: #2A6B72 (Ocean Teal)
// Accent: #D4B86A (Gold)

interface IconProps {
  className?: string;
  size?: number;
  color?: 'ocean' | 'gold' | 'white' | 'current';
}

const getColor = (color: IconProps['color']) => {
  switch (color) {
    case 'ocean': return '#2A6B72';
    case 'gold': return '#D4B86A';
    case 'white': return '#FFFFFF';
    default: return 'currentColor';
  }
};

// Facility/Hospital Icon - Building with medical cross
export const FacilityIcon: React.FC<IconProps> = ({ className, size = 24, color = 'current' }) => (
  <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={getColor(color)} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 21h18" />
    <path d="M5 21V7l7-4 7 4v14" />
    <path d="M9 21v-6h6v6" />
    <path d="M12 7v4" />
    <path d="M10 9h4" />
  </svg>
);

// Globe/World Icon - International healthcare
export const GlobeIcon: React.FC<IconProps> = ({ className, size = 24, color = 'current' }) => (
  <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={getColor(color)} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <path d="M2 12h20" />
    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
  </svg>
);

// Shield/Trust Icon - JCI Accredited
export const ShieldIcon: React.FC<IconProps> = ({ className, size = 24, color = 'current' }) => (
  <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={getColor(color)} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    <path d="M9 12l2 2 4-4" />
  </svg>
);

// Heart/Health Icon - Medical care
export const HeartIcon: React.FC<IconProps> = ({ className, size = 24, color = 'current' }) => (
  <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={getColor(color)} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
  </svg>
);

// Stethoscope/Doctor Icon
export const DoctorIcon: React.FC<IconProps> = ({ className, size = 24, color = 'current' }) => (
  <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={getColor(color)} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4.8 2.3A.3.3 0 1 0 5 2H4a2 2 0 0 0-2 2v5a6 6 0 0 0 6 6v0a6 6 0 0 0 6-6V4a2 2 0 0 0-2-2h-1a.2.2 0 1 0 .3.3" />
    <path d="M8 15v1a6 6 0 0 0 6 6v0a6 6 0 0 0 6-6v-4" />
    <circle cx="20" cy="10" r="2" />
  </svg>
);

// Star/Rating Icon
export const StarIcon: React.FC<IconProps> = ({ className, size = 24, color = 'current' }) => (
  <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill={getColor(color)} stroke={getColor(color)} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
  </svg>
);

// Star Outline (empty)
export const StarOutlineIcon: React.FC<IconProps> = ({ className, size = 24, color = 'current' }) => (
  <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={getColor(color)} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
  </svg>
);

// Map Pin Icon
export const MapPinIcon: React.FC<IconProps> = ({ className, size = 24, color = 'current' }) => (
  <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={getColor(color)} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
    <circle cx="12" cy="10" r="3" />
  </svg>
);

// Zano/Crypto Icon - Privacy coin
export const ZanoIcon: React.FC<IconProps> = ({ className, size = 24, color = 'current' }) => (
  <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={getColor(color)} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <path d="M8 8h8l-8 8h8" />
  </svg>
);

// Phone Icon
export const PhoneIcon: React.FC<IconProps> = ({ className, size = 24, color = 'current' }) => (
  <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={getColor(color)} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
  </svg>
);

// Website/Link Icon
export const WebsiteIcon: React.FC<IconProps> = ({ className, size = 24, color = 'current' }) => (
  <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={getColor(color)} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <line x1="2" y1="12" x2="22" y2="12" />
    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
  </svg>
);

// Search Icon
export const SearchIcon: React.FC<IconProps> = ({ className, size = 24, color = 'current' }) => (
  <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={getColor(color)} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8" />
    <line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
);

// Filter Icon
export const FilterIcon: React.FC<IconProps> = ({ className, size = 24, color = 'current' }) => (
  <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={getColor(color)} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
  </svg>
);

// Arrow Right Icon
export const ArrowRightIcon: React.FC<IconProps> = ({ className, size = 24, color = 'current' }) => (
  <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={getColor(color)} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="5" y1="12" x2="19" y2="12" />
    <polyline points="12 5 19 12 12 19" />
  </svg>
);

// Check Icon
export const CheckIcon: React.FC<IconProps> = ({ className, size = 24, color = 'current' }) => (
  <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={getColor(color)} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

// X/Close Icon
export const CloseIcon: React.FC<IconProps> = ({ className, size = 24, color = 'current' }) => (
  <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={getColor(color)} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

// Plane/Travel Icon
export const PlaneIcon: React.FC<IconProps> = ({ className, size = 24, color = 'current' }) => (
  <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={getColor(color)} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17.8 19.2 16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.1-1.1.5l-.3.5c-.2.5-.1 1 .3 1.3L9 12l-2 3H4l-1 1 3 2 2 3 1-1v-3l3-2 3.5 5.3c.3.4.8.5 1.3.3l.5-.2c.4-.3.6-.7.5-1.2z" />
  </svg>
);

// Dollar/Price Icon
export const DollarIcon: React.FC<IconProps> = ({ className, size = 24, color = 'current' }) => (
  <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={getColor(color)} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="1" x2="12" y2="23" />
    <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
  </svg>
);

// User Icon
export const UserIcon: React.FC<IconProps> = ({ className, size = 24, color = 'current' }) => (
  <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={getColor(color)} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);

// Menu Icon
export const MenuIcon: React.FC<IconProps> = ({ className, size = 24, color = 'current' }) => (
  <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={getColor(color)} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="3" y1="12" x2="21" y2="12" />
    <line x1="3" y1="6" x2="21" y2="6" />
    <line x1="3" y1="18" x2="21" y2="18" />
  </svg>
);

// Specialty Icons with Ocean Teal gradient badge
export const SpecialtyBadge: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className }) => (
  <div className={`w-12 h-12 rounded flex items-center justify-center text-white ${className}`}
       style={{ background: 'linear-gradient(135deg, #5B9AA0, #2A6B72)' }}>
    {children}
  </div>
);

// Export all icons
export const Icons = {
  Facility: FacilityIcon,
  Globe: GlobeIcon,
  Shield: ShieldIcon,
  Heart: HeartIcon,
  Doctor: DoctorIcon,
  Star: StarIcon,
  StarOutline: StarOutlineIcon,
  MapPin: MapPinIcon,
  Zano: ZanoIcon,
  Phone: PhoneIcon,
  Website: WebsiteIcon,
  Search: SearchIcon,
  Filter: FilterIcon,
  ArrowRight: ArrowRightIcon,
  Check: CheckIcon,
  Close: CloseIcon,
  Plane: PlaneIcon,
  Dollar: DollarIcon,
  User: UserIcon,
  Menu: MenuIcon,
};

export default Icons;

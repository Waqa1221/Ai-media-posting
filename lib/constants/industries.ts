export const INDUSTRIES = [
  { value: 'technology', label: 'Technology & Software' },
  { value: 'healthcare', label: 'Healthcare & Medical' },
  { value: 'finance', label: 'Finance & Banking' },
  { value: 'retail', label: 'Retail & E-commerce' },
  { value: 'education', label: 'Education & Training' },
  { value: 'real-estate', label: 'Real Estate' },
  { value: 'food-beverage', label: 'Food & Beverage' },
  { value: 'travel-tourism', label: 'Travel & Tourism' },
  { value: 'fitness-wellness', label: 'Fitness & Wellness' },
  { value: 'beauty-cosmetics', label: 'Beauty & Cosmetics' },
  { value: 'fashion-apparel', label: 'Fashion & Apparel' },
  { value: 'automotive', label: 'Automotive' },
  { value: 'construction', label: 'Construction & Architecture' },
  { value: 'legal', label: 'Legal Services' },
  { value: 'consulting', label: 'Consulting' },
  { value: 'marketing-advertising', label: 'Marketing & Advertising' },
  { value: 'media-entertainment', label: 'Media & Entertainment' },
  { value: 'gaming', label: 'Gaming & Esports' },
  { value: 'sports', label: 'Sports & Recreation' },
  { value: 'non-profit', label: 'Non-Profit & Charity' },
  { value: 'government', label: 'Government & Public Sector' },
  { value: 'agriculture', label: 'Agriculture & Farming' },
  { value: 'manufacturing', label: 'Manufacturing' },
  { value: 'logistics', label: 'Logistics & Transportation' },
  { value: 'energy', label: 'Energy & Utilities' },
  { value: 'telecommunications', label: 'Telecommunications' },
  { value: 'insurance', label: 'Insurance' },
  { value: 'pharmaceuticals', label: 'Pharmaceuticals' },
  { value: 'biotechnology', label: 'Biotechnology' },
  { value: 'aerospace', label: 'Aerospace & Defense' },
  { value: 'mining', label: 'Mining & Metals' },
  { value: 'chemicals', label: 'Chemicals' },
  { value: 'textiles', label: 'Textiles & Apparel Manufacturing' },
  { value: 'furniture', label: 'Furniture & Home Decor' },
  { value: 'jewelry', label: 'Jewelry & Luxury Goods' },
  { value: 'pets', label: 'Pet Care & Services' },
  { value: 'childcare', label: 'Childcare & Family Services' },
  { value: 'senior-care', label: 'Senior Care & Services' },
  { value: 'mental-health', label: 'Mental Health & Therapy' },
  { value: 'dental', label: 'Dental Care' },
  { value: 'veterinary', label: 'Veterinary Services' },
  { value: 'photography', label: 'Photography & Videography' },
  { value: 'music', label: 'Music & Audio Production' },
  { value: 'art-design', label: 'Art & Design' },
  { value: 'crafts-hobbies', label: 'Crafts & Hobbies' },
  { value: 'books-publishing', label: 'Books & Publishing' },
  { value: 'events', label: 'Events & Wedding Planning' },
  { value: 'cleaning', label: 'Cleaning & Maintenance' },
  { value: 'security', label: 'Security Services' },
  { value: 'recruitment', label: 'Recruitment & HR' },
  { value: 'accounting', label: 'Accounting & Tax Services' },
  { value: 'other', label: 'Other' }
] as const

export const AGE_RANGES = [
  { value: '13-17', label: '13-17 (Gen Z)' },
  { value: '18-24', label: '18-24 (Gen Z)' },
  { value: '25-34', label: '25-34 (Millennials)' },
  { value: '35-44', label: '35-44 (Millennials)' },
  { value: '45-54', label: '45-54 (Gen X)' },
  { value: '55-64', label: '55-64 (Gen X)' },
  { value: '65+', label: '65+ (Baby Boomers)' }
] as const

export const INTERESTS = [
  'Technology', 'Business', 'Marketing', 'Finance', 'Health & Fitness',
  'Travel', 'Food & Cooking', 'Fashion', 'Beauty', 'Sports',
  'Entertainment', 'Music', 'Art & Design', 'Photography', 'Gaming',
  'Education', 'Science', 'Environment', 'Politics', 'News',
  'Lifestyle', 'Family & Parenting', 'Relationships', 'Career',
  'Personal Development', 'Spirituality', 'Books & Literature',
  'Movies & TV', 'Automotive', 'Real Estate', 'Home & Garden',
  'DIY & Crafts', 'Pets', 'Outdoor Activities', 'Adventure'
] as const

export const SOCIAL_PLATFORMS = [
  {
    id: 'twitter',
    name: 'Twitter/X',
    description: 'Real-time updates and conversations',
    icon: '𝕏',
    color: 'bg-black'
  },
  {
    id: 'linkedin',
    name: 'LinkedIn',
    description: 'Professional networking and B2B content',
    icon: '💼',
    color: 'bg-blue-600'
  },
  {
    id: 'facebook',
    name: 'Facebook',
    description: 'Community building and broad reach',
    icon: '📘',
    color: 'bg-blue-500'
  },
  {
    id: 'instagram',
    name: 'Instagram',
    description: 'Visual storytelling and lifestyle content',
    icon: '📸',
    color: 'bg-gradient-to-r from-purple-500 to-pink-500'
  },
  {
    id: 'tiktok',
    name: 'TikTok',
    description: 'Short-form video content and trends',
    icon: '🎵',
    color: 'bg-black'
  }
] as const
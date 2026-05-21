export interface QuickLink {
  id: string;
  title: string;
  description: string;
  icon: string;
  url: string;
  category: string;
}

export interface FAQItem {
  id: number;
  question: string;
  answer: string;
}

export interface SiteContent {
  site: { name: string; tagline: string; contactEmail: string; logoUrl: string; };
  quickLinks: QuickLink[];
  faq: FAQItem[];
}

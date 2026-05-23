export type ContentLevel = 'INFO' | 'WARNING' | 'DANGER';

export type AnnouncementItem = {
  id: string;
  title: string;
  content: string;
  level: ContentLevel;
  imageUrl?: string;
  mapUrl?: string;
  createdAt: string;
  updatedAt: string;
};

export type NewsItem = {
  id: string;
  title: string;
  description: string;
  imageUrl?: string;
  mapUrl?: string;
  publishedAt?: string;
  createdAt: string;
  updatedAt: string;
};

export type RuleItem = {
  id: string;
  title: string;
  description: string;
  imageUrl?: string;
  createdAt: string;
  updatedAt: string;
};

export type ContentStore = {
  announcements: AnnouncementItem[];
  news: NewsItem[];
  rules: RuleItem[];
};

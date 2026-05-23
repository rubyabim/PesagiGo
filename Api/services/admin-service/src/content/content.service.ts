import { Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { mkdir, readFile, writeFile } from 'fs/promises';
import { dirname, join } from 'path';
import {
  AnnouncementItem,
  ContentLevel,
  ContentStore,
  NewsItem,
  RuleItem,
} from './content.types';

type AnnouncementPayload = {
  title: string;
  content: string;
  level?: ContentLevel;
  imageUrl?: string;
  mapUrl?: string;
};

type NewsPayload = {
  title: string;
  description: string;
  imageUrl?: string;
  mapUrl?: string;
  publishedAt?: string;
};

type RulePayload = {
  title: string;
  description: string;
  imageUrl?: string;
};

@Injectable()
export class ContentService {
  private readonly filePath = join(process.cwd(), 'data', 'content.json');

  private async ensureStore(): Promise<ContentStore> {
    try {
      const raw = await readFile(this.filePath, 'utf-8');
      const parsed = JSON.parse(raw) as Partial<ContentStore>;
      return {
        announcements: parsed.announcements ?? [],
        news: parsed.news ?? [],
        rules: parsed.rules ?? [],
      };
    } catch {
      const initial: ContentStore = { announcements: [], news: [], rules: [] };
      await mkdir(dirname(this.filePath), { recursive: true });
      await writeFile(this.filePath, JSON.stringify(initial, null, 2), 'utf-8');
      return initial;
    }
  }

  private async saveStore(store: ContentStore) {
    await mkdir(dirname(this.filePath), { recursive: true });
    await writeFile(this.filePath, JSON.stringify(store, null, 2), 'utf-8');
  }

  async listAnnouncements() {
    const store = await this.ensureStore();
    return store.announcements.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }

  async createAnnouncement(payload: AnnouncementPayload) {
    const now = new Date().toISOString();
    const store = await this.ensureStore();
    const item: AnnouncementItem = {
      id: randomUUID(),
      title: payload.title,
      content: payload.content,
      level: payload.level ?? 'INFO',
      imageUrl: payload.imageUrl,
      mapUrl: payload.mapUrl,
      createdAt: now,
      updatedAt: now,
    };
    store.announcements.push(item);
    await this.saveStore(store);
    return item;
  }

  async updateAnnouncement(id: string, payload: Partial<AnnouncementPayload>) {
    const store = await this.ensureStore();
    const item = store.announcements.find((entry) => entry.id === id);
    if (!item) {
      throw new Error('Announcement not found');
    }
    Object.assign(item, payload, { updatedAt: new Date().toISOString() });
    await this.saveStore(store);
    return item;
  }

  async deleteAnnouncement(id: string) {
    const store = await this.ensureStore();
    store.announcements = store.announcements.filter((entry) => entry.id !== id);
    await this.saveStore(store);
    return { message: 'Announcement deleted' };
  }

  async listNews() {
    const store = await this.ensureStore();
    return store.news.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }

  async createNews(payload: NewsPayload) {
    const now = new Date().toISOString();
    const store = await this.ensureStore();
    const item: NewsItem = {
      id: randomUUID(),
      title: payload.title,
      description: payload.description,
      imageUrl: payload.imageUrl,
      mapUrl: payload.mapUrl,
      publishedAt: payload.publishedAt,
      createdAt: now,
      updatedAt: now,
    };
    store.news.push(item);
    await this.saveStore(store);
    return item;
  }

  async updateNews(id: string, payload: Partial<NewsPayload>) {
    const store = await this.ensureStore();
    const item = store.news.find((entry) => entry.id === id);
    if (!item) {
      throw new Error('News not found');
    }
    Object.assign(item, payload, { updatedAt: new Date().toISOString() });
    await this.saveStore(store);
    return item;
  }

  async deleteNews(id: string) {
    const store = await this.ensureStore();
    store.news = store.news.filter((entry) => entry.id !== id);
    await this.saveStore(store);
    return { message: 'News deleted' };
  }

  async listRules() {
    const store = await this.ensureStore();
    return store.rules.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }

  async createRule(payload: RulePayload) {
    const now = new Date().toISOString();
    const store = await this.ensureStore();
    const item: RuleItem = {
      id: randomUUID(),
      title: payload.title,
      description: payload.description,
      imageUrl: payload.imageUrl,
      createdAt: now,
      updatedAt: now,
    };
    store.rules.push(item);
    await this.saveStore(store);
    return item;
  }

  async updateRule(id: string, payload: Partial<RulePayload>) {
    const store = await this.ensureStore();
    const item = store.rules.find((entry) => entry.id === id);
    if (!item) {
      throw new Error('Rule not found');
    }
    Object.assign(item, payload, { updatedAt: new Date().toISOString() });
    await this.saveStore(store);
    return item;
  }

  async deleteRule(id: string) {
    const store = await this.ensureStore();
    store.rules = store.rules.filter((entry) => entry.id !== id);
    await this.saveStore(store);
    return { message: 'Rule deleted' };
  }
}

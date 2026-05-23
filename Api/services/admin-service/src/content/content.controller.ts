import { Body, Controller, Delete, Get, Param, Post, Put, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ContentService } from './content.service';

@Controller('api')
export class ContentController {
  constructor(private readonly contentService: ContentService) {}

  @Get('announcements')
  listAnnouncements() {
    return this.contentService.listAnnouncements();
  }

  @UseGuards(JwtAuthGuard)
  @Post('announcements')
  createAnnouncement(
    @Body() payload: { title: string; content: string; level?: 'INFO' | 'WARNING' | 'DANGER'; imageUrl?: string; mapUrl?: string },
  ) {
    return this.contentService.createAnnouncement(payload);
  }

  @UseGuards(JwtAuthGuard)
  @Put('announcements/:id')
  updateAnnouncement(
    @Param('id') id: string,
    @Body() payload: Partial<{ title: string; content: string; level: 'INFO' | 'WARNING' | 'DANGER'; imageUrl?: string; mapUrl?: string }>,
  ) {
    return this.contentService.updateAnnouncement(id, payload);
  }

  @UseGuards(JwtAuthGuard)
  @Delete('announcements/:id')
  deleteAnnouncement(@Param('id') id: string) {
    return this.contentService.deleteAnnouncement(id);
  }

  @Get('news')
  listNews() {
    return this.contentService.listNews();
  }

  @UseGuards(JwtAuthGuard)
  @Post('news')
  createNews(
    @Body() payload: { title: string; description: string; imageUrl?: string; mapUrl?: string; publishedAt?: string },
  ) {
    return this.contentService.createNews(payload);
  }

  @UseGuards(JwtAuthGuard)
  @Put('news/:id')
  updateNews(
    @Param('id') id: string,
    @Body() payload: Partial<{ title: string; description: string; imageUrl?: string; mapUrl?: string; publishedAt?: string }>,
  ) {
    return this.contentService.updateNews(id, payload);
  }

  @UseGuards(JwtAuthGuard)
  @Delete('news/:id')
  deleteNews(@Param('id') id: string) {
    return this.contentService.deleteNews(id);
  }

  @Get('rules')
  listRules() {
    return this.contentService.listRules();
  }

  @UseGuards(JwtAuthGuard)
  @Post('rules')
  createRule(@Body() payload: { title: string; description: string; imageUrl?: string }) {
    return this.contentService.createRule(payload);
  }

  @UseGuards(JwtAuthGuard)
  @Put('rules/:id')
  updateRule(
    @Param('id') id: string,
    @Body() payload: Partial<{ title: string; description: string; imageUrl?: string }>,
  ) {
    return this.contentService.updateRule(id, payload);
  }

  @UseGuards(JwtAuthGuard)
  @Delete('rules/:id')
  deleteRule(@Param('id') id: string) {
    return this.contentService.deleteRule(id);
  }
}

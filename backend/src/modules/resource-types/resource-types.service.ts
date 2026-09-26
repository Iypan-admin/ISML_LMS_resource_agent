import { Injectable, NotFoundException } from '@nestjs/common';
import { ResourceType } from '@prisma/client';

export interface ResourceTypeMetadata {
  type: ResourceType;
  label: string;
  category: 'READING' | 'AUDIO_VISUAL' | 'PRACTICE' | 'INTERACTIVE' | 'STRUCTURED';
  icon: string;
  description: string;
}

const METADATA_MAP: Record<ResourceType, Omit<ResourceTypeMetadata, 'type'>> = {
  [ResourceType.WEBSITE]: { label: 'Web Portal / Page', category: 'READING', icon: 'Globe', description: 'External website or web portal learning material' },
  [ResourceType.COURSE]: { label: 'Complete Course', category: 'STRUCTURED', icon: 'BookOpen', description: 'Structured learning program or course series' },
  [ResourceType.ARTICLE]: { label: 'Article / Essay', category: 'READING', icon: 'FileText', description: 'Text article, news post, or reading passage' },
  [ResourceType.VIDEO]: { label: 'Video Lesson', category: 'AUDIO_VISUAL', icon: 'Video', description: 'Video lesson or recorded streaming material' },
  [ResourceType.YOUTUBE_VIDEO]: { label: 'YouTube Content', category: 'AUDIO_VISUAL', icon: 'Youtube', description: 'YouTube video or channel resource' },
  [ResourceType.PODCAST]: { label: 'Podcast Episode', category: 'AUDIO_VISUAL', icon: 'Headphones', description: 'Audio podcast episode or audio series' },
  [ResourceType.AUDIO]: { label: 'Audio Track', category: 'AUDIO_VISUAL', icon: 'Volume2', description: 'Native audio recording or listening comprehension file' },
  [ResourceType.PDF]: { label: 'PDF Document', category: 'READING', icon: 'File', description: 'Downloadable PDF document or ebook excerpt' },
  [ResourceType.WORKSHEET]: { label: 'Worksheet / Printable', category: 'PRACTICE', icon: 'FileCheck', description: 'Printable practice worksheet or exercise sheet' },
  [ResourceType.EXERCISE]: { label: 'Practice Exercise', category: 'PRACTICE', icon: 'CheckSquare', description: 'Specific practice problem set or exercise' },
  [ResourceType.QUIZ]: { label: 'Quiz / Assessment', category: 'PRACTICE', icon: 'HelpCircle', description: 'Self-assessment quiz or test set' },
  [ResourceType.GRAMMAR_REFERENCE]: { label: 'Grammar Reference', category: 'STRUCTURED', icon: 'Book', description: 'Grammar rule explanation or reference guide' },
  [ResourceType.VOCABULARY_LIST]: { label: 'Vocabulary List', category: 'STRUCTURED', icon: 'List', description: 'Vocabulary word list, flashcard set, or glossary' },
  [ResourceType.DIALOGUE]: { label: 'Dialogue / Conversation', category: 'INTERACTIVE', icon: 'MessageSquare', description: 'Conversational dialogue transcript or practice' },
  [ResourceType.INTERACTIVE_EXERCISE]: { label: 'Interactive Activity', category: 'INTERACTIVE', icon: 'Activity', description: 'Interactive browser activity or game-based practice' },
};

@Injectable()
export class ResourceTypesService {
  findAll(): ResourceTypeMetadata[] {
    return Object.values(ResourceType).map((type) => ({
      type,
      ...METADATA_MAP[type],
    }));
  }

  findOne(typeInput: string): ResourceTypeMetadata {
    const formatted = typeInput.toUpperCase() as ResourceType;
    if (!Object.values(ResourceType).includes(formatted)) {
      throw new NotFoundException(`Resource type '${typeInput}' is not a valid ResourceType enum`);
    }

    return {
      type: formatted,
      ...METADATA_MAP[formatted],
    };
  }
}

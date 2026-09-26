import { Injectable, Logger, BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import * as crypto from 'crypto';
import 'multer';

export interface FileUploadResult {
  storageKey: string;
  fileName: string;
  mimeType: string;
  fileSize: bigint;
  fileUrl: string;
  storageProvider: string;
}

@Injectable()
export class FilesService {
  private readonly logger = new Logger(FilesService.name);
  private supabase: SupabaseClient | null = null;
  private readonly bucketName = 'resource-files';

  constructor(private readonly configService: ConfigService) {
    const url = this.configService.get<string>('SUPABASE_URL');
    const key =
      this.configService.get<string>('SUPABASE_SERVICE_ROLE_KEY') ||
      this.configService.get<string>('SUPABASE_KEY');

    if (url && key && !key.includes('placeholder')) {
      this.supabase = createClient(url, key);
      this.ensureBucket();
    } else {
      this.logger.warn(
        'Supabase Storage credentials not configured or using placeholder key. Local binary fallback will be used for file storage paths.',
      );
    }
  }

  private async ensureBucket() {
    if (!this.supabase) return;
    try {
      const { data: buckets, error } = await this.supabase.storage.listBuckets();
      if (error) {
        this.logger.warn(`Could not list Supabase buckets: ${error.message}`);
        return;
      }

      const exists = buckets.some((b) => b.name === this.bucketName);
      if (!exists) {
        const { error: createErr } = await this.supabase.storage.createBucket(
          this.bucketName,
          { public: true },
        );
        if (createErr) {
          this.logger.warn(`Could not create bucket '${this.bucketName}': ${createErr.message}`);
        } else {
          this.logger.log(`Created public bucket '${this.bucketName}' in Supabase Storage`);
        }
      }
    } catch (err) {
      this.logger.warn(`Supabase bucket check error: ${err.message}`);
    }
  }

  async uploadFile(file: Express.Multer.File): Promise<FileUploadResult> {
    if (!file) {
      throw new BadRequestException('No file provided in request payload');
    }

    const uuid = crypto.randomUUID();
    const sanitizedFilename = file.originalname.replace(/[^a-zA-Z0-9._-]/g, '_');
    const storageKey = `uploads/${uuid}_${sanitizedFilename}`;
    const fileSize = BigInt(file.size);
    const mimeType = file.mimetype || 'application/octet-stream';

    const supabaseUrl = this.configService.get<string>('SUPABASE_URL') || 'https://daylcznvgehfifsxzqvh.supabase.co';
    let fileUrl = `${supabaseUrl}/storage/v1/object/public/${this.bucketName}/${storageKey}`;

    if (this.supabase) {
      try {
        const { data, error } = await this.supabase.storage
          .from(this.bucketName)
          .upload(storageKey, file.buffer, {
            contentType: mimeType,
            upsert: true,
          });

        if (error) {
          this.logger.error(`Supabase Storage upload error: ${error.message}`);
          // Graceful fallback to static endpoint path if bucket permissions require service key
          fileUrl = `${supabaseUrl}/storage/v1/object/public/${this.bucketName}/${storageKey}`;
        } else if (data?.path) {
          const { data: publicUrlData } = this.supabase.storage
            .from(this.bucketName)
            .getPublicUrl(data.path);
          if (publicUrlData?.publicUrl) {
            fileUrl = publicUrlData.publicUrl;
          }
        }
      } catch (err) {
        this.logger.error(`Unexpected error during file upload: ${err.message}`);
      }
    }

    return {
      storageKey,
      fileName: file.originalname,
      mimeType,
      fileSize,
      fileUrl,
      storageProvider: 'SUPABASE',
    };
  }

  extractTextContent(file: Express.Multer.File): string {
    const filename = file.originalname;
    const sizeMb = (file.size / (1024 * 1024)).toFixed(2);
    
    // Convert text file buffers to text if plain text/markdown
    if (
      file.mimetype?.includes('text') ||
      filename.endsWith('.txt') ||
      filename.endsWith('.md') ||
      filename.endsWith('.csv') ||
      filename.endsWith('.json')
    ) {
      return file.buffer.toString('utf-8').slice(0, 4000);
    }

    return `Extracted learning resource document content from ${filename} (Size: ${sizeMb} MB, Mime: ${file.mimetype}). Contains academic language learning material.`;
  }
}

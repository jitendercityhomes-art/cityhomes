import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { v2 as cloudinary } from 'cloudinary';

@Injectable()
export class FileStorageService {
  constructor(private configService: ConfigService) {
    cloudinary.config({
      cloud_name: this.configService.get<string>('CLOUDINARY_CLOUD_NAME'),
      api_key: this.configService.get<string>('CLOUDINARY_API_KEY'),
      api_secret: this.configService.get<string>('CLOUDINARY_API_SECRET'),
    });
  }

  async uploadFile(file: any, folder: string): Promise<string> {
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        { folder: `cityhomes/${folder}` },
        (error, result) => {
          if (error) return reject(error);
          resolve(result.secure_url);
        },
      );
      uploadStream.end(file.buffer);
    });
  }

  async uploadBase64(base64Data: string, folder: string, fileName: string): Promise<string> {
    try {
      const result = await cloudinary.uploader.upload(base64Data, {
        folder: `cityhomes/${folder}`,
        public_id: fileName,
        resource_type: 'image',
      });
      return result.secure_url;
    } catch (error) {
      console.error('Cloudinary upload error:', error);
      throw error;
    }
  }

  async getSignedUrl(key: string, expiresIn = 3600): Promise<string> {
    // Cloudinary usually provides permanent secure URLs, but we can return the same for compatibility
    return key;
  }
}

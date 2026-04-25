import { Controller, Post, UseInterceptors, UploadedFile, Request, Body } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { FileStorageService } from './file-storage.service';

@Controller('files')
export class FileStorageController {
  constructor(private fileStorageService: FileStorageService) {}

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(
    @UploadedFile() file: any,
    @Request() req,
    @Body('folder') folder: string = 'attachments',
  ) {
    if (!file) {
      return { error: 'No file provided' };
    }

    const url = await this.fileStorageService.uploadFile(file, folder);
    return { url, originalName: file.originalname };
  }
}

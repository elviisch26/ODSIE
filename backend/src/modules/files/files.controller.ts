import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  Body,
  Query,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { FilesService } from './files.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { GetUser } from '../auth/decorators';
import { FileType } from '../../common/enums';

@Controller('files')
@UseGuards(JwtAuthGuard)
export class FilesController {
  constructor(private readonly filesService: FilesService) {}

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  uploadFile(
    @UploadedFile() file: Express.Multer.File,
    @Body('patient_id') patientId: string,
    @Body('folder') folder: string,
    @Body('file_type') fileType: FileType,
    @Body('description') description: string,
    @GetUser() user: any,
  ) {
    return this.filesService.uploadFile(file, patientId, user.id, folder, fileType, description);
  }

  @Get('patient/:patientId')
  findByPatient(@Param('patientId') patientId: string, @Query('folder') folder?: string) {
    return this.filesService.findByPatient(patientId, folder);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.filesService.findOne(id);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.filesService.delete(id);
  }
}

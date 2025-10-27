import { Injectable, BadRequestException } from '@nestjs/common';
import { SupabaseService } from '../../common/supabase/supabase.service';
import { FileType } from '../../common/enums';

@Injectable()
export class FilesService {
  constructor(private supabaseService: SupabaseService) {}

  async uploadFile(
    file: Express.Multer.File,
    patientId: string,
    uploadedBy: string,
    folder: string,
    fileType: FileType,
    description?: string,
  ) {
    try {
      const fileName = `${Date.now()}-${file.originalname}`;
      const filePath = `${patientId}/${folder}/${fileName}`;

      // Upload a Supabase Storage
      await this.supabaseService.uploadFile(
        'medical-files',
        filePath,
        file.buffer,
        file.mimetype,
      );

      // Obtener URL pública
      const fileUrl = this.supabaseService.getPublicUrl('medical-files', filePath);

      // Guardar registro en la base de datos
      const fileRecord = await this.supabaseService.insert('medical_files', {
        patient_id: patientId,
        uploaded_by: uploadedBy,
        file_name: fileName,
        file_url: fileUrl,
        file_size: file.size,
        mime_type: file.mimetype,
        file_type: fileType,
        folder,
        description,
      });

      return fileRecord;
    } catch (error) {
      throw new BadRequestException('Error al subir el archivo: ' + error.message);
    }
  }

  async findByPatient(patientId: string, folder?: string) {
    let query = this.supabaseService
      .getAdminClient()
      .from('medical_files')
      .select('*, uploaded_by_user:users!uploaded_by(*)')
      .eq('patient_id', patientId);

    if (folder) {
      query = query.eq('folder', folder);
    }

    const { data, error } = await query.order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  }

  async findOne(id: string) {
    return this.supabaseService.findOne('medical_files', id);
  }

  async delete(id: string) {
    const file = await this.findOne(id);

    // Extraer path del URL
    const urlParts = file.file_url.split('/');
    const bucketIndex = urlParts.findIndex((part) => part === 'medical-files');
    const filePath = urlParts.slice(bucketIndex + 1).join('/');

    // Eliminar de storage
    await this.supabaseService.deleteFile('medical-files', filePath);

    // Eliminar registro de BD
    return this.supabaseService.delete('medical_files', id);
  }
}

import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { SupabaseService } from '../../common/supabase/supabase.service';
import { CreateMedicalRecordDto, UpdateMedicalRecordDto } from './dto';
import { UserRole, CAN_EDIT_MEDICAL_RECORDS } from '../../common/enums';

@Injectable()
export class MedicalRecordsService {
  constructor(private supabaseService: SupabaseService) {}

  async create(createDto: CreateMedicalRecordDto, doctorId: string) {
    const data = {
      ...createDto,
      doctor_id: doctorId,
      fecha_consulta: createDto.fecha_consulta || new Date().toISOString(),
    };

    return this.supabaseService.insert('medical_records', data);
  }

  async findAll() {
    return this.supabaseService.findAll('medical_records');
  }

  async findByPatient(patientId: string) {
    const { data, error } = await this.supabaseService
      .getAdminClient()
      .from('medical_records')
      .select(`
        *,
        doctor:users(*),
        firmado_por_user:users!firmado_por(*)
      `)
      .eq('patient_id', patientId)
      .order('fecha_consulta', { ascending: false });

    if (error) throw error;
    return data;
  }

  async findOne(id: string) {
    const { data, error } = await this.supabaseService
      .getAdminClient()
      .from('medical_records')
      .select(`
        *,
        doctor:users(*),
        patient:patients(*, user:users(*))
      `)
      .eq('id', id)
      .single();

    if (error) throw new NotFoundException('Registro médico no encontrado');
    return data;
  }

  async update(id: string, updateDto: UpdateMedicalRecordDto, userId: string, userRole: string) {
    // Solo doctores y administradores pueden editar
    if (!CAN_EDIT_MEDICAL_RECORDS.includes(userRole as UserRole)) {
      throw new ForbiddenException('No tienes permisos para editar historias clínicas');
    }

    const record = await this.findOne(id);

    // Un doctor solo puede editar sus propios registros, excepto administradores
    if (userRole === UserRole.DOCTOR && record.doctor_id !== userId) {
      throw new ForbiddenException('Solo puedes editar tus propios registros');
    }

    return this.supabaseService.update('medical_records', id, updateDto);
  }

  async signRecord(id: string, userId: string, firmaDigital: string) {
    const record = await this.findOne(id);

    return this.supabaseService.update('medical_records', id, {
      firma_digital: firmaDigital,
      firmado_por: userId,
      fecha_firma: new Date().toISOString(),
    });
  }

  async delete(id: string, userId: string, userRole: string) {
    // Solo administradores pueden eliminar
    if (userRole !== UserRole.ADMINISTRADOR) {
      throw new ForbiddenException('Solo administradores pueden eliminar registros');
    }

    return this.supabaseService.delete('medical_records', id);
  }
}

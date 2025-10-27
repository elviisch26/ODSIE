import { Injectable } from '@nestjs/common';
import { SupabaseService } from '../../common/supabase/supabase.service';

@Injectable()
export class ActivityLogsService {
  constructor(private supabaseService: SupabaseService) {}

  async create(
    userId: string,
    accion: string,
    descripcion: string,
    patientId?: string,
    ipAddress?: string,
    ubicacion?: string,
  ) {
    return this.supabaseService.insert('activity_logs', {
      user_id: userId,
      patient_id: patientId,
      accion,
      descripcion,
      ip_address: ipAddress,
      ubicacion,
    });
  }

  async findAll(limit: number = 100) {
    const { data, error } = await this.supabaseService
      .getAdminClient()
      .from('activity_logs')
      .select(`
        *,
        user:users(*),
        patient:patients(*, user:users(*))
      `)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data;
  }

  async findByUser(userId: string) {
    const { data, error } = await this.supabaseService
      .getAdminClient()
      .from('activity_logs')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  }

  async findByPatient(patientId: string) {
    const { data, error } = await this.supabaseService
      .getAdminClient()
      .from('activity_logs')
      .select(`
        *,
        user:users(*)
      `)
      .eq('patient_id', patientId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  }

  async getStatistics() {
    const { data: allLogs } = await this.supabaseService
      .getAdminClient()
      .from('activity_logs')
      .select('*');

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const logsToday = allLogs?.filter(
      (log) => new Date(log.created_at) >= today,
    ).length || 0;

    return {
      total_logs: allLogs?.length || 0,
      logs_today: logsToday,
    };
  }
}

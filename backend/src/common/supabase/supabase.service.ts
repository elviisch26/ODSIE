import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

@Injectable()
export class SupabaseService {
  private supabase: SupabaseClient;
  private supabaseAdmin: SupabaseClient;

  constructor(private configService: ConfigService) {
    const supabaseUrl = this.configService.get<string>('SUPABASE_URL');
    const supabaseAnonKey = this.configService.get<string>('SUPABASE_ANON_KEY');
    const supabaseServiceKey = this.configService.get<string>('SUPABASE_SERVICE_KEY');

    // Cliente normal (con anon key)
    this.supabase = createClient(supabaseUrl, supabaseAnonKey);

    // Cliente admin (con service role key - bypass RLS)
    this.supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);
  }

  getClient(): SupabaseClient {
    return this.supabase;
  }

  getAdminClient(): SupabaseClient {
    return this.supabaseAdmin;
  }

  // Métodos helper para operaciones comunes
  async query(table: string) {
    return this.supabaseAdmin.from(table);
  }

  async insert(table: string, data: any) {
    const { data: result, error } = await this.supabaseAdmin
      .from(table)
      .insert(data)
      .select()
      .single();

    if (error) throw error;
    return result;
  }

  async update(table: string, id: string, data: any) {
    const { data: result, error } = await this.supabaseAdmin
      .from(table)
      .update(data)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return result;
  }

  async delete(table: string, id: string) {
    const { error } = await this.supabaseAdmin
      .from(table)
      .delete()
      .eq('id', id);

    if (error) throw error;
    return { success: true };
  }

  async findOne(table: string, id: string) {
    const { data, error } = await this.supabaseAdmin
      .from(table)
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  }

  async findAll(table: string, filters: any = {}) {
    let query = this.supabaseAdmin.from(table).select('*');

    // Aplicar filtros dinámicamente
    Object.entries(filters).forEach(([key, value]) => {
      query = query.eq(key, value);
    });

    const { data, error } = await query;

    if (error) throw error;
    return data;
  }

  // Upload de archivos
  async uploadFile(bucket: string, path: string, file: Buffer, contentType: string) {
    const { data, error } = await this.supabaseAdmin.storage
      .from(bucket)
      .upload(path, file, {
        contentType,
        upsert: false,
      });

    if (error) throw error;
    return data;
  }

  // Obtener URL pública del archivo
  getPublicUrl(bucket: string, path: string): string {
    const { data } = this.supabaseAdmin.storage
      .from(bucket)
      .getPublicUrl(path);

    return data.publicUrl;
  }

  // Eliminar archivo
  async deleteFile(bucket: string, path: string) {
    const { error } = await this.supabaseAdmin.storage
      .from(bucket)
      .remove([path]);

    if (error) throw error;
    return { success: true };
  }
}

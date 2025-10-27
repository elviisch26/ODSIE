import { Injectable, NotFoundException } from '@nestjs/common';
import { SupabaseService } from '../../common/supabase/supabase.service';

@Injectable()
export class UsersService {
  constructor(private supabaseService: SupabaseService) {}

  async findAll() {
    return this.supabaseService.findAll('users');
  }

  async findOne(id: string) {
    const user = await this.supabaseService.findOne('users', id);
    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }
    
    const { password_hash, ...sanitized } = user;
    return sanitized;
  }

  async findByEmail(email: string) {
    const { data, error } = await this.supabaseService
      .getAdminClient()
      .from('users')
      .select('*')
      .eq('email', email)
      .single();

    if (error) return null;
    return data;
  }

  async findByCedula(cedula: string) {
    const { data, error } = await this.supabaseService
      .getAdminClient()
      .from('users')
      .select('*')
      .eq('cedula', cedula)
      .single();

    if (error) return null;
    return data;
  }

  async update(id: string, updateData: any) {
    // Eliminar campos que no se deben actualizar
    const { password_hash, email, cedula, ...allowedData } = updateData;
    
    return this.supabaseService.update('users', id, allowedData);
  }

  async remove(id: string) {
    return this.supabaseService.delete('users', id);
  }

  async searchUsers(query: string) {
    const { data, error } = await this.supabaseService
      .getAdminClient()
      .from('users')
      .select('*')
      .or(`nombres.ilike.%${query}%,apellidos.ilike.%${query}%,cedula.ilike.%${query}%`);

    if (error) throw error;
    return data;
  }
}

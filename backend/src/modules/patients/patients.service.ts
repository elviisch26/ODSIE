import { Injectable, NotFoundException } from '@nestjs/common';
import { SupabaseService } from '../../common/supabase/supabase.service';
import * as QRCode from 'qrcode';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class PatientsService {
  constructor(
    private supabaseService: SupabaseService,
    private configService: ConfigService,
  ) {}

  async findAll() {
    const { data, error } = await this.supabaseService
      .getAdminClient()
      .from('patients')
      .select(`
        *,
        user:users(*)
      `);

    if (error) throw error;
    return data;
  }

  async findOne(id: string) {
    const { data, error } = await this.supabaseService
      .getAdminClient()
      .from('patients')
      .select(`
        *,
        user:users(*),
        medical_records:medical_records(*),
        payments:payments(*)
      `)
      .eq('id', id)
      .single();

    if (error) throw new NotFoundException('Paciente no encontrado');
    return data;
  }

  async findByUserId(userId: string) {
    const { data, error } = await this.supabaseService
      .getAdminClient()
      .from('patients')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error) throw new NotFoundException('Paciente no encontrado');
    return data;
  }

  async findByQRToken(token: string) {
    const { data, error } = await this.supabaseService
      .getAdminClient()
      .from('patients')
      .select(`
        *,
        user:users(*),
        medical_records:medical_records(*,doctor:users(*))
      `)
      .eq('qr_access_token', token)
      .single();

    if (error) throw new NotFoundException('Token QR inválido');
    return data;
  }

  async update(id: string, updateData: any) {
    return this.supabaseService.update('patients', id, updateData);
  }

  async generateQR(patientId: string) {
    const patient = await this.findOne(patientId);
    const frontendUrl = this.configService.get('FRONTEND_URL');
    const qrUrl = `${frontendUrl}/patient/${patient.qr_access_token}`;

    try {
      // Generar QR code como data URL
      const qrCodeDataUrl = await QRCode.toDataURL(qrUrl, {
        width: 300,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF',
        },
      });

      // Actualizar en la base de datos
      await this.update(patientId, { qr_code_url: qrCodeDataUrl });

      return {
        qr_code_url: qrCodeDataUrl,
        access_url: qrUrl,
        token: patient.qr_access_token,
      };
    } catch (error) {
      throw new Error('Error al generar código QR');
    }
  }

  async regenerateQRToken(patientId: string) {
    const { v4: uuidv4 } = require('uuid');
    const newToken = uuidv4();

    await this.update(patientId, {
      qr_access_token: newToken,
      qr_code_url: null,
    });

    // Generar nuevo QR
    return this.generateQR(patientId);
  }
}

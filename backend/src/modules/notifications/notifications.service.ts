import { Injectable } from '@nestjs/common';
import { SupabaseService } from '../../common/supabase/supabase.service';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class NotificationsService {
  private transporter: nodemailer.Transporter;

  constructor(
    private supabaseService: SupabaseService,
    private configService: ConfigService,
  ) {
    // Configurar transporter de email
    this.transporter = nodemailer.createTransport({
      host: this.configService.get('EMAIL_HOST'),
      port: this.configService.get('EMAIL_PORT'),
      secure: false,
      auth: {
        user: this.configService.get('EMAIL_USER'),
        pass: this.configService.get('EMAIL_PASSWORD'),
      },
    });
  }

  async create(userId: string, tipo: string, titulo: string, mensaje: string) {
    return this.supabaseService.insert('notifications', {
      user_id: userId,
      tipo,
      titulo,
      mensaje,
    });
  }

  async findByUser(userId: string) {
    const { data, error } = await this.supabaseService
      .getAdminClient()
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  }

  async markAsRead(id: string) {
    return this.supabaseService.update('notifications', id, { leido: true });
  }

  async markAllAsRead(userId: string) {
    const { error } = await this.supabaseService
      .getAdminClient()
      .from('notifications')
      .update({ leido: true })
      .eq('user_id', userId)
      .eq('leido', false);

    if (error) throw error;
    return { success: true };
  }

  async sendEmail(to: string, subject: string, html: string) {
    try {
      await this.transporter.sendMail({
        from: `"ODSIE Sistema" <${this.configService.get('EMAIL_USER')}>`,
        to,
        subject,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background-color: #2563eb; padding: 20px; text-align: center;">
              <h1 style="color: white; margin: 0;">🩺 ODSIE</h1>
              <p style="color: white; margin: 5px 0;">Sistema de Historias Clínicas Digitales</p>
            </div>
            <div style="padding: 30px; background-color: #f9fafb;">
              ${html}
            </div>
            <div style="background-color: #1f2937; color: white; padding: 15px; text-align: center; font-size: 12px;">
              <p>© ${new Date().getFullYear()} ODSIE. Todos los derechos reservados.</p>
            </div>
          </div>
        `,
      });

      return { success: true };
    } catch (error) {
      console.error('Error enviando email:', error);
      return { success: false, error: error.message };
    }
  }

  async notifyAccess(userId: string, patientName: string, ipAddress: string, ubicacion: string) {
    const titulo = 'Acceso a Historia Clínica';
    const mensaje = `Se ha accedido a la historia clínica de ${patientName} desde IP: ${ipAddress}. Ubicación: ${ubicacion}`;

    // Crear notificación en el sistema
    await this.create(userId, 'ACCESO', titulo, mensaje);

    // Obtener email del usuario
    const user = await this.supabaseService.findOne('users', userId);

    // Enviar email
    if (user.email) {
      await this.sendEmail(
        user.email,
        titulo,
        `
          <h2>Acceso a Historia Clínica</h2>
          <p>Se ha accedido a la historia clínica de <strong>${patientName}</strong></p>
          <ul>
            <li><strong>Fecha y hora:</strong> ${new Date().toLocaleString('es-ES')}</li>
            <li><strong>IP:</strong> ${ipAddress}</li>
            <li><strong>Ubicación:</strong> ${ubicacion}</li>
          </ul>
          <p>Si no reconoces este acceso, por favor contacta al administrador del sistema.</p>
        `,
      );
    }
  }
}

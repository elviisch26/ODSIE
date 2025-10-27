import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { SupabaseService } from '../../common/supabase/supabase.service';
import { RegisterDto, LoginDto } from './dto';
import { UserRole, AccountStatus } from '../../common/enums';

@Injectable()
export class AuthService {
  constructor(
    private supabaseService: SupabaseService,
    private jwtService: JwtService,
  ) {}

  async register(registerDto: RegisterDto) {
    const { email, password, cedula, registro_senescyt } = registerDto;
    
    // Establecer rol por defecto como PACIENTE si no se especifica
    const role = registerDto.role || UserRole.PACIENTE;

    // Verificar si el usuario ya existe
    const { data: existingUser } = await this.supabaseService
      .getAdminClient()
      .from('users')
      .select('*')
      .or(`email.eq.${email},cedula.eq.${cedula}`)
      .single();

    if (existingUser) {
      throw new ConflictException('El usuario con ese email o cédula ya existe');
    }

    // Validar SENESCYT para personal de salud (DOCTOR)
    if (role === UserRole.DOCTOR && !registro_senescyt) {
      throw new BadRequestException(
        'Los doctores deben proporcionar su registro SENESCYT',
      );
    }

    // Hash de la contraseña
    const password_hash = await bcrypt.hash(password, 10);

    // Crear usuario con el rol asignado
    const { data: newUser, error } = await this.supabaseService
      .getAdminClient()
      .from('users')
      .insert({
        ...registerDto,
        role, // Usar el rol determinado (por defecto PACIENTE)
        password_hash,
        password: undefined,
        account_status: AccountStatus.ACTIVO,
        email_verified: false,
      })
      .select()
      .single();

    if (error) {
      throw new BadRequestException('Error al crear el usuario: ' + error.message);
    }

    // Si es paciente, crear registro en tabla patients
    if (role === UserRole.PACIENTE) {
      await this.createPatientRecord(newUser.id);
    }

    // Generar token
    const token = this.generateToken(newUser);

    return {
      user: this.sanitizeUser(newUser),
      token,
    };
  }

  async login(loginDto: LoginDto, ipAddress?: string) {
    const { email, password } = loginDto;

    // Buscar usuario
    const { data: user, error } = await this.supabaseService
      .getAdminClient()
      .from('users')
      .select('*')
      .eq('email', email)
      .single();

    if (error || !user) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    // Verificar contraseña
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    // Verificar estado de la cuenta
    if (user.account_status === AccountStatus.BLOQUEADO) {
      throw new UnauthorizedException(
        'Tu cuenta está bloqueada. Por favor, ponte al día con los pagos.',
      );
    }

    if (user.account_status === AccountStatus.SUSPENDIDO) {
      throw new UnauthorizedException('Tu cuenta ha sido suspendida.');
    }

    // Si es paciente, verificar pagos pendientes
    if (user.role === UserRole.PACIENTE) {
      const hasPendingPayments = await this.checkPendingPayments(user.id);
      if (hasPendingPayments) {
        // Bloquear cuenta
        await this.supabaseService.update('users', user.id, {
          account_status: AccountStatus.BLOQUEADO,
        });
        throw new UnauthorizedException(
          'Tienes pagos pendientes. Por favor, ponte al día para acceder al sistema.',
        );
      }
    }

    // Registrar log de actividad
    await this.logActivity(user.id, 'LOGIN', 'Inicio de sesión exitoso', ipAddress);

    // Generar token
    const token = this.generateToken(user);

    return {
      user: this.sanitizeUser(user),
      token,
    };
  }

  async validateUser(userId: string) {
    const user = await this.supabaseService.findOne('users', userId);
    return this.sanitizeUser(user);
  }

  private generateToken(user: any): string {
    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };

    return this.jwtService.sign(payload);
  }

  private sanitizeUser(user: any) {
    const { password_hash, ...sanitized } = user;
    return sanitized;
  }

  private async createPatientRecord(userId: string) {
    await this.supabaseService.insert('patients', {
      user_id: userId,
      alergias: [],
      enfermedades_cronicas: [],
      medicamentos_actuales: [],
    });
  }

  private async checkPendingPayments(userId: string): Promise<boolean> {
    // Obtener el patient_id
    const { data: patient } = await this.supabaseService
      .getAdminClient()
      .from('patients')
      .select('id')
      .eq('user_id', userId)
      .single();

    if (!patient) return false;

    // Verificar pagos pendientes
    const { data: pendingPayments } = await this.supabaseService
      .getAdminClient()
      .from('payments')
      .select('*')
      .eq('patient_id', patient.id)
      .eq('status', 'PENDIENTE');

    return pendingPayments && pendingPayments.length > 0;
  }

  private async logActivity(
    userId: string,
    accion: string,
    descripcion: string,
    ipAddress?: string,
  ) {
    await this.supabaseService.insert('activity_logs', {
      user_id: userId,
      accion,
      descripcion,
      ip_address: ipAddress,
    });
  }
}

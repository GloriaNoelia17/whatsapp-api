import { Module,  OnModuleInit } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

@Module({
  controllers: [AuthController],
  providers: [AuthService],
  exports: [AuthService],
})
export class AuthModule implements OnModuleInit {
  constructor(private readonly authService: AuthService) {}

  async onModuleInit() {
    // Inicializar el servicio de autenticación al iniciar el módulo
    // Esto asegura que la conexión a WhatsApp se establezca al iniciar la aplicación
    await this.authService.init();
  }

}

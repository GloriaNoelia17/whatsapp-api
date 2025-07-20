import { Controller, Get } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) { }

    @Get('qr')
    async getQR(): Promise<{ qr: string | null }> {
        const qr = this.authService.getQRCode();
        return { qr };
    }

    //opcional que se muestre como una imagen
    @Get('qr-image')
    async getQRImage(): Promise<{ image: string | null }> {
        const image = await this.authService.getQRCodeAsImage();
        return { image };
    }

    @Get('status')
    getStatus(): { connected: boolean } {
        const connected = this.authService.isConnected();
        return { connected };
    }


}

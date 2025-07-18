import { Controller, Body, Post, HttpException, HttpStatus, Get } from '@nestjs/common';
//importar el servicio
import { MessagesService } from './messages.service';

@Controller('messages')
export class MessagesController {

    constructor(private readonly messagesService : MessagesService){}

    @Post()
    async sendMessage(@Body() body: { number: string; message: string }) {
        const { number, message } = body;

        if (!number || !message) {
        throw new HttpException('Faltan parámetros: number o message', HttpStatus.BAD_REQUEST);
        }

        try {
            const result = await this.messagesService.sendMessage(number, message);
            return { success: true, result };
        } catch (error) {
        throw new HttpException(
            'Error al enviar el mensaje: ' + error.message,
            HttpStatus.INTERNAL_SERVER_ERROR,
        );
        }
    }

    @Get('InitSession')
    async initSession(){
        return "retorna un qr"
    }
}

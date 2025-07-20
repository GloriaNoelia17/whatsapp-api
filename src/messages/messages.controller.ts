import {
    Controller,
    Post,
    UploadedFile,
    UseInterceptors,
    Body,
    HttpException,
    HttpStatus,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { CreateMessageDto } from './dto/create-message.dto';
import { MessagesService } from './messages.service';

@Controller('messages')
export class MessagesController {
    constructor(private readonly messagesService: MessagesService) { }

    @Post()
    @UseInterceptors(FileInterceptor('file'))
    async sendMessage(
        @UploadedFile() file: Express.Multer.File,
        @Body() body: CreateMessageDto,
    ) {
        try {
            if (!file) {
                throw new HttpException('Archivo no recibido', HttpStatus.BAD_REQUEST);
            }

            const result = await this.messagesService.sendExcelWithMessage(
                file.buffer,
                body.message,
            );

            return { success: true, result };
        } catch (error) {
            throw new HttpException(
                'Error al enviar el mensaje: ' + error.message,
                HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }
}

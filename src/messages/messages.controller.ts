import {
    Controller,
    Post,
    UploadedFiles,
    UseInterceptors,
    Body,
    HttpException,
    HttpStatus,
} from '@nestjs/common';
import { AnyFilesInterceptor } from '@nestjs/platform-express';
import { CreateMessageDto } from './dto/create-message.dto';
import { MessagesService } from './messages.service';

@Controller('messages')
export class MessagesController {
    constructor(private readonly messagesService: MessagesService) { }

    @Post()
    @UseInterceptors(AnyFilesInterceptor())
    async sendMessage(
        @UploadedFiles() files: Express.Multer.File[],
        @Body() body: CreateMessageDto,
    ) {
        try {
            let imageFile: Express.Multer.File | undefined;
            const excelFile = files.find(f => f.fieldname === 'file');
            if (!excelFile) {
                throw new HttpException('Archivo Excel no recibido', HttpStatus.BAD_REQUEST);
            }

            if( body.includeImage){
                imageFile = files.find(f => f.fieldname === 'image');
            }

            const result = await this.messagesService.sendMessage(
                excelFile.buffer,
                body.message,
                imageFile?.buffer || null,
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

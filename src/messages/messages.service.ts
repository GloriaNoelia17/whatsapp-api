// src/messages/messages.service.ts
import { Injectable } from '@nestjs/common';
import { AuthService } from '../auth/auth.service';
import * as xlsx from 'xlsx';

@Injectable()
export class MessagesService {
    //private readonly logger = new Logger(MessagesService.name);
    constructor(private readonly authService: AuthService) { }


    async sendMessage(buffer: Buffer,message: string,imageBuffer: Buffer | null = null,): Promise<string> {
        try {
            const sock = this.authService.getSocket();
            const workbook = xlsx.read(buffer, { type: 'buffer' });
            const sheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[sheetName];
            const data = xlsx.utils.sheet_to_json(worksheet, { header: 1 });
            const rows = data.slice(1).filter((row) => Array.isArray(row) && row[1]);

            for (let row of rows) {
                const nombreContacto = String((row as any[])[0] || 'Contacto').trim();
                const numero = String((row as any[])[1]).replace(/\D/g, '');

                if (!/^\d{6,15}$/.test(numero)) {
                    console.log('Numero inválido:', numero);

                    continue;
                }

                const numeroConPrefijo = `51${numero}`;
                const waId = `${numeroConPrefijo}@s.whatsapp.net`;

                const exists = await sock.onWhatsApp(numeroConPrefijo);
                if (!exists) {
                    console.log(`No existe en WhatsApp: ${numeroConPrefijo}`);
                    continue;
                }
                //modificar las variables del mensaje
                const textoFinal = message.replace('{nombre}', nombreContacto);
                if (imageBuffer) {
                    await sock.sendMessage(waId, {
                    image: imageBuffer,
                    caption: textoFinal,
                    });
                } else {
                    await sock.sendMessage(waId, {
                    text: textoFinal,
                    });
                }

                await new Promise((resolve) => setTimeout(resolve, 3000));
            }

            return 'Mensajes enviados correctamente.';
        } catch (err) {
            console.error('Error al procesar el Excel:', err);
            throw err;
        }
    }
}

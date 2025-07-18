import { Injectable, Logger } from '@nestjs/common';
import makeWASocket, { useMultiFileAuthState, DisconnectReason, fetchLatestBaileysVersion } from '@whiskeysockets/baileys';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class MessagesService {

    private socket: any;
    private isInitialized = false;
    private readonly logger = new Logger(MessagesService.name);

    async initWhatsApp(): Promise<void> {
        if (this.isInitialized) return;

        const { state, saveCreds } = await useMultiFileAuthState('auth_info_baileys');
        const { version } = await fetchLatestBaileysVersion();

        this.socket = makeWASocket({
            version,
            auth: state,
            printQRInTerminal: true,
        });

        this.socket.ev.on('creds.update', saveCreds);
        this.socket.ev.on('connection.update', (update) => {
            const { connection, lastDisconnect } = update;
            if (connection === 'close') {
                const shouldReconnect = (lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut);
                this.logger.warn('Conexión cerrada, ¿reconectar? ' + shouldReconnect);
                if (shouldReconnect) this.initWhatsApp();
            } else if (connection === 'open') {
                this.logger.log('✅ Conectado a WhatsApp correctamente');
            }
        });

        this.isInitialized = true;
    }

    async sendMessage(phone: string, message: string): Promise<string> {
        try {
            if (!this.isInitialized) await this.initWhatsApp();

            const jid = phone.includes('@s.whatsapp.net') ? phone : `${phone}@s.whatsapp.net`;
            await this.socket.sendMessage(jid, { text: message });
            this.logger.log(`📤 Mensaje enviado a ${phone}`);
            return `Mensaje enviado a ${phone}`;
        } catch (error) {
            this.logger.error(`❌ Error al enviar a ${phone}:`, error);
            throw error;
        }
    }
}

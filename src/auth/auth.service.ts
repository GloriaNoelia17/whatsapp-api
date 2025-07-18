import { Injectable } from '@nestjs/common';
import { Boom } from '@hapi/boom';
import makeWASocket, {
    useMultiFileAuthState,
    DisconnectReason,
    WASocket,
} from '@whiskeysockets/baileys';
import * as fs from 'fs';
import * as QRCode from 'qrcode';
//import * as P from 'pino';

@Injectable()
export class AuthService {

    //Usado para el logeo
    private socket: WASocket;
    private qrCode: string | null = null;

    async init(): Promise<void> {
        // Inicializar el socket de WhatsApp
        const { state, saveCreds } = await useMultiFileAuthState('auth_info_baileys');

        this.socket = makeWASocket({
            auth: state
        });

        this.socket.ev.on('creds.update', saveCreds);

        this.socket.ev.on('connection.update', async (update) => {
            const { connection, lastDisconnect, qr } = update;

            if (qr) {
                this.qrCode = qr; // guardamos QR en variable
            }

            if (connection === 'close') {
                const shouldReconnect =
                    (lastDisconnect?.error as Boom)?.output?.statusCode !==
                    DisconnectReason.loggedOut;

                if (shouldReconnect) {
                    this.init();
                } else {
                    fs.rmSync('auth_info_baileys', { recursive: true, force: true });
                    this.init();
                }
            }

            if (connection === 'open') {
                this.qrCode = null; // ya se logueó, se limpia el QR
                console.log('✅ Conexión abierta');
                // Aquí podrías llamar a una función de configuración inicial
            }
        });
    }

    getQRCode(): string | null {
        return this.qrCode;
    }

    async getQRCodeAsImage(): Promise<string | null> {
        if (!this.qrCode) return Promise.resolve(null);
        // Generar imagen QR a partir del código QR
        return await QRCode.toDataURL(this.qrCode); // retorna base64
    }
}

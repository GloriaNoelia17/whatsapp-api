import { Injectable } from '@nestjs/common';
import makeWASocket, { useMultiFileAuthState, DisconnectReason } from '@whiskeysockets/baileys';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class MessagesService {
    //servicio
    private sock;

    async init() {
    const { state, saveCreds } = await useMultiFileAuthState('auth_info_baileys');
    this.sock = makeWASocket({ auth: state });

    this.sock.ev.on('creds.update', saveCreds);

    this.sock.ev.on('connection.update', (update) => {
      const { connection, lastDisconnect } = update;

      if (connection === 'close') {
        const shouldReconnect = lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut;
        if (shouldReconnect) this.init();
      }
    });
  }

  async sendMessage(jid: string, message: string) {
    if (!this.sock) {
      throw new Error('Socket no inicializado');
    }
    return this.sock.sendMessage(jid, { text: message });
  }
}

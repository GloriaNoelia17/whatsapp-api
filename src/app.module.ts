import { Module } from '@nestjs/common';
import { MessagesController } from './messages/messages.controller';
import { MessagesService } from './messages/messages.service';
import { MessagesModule } from './messages/messages.module';

@Module({
  imports: [MessagesModule],
  controllers: [MessagesController],
  providers: [MessagesService],
})
export class AppModule {}

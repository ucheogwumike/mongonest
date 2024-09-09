import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import amqp, { ChannelWrapper } from 'amqp-connection-manager';
import { ConfirmChannel } from 'amqplib';
// import { EmailService } from 'src/email/email.service';
// import { UserService } from 'src/modules/user/user.service';
import { fakemail } from 'src/utils/utils';

@Injectable()
export class ConsumerService implements OnModuleInit {
  private channelWrapper: ChannelWrapper;
  private readonly logger = new Logger(ConsumerService.name);
  constructor() {
    const connection = amqp.connect(['amqp://127.0.0.1']);
    this.channelWrapper = connection.createChannel();
  }

  public async onModuleInit() {
    try {
      await this.channelWrapper.addSetup(async (channel: ConfirmChannel) => {
        await channel.assertQueue('emailQueue', { durable: true });
        await channel.consume('emailQueue', async (message) => {
          if (message) {
            console.log(message);
            const content = JSON.parse(message.content.toString());
            this.logger.log('Received message:', content);
            fakemail(content);
            channel.ack(message);
          }
        });
      });
      this.logger.log('Consumer service started and listening for messages.');
    } catch (err) {
      this.logger.error('Error starting the consumer:', err);
    }
  }
}

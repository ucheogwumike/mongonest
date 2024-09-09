import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import amqp, { ChannelWrapper } from 'amqp-connection-manager';
import { Channel } from 'amqplib';

@Injectable()
export class ProducerService {
  private channelWrapper: ChannelWrapper;
  constructor() {
    const connection = amqp.connect(['amqp://127.0.0.1']);
    this.channelWrapper = connection.createChannel({
      setup: (channel: Channel) => {
        console.log('test');
        return channel.assertQueue('emailQueue', { durable: true });
      },
    });
  }

  async addToEmailQueue(mail: any) {
    console.log(mail, 'po');
    try {
      await this.channelWrapper.sendToQueue(
        'emailQueue',
        Buffer.from(JSON.stringify(mail)),
        {
          persistent: true,
        },
      );
      console.log('Sent To Queue');
    } catch (error) {
      throw new HttpException(
        'Error adding mail to queue',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}

import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MongooseModule } from '@nestjs/mongoose';
import { UserModule } from './modules/user/user.module';
import { QueueModule } from './queues/queues.module';
@Module({
  imports: [
    MongooseModule.forRoot('mongodb://127.0.0.1:27017/payevertest'),
    UserModule,
    QueueModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

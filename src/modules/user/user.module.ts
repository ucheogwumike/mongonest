import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UserController } from './user.controller';
import { User, UserSchema } from './schemas/user.schema';
import { Avatar, AvatarSchema } from './schemas/avatar.schema';
import { UserService } from './user.service';
import { QueueModule } from 'src/queues/queues.module';
import { HttpModule } from '@nestjs/axios';
@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Avatar.name, schema: AvatarSchema },
    ]),
    QueueModule,
    HttpModule,
  ],
  controllers: [UserController],
  providers: [UserService],
})
export class UserModule {}

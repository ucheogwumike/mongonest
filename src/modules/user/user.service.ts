import { Model } from 'mongoose';
import {
  HttpStatus,
  Injectable,
  NotFoundException,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User } from './schemas/user.schema';
import { Avatar } from './schemas/avatar.schema';
import { CreateUserDto } from './dto/create-user.dto';
import { HttpService } from '@nestjs/axios';
import { ProducerService } from '../../queues/producer.service';
import { SuccessResponse } from '../../common/responses/success.response';

// import { AxiosResponse } from 'axios';
// import { Observable } from 'rxjs';
import { writeFile, unlink } from 'node:fs/promises';

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name)
    private userModel: Model<User>,
    @InjectModel(Avatar.name)
    private avatarModel: Model<Avatar>,
    private producerService: ProducerService,
    private httpService: HttpService,
  ) {}

  // for saving user to the database
  async create(createUserDto: CreateUserDto): Promise<any> {
    try {
      const createdUser = new this.userModel(createUserDto);
      const user = await createdUser.save();
      if (user) {
        await this.producerService.addToEmailQueue(user);
      }
      return SuccessResponse(
        'user created successfully',
        user,
        HttpStatus.CREATED,
      );
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  // calling thirdparty api to fetch a user
  async findUser(userId: number | string): Promise<any> {
    try {
      const data = await this.httpService.axiosRef.get(
        `https://reqres.in/api/users/${userId}`,
      );

      if (data.data) {
        return SuccessResponse(
          'user found successfully',
          data.data,
          HttpStatus.FOUND,
        );
      } else {
        throw new NotFoundException('user not found');
      }
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  async avatarToPicture(userId: number | string): Promise<any> {
    try {
      let avatar = await this.avatarModel.findOne({ userId });
      if (avatar) {
        return SuccessResponse(
          'avatar found successfully',
          avatar.hash,
          HttpStatus.FOUND,
        );
      } else {
        const fetch = await this.httpService.axiosRef.get(
          `https://reqres.in/api/users/${userId}`,
        );
        if (fetch.data.data.avatar) {
          const download = await this.httpService.axiosRef.get(
            fetch.data.data.avatar,
            {
              responseType: 'arraybuffer',
            },
          );

          const buffer = Buffer.from(download.data, 'binary').toString(
            'base64',
          );

          // saves pictures in avatar foleder
          await writeFile(
            `${process.cwd()}/avatars/${userId}.jpg`,
            buffer,
            'base64',
          );

          // save avatar hash to database
          avatar = await this.avatarModel.create({ userId, hash: buffer });
          if (avatar) {
            return SuccessResponse(
              'avatar saved successfully',
              avatar,
              HttpStatus.CREATED,
            );
          }
        } else {
          throw new NotFoundException('avatar not found');
        }
      }
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException(error);
    }
  }

  async deleteAvatar(userId: number | string): Promise<any> {
    try {
      let avatar = await this.avatarModel.findOne({ userId });
      if (avatar) {
        await avatar.deleteOne({ userId });
        await unlink(`${process.cwd()}/avatars/${userId}.jpg`);
        avatar = await this.avatarModel.findOne({ userId });
        if (!avatar) {
          return SuccessResponse(
            'avatar deleted successfully',
            HttpStatus.ACCEPTED,
          );
        }
        throw new NotFoundException('avatar not found');
      }
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }
}

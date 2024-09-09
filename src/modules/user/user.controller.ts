import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  //   ParseIntPipe,
  //   Put,
  //   Query,
  //   Req,
} from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
// import { Response } from 'express';

@Controller('api')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post('/users')
  create(@Body() userDto: CreateUserDto): Promise<any> {
    return this.userService.create(userDto);
  }

  @Get('/user/:userId')
  findUser(@Param('userId') userId: number | string): Promise<any> {
    return this.userService.findUser(userId);
  }

  @Get('/user/:userId/avatar')
  avatarToPicture(@Param('userId') userId: number | string): Promise<any> {
    return this.userService.avatarToPicture(userId);
  }

  @Delete('/user/:userId/avatar')
  deleteAvatar(@Param('userId') userId: number | string): Promise<any> {
    return this.userService.deleteAvatar(userId);
  }
}

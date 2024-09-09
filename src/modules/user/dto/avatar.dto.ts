import { IsNotEmpty, IsString } from 'class-validator';

export class CreateUserDto {
  @IsNotEmpty()
  @IsString()
  readonly hash: string;

  @IsNotEmpty()
  readonly userId: string;
}

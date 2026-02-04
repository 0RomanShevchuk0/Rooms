import {
  IsArray,
  IsEmail,
  IsOptional,
  IsString,
  IsUUID,
  MinLength,
} from 'class-validator';

export class CreateUserDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(4)
  name?: string;

  @IsArray()
  @IsOptional()
  @IsUUID('4', { each: true })
  roomsIds?: string[];
}

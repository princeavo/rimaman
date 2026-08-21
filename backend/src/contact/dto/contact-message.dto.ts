import { IsEmail, IsEnum, IsString, MinLength } from 'class-validator';
import { ContactMessageStatus } from '@prisma/client';

export class CreateContactMessageDto {
  @IsString()
  @MinLength(2)
  name!: string;

  @IsEmail()
  email!: string;

  @IsString()
  @MinLength(3)
  subject!: string;

  @IsString()
  @MinLength(10)
  message!: string;
}

export class UpdateContactMessageStatusDto {
  @IsEnum(ContactMessageStatus)
  status!: ContactMessageStatus;
}

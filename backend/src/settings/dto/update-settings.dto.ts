import { Type } from 'class-transformer';
import {
  IsArray,
  IsEmail,
  IsOptional,
  IsString,
  IsUrl,
  MinLength,
  ValidateNested,
} from 'class-validator';

export class SocialLinkDto {
  @IsString()
  @MinLength(1)
  platform!: string;

  @IsString()
  @MinLength(1)
  icon!: string;

  @IsUrl()
  url!: string;
}

export class UpdateSettingsDto {
  @IsString()
  @MinLength(6)
  whatsappNumber!: string;

  @IsEmail()
  contactEmail!: string;

  @IsString()
  @MinLength(6)
  contactPhone!: string;

  @IsString()
  @MinLength(5)
  companyAddress!: string;

  @IsUrl()
  @IsOptional()
  mapGoogleUrl?: string;

  @IsArray()
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => SocialLinkDto)
  socialLinks?: SocialLinkDto[];
}

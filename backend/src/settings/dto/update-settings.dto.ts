import { Type } from 'class-transformer';
import {
  IsArray,
  IsEmail,
  IsIn,
  IsOptional,
  IsString,
  IsUrl,
  Matches,
  MinLength,
  ValidateNested,
} from 'class-validator';

const DAYS = ['monday','tuesday','wednesday','thursday','friday','saturday','sunday'] as const;

export class OpeningHoursSlotDto {
  @IsIn(DAYS)
  day!: string;

  @IsString()
  @Matches(/^\d{2}:\d{2}$/, { message: 'open doit être au format HH:mm' })
  open!: string;

  @IsString()
  @Matches(/^\d{2}:\d{2}$/, { message: 'close doit être au format HH:mm' })
  close!: string;
}

export class ImpactStatDto {
  @IsString()
  @MinLength(1)
  value!: string;

  @IsString()
  @MinLength(1)
  label!: string;
}

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

  @IsArray()
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => OpeningHoursSlotDto)
  openingHours?: OpeningHoursSlotDto[];

  @IsArray()
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => ImpactStatDto)
  impactStats?: ImpactStatDto[];
}

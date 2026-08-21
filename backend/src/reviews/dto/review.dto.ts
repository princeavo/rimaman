import { IsEnum, IsInt, IsString, IsUUID, Max, Min, MinLength } from 'class-validator';

export enum ReviewStatusDto {
  pending = 'pending',
  approved = 'approved',
  rejected = 'rejected',
}

export class CreateReviewDto {
  @IsUUID()
  productId!: string;

  @IsString()
  @MinLength(2)
  author!: string;

  @IsInt()
  @Min(1)
  @Max(5)
  rating!: number;

  @IsString()
  @MinLength(3)
  title!: string;

  @IsString()
  @MinLength(5)
  comment!: string;
}

export class UpdateReviewStatusDto {
  @IsEnum(ReviewStatusDto)
  status!: ReviewStatusDto;
}

import { IsEmail, IsNotEmpty, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

export class CreateBlogCommentDto {
  @IsString() @IsNotEmpty() @MaxLength(100)
  authorName!: string;

  @IsEmail()
  authorEmail!: string;

  @IsString() @IsNotEmpty() @MinLength(2) @MaxLength(2000)
  content!: string;

  @IsOptional() @IsString()
  parentId?: string;
}

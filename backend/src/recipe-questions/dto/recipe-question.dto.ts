import { IsEmail, IsNotEmpty, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

export class CreateRecipeQuestionDto {
  @IsString() @IsNotEmpty() @MaxLength(100)
  authorName!: string;

  @IsEmail()
  authorEmail!: string;

  @IsString() @IsNotEmpty() @MinLength(10) @MaxLength(1000)
  question!: string;
}

export class AnswerRecipeQuestionDto {
  @IsString() @IsNotEmpty() @MinLength(5) @MaxLength(2000)
  answer!: string;

  @IsOptional()
  status?: 'answered' | 'rejected';
}

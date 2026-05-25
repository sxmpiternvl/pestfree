import { IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

export class ClaimLeadDto {
  @IsString()
  @MinLength(1)
  @MaxLength(40)
  telegramId!: string;

  @IsString()
  @MinLength(1)
  @MaxLength(200)
  name!: string;

  @IsOptional()
  @IsString()
  @MaxLength(40)
  username?: string;
}

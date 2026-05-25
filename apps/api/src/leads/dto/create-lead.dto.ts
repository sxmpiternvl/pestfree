import { IsEnum, IsOptional, IsString, MaxLength, MinLength, Matches } from 'class-validator';
import { ObjectType, ServiceType, Source } from '@prisma/client';

export class CreateLeadDto {
  @IsString()
  @MinLength(2, { message: 'fullName must be at least 2 characters' })
  @MaxLength(120)
  fullName!: string;

  @IsString()
  @MinLength(5, { message: 'phone must contain at least 5 digits' })
  @MaxLength(40)
  // Accept any phone format — operators clean it up later.
  @Matches(/^[+\d\s\-()]+$/, { message: 'phone contains invalid characters' })
  phone!: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  address?: string;

  @IsOptional()
  @IsEnum(ServiceType, { message: 'service must be a valid ServiceType' })
  service?: ServiceType;

  @IsOptional()
  @IsEnum(ObjectType, { message: 'objectType must be a valid ObjectType' })
  objectType?: ObjectType;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  comment?: string;

  @IsEnum(Source, { message: 'source must be WEBSITE or TELEGRAM' })
  source!: Source;

  @IsOptional()
  @IsString()
  @MaxLength(8)
  locale?: string;
}

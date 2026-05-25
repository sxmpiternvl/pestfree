import { Body, Controller, HttpCode, Param, Post } from '@nestjs/common';
import { LeadsService } from './leads.service';
import { CreateLeadDto } from './dto/create-lead.dto';
import { ClaimLeadDto } from './dto/claim-lead.dto';

@Controller('leads')
export class LeadsController {
  constructor(private readonly leads: LeadsService) {}

  @Post()
  @HttpCode(201)
  create(@Body() dto: CreateLeadDto) {
    return this.leads.create(dto);
  }

  @Post(':id/claim')
  @HttpCode(200)
  claim(@Param('id') id: string, @Body() dto: ClaimLeadDto) {
    return this.leads.claim(id, dto);
  }
}

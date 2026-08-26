import {
  Controller,
  Get,
  Patch,
  Body,
  UseGuards,
  Req,
} from '@nestjs/common';
import { IsBoolean, IsString, IsIn, IsOptional } from 'class-validator';
import { SettingsService } from './settings.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

class UpdateSettingsDto {
  @IsOptional()
  @IsBoolean()
  notifyPush?: boolean;
  @IsOptional()
  @IsString()
  dailyTime?: string;
  @IsOptional()
  @IsBoolean()
  widgetTop?: boolean;
  @IsOptional()
  @IsBoolean()
  autoStart?: boolean;
  @IsOptional()
  @IsIn(['light', 'dark', 'system'])
  darkMode?: 'light' | 'dark' | 'system';
  @IsOptional()
  @IsBoolean()
  dataSync?: boolean;
}

@Controller('settings')
@UseGuards(JwtAuthGuard)
export class SettingsController {
  constructor(private readonly settings: SettingsService) {}

  @Get()
  async get(@Req() req: any) {
    return this.settings.get(req.user.id);
  }

  @Patch()
  async update(@Req() req: any, @Body() dto: UpdateSettingsDto) {
    return this.settings.update(req.user.id, dto);
  }
}

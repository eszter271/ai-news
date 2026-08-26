import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  UseGuards,
  Req,
} from '@nestjs/common';
import { IsString } from 'class-validator';
import { FavoritesService } from './favorites.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

class AddFavDto {
  @IsString()
  newsId!: string;
}

@Controller('favorites')
@UseGuards(JwtAuthGuard)
export class FavoritesController {
  constructor(private readonly favs: FavoritesService) {}

  @Get()
  async list(@Req() req: any) {
    return this.favs.list(req.user.id);
  }

  @Get('full')
  async listFull(@Req() req: any) {
    return this.favs.listFull(req.user.id);
  }

  @Post()
  async add(@Req() req: any, @Body() dto: AddFavDto) {
    return this.favs.add(req.user.id, dto.newsId);
  }

  @Delete(':newsId')
  async remove(@Req() req: any, @Param('newsId') newsId: string) {
    return this.favs.remove(req.user.id, newsId);
  }
}

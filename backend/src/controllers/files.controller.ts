import {
  Controller,
  Get,
  Post,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { FilesService } from '../services/files.service';
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiTags } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { fileStorage } from 'files/storage';
import { UseGuards } from '@nestjs/common';
import { AccessTokenGuard } from 'src/common/guards';
import { CurrentUser } from '../common/decorators/CurrentUser.decorator';

@Controller('files')
@ApiTags('files')
@UseGuards(AccessTokenGuard)
@ApiBearerAuth()
export class FilesController {
  constructor(private readonly filesService: FilesService) {}

  @Post()
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @UseInterceptors(
    FileInterceptor('file', {
      storage: fileStorage,
      limits: { fileSize: 1024 * 1024 * 5 },
    }),
  )
  upload(
    @UploadedFile()
    file: Express.Multer.File,
    @CurrentUser() user,
  ) {
    return this.filesService.create(file, user.userId);
  }

  @Get()
  async findAll() {
    return await this.filesService.findAll();
  }

  // @Get(':id')
  // findOne(@Param('id', ParseIntPipe) id: number) {
  //   return this.filesService.findOne(id);
  // }

  // @Delete(':id')
  // remove(@Param('id', ParseIntPipe) id: number) {
  //   return this.filesService.remove(id);
  // }
}

import {
  Controller,
  Get,
  Post,
  UseInterceptors,
  UploadedFile,
  Query,
  Delete,
} from '@nestjs/common';
import { FilesService } from '../services/files.service';
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiTags } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { fileStorage } from 'files/storage';
import { UseGuards } from '@nestjs/common';
import { AccessTokenGuard } from 'src/common/guards';
import { CurrentUser } from '../common/decorators/CurrentUser.decorator';
import { UserDecoded } from 'src/models/User.dto';
import { FileType } from 'src/common/enums/file.enum';
import { ParseIntArrayPipe } from 'src/common/pipes/ParseIntArrayPipe.pipe';

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
  async upload(
    @UploadedFile()
    file: Express.Multer.File,
    @CurrentUser() user: UserDecoded,
  ) {
    return this.filesService.create(file, user.userId);
  }

  @Get()
  @ApiBearerAuth()
  @UseGuards(AccessTokenGuard)
  async findByUserId(
    @CurrentUser() { userId }: UserDecoded,
    @Query('type') fileType: FileType,
  ) {
    return await this.filesService.findByUserId(userId, fileType);
  }

  @Delete(':id')
  delete(
    @CurrentUser() { userId }: UserDecoded,
    @Query('ids', ParseIntArrayPipe) ids: number[],
  ) {
    return this.filesService.delete(userId, ids);
  }
}

import { Injectable } from '@nestjs/common';
import { FileType } from 'src/common/enums/file.enum';
import { BusinessError } from 'src/common/errors/businessErrors/businessError';
import { DatabaseService } from 'src/data/database.service';

@Injectable()
export class FilesService {
  constructor(private readonly db: DatabaseService) {}
  create(file: Express.Multer.File, userId: number) {
    return this.db.file.create({
      data: {
        filename: file.filename,
        originalname: file.originalname,
        size: file.size,
        mimeType: file.mimetype,
        userId,
      },
    });
  }

  async findByUserId(userId: number, fileType: FileType) {
    if (fileType === FileType.TRASH) {
      return await this.db.file.findMany({
        where: { userId, isDeleted: true },
      });
    }

    if (fileType === FileType.ALL) {
      return await this.db.file.findMany({
        where: { userId, isDeleted: false },
      });
    }

    if (fileType === FileType.PHOTOS) {
      return await this.db.file.findMany({
        where: { userId, isDeleted: false, mimeType: { contains: 'image' } },
      });
    }

    if (fileType === FileType.TEXT) {
      return await this.db.file.findMany({
        where: { userId, isDeleted: false, mimeType: { contains: 'text' } },
      });
    }

    throw new BusinessError(
      `Don't contains type: ${fileType}. Contains: '${FileType.ALL}, ${FileType.PHOTOS}, ${FileType.TEXT}, ${FileType.TRASH}'`,
    );
  }

  async findOne(id: number) {
    return `This action returns a #${id} file`;
  }

  async deleteFromTrash(userId: number, ids: number[]) {
    for (let i = 0; i < ids.length; i++) {
      const currentId = ids[i];
      await this.db.file.deleteMany({ where: { userId, id: currentId } });
    }

    return 'success';
  }

  async delete(userId: number, ids: number[]) {
    console.log(ids);
    for (let i = 0; i < ids.length; i++) {
      const currentId = ids[i];
      console.log(currentId);
      await this.db.file.updateMany({
        where: { userId, id: currentId },
        data: { isDeleted: true, deletedAt: new Date(Date.now()) },
      });
    }

    return 'success';
  }
}

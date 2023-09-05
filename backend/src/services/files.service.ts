import { Injectable } from '@nestjs/common';
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

  async findAll() {
    return await this.db.file.findMany({});
  }

  findOne(id: number) {
    return `This action returns a #${id} file`;
  }

  update(id: number) {
    return `This action updates a #${id} file`;
  }

  remove(id: number) {
    return `This action removes a #${id} file`;
  }
}

import {Injectable} from '@nestjs/common';
import {MulterOptionsFactory} from '@nestjs/platform-express';
import * as multer from 'multer';
import * as path from 'path';
import * as fs from 'fs';

@Injectable()
export class MulterConfigService implements MulterOptionsFactory {
  dirPath: string;
  constructor() {
    this.dirPath = path.join(process.cwd(), 'uploads');
    this.mkdir();
  }

  mkdir() {
    try {
      fs.readdirSync(this.dirPath);
    } catch (error) {
      fs.mkdirSync(this.dirPath);
    }
  }

  createMulterOptions() {
    const dirPath = this.dirPath;
    const option = {
      storage: multer.diskStorage({
        destination(req, file, done) {
          done(null, dirPath);
        },
        filename(req, file, done) {
          const ext = path.extname(file.originalname);
          const name = req.body.user_id;
          done(null, `${name}${ext}`);
        },
      }),
      fileFilter(req, file, done) {
        if (
          file.mimetype === 'image/jpg' ||
          file.mimetype === 'image/png' ||
          file.mimetype === 'image/jpeg'
        ) {
          done(null, true);
        } else {
          done(new Error('only jpg, png allowed'));
        }
      },
      limits: {fileSize: 1 * 1024 * 1024},
    };
    return option;
  }
}

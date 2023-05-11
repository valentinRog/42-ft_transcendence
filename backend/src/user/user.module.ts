import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { HttpModule } from '@nestjs/axios';
import { MulterModule } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import UPLOAD_PATH from '../../config/upload-path';

@Module({
  imports: [
    //MulterModule.register({
    //  storage: diskStorage({
    //    destination: UPLOAD_PATH,
    //    filename: (req, file, cb) => {
    //      //const user = req.user;
    //      console.log(req.user);
    //      const fileName = 'module' + '.png';
    //      cb(null, fileName);
    //    },
    //  }),
    //}),
    HttpModule,
  ],
  controllers: [UserController],
  providers: [UserService],
})
export class UserModule {}

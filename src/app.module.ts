import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MongooseModule } from '@nestjs/mongoose';
import { MONGODB_URI } from './secrets';
import { AuthController } from './api/auth/auth.controller';
import { ApiModule } from './api/api.module';
import { SocketModule } from './socket/socket.module';


@Module({
  imports: [
    MongooseModule.forRoot(MONGODB_URI),
    ApiModule,
    SocketModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

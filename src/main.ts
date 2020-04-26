import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as mongoose from './shared/extensions/rx-mongoose'

async function bootstrap() {
  const app = await NestFactory.create(AppModule,{
  });
  await app.listen(3000);
}
bootstrap();

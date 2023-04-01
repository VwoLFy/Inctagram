import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { appConfig } from './configuration/app.config';
import { ApiConfigService } from './modules/api-config/api.config.service';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const createdApp = appConfig(app);
  //configuration app
  const PORT = app.get(ApiConfigService).PORT;
  //configuration swagger
  // swaggerConfig(createdApp);

  await createdApp.listen(PORT).then(async () => {
    console.log(`Server is listening on ${await app.getUrl()}`);
  });
}
bootstrap();

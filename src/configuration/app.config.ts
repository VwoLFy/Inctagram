import { INestApplication } from '@nestjs/common';
import { pipeSetup } from './pipe.setup';
import { exceptionFilterSetup } from './exception-filter.setup';
import cookieParser from 'cookie-parser';

export const appConfig = (app: INestApplication) => {
  //pipe validation
  pipeSetup(app);
  //exception filter
  exceptionFilterSetup(app);
  //add work with cookies
  app.use(cookieParser());
  //add cors
  // const url = app.get(ApiConfigService).FRONTEND_URL
  app.enableCors({
    origin: ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:63342'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  });
  return app;
};

import { Global, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MailerService } from './mailer.service';
import { CodeStore } from './code.store';

@Global()
@Module({
  imports: [ConfigModule],
  providers: [
    MailerService,
    {
      provide: CodeStore,
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const redisUrl = config.get<string>('REDIS_URL');
        if (redisUrl) return new (require('./redis-code.store').RedisCodeStore)(redisUrl);
        return new (require('./memory-code.store').MemoryCodeStore)();
      },
    },
  ],
  exports: [MailerService, CodeStore],
})
export class MailerModule {}

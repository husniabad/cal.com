import { Module, NestModule, MiddlewareConsumer } from "@nestjs/common";
import { ScheduleModule } from "@nestjs/schedule";
import { PrismaModule } from "@/modules/prisma/prisma.module";
import { ApiLogsController } from "./controllers/api-logs.controller";
import { ApiLogsService } from "./services/api-logs.service";
import { ApiLogsCleanupService } from "./services/api-logs-cleanup.service";
import { ApiLogsAnalyticsService } from "./services/api-logs-analytics.service";
import { ApiLogsRepository } from "./api-logs.repository";
import { ApiLoggingMiddleware } from "./middleware/api-logging.middleware";

@Module({
  imports: [ScheduleModule.forRoot(), PrismaModule],
  controllers: [ApiLogsController],
  providers: [ApiLogsService, ApiLogsRepository, ApiLogsCleanupService, ApiLogsAnalyticsService, ApiLoggingMiddleware],
  exports: [ApiLogsService, ApiLogsAnalyticsService, ApiLogsRepository],
})
export class ApiLogsModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(ApiLoggingMiddleware).forRoutes('*');
  }
}

import { Injectable } from "@nestjs/common";
import { PrismaReadService } from "@/modules/prisma/prisma-read.service";
import { PrismaWriteService } from "@/modules/prisma/prisma-write.service";

@Injectable()
export class ApiLogsRepository {
  constructor(
    private readonly prismaRead: PrismaReadService,
    private readonly prismaWrite: PrismaWriteService
  ) {}

  async createApiLog(data: any) {
    return this.prismaWrite.prisma.apiCallLog.create({ data });
  }

  async findApiLogs(where: any, skip: number, take: number, select: any) {
    return this.prismaRead.prisma.apiCallLog.findMany({ where, skip, take, select, orderBy: { timestamp: "desc" } });
  }

  async countApiLogs(where: any) {
    return this.prismaRead.prisma.apiCallLog.count({ where });
  }

  async findOneApiLog(where: any) {
    return this.prismaRead.prisma.apiCallLog.findFirst({ where });
  }

  async aggregateResponseTime(where: any) {
    return this.prismaRead.prisma.apiCallLog.aggregate({ where, _avg: { responseTime: true } });
  }

  async deleteOldLogs(cutoffDate: Date) {
    return this.prismaWrite.prisma.apiCallLog.deleteMany({ where: { timestamp: { lt: cutoffDate } } });
  }
}

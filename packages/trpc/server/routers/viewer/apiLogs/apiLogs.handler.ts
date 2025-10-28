import { prisma } from "@calcom/prisma";
import type { TrpcSessionUser } from "@calcom/trpc/server/trpc";
import type { TGetApiLogsInput } from "./apiLogs.schema";

type GetApiLogsOptions = {
  ctx: {
    user: NonNullable<TrpcSessionUser>;
  };
  input: TGetApiLogsInput;
};

export async function getApiLogsHandler({ ctx, input }: GetApiLogsOptions) {
  const { startDate, endDate, statusCode, endpoint, isError, method, userId: filterUserId, page = 1, perPage = 50 } = input;
  const userId = ctx.user.id;
  const organizationId = ctx.user.organizationId;
  const isAdmin = ctx.user.role === "ADMIN";

  // Build WHERE clause based on access control
  let where: any = {};
  
  if (isAdmin && filterUserId) {
    where.userId = filterUserId;
  } else if (organizationId) {
    where.OR = [{ userId }, { organizationId }];
  } else {
    where.userId = userId;
  }

  if (startDate) where.timestamp = { ...where.timestamp, gte: startDate };
  if (endDate) where.timestamp = { ...where.timestamp, lte: endDate };
  if (statusCode) where.statusCode = statusCode;
  if (endpoint) where.endpoint = { contains: endpoint };
  if (isError !== undefined) where.isError = isError;
  if (method) where.method = method;

  const [logs, total] = await Promise.all([
    prisma.apiCallLog.findMany({
      where,
      orderBy: { timestamp: "desc" },
      skip: (page - 1) * perPage,
      take: perPage,
      select: {
        id: true,
        requestId: true,
        method: true,
        endpoint: true,
        statusCode: true,
        responseTime: true,
        isError: true,
        timestamp: true,
        errorMessage: true,
      },
    }),
    prisma.apiCallLog.count({ where }),
  ]);



  return {
    data: logs,
    pagination: {
      page,
      perPage,
      total,
      totalPages: Math.ceil(total / perPage),
    },
  };
}

type GetApiLogDetailOptions = {
  ctx: {
    user: NonNullable<TrpcSessionUser>;
  };
  input: { id: string };
};

export async function getApiLogDetailHandler({ ctx, input }: GetApiLogDetailOptions) {
  const userId = ctx.user.id;
  const organizationId = ctx.user.organizationId;

  return prisma.apiCallLog.findFirst({
    where: {
      id: input.id,
      OR: organizationId ? [{ userId }, { organizationId }] : [{ userId }],
    },
  });
}

type GetApiLogsStatsOptions = {
  ctx: {
    user: NonNullable<TrpcSessionUser>;
  };
  input: { startDate: Date; endDate: Date };
};

export async function getApiLogsStatsHandler({ ctx, input }: GetApiLogsStatsOptions) {
  const userId = ctx.user.id;
  const organizationId = ctx.user.organizationId;

  const where: any = {
    timestamp: { gte: input.startDate, lte: input.endDate },
    OR: organizationId ? [{ userId }, { organizationId }] : [{ userId }],
  };

  const [totalCalls, errorCalls, avgResponseTime] = await Promise.all([
    prisma.apiCallLog.count({ where }),
    prisma.apiCallLog.count({ where: { ...where, isError: true } }),
    prisma.apiCallLog.aggregate({
      where,
      _avg: { responseTime: true },
    }),
  ]);

  return {
    totalCalls,
    errorCalls,
    errorRate: totalCalls > 0 ? (errorCalls / totalCalls) * 100 : 0,
    avgResponseTime: avgResponseTime._avg.responseTime || 0,
  };
}

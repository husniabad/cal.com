import { Injectable, NestMiddleware, Logger } from "@nestjs/common";
import { Request, Response, NextFunction } from "express";
import { PrismaWriteService } from "@/modules/prisma/prisma-write.service";

@Injectable()
export class ApiLoggingMiddleware implements NestMiddleware {
  private readonly logger = new Logger("ApiLoggingMiddleware");

  constructor(private readonly prismaWrite: PrismaWriteService) {}

  use(req: Request, res: Response, next: NextFunction) {
    const startTime = Date.now();
    const requestId = (req.headers["x-request-id"] || req.headers["X-Request-Id"]) as string || `req-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    res.on("finish", () => {
      this.logApiCall(req, res, requestId, startTime);
    });

    next();
  }

  private logApiCall(req: Request, res: Response, requestId: string, startTime: number) {
    const responseTime = Date.now() - startTime;
    const { method, path, query, headers, body } = req;
    const statusCode = res.statusCode;
    const isError = statusCode >= 400;

    const user = (req as any).user;

    this.prismaWrite.prisma.apiCallLog.create({
      data: {
        requestId,
        method,
        endpoint: path.split("?")[0],
        path,
        queryParams: query as any,
        requestHeaders: this.sanitizeHeaders(headers) as any,
        requestBody: this.sanitizeBody(body) as any,
        statusCode,
        responseBody: undefined,
        responseHeaders: undefined,
        responseTime,
        userId: user?.id,
        organizationId: user?.organizationId,
        oauthClientId: user?.oauthClientId,
        isError,
        errorMessage: null,
        errorStack: null,
        errorCode: null,
        timestamp: new Date(),
        userAgent: headers["user-agent"],
        ipAddress: req.ip,
      }
    }).catch((err: any) => {
      this.logger.error(`Failed to log API call ${requestId}: ${err.message}`);
    });
  }

  private sanitizeHeaders(headers: any): any {
    const sanitized = { ...headers };
    const sensitiveKeys = ["authorization", "cookie", "x-api-key", "api-key"];
    for (const key of sensitiveKeys) {
      if (sanitized[key]) sanitized[key] = "[REDACTED]";
    }
    return sanitized;
  }

  private sanitizeBody(body: any): any {
    if (!body) return null;
    const sanitized = JSON.parse(JSON.stringify(body));
    const sensitiveKeys = ["password", "token", "secret", "apiKey", "accessToken", "refreshToken"];
    const sanitizeObject = (obj: any) => {
      if (typeof obj !== "object" || obj === null) return;
      for (const key in obj) {
        if (sensitiveKeys.some((sk) => key.toLowerCase().includes(sk))) {
          obj[key] = "[REDACTED]";
        } else if (typeof obj[key] === "object") {
          sanitizeObject(obj[key]);
        }
      }
    };
    sanitizeObject(sanitized);
    return sanitized;
  }
}

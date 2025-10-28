import { prisma } from "@calcom/prisma";

async function addTestApiLogs() {
  console.log("Adding test API logs...");

  const testLogs = [
    {
      requestId: "req-1",
      method: "GET",
      endpoint: "/api/trpc/viewer/me/get",
      path: "/api/trpc/viewer/me/get",
      statusCode: 200,
      responseTime: 150,
      isError: false,
      timestamp: new Date(Date.now() - 1000 * 60 * 5), // 5 minutes ago
      userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      ipAddress: "127.0.0.1",
    },
    {
      requestId: "req-2", 
      method: "POST",
      endpoint: "/api/trpc/viewer/eventTypes/create",
      path: "/api/trpc/viewer/eventTypes/create",
      statusCode: 201,
      responseTime: 320,
      isError: false,
      timestamp: new Date(Date.now() - 1000 * 60 * 10), // 10 minutes ago
      userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      ipAddress: "127.0.0.1",
    },
    {
      requestId: "req-3",
      method: "GET",
      endpoint: "/api/trpc/viewer/bookings/list",
      path: "/api/trpc/viewer/bookings/list",
      statusCode: 500,
      responseTime: 1200,
      isError: true,
      errorMessage: "Internal server error",
      timestamp: new Date(Date.now() - 1000 * 60 * 15), // 15 minutes ago
      userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      ipAddress: "127.0.0.1",
    },
    {
      requestId: "req-4",
      method: "PUT",
      endpoint: "/api/trpc/viewer/me/updateProfile",
      path: "/api/trpc/viewer/me/updateProfile",
      statusCode: 200,
      responseTime: 280,
      isError: false,
      timestamp: new Date(Date.now() - 1000 * 60 * 20), // 20 minutes ago
      userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      ipAddress: "127.0.0.1",
    },
    {
      requestId: "req-5",
      method: "DELETE",
      endpoint: "/api/trpc/viewer/eventTypes/delete",
      path: "/api/trpc/viewer/eventTypes/delete",
      statusCode: 404,
      responseTime: 95,
      isError: true,
      errorMessage: "Event type not found",
      timestamp: new Date(Date.now() - 1000 * 60 * 25), // 25 minutes ago
      userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      ipAddress: "127.0.0.1",
    },
  ];

  for (const log of testLogs) {
    await prisma.apiCallLog.create({
      data: log,
    });
  }

  console.log(`Added ${testLogs.length} test API logs`);
}

addTestApiLogs()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
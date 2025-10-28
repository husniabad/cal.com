import { createNextApiHandler } from "@calcom/trpc/server/createNextApiHandler";
import { apiLogsRouter } from "@calcom/trpc/server/routers/viewer/apiLogs";

export default createNextApiHandler(apiLogsRouter);
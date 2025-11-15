import pinoHttp from "pino-http";
import { logger } from "../utils/logger";

export const httpLogger = pinoHttp({
  logger,
  customLogLevel(res, err) {
    const status = res.statusCode!;
    if (status >= 500 || err) return "error";
    if (status >= 400) return "warn";
    return "info";
  },
  customSuccessMessage(res) {
    return `Request completed: ${res.statusCode}`;
  },
  serializers: {
    req(req) {
      return {
        method: req.method,
        url: req.url,
      };
    },
    res(res) {
      return {
        statusCode: res.statusCode,
      };
    },
  },
});

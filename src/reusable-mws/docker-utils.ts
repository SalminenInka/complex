import { hostname } from 'node:os';
import { Request, Response } from 'express';

type HealthCheck = (version: string) => (req: Request, res: Response ) => void

export const simpleHealthCheck: HealthCheck = (version) => {
  return (req: Request, res: Response) => {
    const { userCPUTime, systemCPUTime } = process.resourceUsage();
    const {
      rss, heapTotal, heapUsed, external,
    } = process.memoryUsage();
    res.json({
      status: 'OK',
      version,
      hostname: hostname(),
      uptime: process.uptime(),
      memory: {
        rss, heapTotal, heapUsed, external,
      },
      userCPUTime,
      systemCPUTime
    });
  };
};

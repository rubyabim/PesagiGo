import type { Request, Response } from 'express';
import { GatewayService } from './gateway.service';

export class ProxyBaseController {
  constructor(protected readonly gatewayService: GatewayService) {}

  protected async forward(req: Request, res: Response) {
    const path = req.path;
    const method = req.method;
    const body = req.body;
    const headers = req.headers;

    const result = await this.gatewayService.forwardRequest(
      method,
      path,
      body,
      headers,
    );

    if (result.error) {
      return res.status(result.statusCode).json({
        error: true,
        message: result.message,
        service: result.service,
      });
    }

    return res.json(result);
  }
}

import { All, Controller, Req, Res } from '@nestjs/common';
import type { Request, Response } from 'express';
import { GatewayService } from './gateway.service';

@Controller()
export class GatewayController {
  constructor(private readonly gatewayService: GatewayService) {}

  @All('/*')
  async handleRequest(@Req() req: Request, @Res() res: Response) {
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

    res.json(result);
  }
}

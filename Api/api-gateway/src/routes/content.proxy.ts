import { All, Controller, Req, Res } from '@nestjs/common';
import type { Request, Response } from 'express';
import { ProxyBaseController } from './proxy.base';
import { GatewayService } from './gateway.service';

@Controller(['api/announcements', 'api/news', 'api/rules'])
export class ContentProxyController extends ProxyBaseController {
  constructor(gatewayService: GatewayService) {
    super(gatewayService);
  }

  @All(['', ':id'])
  handle(@Req() req: Request, @Res() res: Response) {
    return this.forward(req, res);
  }
}

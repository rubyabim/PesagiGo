import { All, Controller, Req, Res } from '@nestjs/common';
import type { Request, Response } from 'express';
import { ProxyBaseController } from './proxy.base';
import { GatewayService } from './gateway.service';

@Controller(['api/mountains', 'api/routes', 'api/basecamp', 'api/sessions', 'api/seed'])
export class CatalogProxyController extends ProxyBaseController {
  constructor(gatewayService: GatewayService) {
    super(gatewayService);
  }

  @All()
  @All('*')
  handle(@Req() req: Request, @Res() res: Response) {
    return this.forward(req, res);
  }
}

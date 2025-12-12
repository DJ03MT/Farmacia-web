import { Body, Controller, Get, Post } from '@nestjs/common';
import { VentasService } from './ventas.services';

@Controller('ventas')
export class VentasController {
  constructor(private readonly ventasService: VentasService) {}

  @Post()
  registrarVenta(@Body() datos: { productos: { id: number; cantidad: number }[], metodo_pago: string }) {
    return this.ventasService.crearVenta(datos);
  }

  @Get()
  verHistorialVentas() {
    return this.ventasService.obtenerVentas();
  }
}
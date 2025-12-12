import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Venta } from './venta.entity';
import { DetalleVenta } from './detalle-venta.entity';
import { Producto } from '../productos/producto.entity';

@Injectable()
export class VentasService {
  constructor(
    @InjectRepository(Venta)
    private ventaRepository: Repository<Venta>,
    
    @InjectRepository(DetalleVenta)
    private detalleRepository: Repository<DetalleVenta>,
    
    @InjectRepository(Producto)
    private productoRepository: Repository<Producto>,

    
  ) {}

  async crearVenta(datosVenta: { productos: { id: number; cantidad: number }[], metodo_pago: string }) {
  
    const nuevaVenta = new Venta();
    nuevaVenta.total = 0;
    nuevaVenta.metodo_pago = datosVenta.metodo_pago;
    const ventaGuardada = await this.ventaRepository.save(nuevaVenta);

    let totalCalculado = 0;

    // Recorremos cada producto que el cliente quiere comprar
    for (const item of datosVenta.productos) {
      const producto = await this.productoRepository.findOneBy({ id: item.id });

      if (!producto) {
        throw new BadRequestException(`El producto con ID ${item.id} no existe`);
      }

      if (producto.stock < item.cantidad) {
        throw new BadRequestException(`No hay suficiente stock de ${producto.nombre}`);
      }

      // Crear el detalle de venta
      const detalle = new DetalleVenta();
      detalle.venta = ventaGuardada;
      detalle.producto = producto;
      detalle.cantidad = item.cantidad;
      detalle.precio_unitario = producto.precio; // Guardamos el precio al momento de la venta
      
      await this.detalleRepository.save(detalle);

      // Actualizar el stock y sumar al total
      producto.stock -= item.cantidad;
      await this.productoRepository.save(producto); // Guardamos el nuevo stock

      totalCalculado += (producto.precio * item.cantidad);
    }

    // Actualizamos el total final de la venta
    ventaGuardada.total = totalCalculado;
    return this.ventaRepository.save(ventaGuardada);
  }

  async obtenerVentas() {
    // Trae las ventas CON sus detalles y los nombres de los productos
    return this.ventaRepository.find({
      relations: ['detalles', 'detalles.producto'], 
      order: { fecha: 'DESC' } // Las más recientes primero
    });
  }
}
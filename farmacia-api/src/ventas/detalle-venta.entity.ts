import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { Venta } from './venta.entity';
import { Producto } from '../productos/producto.entity'; // Importa tu producto

@Entity('detalle_ventas')
export class DetalleVenta {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('int')
  cantidad: number;

  @Column('decimal', { precision: 10, scale: 2 })
  precio_unitario: number; // Guardamos el precio del momento de la venta

  // Relación con la Venta padre
  @ManyToOne(() => Venta, (venta) => venta.detalles)
  venta: Venta;

  // Relación con el Producto (para saber qué se vendió)
  @ManyToOne(() => Producto)
  producto: Producto;
}
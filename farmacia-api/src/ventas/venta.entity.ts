import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, OneToMany } from 'typeorm';
import { DetalleVenta } from './detalle-venta.entity';

@Entity()
export class Venta {
    @PrimaryGeneratedColumn()
    id: number;

    @CreateDateColumn()
    fecha: Date;

    @Column('decimal', { precision: 10, scale: 2 })
    total: number;

    @OneToMany(() => DetalleVenta, (detalle) => detalle.venta, {cascade: true})
    detalles: DetalleVenta[];

    @Column({ default: 'EECTIVO'})
    metodo_pago: string;
}

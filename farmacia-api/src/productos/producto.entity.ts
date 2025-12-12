import {Entity, Column, PrimaryGeneratedColumn } from "typeorm";

@Entity('productos')
export class Producto {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    nombre: string;

    @Column('text', {nullable: true})
    descripcion: string;

    @Column('decimal', {precision: 10, scale: 2})
    precio: number;

    @Column('int')
    stock: number;

    @Column('date', {nullable: true})
    fecha_vencimiento: Date;

    @Column({default: 'https://via.placeholder.com/150 '})
    imagenUrl: string;
}

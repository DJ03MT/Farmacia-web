import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductosController } from './productos/productos.controller';
import { Producto } from './productos/producto.entity';
import { ProductosService } from './productos/productos.services';
import { VentasController } from './ventas/ventas.controller';
import { Venta } from './ventas/venta.entity';
import { DetalleVenta } from './ventas/detalle-venta.entity';
import { VentasService } from './ventas/ventas.services';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port:5432,
      username:'postgres',
      password:'admin123',
      database:'farmacia_db',
      autoLoadEntities: true,
      synchronize: true,
    }),

    TypeOrmModule.forFeature([Producto, Venta, DetalleVenta]),
  ],
  controllers: [AppController, ProductosController, VentasController],
  providers: [AppService, ProductosService, VentasService],
})
export class AppModule {}

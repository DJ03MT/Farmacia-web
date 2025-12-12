import { Body, Controller, Get, Post } from '@nestjs/common';
import { ProductosService } from './productos.services';

@Controller('productos')
export class ProductosController {

    constructor(private readonly productosService: ProductosService){}

    @Get()
    obtenerTodos(){
        return this.productosService.findAll();
    }

    @Post()
    crearProductos(@Body() datos: any ){
        return this.productosService.create(datos);
    }

}

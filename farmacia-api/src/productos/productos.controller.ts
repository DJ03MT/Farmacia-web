import { Body, Controller, Get, Post, Delete, Param, Put } from '@nestjs/common';
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

    @Delete(':id')
    borrarProducto(@Param('id') id: string){
        return this.productosService.remove(+id);
    }

    @Put(':id')
    actualizarProducto(@Param('id') id: string, @Body() datos: any){
        return this.productosService.update(+id, datos);
    }

}

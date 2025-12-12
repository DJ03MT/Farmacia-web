import { Injectable } from "@nestjs/common";
import { Producto } from "./producto.entity";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";

@Injectable()
export class ProductosService {
    constructor(
        @InjectRepository(Producto)
        private productoRepository: Repository<Producto>
    ) {}

    async findAll(){
        return this.productoRepository.find();
    }

    create(datosProductos: any){
        const nuevoProducto = this.productoRepository.create(datosProductos);
        return this.productoRepository.save(nuevoProducto);
    }
}
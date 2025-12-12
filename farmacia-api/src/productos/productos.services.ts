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

async create(datosProducto: any) {
    // 1. Buscamos si ya existe un producto con el mismo nombre (insensible a mayúsculas/minúsculas)
    // Nota: Esto asume que el nombre es único. Lo ideal sería usar código de barras.
    const productoExistente = await this.productoRepository.createQueryBuilder('producto')
      .where('LOWER(producto.nombre) = LOWER(:nombre)', { nombre: datosProducto.nombre })
      .getOne();

    if (productoExistente) {
      // 2. Si existe, ¡Sumamos el stock!
      productoExistente.stock += parseInt(datosProducto.stock);
      // Opcional: Actualizamos el precio al nuevo precio de compra
      productoExistente.precio = parseFloat(datosProducto.precio);
      
      return this.productoRepository.save(productoExistente);
    } else {
      // 3. Si no existe, lo creamos normal
      const nuevoProducto = this.productoRepository.create(datosProducto);
      return this.productoRepository.save(nuevoProducto);
    }
  }

    async remove(id: number){
        await this.productoRepository.delete(id);
    }
    
    async update(id: number, datosProductos: any){
        await this.productoRepository.update(id, datosProductos);
    }
}
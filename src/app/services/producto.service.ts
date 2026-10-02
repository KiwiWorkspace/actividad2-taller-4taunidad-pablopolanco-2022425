import { Injectable } from '@angular/core';
import { Observable, delay, of } from 'rxjs';

import { Producto, ProductoFormulario, RespuestaRegistro } from '../models/producto.model';

/** Sustituye a un backend real: guarda los productos en memoria y responde con retardo. */
@Injectable({ providedIn: 'root' })
export class ProductoService {
  private productos: Producto[] = [];
  private secuenciaId = 1;

  registrarProducto(datos: ProductoFormulario): Observable<RespuestaRegistro> {
    const producto: Producto = {
      ...datos,
      id: this.secuenciaId,
      fechaRegistro: new Date().toISOString()
    };
    this.secuenciaId += 1;
    this.productos.push(producto);

    console.log('ProductoService recibió el producto:');
    console.table(producto);
    console.log(`Productos almacenados: ${this.productos.length}`);

    const respuesta: RespuestaRegistro = {
      exito: true,
      mensaje: `Producto ${producto.nombre} (${producto.codigo}) registrado correctamente.`,
      producto
    };

    return of(respuesta).pipe(delay(600));
  }

  listarProductos(): Producto[] {
    return [...this.productos];
  }

  limpiarProductos(): void {
    this.productos = [];
    this.secuenciaId = 1;
  }
}

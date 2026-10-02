import { DatePipe, DecimalPipe, NgFor, NgIf } from '@angular/common';
import { Component, input } from '@angular/core';

import { Producto } from '../../models/producto.model';

@Component({
  selector: 'app-lista-productos',
  imports: [DatePipe, DecimalPipe, NgFor, NgIf],
  templateUrl: './lista-productos.html',
  styleUrl: './lista-productos.css'
})
export class ListaProductos {
  readonly productos = input.required<Producto[]>();

  /** ngFor trackBy para conservar las filas al recargar la lista. */
  identificarProducto(_indice: number, producto: Producto): number {
    return producto.id;
  }
}

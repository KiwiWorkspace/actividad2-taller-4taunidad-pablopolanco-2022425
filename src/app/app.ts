import { Component, signal } from '@angular/core';

import { ListaProductos } from './components/lista-productos/lista-productos';
import { ProductoForm } from './components/producto-form/producto-form';
import { Producto } from './models/producto.model';
import { ProductoService } from './services/producto.service';

@Component({
  selector: 'app-root',
  imports: [ListaProductos, ProductoForm],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  readonly productos = signal<Producto[]>([]);

  constructor(private readonly productoService: ProductoService) {}

  /** La tabla se arma con lo que el servicio guardó, no con lo que envió el formulario. */
  registrarProducto(_producto: Producto): void {
    this.productos.set(this.productoService.listarProductos());
  }
}

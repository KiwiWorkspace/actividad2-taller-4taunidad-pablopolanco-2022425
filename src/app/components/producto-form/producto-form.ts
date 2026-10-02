import { NgFor, NgIf } from '@angular/common';
import { Component, output, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { finalize } from 'rxjs';

import { EstadoFormulario } from '../estado-formulario/estado-formulario';
import {
  CampoFormulario,
  ClaveCampo,
  ClaveError,
  LIMITES,
  MENSAJES_ERROR,
  PATRONES
} from '../../models/formulario.model';
import { CATEGORIAS, Categoria, Producto, ProductoFormulario } from '../../models/producto.model';
import { ProductoService } from '../../services/producto.service';

@Component({
  selector: 'app-producto-form',
  imports: [NgFor, NgIf, ReactiveFormsModule, EstadoFormulario],
  templateUrl: './producto-form.html',
  styleUrl: './producto-form.css'
})
export class ProductoForm {
  /** Emite el producto ya registrado para que la lista se actualice. */
  readonly productoRegistrado = output<Producto>();

  readonly categorias = CATEGORIAS;

  readonly formulario = new FormGroup({
    codigo: new FormControl('', {
      nonNullable: true,
      validators: [
        Validators.required,
        Validators.maxLength(12),
        Validators.pattern(PATRONES.codigo)
      ]
    }),
    nombre: new FormControl('', {
      nonNullable: true,
      validators: [
        Validators.required,
        Validators.minLength(LIMITES.nombreMin),
        Validators.maxLength(LIMITES.nombreMax),
        Validators.pattern(PATRONES.nombre)
      ]
    }),
    descripcion: new FormControl('', {
      nonNullable: true,
      validators: [
        Validators.required,
        Validators.minLength(LIMITES.descripcionMin),
        Validators.maxLength(LIMITES.descripcionMax)
      ]
    }),
    precio: new FormControl<number | null>(null, {
      validators: [
        Validators.required,
        Validators.min(LIMITES.precioMin),
        Validators.max(LIMITES.precioMax),
        Validators.pattern(PATRONES.precio)
      ]
    }),
    categoria: new FormControl<Categoria | null>(null, {
      validators: [Validators.required]
    }),
    stock: new FormControl<number | null>(null, {
      validators: [
        Validators.required,
        Validators.min(LIMITES.stockMin),
        Validators.max(LIMITES.stockMax),
        Validators.pattern(PATRONES.stock)
      ]
    }),
    activo: new FormControl(true, { nonNullable: true })
  });

  readonly campos: CampoFormulario[] = [
    { clave: 'codigo', etiqueta: 'Código SKU', control: this.formulario.controls.codigo },
    { clave: 'nombre', etiqueta: 'Nombre', control: this.formulario.controls.nombre },
    { clave: 'descripcion', etiqueta: 'Descripción', control: this.formulario.controls.descripcion },
    { clave: 'precio', etiqueta: 'Precio', control: this.formulario.controls.precio },
    { clave: 'categoria', etiqueta: 'Categoría', control: this.formulario.controls.categoria },
    { clave: 'stock', etiqueta: 'Stock', control: this.formulario.controls.stock },
    { clave: 'activo', etiqueta: 'Activo', control: this.formulario.controls.activo }
  ];

  readonly enviando = signal(false);
  readonly intentoEnvio = signal(false);
  readonly mensajeExito = signal('');
  readonly mensajeError = signal('');

  constructor(private readonly productoService: ProductoService) {}

  enviar(): void {
    this.mensajeExito.set('');
    this.mensajeError.set('');

    if (this.formulario.invalid) {
      this.intentoEnvio.set(true);
      this.marcarTodosComoTocados();
      return;
    }

    this.enviando.set(true);
    this.productoService
      .registrarProducto(this.construirDatos())
      .pipe(finalize(() => this.enviando.set(false)))
      .subscribe({
        next: (respuesta) => {
          this.mensajeExito.set(respuesta.mensaje);
          this.intentoEnvio.set(false);
          this.limpiarFormulario();
          this.productoRegistrado.emit(respuesta.producto);
        },
        error: () =>
          this.mensajeError.set('No fue posible registrar el producto. Intenta de nuevo.')
      });
  }

  reiniciar(): void {
    this.limpiarFormulario();
    this.intentoEnvio.set(false);
    this.mensajeExito.set('');
    this.mensajeError.set('');
  }

  /** Un error se muestra si el control es inválido y ya fue tocado o se intentó enviar. */
  mostrarError(clave: ClaveCampo): boolean {
    const control = this.formulario.controls[clave];
    return control.invalid && (control.touched || this.intentoEnvio());
  }

  /** Recorre errors del control y devuelve un mensaje por cada clave con texto definido. */
  mensajesDe(clave: ClaveCampo): string[] {
    const errores = this.formulario.controls[clave].errors;
    const mensajes = MENSAJES_ERROR[clave];
    if (!errores || !mensajes) {
      return [];
    }
    return Object.keys(errores).reduce<string[]>((lista, claveError) => {
      const mensaje = mensajes[claveError as ClaveError];
      if (mensaje) {
        lista.push(mensaje);
      }
      return lista;
    }, []);
  }

  marcarTodosComoTocados(): void {
    Object.values(this.formulario.controls).forEach((control) => control.markAsTouched());
  }

  contarCamposInvalidos(): number {
    return Object.values(this.formulario.controls).filter((control) => control.invalid).length;
  }

  private construirDatos(): ProductoFormulario {
    const { codigo, nombre, descripcion, precio, categoria, stock, activo } =
      this.formulario.getRawValue();
    // El formulario ya pasó las validaciones, por eso los campos numéricos y la categoría tienen valor.
    return {
      codigo: codigo.trim(),
      nombre: nombre.trim(),
      descripcion: descripcion.trim(),
      precio: precio as number,
      categoria: categoria as Categoria,
      stock: stock as number,
      activo
    };
  }

  private limpiarFormulario(): void {
    this.formulario.reset({ activo: true });
  }
}

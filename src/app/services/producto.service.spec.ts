import { TestBed, fakeAsync, tick } from '@angular/core/testing';

import { ProductoFormulario } from '../models/producto.model';
import { ProductoService } from './producto.service';

const DATOS: ProductoFormulario = {
  codigo: 'ABC-1234',
  nombre: 'Café molido',
  descripcion: 'Café de origen Colombia con molienda fina.',
  precio: 18500.5,
  categoria: 'Alimentos',
  stock: 120,
  activo: true
};

describe('ProductoService', () => {
  let servicio: ProductoService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    servicio = TestBed.inject(ProductoService);
  });

  it('empieza sin productos almacenados', () => {
    expect(servicio.listarProductos()).toEqual([]);
  });

  it('guarda el producto recibido y responde con éxito', fakeAsync(() => {
    let mensaje = '';
    let exito = false;

    servicio.registrarProducto(DATOS).subscribe((respuesta) => {
      mensaje = respuesta.mensaje;
      exito = respuesta.exito;
    });
    tick(600);

    expect(exito).toBeTrue();
    expect(mensaje).toContain('ABC-1234');
    expect(servicio.listarProductos().length).toBe(1);
    expect(servicio.listarProductos()[0].nombre).toBe('Café molido');
  }));

  it('asigna id incremental y fecha de registro', fakeAsync(() => {
    servicio.registrarProducto(DATOS).subscribe();
    tick(600);
    servicio.registrarProducto({ ...DATOS, codigo: 'CD-5678' }).subscribe();
    tick(600);

    const productos = servicio.listarProductos();
    expect(productos[0].id).toBe(1);
    expect(productos[1].id).toBe(2);
    expect(productos[1].codigo).toBe('CD-5678');
    expect(Number.isNaN(Date.parse(productos[1].fechaRegistro))).toBeFalse();
  }));

  it('responde después de 600 milisegundos', fakeAsync(() => {
    let respondio = false;
    servicio.registrarProducto(DATOS).subscribe(() => (respondio = true));

    tick(599);
    expect(respondio).toBeFalse();

    tick(1);
    expect(respondio).toBeTrue();
  }));

  it('limpiarProductos vacía el almacén y reinicia la secuencia', fakeAsync(() => {
    servicio.registrarProducto(DATOS).subscribe();
    tick(600);
    servicio.limpiarProductos();
    servicio.registrarProducto(DATOS).subscribe();
    tick(600);

    expect(servicio.listarProductos().length).toBe(1);
    expect(servicio.listarProductos()[0].id).toBe(1);
  }));
});

import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';

import { ProductoForm } from './producto-form';
import { ListaProductos } from '../lista-productos/lista-productos';
import { ProductoService } from '../../services/producto.service';

const DATOS_VALIDOS = {
  codigo: 'ABC-1234',
  nombre: 'Café molido',
  descripcion: 'Café de origen Colombia con molienda fina.',
  precio: 18500.5,
  categoria: 'Alimentos' as const,
  stock: 120,
  activo: true
};

describe('ProductoForm', () => {
  let componente: ProductoForm;
  let fixture: ComponentFixture<ProductoForm>;
  let servicio: ProductoService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProductoForm]
    }).compileComponents();

    fixture = TestBed.createComponent(ProductoForm);
    componente = fixture.componentInstance;
    servicio = TestBed.inject(ProductoService);
    fixture.detectChanges();
  });

  it('crea el formulario inválido con todos los controles obligatorios vacíos', () => {
    expect(componente.formulario.invalid).toBeTrue();
    expect(componente.formulario.valid).toBeFalse();
    expect(componente.formulario.pristine).toBeTrue();
    expect(componente.formulario.untouched).toBeTrue();
  });

  it('deja activo el control activo por defecto', () => {
    expect(componente.formulario.controls.activo.value).toBeTrue();
  });

  it('el código SKU inválido activa el error pattern', () => {
    componente.formulario.controls.codigo.setValue('ab-12');
    expect(componente.formulario.controls.codigo.hasError('pattern')).toBeTrue();
    expect(componente.mensajesDe('codigo').length).toBe(1);
  });

  it('el nombre muy corto activa minlength y el demasiado largo activa maxlength', () => {
    componente.formulario.controls.nombre.setValue('Ca');
    expect(componente.formulario.controls.nombre.hasError('minlength')).toBeTrue();

    componente.formulario.controls.nombre.setValue('a'.repeat(51));
    expect(componente.formulario.controls.nombre.hasError('maxlength')).toBeTrue();
  });

  it('la descripción de menos de 10 caracteres activa minlength', () => {
    componente.formulario.controls.descripcion.setValue('Corta');
    expect(componente.formulario.controls.descripcion.hasError('minlength')).toBeTrue();
  });

  it('el precio en cero activa min y con tres decimales activa pattern', () => {
    componente.formulario.controls.precio.setValue(0);
    expect(componente.formulario.controls.precio.hasError('min')).toBeTrue();

    componente.formulario.controls.precio.setValue(10.555);
    expect(componente.formulario.controls.precio.hasError('pattern')).toBeTrue();
  });

  it('el stock con decimales activa pattern y el negativo activa min', () => {
    componente.formulario.controls.stock.setValue(10.5);
    expect(componente.formulario.controls.stock.hasError('pattern')).toBeTrue();

    componente.formulario.controls.stock.setValue(-1);
    expect(componente.formulario.controls.stock.hasError('min')).toBeTrue();
  });

  it('la categoría vacía activa required', () => {
    componente.formulario.controls.categoria.setValue(null);
    expect(componente.formulario.controls.categoria.hasError('required')).toBeTrue();
  });

  it('no muestra el error de un control inválido mientras no se toca', () => {
    componente.formulario.controls.codigo.setValue('xx');
    expect(componente.mostrarError('codigo')).toBeFalse();
  });

  it('muestra el error cuando el control inválido ya fue tocado', () => {
    componente.formulario.controls.codigo.setValue('xx');
    componente.formulario.controls.codigo.markAsTouched();
    expect(componente.mostrarError('codigo')).toBeTrue();
    expect(componente.mensajesDe('codigo').length).toBeGreaterThan(0);
  });

  it('no invoca el servicio y marca todos los controles como tocados al enviar un formulario inválido', () => {
    const espia = spyOn(servicio, 'registrarProducto').and.callThrough();

    componente.enviar();

    expect(espia).not.toHaveBeenCalled();
    expect(componente.intentoEnvio()).toBeTrue();
    expect(Object.values(componente.formulario.controls).every((c) => c.touched)).toBeTrue();
  });

  it('invoca el servicio con el producto cuando el formulario es válido', fakeAsync(() => {
    const espia = spyOn(servicio, 'registrarProducto').and.callThrough();

    componente.formulario.setValue(DATOS_VALIDOS);
    expect(componente.formulario.valid).toBeTrue();

    componente.enviar();
    tick(600);

    expect(espia).toHaveBeenCalledTimes(1);
    const enviado = espia.calls.mostRecent().args[0];
    expect(enviado.codigo).toBe('ABC-1234');
    expect(enviado.nombre).toBe('Café molido');
    expect(enviado.precio).toBe(18500.5);
    expect(enviado.categoria).toBe('Alimentos');
    expect(enviado.stock).toBe(120);
    expect(enviado.activo).toBeTrue();
    expect('id' in enviado).toBeFalse();
  }));

  // El servicio responde con delay(600), por eso estos casos usan fakeAsync y tick.
  it('muestra el mensaje de éxito y limpia el formulario tras un envío válido', fakeAsync(() => {
    componente.formulario.setValue(DATOS_VALIDOS);
    componente.enviar();
    tick(600);
    fixture.detectChanges();

    expect(componente.mensajeExito()).toContain('ABC-1234');
    expect(componente.formulario.pristine).toBeTrue();
    expect(componente.formulario.controls.activo.value).toBeTrue();
    expect(componente.enviando()).toBeFalse();
  }));

  it('emite el producto registrado para que la lista se actualice', fakeAsync(() => {
    const emissions: unknown[] = [];
    componente.productoRegistrado.subscribe((producto) => emissions.push(producto));

    componente.formulario.setValue(DATOS_VALIDOS);
    componente.enviar();
    tick(600);

    expect(emissions.length).toBe(1);
    expect(servicio.listarProductos().length).toBe(1);
  }));

  it('reiniciar devuelve el formulario a su estado inicial y borra los mensajes', fakeAsync(() => {
    componente.formulario.setValue(DATOS_VALIDOS);
    componente.enviar();
    tick(600);
    fixture.detectChanges();

    componente.reiniciar();

    expect(componente.formulario.pristine).toBeTrue();
    expect(componente.mensajeExito()).toBe('');
    expect(componente.intentoEnvio()).toBeFalse();
  }));

  it('cuenta los campos inválidos', () => {
    expect(componente.contarCamposInvalidos()).toBe(6);
    componente.formulario.setValue(DATOS_VALIDOS);
    expect(componente.contarCamposInvalidos()).toBe(0);
  });

  describe('plantilla', () => {
    const consulta = (selector: string) =>
      (fixture.nativeElement as HTMLElement).querySelector(selector);

    const consultaAll = (selector: string) =>
      (fixture.nativeElement as HTMLElement).querySelectorAll(selector);

    it('el bloque de errores no existe mientras el control no se toca', () => {
      expect(consulta('#error-nombre')).toBeNull();
    });

    it('*ngIf muestra el bloque y *ngFor pinta un elemento por error al enviar inválido', () => {
      componente.enviar();
      fixture.detectChanges();

      expect(componente.intentoEnvio()).toBeTrue();
      expect(consulta('#error-nombre li')).not.toBeNull();
      expect(consultaAll('#error-nombre li').length).toBe(
        componente.mensajesDe('nombre').length
      );
    });

    it('el control inválido y tocado recibe la clase de campo resaltado', () => {
      componente.formulario.controls.nombre.setValue('Ca');
      componente.formulario.controls.nombre.markAsTouched();
      fixture.detectChanges();

      const campo = (fixture.nativeElement as HTMLElement).querySelectorAll('.campo')[1];
      expect(campo.classList).toContain('campo--invalido');
    });

    it('la lista de productos muestra el estado vacío sin registros', () => {
      const componenteLista = TestBed.createComponent(ListaProductos);
      componenteLista.componentRef.setInput('productos', []);
      componenteLista.detectChanges();

      const elemento = (componenteLista.nativeElement as HTMLElement).querySelector('.lista__vacia');
      expect(elemento?.textContent).toContain('Todavía no hay productos');
    });
  });
});

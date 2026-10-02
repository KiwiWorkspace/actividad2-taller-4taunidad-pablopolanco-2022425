import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';

import { App } from './app';
import { ProductoForm } from './components/producto-form/producto-form';
import { ProductoService } from './services/producto.service';

/** Prueba de integración: escribe en los inputs reales, envía y revisa la tabla. */
describe('App integración', () => {
  let fixture: ComponentFixture<App>;
  let app: App;
  let servicio: ProductoService;

  const escribir = (id: string, valor: string) => {
    const input = fixture.nativeElement.querySelector(`#${id}`) as HTMLInputElement;
    input.value = valor;
    input.dispatchEvent(new Event('input'));
  };

  // Con [ngValue] el value del option es algo tipo "2: Alimentos", no el texto.
  const elegirCategoria = (texto: string) => {
    const select = fixture.nativeElement.querySelector('#categoria') as HTMLSelectElement;
    const opcion = Array.from(select.options).find((o) => o.textContent?.trim() === texto);
    if (!opcion) {
      throw new Error(`No se encontró la categoría ${texto}`);
    }
    select.value = opcion.value;
    select.dispatchEvent(new Event('change'));
  };

  const completar = () => {
    escribir('codigo', 'ABC-1234');
    escribir('nombre', 'Café molido');
    escribir('descripcion', 'Café de origen Colombia con molienda fina.');
    escribir('precio', '18500.50');
    escribir('stock', '120');
    elegirCategoria('Alimentos');
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [App] }).compileComponents();

    fixture = TestBed.createComponent(App);
    app = fixture.componentInstance;
    servicio = TestBed.inject(ProductoService);
    fixture.detectChanges();
  });

  it('el estado inicial muestra la lista vacía', () => {
    expect(fixture.nativeElement.querySelector('.lista__vacia')).not.toBeNull();
    expect(fixture.nativeElement.querySelectorAll('.tabla tbody tr').length).toBe(0);
  });

  it('App y el formulario comparten la instancia del servicio', () => {
    const depuracion = fixture.debugElement.query(
      (de) => de.componentInstance instanceof ProductoForm
    );
    const servicioDelFormulario = (depuracion.componentInstance as ProductoForm)['productoService'];
    expect(servicioDelFormulario).toBe(servicio);
  });

  it('registra un producto desde el DOM y lo muestra en la tabla', fakeAsync(() => {
    completar();
    fixture.detectChanges();

    const form = fixture.nativeElement.querySelector('form') as HTMLFormElement;
    form.dispatchEvent(new Event('submit'));
    fixture.detectChanges();

    // Antes de los 600 ms el servicio ya guardó el producto, pero aún no llegó la respuesta.
    expect(servicio.listarProductos().length).toBe(1);
    expect(app.productos().length).toBe(0);

    tick(600);
    fixture.detectChanges();

    const filas = fixture.nativeElement.querySelectorAll('.tabla tbody tr');
    expect(filas.length).toBe(1);
    expect(app.productos().length).toBe(1);

    const texto = fixture.nativeElement.querySelector('.tabla tbody tr').textContent ?? '';
    expect(texto).toContain('ABC-1234');
    expect(texto).toContain('Café molido');
    expect(texto).toContain('Alimentos');
    expect(texto).toContain('120');
  }));

  it('un envío inválido no guarda nada en el servicio', fakeAsync(() => {
    escribir('codigo', 'xx');
    const form = fixture.nativeElement.querySelector('form') as HTMLFormElement;
    form.dispatchEvent(new Event('submit'));
    fixture.detectChanges();
    tick(600);
    fixture.detectChanges();

    expect(servicio.listarProductos().length).toBe(0);
    expect(app.productos().length).toBe(0);
  }));

  it('acumula varios envíos válidos', fakeAsync(() => {
    for (const codigo of ['ABC-1234', 'DEF-5678']) {
      completar();
      escribir('codigo', codigo);
      fixture.detectChanges();
      const form = fixture.nativeElement.querySelector('form') as HTMLFormElement;
      form.dispatchEvent(new Event('submit'));
      fixture.detectChanges();
      tick(600);
      fixture.detectChanges();
    }

    expect(fixture.nativeElement.querySelectorAll('.tabla tbody tr').length).toBe(2);
  }));
});

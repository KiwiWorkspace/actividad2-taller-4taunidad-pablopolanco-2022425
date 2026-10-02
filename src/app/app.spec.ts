import { TestBed } from '@angular/core/testing';

import { App } from './app';
import { ProductoService } from './services/producto.service';

describe('App', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App]
    }).compileComponents();
  });

  it('crea la aplicación', () => {
    const fixture = TestBed.createComponent(App);
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('muestra el formulario y la lista de productos', () => {
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();

    const compilado = fixture.nativeElement as HTMLElement;
    expect(compilado.querySelector('app-producto-form')).toBeTruthy();
    expect(compilado.querySelector('app-lista-productos')).toBeTruthy();
  });

  // El recorrido completo por el DOM está en integracion.spec.ts; aquí solo el estado inicial.
  it('la lista arranca vacía', () => {
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();

    expect(fixture.componentInstance.productos()).toEqual([]);
  });
});

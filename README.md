# Registro de productos

Aplicación de una sola página hecha con Angular 20 que registra productos mediante un formulario
reactivo. Cada campo tiene sus propias validaciones, los errores aparecen debajo del control que
los produce y el envío solo llega al servicio cuando el formulario completo es válido. Debajo del
formulario hay un panel que muestra el estado del formulario y de cada control, y una tabla con los
productos que se han registrado en la sesión.

## Requisitos y comandos

Hace falta Node.js 20.19 o superior y npm 10 o superior.

```bash
npm install
npm start
npm run build
npm test -- --watch=false --browsers=ChromeHeadless
```

`npm start` levanta la aplicación en http://localhost:4200. Conviene usar los scripts de
`package.json`, que usan la CLI local de Angular, en lugar de escribir `ng serve` o `ng build` a
mano: el comando `ng` global del equipo apunta a otra versión.

## Modelo de datos

`ProductoFormulario` es lo que captura el formulario: `codigo`, `nombre`, `descripcion`, `precio`
como número, `categoria` como unión de cinco literales, `stock` como número y `activo` como
booleano. `Producto` extiende esa interfaz y suma `id` y `fechaRegistro`, que asigna el servicio al
recibir el objeto, de modo que el formulario nunca inventa esos datos.

## Validaciones por campo

| Campo | Validaciones |
|---|---|
| Código SKU | obligatorio, máximo 12 caracteres, formato `ABC-1234` (tres letras en mayúscula, guion y de 4 a 8 caracteres) |
| Nombre | obligatorio, entre 3 y 50 caracteres, solo letras, números, espacios, punto, apóstrofo o guion |
| Descripción | obligatoria, entre 10 y 300 caracteres |
| Precio | obligatorio, mayor que cero, hasta 999999.99, hasta seis cifras enteras y dos decimales |
| Categoría | obligatoria, se elige de una lista cerrada de cinco opciones |
| Stock | obligatorio, entre 0 y 100000, número entero sin decimales ni signo negativo |
| Activo | sin validaciones, es una casilla marcada por defecto |

Los límites, los patrones y los textos de error viven en `src/app/models/formulario.model.ts`, en
`LIMITES`, `PATRONES` y `MENSAJES_ERROR`.

## Estados de control y mensajes de error

Cada control expone sus errores en `control.errors`, cuyas claves son `required`, `minlength`,
`maxlength`, `min`, `max` o `pattern`. `ProductoForm` traduce ese objeto a texto con dos métodos que
la plantilla usa: `mostrarError` decide si el error se ve y `mensajesDe` devuelve la lista de
mensajes de las claves activas.

Un control solo muestra su error cuando es inválido y ya fue tocado, o cuando el usuario intentó
enviar el formulario. Así, escribir un valor inválido sin salir del campo no molesta con mensajes,
pero el panel de estado sí lo marca. El campo marcado recibe la clase `campo--invalido`, que pinta
el borde en salmon y un fondo muy claro.

En el HTML cada campo tiene un `ul` con `*ngIf="mostrarError('campo')"` que muestra u oculta el
bloque de errores, y dentro un `*ngFor="let mensaje of mensajesDe('campo')"` que recorre los errores
activos para pintar un `li` por cada uno. Con `*ngFor` se genera también la lista de categorías del
select y la lista de productos de la tabla.

`EstadoFormulario` recibe el `FormGroup` y los controles, y muestra el estado general del formulario
(`valid`, `invalid`, `touched`, `untouched`, `dirty` y `pristine`) y el de cada control (`valid`,
`invalid`, `touched`, `dirty`). Todo sale de propiedades del `FormGroup`, sin copias ni estado
propio. El estado `pristine` tiene además una función práctica: el botón Limpiar formulario se
deshabilita cuando el formulario está prístino y no hay mensajes ni intentos de envío, porque en
ese caso no hay nada que deshacer.

## Envío al servicio

`ProductoService` está declarado con `@Injectable({ providedIn: 'root' })` y llega al componente por
inyección en el constructor. Su método `registrarProducto` recibe el objeto del formulario, le
asigna `id` y `fechaRegistro`, lo agrega a un arreglo en memoria, lo imprime en la consola con
`console.table` y devuelve un `Observable` con `delay(600)` para simular la latencia de un backend.

El componente no llama al servicio por su cuenta. En `enviar()` primero revisa
`formulario.invalid`: si es inválido marca todos los controles con `markAsTouched()`, enciende la
bandera `intentoEnvio` para que aparezcan los errores y termina sin invocar el servicio. Si es
válido arma el objeto con `getRawValue()`, llama a `registrarProducto` y, al llegar la respuesta,
muestra el mensaje de éxito, limpia el formulario y emite el producto con `output()`.

La tabla final no se arma con lo que envió el formulario: `App` recibe el evento y vuelve a pedirle
al servicio su arreglo con `listarProductos()`. Lo que aparece en pantalla es entonces la prueba de
que el servicio recibió y guardó el dato.

## Pruebas automáticas

Las pruebas usan Jasmine con Karma y cubren el servicio, el formulario, el componente raíz, el panel
de estado y una prueba de integración que monta la aplicación completa y maneja los inputs reales
del DOM. Como el servicio responde con `delay(600)`, los casos que esperan la respuesta usan
`fakeAsync` y `tick`.

Se ejecutaron 41 pruebas con el comando indicado arriba y las 41 pasaron.

## Pruebas manuales

| Caso | Datos | Resultado esperado | Resultado obtenido |
|---|---|---|---|
| Formulario vacío y se presiona Registrar producto | Ningún dato | No se registra nada. Aparecen los seis errores obligatorios y los campos quedan resaltados. | Correcto |
| Código en minúsculas | `ab-12` | Error de formato en el código y el formulario sigue bloqueado. | Correcto |
| Nombre de dos caracteres | `Ca` | Error de longitud mínima en el nombre. | Correcto |
| Descripción corta | `Corta` | Error de longitud mínima en la descripción. | Correcto |
| Precio en cero | `0` | Error de precio mínimo y el envío se bloquea. | Correcto |
| Precio con tres decimales | `10.555` | Error de formato por los tres decimales. | Correcto |
| Categoría sin seleccionar | Se deja la opción inicial | Error de categoría obligatoria. | Correcto |
| Stock con decimales | `10.5` | Error de stock entero. | Correcto |
| Valor inválido sin tocar el campo | Se escribe un valor inválido y no se sale del campo | No se muestra el error; el panel de estado sí marca el control como inválido. | Correcto |
| Tocar y salir de un campo inválido | Se escribe un valor inválido y se sale | El campo queda resaltado con su mensaje debajo. | Correcto |
| Todos los datos válidos | Código `ABC-1234`, nombre, descripción, precio, categoría, stock y Activo marcado | Se registra el producto, aparece la confirmación, el formulario queda limpio y la tabla suma una fila. | Correcto |
| Registro con Activo desmarcado | Datos válidos con Activo sin marcar | Se registra igual y la tabla muestra la etiqueta Inactivo. | Correcto |
| Botón Limpiar deshabilitado sin cambios | Formulario recién cargado | El botón está deshabilitado y se habilita al modificar o enviar algo. | Correcto |

## Diseño

La paleta está definida en `src/styles.css` como variables CSS: `--verde-oscuro` #0d5257 para la
cabecera, la barra de navegación y el pie, `--verde` #0a8080 para botones y acentos activos,
`--salmon` #f08a7c para bordes de campo inválido, iconos de error y la etiqueta de inactivo, y
`--durazno` #ffc8bc como fondo de los mensajes de error. `--salmon-texto` #9c3324 es la variante
oscurecida del salmon que se usa como color de texto de error, porque el salmon puro sobre blanco
no alcanza un contraste suficiente. Los iconos salen de `bootstrap-icons`, agregado en
`angular.json` entre los estilos globales.

## Nota sobre *ngIf y *ngFor

Angular 20 marca `NgIf` y `NgFor` como obsoletas y recomienda la sintaxis `@if` y `@for`. Este
proyecto los usa a propósito porque la actividad los pide de forma explícita, y ambos se importan
desde `@angular/common` en los componentes que los necesitan.

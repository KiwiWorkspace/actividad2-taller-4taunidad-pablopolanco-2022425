# Registro de productos

Aplicación de una sola página en Angular 20 que registra productos mediante un formulario reactivo.
Cada campo tiene sus propias validaciones, los errores se muestran debajo del control que los
produce y el envío solo llega al servicio cuando el formulario completo es válido.

## Requisitos

- Node.js 20.19 o superior.
- npm 10 o superior.

## Instalación y ejecución

```bash
npm install
npm start
```

La aplicación queda disponible en http://localhost:4200.

Para compilar y para correr las pruebas:

```bash
npm run build
npm test -- --watch=false --browsers=ChromeHeadless
```

El proyecto se creó con Angular CLI 20.3.37. El comando `ng` global del equipo apunta a otra
versión, así que conviene ejecutar los scripts de `package.json` (que usan la CLI local) en lugar de
`ng serve` o `ng build` escritos a mano.

## Estructura

```
src/app/
  models/
    producto.model.ts      modelo de datos del producto y de la respuesta del servicio
    formulario.model.ts    límites, patrones, mensajes de error y tipos del formulario
  services/
    producto.service.ts    servicio inyectable que simula el backend
  components/
    producto-form/         formulario reactivo, mensajes de error y botón de envío
    estado-formulario/     panel con el estado del formulario y de cada control
    lista-productos/       tabla con los productos registrados en la sesión
  app.ts                   componente raíz, inyecta el servicio y arma la lista
```

## Modelo de datos

`ProductoFormulario` representa lo que captura el formulario: `codigo`, `nombre`, `descripcion`,
`precio` (número), `categoria` (unión de literales), `stock` (número) y `activo` (booleano).
`Producto` extiende esa interfaz y agrega `id` y `fechaRegistro`, que asigna el servicio al
recibir el objeto, de modo que el formulario nunca tiene que inventar esos datos.

## Validaciones

| Campo | Validaciones |
|---|---|
| Código SKU | obligatorio, máximo 12 caracteres, formato `ABC-1234` (tres letras, guion y de 4 a 8 caracteres) |
| Nombre | obligatorio, entre 3 y 50 caracteres, solo letras, números, espacios, punto, apóstrofo o guion |
| Descripción | obligatoria, entre 10 y 300 caracteres |
| Precio | obligatorio, mayor que 0.01, máximo 999999.99, hasta seis cifras enteras y dos decimales |
| Categoría | obligatoria, se elige de una lista cerrada de cinco opciones |
| Stock | obligatorio, entre 0 y 100000, número entero sin decimales ni signo negativo |
| Activo | sin validaciones, es una casilla marcada por defecto |

## Mensajes de error

Cada control expone sus errores en `control.errors`, un objeto cuyas claves son `required`,
`minlength`, `maxlength`, `min`, `max` o `pattern`. El componente `ProductoForm` traduce ese
objeto a texto usando el diccionario `MENSAJES_ERROR` y expone dos métodos a la plantilla:
`mostrarError` decide si el error se ve y `mensajesDe` devuelve la lista de textos.

En el HTML cada campo tiene un `ul` con `*ngIf="mostrarError('campo')"` para mostrar u ocultar el
bloque, y dentro un `*ngFor="let mensaje of mensajesDe('campo')"` que recorre los errores activos
para pintar un `li` por cada uno. Un control solo muestra su error cuando es inválido y ya fue
tocado, o cuando el usuario intentó enviar el formulario. Mientras el campo no se toque, escribir
un valor inválido no molesta con mensajes.

El campo inválido y tocado recibe la clase `campo--invalido`, que pinta el borde en salmon
(#F08A7C) y un fondo muy claro. El texto del error usa el salmon oscurecido #9C3324 porque el
salmon puro sobre blanco no alcanza un contraste suficiente para leerse.

## Estados del formulario

`EstadoFormulario` recibe el `FormGroup` y la lista de controles, y muestra con `*ngFor` el estado
general (`valid`, `invalid`, `touched`, `untouched`, `dirty`, `pristine`) y el de cada control
(`valid`, `invalid`, `touched`, `dirty`). Cada dato viene de una propiedad del `FormGroup`, sin
copias ni estado propio, así que lo que se ve en pantalla es exactamente lo que Angular calcula.

## Envío al servicio

`ProductoService` está declarado con `@Injectable({ providedIn: 'root' })` y llega al componente
por inyección en el constructor. Su método `registrarProducto` recibe el objeto del formulario,
le asigna `id` y `fechaRegistro`, lo agrega a un arreglo en memoria, lo imprime en la consola con
`console.table` y devuelve un `Observable` con `delay(600)` para simular la latencia de un backend.

El componente no llama al servicio por su cuenta. En `enviar()` primero revisa
`formulario.invalid`: si es inválido marca todos los controles con `markAsTouched()`, activa la
bandera `intentoEnvio` para que aparezcan los errores y termina sin invocar el servicio. Si es
válido arma el objeto con `getRawValue()`, llama a `registrarProducto` y, al llegar la respuesta,
muestra el mensaje de éxito, limpia el formulario y emite el producto con `output()`.

La lista final no se arma con lo que envió el formulario: `App` recibe el evento y vuelve a
pedirle al servicio su arreglo con `listarProductos()`, así que lo que aparece en pantalla es la
prueba de que el servicio recibió y guardó el dato. En la consola se ve el mismo producto en tabla
y el total almacenado.

## Pruebas

Las pruebas automáticas usan Jasmine con Karma y cubren el formulario, el servicio y el
componente raíz. El servicio tiene un retardo de 600 ms, por eso los casos que esperan la respuesta
usan `fakeAsync` y `tick`.

```bash
npm test -- --watch=false --browsers=ChromeHeadless
```

Casos cubiertos por archivo:

- `producto.service.spec.ts`: almacén vacío al inicio, guardado y respuesta exitosa, id incremental
  y fecha de registro, retardo de 600 ms, limpieza del almacén.
- `producto-form.spec.ts`: formulario inválido en el estado inicial, `activo` marcado por defecto,
  `pattern` del código, `minlength` y `maxlength` del nombre, `minlength` de la descripción, `min` y
  `pattern` del precio, `pattern` y `min` del stock, `required` de la categoría, error oculto
  mientras el control no se toca, error visible al tocar, envío inválido que no llama al servicio y
  marca todos los controles, envío válido que sí lo llama con el producto esperado, mensaje de
  éxito y limpieza del formulario, emisión del producto, `reiniciar` y conteo de campos inválidos.
- `app.spec.ts`: creación de la aplicación, presencia del formulario y la lista, y lista vacía al
  inicio.
- `integracion.spec.ts`: monta la aplicación completa y maneja los inputs reales del DOM. Verifica
  que el estado inicial muestra la lista vacía, que `App` y el formulario comparten la instancia
  del servicio, que un envío válido desde el DOM termina en una fila de la tabla con el código, el
  nombre, la categoría y el stock correctos, que un envío inválido no guarda nada, y que dos envíos
  válidos seguidos dejan dos filas.

Este archivo de integración se añadió después de encontrar un fallo que las pruebas por componente
no detectaban: la lista no mostraba el producto registrado. La causa estaba en la expresión
`track producto.id` del `*ngFor`, que en Angular 20.3 lanza un `TypeError` al evaluar el track y
deja la tabla vacía. Se resolvió usando `trackBy: identificarProducto`. Las pruebas por componente
pasaban igual porque montaban `ListaProductos` sin pasarle productos, así que el `*ngFor` nunca
llegaba a ejecutarse sobre una fila real.

### Casos manuales

| Caso | Datos | Resultado esperado |
|---|---|---|
| 1 | Formulario vacío y se presiona Registrar producto | No se registra nada. Aparecen los seis errores obligatorios y los controles quedan con borde salmon. El servicio no recibe llamadas. |
| 2 | Código `ab-12` en minúsculas | Error de formato en el campo de código. El formulario sigue bloqueado. |
| 3 | Nombre `Ca` | Error de longitud mínima en el nombre. |
| 4 | Nombre de 51 caracteres | Error de longitud máxima en el nombre. |
| 5 | Nombre `Café &quot;tostado&quot;` | Error de caracteres permitidos por el patrón. |
| 6 | Descripción `Corta` | Error de longitud mínima en la descripción. |
| 7 | Precio `0` | Error de precio mínimo, el formulario no se envía. |
| 8 | Precio `10.555` | Error de formato por los tres decimales. |
| 9 | Precio `1000000` | Error de precio máximo. |
| 10 | Categoría sin seleccionar | Error de categoría obligatoria. |
| 11 | Stock `10.5` | Error de stock entero. |
| 12 | Stock `-5` | Error de stock mínimo. |
| 13 | Escribir un valor inválido sin tocar el campo | Mientras no se toque el control no se muestra el error; el panel de estado sí lo marca como inválido. |
| 14 | Tocar y salir de un campo inválido | El campo queda con borde salmon y su mensaje debajo. |
| 15 | Todos los datos válidos | Se registra el producto, aparece el mensaje de confirmación, el formulario queda limpio con `activo` marcado y la tabla suma una fila con código, precio, stock y fecha. En la consola aparece el producto en tabla y el total almacenado. |
| 16 | Registro válido con `activo` desmarcado | Se registra igual, la tabla muestra la etiqueta Inactivo en salmon. |
| 17 | Presionar Limpiar formulario | El formulario vuelve a su estado inicial, sin errores y sin mensajes. |
| 18 | Dos envíos válidos seguidos | La tabla muestra dos filas con id 1 y 2, y fechas distintas. |
| 19 | Ventana estrecha | La rejilla pasa a una sola columna y los botones se apilan. |

## Diseño

La paleta está definida en `src/styles.css` como variables CSS: `--verde-oscuro` #0D5257 para la
cabecera, la barra de navegación y el pie, `--verde` #0A8080 para botones y acentos activos,
`--salmon` #F08A7C para bordes de campo inválido, iconos de error y la etiqueta de inactivo, y
`--durazno` #FFC8BC como fondo de los mensajes de error. `--salmon-texto` #9C3324 es la variante
oscurecida del salmon que se usa como color de texto de error por contraste. Los iconos salen de
`bootstrap-icons`, agregado en `angular.json` entre los estilos globales.

## Nota sobre *ngIf y *ngFor

Angular 20 marca `NgIf` y `NgFor` como obsoletas y recomienda la sintaxis `@if` y `@for`. Este
proyecto los usa a propósito porque la actividad los pide de forma explícita, y ambos se importan
desde `@angular/common` en los componentes que los necesitan.

# Vesta

PWA personal de escritorio y teléfono: alarmas, cronómetro, presupuesto, calendario,
armario inteligente y rutinas de gym. Todo en JavaScript, CSS y HTML puros, sin
frameworks ni dependencias de red: una vez instalada funciona completa sin conexión.

Publicada con GitHub Pages desde la raíz del repositorio.

---

## Estructura

| Archivo | Qué es |
|---|---|
| `Vesta.html` | La aplicación completa: estilos, marcado y lógica en un solo archivo |
| `index.html` | Redirección a `Vesta.html` (lo que sirve GitHub Pages en la raíz) |
| `sw.js` | Service Worker: caché offline y notificaciones |
| `manifest.json` | Manifiesto PWA: nombre, colores, iconos, pantalla de inicio |
| `icon-192.png` / `icon-512.png` | Iconos de instalación |
| `.editorconfig` | Formato uniforme del código entre máquinas |
| `.gitignore` | Ignora `.vs/` y demás estado local del IDE |

`Vesta.html` está dividido internamente en secciones numeradas. Buscá el comentario
`ÍNDICE GENERAL DEL JAVASCRIPT` para ver el mapa completo, y dentro de cada módulo
(`ARMARIO INTELIGENTE`, `RUTINAS DE GYM`) hay un índice propio.

---

## Abrirlo en Visual Studio 2026

No hay `.sln` ni `.csproj` a propósito: es un sitio estático, así que el modo
correcto es abrir la carpeta, no un proyecto.

1. **Archivo → Abrir → Carpeta** y elegí la carpeta `Vesta`.
2. En el Explorador de soluciones vas a ver los archivos tal cual están en disco.
3. Para probar: clic derecho sobre `Vesta.html` → **Ver en el explorador**
   (`Ctrl+Shift+W`).

> El Service Worker y la instalación como PWA solo funcionan sobre `http(s)://`,
> con `sw.js` al lado del HTML. Para probar eso, levantá un servidor local en la
> carpeta (`python -m http.server 5500`) y entrá a `http://localhost:5500`.
> En GitHub Pages funciona directo.
>
> Si abrís el archivo suelto o lo ves en una vista previa que lo sirve desde otro
> dominio, el navegador busca `sw.js`, no lo encuentra y antes tiraba un warning rojo
> que parecía un error de Vesta. No lo era: ahora la app lo explica en la consola con
> un mensaje informativo y sigue funcionando, solo que sin caché offline.

### Ponerlo bajo Git desde Visual Studio

Si arrancás un repositorio nuevo:

1. **Git → Crear repositorio Git**.
2. Elegí *GitHub*, cuenta `santivillamon07-cell`, nombre `Vesta`.
3. Crear y subir.

Si ya tenés clonado `santivillamon07-cell/Vesta` (que es el caso), no crees uno
nuevo: copiá estos archivos dentro de la carpeta clonada, revisá los cambios en
**Git → Cambios de Git** y hacé commit ahí. Así conservás el historial y GitHub
Pages sigue publicando sin tocar nada.

### Publicar los cambios

GitHub Pages sirve la rama configurada. Con hacer commit y push alcanza.
El `sw.js` usa estrategia *network-first* para el HTML, así que la versión nueva
se ve en la siguiente carga, sin tener que borrar la caché a mano.
Cada vez que cambie algo estructural, subí el número en `CACHE_NAME`
(va en `vesta-cache-v3`).

---

## Qué subir a Git

Estos nueve, todos en la raíz del repositorio:

```
Vesta.html        la app entera
index.html        redirección (lo que sirve GitHub Pages en la raíz)
sw.js             caché offline y notificaciones
manifest.json     manifiesto PWA
icon-192.png      icono de instalación
icon-512.png      icono de instalación
README.md         esto
.gitignore        qué NO se sube
.editorconfig     formato uniforme del código
```

**Lo que nunca va al repositorio** (ya está en `.gitignore`):

- `.vs/` — estado local de Visual Studio: índices, posición de ventanas, puntos de
  interrupción. Es por máquina y pesa bastante.
- `*.user`, `*.suo` — configuración personal del IDE.
- `node_modules/`, `bin/`, `obj/` — no aplican hoy, pero quedan cubiertos por si más
  adelante se agrega alguna herramienta.
- Archivos del sistema: `Thumbs.db`, `.DS_Store`, `Desktop.ini`.

Si Visual Studio te ofrece subir `.vs/`, decile que no: `.gitignore` ya lo cubre, pero
si la carpeta quedó rastreada de antes hay que sacarla a mano con
`git rm -r --cached .vs`.

Antes de cada push conviene mirar la pestaña **Cambios de Git** y confirmar que solo
aparecen archivos de esa lista. Un repositorio limpio es lo primero que mira alguien
que llega al proyecto.

---

## Sistema de movimiento

Toda la animación sale de los mismos tokens, definidos en `:root` dentro de
`Vesta.html` (buscá `TANDA 3 — Movimiento fluido`):

```css
--ease-glide    /* expo-out: entra rápido y frena suave  */
--ease-spring   /* muelle corto, sobrepasa apenas        */
--ease-emph     /* énfasis: arranque decidido            */
--ease-exit     /* salidas                               */
--dur-1 … --dur-4
--stag          /* separación entre ítems de una cascada */
```

Reglas de la casa:

- Lo que se mueve lo hace con `transform` y `opacity`. Nada de animar `width`,
  `top` o `left`: eso obliga al navegador a recalcular el layout en cada cuadro.
- Duraciones y curvas salen de tokens, nunca de números sueltos.
- Nada se anima en bucle infinito salvo que comunique estado vivo: una alarma
  sonando, el cronómetro corriendo.
- Todo respeta `prefers-reduced-motion`.

### Piezas y de dónde salen

| Pieza | Referencia | Dónde se ve |
|---|---|---|
| Indicador que se desliza entre pestañas | Barra de iOS, navegación de Linear | Barra inferior |
| Transición direccional entre secciones | *Shared axis X* de Material | Al cambiar de pestaña |
| Onda que nace en el punto del toque | Ripple de Material | Botones de acción |
| Cifras que recorren la diferencia | Importes de Stripe | Monto disponible del presupuesto |
| Anillo que se dibuja desde cero | Anillos de Apple Fitness | Donut del presupuesto |
| Hoja con muelle y contenido escalonado | Diálogos de Vercel, hojas de iOS | Modales y hoja del armario |
| Aviso que entra con muelle y se retira | Toasts de Linear | Banner superior |
| Encabezado que cede al hacer scroll | Títulos grandes de iOS | Rótulo de cada sección |
| Botón flotante que gira a "×" | FAB de Material | Armario |
| Engranajes que aceleran con el trabajo | Relojería real: relación 24:12 | Fondo de toda la app |
| Salida de lo eliminado | Listas de iOS / Gmail | Cualquier tarjeta que se borra |

### Agregar una lista nueva con cascada

No hace falta escribir CSS: poné la clase `stagger` en el contenedor y sus hijos
entran en secuencia. Con `stagger pop` entran con escala en vez de deslizamiento.

```html
<div id="miLista" class="stagger"></div>
```

---

## El mecanismo (fondo)

El fondo de Vesta no es una textura: es una máquina. Tres engranajes dibujados con
geometría real —dientes trapezoidales, radios, cubo— giran detrás del contenido a un
5,5 % de opacidad. No se miran, se sienten.

El engranaje grande y el chico **están engranados de verdad**: 24 y 12 dientes con el
mismo módulo, centros a la distancia exacta de sus radios primitivos. Por eso el chico
gira al doble de velocidad y en sentido contrario — 72 s contra 36 s. Si girara a
cualquier otra velocidad, el ojo notaría que los dientes "patinan" sin poder explicar
por qué.

**Calibración.** La primera versión giraba a 240 s por vuelta: 1,5°/s. Matemáticamente
se mueve, pero el ojo no registra algo tan lento — parecía una calcomanía. A 5°/s y
10°/s se lee como una máquina andando, sin robar atención.

Si el fondo te resulta mucho o poco, **no toques los engranajes uno por uno**: en
`:root` hay una sola perilla.

```css
--mech-op: .09;   /* .04 apenas se intuye · .09 actual · .16 protagonista */
```

Lo que lo separa de un adorno: **el mecanismo responde a la app.**

| Estado | Qué hace la máquina |
|---|---|
| En reposo | 1 vuelta cada 72 s (≈5°/s) |
| Cronómetro corriendo | acelera a 5× |
| Guardar, generar, sellar | golpe de 8–11× por un segundo y el latón se enciende |
| Alarma sonando | 3× sostenido, con brillo ámbar |
| App en segundo plano | se detiene |

Los engranajes giran con la **Web Animations API**, no con CSS, y por un motivo concreto:
`playbackRate` cambia la velocidad **sin saltar de posición**. Con `animation-duration`
de CSS, pasar de 240 s a 40 s haría que el engranaje salte al ángulo que le tocaría —
se ve como un tirón. Así acelera desde donde está, como una máquina real. Si el navegador
no soporta WAAPI, queda la animación CSS de respaldo.

### Lo que se mueve

- **Péndulo regulador.** Los engranajes giran tan lento que casi no se los ve moverse;
  el péndulo sí. Cuelga del mismo mecanismo, así que también acelera cuando la app
  trabaja. Oscila ±6,5° desde su pivote cada 7,2 s.
- **Parallax.** Cada pieza se desplaza a distinta velocidad mientras scrolleás
  (`data-depth` en el HTML): la de atrás menos, la de adelante más y una al revés. Eso
  es lo que produce profundidad. Se escribe en la variable `--py` del *slot*, no en el
  `transform` del engranaje, porque ahí manda la rotación.
- **Empujón al cambiar de sección.** La máquina se reacomoda 7 px en el sentido del
  viaje y vuelve sola. Casi no se percibe, pero hace que el fondo se sienta parte del
  movimiento y no una calcomanía pegada atrás.
- **Vaho de caldera** que deriva cada 54 s y **seis pavesas** que suben y se apagan.
  Seis, no sesenta.

Cada engranaje vive dentro de un *slot*: el slot se desplaza, el SVG de adentro gira.
Separar las dos cosas evita que una transformación pise a la otra.

### La firma de cada pestaña

Cada sección saluda a su manera cada vez que se abre: la campana se sacude, el
cronómetro da una vuelta completa, la pesa hace una repetición, la hoja del calendario
pasa, la percha se balancea, el billete se voltea. Medio segundo, no se repite sola.

Para agregar la firma de una pestaña nueva alcanza con escribir su `@keyframes` en el
CSS (buscá *La firma de cada pestaña*). El JavaScript no hay que tocarlo: reinicia la
clase `.sig` sobre el botón y el CSS decide el gesto.

Para enganchar un proceso nuevo al mecanismo:

```js
wrapAfter('miFuncion', () => Mech.burst(8, 850));
```

---

## Privacidad

Vesta no tiene servidores, ni cuentas, ni analítica. Eso es una promesa; el `<head>`
tiene la prueba:

```
connect-src 'none'   → ni fetch, ni XHR, ni WebSocket, ni beacon
default-src 'self'   → nada de CDNs, fuentes o scripts externos
form-action 'none'   → ningún formulario puede enviarse a ningún lado
```

Lo hace cumplir el navegador, no el código. Aunque una línea intentara mandar datos
afuera, la conexión no saldría. Las fotos del clóset y los audios de las alarmas viven
como Base64 dentro del dispositivo, por eso `img-src` y `media-src` permiten `data:`.

El engranaje de la cabecera de Alarmas abre la placa **Mecanismo**: qué guarda Vesta,
dónde lo guarda y cuánto espacio ocupa. El dato de espacio sale de
`navigator.storage.estimate()`, que es una lectura local del propio navegador.

Si algún día se agrega una función que sí necesite red, hay que abrir `connect-src` a
mano. Es a propósito: que cueste es la idea.

---

## Animaciones de proceso

Cada acción que cambia datos tiene su propio gesto, y ninguna reescribe la lógica del
módulo: el motor de movimiento envuelve las funciones existentes con `wrapAfter`.

| Proceso | Gesto |
|---|---|
| Eliminar cualquier cosa | la tarjeta se va hacia la derecha mientras la lista se cierra sobre el hueco |
| Actualizar una carga a hoy | sello de latón: baja, golpea y suelta un anillo de luz |
| Generar outfits | el lookbook entra ladeado, como una carta repartida |
| Guardar cualquier cosa | la máquina engrana un segundo |
| Alarma sonando | el punto de estado late y el fondo se enciende |

El borrado merece una nota. Todas las listas borran reescribiendo su HTML, así que el
ítem desaparecía de un cuadro al otro: la lista daba un salto y no quedaba claro qué se
fue. Ahora el borrado real corre **después** de la salida, y si el navegador pide menos
movimiento se ejecuta al instante como antes.

---

## Iconos

**Vesta no usa emojis en ninguna parte de la interfaz.** Cada símbolo es un SVG de
trazo 1.8 que hereda el color del elemento que lo contiene. El motivo es práctico:
los emojis los dibuja el sistema operativo, así que cambian de forma y de color
entre Android, iOS y Windows, y nunca combinan con la paleta ámbar.

Dos formas de usarlos:

```html
<!-- En el HTML: el icono se antepone sin borrar la etiqueta -->
<button data-icon="plus" data-icon-size="16">Agregar Registro</button>
```

```js
// En plantillas de JavaScript
`<button>${ICON.trash(18)}</button>`
```

Disponibles: `play` `pause` `stop` `plus` `trash` `refresh` `heart` `check`
`alert` `info` `bell` `calendar` `music` `video` `shirt` `jacket` `pants`
`shoe` `watch`.

Los avisos ya no llevan símbolo en el texto: el tono define color e icono.

```js
showBanner('Sueldo guardado', 3000, 'ok');
// tonos: info (por defecto) | ok | warn | danger | alarm | event
```

---

## Qué cambió en esta versión

**Errores corregidos**

- El botón *Agregar Ejercicio* vivía dentro del `<div>` del estado vacío del gym,
  que nunca se cerraba. Apenas cargabas un ejercicio, el estado vacío se ocultaba
  y se llevaba el botón con él: quedabas sin forma de agregar más.
- La notificación de alarma abría la pestaña `alarmas`, pero el identificador real
  es `alarms`. Tocar la notificación no hacía nada.
- Sobraba un icono duplicado en el estado vacío de la rutina.

**Rendimiento**

- `saveStorage` reescribía en `localStorage` el audio de *todas* las alarmas en cada
  guardado, aunque solo hubieras tocado un interruptor. Como son Base64 de varios
  megabytes y `localStorage` escribe de forma síncrona, eso congelaba la interfaz.
  Ahora solo se escribe el audio que realmente cambió.
- El cronómetro buscaba sus nodos con `getElementById` 60 veces por segundo. Ahora
  usa un caché (`EL`) y solo reescribe los minutos cuando cambian.
- La cascada de listas eran ~15 líneas de selectores repetidos, una por lista. Ahora
  es un sistema único (`.stagger`) que cualquier lista nueva hereda con una clase.
- Fuera los bucles infinitos de brillo en la pestaña activa y el botón flotante: el
  compositor repintaba para siempre sin que nadie estuviera mirando.
- Las animaciones se congelan cuando la app queda en segundo plano.
- Las fotos del clóset cargan con `loading="lazy"` y `decoding="async"`.
- Dato muerto eliminado: los iconos de categoría del armario ya no se usaban.

**Privacidad**

- Política de seguridad de contenido que bloquea toda conexión saliente.
- `referrer: no-referrer`.
- Placa *Mecanismo* con el inventario de lo que se guarda y cuánto ocupa.

**Accesibilidad**

- Foco visible al navegar con teclado.
- `aria-label` en los botones que solo tienen icono.
- Con `prefers-reduced-motion` la máquina sigue ahí, quieta: el fondo es parte de la
  identidad de Vesta, así que no se borra, solo deja de girar.

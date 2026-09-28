# Direccion de arte: hoja de cuentas a lapiz

Esta guia describe un lenguaje visual reutilizable para experiencias web que deben sentirse humanas, emocionales y hechas a mano, no como un producto SaaS o financiero.

## Idea central

La interfaz parece una hoja de borrador sobre un escritorio. Alguien toma un lapiz, hace unas cuentas, tacha, corrige y finalmente marca una conclusion importante.

La pregunta de control durante el diseno es:

> Esto parece una aplicacion financiera o una persona haciendo cuentas a lapiz?

Si parece una aplicacion financiera, simplificar y quitar pulido digital.

## Principios visuales

- Priorizar una sola conclusion grande sobre dashboards, tarjetas o metricas.
- Usar el espacio vacio como el de una hoja real, no como una grilla de producto.
- Las operaciones secundarias deben ser anotaciones espontaneas alrededor de la conclusion.
- Aceptar imperfeccion: trazos levemente inclinados, circulos irregulares y lineas no exactas.
- Mantener legibilidad y accesibilidad aunque la apariencia sea artesanal.
- Evitar gradientes tecnologicos, sombras de cards, botones rectangulares perfectos y visuales fintech.

## Paleta

| Uso | Valor orientativo |
| --- | --- |
| Papel | `#f8f4e9` |
| Fondo exterior | `#d9d4c9` |
| Grafito principal | `#39362f` |
| Grafito suave | `#5a554d` |
| Texto secundario | `#918a7e` |
| Linea de cuaderno | `rgba(115, 142, 154, .09)` |
| Margen de cuaderno | `rgba(205, 91, 83, .13)` |

La paleta debe ser desaturada. El contraste viene del grafito sobre el papel, no de colores de marca intensos.

## Papel y textura

- Usar blanco roto o crema claro, nunca blanco puro.
- Agregar una textura muy tenue mediante capas de `radial-gradient` y lineas repetidas.
- Se pueden incluir renglones o cuadricula con opacidad baja.
- Una linea vertical rojiza suave puede sugerir el margen de cuaderno.
- Aplicar una trama casi imperceptible para simular fibra de papel.
- La textura nunca debe competir con la lectura.

Ejemplo de capas CSS:

```css
background-color: #f8f4e9;
background-image:
  linear-gradient(90deg, transparent 0, transparent 39px,
    rgba(205, 91, 83, .13) 40px, transparent 41px),
  repeating-linear-gradient(0deg, transparent 0, transparent 32px,
    rgba(115, 142, 154, .09) 33px, transparent 34px),
  radial-gradient(circle at 4% 30%, rgba(91, 82, 66, .07) 0 1px, transparent 2px);
```

## Tipografia

- Usar una tipografia manuscrita, legible y con personalidad.
- Recomendacion: `Caveat` para titulos, cifras y anotaciones; `Patrick Hand` para texto de interfaz.
- Incluir un fallback como `Comic Sans MS, cursive` por resiliencia.
- Las cifras importantes deben ser grandes, pesadas y con una leve sombra de grafito para dar la idea de repaso multiple.
- Usar `letter-spacing` negativo moderado en las cifras grandes para compactarlas.

## Jerarquia

1. La cifra final domina toda la pantalla.
2. La unidad o conclusion acompana inmediatamente a la cifra.
3. La pregunta o contexto aparece antes, en un tamano mucho menor.
4. Las operaciones son perifricas y de menor contraste.
5. La explicacion metodologica es discreta.

```

## Inputs

Los campos no deben parecer controles SaaS.

- Presentar cada pregunta como texto manuscrito.
- El campo es una superficie transparente con una linea de lapiz debajo.
- Usar prefijos y sufijos escritos: `$`, `hs`, `dias`.
- Al enfocar, reforzar la linea inferior con un segundo trazo o una sombra muy leve.
- Mantener `label` e `input` reales para que sean accesibles y faciles de completar en movil.

```css
.input-line {
  border-bottom: 2px solid #58534b;
  border-radius: 49% 2% 53% 4%;
  transform: rotate(-.35deg);
}
```

## Acciones

- No usar botones rectangulares con relleno solido.
- La accion debe ser una frase dentro de un contorno imperfecto de lapiz.
- Al hover o foco, agregar un segundo trazo desplazado, en lugar de una elevacion de card.
- Incluir una flecha manuscrita como parte de la frase.

Ejemplo: `( calcular cuanto me costo -> )`

## Anotaciones y calculos

Las operaciones deben parecer pensamiento en proceso, no una tabla.

- Ubicar pequenos bloques alrededor de la respuesta en desktop.
- Usar flechas, saltos de linea y aproximaciones como `~` y `aprox.`.
- Rotar cada anotacion entre `-5deg` y `5deg`.
- Variar ligeramente el tamano, el peso y la posicion.
- Se pueden agregar tachones, circulos dobles, subrayados irregulares o correcciones aisladas.
- No usar tablas, cards, iconos de analytics ni graficos.

## Resultado protagonista

- Encerrar la cifra con uno o dos bordes redondeados irregulares usando pseudo-elementos.
- Desfasar y rotar el segundo borde para que no parezca vectorial perfecto.
- Aplicar una entrada breve que simule escritura, no una transicion tecnologica.
- La conclusion debe leerse sin necesidad de interpretar las operaciones previas.

```css
.answer-number::before,
.answer-number::after {
  content: '';
  position: absolute;
  border: 2px solid #4b4740;
  border-radius: 48% 46% 51% 44%;
}

.answer-number::after {
  border-width: 1px;
  transform: rotate(3deg);
}
```

## Movimiento

- Animar las anotaciones en secuencia: numeros, flechas, aproximaciones y resultado final.
- Usar duraciones cortas, alrededor de `450ms` a `650ms`.
- Preferir `opacity`, un desplazamiento vertical muy pequeno y un blur minimo inicial.
- Respetar `prefers-reduced-motion`.
- Nunca usar loaders, barras de progreso, contadores agresivos ni efectos futuristas.

## Responsive

### Desktop

- Presentar la hoja centrada sobre un fondo de escritorio neutro.
- Aprovechar los bordes para ubicar anotaciones sin desplazar el resultado central.
- La hoja puede tener una sombra suave y natural.

### Movil

- La hoja ocupa todo el viewport y se vuelve vertical.
- La lectura sigue una secuencia de arriba hacia abajo hasta la conclusion.
- Reubicar las anotaciones para evitar choques con la cifra principal.
- Mantener campos altos, legibles y compatibles con teclado movil.
- Reducir los detalles antes que la legibilidad.

## Accesibilidad

- Usar etiquetas reales para todos los inputs.
- Mantener contraste suficiente entre grafito y papel.
- No depender de una inclinacion o color para comunicar informacion.
- Proveer estados de foco visibles sobre las lineas manuscritas.
- Incluir `aria-live="polite"` en resultados que cambian luego de calcular.
- Desactivar o reducir animaciones cuando el sistema lo solicite.

## Checklist de implementacion

- [ ] Fondo crema con textura tenue de papel.
- [ ] Tipografia manuscrita legible.
- [ ] Sin cards SaaS ni botones rectangulares tradicionales.
- [ ] Inputs transparentes con linea inferior irregular.
- [ ] Una conclusion grande y central.
- [ ] Anotaciones de calculo alrededor, no en tabla.
- [ ] Trazos dobles, flechas o subrayados con pequenas imperfecciones.
- [ ] Layout movil que conserve la sensacion de hoja vertical.
- [ ] Movimiento breve y compatible con `prefers-reduced-motion`.

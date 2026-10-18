# VelociCalc LO

PWA estática en español para estimaciones técnicas de velocidad vehicular. Primera versión funcional, sin dependencias de ejecución, fuentes remotas, analítica ni servidor de datos. Los datos introducidos se procesan únicamente en el navegador y no se guardan al cerrar o recargar.

Repositorio: **LabTechR/VelociCalc-LO**, rama **main**.

## Desarrollo y pruebas

Requiere Node.js 22 o posterior. No necesita instalación de paquetes.

```sh
npm test
npm run build
npm start
```

Abrir http://127.0.0.1:4173. `public/` contiene las fuentes; `dist/` es la salida de publicación, excluida de Git. No abrir `index.html` mediante `file://`: los módulos y el service worker requieren HTTP local o HTTPS.

## Modelos

- Frenado recto y ABS: `vi = sqrt(vf² + 2 g d (μ cos θ ± sin θ))`. Ascenso suma gravedad; descenso resta. Distancia sobre la trayectoria, ángulo en grados, velocidad residual introducida en km/h. ABS requiere fricción efectiva validada; no lleva multiplicador universal.
- Yaw: `v = sqrt(g R μl)`. Radio del centro de masa, calzada horizontal sin peralte y sin frenado simultáneo. La pendiente longitudinal de los demás modos no se aplica al yaw.
- Frenado y derrape: presenta ambos modelos **por separado**, sin suma escalar ni energética automática.
- Arrastre postimpacto: `ve = sqrt(2 g d fe)`, equivalente de energía específica disipada. No representa velocidad preimpacto ni Δv. Requiere factor de arrastre representativo de la condición del vehículo.
- Tramos consecutivos: `vi = sqrt(vf² + 2 g Σ(di fei))`, mismo vehículo y etapas longitudinales sin impactos intermedios. Cada tramo tiene superficie, coeficiente y pendiente propios.

`g = 9.80665 m/s²`; km/h = m/s × 3.6; mph = m/s ÷ 0.44704. Con velocidad residual cero, el frenado supone detención al final del recorrido; si el recorrido es incompleto, solo caracteriza la energía modelada, no toda la velocidad inicial real.

Valores iniciales ilustrativos: asfalto seco 0.70 / mojado 0.45; concreto hidráulico seco 0.75 / mojado 0.50; terracería seca 0.50 / mojada 0.30. **No son una tabla pericial certificada**; sustituir por ensayos o valores técnicamente justificados. El coeficiente lateral se introduce independientemente.

Límites de entrada preventivos: distancias 0.01–10000 m, radio 0.1–10000 m, μ 0.01–2, ángulo 0–45°, velocidad residual 0–500 km/h, 1–20 tramos. No definen el rango de validez física; casos extremos requieren otro modelo. Se rechaza desaceleración efectiva nula o negativa. No incluye tiempos de reacción, deformación, dinámica de impacto, incertidumbre estadística ni reconstrucción rotacional.

Referencias: [Traffic Accident Reporting Manual, apéndice I](https://www.nhtsa.gov/sites/nhtsa.gov/files/documents/co_accident_reporting_manual_0706_rev42106_sub3_29_09.pdf), [NHTSA ABS Research](https://www.nhtsa.gov/sites/nhtsa.gov/files/absperformancefinalreport.pdf). La aplicación explica los supuestos sin necesitar estas páginas para funcionar.

## Instalación y funcionamiento sin conexión

Servir mediante HTTPS (o localhost). En la primera visita con conexión se precargan HTML, CSS, módulos, manifest e iconos. Cuando el pie indique «Disponible sin conexión», la interfaz y los cálculos estarán almacenados en ese navegador. Los enlaces de referencias requieren Internet. Borrar los datos del sitio elimina la copia sin conexión.

En navegadores compatibles aparece «Instalar aplicación»; también puede utilizarse la opción de instalación del navegador o «Añadir a pantalla de inicio» en Safari. La disponibilidad depende del navegador. Los iconos PNG incluyen 192 y 512 píxeles, este último con contenido dentro del área segura maskable.

Para actualizar, incrementar el nombre `CACHE` de `public/sw.js` al modificar los recursos precargados. El nuevo worker espera el cierre de las pestañas anteriores antes de activarse, evitando mezclar versiones. Las cachés de esta aplicación se retiran al activar la nueva versión.

## Publicación independiente en Render

No es necesario modificar ningún servicio existente. `render.yaml` declara un **nuevo Static Site** llamado `velocicalc-lo`, con repositorio explícito y rama `main`.

1. Subir estos archivos a `LabTechR/VelociCalc-LO`, rama `main`.
2. En Render, crear un nuevo **Static Site**, seleccionar ese repositorio y `main`.
3. Build command: `npm test && npm run build`.
4. Publish directory: `dist`.
5. Copiar las cabeceras de `render.yaml`, especialmente `Cache-Control: no-cache` para `/sw.js`; alternativamente crear un nuevo Blueprint desde ese archivo.
6. Tras publicar, abrir la URL HTTPS, calcular, esperar el indicador sin conexión y probar recarga sin red e instalación en el navegador de destino.

No requiere variables de entorno, secretos, base de datos ni reglas de reescritura: usa una sola página y rutas relativas. Este repositorio prepara el despliegue; no crea ni cambia servicios de Render automáticamente.

## Verificación

`node --test` comprueba energía de frenado, conversión de unidades, velocidad residual, pendientes, yaw, arrastre, suma de trabajos por tramos, entradas inválidas, manifest, dimensiones de iconos y existencia de todos los recursos de precaché. La inspección visual y la instalación deben revisarse también en los navegadores de destino.

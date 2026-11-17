# SpotySid — Checkpoint del 17 de noviembre de 2026 (ART)

**Estado:** desarrollo en `main` hasta **TEST341**, con **PASS del usuario para TEST341**. Este checkpoint documenta el estado del código y las pruebas informadas; no es una nueva rama MASTER ni una validación integral de todos los navegadores, todos los SIDs o el backend público.

[README](../README.md) · [Features](FEATURES.md) · [User guide](HELP_USER_GUIDE.md) · [Architecture](ARCHITECTURE.md) · [Open SpotySid](https://serigrafiamdp-web.github.io/RICOS-MOD-JAMES-SIDPLAYER-ONLINE/)

## Funciones visibles al cerrar esta sesión

- Reproductor SID con osciloscopio de tres voces, **HI-RES / PETSCII / PIXEL**, **FILL / LINE**, paletas de color e inversión **★**. Los modos de visualización se eligen aleatoriamente al abrir (TEST326), independientemente de la paleta. El volumen maestro mantiene la sincronía de altura del osciloscopio (TEST323).
- **MOS** abre la selección de **COMMUNITY PLAYLISTS**, GAMES, TOP/rankings y bibliotecas. La navegación **↑ / ↓** destaca una sola fila, igual que el hover del mouse; **Enter** ejecuta su reproducción cuando existe una selección.
- **PLAYLIST** muestra la lista flotante de canciones: seleccionar con flechas no interrumpe el audio; **Enter** reproduce la canción seleccionada. Los campos de texto, búsqueda, temporizador y editores conservan las teclas.
- Si el usuario está en **OSC** sin haber seleccionado un SID, **PLAY** de la barra o **Enter** reproducen la **primera canción de la primera lista reproducible de COMMUNITY PLAYLISTS**. No usan la lista histórica de GAMES ni reproducen automáticamente al cargar la página (**TEST341, PASS del usuario**). Se espera la carga asíncrona del catálogo si hace falta.
- **NEW PLAYLIST**, **ADD + TO**, selección en lote, reordenamiento, SAVE / PUBLISH / REPUBLISH, enlaces SHARE, importaciones HVSC y NO HVSC. Las operaciones de publicación requieren las autorizaciones correspondientes; la mera existencia del código frontend no verifica una escritura en D1.
- **TILEWORK**, editor 256×64 de 1 bit vinculado al artista actual, accesible desde el icono de lápiz y la tecla **D**. Tiene dibujo, relleno, selección, deshacer, inversión, zoom bajo el cursor y scroll. **X o ESC** muestran confirmación **SAVE BEFORE EXIT?**, con opciones **EXIT & SAVE** y **EXIT ONLY**. Guardar localmente un TILEWORK no equivale a publicarlo en Cloudflare.

## Atajos vigentes (TEST333–341)

| Tecla | En qué estado | Acción |
| --- | --- | --- |
| **M** | Sin editor/modal superpuesto | Abrir MOS (botón del chip) |
| **P** | Sin editor/modal superpuesto | Mostrar/ocultar PLAYLIST |
| **C** | Sin editor/modal superpuesto | Siguiente COLOR |
| **I** | Sin editor/modal superpuesto | Invertir fondo/tinta, igual que **★** |
| **F** | Sin editor/modal superpuesto | Alternar FILL / LINE |
| **D** | Sin editor/modal superpuesto | Abrir TILEWORK |
| **↑ / ↓** | Lista MOS o lista de canciones | Mover la selección visual sin reproducir ni reordenar |
| **Enter** | Fila de lista/canción seleccionada | Reproducir usando su acción PLAY original |
| **Enter** | Solo OSC, sin SID elegido | Reproducir la primera canción de la primera lista COMMUNITY (TEST341) |
| **ESC** | PLAYLIST visible | Cerrar PLAYLIST y volver a OSC |
| **ESC** | MOS visible, sin PLAYLIST superpuesta | Cerrar MOS |
| **ESC** | Solo OSC | Abrir MOS |
| **ESC** | TILEWORK | Mostrar confirmación antes de salir |

**Prioridad de ESC:** TILEWORK y ventanas/modales propios primero; luego PLAYLIST; luego MOS; solo cuando no hay ningún menú abierto, MOS se abre desde OSC. No tomar control de entradas de texto o de otras ventanas.

## Avances de interfaz y pruebas recientes

| TEST | Cambio | Estado registrado |
| --- | --- | --- |
| **301** | PETSCII restaurado a render anterior verificado | **PASS usuario**, archivado en MASTER-2026-11-16-TEST301 |
| **323** | Altura del osciloscopio responde al volumen maestro | **PASS usuario** |
| **324** | Botón MOS con chip gráfico en vez de texto | Implementado |
| **325** | REMIX PLAYLIST pasa a **NEW PLAYLIST** | Implementado |
| **326** | Modo inicial aleatorio HI-RES/PETSCII/PIXEL | Implementado |
| **327** | Inversión correcta de tinta en TILEWORK | **PASS usuario** |
| **329** | Restaurada el área de dibujo; confirmación de salida compacta | **PASS usuario** |
| **330** | Zoom con rueda centrado en coordenada del cursor, scroll intacto | **PASS usuario** |
| **331** | ESC de TILEWORK equivale a X y pide guardar antes de salir | Implementado |
| **332** | Eliminada línea superior de la barra, sin alterar botones | Implementado |
| **333** | Navegación ↑/↓ y reproducción con Enter en listas/canciones | Implementado |
| **334** | Unificado cursor de mouse y teclado; sin marco azul extra | **PASS usuario** |
| **335–336** | M= MOS; I= inversión, F= FILL/LINE; P/C previos | Implementado |
| **337** | MOS abre con primera lista ya seleccionada, incluso después de carga asíncrona | **PASS usuario** |
| **338** | D abre TILEWORK | Implementado |
| **339** | Primer diseño de ESC → MOS | **Sustituido por TEST340** |
| **340** | ESC cierra PLAYLIST antes de considerar MOS; solo OSC abre MOS | Implementado |
| **341** | PLAY o Enter sin elección inicia la primera canción de primera lista COMMUNITY | **PASS usuario** |

No interpretar «Implementado» como PASS de comportamiento real hasta que el usuario lo pruebe.

## Archivos activos relevantes

- `index.html` — interfaz, Help/ABOUT y versiones de caché de scripts.
- `css/style.css` — barra inferior, colores de las filas y editor.
- `js/sidPlayer.js` — reproducción SID y controles principales; reproducción original TinySID.
- `js/customPlaylist.test101.js` — playlists, catálogo COMMUNITY, importación y TEST341. **El nombre test101 es histórico, pero el archivo está activo.**
- `js/dialogKeyboard.test230.js` — atajos P/C/M/I/F/D, ESC y navegación ↑/↓/Enter.
- `js/tileArtwork.test264.js` — editor TILEWORK y confirmación de salida.
- `js/petsciiMode.test282.js` — visualización PETSCII y modos relacionados.
- `js/help.test109.js` — abre/cierra HELP y cambia idioma; **los textos de HELP están en `index.html`**.
- `docs/FEATURES.md` y `docs/HELP_USER_GUIDE.md` — documentación viva de funciones y uso.

## Límites y tareas para la próxima revisión

1. **Prueba manual de TEST340/341:** ESC en OSC, MOS, PLAYLIST y TILEWORK; Enter y PLAY sin selección; comprobar que la primera lista COMMUNITY y su primer SID se escuchan correctamente tras una carga lenta. TEST341 fue marcado PASS por el usuario.
2. **UX y HELP/ABOUT:** contrastar los nuevos textos con la interfaz real (inglés/español en HELP). Evitar anunciar botones de prueba antiguos como si aún existieran. Conservar la estética minimalista.
3. **TILEWORK:** guardar, reabrir y publicar/verificar a través de STIL+ son etapas distintas; la publicación real necesita Worker/D1 compatible. [TEST275](TEST275_STIL_PLUS_ARTIST_TILEWORK_PUBLISH.md).
4. **Audio pendiente del 11 de noviembre:** Uctumi — «Loco un Poco» 8580/reSIDfp sigue sin confirmación estable; conservar la referencia exacta a TEST193 y no activar todas las pistas de Uctumi. [Checkpoint 11 Nov](CHECKPOINT_2026-11-11_SPOTYSID.md).
5. **D1/NO HVSC / REPUBLISH:** publicación, actualización de un ID y verificación desde otro navegador son pruebas separadas del código UI. No modificar D1 ni Worker por una actualización de documentación.

## Puntos que NO cambiamos por documentar

- La rama **MASTER-2026-11-16-TEST301** sigue siendo un snapshot histórico verificado, **no** el estado de `main` al terminar TEST341.
- No se modifican SIDs, archivos HVSC, autorías, motores de audio, publicaciones existentes, datos D1 ni secretos.
- No se hizo una nueva prueba completa de audio por el mero hecho de actualizar README, HELP o ABOUT.

**Próximo punto de partida:** `main` en TEST341 + actualizaciones documentales de esta sesión. Continuar nuevas pruebas desde TEST342 después del PASS de la documentación.

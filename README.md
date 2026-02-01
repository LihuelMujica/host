# Host Client (Angular)

Cliente **host** para el juego estilo Jackbox Party Pack.

## Requisitos

- **Node.js 18+** (recomendado 18 o 20).
- **npm** (viene con Node).

> Si no tienes Node instalado, descarga el instalador desde https://nodejs.org/.

## Instalación

1. Clona este repo.
2. En la raíz del proyecto:

```bash
npm install
```

## Levantar la app en desarrollo

```bash
npm start
```

Esto levanta el servidor en http://localhost:4200/.

## Notas útiles

- El botón **JUGAR** crea una sala vía `POST /room/create` y guarda el `roomCode`.
- Luego se conecta al SSE en `/sse/host?roomName=<roomCode>` para recibir `HOST_SNAPSHOT`.
- El lobby se muestra automáticamente cuando `gameState === "LOBBY"`.

## Scripts disponibles

- `npm start`: levanta el servidor dev.
- `npm run build`: build de producción.
- `npm test`: tests con Karma (si corresponde).

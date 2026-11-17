# Despliegue en el servidor DAW

Servidor: `daw.inspedralbes.cat` (HestiaCP, compartido). Hace falta la **VPN** del instituto.
En `~/.ssh/config` está el alias `daw`, así que basta con `ssh daw`.

**Regla de oro:** lo que hay en el servidor es lo que hay en GitHub. Nunca se edita nada a mano en el servidor.

## Flujo de trabajo

```bash
# 1. Trabajas en local, haces commit y push como siempre
git commit -am "..." && git push

# 2. Despliegas (desde cualquier carpeta)
~/ccc/portfolio/deploy/deploy.sh time-attack
~/ccc/portfolio/deploy/deploy.sh tot        # todo
~/ccc/portfolio/deploy/deploy.sh estat      # qué hay en marcha y qué commit está publicado
```

El script se niega a desplegar si el repo tiene cambios sin commit o no está igual que en GitHub.

## Qué hay y dónde

| Proyecto | Repo (rama) | En el servidor | URL |
|---|---|---|---|
| `portfolio` | portfolio (main) | compilado → `web/portfolio.camilo.daw…/public_html` | http://portfolio.camilo.daw.inspedralbes.cat/ |
| `time-attack` | timeAttackGame (prototip-3-socket) | compilado → `public_html/time-attack` | http://a25campracar.daw.inspedralbes.cat/time-attack/ |
| `time-attack-api` | alvaroph/backend_TIME_ATTACK (main) | clon en `~/apps/backend_TIME_ATTACK`, pm2, puerto **20601** | http://daw.inspedralbes.cat:20601/health |
| `banderas` | juegodBanderas (main, privado) | clon en `~/apps/juegodBanderas`, pm2, puerto **20600** | http://a25campracar.daw.inspedralbes.cat:20600/ |
| `cursores` | sockets-cursores (main) | clon en `~/apps/sockets-cursores`, pm2, puerto **20602** (sirve su propio HTML) | http://a25campracar.daw.inspedralbes.cat:20602/ |
| `paint-rooms` | sockets-paintrooms (main), carpeta `client/` | compilado → `public_html/paint-rooms` | http://a25campracar.daw.inspedralbes.cat/paint-rooms/ |
| `paint-rooms-api` | sockets-paintrooms (main), carpeta `server/` | clon en `~/apps/sockets-paintrooms`, pm2, puerto **20603** | — |
| `cat-clicker` | catClicker (main) | archivos del commit → `public_html/cat-clicker` | http://a25campracar.daw.inspedralbes.cat/cat-clicker/ |

`public_html` = `web/a25campracar.daw.inspedralbes.cat/public_html`. Su `index.html` es [`landing/index.html`](landing/index.html) (se publica con `portfolio`).

```
servidor (~)
├── apps/                      ← privado: backends, nunca dentro de public_html
│   ├── ecosystem.config.cjs   ← copia de deploy/ecosystem.config.cjs (pm2)
│   ├── juegodBanderas/        ← git clone (deploy key de solo lectura) + backend/.env
│   ├── backend_TIME_ATTACK/   ← git clone
│   ├── sockets-cursores/      ← git clone
│   └── sockets-paintrooms/    ← git clone (se usa server/)
├── backups/                   ← copias antes de cambios grandes
└── web/
    ├── a25campracar.daw.inspedralbes.cat/public_html/
    │   ├── index.html         ← lista de proyectos
    │   ├── time-attack/
    │   ├── paint-rooms/
    │   └── cat-clicker/
    └── portfolio.camilo.daw.inspedralbes.cat/public_html/
```

Cada web publicada tiene un `version.txt` con el commit exacto (por ejemplo, `/time-attack/version.txt`).

## Por qué así

- **Frontends compilados en local:** el servidor es compartido y va justo de RAM, así que no se compila allí.
- **Backends con pm2:** siguen vivos al cerrar SSH, se reinician si fallan, y `@reboot pm2 resurrect` (crontab) los levanta si se reinicia el servidor. Logs: `ssh daw pm2 logs banderas`.
- **Secretos solo en el servidor:** `~/apps/juegodBanderas/backend/.env` (permisos 600). No está en Git. Si cambias la contraseña de MySQL en Hestia, edita ese archivo y ejecuta `ssh daw pm2 restart banderas`.
- **Puertos:** el 3000 lo usa otra persona; los míos son 20600 (banderas), 20601 (Time Attack), 20602 (cursores) y 20603 (Paint Rooms).
- **CRUD de banderas:** `/crud.html` pide contraseña (`CRUD_PASSWORD` en el `.env` del servidor).

## Añadir un proyecto nuevo

1. Una función en `deploy.sh` (copia `time_attack` si es Vite, o `backend` + una entrada en `ecosystem.config.cjs` si es un servidor Node).
2. Su ficha en `public/proyectos/<nombre>/` (ver el README principal).
3. Un enlace en `landing/index.html`.

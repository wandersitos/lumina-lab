# AGENTS.md — wonder-store

Repo de código de «The Gift Club». Se orquesta desde su meta-repo (la carpeta padre;
ver `repos.yaml` allí). Aquí solo vive el código de la aplicación.

## Comandos (literales, probados; los usa el método en cada cierre)

| Para… | Comando |
|---|---|
| Levantar el entorno desde cero | `docker compose up --build -d` |
| Correr la suite completa | `scripts/ci/full-suite` |
| Correr los linters | `scripts/ci/lint` |
| Lanzar una instancia para que la use el usuario | `docker compose up` → `http://localhost:3000` |
| Comprobación de seguridad | `scripts/ci/security` |
| Parar / limpiar | `docker compose down -v` |

## Qué necesita esta máquina

- Docker 24+ y Docker Compose v2 (o Python 3.12+ para desarrollo local en peldaño mínimo)
- Git

## Estructura

- `api/`: Backend en Django (API REST con Django REST Framework y PostgreSQL/SQLite).
- `frontend/`: Single Page Application (SPA) construida en React con Vite.
- `docker-compose.yml`: Orquestación local de base de datos Postgres, backend y frontend.
- `scripts/ci/`: Scripts de validación de CI local (`full-suite`, `lint`, `security`).

## Reglas de este repo

- Los secretos van en `.env` (fuera de git) y **el `.env` está en `.dockerignore`**: un
  secreto horneado en una imagen es un secreto publicado.
- Las dependencias de desarrollo y test están separadas de las de producción.
- Los tests se escriben antes que el código y no se debilitan para que pase la suite.
- Los scripts obligatorios de `scripts/ci/` —los tres base— preparan su entorno, usan herramientas fijadas y propagan cualquier rojo. Prohibido `|| true` o dar verde por no encontrar tests.
- La suite, el lint y la seguridad se ejecutan en local antes de fusionar; anota arriba los
  comandos probados para que cualquier agente pueda repetirlos.


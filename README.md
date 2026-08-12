# darksoot-backend

API do Darksoot (Express + Prisma + PostgreSQL).

## Local com Docker Compose

```bash
docker compose up --build
```

- API: `http://localhost:3000`
- Health: `GET /health`
- Postgres no host: `localhost:5433`

## Deploy no Render (conectar este repositório)

### Opção A — Blueprint (recomendado)

1. No Render: **New → Blueprint**
2. Conecte `joanrodrigueseth/darksoot-backend`
3. Confirme o `render.yaml` (cria Postgres + Web Service Docker)

Variáveis geradas automaticamente:
- `DATABASE_URL` (do Postgres do Render)
- `JWT_SECRET`

### Opção B — Manual

1. **New → PostgreSQL** (anote a Internal Database URL)
2. **New → Web Service** → este repo
   - Runtime: **Docker**
   - Dockerfile path: `./Dockerfile`
3. Environment:
   - `DATABASE_URL` = Internal Database URL do Postgres
   - `JWT_SECRET` = string secreta forte
   - `PORT` = Render define automaticamente (o app já usa `process.env.PORT`)

Health check path: `/health`

## App mobile

No Expo, aponte a API:

```bash
EXPO_PUBLIC_API_URL=https://SEU-SERVICO.onrender.com
```

## Endpoints

- `POST /auth/guest`
- `GET /contacts`
- `GET /contacts/:id/profile`
- `GET /chats/:contactId`
- `POST /chats/:contactId/choice`
- `GET /chapters/1`
- `POST /chapters/1/reset`
- `POST /chapters/reset-story`
- `POST /minigames/pendrive/complete`

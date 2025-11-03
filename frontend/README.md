# Frontend (Vite + React + Tailwind)

## Requisitos
- Node.js LTS
- npm ou pnpm

## Configuração
```bash
cp .env.example .env
npm install
npm run dev
# abre http://127.0.0.1:5173
```
A variável `VITE_API_BASE` deve apontar para o backend. Ex.: `http://127.0.0.1:8000`.

## Login
- Acesse `/login`, informe usuário e senha do Django.
- O token é salvo no `localStorage` e enviado em todas as requisições.

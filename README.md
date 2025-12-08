# Rentabili 2.0

Recriação otimizada do projeto Rentabili - um sistema completo de gerenciamento de rentabilidade de investimentos.

## Descrição

O Rentabili 2.0 é um sistema que ajuda investidores a monitorar o desempenho de seus ativos (renda fixa e fundos), calculando ganhos percentuais e exibindo gráficos comparativos para facilitar a tomada de decisões.

## Tecnologias

### Backend
- Node.js com Express
- Prisma ORM
- PostgreSQL
- Redis (cache)
- JWT para autenticação
- Swagger para documentação da API

### Frontend
- React com Vite
- TailwindCSS
- Recharts para gráficos
- React Router

## Instalação

```bash
# Instalar dependências do backend e frontend
npm run install

# Ou instalar e executar
npm run install:run
```

## Desenvolvimento

```bash
# Executar em modo de desenvolvimento
npm run dev
```

Isso iniciará:
- Backend em http://localhost:3001
- Frontend em http://localhost:5173
- Documentação API em http://localhost:3001/api-docs

## Build

```bash
npm run build
```

## Estrutura do Projeto

```
rentabili2.0/
├── backend/          # API Node.js/Express
│   ├── src/
│   │   ├── controllers/
│   │   ├── routes/
│   │   ├── services/
│   │   ├── repositories/
│   │   └── middleware/
│   ├── prisma/      # Schema e migrations
│   └── app.js
├── frontend/        # App React
│   └── src/
│       ├── components/
│       ├── pages/
│       └── services/
└── package.json
```

## Licença

ISC

# Guia de Instalação - Rentabili 2.0

Este guia fornece instruções passo a passo para configurar e executar o projeto Rentabili 2.0.

## Pré-requisitos

Antes de começar, certifique-se de ter instalado:

- Node.js (versão 18 ou superior)
- PostgreSQL (versão 14 ou superior)
- Redis (versão 6 ou superior)
- npm ou yarn

## Instalação

### 1. Clone o Repositório

```bash
git clone https://github.com/gabrielflorianoo/Rentabili2.0.git
cd Rentabili2.0
```

### 2. Configure o Banco de Dados PostgreSQL

Crie um banco de dados para o projeto:

```sql
CREATE DATABASE rentabili;
CREATE USER rentabili_user WITH PASSWORD 'sua_senha_aqui';
GRANT ALL PRIVILEGES ON DATABASE rentabili TO rentabili_user;
```

### 3. Configure o Redis

Certifique-se de que o Redis está rodando:

```bash
# Verificar se Redis está ativo
redis-cli ping
# Deve retornar: PONG
```

Se não estiver instalado:

**Ubuntu/Debian:**
```bash
sudo apt-get install redis-server
sudo systemctl start redis-server
```

**macOS:**
```bash
brew install redis
brew services start redis
```

**Windows:**
Use o Redis do WSL ou baixe o executável do Redis.

### 4. Configure as Variáveis de Ambiente

Copie o arquivo de exemplo e configure suas variáveis:

```bash
cd backend
cp .env.example .env
```

Edite o arquivo `.env` com suas configurações:

```env
# Server Configuration
PORT=3001
NODE_ENV=development

# Database Configuration
DATABASE_URL="postgresql://rentabili_user:sua_senha_aqui@localhost:5432/rentabili?schema=public"
DIRECT_URL="postgresql://rentabili_user:sua_senha_aqui@localhost:5432/rentabili?schema=public"
USE_DB=true

# JWT Configuration (IMPORTANTE: Altere para produção!)
JWT_SECRET=seu_segredo_super_seguro_aqui_mude_em_producao
ACCESS_TOKEN_EXP=15m
REFRESH_TOKEN_EXP=7d

# Redis Configuration
REDIS_URL=redis://localhost:6379
USE_CACHE=true

# Frontend Configuration
FRONTEND_URL=http://localhost:5173
BACKEND_URL=http://localhost:3001
```

Para o frontend (opcional):

```bash
cd ../frontend
cp .env.example .env
```

Edite `frontend/.env`:

```env
VITE_API_URL=http://localhost:3001
```

### 5. Instale as Dependências

Volte para a raiz do projeto e execute:

```bash
cd ..
npm run install
```

Este comando irá:
- Instalar dependências do backend
- Instalar dependências do frontend
- Gerar o Prisma Client automaticamente

### 6. Execute as Migrations do Banco de Dados

```bash
cd backend
npx prisma migrate dev
```

### 7. (Opcional) Popule o Banco com Dados de Exemplo

```bash
cd backend
npx prisma db seed
```

## Executando o Projeto

### Modo de Desenvolvimento

Na raiz do projeto, execute:

```bash
npm run dev
```

Isso iniciará:
- Backend em: http://localhost:3001
- Frontend em: http://localhost:5173
- Documentação da API em: http://localhost:3001/api-docs

### Executar Backend e Frontend Separadamente

**Backend:**
```bash
cd backend
npm run dev
```

**Frontend:**
```bash
cd frontend
npm run dev
```

### Build para Produção

**Backend:**
```bash
cd backend
npm run build
npm start
```

**Frontend:**
```bash
cd frontend
npm run build
npm run preview
```

## Comandos Úteis

### Backend

```bash
# Executar em desenvolvimento
npm run dev

# Iniciar servidor de produção
npm start

# Gerar Prisma Client
npm run prisma:generate

# Executar migrations
npm run db:migrate

# Resetar banco de dados
npm run db:reset

# Abrir Prisma Studio (interface gráfica)
npm run db:studio

# Executar testes de rotas
npm run test:routes
```

### Frontend

```bash
# Executar em desenvolvimento
npm run dev

# Build para produção
npm run build

# Preview do build
npm run preview
```

## Solução de Problemas

### Erro: "Prisma Client não encontrado"

Execute:
```bash
cd backend
npx prisma generate
```

### Erro: "Cannot connect to database"

Verifique:
1. PostgreSQL está rodando
2. Credenciais corretas no `.env`
3. Banco de dados existe

```bash
# Testar conexão PostgreSQL
psql -U rentabili_user -d rentabili -h localhost
```

### Erro: "Redis connection failed"

Verifique se o Redis está rodando:
```bash
redis-cli ping
```

Se necessário, desabilite o cache temporariamente no `.env`:
```env
USE_CACHE=false
```

### Erro: "Port already in use"

Altere a porta no arquivo `.env`:
```env
PORT=3002  # ou qualquer outra porta disponível
```

## Estrutura do Projeto

```
rentabili2.0/
├── backend/              # API Node.js/Express
│   ├── src/
│   │   ├── controllers/  # Controladores das rotas
│   │   ├── routes/       # Definição de rotas
│   │   ├── services/     # Lógica de negócio
│   │   ├── repositories/ # Acesso ao banco de dados
│   │   └── middlewares/  # Middlewares (auth, cache, etc)
│   ├── prisma/
│   │   ├── schema.prisma # Schema do banco
│   │   └── migrations/   # Migrations do banco
│   └── app.js           # Ponto de entrada
├── frontend/            # App React
│   └── src/
│       ├── components/  # Componentes reutilizáveis
│       ├── pages/       # Páginas da aplicação
│       └── services/    # Serviços de API
└── package.json        # Scripts principais
```

## Primeiro Acesso

1. Acesse: http://localhost:5173
2. Clique em "Cadastrar"
3. Preencha seus dados
4. Faça login com suas credenciais

## Recursos Disponíveis

- **Dashboard**: Visão geral dos investimentos
- **Ativos**: Gerenciar seus ativos
- **Investimentos**: Registrar aportes e resgates
- **Transações**: Histórico de transações
- **Carteiras**: Gerenciar carteiras
- **Análise de Performance**: Gráficos e métricas
- **Histórico de Saldos**: Evolução patrimonial

## Suporte

Para problemas ou dúvidas:
1. Verifique a seção "Solução de Problemas" acima
2. Consulte a documentação da API em `/api-docs`
3. Abra uma issue no GitHub

## Licença

ISC

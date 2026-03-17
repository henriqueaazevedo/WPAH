# WPAH - Sistema de Gestão

> Sistema completo de Gestão de Pessoas, Documentos e Protocolos com **React + Node.js + MongoDB**

---

## 🚀 Início Rápido

### 1. Instalar Dependências
```bash
npm install
cd frontend && npm install
```

### 2. Inicializar Banco de Dados
```bash
npm run init-db
```

### 3. Iniciar Sistema

**Terminal 1 - Backend:**
```bash
npm start
# Roda em http://localhost:3003
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
# Roda em http://localhost:5173
```

### 4. Acessar
```
http://localhost:5173
```

---

## 🔑 Autenticação

### Cadastro de Novo Usuário
- Nome, Email, CPF, Senha
- Login gerado automaticamente: `nome.sobrenome + últimos 4 CPF`
- Usuário e Pessoa vinculados automaticamente

### Login
- Email ou Login + Senha

---

## 📱 Funcionalidades

| Página | Descrição |
|--------|-----------|
| **Pessoas** | CRUD completo de cadastros |
| **Documentos** | Criar/vincular documentos a pessoas |
| **Protocolos** | Criar protocolos com número automático (PR-YYYY-NNNN) |
| **Busca** | Busca global em todas as entidades |
| **Perfil** | Editar dados pessoais do usuário |
| **Serviços** | Listar serviços disponíveis |
| **Transparência** | Indicadores e últimos registros |

---

## 🗄️ Banco de Dados

**MongoDB Local**: `mongodb://localhost:27017/wpah`

### Coleções

```
pessoas
  ├─ Índice único: cpf
  └─ Campos: id, nome, cpf, email, telefone, dataNascimento, criadoEm, atualizadoEm

usuarios
  ├─ Índices únicos: email, login
  └─ Campos: id, pessoaId, nome, email, login, senha, origem, criadoEm, atualizadoEm

documentos
  ├─ Índice: pessoaId
  └─ Campos: id, titulo, tipo, descricao, pessoaId, conteudo, criadoEm, atualizadoEm

protocolos
  ├─ Índices únicos: numero
  ├─ Índice: pessoaId
  └─ Campos: id, numero, titulo, tipo, descricao, pessoaId, situacao, dataProtocolo, criadoEm, atualizadoEm
```

---

## 📝 Scripts npm

```bash
npm start           # Inicia servidor backend
npm run init-db     # Inicializa/reseta banco de dados
npm run clean-db    # Remove e recria banco vazio

# Frontend
cd frontend
npm run dev         # Dev server com HMR
npm run build       # Build para produção
npm run preview     # Preview da build
```

---

## 🔧 Variáveis de Ambiente

### Backend (`.env`)
```
MONGO_URI=mongodb://localhost:27017/wpah
PORT=3003
```

### Frontend (`frontend/.env.local`)
```
VITE_API_URL=http://localhost:3003
```

---

## 📂 Estrutura de Pastas

```
WPAH/
├── db/                    # Módulos MongoDB (ESSENCIAL)
│   ├── connection.js      # Conexão com MongoDB
│   ├── init.js            # Inicialização do banco
│   └── clean.js           # Limpeza do banco
├── routes/                # Rotas da API
│   ├── auth.js            # Autenticação
│   ├── pessoas.js         # CRUD pessoas
│   ├── documentos.js      # CRUD documentos
│   ├── protocolos.js      # CRUD protocolos
│   └── publico.js         # Portal público
├── utils/                 # Utilitários
│   ├── storage.js         # Adapter MongoDB
│   └── filtros.js         # Filtros e busca
├── frontend/              # React + Vite
│   ├── src/
│   │   ├── App.jsx
│   │   ├── api.js         # Cliente da API
│   │   ├── components/
│   │   └── pages/
│   ├── index.html
│   ├── vite.config.js
│   ├── package.json
│   └── .env.local
├── server.js              # Servidor HTTP
├── package.json           # Dependências
├── .env                   # Configuração (ESSENCIAL)
├── .gitignore             # Git config
└── README.md              # Este arquivo
```

---

## 🌐 Endpoints da API

### Autenticação
- `POST /login` - Login
- `POST /cadastro` - Cadastro
- `GET /usuarios` - Listar usuários
- `GET /perfil/:id` - Buscar perfil
- `PUT /perfil/:id` - Atualizar perfil

### Pessoas
- `GET /pessoas` - Listar com filtros
- `POST /pessoas` - Criar
- `PUT /pessoas/:id` - Atualizar
- `DELETE /pessoas/:id` - Remover

### Documentos
- `GET /documentos` - Listar
- `POST /documentos` - Criar
- `PUT /documentos/:id` - Atualizar
- `DELETE /documentos/:id` - Remover

### Protocolos
- `GET /protocolos` - Listar
- `POST /protocolos` - Criar (número automático)
- `PUT /protocolos/:id` - Atualizar
- `DELETE /protocolos/:id` - Remover

### Portal
- `GET /busca` - Busca global
- `GET /servicos` - Listar serviços
- `GET /transparencia` - Indicadores

---

## 🧪 Testar API

```bash
# Listar pessoas
curl http://localhost:3003/pessoas

# Criar pessoa
curl -X POST http://localhost:3003/pessoas \
  -H "Content-Type: application/json" \
  -d '{"nome":"João","cpf":"12345678900","email":"joao@wpah.com"}'

# Buscar
curl "http://localhost:3003/busca?q=João"
```

---

## 🐛 Troubleshooting

### Frontend erro: "Unexpected token '<'"
- Backend não está respondendo
- Verificar `.env.local`: `VITE_API_URL=http://localhost:3003`
- Testar: `curl http://localhost:3003/pessoas`

### MongoDB não conecta
```bash
npm run init-db
# Verifica e cria banco se não existir
```

### Porta em uso
```bash
PORT=3004 npm start        # Backend em 3004
cd frontend && PORT=5174 npm run dev  # Frontend em 5174
```

---

## 📊 Visualizar Dados

1. Abra **MongoDB Compass**
2. Conecte a: `mongodb://localhost:27017`
3. Banco: `wpah`
4. Explore as coleções

---

## 🔐 Segurança

- ✅ Senhas sanitizadas (nunca retornadas)
- ✅ CPF validado e único
- ✅ Email validado e único
- ✅ Login único (gerado automaticamente)
- ✅ CORS habilitado para desenvolvimento
- ✅ Timestamps para auditoria

---

## 🚀 Deploy

### Build Frontend
```bash
cd frontend
npm run build
# Arquivos otimizados em dist/
```

### Produção
1. Usar MongoDB Atlas (cloud)
2. Atualizar `MONGO_URI` no `.env`
3. Deploy backend (Heroku, Render, etc)
4. Servir frontend (Vercel, Netlify, etc)

---

**Sistema pronto para desenvolvimento e produção! 🚀**

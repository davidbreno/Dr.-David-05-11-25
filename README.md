# 🦷 Plataforma Odontológica Profissional

Sistema completo de gestão para clínicas odontológicas, desenvolvido com Django (Backend) e React (Frontend).

## 📋 Funcionalidades

- 👥 **Gestão de Pacientes** - Cadastro completo e histórico
- 🦷 **Odontograma Digital** - Registro visual das condições dentárias
- 💰 **Orçamentos** - Criação e gerenciamento de orçamentos
- 💵 **Financeiro** - Controle de receitas e despesas
- 📦 **Estoque** - Gerenciamento de produtos e materiais
- 🔐 **Autenticação JWT** - Sistema seguro de login

## 🛠️ Tecnologias

### Backend
- Python 3.12
- Django 4.2
- Django REST Framework
- PostgreSQL 15
- Docker & Docker Compose

### Frontend
- React 18
- Vite
- Tailwind CSS
- React Router
- Axios

## 🚀 Como Rodar

### Pré-requisitos
- Docker & Docker Compose instalados
- Node.js 18+ e npm
- Git

### 1. Clone o repositório

```bash
git clone https://github.com/davidbreno/Plataforma-odontologica-profissional.git
cd Plataforma-odontologica-profissional
```

### 2. Backend (Django + PostgreSQL)

```bash
cd backend
docker-compose up --build
```

O backend estará rodando em: **http://localhost:8000**

#### Credenciais de Administrador
- **Usuário:** `admin`
- **Senha:** `admin123`

#### URLs do Backend
- Admin: http://localhost:8000/admin/
- API Docs: http://localhost:8000/api/docs/
- API Endpoints: http://localhost:8000/api/

### 3. Frontend (React)

Em outro terminal:

```bash
cd frontend
npm install
npm run dev
```

O frontend estará rodando em: **http://localhost:5173**

## 📁 Estrutura do Projeto

```
clinica_odontologica/
├── backend/
│   ├── clinica/           # Configurações do Django
│   ├── pacientes/         # App de pacientes
│   ├── odontograma/       # App de odontogramas
│   ├── orcamentos/        # App de orçamentos
│   ├── financeiro/        # App financeiro
│   ├── estoque/           # App de estoque
│   ├── docker-compose.yml # Configuração Docker
│   └── requirements.txt   # Dependências Python
│
└── frontend/
    ├── src/
    │   ├── modules/       # Módulos da aplicação
    │   │   ├── auth/      # Autenticação
    │   │   ├── api/       # Cliente API
    │   │   ├── layout/    # Componentes de layout
    │   │   ├── pacientes/
    │   │   ├── odontograma/
    │   │   ├── orcamentos/
    │   │   ├── financeiro/
    │   │   └── estoque/
    │   └── main.jsx       # Arquivo principal
    └── package.json       # Dependências Node
```

## 🔧 Configuração

### Variáveis de Ambiente (Backend)

O Docker Compose já está configurado com as variáveis padrão. Para personalizar, edite `backend/docker-compose.yml`:

```yaml
environment:
  DATABASE_NAME: clinica
  DATABASE_USER: postgres
  DATABASE_PASSWORD: senha
  DATABASE_HOST: db
  DATABASE_PORT: 5432
```

### API Base URL (Frontend)

Configurado em `frontend/src/modules/api/client.js`:

```javascript
baseURL: 'http://localhost:8000/api'
```

## 📦 Comandos Úteis

### Backend

```bash
# Rodar migrações
docker-compose exec web python manage.py migrate

# Criar superusuário
docker-compose exec web python manage.py createsuperuser

# Coletar arquivos estáticos
docker-compose exec web python manage.py collectstatic

# Parar containers
docker-compose down

# Ver logs
docker-compose logs -f
```

### Frontend

```bash
# Instalar dependências
npm install

# Rodar em desenvolvimento
npm run dev

# Build para produção
npm run build

# Preview da build
npm run preview
```

## 🎨 Design System

O projeto utiliza Tailwind CSS com classes personalizadas:

- `.btn` - Botões base
- `.btn-primary` - Botão primário (azul)
- `.btn-secondary` - Botão secundário
- `.btn-danger` - Botão de perigo (vermelho)
- `.card` - Card com sombra
- `.input` - Input estilizado
- `.page-title` - Título de página com gradiente

## 🔐 Autenticação

O sistema utiliza JWT (JSON Web Tokens) para autenticação:

1. Login em `/api/auth/token/` retorna `access` e `refresh` tokens
2. O `access` token é enviado em todas as requisições protegidas
3. Renovação via `/api/auth/token/refresh/`

## 📝 API Endpoints

### Pacientes
- `GET /api/pacientes/` - Listar pacientes
- `POST /api/pacientes/` - Criar paciente
- `GET /api/pacientes/{id}/` - Detalhar paciente
- `PUT /api/pacientes/{id}/` - Atualizar paciente
- `DELETE /api/pacientes/{id}/` - Excluir paciente

### Odontogramas
- `GET /api/odontograma/` - Listar odontogramas
- `POST /api/odontograma/` - Criar odontograma
- `GET /api/odontograma/{id}/` - Detalhar odontograma
- `PUT /api/odontograma/{id}/` - Atualizar odontograma
- `DELETE /api/odontograma/{id}/` - Excluir odontograma

### Orçamentos
- `GET /api/orcamentos/` - Listar orçamentos
- `POST /api/orcamentos/` - Criar orçamento
- `GET /api/orcamentos/{id}/` - Detalhar orçamento
- `PUT /api/orcamentos/{id}/` - Atualizar orçamento
- `DELETE /api/orcamentos/{id}/` - Excluir orçamento

### Financeiro
- `GET /api/financeiro/` - Listar lançamentos
- `POST /api/financeiro/` - Criar lançamento
- `GET /api/financeiro/{id}/` - Detalhar lançamento
- `PUT /api/financeiro/{id}/` - Atualizar lançamento
- `DELETE /api/financeiro/{id}/` - Excluir lançamento

### Estoque
- `GET /api/estoque/` - Listar produtos
- `POST /api/estoque/` - Criar produto
- `GET /api/estoque/{id}/` - Detalhar produto
- `PUT /api/estoque/{id}/` - Atualizar produto
- `DELETE /api/estoque/{id}/` - Excluir produto

## 🤝 Contribuindo

1. Faça um fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/NovaFuncionalidade`)
3. Commit suas mudanças (`git commit -m 'Adiciona nova funcionalidade'`)
4. Push para a branch (`git push origin feature/NovaFuncionalidade`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT.

## 👨‍💻 Autor

**David Breno**

## 📞 Suporte

Para suporte, abra uma issue no GitHub ou entre em contato.

---

⭐ Se este projeto foi útil, considere dar uma estrela!

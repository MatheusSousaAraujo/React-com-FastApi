# API-CRUD com React + FastAPI

Este projeto integra um frontend em React com um backend em FastAPI, formando uma aplicação CRUD completa.

---

## 🛠 Tecnologias Utilizadas

- **Backend:** Python, FastAPI  
- **Frontend:** React.js  
- **Comunicação:** Axios  
- **Roteamento:** React Router DOM  
- **Ambiente Virtual:** venv (Python)

---

## 🚀 Como Rodar Este Projeto

### 🔧 Pré-requisitos

Certifique-se de ter instalado:

- Python 3.10 ou superior
- Node.js (com npm)
- Git (opcional, mas recomendado)

---

### 📁 1. Clone o projeto e acesse o diretório

```bash
git clone https://github.com/seu-usuario/React-com-FastApi.git
cd React-com-FastApi
```

> Se não estiver usando Git, apenas baixe e extraia o projeto e abra no terminal a pasta `React-com-FastApi`.

---

### 🌐 2. Configure o Frontend (React)

#### 2.1 Crie o projeto React

```bash
npx create-react-app frontend
```

#### 2.2 Substitua o conteúdo

Após criado, **substitua o conteúdo da pasta `frontend`** pelo seu código customizado, mantendo a pasta `node_modules`.

#### 2.3 Instale as dependências necessárias

```bash
cd frontend
npm install react-router-dom axios
```

#### 2.4 Inicie o servidor React

```bash
npm start
```

A aplicação React será iniciada em:

```
http://localhost:3000
```

---

### 🐍 3. Configure o Backend (FastAPI)

#### 3.1 Volte para a raiz do projeto (caso esteja dentro de `frontend`)

```bash
cd ..
```

#### 3.2 Crie o ambiente virtual Python

```bash
python -m venv .venv
```

#### 3.3 Ative o ambiente virtual

- **No Windows**:

```bash
.venv\Scripts\activate
```

- **No macOS/Linux**:

```bash
source .venv/bin/activate
```

> Você saberá que está ativo quando o nome do ambiente (`.venv`) aparecer antes do prompt no terminal.

#### 3.4 Instale as dependências

Certifique-se de que o arquivo `requirements.txt` está na raiz e execute:

```bash
pip install -r requirements.txt
```

*(Opcional, mas recomendado:)*

```bash
python -m pip install --upgrade pip
```

#### 3.5 Execute a aplicação FastAPI

```bash
python run.py
```

A API será iniciada normalmente em:

```
http://localhost:8000
```

Você pode acessar a documentação automática da API em:

```
http://localhost:8000/docs
```

---

## ✅ Pronto!

Agora você tem:

- O **frontend React** rodando em `http://localhost:3000`
- O **backend FastAPI** rodando em `http://localhost:8000`

Ambos os serviços estão prontos para interagir entre si via chamadas HTTP (por exemplo, com `axios` no frontend chamando rotas do backend).

---

## 📂 Estrutura esperada do projeto

```
React-com-FastApi/
├── frontend/              # Projeto React
│   ├── public/
│   ├── src/
│   └── package.json
│
├── app/                   # Pasta com os arquivos da API (pode variar)
│   └── ...
├── .venv/                 # Ambiente virtual Python (ignorado no Git)
├── requirements.txt       # Dependências do backend
├── run.py                 # Arquivo principal para rodar o backend
└── README.md              # Este arquivo
```

---

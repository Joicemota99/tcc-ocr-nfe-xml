# SIG-DB: Sistema de Gestão de Depósitos de Bebidas (API)

Este repositório contém o **Backend (API)** desenvolvido como parte do Trabalho de Conclusão de Curso (TCC II) de Engenharia de Software.

O sistema foi construído utilizando **Node.js**, **NestJS** e **PostgreSQL**, integrando funcionalidades de gestão (CRUD) e automação via **OCR** e leitura de **XML**.

---

## 📋 Pré-requisitos

Para executar este projeto, certifique-se de ter as seguintes ferramentas instaladas em sua máquina:

* **Node.js** (Versão 18 ou superior - LTS recomendada)
* **NPM** (Gerenciador de pacotes padrão do Node)
* **PostgreSQL** (Banco de dados relacional)
* **Postman** ou **Insomnia** (Para testar as rotas da API, já que não há interface gráfica)
* **Git** (Para clonar o repositório)

---

## 🚀 Passo a Passo para Instalação e Execução

### 1. Clonar o Repositório

Abra o terminal e execute o comando:

```bash
git clone [https://github.com/Joicemota99/sig-db-api.git](https://github.com/Joicemota99/sig-db-api.git)
cd sig-db-api
```
### 2. Instalar Dependências
Instale as bibliotecas necessárias (incluindo NestJS, TypeORM e Tesseract.js) com o comando:

```bash
npm install
```
### 3. Configuração do Banco de Dados
Certifique-se de que o serviço do PostgreSQL está rodando.

Crie um banco de dados vazio chamado sig_db (ou o nome que preferir). Você pode fazer isso via pgAdmin ou linha de comando:
```bash
SQL
CREATE DATABASE sig_db;
```
### 4. Configuração das Variáveis de Ambiente (.env)
Na raiz do projeto, crie um arquivo chamado .env. Copie e cole o conteúdo abaixo, ajustando conforme as credenciais do seu PostgreSQL local:

# Configuração da Aplicação
PORT=3000

# Configuração do Banco de Dados (Ajuste USER e PASSWORD conforme sua máquina)
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=sua_senha_aqui
DB_NAME=sig_db

# Configuração de Segurança (JWT)
JWT_SECRET=chave_secreta_tcc_2025
JWT_EXPIRATION=1d

### 5. Executar a Aplicação
Com tudo configurado, inicie o servidor de desenvolvimento:

```bash
npm run start:dev
```
Se tudo estiver correto, você verá logs do NestJS indicando que a aplicação iniciou e conectou ao banco de dados com sucesso. O servidor estará rodando em http://localhost:3000.
---
## 🧪 Como Testar
Como o projeto foca no Backend, a validação deve ser feita via requisições HTTP.
---
### 2. Fluxo de Teste Recomendado (Via Postman)
Siga esta ordem para validar as funcionalidades implementadas:

A. Onboarding (Criação Inicial)
Como o banco começa vazio, é necessário criar a primeira empresa e o usuário Administrador.

Rota: POST /companies/onboard

Body (JSON):

```bash

{
  "name": "Depósito Alcear Bebidas",
  "cnpj": "12.345.678/0001-90",
  "full_name": "Joice",
  "email": "joice@depositoalcear.com",
  "password": "12345678",
  "phone": "+55 71 98888-7777"
}
```
B. Autenticação (Login)
Rota: POST /auth/login

Body (JSON):

```bash
{
  "email": "admin@tcc.com",
  "password": "123456"
}
```
Resposta: Copie o access_token retornado. Atenção: Todas as rotas abaixo exigem este token no Header (Authorization: Bearer <token>).

C. Gestão (CRUDs)
Com o token, você pode testar:

POST /users - Cr

POST /products - Criar produto manualmente.

GET /products - Listar produtos.

GET /products?q=coca - listar produto específico por texto.

GET /products/ID - listar produto específico por ID.

PUT /products/ID - Editar produto.

PATCH /products/ID - Desativar e ativar produtos

POST /companies-suppliers - Criar fornecedor.

GET /companies-suppliers - Listar fornecedores.

PUT /companies-suppliers - Editar fornecedores.

PATCH /companies-suppliers/id/status - Ativar ou desativar fornecedores.

POST /companies - Criar Empresa.

PATCH /companies/{id} - Atualizar Empresa.

PUT /roles/{id} - Atualizar Empresa.

DELETE /companies/{id} - Deletar Empresa.

GET /companies - Listar Empresa.

Criar User
POST http://localhost:3001/users

Login
POST http://localhost:3001/auth/login

Atualização de User
PUT http://localhost:3001/users/uuid-do-user

Listar usuarios
GET http://localhost:3001/users

Criar cargo
POST http://localhost:3001/roles

Atualizar cargo
http://localhost:3001/role/uuid-do-cargo

Listar cargos
GET http://localhost:3001/roles

OCR

Invoices
POST http://localhost:3001/invoices/ocr

XML
POST http://localhost:3001/invoices/company/uuid-do-fornecedor/xml

OCR
POST http://localhost:3001/invoices/company/uuid-do-fornecedor/

Body: Selecione form-data. Adicione um campo file e faça o upload de uma imagem de nota fiscal (formato .jpg ou .png).

Resultado Esperado: A API retornará um JSON com os dados extraídos (Nome do produto, valor, etc.) e, dependendo da implementação, já criará o registro no banco.

🛠 Tecnologias Principais
NestJS: Framework para construção de aplicações Node.js escaláveis.

TypeORM: ORM para interação com o banco de dados PostgreSQL.

Tesseract.js: Biblioteca utilizada para o motor de OCR (leitura de imagens).

Passport/JWT: Estratégia de autenticação e segurança.

📞 Suporte
Em caso de dúvidas ou problemas na execução, favor entrar em contato com a aluna responsável: Joice Oliveira Mota

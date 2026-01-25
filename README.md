# 📚 Sistema de Biblioteca - Desafio Técnico Fullstack

Sistema de gerenciamento de biblioteca desenvolvido com foco rigoroso em **Arquitetura Escalável** e **Segurança**. O projeto demonstra a aplicação de padrões de projetos modernos tanto no Backend (NestJS) quanto no Frontend (Angular).

---

## 🏛️ Arquitetura e Stack Tecnológica

### Backend (NestJS + TypeORM)
O backend foi construído seguindo uma arquitetura modular, garantindo baixo acoplamento e alta coesão.

- **Design Patterns**: Utilização intensiva de **Injeção de Dependência** e **Separation of Concerns** (Services para regra de negócio, Controllers para roteamento, DTOs para validação de entrada).
- **ORM & Database**: Modelagem relacional via **TypeORM** com MySQL. Uso de *Cascades* para integridade referencial (ex: ao remover um usuário, o histórico não quebra o banco).
- **Validações**: Pipes de validação globais e DTOs com `class-validator` para garantir a sanidade dos dados antes de atingirem a camada de serviço.

### Frontend (Angular 21)
A interface foi desenvolvida utilizando práticas modernas do framework para garantir performance e organização.

- **Standalone Components**: Estrutura atualizada do Angular que reduz a complexidade do código e facilita a criação de novas telas.
- **Organização e Reutilização**: A lógica de busca de dados (API) foi separada da construção visual (HTML/CSS), tornando o código mais limpo e fácil de manter.
- **Gerenciamento de Estado e Dados**: Controle eficiente das requisições ao backend e da atualização da tela, garantindo que o usuário tenha feedback visual instantâneo (como mensagens de erro).

---
## 🐳 Infraestrutura e Dados

O ambiente de desenvolvimento foi conteinerizado para garantir consistência.

- **Docker**: O banco de dados **MySQL** roda isolado em um container Docker, orquestrado via `docker-compose`. Isso garante que o ambiente de banco seja reproduzível e isolado do sistema operacional host.
- **Seed Database**: Foi desenvolvido um script de **Seed** personalizado (`npm run seed`) que popula o banco com livros técnicos reais e limpa inconsistências, facilitando testes e demonstrações.

---

## 🔒 Segurança e Autenticação

A segurança foi uma prioridade no design da API, implementando uma estratégia de defesa em profundidade:

1.  **JWT (JSON Web Token)**: Autenticação *stateless*. O token é gerado no login e deve ser enviado no cabeçalho `Authorization` de todas as requisições protegidas.
2.  **Guards Personalizados**:
    - `JwtAuthGuard`: Verifica a validade e expiração do token.
    - `RolesGuard`: Implementa **RBAC (Role-Based Access Control)**. Utiliza o decorator customizado `@Roles('ADMIN', 'CLIENT')` para blindar endpoints sensíveis.
3.  **Criptografia**: As senhas são armazenadas utilizando **Bcrypt** com *salt* 10, garantindo que dados sensíveis nunca fiquem expostos no banco.
4.  **Interceptors (Frontend)**: Um interceptor HTTP injeta automaticamente o token em todas as saídas, centralizando a lógica de autenticação do lado do cliente.

---

## 🔌 Endpoints da API

A API segue estritamente os princípios REST.

| Método | Endpoint | Descrição | Permissão / Role |
| :--- | :--- | :--- | :--- |
| **Auth** | | | |
| `POST` | `/auth/login` | Autentica o usuário e retorna o Token JWT. | 🌍 Pública |
| `POST` | `/auth/register` | Cria uma nova conta de usuário (Cliente). | 🌍 Pública |
| **Livros** | | | |
| `GET` | `/books` | Lista todos os livros do acervo. | 🔐 Autenticado |
| `GET` | `/books/:id` | Detalhes de um livro específico. | 🔐 Autenticado |
| `POST` | `/books` | Cadastra um novo livro técnico. | 👑 Admin |
| `PATCH` | `/books/:id` | Atualiza dados de um livro. | 👑 Admin |
| `DELETE` | `/books/:id` | Remove um livro (se não houver histórico). | 👑 Admin |
| **Reservas** | | | |
| `GET` | `/reservations` | Lista reservas (Admin vê todas, Cliente vê as suas). | 👑 Admin / 👤 Client |
| `POST` | `/reservations` | Realiza a reserva de um livro disponível. | 👤 Client |
| `POST` | `/reservations/:id/return` | Devolve um livro e calcula multas (se houver). | 👑 Admin / 👤 Client |
| **Usuários** | | | |
| `GET` | `/users` | Lista todos os usuários cadastrados. | 🔐 Autenticado |
| `GET` | `/users/:id` | Busca dados de um perfil específico. | 🔐 Autenticado |
| `PATCH` | `/users/:id` | Atualiza dados do perfil (apenas o próprio). | 👤 Client |
| `DELETE` | `/users/:id` | Exclui conta (Admin exclui qualquer um; Cliente exclui a si mesmo). | 👑 Admin / 👤 Client |


---

## ✅ Estratégia de Testes

O projeto conta com uma suíte de testes unitários (**Jest**) focada na resiliência das regras de negócio (Core Domain).

O foco da cobertura não foi apenas "passar linhas", mas garantir comportamentos críticos:
- **Financeiro**: O cálculo de multa (5% ao dia) é validado com precisão matemática em diversos cenários de datas.
- **Identidade**: O algoritmo de validação de CPF e a unicidade de e-mails são testados isoladamente.
- **Fluxo de Auth**: Garantia de que tokens inválidos ou senhas incorretas rejeitem acesso imediatamente.

---

## 🛠️ Stack Utilizada

- **Linguagem**: TypeScript
- **Backend**: NestJS, TypeORM, Passport, JWT, Bcrypt
- **Frontend**: Angular 21, RxJS
- **Banco de Dados**: MySQL 8.0 (Docker Image)
- **Testes**: Jest

## 👨‍💻 Autor

Desenvolvido por **Gabriel Kran** para o Desafio Técnico.
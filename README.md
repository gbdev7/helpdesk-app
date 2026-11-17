# HelpDesk Mobile

![React Native](https://img.shields.io/badge/React_Native-0.81.5-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![Expo](https://img.shields.io/badge/Expo-SDK_54-000020?style=for-the-badge&logo=expo&logoColor=white)
![React](https://img.shields.io/badge/React-19.1.0-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9.3-3178C6?style=for-the-badge&logo=typescript&logoColor=white)

![React Navigation](https://img.shields.io/badge/React_Navigation-7-6B52AE?style=for-the-badge&logo=reactrouter&logoColor=white)
![AsyncStorage](https://img.shields.io/badge/AsyncStorage-2.2-4B8BBE?style=for-the-badge)
![Lucide](https://img.shields.io/badge/Lucide-Icons-F56565?style=for-the-badge&logo=lucide&logoColor=white)
![SVG](https://img.shields.io/badge/React_Native-SVG-FFB13B?style=for-the-badge)

**Sistema de gerenciamento de chamados de suporte técnico**

O HelpDesk Mobile é um aplicativo Android desenvolvido para facilitar o gerenciamento de solicitações de suporte técnico, permitindo que usuários abram chamados, acompanhem seu andamento e interajam com a equipe responsável pelo atendimento.

O projeto foi desenvolvido utilizando React Native e Expo, com integração a uma API REST desenvolvida em Java e Spring Boot.

---

## Sobre o projeto

O objetivo do HelpDesk é oferecer uma solução para organizar e centralizar solicitações de suporte técnico, facilitando a comunicação entre usuários e técnicos.

A aplicação possui diferentes níveis de acesso, permitindo que clientes, técnicos e administradores utilizem funcionalidades específicas de acordo com seus respectivos perfis.

## Tecnologias utilizadas

### Aplicativo Mobile

- React Native
- Expo SDK 54
- TypeScript
- React Navigation
- AsyncStorage
- Lucide React Native

### Backend (API REST)

O backend foi desenvolvido separadamente, utilizando:

- Java 21
- Spring Boot
- Spring Security
- JWT (JSON Web Token)
- PostgreSQL
- Maven

**Hospedagem:** Render

Repositório do backend: [helpdesk-api](https://github.com/gbdev7/helpdesk-api)

**Endereço da API em produção:**

https://helpdesk-api-u1zf.onrender.com

## Funcionalidades

### Autenticação e usuários
- Cadastro de novas contas.
- Login com autenticação JWT.
- Controle de acesso por perfil.
- Perfis disponíveis: CLIENT, TECHNICIAN e ADMIN.

### Gerenciamento de chamados
- Abertura de chamados de suporte.
- Definição de prioridade.
- Visualização dos chamados cadastrados.
- Filtros por status e prioridade.
- Atualização automática da listagem ao atualizar a tela.
- Paginação para carregamento dos chamados.

### Acompanhamento de chamados
- Visualização dos detalhes de cada chamado.
- Acompanhamento do prazo de atendimento (SLA).
- Identificação de chamados dentro ou fora do prazo.
- Adição de comentários e acompanhamento das interações.

### Área do técnico e administrador
- Visualização e gerenciamento de chamados.
- Assumir chamados disponíveis.
- Atribuir técnicos aos chamados.
- Alterar o status dos atendimentos.
- Visualização da lista de usuários.

---

## Como executar o projeto

### 1. Pré-requisitos

Para executar o projeto em ambiente de desenvolvimento, é necessário ter instalado:

- Node.js (versão LTS recomendada).
- npm.
- Expo Go instalado no celular, caso utilize um dispositivo físico.
- Android Studio, caso queira utilizar um emulador Android.

### 2. Clonar o repositório

Abra o terminal e execute:

```bash
git clone https://github.com/gbdev7/helpdesk-app.git
```

Entre na pasta do projeto:

```bash
cd helpdesk-app
```

### 3. Instalar as dependências

Execute:

```bash
npm install
```

### 4. Iniciar o aplicativo

Execute:

```bash
npx expo start
```

Será exibido um QR Code no terminal ou no navegador.

Para executar no celular, abra o Expo Go e escaneie o QR Code. O computador e o celular devem estar conectados à mesma rede Wi-Fi.

---

## Configuração da API (IMPORTANTE)

O aplicativo precisa estar conectado ao backend para realizar operações como login, cadastro e gerenciamento de chamados.

A API está hospedada na plataforma Render e pode ser acessada pelo seguinte endereço:

```text
https://helpdesk-api-u1zf.onrender.com
```

### Configuração no APK

Ao abrir o aplicativo, na tela de login, existe a opção **Servidor**, que permite configurar o endereço da API.

Para conectar o aplicativo ao backend hospedado, siga os passos:

1. Abra o aplicativo HelpDesk.
2. Na tela inicial de login, selecione a opção **Servidor**.
3. No campo destinado ao endereço do servidor/IP, informe o endereço abaixo:

```text
https://helpdesk-api-u1zf.onrender.com
```

4. Salve a configuração.
5. Retorne à tela de login e utilize o aplicativo normalmente.

**Atenção:** mesmo que o campo seja identificado como IP ou endereço do servidor, deve ser informado o endereço completo acima, incluindo `https://`.

Não é necessário utilizar o IP do computador ou estar conectado à mesma rede Wi-Fi, pois a API está hospedada na internet.

### Sobre a hospedagem da API

O backend está hospedado no Render utilizando o plano gratuito.

Por esse motivo, quando a API fica algum tempo sem receber requisições, o serviço entra automaticamente em modo de suspensão (Hibernate).

Na primeira tentativa de conexão após esse período, pode ocorrer uma demora de aproximadamente **1 minuto** para que o servidor seja inicializado novamente.

Durante esse processo, o aplicativo pode apresentar lentidão ou demorar para responder.

**Isso é esperado e não significa necessariamente que o aplicativo esteja com algum problema.** Aguarde a inicialização do servidor e tente novamente.

Após a primeira inicialização, as próximas requisições tendem a responder normalmente enquanto o serviço permanecer ativo.

---

## Como utilizar o aplicativo

### 1. Cadastro

Na tela inicial, selecione a opção de cadastro e informe os dados solicitados para criar uma conta.

Após o cadastro, utilize suas credenciais para acessar o sistema.

### 2. Login

Informe seu e-mail e senha cadastrados para entrar no aplicativo.

A autenticação é realizada através da API, que utiliza tokens JWT para controlar o acesso.

### 3. Abertura de chamados

Após entrar no aplicativo:

1. Acesse a área de chamados.
2. Selecione a opção para abrir um novo chamado.
3. Informe os dados e a descrição do problema.
4. Escolha a prioridade desejada.
5. Confirme a abertura.

O chamado ficará disponível para acompanhamento.

### 4. Acompanhamento

Na listagem de chamados, é possível visualizar as solicitações cadastradas e acompanhar seus respectivos status e prioridades.

Ao selecionar um chamado, o usuário poderá consultar seus detalhes, acompanhar o prazo de atendimento (SLA) e visualizar os comentários.

### 5. Acesso técnico e administrativo

Contas com perfil de técnico ou administrador possuem funcionalidades adicionais para gerenciamento dos atendimentos.

Entre elas estão assumir chamados, atribuir responsáveis e atualizar o status das solicitações.

---

## Gerar o APK

O projeto possui uma configuração de integração contínua com GitHub Actions para gerar o aplicativo Android.

Para gerar o APK através do GitHub:

1. Acesse o repositório no GitHub.
2. Entre na aba **Actions**.
3. Selecione o workflow **Build APK**.
4. Execute o workflow, caso ele ainda não tenha sido iniciado automaticamente.
5. Aguarde a conclusão do processo.
6. Acesse os artefatos da execução e baixe o arquivo `helpdesk-apk`.
7. Extraia o arquivo ZIP para obter o APK.

Após baixar o APK, transfira-o para um dispositivo Android e realize a instalação.

Também é possível gerar o APK utilizando o EAS Build do Expo.

---

## Backend e infraestrutura

O aplicativo mobile funciona integrado a uma API REST independente.

A comunicação entre as duas aplicações ocorre através de requisições HTTP, permitindo que os dados sejam processados e armazenados pelo backend.

**Aplicativo Mobile:** React Native + Expo.

**Backend:** Java + Spring Boot.

**Banco de dados:** PostgreSQL.

**Hospedagem da API:** Render.

**Autenticação:** JWT.

Repositório da API: https://github.com/gbdev7/helpdesk-api

---

## Desenvolvedor

**Gabriel Pereira da Silva**

GitHub: https://github.com/gbdev7

---

*HelpDesk Mobile: organização, agilidade e praticidade no gerenciamento de chamados de suporte técnico.*

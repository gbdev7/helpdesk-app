# HelpDesk Mobile (React Native + Expo)

App Android para a API [helpdesk-api](https://github.com/gbdev7/helpdesk-api) (Java + Spring Boot + JWT).

## Funcionalidades
- Login com JWT e cadastro de conta (perfis CLIENT, TECHNICIAN, ADMIN)
- Lista de chamados com filtros por status e prioridade, paginação infinita e pull-to-refresh
- Abertura de chamado com prioridade (mostra o SLA de cada uma)
- Detalhe do chamado: SLA em tempo real (vence em / estourado), comentários
- Técnico/Admin: alterar status, atribuir técnico, botão "Assumir"
- Lista de usuários (Técnico/Admin) e perfil
- Endereço do servidor configurável na tela de login (útil em apresentação)

## Rodar em desenvolvimento
```bash
npm install
npx expo start
```
Abra no **Expo Go** (celular) escaneando o QR code. Celular e PC na **mesma rede Wi-Fi**.

## Endereço da API
- Emulador Android: `http://10.0.2.2:8080` (padrão)
- Celular físico: `http://IP_DO_SEU_PC:8080` (ex.: `http://192.168.0.10:8080`)
  - Toque em "Servidor" na tela de login para alterar.
  - Descubra o IP: `ipconfig` (Windows) / `ip a` (Linux) / `ifconfig` (Mac)
  - Libere a porta 8080 no firewall do PC.

## Gerar o APK

### Opção A: GitHub Actions (sem instalar nada)
1. Crie um repositório no GitHub e envie esta pasta (`git push`).
2. Aba **Actions** > workflow **Build APK** (roda sozinho no push, ou clique em *Run workflow*).
3. Quando terminar (~10-15 min), abra a execução e baixe o artefato **helpdesk-apk** (zip com o `.apk`).
4. Passe o `.apk` para o celular, abra e instale (permita "instalar de fontes desconhecidas").

### Opção B: EAS Build (conta gratuita Expo)
```bash
npm i -g eas-cli
eas login
eas build -p android --profile preview
```
Ao final, o EAS fornece um link/QR para baixar o APK.

## Subindo a API para apresentar
```bash
docker compose up -d
./mvnw spring-boot:run
```
Crie um usuário pelo próprio app (tela "Cadastre-se") ou pelo `testes.http` da API.

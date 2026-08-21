# Descoberta segura do relatório SIGC

O utilitário abre o relatório em um perfil dedicado do Edge e registra somente URL, método, status e tipo das chamadas de rede candidatas. Cookies, cabeçalhos de autenticação e conteúdo das respostas não são gravados.

## Primeira execução

```powershell
npm install
npm run sigc:discover
```

Na primeira abertura, faça login manualmente. A sessão fica no diretório local `.sigc-automation-profile` e será reutilizada nas próximas execuções.

No navegador aberto, atualize o relatório e clique na exportação desejada. Depois volte ao terminal e pressione Enter. Os metadados ficam em `automation/output`.

## URL alternativa

```powershell
npm run sigc:discover -- --url=https://www.sigc.com.br/relatorios/ID
```

Nunca publique o perfil de automação nem arquivos baixados do SIGC.

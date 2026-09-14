# 🚀 Como colocar o enjoygo no GitHub

## Seu projeto já está pronto e com git iniciado!

### Opção 1 - Pelo site do GitHub (MAIS FÁCIL):

1. Vá em https://github.com/new
2. Nome do repositório: `enjoygo`
3. Deixe público, NÃO marque "Add README"
4. Clique em "Create repository"
5. Depois copie os comandos que o GitHub mostra, ou use estes:

```bash
cd /caminho/para/enjoygo
git remote add origin https://github.com/SEU_USUARIO/enjoygo.git
git push -u origin main
```

### Opção 2 - Com GitHub CLI (se tiver):

```bash
gh repo create enjoygo --public --source=. --remote=origin --push
```

### Depois de fazer push:

1. No GitHub, vá em: Settings → Pages
2. Em "Build and deployment" selecione: GitHub Actions
3. Pronto! A cada push na main, o deploy roda automático
4. Seu jogo vai ficar em: `https://SEU_USUARIO.github.io/enjoygo/`

### Testar local sem ngrok (SEM ERRO 3200):

```bash
npm install
npx expo start --lan
# Celular e PC no mesmo Wi-Fi

# OU web que funciona 100%:
npm run web
```


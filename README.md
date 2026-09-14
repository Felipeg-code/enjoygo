# 🎮 enjoygo - RPG Vertical estilo Clash of Clans

RPG mobile vertical com joystick fluido + auto-walk (clica na missão e vai sozinho!)

![enjoygo](https://img.shields.io/badge/Expo-57-000020?style=for-the-badge&logo=expo)
![Platform](https://img.shields.io/badge/Platform-Android%20%7C%20iOS%20%7C%20Web-blue?style=for-the-badge)

## 🚀 Jogar Agora (sem Expo Go)

**Versão Web - Funciona no celular sem instalar nada:**

Depois de fazer deploy no GitHub Pages, seu link será:
`https://SEU_USUARIO.github.io/enjoygo/`

Ou rode local:
```bash
npm install
npm run web
```

## 📱 Rodar no Expo Go (local, sem ngrok)

O erro `err_ngrok_3200` acontece porque o tunnel gratuito do Expo tem limite. Use modo LAN:

```bash
npm install
npx expo start --lan
# ou
npx expo start --offline
```

**Importante:** Celular e PC precisam estar no mesmo Wi-Fi!

Se ainda quiser tunnel:
```bash
npm install -g @expo/ngrok
npx expo start --tunnel
# Crie conta grátis no ngrok.com e configure authtoken se pedir
```

## 🎮 Como Jogar

- **Joystick** inferior esquerdo → mover personagem
- **Toque nas missões** (painel direito) → auto-walk até o objetivo
- **Toque no mapa** → vai até o ponto clicado
- **Botão ⚔️** → atacar/interagir
- Complete missões para ganhar ouro e XP!

## ✨ Features

- ✅ Formato vertical (portrait)
- ✅ Joystick 60fps fluido com PanResponder
- ✅ Auto-walk inteligente (anti-enjoo)
- ✅ Gráficos estilo Clash of Clans (sprites gerados)
- ✅ Sistema de quests com distância e recompensas
- ✅ Mundo 2400x2400 com câmera suave
- ✅ UI completa com ouro, level, XP
- ✅ Funciona em Android, iOS e Web

## 📁 Estrutura

```
enjoygo/
├── App.js              # Jogo completo
├── assets/
│   ├── player.png      # Herói chibi
│   ├── house.png       # Casa medieval
│   ├── tree.png        # Árvore
│   └── ...
├── app.json            # Config Expo
└── package.json
```

## 🌐 Deploy GitHub Pages (Recomendado)

Este repo já vem com GitHub Actions para deploy automático!

1. Crie repo no GitHub com nome `enjoygo`
2. Push o código:
```bash
git init
git add .
git commit -m "feat: initial enjoygo rpg"
git branch -M main
git remote add origin https://github.com/SEU_USUARIO/enjoygo.git
git push -u origin main
```
3. No GitHub: Settings → Pages → Source: GitHub Actions
4. A cada push na main, o jogo vai pra `https://SEU_USUARIO.github.io/enjoygo/`

## 🔧 Build APK

```bash
# Com EAS (mais fácil)
npm install -g eas-cli
eas login
eas build --platform android --profile preview

# Ou local
npx expo prebuild
cd android && ./gradlew assembleRelease
```

## 🐛 Solução err_ngrok_3200

Esse erro é do ngrok gratuito. Soluções:

1. **Use LAN** (mesmo Wi-Fi): `npx expo start --lan`
2. **Use Web**: `npm run web` - funciona 100%
3. **Configure ngrok**: Crie conta em https://dashboard.ngrok.com/get-started/your-authtoken
   ```bash
   npx expo install @expo/ngrok
   ngrok config add-authtoken SEU_TOKEN
   npx expo start --tunnel
   ```
4. **Deploy no GitHub Pages** e jogue pelo link (recomendado!)

## 🚧 Roadmap

- [ ] Multiplayer com Socket.io
- [ ] A* Pathfinding para desviar de obstáculos
- [ ] Inventário e loja
- [ ] Sistema de combate
- [ ] Mapa isométrico real

---

Feito com ❤️ - Toque na missão e deixa o personagem ir sozinho!

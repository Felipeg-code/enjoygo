# ⚔️ Champions of Norrath - 2.5D Isometric Action RPG

Esqueleto e motor completo de RPG Hack & Slash 2.5D Isométrico inspirado no clássico **Champions of Norrath** (Snowblind Studios / PS2).

![Platform](https://img.shields.io/badge/Platform-Web%20%7C%20Android%20%7C%20iOS-gold?style=for-the-badge)
![Engine](https://img.shields.io/badge/Engine-Isometric%202.5D%20Canvas-red?style=for-the-badge)

---

## 🎮 Jogue Agora Direto no Navegador

👉 **[https://felipeg-code.github.io/enjoygo/](https://felipeg-code.github.io/enjoygo/)**

---

## ⚔️ Características do Esqueleto (Champions of Norrath)

- 🏰 **Perspectiva Isométrica 2.5D:** Projeção angular clássica de masmorra com profundidade, paredes com elevação e ordenação por profundidade (*Y-sorting*).
- 🔴🔵 **Globos Góticos de Vida e Mana:** Globos com líquido animado em tempo real no canto inferior esquerdo e direito.
- 🗡️ **5 Classes Autênticas:**
  - **Bárbaro Guerreiro:** Alto dano físico, armas pesadas e ataques de impacto.
  - **Elfa Ranger:** Arqueira de longa distância com flechas múltiplas e gelo.
  - **Clériga:** Maças sagradas, auras protetoras e cura divina.
  - **Mago Erudita:** Bolas de fogo destrutivas e tempestades de raios.
  - **Cavaleiro das Sombras:** Necromancia, dreno de vida (*Life Tap*) e doenças.
- 🛡️ **Combate Hack & Slash:**
  - Golpe com espada e arco com cálculo de dano crítico.
  - **Bloqueio ativo com escudo:** Reduz o dano em 80% com som metálico de ricochete.
  - Tremores de tela (*screen shake*), sangue e números de dano flutuantes.
- 🎒 **Inventário Paperdoll:**
  - Slots individuais para Elmo, Peitoral, Luvas, Botas, Arma, Escudo, Anel e Amuleto.
  - Cinto de atalhos rápidos de poções e magias.
- 🌀 **Pergaminho de Retorno (Town Portal):** Retorne ao santuário a qualquer momento para se curar.
- 🔊 **Áudio Sintetizado 100% Nativo:** Efeitos sonoros retrô de espada, magia, bloqueio e moedas via Web Audio API (sem precisar de arquivos externos pesados).
- 📱 **Multiplataforma:** Suporte a controles touch (Joystick virtual + botões na tela) e PC (WASD + Espaço + Teclas 1 a 4).

---

## 🕹️ Controles

| Ação | PC (Teclado) | Celular (Touch) |
| :--- | :--- | :--- |
| **Mover** | `W`, `A`, `S`, `D` ou Setas | Joystick Virtual Esquerdo |
| **Atacar** | Barra de Espaço (`Space`) | Botão ⚔️ ATACAR |
| **Bloquear Escudo** | `Shift` | Botão 🛡️ BLOQUEAR |
| **Poção de Vida** | `1` | Slot 1 no cinto |
| **Poção de Mana** | `2` | Slot 2 no cinto |
| **Magia 1** | `3` | Slot 3 no cinto |
| **Magia 2** | `4` | Slot 4 no cinto |
| **Portal da Cidade** | `T` | Slot 🌀 no cinto |
| **Abrir Inventário** | `I` | Botão 🎒 no topo |

---

## 📁 Estrutura do Código

```
├── champions-of-norrath.html  # Motor isométrico principal completo
├── index.html                 # Página inicial para GitHub Pages
├── App.js                     # Container React Native / Expo WebView
├── .github/workflows/
│   ├── deploy.yml             # Deploy automático no GitHub Pages
│   ├── build-apk.yml          # Build do APK nativo
│   └── build-apk-webview.yml  # Build do APK WebView 100% offline
└── package.json
```

# 📱 Como gerar APK do enjoygo para Android

## Método 1 - GitHub Actions (MAIS FÁCIL - Recomendado) ⭐

**Não precisa instalar nada no Debian! O GitHub builda pra você.**

1. Crie repo no GitHub com nome `enjoygo` (https://github.com/new)
2. Envie o código:
```bash
cd enjoygo
git remote add origin https://github.com/SEU_USUARIO/enjoygo.git
git push -u origin main
```
3. Vá em **Actions** no GitHub → vai ver "Build APK" rodando
4. Quando terminar (5-10 min), vá em **Actions** → último workflow → **Artifacts** → baixe `enjoygo-apk`
5. Ou vá em **Releases** → baixe o APK da última release

O APK fica em `app-release.apk` - é só instalar no celular!

**Ative também Pages para versão web:**
Settings → Pages → Source: GitHub Actions

---

## Método 2 - EAS Build (Nuvem Expo) - Fácil também

**Builda na nuvem da Expo, sem Android SDK local.**

```bash
# No Debian, dentro da pasta enjoygo:
npm install -g eas-cli
eas login
# Crie conta grátis em https://expo.dev se não tiver

# Configure (primeira vez):
eas build:configure

# Build APK:
eas build --platform android --profile preview
```

Vai gerar link para baixar APK. Demora 10-15 min na fila gratuita.

Para build local (precisa Android SDK):
```bash
eas build --platform android --profile preview --local
```

---

## Método 3 - Build Local no Debian (Avançado)

**Precisa Android SDK + Java 17.**

### Instalar dependências Debian:

```bash
# Java 17
sudo apt update
sudo apt install -y openjdk-17-jdk

# Android SDK
mkdir -p ~/Android/Sdk
cd ~/Android/Sdk
wget https://dl.google.com/android/repository/commandlinetools-linux-11076708_latest.zip
unzip commandlinetools-linux-11076708_latest.zip
mkdir -p cmdline-tools/latest
mv cmdline-tools/* cmdline-tools/latest/ 2>/dev/null || true

export ANDROID_HOME=$HOME/Android/Sdk
export PATH=$PATH:$ANDROID_HOME/cmdline-tools/latest/bin:$ANDROID_HOME/platform-tools

# Aceitar licenças e instalar plataformas
yes | sdkmanager --licenses
sdkmanager "platform-tools" "platforms;android-34" "build-tools;34.0.0"
```

### Buildar APK:

```bash
cd enjoygo
npm install --legacy-peer-deps
npx expo prebuild --platform android --clean
cd android
./gradlew assembleRelease

# APK em:
# android/app/build/outputs/apk/release/app-release.apk
```

### Instalar no celular:

```bash
# Via USB com debug ativado:
adb install android/app/build/outputs/apk/release/app-release.apk

# Ou copie APK pro celular e instale manualmente
# Ative "Instalar apps desconhecidos" no Android
```

---

## Método 4 - PWA (Instalar como App sem APK)

**Transforma versão web em app instalável:**

1. Abra `enjoygo-web.html` no Chrome no celular
2. Menu (3 pontinhos) → **"Adicionar à tela inicial"** ou **"Instalar app"**
3. Vira app com ícone, sem Play Store!

Ou use Bubblewrap para gerar APK de PWA:
```bash
npm i -g @bubblewrap/cli
bubblewrap init --manifest https://SEU_USUARIO.github.io/enjoygo/manifest.json
bubblewrap build
```

---

## 📦 APK Debug vs Release

- **Debug**: `assembleDebug` - funciona mas pede permissão, maior
- **Release**: `assembleRelease` - otimizado, precisa assinar para Play Store

Para testar no seu celular, debug já serve!

## 🔧 Solução de problemas

**Erro Java version:**
```bash
java -version # deve ser 17+
sudo update-alternatives --config java
```

**Erro SDK not found:**
```bash
export ANDROID_HOME=$HOME/Android/Sdk
export PATH=$PATH:$ANDROID_HOME/cmdline-tools/latest/bin
echo 'export ANDROID_HOME=$HOME/Android/Sdk' >> ~/.bashrc
```

**Erro de permissão ao instalar APK no celular:**
- Ative: Configurações → Segurança → Instalar apps desconhecidos → Permitir

---

## 🚀 Recomendação

Use **Método 1 - GitHub Actions** - é o mais fácil, não instala nada, e ainda ganha link web permanente + APK automático a cada push!

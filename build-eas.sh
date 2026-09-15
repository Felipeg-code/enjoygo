#!/bin/bash
# enjoygo - Build APK via EAS (Nuvem Expo) - Debian
# Gera APK sem precisar Android SDK local

set -e

echo "🎮 enjoygo - EAS Build - APK na nuvem"
echo "======================================"
echo ""

# Verifica Node
if ! command -v node &> /dev/null; then
  echo "📦 Instalando Node.js 20..."
  curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
  sudo apt-get install -y nodejs
fi

echo "✅ Node: $(node -v)"

# Verifica se está na pasta enjoygo
if [ ! -f "app.json" ]; then
  if [ -d "enjoygo" ]; then
    cd enjoygo
  else
    echo "❌ Não encontrou app.json"
    echo "   Rode: cd enjoygo"
    exit 1
  fi
fi

# Instala dependências
if [ ! -d "node_modules" ]; then
  echo "📦 Instalando dependências..."
  npm install --legacy-peer-deps
fi

# Instala EAS CLI se não tiver
if ! command -v eas &> /dev/null; then
  echo "📦 Instalando EAS CLI..."
  npm install -g eas-cli
fi

echo "✅ EAS CLI: $(eas --version)"

echo ""
echo "🔐 PASSO 1 - Login na Expo"
echo "---------------------------"
echo "Você precisa de conta grátis na Expo:"
echo "  1. Crie em https://expo.dev/signup (30 seg)"
echo "  2. Depois rode: eas login"
echo ""
read -p "Já tem conta e quer fazer login agora? (s/n): " do_login
if [[ "$do_login" == "s" || "$do_login" == "S" ]]; then
  eas login
else
  echo "👉 Rode manualmente depois: eas login"
fi

echo ""
echo "⚙️  PASSO 2 - Configurar projeto"
echo "--------------------------------"
if [ ! -f "eas.json" ]; then
  echo "Criando eas.json..."
  cat > eas.json << 'EOF'
{
  "cli": { "version": ">= 5.9.0" },
  "build": {
    "preview": {
      "distribution": "internal",
      "android": { "buildType": "apk" }
    },
    "production": {
      "android": { "buildType": "apk" }
    }
  }
}
EOF
fi

# Configura projeto EAS (cria projectId)
echo "Configurando projeto na nuvem..."
eas build:configure --platform android || echo "⚠️  Se pedir projectId, confirme com Enter"

echo ""
echo "🚀 PASSO 3 - Build APK na nuvem"
echo "-------------------------------"
echo "Isso vai enviar seu código pra nuvem da Expo e buildar APK"
echo "Fila gratuita: 10-20 minutos"
echo ""
read -p "Começar build agora? (s/n): " do_build
if [[ "$do_build" == "s" || "$do_build" == "S" ]]; then
  echo "🔨 Iniciando build..."
  eas build --platform android --profile preview --non-interactive || eas build --platform android --profile preview
else
  echo ""
  echo "👉 Para buildar depois, rode:"
  echo "   eas build --platform android --profile preview"
  echo ""
  echo "📱 Depois do build, você recebe link para baixar APK"
  echo "   Exemplo: https://expo.dev/accounts/SEUUSER/projects/enjoygo/builds/XXXX"
  echo ""
  echo "💡 Dica: Use --clear-cache se der erro:"
  echo "   eas build --platform android --profile preview --clear-cache"
fi

echo ""
echo "✅ Pronto!"
echo ""
echo "📱 Como instalar APK no celular:"
echo "  1. Baixe APK do link que o EAS der"
echo "  2. Envie pro celular (Telegram, Drive, cabo USB)"
echo "  3. No Android: abra APK e permita 'Instalar apps desconhecidos'"
echo "  4. Instale e jogue!"
echo ""
echo "🌐 Versão WEB também funciona:"
echo "  npm run web"
echo "  Abre em http://localhost:19006"

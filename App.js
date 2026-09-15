import React, { useState } from 'react';
import { StyleSheet, View, ActivityIndicator, Text, TouchableOpacity, Linking, Platform } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { WebView } from 'react-native-webview';

// VERSÃO FINAL - Carrega o jogo completo com loja + gemas
// Se estiver offline, carrega HTML embarcado

const GAME_URL = 'https://felipeg-code.github.io/enjoygo/enjoygo-final.html';

// HTML embarcado fallback - versão simplificada que carrega o jogo
const FALLBACK_HTML = `
<!DOCTYPE html>
<html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1,user-scalable=no">
<style>body{margin:0;background:#1a0f0a;display:flex;justify-content:center;align-items:center;height:100vh;color:#FFD700;font-family:sans-serif;text-align:center}
.box{background:#3e2723;border:4px solid #000;border-radius:16px;padding:20px;max-width:320px;box-shadow:0 6px 0 #000}
.btn{background:linear-gradient(#FFD700,#FF8f00);color:#000;border:4px solid #000;padding:12px 24px;border-radius:12px;font-weight:900;margin-top:12px;display:inline-block;box-shadow:0 4px 0 #000}
</style></head><body>
<div class="box">
<div style="font-size:48px">🏪💎</div>
<h2 style="color:#FFD700">ENJOYGO FINAL</h2>
<p style="color:#c9b896;font-size:12px">Sem internet! Conecte-se para jogar a versão completa com loja e gemas.</p>
<p style="color:#8d6e63;font-size:10px">Versão com 5 atos, dungeons, mercador, 8 tipos de gemas, 4 slots por item, visual muda, colisões, tudo!</p>
<div class="btn" onclick="location.reload()">🔄 TENTAR NOVAMENTE</div>
<br><br>
<div style="font-size:10px;color:#5d4037">Se o problema persistir, abra no navegador:<br>felipeg-code.github.io/enjoygo/enjoygo-final.html</div>
</div>
</body></html>
`;

export default function App() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [useFallback, setUseFallback] = useState(false);

  return (
    <View style={styles.container}>
      <StatusBar style="light" backgroundColor="#000" />
      
      {!useFallback ? (
        <WebView
          source={{ uri: GAME_URL }}
          style={styles.webview}
          originWhitelist={['*']}
          javaScriptEnabled={true}
          domStorageEnabled={true}
          allowFileAccess={true}
          allowUniversalAccessFromFileURLs={true}
          mixedContentMode="always"
          allowsInlineMediaPlayback={true}
          mediaPlaybackRequiresUserAction={false}
          startInLoadingState={true}
          renderLoading={() => (
            <View style={styles.loading}>
              <ActivityIndicator size="large" color="#FFD700" />
              <Text style={styles.loadingText}>🏪💎 Carregando ENJOYGO FINAL...</Text>
              <Text style={styles.loadingSub}>Loja + Gemas 4 Slots + 5 Atos</Text>
              <Text style={styles.loadingSub2}>Champions of Norrath × Clash of Clans</Text>
            </View>
          )}
          onLoadStart={() => setLoading(true)}
          onLoadEnd={() => setLoading(false)}
          onError={() => {
            setError(true);
            setUseFallback(true);
          }}
          onHttpError={(e) => {
            if (e.nativeEvent.statusCode >= 400) {
              setUseFallback(true);
            }
          }}
        />
      ) : (
        <WebView
          source={{ html: FALLBACK_HTML }}
          style={styles.webview}
          originWhitelist={['*']}
        />
      )}

      {error && !useFallback && (
        <View style={styles.errorBox}>
          <Text style={styles.errorText}>⚠️ Sem conexão - Tentando carregar...</Text>
        </View>
      )}

      {/* Botão flutuante para abrir no navegador se precisar */}
      <TouchableOpacity 
        style={styles.browserBtn}
        onPress={() => Linking.openURL(GAME_URL)}
      >
        <Text style={styles.browserBtnText}>🌐 ABRIR NO NAVEGADOR</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  webview: {
    flex: 1,
    backgroundColor: '#1a0f0a',
  },
  loading: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#1a0f0a',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  loadingText: {
    color: '#FFD700',
    fontSize: 16,
    fontWeight: '900',
    marginTop: 16,
    letterSpacing: 1,
  },
  loadingSub: {
    color: '#c9b896',
    fontSize: 12,
    fontWeight: '700',
    marginTop: 8,
  },
  loadingSub2: {
    color: '#8d6e63',
    fontSize: 10,
    fontWeight: '600',
    marginTop: 4,
  },
  errorBox: {
    position: 'absolute',
    top: 50,
    left: 20,
    right: 20,
    backgroundColor: '#3e2723',
    borderWidth: 3,
    borderColor: '#ff5252',
    borderRadius: 12,
    padding: 12,
    zIndex: 20,
  },
  errorText: {
    color: '#ff5252',
    fontWeight: '900',
    fontSize: 12,
    textAlign: 'center',
  },
  browserBtn: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    backgroundColor: '#000',
    borderWidth: 3,
    borderColor: '#FFD700',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    zIndex: 15,
    opacity: 0.9,
  },
  browserBtnText: {
    color: '#FFD700',
    fontWeight: '900',
    fontSize: 11,
    letterSpacing: 1,
  },
});

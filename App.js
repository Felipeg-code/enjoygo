import React, { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Linking,
  Pressable,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { WebView } from 'react-native-webview';

// URL única publicada pelo workflow do GitHub Pages.
const GAME_URL = 'https://felipeg-code.github.io/enjoygo/';

export default function App() {
  const [attempt, setAttempt] = useState(0);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);

  const retry = useCallback(() => {
    setFailed(false);
    setLoading(true);
    setAttempt((value) => value + 1);
  }, []);

  return (
    <View style={styles.container}>
      <StatusBar hidden />
      <WebView
        key={attempt}
        originWhitelist={['https://*', 'http://*']}
        source={{ uri: GAME_URL }}
        style={styles.webview}
        javaScriptEnabled
        domStorageEnabled
        cacheEnabled
        cacheMode="LOAD_DEFAULT"
        allowsInlineMediaPlayback
        mediaPlaybackRequiresUserAction={false}
        setSupportMultipleWindows={false}
        overScrollMode="never"
        bounces={false}
        onLoadStart={() => {
          setFailed(false);
          setLoading(true);
        }}
        onLoadEnd={() => setLoading(false)}
        onError={() => {
          setLoading(false);
          setFailed(true);
        }}
        renderLoading={() => null}
        startInLoadingState
      />

      {loading && !failed && (
        <View style={styles.overlay} pointerEvents="none">
          <ActivityIndicator size="large" color="#f5c542" />
          <Text style={styles.title}>ENJOYGO</Text>
          <Text style={styles.subtitle}>Carregando sua aventura...</Text>
        </View>
      )}

      {failed && (
        <View style={styles.overlay}>
          <Text style={styles.icon}>⚠️</Text>
          <Text style={styles.title}>Não foi possível abrir o jogo</Text>
          <Text style={styles.subtitle}>Verifique a internet e tente novamente.</Text>
          <Pressable style={styles.button} onPress={retry}>
            <Text style={styles.buttonText}>TENTAR NOVAMENTE</Text>
          </Pressable>
          <Pressable style={styles.linkButton} onPress={() => Linking.openURL(GAME_URL)}>
            <Text style={styles.linkText}>Abrir no navegador</Text>
          </Pressable>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#030305' },
  webview: { flex: 1, backgroundColor: '#030305' },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    backgroundColor: '#030305',
  },
  icon: { fontSize: 42, marginBottom: 14 },
  title: {
    color: '#f5c542',
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: 1,
    textAlign: 'center',
    marginTop: 16,
  },
  subtitle: { color: '#c8c0b4', fontSize: 14, textAlign: 'center', marginTop: 8 },
  button: {
    minWidth: 210,
    marginTop: 24,
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 8,
    backgroundColor: '#8c6a18',
    alignItems: 'center',
  },
  buttonText: { color: '#fff', fontWeight: '800', letterSpacing: 0.5 },
  linkButton: { padding: 14, marginTop: 4 },
  linkText: { color: '#f5c542', textDecorationLine: 'underline' },
});

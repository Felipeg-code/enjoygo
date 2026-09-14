import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Dimensions,
  PanResponder,
  Image,
  TouchableOpacity,
  Animated,
  Platform,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Mundo
const WORLD_WIDTH = 2400;
const WORLD_HEIGHT = 2400;
const PLAYER_SPEED = 220; // px/s
const JOYSTICK_SIZE = 130;
const STICK_SIZE = 56;

// Objetivos / Quests iniciais
const INITIAL_QUESTS = [
  { id: 'q1', title: 'Fale com o Ferreiro', desc: 'Vá até a Casa do Ferreiro', x: 600, y: 500, icon: '⚔️', completed: false, reward: 50 },
  { id: 'q2', title: 'Colete Madeira', desc: 'Pegue madeira na Floresta', x: 1800, y: 600, icon: '🌲', completed: false, reward: 30 },
  { id: 'q3', title: 'Taverna', desc: 'Visite a Taverna da Vila', x: 1200, y: 1600, icon: '🍺', completed: false, reward: 70 },
  { id: 'q4', title: 'Torre Antiga', desc: 'Explore a torre abandonada', x: 400, y: 1800, icon: '🗼', completed: false, reward: 100 },
  { id: 'q5', title: 'Cristal Mágico', desc: 'Encontre o cristal no lago', x: 1900, y: 1900, icon: '💎', completed: false, reward: 120 },
];

const WORLD_OBJECTS = [
  { id: 'house1', type: 'house', x: 600, y: 500, w: 160, h: 160 },
  { id: 'house2', type: 'house', x: 1200, y: 1600, w: 160, h: 160 },
  { id: 'house3', type: 'house', x: 400, y: 1800, w: 140, h: 140 },
  { id: 'tree1', type: 'tree', x: 1800, y: 600, w: 90, h: 90 },
  { id: 'tree2', type: 'tree', x: 900, y: 300, w: 80, h: 80 },
  { id: 'tree3', type: 'tree', x: 300, y: 700, w: 100, h: 100 },
  { id: 'tree4', type: 'tree', x: 1700, y: 400, w: 85, h: 85 },
  { id: 'tree5', type: 'tree', x: 500, y: 1200, w: 95, h: 95 },
  { id: 'tree6', type: 'tree', x: 1500, y: 1100, w: 90, h: 90 },
  { id: 'tree7', type: 'tree', x: 1900, y: 1900, w: 110, h: 110 },
  { id: 'tree8', type: 'tree', x: 700, y: 1900, w: 80, h: 80 },
];

export default function App() {
  // Player
  const [playerPos, setPlayerPos] = useState({ x: WORLD_WIDTH / 2, y: WORLD_HEIGHT / 2 });
  const playerPosRef = useRef({ x: WORLD_WIDTH / 2, y: WORLD_HEIGHT / 2 });
  const [facing, setFacing] = useState(1); // 1 right, -1 left

  // Joystick
  const joystickPos = useRef({ x: 0, y: 0 }).current;
  const joystickActive = useRef(false);
  const [stickPos, setStickPos] = useState({ x: 0, y: 0 });
  const joystickVector = useRef({ x: 0, y: 0 });

  // Auto walk
  const [autoTarget, setAutoTarget] = useState(null); // {x,y, questId}
  const autoTargetRef = useRef(null);
  const [isAutoWalking, setIsAutoWalking] = useState(false);

  // Quests
  const [quests, setQuests] = useState(INITIAL_QUESTS);
  const [gold, setGold] = useState(250);
  const [level, setLevel] = useState(5);
  const [xp, setXp] = useState(40);
  const [showCompleteAnim, setShowCompleteAnim] = useState(null);

  // Camera shake for feedback
  const shakeAnim = useRef(new Animated.Value(0)).current;

  // Joystick PanResponder
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: (evt) => {
        joystickActive.current = true;
        // Cancela auto-walk ao tocar joystick
        autoTargetRef.current = null;
        setAutoTarget(null);
        setIsAutoWalking(false);
        handleJoystickMove(evt);
      },
      onPanResponderMove: (evt) => {
        handleJoystickMove(evt);
      },
      onPanResponderRelease: () => {
        joystickActive.current = false;
        joystickVector.current = { x: 0, y: 0 };
        setStickPos({ x: 0, y: 0 });
      },
      onPanResponderTerminate: () => {
        joystickActive.current = false;
        joystickVector.current = { x: 0, y: 0 };
        setStickPos({ x: 0, y: 0 });
      },
    })
  ).current;

  const handleJoystickMove = (evt) => {
    const { locationX, locationY } = evt.nativeEvent;
    // location is relative to joystick container
    const center = JOYSTICK_SIZE / 2;
    let dx = locationX - center;
    let dy = locationY - center;
    const distance = Math.sqrt(dx * dx + dy * dy);
    const maxDist = JOYSTICK_SIZE / 2 - STICK_SIZE / 2;

    if (distance > maxDist) {
      const angle = Math.atan2(dy, dx);
      dx = Math.cos(angle) * maxDist;
      dy = Math.sin(angle) * maxDist;
    }

    setStickPos({ x: dx, y: dy });

    // Normaliza vetor para movimento
    const normalizedX = dx / maxDist;
    const normalizedY = dy / maxDist;
    joystickVector.current = { x: normalizedX, y: normalizedY };

    if (Math.abs(normalizedX) > 0.1) {
      setFacing(normalizedX > 0 ? 1 : -1);
    }
  };

  // Game Loop - 60fps fluido
  useEffect(() => {
    let lastTime = Date.now();
    let animationId;

    const loop = () => {
      const now = Date.now();
      const dt = (now - lastTime) / 1000; // delta em segundos
      lastTime = now;

      let moveX = 0;
      let moveY = 0;

      if (joystickActive.current) {
        moveX = joystickVector.current.x;
        moveY = joystickVector.current.y;
      } else if (autoTargetRef.current) {
        const target = autoTargetRef.current;
        const dx = target.x - playerPosRef.current.x;
        const dy = target.y - playerPosRef.current.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < 25) {
          // Chegou no destino
          if (target.questId) {
            completeQuest(target.questId);
          }
          autoTargetRef.current = null;
          setAutoTarget(null);
          setIsAutoWalking(false);
        } else {
          moveX = dx / dist;
          moveY = dy / dist;
          if (Math.abs(moveX) > 0.1) setFacing(moveX > 0 ? 1 : -1);
        }
      }

      if (moveX !== 0 || moveY !== 0) {
        const newX = Math.max(40, Math.min(WORLD_WIDTH - 40, playerPosRef.current.x + moveX * PLAYER_SPEED * dt));
        const newY = Math.max(40, Math.min(WORLD_HEIGHT - 40, playerPosRef.current.y + moveY * PLAYER_SPEED * dt));

        playerPosRef.current = { x: newX, y: newY };
        setPlayerPos({ x: newX, y: newY });
      }

      animationId = requestAnimationFrame(loop);
    };

    animationId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animationId);
  }, []);

  const completeQuest = (questId) => {
    setQuests((prev) =>
      prev.map((q) => {
        if (q.id === questId && !q.completed) {
          // Recompensa
          setTimeout(() => {
            setGold((g) => g + q.reward);
            setXp((x) => {
              const newXp = x + 20;
              if (newXp >= 100) {
                setLevel((l) => l + 1);
                return newXp - 100;
              }
              return newXp;
            });
            setShowCompleteAnim(q);
            Animated.sequence([
              Animated.timing(shakeAnim, { toValue: 10, duration: 50, useNativeDriver: true }),
              Animated.timing(shakeAnim, { toValue: -10, duration: 50, useNativeDriver: true }),
              Animated.timing(shakeAnim, { toValue: 0, duration: 50, useNativeDriver: true }),
            ]).start();
            setTimeout(() => setShowCompleteAnim(null), 2000);
          }, 100);
          return { ...q, completed: true };
        }
        return q;
      })
    );
  };

  const startAutoWalk = (quest) => {
    if (quest.completed) return;
    const target = { x: quest.x, y: quest.y, questId: quest.id };
    autoTargetRef.current = target;
    setAutoTarget(target);
    setIsAutoWalking(true);
  };

  // Clique no mapa para auto-walk livre
  const handleMapPress = (evt) => {
    const { locationX, locationY } = evt.nativeEvent;
    // Converte clique na tela para coordenada do mundo
    const camX = playerPos.x - SCREEN_WIDTH / 2;
    const camY = playerPos.y - SCREEN_HEIGHT / 2;
    const worldX = camX + locationX;
    const worldY = camY + locationY;

    const target = { x: worldX, y: worldY, questId: null };
    autoTargetRef.current = target;
    setAutoTarget(target);
    setIsAutoWalking(true);
  };

  const cameraX = playerPos.x - SCREEN_WIDTH / 2;
  const cameraY = playerPos.y - SCREEN_HEIGHT / 2;

  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      {/* MAPA - fundo */}
      <View style={styles.mapContainer} onTouchEnd={handleMapPress}>
        {/* Background gradient estilo Clash */}
        <LinearGradient
          colors={['#8ed081', '#6bbf5e', '#5aab4e']}
          style={[styles.world, { transform: [{ translateX: -cameraX }, { translateY: -cameraY }] }]}
        >
          {/* Grid de grama estilizada */}
          <View style={styles.grassPattern}>
            {Array.from({ length: 20 }).map((_, i) => (
              <View key={i} style={styles.grassRow}>
                {Array.from({ length: 20 }).map((_, j) => (
                  <View
                    key={j}
                    style={[
                      styles.grassTile,
                      { backgroundColor: (i + j) % 2 === 0 ? '#7ac76e' : '#6fbf62' },
                    ]}
                  >
                    {/* detalhe */}
                    <View style={styles.grassDetail} />
                  </View>
                ))}
              </View>
            ))}
          </View>

          {/* Caminho / estradas */}
          <View style={[styles.path, { left: 500, top: 400, width: 300, height: 40, transform: [{ rotate: '15deg' }] }]} />
          <View style={[styles.path, { left: 1000, top: 900, width: 500, height: 40, transform: [{ rotate: '-20deg' }] }]} />
          <View style={[styles.path, { left: 400, top: 1400, width: 800, height: 40, transform: [{ rotate: '5deg' }] }]} />

          {/* Objetos do mundo */}
          {WORLD_OBJECTS.map((obj) => (
            <View
              key={obj.id}
              style={[
                styles.worldObject,
                { left: obj.x - obj.w / 2, top: obj.y - obj.h / 2, width: obj.w, height: obj.h },
              ]}
            >
              <Image
                source={obj.type === 'house' ? require('./assets/house.png') : require('./assets/tree.png')}
                style={{ width: obj.w, height: obj.h }}
                resizeMode="contain"
              />
              {/* Sombra */}
              <View style={[styles.objectShadow, { width: obj.w * 0.6 }]} />
            </View>
          ))}

          {/* Marcadores de Quest */}
          {quests.map((q) => !q.completed && (
            <TouchableOpacity
              key={`marker-${q.id}`}
              style={[
                styles.questMarker,
                { left: q.x - 30, top: q.y - 90 },
              ]}
              onPress={() => startAutoWalk(q)}
              activeOpacity={0.8}
            >
              <LinearGradient colors={['#FFD700', '#FFA500']} style={styles.markerBubble}>
                <Text style={styles.markerText}>{q.icon}</Text>
              </LinearGradient>
              <View style={styles.markerPin} />
              {/* Pulso */}
              <View style={styles.markerPulse} />
            </TouchableOpacity>
          ))}

          {/* Player */}
          <View
            style={[
              styles.playerContainer,
              {
                left: playerPos.x - 35,
                top: playerPos.y - 35,
                transform: [{ scaleX: facing }],
              },
            ]}
          >
            <View style={styles.playerShadow} />
            <Image source={require('./assets/player.png')} style={styles.playerImage} resizeMode="contain" />
            {/* Auto walk indicator */}
            {isAutoWalking && (
              <View style={styles.autoIndicator}>
                <Text style={styles.autoText}>AUTO</Text>
              </View>
            )}
          </View>

          {/* Target indicator */}
          {autoTarget && (
            <View style={[styles.targetIndicator, { left: autoTarget.x - 20, top: autoTarget.y - 20 }]}>
              <View style={styles.targetRing} />
              <View style={styles.targetDot} />
            </View>
          )}
        </LinearGradient>

        {/* Overlay de toque para mover */}
        <TouchableOpacity style={styles.mapTouchOverlay} activeOpacity={1} onPress={handleMapPress} />
      </View>

      {/* UI - TOP BAR Clash Style */}
      <LinearGradient colors={['#3a2a1a', '#5d4037']} style={styles.topBar}>
        <View style={styles.resource}>
          <LinearGradient colors={['#FFD700', '#FFA500']} style={styles.resourceIcon}>
            <Text style={styles.resourceIconText}>💰</Text>
          </LinearGradient>
          <View style={styles.resourceInfo}>
            <Text style={styles.resourceValue}>{gold}</Text>
            <View style={styles.resourceBarBg}>
              <View style={[styles.resourceBarFill, { width: '70%', backgroundColor: '#FFD700' }]} />
            </View>
          </View>
        </View>

        <View style={styles.levelContainer}>
          <LinearGradient colors={['#4a90e2', '#357abd']} style={styles.levelBadge}>
            <Text style={styles.levelText}>{level}</Text>
          </LinearGradient>
          <View style={styles.xpContainer}>
            <View style={styles.xpBarBg}>
              <LinearGradient colors={['#7ed321', '#5cb85c']} style={[styles.xpBarFill, { width: `${xp}%` }]} />
            </View>
            <Text style={styles.xpText}>XP {xp}/100</Text>
          </View>
        </View>

        <View style={styles.resource}>
          <LinearGradient colors={['#e74c3c', '#c0392b']} style={styles.resourceIcon}>
            <Text style={styles.resourceIconText}>❤️</Text>
          </LinearGradient>
          <View style={styles.resourceInfo}>
            <Text style={styles.resourceValue}>100%</Text>
          </View>
        </View>
      </LinearGradient>

      {/* QUEST LIST - Direita vertical */}
      <View style={styles.questPanel}>
        <LinearGradient colors={['rgba(58,42,26,0.95)', 'rgba(93,64,55,0.95)']} style={styles.questPanelBg}>
          <Text style={styles.questPanelTitle}>📜 MISSÕES</Text>
          {quests.map((q) => (
            <TouchableOpacity
              key={q.id}
              style={[styles.questItem, q.completed && styles.questCompleted]}
              onPress={() => startAutoWalk(q)}
              disabled={q.completed}
            >
              <View style={[styles.questIconBox, q.completed && styles.questIconDone]}>
                <Text style={styles.questIcon}>{q.completed ? '✅' : q.icon}</Text>
              </View>
              <View style={styles.questTextBox}>
                <Text style={[styles.questTitle, q.completed && styles.questTitleDone]} numberOfLines={1}>
                  {q.title}
                </Text>
                <Text style={styles.questDesc} numberOfLines={2}>{q.desc}</Text>
                {!q.completed && (
                  <View style={styles.questGo}>
                    <Text style={styles.questGoText}>IR →</Text>
                  </View>
                )}
              </View>
              {!q.completed && <View style={styles.questDistance}><Text style={styles.questDistText}>{Math.round(Math.hypot(playerPos.x - q.x, playerPos.y - q.y) / 10)}m</Text></View>}
            </TouchableOpacity>
          ))}
        </LinearGradient>
      </View>

      {/* JOYSTICK - Esquerda inferior */}
      <View style={styles.joystickWrapper}>
        <View style={styles.joystickBase} {...panResponder.panHandlers}>
          <LinearGradient colors={['rgba(0,0,0,0.4)', 'rgba(0,0,0,0.2)']} style={styles.joystickBaseGradient}>
            <View style={styles.joystickCenterDot} />
          </LinearGradient>
          <View style={[styles.joystickStick, { transform: [{ translateX: stickPos.x }, { translateY: stickPos.y }] }]}>
            <LinearGradient colors={['#8d6e63', '#5d4037']} style={styles.stickGradient}>
              <LinearGradient colors={['#a1887f', '#6d4c41']} style={styles.stickInner} />
            </LinearGradient>
          </View>
        </View>
        <Text style={styles.joystickLabel}>MOVER</Text>
      </View>

      {/* BOTÕES AÇÃO - Direita inferior */}
      <View style={styles.actionButtons}>
        <TouchableOpacity
          style={styles.actionBtn}
          onPress={() => {
            // Ataca / Interage
            Animated.sequence([
              Animated.timing(shakeAnim, { toValue: 5, duration: 30, useNativeDriver: true }),
              Animated.timing(shakeAnim, { toValue: 0, duration: 30, useNativeDriver: true }),
            ]).start();
          }}
        >
          <LinearGradient colors={['#ff7043', '#d84315']} style={styles.actionBtnGrad}>
            <Text style={styles.actionBtnText}>⚔️</Text>
          </LinearGradient>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionBtn} onPress={() => setPlayerPos({ x: WORLD_WIDTH / 2, y: WORLD_HEIGHT / 2 })}>
          <LinearGradient colors={['#4fc3f7', '#0288d1']} style={styles.actionBtnGrad}>
            <Text style={styles.actionBtnText}>🗺️</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>

      {/* Auto walk banner */}
      {isAutoWalking && autoTarget && (
        <View style={styles.autoBanner}>
          <LinearGradient colors={['#FFD700', '#FFA500']} style={styles.autoBannerGrad}>
            <Text style={styles.autoBannerText}>🚶 Indo para {quests.find(q => q.id === autoTarget.questId)?.title || 'local'}... Toque no joystick para cancelar</Text>
          </LinearGradient>
        </View>
      )}

      {/* Complete animation */}
      {showCompleteAnim && (
        <Animated.View style={[styles.completePopup, { transform: [{ translateY: shakeAnim }] }]}>
          <LinearGradient colors={['#FFD700', '#FFA500']} style={styles.completeGrad}>
            <Text style={styles.completeTitle}>✅ MISSÃO COMPLETA!</Text>
            <Text style={styles.completeQuest}>{showCompleteAnim.title}</Text>
            <Text style={styles.completeReward}>+{showCompleteAnim.reward} ouro +20 XP</Text>
          </LinearGradient>
        </Animated.View>
      )}

      {/* Dica inicial */}
      <View style={styles.tipBox}>
        <Text style={styles.tipText}>💡 Toque em uma missão ou no mapa para andar sozinho!</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#2e7d32',
  },
  mapContainer: {
    ...StyleSheet.absoluteFillObject,
  },
  world: {
    width: WORLD_WIDTH,
    height: WORLD_HEIGHT,
    position: 'absolute',
  },
  grassPattern: {
    position: 'absolute',
    width: WORLD_WIDTH,
    height: WORLD_HEIGHT,
  },
  grassRow: {
    flexDirection: 'row',
  },
  grassTile: {
    width: WORLD_WIDTH / 20,
    height: WORLD_HEIGHT / 20,
    borderWidth: 0.5,
    borderColor: 'rgba(0,0,0,0.03)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  grassDetail: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(0,0,0,0.05)',
  },
  path: {
    position: 'absolute',
    backgroundColor: '#d7ccc8',
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#a1887f',
  },
  worldObject: {
    position: 'absolute',
    alignItems: 'center',
  },
  objectShadow: {
    height: 12,
    backgroundColor: 'rgba(0,0,0,0.2)',
    borderRadius: 10,
    marginTop: -10,
  },
  questMarker: {
    position: 'absolute',
    alignItems: 'center',
    zIndex: 10,
  },
  markerBubble: {
    width: 54,
    height: 54,
    borderRadius: 27,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#fff',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
  },
  markerText: {
    fontSize: 26,
  },
  markerPin: {
    width: 0,
    height: 0,
    borderLeftWidth: 8,
    borderRightWidth: 8,
    borderTopWidth: 12,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: '#FFA500',
    marginTop: -2,
  },
  markerPulse: {
    position: 'absolute',
    width: 70,
    height: 70,
    borderRadius: 35,
    borderWidth: 2,
    borderColor: '#FFD700',
    top: -8,
    opacity: 0.5,
  },
  playerContainer: {
    position: 'absolute',
    width: 70,
    height: 70,
    zIndex: 20,
    alignItems: 'center',
  },
  playerShadow: {
    position: 'absolute',
    bottom: 0,
    width: 40,
    height: 12,
    backgroundColor: 'rgba(0,0,0,0.3)',
    borderRadius: 10,
  },
  playerImage: {
    width: 70,
    height: 70,
  },
  autoIndicator: {
    position: 'absolute',
    top: -18,
    backgroundColor: '#FFD700',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#fff',
  },
  autoText: {
    fontSize: 8,
    fontWeight: 'bold',
    color: '#5d4037',
  },
  targetIndicator: {
    position: 'absolute',
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  targetRing: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 3,
    borderColor: '#fff',
    borderStyle: 'dashed',
  },
  targetDot: {
    position: 'absolute',
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#FFD700',
  },
  mapTouchOverlay: {
    ...StyleSheet.absoluteFillObject,
  },
  topBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    paddingTop: Platform.OS === 'ios' ? 50 : 40,
    paddingBottom: 12,
    paddingHorizontal: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    zIndex: 30,
    borderBottomWidth: 3,
    borderBottomColor: '#3e2723',
  },
  resource: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.4)',
    borderRadius: 20,
    padding: 4,
    paddingRight: 12,
    borderWidth: 2,
    borderColor: '#5d4037',
  },
  resourceIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#fff',
  },
  resourceIconText: {
    fontSize: 16,
  },
  resourceInfo: {
    marginLeft: 6,
  },
  resourceValue: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  resourceBarBg: {
    width: 40,
    height: 4,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 2,
    marginTop: 2,
  },
  resourceBarFill: {
    height: '100%',
    borderRadius: 2,
  },
  levelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.4)',
    borderRadius: 20,
    padding: 4,
    borderWidth: 2,
    borderColor: '#5d4037',
  },
  levelBadge: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#fff',
  },
  levelText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  xpContainer: {
    marginLeft: 8,
    marginRight: 8,
  },
  xpBarBg: {
    width: 60,
    height: 6,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 3,
  },
  xpBarFill: {
    height: '100%',
    borderRadius: 3,
  },
  xpText: {
    color: '#fff',
    fontSize: 9,
    marginTop: 2,
    fontWeight: 'bold',
  },
  questPanel: {
    position: 'absolute',
    top: 100,
    right: 10,
    width: 170,
    zIndex: 25,
  },
  questPanelBg: {
    borderRadius: 16,
    padding: 8,
    borderWidth: 3,
    borderColor: '#8d6e63',
    elevation: 8,
  },
  questPanelTitle: {
    color: '#FFD700',
    fontWeight: 'bold',
    fontSize: 12,
    textAlign: 'center',
    marginBottom: 8,
    letterSpacing: 1,
  },
  questItem: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderRadius: 12,
    padding: 6,
    marginBottom: 6,
    borderWidth: 2,
    borderColor: '#d7ccc8',
    alignItems: 'center',
  },
  questCompleted: {
    opacity: 0.6,
    backgroundColor: 'rgba(200,200,200,0.8)',
  },
  questIconBox: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: '#fff3e0',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ffcc80',
  },
  questIconDone: {
    backgroundColor: '#c8e6c9',
    borderColor: '#81c784',
  },
  questIcon: {
    fontSize: 16,
  },
  questTextBox: {
    flex: 1,
    marginLeft: 6,
  },
  questTitle: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#3e2723',
  },
  questTitleDone: {
    textDecorationLine: 'line-through',
    color: '#8d6e63',
  },
  questDesc: {
    fontSize: 8,
    color: '#6d4c41',
    marginTop: 1,
  },
  questGo: {
    backgroundColor: '#4caf50',
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 1,
    alignSelf: 'flex-start',
    marginTop: 3,
  },
  questGoText: {
    color: '#fff',
    fontSize: 8,
    fontWeight: 'bold',
  },
  questDistance: {
    marginLeft: 4,
  },
  questDistText: {
    fontSize: 8,
    color: '#8d6e63',
    fontWeight: 'bold',
  },
  joystickWrapper: {
    position: 'absolute',
    bottom: 30,
    left: 20,
    alignItems: 'center',
    zIndex: 30,
  },
  joystickBase: {
    width: JOYSTICK_SIZE,
    height: JOYSTICK_SIZE,
    borderRadius: JOYSTICK_SIZE / 2,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  joystickBaseGradient: {
    width: '100%',
    height: '100%',
    borderRadius: JOYSTICK_SIZE / 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  joystickCenterDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  joystickStick: {
    position: 'absolute',
    width: STICK_SIZE,
    height: STICK_SIZE,
    borderRadius: STICK_SIZE / 2,
    elevation: 5,
  },
  stickGradient: {
    width: '100%',
    height: '100%',
    borderRadius: STICK_SIZE / 2,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#fff',
  },
  stickInner: {
    width: 28,
    height: 28,
    borderRadius: 14,
  },
  joystickLabel: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 10,
    fontWeight: 'bold',
    marginTop: 6,
    letterSpacing: 1,
  },
  actionButtons: {
    position: 'absolute',
    bottom: 30,
    right: 20,
    zIndex: 30,
    gap: 12,
  },
  actionBtn: {
    width: 62,
    height: 62,
    borderRadius: 31,
    elevation: 6,
    marginBottom: 12,
  },
  actionBtnGrad: {
    width: '100%',
    height: '100%',
    borderRadius: 31,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#fff',
  },
  actionBtnText: {
    fontSize: 28,
  },
  autoBanner: {
    position: 'absolute',
    top: 140,
    left: 20,
    right: 190,
    zIndex: 26,
  },
  autoBannerGrad: {
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 2,
    borderColor: '#fff',
  },
  autoBannerText: {
    color: '#5d4037',
    fontSize: 10,
    fontWeight: 'bold',
  },
  completePopup: {
    position: 'absolute',
    top: SCREEN_HEIGHT / 2 - 50,
    left: 40,
    right: 40,
    zIndex: 40,
    alignItems: 'center',
  },
  completeGrad: {
    borderRadius: 20,
    padding: 16,
    alignItems: 'center',
    borderWidth: 4,
    borderColor: '#fff',
    elevation: 10,
    width: '100%',
  },
  completeTitle: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  completeQuest: {
    color: '#5d4037',
    fontWeight: 'bold',
    fontSize: 14,
    marginTop: 4,
  },
  completeReward: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 12,
    marginTop: 4,
    backgroundColor: 'rgba(0,0,0,0.2)',
    paddingHorizontal: 10,
    paddingVertical: 2,
    borderRadius: 10,
  },
  tipBox: {
    position: 'absolute',
    bottom: 110,
    left: SCREEN_WIDTH / 2 - 140,
    width: 280,
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    zIndex: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  tipText: {
    color: '#fff',
    fontSize: 10,
    textAlign: 'center',
    fontWeight: '600',
  },
});

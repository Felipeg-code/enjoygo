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
const WORLD_WIDTH = 2600;
const WORLD_HEIGHT = 2600;
const PLAYER_SPEED = 200;
const JOYSTICK_SIZE = 124;
const STICK_SIZE = 52;

// Quests - Tibia + Clash mix
const INITIAL_QUESTS = [
  { id: 'q1', title: 'Ferreiro Negro', desc: 'Fale com o ferreiro amaldiçoado', x: 600, y: 500, icon: '⚒️', completed: false, reward: 60, type: 'house' },
  { id: 'q2', title: 'Madeira Amaldiçoada', desc: 'Colete na floresta sombria', x: 1800, y: 600, icon: '🌲', completed: false, reward: 40, type: 'tree' },
  { id: 'q3', title: 'Taverna do Dragão', desc: 'Visite a taverna medieval', x: 1200, y: 1600, icon: '🍺', completed: false, reward: 80, type: 'house' },
  { id: 'q4', title: 'Torre do Mago', desc: 'Explore torre abandonada', x: 400, y: 1800, icon: '🗼', completed: false, reward: 110, type: 'tower' },
  { id: 'q5', title: 'Orc Rei', desc: 'Derrote o rei orc', x: 1900, y: 1900, icon: '👹', completed: false, reward: 150, type: 'monster' },
];

const WORLD_OBJECTS = [
  { id: 'house1', type: 'house-tibia', x: 600, y: 500, w: 170, h: 170 },
  { id: 'house2', type: 'house-tibia', x: 1200, y: 1600, w: 170, h: 170 },
  { id: 'tower1', type: 'house-tibia', x: 400, y: 1800, w: 150, h: 180 },
  { id: 'tree1', type: 'tree-tibia', x: 1800, y: 600, w: 95, h: 95 },
  { id: 'tree2', type: 'tree-tibia', x: 900, y: 300, w: 85, h: 85 },
  { id: 'tree3', type: 'tree-tibia', x: 300, y: 700, w: 105, h: 105 },
  { id: 'tree4', type: 'tree-tibia', x: 1700, y: 400, w: 90, h: 90 },
  { id: 'tree5', type: 'tree-tibia', x: 500, y: 1200, w: 100, h: 100 },
  { id: 'tree6', type: 'tree-tibia', x: 1500, y: 1100, w: 95, h: 95 },
  { id: 'tree7', type: 'tree-tibia', x: 700, y: 1900, w: 85, h: 85 },
  { id: 'rock1', type: 'rock', x: 1300, y: 300, w: 60, h: 40 },
  { id: 'rock2', type: 'rock', x: 800, y: 900, w: 70, h: 45 },
];

const MONSTERS_INIT = [
  { id: 'm1', x: 1900, y: 1900, hp: 100, maxHp: 100, vx: 0, vy: 0 },
  { id: 'm2', x: 800, y: 800, hp: 60, maxHp: 60, vx: 0, vy: 0 },
  { id: 'm3', x: 1400, y: 600, hp: 60, maxHp: 60, vx: 0, vy: 0 },
];

export default function App() {
  const [playerPos, setPlayerPos] = useState({ x: WORLD_WIDTH / 2, y: WORLD_HEIGHT / 2 });
  const playerPosRef = useRef({ x: WORLD_WIDTH / 2, y: WORLD_HEIGHT / 2 });
  const [facing, setFacing] = useState(1);
  const [isAttacking, setIsAttacking] = useState(false);

  const joystickActive = useRef(false);
  const [stickPos, setStickPos] = useState({ x: 0, y: 0 });
  const joystickVector = useRef({ x: 0, y: 0 });

  const [autoTarget, setAutoTarget] = useState(null);
  const autoTargetRef = useRef(null);
  const [isAutoWalking, setIsAutoWalking] = useState(false);

  const [quests, setQuests] = useState(INITIAL_QUESTS);
  const [monsters, setMonsters] = useState(MONSTERS_INIT);
  const [gold, setGold] = useState(250);
  const [level, setLevel] = useState(5);
  const [xp, setXp] = useState(40);
  const [showCompleteAnim, setShowCompleteAnim] = useState(null);

  const shakeAnim = useRef(new Animated.Value(0)).current;

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: (evt) => {
        joystickActive.current = true;
        autoTargetRef.current = null;
        setAutoTarget(null);
        setIsAutoWalking(false);
        handleJoystickMove(evt);
      },
      onPanResponderMove: (evt) => { handleJoystickMove(evt); },
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
    joystickVector.current = { x: dx / maxDist, y: dy / maxDist };
    if (Math.abs(dx / maxDist) > 0.1) setFacing(dx > 0 ? 1 : -1);
  };

  // Game Loop 60fps + monsters wander
  useEffect(() => {
    let lastTime = Date.now();
    let animId;
    let monsterWanderTimer = 0;

    const loop = () => {
      const now = Date.now();
      const dt = (now - lastTime) / 1000;
      lastTime = now;
      monsterWanderTimer += dt;

      let moveX = 0, moveY = 0;
      if (joystickActive.current) {
        moveX = joystickVector.current.x;
        moveY = joystickVector.current.y;
      } else if (autoTargetRef.current) {
        const target = autoTargetRef.current;
        const dx = target.x - playerPosRef.current.x;
        const dy = target.y - playerPosRef.current.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 28) {
          if (target.questId) completeQuest(target.questId);
          autoTargetRef.current = null;
          setAutoTarget(null);
          setIsAutoWalking(false);
        } else {
          moveX = dx / dist; moveY = dy / dist;
          if (Math.abs(moveX) > 0.1) setFacing(moveX > 0 ? 1 : -1);
        }
      }

      if (moveX !== 0 || moveY !== 0) {
        const newX = Math.max(40, Math.min(WORLD_WIDTH - 40, playerPosRef.current.x + moveX * PLAYER_SPEED * dt));
        const newY = Math.max(40, Math.min(WORLD_HEIGHT - 40, playerPosRef.current.y + moveY * PLAYER_SPEED * dt));
        playerPosRef.current = { x: newX, y: newY };
        setPlayerPos({ x: newX, y: newY });
      }

      // Monsters wander
      if (monsterWanderTimer > 0.1) {
        setMonsters(prev => prev.map(m => {
          let { vx, vy } = m;
          if (Math.random() < 0.02) {
            vx = (Math.random() - 0.5) * 60;
            vy = (Math.random() - 0.5) * 60;
          }
          let nx = m.x + vx * dt;
          let ny = m.y + vy * dt;
          nx = Math.max(30, Math.min(WORLD_WIDTH - 30, nx));
          ny = Math.max(30, Math.min(WORLD_HEIGHT - 30, ny));
          return { ...m, x: nx, y: ny, vx, vy };
        }));
        monsterWanderTimer = 0;
      }

      animId = requestAnimationFrame(loop);
    };
    animId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animId);
  }, []);

  const completeQuest = (questId) => {
    setQuests(prev => prev.map(q => {
      if (q.id === questId && !q.completed) {
        setTimeout(() => {
          setGold(g => g + q.reward);
          setXp(x => {
            const nx = x + 25;
            if (nx >= 100) { setLevel(l => l + 1); return nx - 100; }
            return nx;
          });
          setShowCompleteAnim(q);
          Animated.sequence([
            Animated.timing(shakeAnim, { toValue: 8, duration: 40, useNativeDriver: true }),
            Animated.timing(shakeAnim, { toValue: -8, duration: 40, useNativeDriver: true }),
            Animated.timing(shakeAnim, { toValue: 0, duration: 40, useNativeDriver: true }),
          ]).start();
          setTimeout(() => setShowCompleteAnim(null), 2200);
        }, 100);
        return { ...q, completed: true };
      }
      return q;
    }));
  };

  const startAutoWalk = (quest) => {
    if (quest.completed) return;
    const target = { x: quest.x, y: quest.y, questId: quest.id };
    autoTargetRef.current = target;
    setAutoTarget(target);
    setIsAutoWalking(true);
  };

  const handleMapPress = (evt) => {
    const { locationX, locationY } = evt.nativeEvent;
    const camX = playerPos.x - SCREEN_WIDTH / 2;
    const camY = playerPos.y - SCREEN_HEIGHT / 2;
    const target = { x: camX + locationX, y: camY + locationY, questId: null };
    autoTargetRef.current = target;
    setAutoTarget(target);
    setIsAutoWalking(true);
  };

  const handleAttack = () => {
    setIsAttacking(true);
    setTimeout(() => setIsAttacking(false), 200);
    // Hit monsters
    setMonsters(prev => prev.map(m => {
      const d = Math.hypot(m.x - playerPosRef.current.x, m.y - playerPosRef.current.y);
      if (d < 85) {
        const nhp = m.hp - 35;
        if (nhp <= 0) {
          setGold(g => g + 15);
          return { ...m, x: Math.random() * WORLD_WIDTH, y: Math.random() * WORLD_HEIGHT, hp: m.maxHp };
        }
        return { ...m, hp: nhp };
      }
      return m;
    }));
    Animated.sequence([
      Animated.timing(shakeAnim, { toValue: 4, duration: 30, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 0, duration: 30, useNativeDriver: true }),
    ]).start();
  };

  const cameraX = playerPos.x - SCREEN_WIDTH / 2;
  const cameraY = playerPos.y - SCREEN_HEIGHT / 2;

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <View style={styles.mapContainer}>
        <LinearGradient colors={['#2a2a2a', '#3a3a3a', '#4a4a4a']} style={[styles.world, { transform: [{ translateX: -cameraX }, { translateY: -cameraY }] }]}>
          {/* Tibia + Clash ground - stone with grass patches */}
          <View style={styles.groundBase} />
          {Array.from({ length: 30 }).map((_, i) => (
            <View key={`grass-${i}`} style={[styles.grassPatch, { left: (i * 137) % WORLD_WIDTH, top: (i * 241) % WORLD_HEIGHT, backgroundColor: i % 3 === 0 ? '#4a7a3a' : '#5a8a4a' }]} />
          ))}
          {/* Stone grid like Tibia */}
          {Array.from({ length: 40 }).map((_, i) => (
            <View key={`grid-${i}`} style={[styles.gridLine, { left: i * 65, top: 0, width: 1, height: WORLD_HEIGHT }]} />
          ))}
          {Array.from({ length: 40 }).map((_, i) => (
            <View key={`gridh-${i}`} style={[styles.gridLine, { left: 0, top: i * 65, width: WORLD_WIDTH, height: 1 }]} />
          ))}
          {/* Stone roads */}
          <View style={[styles.road, { left: 500, top: 400, width: 320, height: 28 }]} />
          <View style={[styles.road, { left: 1000, top: 900, width: 420, height: 28 }]} />
          <View style={[styles.road, { left: 400, top: 1400, width: 720, height: 28 }]} />

          {WORLD_OBJECTS.map(obj => (
            <View key={obj.id} style={[styles.worldObject, { left: obj.x - obj.w / 2, top: obj.y - obj.h / 2, width: obj.w, height: obj.h }]}>
              {obj.type === 'rock' ? (
                <View style={[styles.rock, { width: obj.w, height: obj.h }]} />
              ) : (
                <Image source={obj.type.includes('house') ? require('./assets/house-tibia-clash.png') : require('./assets/tree-tibia-clash.png')} style={{ width: obj.w, height: obj.h }} resizeMode="contain" />
              )}
              <View style={[styles.objectShadow, { width: obj.w * 0.6 }]} />
            </View>
          ))}

          {/* Monsters */}
          {monsters.map(m => (
            <View key={m.id} style={[styles.monster, { left: m.x - 35, top: m.y - 35 }]}>
              <View style={styles.monsterShadow} />
              <Image source={require('./assets/monster-tibia-clash.png')} style={{ width: 70, height: 70 }} resizeMode="contain" />
              <View style={styles.hpBarBg}><View style={[styles.hpBarFill, { width: `${(m.hp / m.maxHp) * 100}%` }]} /></View>
            </View>
          ))}

          {quests.map(q => !q.completed && (
            <TouchableOpacity key={`marker-${q.id}`} style={[styles.questMarker, { left: q.x - 28, top: q.y - 85 }]} onPress={() => startAutoWalk(q)} activeOpacity={0.8}>
              <LinearGradient colors={['#FFD700', '#b8960c']} style={styles.markerBubble}>
                <Text style={styles.markerText}>{q.icon}</Text>
              </LinearGradient>
              <View style={styles.markerPin} />
              <View style={styles.markerPulse} />
            </TouchableOpacity>
          ))}

          <View style={[styles.playerContainer, { left: playerPos.x - 40, top: playerPos.y - 40, transform: [{ scaleX: facing }] }]}>
            <View style={styles.playerShadow} />
            <Image source={require('./assets/hero-tibia-clash.png')} style={[styles.playerImage, isAttacking && { transform: [{ rotate: '-15deg' }] }]} resizeMode="contain" />
            {isAutoWalking && <View style={styles.autoIndicator}><Text style={styles.autoText}>AUTO</Text></View>}
          </View>

          {autoTarget && (
            <View style={[styles.targetIndicator, { left: autoTarget.x - 18, top: autoTarget.y - 18 }]}>
              <View style={styles.targetRing} />
              <View style={styles.targetDot} />
            </View>
          )}
        </LinearGradient>
        <TouchableOpacity style={styles.mapTouchOverlay} activeOpacity={1} onPress={handleMapPress} />
      </View>

      <LinearGradient colors={['#2a2a2a', '#1a1a1a']} style={styles.topBar}>
        <View style={styles.resource}><LinearGradient colors={['#FFD700', '#b8960c']} style={styles.resourceIcon}><Text style={styles.resourceIconText}>💰</Text></LinearGradient><View style={styles.resourceInfo}><Text style={styles.resourceValue}>{gold}</Text></View></View>
        <View style={styles.levelContainer}><LinearGradient colors={['#4a4a4a', '#2a2a2a']} style={styles.levelBadge}><Text style={styles.levelText}>⚔️{level}</Text></LinearGradient><View style={styles.xpContainer}><View style={styles.xpBarBg}><LinearGradient colors={['#FFD700', '#FFA500']} style={[styles.xpBarFill, { width: `${xp}%` }]} /></View><Text style={styles.xpText}>{xp}%</Text></View></View>
        <View style={styles.resource}><LinearGradient colors={['#c62828', '#8b0000']} style={styles.resourceIcon}><Text style={styles.resourceIconText}>❤️</Text></LinearGradient><View style={styles.resourceInfo}><Text style={styles.resourceValue}>100</Text></View></View>
      </LinearGradient>

      <View style={styles.questPanel}>
        <LinearGradient colors={['#3e2723', '#2a1a14']} style={styles.questPanelBg}>
          <Text style={styles.questPanelTitle}>📜 TIBIA × CLASH</Text>
          {quests.map(q => (
            <TouchableOpacity key={q.id} style={[styles.questItem, q.completed && styles.questCompleted]} onPress={() => startAutoWalk(q)} disabled={q.completed}>
              <View style={[styles.questIconBox, q.completed && styles.questIconDone]}><Text style={styles.questIcon}>{q.completed ? '✅' : q.icon}</Text></View>
              <View style={styles.questTextBox}><Text style={[styles.questTitle, q.completed && styles.questTitleDone]} numberOfLines={1}>{q.title}</Text><Text style={styles.questDesc} numberOfLines={2}>{q.desc}</Text>{!q.completed && <View style={styles.questGo}><Text style={styles.questGoText}>IR → {Math.round(Math.hypot(playerPos.x - q.x, playerPos.y - q.y) / 10)}m</Text></View>}</View>
            </TouchableOpacity>
          ))}
        </LinearGradient>
      </View>

      <View style={styles.joystickWrapper}>
        <View style={styles.joystickBase} {...panResponder.panHandlers}>
          <LinearGradient colors={['#2a2a2a', '#1a1a1a']} style={styles.joystickBaseGradient}><View style={styles.joystickCenterDot} /></LinearGradient>
          <View style={[styles.joystickStick, { transform: [{ translateX: stickPos.x }, { translateY: stickPos.y }] }]}>
            <LinearGradient colors={['#5d4037', '#3e2723']} style={styles.stickGradient}><View style={styles.stickInner} /></LinearGradient>
          </View>
        </View>
        <Text style={styles.joystickLabel}>MOVER</Text>
      </View>

      <View style={styles.actionButtons}>
        <TouchableOpacity style={styles.actionBtn} onPress={handleAttack}><LinearGradient colors={['#c62828', '#8b0000']} style={styles.actionBtnGrad}><Text style={styles.actionBtnText}>⚔️</Text></LinearGradient></TouchableOpacity>
        <TouchableOpacity style={styles.actionBtn} onPress={() => setPlayerPos({ x: WORLD_WIDTH / 2, y: WORLD_HEIGHT / 2 })}><LinearGradient colors={['#1565c0', '#0d47a1']} style={styles.actionBtnGrad}><Text style={styles.actionBtnText}>🗺️</Text></LinearGradient></TouchableOpacity>
      </View>

      {isAutoWalking && autoTarget && (
        <View style={styles.autoBanner}><LinearGradient colors={['#FFD700', '#FFA500']} style={styles.autoBannerGrad}><Text style={styles.autoBannerText}>🚶 {quests.find(q => q.id === autoTarget.questId)?.title || 'Indo'}... joystick cancela</Text></LinearGradient></View>
      )}

      {showCompleteAnim && (
        <Animated.View style={[styles.completePopup, { transform: [{ translateY: shakeAnim }] }]}>
          <LinearGradient colors={['#3e2723', '#2a1a14']} style={styles.completeGrad}>
            <Text style={styles.completeTitle}>✅ COMPLETA!</Text>
            <Text style={styles.completeQuest}>{showCompleteAnim.title}</Text>
            <Text style={styles.completeReward}>+{showCompleteAnim.reward} OURO</Text>
          </LinearGradient>
        </Animated.View>
      )}

      <View style={styles.tipBox}><Text style={styles.tipText}>💡 Tibia + Clash • Toque na missão para auto-walk • ⚔️ ataca orcs!</Text></View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#1a1a1a' },
  mapContainer: { ...StyleSheet.absoluteFillObject },
  world: { width: WORLD_WIDTH, height: WORLD_HEIGHT, position: 'absolute' },
  groundBase: { position: 'absolute', width: WORLD_WIDTH, height: WORLD_HEIGHT, backgroundColor: '#3a3a3a' },
  grassPatch: { position: 'absolute', width: 40, height: 40, borderRadius: 4, opacity: 0.6 },
  gridLine: { position: 'absolute', backgroundColor: 'rgba(0,0,0,0.15)' },
  road: { position: 'absolute', backgroundColor: '#6d5d4a', borderRadius: 4, borderWidth: 2, borderColor: '#3e2723' },
  worldObject: { position: 'absolute', alignItems: 'center' },
  rock: { backgroundColor: '#6a6a6a', borderRadius: 10, borderWidth: 2, borderColor: '#3a3a3a' },
  objectShadow: { height: 10, backgroundColor: 'rgba(0,0,0,0.4)', borderRadius: 10, marginTop: -8 },
  monster: { position: 'absolute', width: 70, height: 70, zIndex: 15 },
  monsterShadow: { position: 'absolute', bottom: 0, width: 30, height: 8, backgroundColor: 'rgba(0,0,0,0.4)', borderRadius: 10, left: 20 },
  hpBarBg: { position: 'absolute', top: -8, left: 10, width: 50, height: 6, backgroundColor: '#000', borderRadius: 3, borderWidth: 1, borderColor: '#000' },
  hpBarFill: { height: '100%', backgroundColor: '#4caf50', borderRadius: 2 },
  questMarker: { position: 'absolute', alignItems: 'center', zIndex: 10 },
  markerBubble: { width: 52, height: 52, borderRadius: 8, justifyContent: 'center', alignItems: 'center', borderWidth: 3, borderColor: '#000', elevation: 5 },
  markerText: { fontSize: 22 },
  markerPin: { width: 0, height: 0, borderLeftWidth: 7, borderRightWidth: 7, borderTopWidth: 10, borderLeftColor: 'transparent', borderRightColor: 'transparent', borderTopColor: '#b8960c', marginTop: -2 },
  markerPulse: { position: 'absolute', width: 68, height: 68, borderRadius: 10, borderWidth: 2, borderColor: '#FFD700', top: -8, opacity: 0.5 },
  playerContainer: { position: 'absolute', width: 80, height: 80, zIndex: 20, alignItems: 'center' },
  playerShadow: { position: 'absolute', bottom: 2, width: 36, height: 10, backgroundColor: 'rgba(0,0,0,0.5)', borderRadius: 10 },
  playerImage: { width: 80, height: 80 },
  autoIndicator: { position: 'absolute', top: -16, backgroundColor: '#FFD700', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4, borderWidth: 2, borderColor: '#000' },
  autoText: { fontSize: 8, fontWeight: '900', color: '#000' },
  targetIndicator: { position: 'absolute', width: 36, height: 36, justifyContent: 'center', alignItems: 'center' },
  targetRing: { width: 32, height: 32, borderRadius: 6, borderWidth: 2, borderColor: '#FFD700', borderStyle: 'dashed' },
  targetDot: { position: 'absolute', width: 8, height: 8, borderRadius: 4, backgroundColor: '#FFD700', borderWidth: 1, borderColor: '#000' },
  mapTouchOverlay: { ...StyleSheet.absoluteFillObject },
  topBar: { position: 'absolute', top: 0, left: 0, right: 0, paddingTop: Platform.OS === 'ios' ? 50 : 38, paddingBottom: 10, paddingHorizontal: 10, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', zIndex: 30, borderBottomWidth: 3, borderBottomColor: '#000' },
  resource: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.5)', borderRadius: 6, padding: 3, paddingRight: 10, borderWidth: 2, borderColor: '#000' },
  resourceIcon: { width: 28, height: 28, borderRadius: 4, justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: '#000' },
  resourceIconText: { fontSize: 14 },
  resourceInfo: { marginLeft: 5 },
  resourceValue: { color: '#FFD700', fontWeight: '900', fontSize: 13, textShadowColor: '#000', textShadowOffset: { width: 1, height: 1 }, textShadowRadius: 1 },
  levelContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.5)', borderRadius: 6, padding: 3, borderWidth: 2, borderColor: '#000' },
  levelBadge: { paddingHorizontal: 8, height: 28, borderRadius: 4, justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: '#000' },
  levelText: { color: '#FFD700', fontWeight: '900', fontSize: 12 },
  xpContainer: { marginLeft: 6, marginRight: 6 },
  xpBarBg: { width: 50, height: 6, backgroundColor: '#000', borderRadius: 3, borderWidth: 1, borderColor: '#000' },
  xpBarFill: { height: '100%', borderRadius: 2 },
  xpText: { color: '#FFD700', fontSize: 8, marginTop: 1, fontWeight: '900' },
  questPanel: { position: 'absolute', top: 88, right: 8, width: 162, zIndex: 25 },
  questPanelBg: { borderRadius: 8, padding: 6, borderWidth: 3, borderColor: '#000', elevation: 8 },
  questPanelTitle: { color: '#FFD700', fontWeight: '900', fontSize: 10, textAlign: 'center', marginBottom: 6, letterSpacing: 1, textShadowColor: '#000', textShadowOffset: { width: 1, height: 1 }, textShadowRadius: 1 },
  questItem: { flexDirection: 'row', backgroundColor: '#e0d5c7', borderRadius: 6, padding: 5, marginBottom: 5, borderWidth: 2, borderColor: '#000', alignItems: 'center' },
  questCompleted: { opacity: 0.5 },
  questIconBox: { width: 26, height: 26, borderRadius: 4, backgroundColor: '#fff8e1', justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: '#000' },
  questIconDone: { backgroundColor: '#a5d6a7' },
  questIcon: { fontSize: 14 },
  questTextBox: { flex: 1, marginLeft: 5 },
  questTitle: { fontSize: 9, fontWeight: '900', color: '#3e2723' },
  questTitleDone: { textDecorationLine: 'line-through', color: '#8d6e63' },
  questDesc: { fontSize: 7, color: '#5d4037', fontWeight: '600' },
  questGo: { backgroundColor: '#2e7d32', borderRadius: 3, paddingHorizontal: 5, paddingVertical: 1, alignSelf: 'flex-start', marginTop: 2, borderWidth: 1, borderColor: '#000' },
  questGoText: { color: '#fff', fontSize: 7, fontWeight: '900' },
  joystickWrapper: { position: 'absolute', bottom: 22, left: 14, alignItems: 'center', zIndex: 30 },
  joystickBase: { width: JOYSTICK_SIZE, height: JOYSTICK_SIZE, borderRadius: JOYSTICK_SIZE / 2, justifyContent: 'center', alignItems: 'center', borderWidth: 3, borderColor: '#000', backgroundColor: '#1a1a1a' },
  joystickBaseGradient: { width: '100%', height: '100%', borderRadius: JOYSTICK_SIZE / 2, justifyContent: 'center', alignItems: 'center' },
  joystickCenterDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: 'rgba(255,255,255,0.15)' },
  joystickStick: { position: 'absolute', width: STICK_SIZE, height: STICK_SIZE, borderRadius: STICK_SIZE / 2, elevation: 5 },
  stickGradient: { width: '100%', height: '100%', borderRadius: STICK_SIZE / 2, justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: '#000' },
  stickInner: { width: 22, height: 22, borderRadius: 11, backgroundColor: '#8d6e63' },
  joystickLabel: { color: '#8d6e63', fontSize: 8, fontWeight: '900', marginTop: 4, letterSpacing: 1 },
  actionButtons: { position: 'absolute', bottom: 22, right: 12, zIndex: 30 },
  actionBtn: { width: 56, height: 56, borderRadius: 8, elevation: 6, marginBottom: 10, borderWidth: 3, borderColor: '#000' },
  actionBtnGrad: { width: '100%', height: '100%', borderRadius: 5, justifyContent: 'center', alignItems: 'center' },
  actionBtnText: { fontSize: 24 },
  autoBanner: { position: 'absolute', top: 120, left: 12, right: 178, zIndex: 26 },
  autoBannerGrad: { borderRadius: 6, paddingHorizontal: 10, paddingVertical: 5, borderWidth: 2, borderColor: '#000' },
  autoBannerText: { color: '#000', fontSize: 9, fontWeight: '900' },
  completePopup: { position: 'absolute', top: SCREEN_HEIGHT / 2 - 50, left: 40, right: 40, zIndex: 40, alignItems: 'center' },
  completeGrad: { borderRadius: 8, padding: 14, alignItems: 'center', borderWidth: 3, borderColor: '#FFD700', elevation: 10, width: '100%' },
  completeTitle: { color: '#FFD700', fontWeight: '900', fontSize: 13, textShadowColor: '#000', textShadowOffset: { width: 1, height: 1 }, textShadowRadius: 1 },
  completeQuest: { color: '#c9b896', fontWeight: '900', fontSize: 12, marginTop: 3 },
  completeReward: { color: '#000', fontWeight: '900', fontSize: 11, marginTop: 4, backgroundColor: '#FFD700', paddingHorizontal: 10, paddingVertical: 3, borderRadius: 4, borderWidth: 2, borderColor: '#000' },
  tipBox: { position: 'absolute', bottom: 100, left: SCREEN_WIDTH / 2 - 150, width: 300, backgroundColor: 'rgba(0,0,0,0.8)', borderRadius: 12, paddingHorizontal: 10, paddingVertical: 5, zIndex: 20, borderWidth: 2, borderColor: '#5d4037' },
  tipText: { color: '#FFD700', fontSize: 9, textAlign: 'center', fontWeight: '700' },
});

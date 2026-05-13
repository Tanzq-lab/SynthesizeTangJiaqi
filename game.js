(function () {
  var globalScope = typeof GameGlobal !== "undefined" ? GameGlobal : globalThis;
  var ttApi = typeof tt !== "undefined" ? tt : null;

  var STAGE_WIDTH = 450;
  var STAGE_HEIGHT = 720;
  var DROP_Y = 88;
  var DANGER_LINE_Y = 154;
  var FLOOR_Y = 682;
  var GRAVITY = 1850;
  var AIR_FRICTION = 0.992;
  var FIXED_TIMESTEP = 1 / 120;
  var MAX_PHYSICS_STEPS = 5;
  var SOLVER_ITERATIONS = 3;
  var WALL_RESTITUTION = 0.18;
  var FLOOR_RESTITUTION_SCALE = 0.48;
  var RESTING_SPEED = 16;
  var RESTING_HORIZONTAL_SPEED = 8;
  var MAX_COIN_SPEED = 1350;
  var COMBO_WINDOW_MS = 1200;
  var COMBO_LOCAL_DURATION_MS = 760;
  var COMBO_CENTER_DURATION_MS = 980;
  var COMBO_CENTER_THRESHOLD = 8;
  var COMBO_VOICE_SWITCH_INTERVAL_MS = 360;
  var COMBO_VOICE_REPEAT_INTERVAL_MS = 1500;
  var GAME_OVER_GRACE_MS = 1500;
  var GAME_OVER_WARNING_MS = 450;
  var GAME_OVER_OVERLINE_MS = 2200;
  var GAME_OVER_LINE_BUFFER = 1.5;
  var GAME_OVER_RECOVER_DECAY = 3.5;
  var FIRST_SPAWN_POPUP_DURATION_MS = 3000;
  var FIRST_SPAWN_POPUP_MIN_LEVEL = 7;
  var FIRST_SPAWN_POPUP_MAX_LEVEL = 9;
  var GENERATION_SOUND_REPEAT_INTERVAL_MS = 400;
  // 233乐园真实 IAA / IAP 开关：本地调试默认 false；正式包改成 true。
  // 也可以在 index.html 的 game.js 之前提前设置：window.POLO_ENABLE_REAL_LEYUAN_SDK = true;
  if (typeof globalScope.POLO_ENABLE_REAL_LEYUAN_SDK === "undefined") {
    globalScope.POLO_ENABLE_REAL_LEYUAN_SDK = true;
  }
  var LEYUAN_APP_KEY = "94cca53898b64ef08b42714f9674b5fb";
  var LEYUAN_CP_ID = "169040";
  var REVIVE_IAP_PRODUCT = {
    productCode: "poloball_revive_100_party_coin",
    productName: "100派对币继续游戏",
    price: 100,
    cpExtra: "revive_continue"
  };
  var PAY_RESULT_CODE_SUCCESS = 0;
  var PAY_RESULT_CODE_FAILED = 8;
  var PAY_RESULT_CODE_CANCEL = 10;
  var REWARD_VIDEO_AD_TYPE = 1;
  var REWARD_VIDEO_STATUS_REWARDED = 4;
  var SDK_TIMEOUT_MS = 10000;

  var LEVELS = [
    { id: "mouse", name: "Hello", radius: 20, score: 10, color: "#9a7454", image: "minigame/assets/skins/Char_Default_01.png", weight: 34, restitution: 0.16 },
    { id: "rabbit", name: "巴巴博一", radius: 26, score: 25, color: "#8b5348", image: "minigame/assets/skins/Char_Default_02.png", weight: 28, restitution: 0.15 },
    { id: "chicken", name: "爆笑奶龙", radius: 33, score: 55, color: "#b28038", image: "minigame/assets/skins/Char_Default_03.png", weight: 22, restitution: 0.14 },
    { id: "snake", name: "安迪", radius: 41, score: 110, color: "#a45537", image: "minigame/assets/skins/Char_Default_04.png", weight: 12, restitution: 0.13 },
    { id: "monkey", name: "不知奶龙", radius: 51, score: 210, color: "#946329", image: "minigame/assets/skins/Char_Default_05.png", weight: 4, restitution: 0.12 },
    { id: "horse", name: "刀盾狗", radius: 63, score: 380, color: "#9c7031", image: "minigame/assets/skins/Char_Default_06.png", weight: 0, restitution: 0.11 },
    { id: "cow", name: "白菜对我笑", radius: 77, score: 680, color: "#98612c", image: "minigame/assets/skins/Char_Default_07.png", weight: 0, restitution: 0.10 },
    { id: "tiger", name: "肉肉肉", radius: 94, score: 1200, color: "#a46723", image: "minigame/assets/skins/Char_Default_08.png", weight: 0, restitution: 0.09 },
    { id: "lion", name: "完，没中", radius: 113, score: 2100, color: "#8f5a27", image: "minigame/assets/skins/Char_Default_09.png", weight: 0, restitution: 0.08 },
    { id: "dragon", name: "唐嘉琦", radius: 136, score: 3600, color: "#9b382c", image: "minigame/assets/skins/Char_Default_10.png", weight: 0, restitution: 0.07 }
  ];

  function createBrowserCanvas() {
    if (typeof document === "undefined" || !document.body) {
      return null;
    }
    document.documentElement.style.margin = "0";
    document.documentElement.style.padding = "0";
    document.documentElement.style.width = "100%";
    document.documentElement.style.height = "100%";
    document.documentElement.style.overflow = "hidden";
    document.documentElement.style.background = "#10183a";
    document.body.style.margin = "0";
    document.body.style.padding = "0";
    document.body.style.width = "100%";
    document.body.style.height = "100%";
    document.body.style.overflow = "hidden";
    document.body.style.background = "#10183a";
    document.body.style.touchAction = "none";
    document.body.style.userSelect = "none";
    document.body.style.webkitUserSelect = "none";
    document.body.style.webkitTapHighlightColor = "transparent";
    var element = document.createElement("canvas");
    element.id = "gameCanvas";
    element.setAttribute("aria-label", "POLO小球 H5 Canvas Game");
    element.style.position = "fixed";
    element.style.left = "0";
    element.style.top = "0";
    element.style.display = "block";
    element.style.width = "100vw";
    element.style.height = "100vh";
    element.style.touchAction = "none";
    element.style.userSelect = "none";
    element.style.webkitUserSelect = "none";
    element.style.webkitTapHighlightColor = "transparent";
    document.body.appendChild(element);
    return element;
  }

  function createImage(path) {
    var image = ttApi && typeof ttApi.createImage === "function" ? ttApi.createImage() : new Image();
    image.loaded = false;
    image.failed = false;
    function markLoaded() {
      image.loaded = true;
    }
    function markFailed() {
      image.failed = true;
    }
    if (typeof image.addEventListener === "function") {
      image.addEventListener("load", markLoaded);
      image.addEventListener("error", markFailed);
    } else {
      image.onload = markLoaded;
      image.onerror = markFailed;
    }
    image.src = path;
    return image;
  }

  function getSystemInfo() {
    if (ttApi && typeof ttApi.getSystemInfoSync === "function") {
      return ttApi.getSystemInfoSync();
    }
    return {
      windowWidth: typeof innerWidth === "number" ? innerWidth : STAGE_WIDTH,
      windowHeight: typeof innerHeight === "number" ? innerHeight : STAGE_HEIGHT,
      pixelRatio: typeof devicePixelRatio === "number" ? devicePixelRatio : 1
    };
  }

  var canvas = ttApi && typeof ttApi.createCanvas === "function" ? ttApi.createCanvas() : createBrowserCanvas();
  if (!canvas) {
    throw new Error("Canvas is unavailable.");
  }
  var context = canvas.getContext("2d");
  var requestFrame = globalScope.requestAnimationFrame || globalScope.webkitRequestAnimationFrame || function (callback) {
    return setTimeout(function () {
      callback(Date.now());
    }, 1000 / 60);
  };
  var images = LEVELS.map(function (level) {
    return createImage(level.image);
  });
  var backgroundImage = createImage("minigame/assets/background.png");
  var uiImages = {
    bomb: createImage("minigame/assets/ui/Bomb.png"),
    hammer: createImage("minigame/assets/ui/Hammer.png"),
    clear: createImage("minigame/assets/ui/Clear.png"),
    pause: createImage("minigame/assets/ui/Pause.png"),
    soundOn: createImage("minigame/assets/ui/SoundOn.png"),
    soundOff: createImage("minigame/assets/ui/SoundOff.png"),
    close: createImage("minigame/assets/ui/Close.png")
  };

  var viewWidth = STAGE_WIDTH;
  var viewHeight = STAGE_HEIGHT;
  var pixelRatio = 1;
  var stageScale = 1;
  var stageOffsetX = 0;
  var stageOffsetY = 0;

  var coins = [];
  var nextId = 1;
  var pointerX = STAGE_WIDTH / 2;
  var previewLevel = pickSpawnLevel();
  var nextLevel = pickSpawnLevel();
  var score = 0;
  var highScore = readHighScore();
  var mode = "home";
  var cooldownMs = 0;
  var dangerMs = 0;
  var comboCount = 0;
  var comboWindowMs = 0;
  var lastTime = 0;
  var physicsAccumulator = 0;
  var flashes = [];
  var firstSpawnPopup = null;
  var runStartedAt = Date.now();
  var runHighScoreAtStart = highScore;
  var gameOverAt = 0;
  var mergeCount = 0;
  var maxComboCount = 0;
  var highestLevelReached = 0;
  var reviveCount = 0;
  var selectedCards = [];
  var selectedPowerCard = null;
  var lastPowerupMessage = "";
  var lastPowerupMessageMs = 0;
  var settlementRestartButton = { x: 132, y: 662, w: 186, h: 42 };
  var settlementAdContinueButton = { x: 62, y: 598, w: 156, h: 54 };
  var settlementIapContinueButton = { x: 232, y: 598, w: 156, h: 54 };
  var revivePurchaseBusy = false;
  var revivePurchaseType = "";
  var reviveStatusText = "";
  var iapInitPromise = null;
  var iapLoginPromise = null;
  var iapInitialized = false;
  var iapUserInfo = null;
  var pauseButton = { x: 344, y: 88, w: 42, h: 42 };
  var soundButton = { x: 398, y: 88, w: 42, h: 42 };
  var homeStartButton = { x: 70, y: 548, w: 310, h: 58 };
  var reviveContinueButton = { x: 94, y: 528, w: 262, h: 54 };
  var cardSlots = [
    { x: 24, y: 246, w: 122, h: 188 },
    { x: 164, y: 246, w: 122, h: 188 },
    { x: 304, y: 246, w: 122, h: 188 }
  ];
  var POWER_CARDS = [
    { id: "bomb", title: "炸弹", icon: "炸", imageKey: "bomb", type: "target", desc: "炸掉一片离谱障碍" },
    { id: "hammer", title: "锤子", icon: "锤", imageKey: "hammer", type: "target", desc: "精准敲掉一个梗" },
    { id: "clearLowest", title: "清屏一次", icon: "清", imageKey: "clear", type: "auto", desc: "全场瞬间清爽" },
    { id: "fortune", title: "财神保佑", icon: "福", imageKey: null, type: "auto", desc: "清掉顶部危机" }
  ];
  var soundEnabled = true;
  var audioUnlocked = false;
  var bootReadyReported = false;
  var audioContext = null;
  var lastImpactSoundAt = 0;
  var lastDangerSoundAt = 0;
  var gameOverSoundPlayed = false;
  var screenShakeMs = 0;
  var screenShakeMagnitude = 0;
  var screenFlashMs = 0;
  var lastComboVoiceAt = 0;
  var lastComboVoiceName = "";
  var audioPoolCursor = {};
  var audioPool = {};
  var lastGenerationSoundAtByLevel = {};
  var generationAudioPreloaded = false;
  var audioFiles = {
    drop: "minigame/assets/audio/drop.mp3",
    merge: "minigame/assets/audio/merge.mp3",
    combo: "minigame/assets/audio/combo.mp3",
    comboVoice2: "minigame/assets/audio/combo_2.mp3",
    comboVoice3: "minigame/assets/audio/combo_3.mp3",
    comboVoice4: "minigame/assets/audio/combo_4.mp3",
    comboVoice5: "minigame/assets/audio/combo_5.mp3",
    comboVoice6: "minigame/assets/audio/combo_6.mp3",
    comboVoice8: "minigame/assets/audio/combo_8.mp3",
    comboVoice10: "minigame/assets/audio/combo_10.mp3",
    spawnLevel1: "minigame/assets/audio/hello.mp3",
    spawnLevel2: "minigame/assets/audio/bababoyi.mp3",
    spawnLevel3: "minigame/assets/audio/ahahaha.mp3",
    spawnLevel4: "minigame/assets/audio/andi.mp3",
    spawnLevel5: "minigame/assets/audio/gagadi.mp3",
    spawnLevel6: "minigame/assets/audio/whatareyoudoing.mp3",
    spawnLevel7: "minigame/assets/audio/laugh.mp3",
    spawnLevel8: "minigame/assets/audio/rourourou.mp3",
    spawnLevel9: "minigame/assets/audio/miss.mp3",
    spawnLevel10: "minigame/assets/audio/MONTAGEM.mp3",
    impact: "minigame/assets/audio/impact.mp3",
    danger: "minigame/assets/audio/danger.mp3",
    gameOver: "minigame/assets/audio/game_over.mp3",
    ui: "minigame/assets/audio/ui.mp3"
  };
  var audioVolumes = {
    drop: 0.32,
    merge: 0.36,
    combo: 0.42,
    comboVoice2: 0.48,
    comboVoice3: 0.5,
    comboVoice4: 0.52,
    comboVoice5: 0.54,
    comboVoice6: 0.56,
    comboVoice8: 0.58,
    comboVoice10: 0.6,
    spawnLevel1: 0.32,
    spawnLevel2: 0.33,
    spawnLevel3: 0.34,
    spawnLevel4: 0.35,
    spawnLevel5: 0.36,
    spawnLevel6: 0.38,
    spawnLevel7: 0.4,
    spawnLevel8: 0.68,
    spawnLevel9: 0.74,
    spawnLevel10: 0.82,
    impact: 0.18,
    danger: 0.26,
    gameOver: 0.38,
    ui: 0.2
  };


  function unlockAudio() {
    audioUnlocked = true;
    var ctx = getAudioContext();
    if (ctx && ctx.state === "suspended" && typeof ctx.resume === "function") {
      try {
        ctx.resume();
      } catch (error) {
        return;
      }
    }
    preloadGenerationAudio();
  }

  function getAudioContext() {
    if (audioContext) {
      return audioContext;
    }
    try {
      if (ttApi && typeof ttApi.getAudioContext === "function") {
        audioContext = ttApi.getAudioContext();
      } else if (ttApi && typeof ttApi.createWebAudioContext === "function") {
        audioContext = ttApi.createWebAudioContext();
      } else {
        var AudioContextClass = globalScope.AudioContext || globalScope.webkitAudioContext;
        if (AudioContextClass) {
          audioContext = new AudioContextClass();
        }
      }
    } catch (error) {
      audioContext = null;
    }
    return audioContext;
  }

  function createAudioPlayer(name) {
    var player = null;
    var src = audioFiles[name];
    if (!src) {
      return null;
    }
    try {
      if (ttApi && typeof ttApi.createInnerAudioContext === "function") {
        player = ttApi.createInnerAudioContext();
        player.loop = false;
        player.autoplay = false;
        if ("obeyMuteSwitch" in player) {
          player.obeyMuteSwitch = false;
        }
        player.src = src;
        player.volume = audioVolumes[name] || 0.25;
      } else if (typeof Audio !== "undefined") {
        player = new Audio(src);
        player.volume = audioVolumes[name] || 0.25;
        player.preload = "auto";
        player.loop = false;
      }
    } catch (error) {
      return null;
    }
    return player;
  }

  function playAudioFile(name) {
    if (!soundEnabled || !audioUnlocked) {
      return false;
    }
    if (!audioPool[name]) {
      var poolSize = name === "impact" ? 4 : name.indexOf("comboVoice") === 0 ? 1 : name.indexOf("spawnLevel") === 0 ? 2 : 2;
      audioPool[name] = [];
      for (var i = 0; i < poolSize; i += 1) {
        var player = createAudioPlayer(name);
        if (player) {
          audioPool[name].push(player);
        }
      }
    }
    var pool = audioPool[name];
    if (!pool || pool.length === 0) {
      return false;
    }
    var cursor = audioPoolCursor[name] || 0;
    var selected = pool[cursor % pool.length];
    audioPoolCursor[name] = cursor + 1;
    try {
      if (typeof selected.stop === "function") {
        selected.stop();
      }
      if (typeof selected.seek === "function") {
        selected.seek(0);
      } else {
        selected.currentTime = 0;
      }
      selected.play();
      return true;
    } catch (error) {
      return false;
    }
  }

  function preloadGenerationAudio() {
    if (generationAudioPreloaded) {
      return;
    }
    generationAudioPreloaded = true;
    for (var level = 0; level < LEVELS.length; level += 1) {
      var name = getGenerationSoundName(level);
      if (!name || audioPool[name]) {
        continue;
      }
      audioPool[name] = [];
      for (var i = 0; i < 2; i += 1) {
        var player = createAudioPlayer(name);
        if (!player) {
          continue;
        }
        if (typeof player.load === "function") {
          try {
            player.load();
          } catch (error) {
            // 部分小游戏音频对象没有显式 load，忽略即可。
          }
        }
        audioPool[name].push(player);
      }
    }
  }

  function getGenerationSoundName(level) {
    if (level < 0 || level >= LEVELS.length) {
      return null;
    }
    return "spawnLevel" + (level + 1);
  }

  function playGenerationSound(level) {
    if (mode !== "playing" || !soundEnabled || !audioUnlocked) {
      return;
    }
    var soundName = getGenerationSoundName(level);
    if (!soundName) {
      return;
    }
    var now = Date.now();
    var lastPlayedAt = lastGenerationSoundAtByLevel[level] || 0;
    if (now - lastPlayedAt < GENERATION_SOUND_REPEAT_INTERVAL_MS) {
      return;
    }
    if (playAudioFile(soundName)) {
      lastGenerationSoundAtByLevel[level] = now;
    }
  }

  function playTone(frequency, duration, volume, type, delay, endFrequency, fallbackName) {
    if (!soundEnabled || !audioUnlocked) {
      return false;
    }
    var ctx = getAudioContext();
    if (!ctx || typeof ctx.createOscillator !== "function" || typeof ctx.createGain !== "function") {
      return fallbackName ? playAudioFile(fallbackName) : false;
    }
    try {
      if (ctx.state === "suspended" && typeof ctx.resume === "function") {
        ctx.resume();
      }
      var now = ctx.currentTime + (delay || 0);
      var oscillator = ctx.createOscillator();
      var gain = ctx.createGain();
      oscillator.type = type || "triangle";
      oscillator.frequency.setValueAtTime(frequency, now);
      if (endFrequency) {
        oscillator.frequency.exponentialRampToValueAtTime(Math.max(1, endFrequency), now + duration);
      }
      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.exponentialRampToValueAtTime(Math.max(0.0001, volume || 0.04), now + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);
      oscillator.connect(gain);
      gain.connect(ctx.destination);
      oscillator.start(now);
      oscillator.stop(now + duration + 0.02);
      return true;
    } catch (error) {
      return fallbackName ? playAudioFile(fallbackName) : false;
    }
  }

  function playDropSound() {
    var played = playTone(320, 0.075, 0.05, "triangle", 0, 190, "drop");
    playTone(520, 0.04, 0.02, "sine", 0.015, 360, null);
    if (!played) {
      playAudioFile("drop");
    }
  }

  function getComboVoiceName(combo) {
    if (combo >= 10) {
      return "comboVoice10";
    }
    if (combo >= 8) {
      return "comboVoice8";
    }
    if (combo >= 6) {
      return "comboVoice6";
    }
    if (combo >= 5) {
      return "comboVoice5";
    }
    if (combo >= 4) {
      return "comboVoice4";
    }
    if (combo >= 3) {
      return "comboVoice3";
    }
    if (combo >= 2) {
      return "comboVoice2";
    }
    return null;
  }

  function playComboVoice(combo) {
    var voiceName = getComboVoiceName(combo);
    if (!voiceName) {
      return;
    }
    var now = Date.now();
    var minInterval = voiceName === lastComboVoiceName ? COMBO_VOICE_REPEAT_INTERVAL_MS : COMBO_VOICE_SWITCH_INTERVAL_MS;
    if (now - lastComboVoiceAt < minInterval) {
      return;
    }
    if (playAudioFile(voiceName)) {
      lastComboVoiceAt = now;
      lastComboVoiceName = voiceName;
    }
  }

  function playMergeSound(level, combo) {
    var comboPitch = Math.min(combo, 12);
    var base = 430 + level * 32 + comboPitch * 34;
    var volume = Math.min(0.12, 0.048 + comboPitch * 0.0065);
    var fallbackName = combo >= 3 ? "combo" : "merge";
    var played = playTone(base, 0.08, volume, "triangle", 0, base * 1.16, fallbackName);
    playTone(base * 1.5, 0.1, volume * 0.54, "sine", 0.045, base * 1.72, null);

    if (combo >= 2) {
      var steps = Math.min(4, Math.max(2, Math.floor(combo / 2) + 1));
      for (var index = 0; index < steps; index += 1) {
        var delay = 0.04 + index * 0.045;
        var frequency = base * (1.22 + index * 0.22);
        playTone(frequency, 0.07, volume * (0.38 - index * 0.045), "square", delay, frequency * 1.18, null);
      }
    }

    if (combo >= 4) {
      playTone(180 + comboPitch * 8, 0.1, Math.min(0.072, volume * 0.62), "triangle", 0.02, 110, null);
      playTone(base * 2.15, 0.12, volume * 0.42, "sine", 0.16, base * 2.45, null);
    }

    if (combo >= COMBO_CENTER_THRESHOLD) {
      playTone(96, 0.13, 0.08, "sine", 0.02, 62, null);
      playTone(base * 2.65, 0.16, Math.min(0.07, volume * 0.58), "square", 0.08, base * 3.15, null);
      playTone(base * 3.1, 0.09, Math.min(0.055, volume * 0.5), "sine", 0.22, base * 3.7, null);
    }

    if (!played) {
      playAudioFile(fallbackName);
    }
    playComboVoice(combo);
  }

  function playImpactSound(strength) {
    var now = Date.now();
    if (strength < 100 || now - lastImpactSoundAt < 70) {
      return;
    }
    lastImpactSoundAt = now;
    var volume = clamp(0.012 + strength / 7000, 0.018, 0.052);
    var frequency = clamp(150 + strength * 0.35, 150, 320);
    playTone(frequency, 0.045, volume, "sine", 0, Math.max(80, frequency * 0.55), "impact");
  }

  function playDangerSound() {
    var now = Date.now();
    if (now - lastDangerSoundAt < 900) {
      return;
    }
    lastDangerSoundAt = now;
    var played = playTone(760, 0.07, 0.038, "square", 0, null, "danger");
    playTone(560, 0.08, 0.03, "square", 0.085, null, null);
    if (!played) {
      playAudioFile("danger");
    }
  }

  function playGameOverSound() {
    var played = playTone(360, 0.12, 0.055, "triangle", 0, 240, "gameOver");
    playTone(240, 0.16, 0.05, "triangle", 0.13, 150, null);
    playTone(150, 0.22, 0.045, "sine", 0.28, 95, null);
    if (!played) {
      playAudioFile("gameOver");
    }
  }

  function playUiSound() {
    playTone(620, 0.045, 0.028, "sine", 0, null, "ui");
  }

  function resizeCanvas() {
    var info = getSystemInfo();
    viewWidth = Math.max(1, info.windowWidth || canvas.width || STAGE_WIDTH);
    viewHeight = Math.max(1, info.windowHeight || canvas.height || STAGE_HEIGHT);
    pixelRatio = Math.max(1, Math.min(3, info.pixelRatio || 1));
    canvas.width = Math.floor(viewWidth * pixelRatio);
    canvas.height = Math.floor(viewHeight * pixelRatio);
    canvas.style && (canvas.style.width = viewWidth + "px");
    canvas.style && (canvas.style.height = viewHeight + "px");
    context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
    stageScale = Math.min(viewWidth / STAGE_WIDTH, viewHeight / STAGE_HEIGHT);
    stageOffsetX = (viewWidth - STAGE_WIDTH * stageScale) / 2;
    stageOffsetY = (viewHeight - STAGE_HEIGHT * stageScale) / 2;
  }

  function readHighScore() {
    try {
      if (ttApi && typeof ttApi.getStorageSync === "function") {
        return Number(ttApi.getStorageSync("coin-fantasia-high-score")) || 0;
      }
      if (typeof localStorage !== "undefined") {
        return Number(localStorage.getItem("coin-fantasia-high-score")) || 0;
      }
    } catch (error) {
      return 0;
    }
    return 0;
  }

  function writeHighScore(value) {
    try {
      if (ttApi && typeof ttApi.setStorageSync === "function") {
        ttApi.setStorageSync("coin-fantasia-high-score", String(value));
      } else if (typeof localStorage !== "undefined") {
        localStorage.setItem("coin-fantasia-high-score", String(value));
      }
    } catch (error) {
      return;
    }
  }

  function clamp(value, min, max) {
    return Math.min(max, Math.max(min, value));
  }

  function stageXFromScreen(screenX) {
    return clamp((screenX - stageOffsetX) / stageScale, 0, STAGE_WIDTH);
  }

  function stageYFromScreen(screenY) {
    return clamp((screenY - stageOffsetY) / stageScale, 0, STAGE_HEIGHT);
  }

  function hitRect(point, rect) {
    return point.x >= rect.x && point.x <= rect.x + rect.w && point.y >= rect.y && point.y <= rect.y + rect.h;
  }

  function isTruthyRuntimeFlag(value) {
    if (value === true) {
      return true;
    }
    var text = String(value == null ? "" : value).toLowerCase();
    return text === "1" || text === "true" || text === "on" || text === "yes" || text === "prod" || text === "production";
  }

  function isRealLeyuanSdkEnabled() {
    return isTruthyRuntimeFlag(globalScope.POLO_ENABLE_REAL_LEYUAN_SDK);
  }

  function getMetaH5AdApi() {
    return globalScope && globalScope.MetaH5Ad ? globalScope.MetaH5Ad : null;
  }

  function getH5MetaApi() {
    return globalScope && globalScope.H5MetaApi ? globalScope.H5MetaApi : null;
  }

  function withSdkTimeout(promise, timeoutMs, message) {
    if (!timeoutMs || timeoutMs <= 0) {
      return promise;
    }
    return new Promise(function (resolve, reject) {
      var settled = false;
      var timer = setTimeout(function () {
        if (settled) {
          return;
        }
        settled = true;
        reject(new Error(message || "SDK 请求超时"));
      }, timeoutMs);
      promise.then(function (value) {
        if (settled) {
          return;
        }
        settled = true;
        clearTimeout(timer);
        resolve(value);
      }).catch(function (error) {
        if (settled) {
          return;
        }
        settled = true;
        clearTimeout(timer);
        reject(error);
      });
    });
  }

  function callH5MetaApi(method, args, timeoutMs, timeoutMessage) {
    var promise = new Promise(function (resolve, reject) {
      var api = getH5MetaApi();
      if (!api || typeof api[method] !== "function") {
        reject(new Error("当前环境不支持派对币支付"));
        return;
      }
      try {
        var result = api[method].apply(api, args || []);
        if (result && typeof result.then === "function") {
          result.then(resolve).catch(reject);
        } else {
          resolve(result);
        }
      } catch (error) {
        reject(error);
      }
    });
    return withSdkTimeout(promise, timeoutMs, timeoutMessage);
  }

  function ensureLeyuanIapInitialized() {
    if (iapInitialized) {
      return Promise.resolve();
    }
    if (iapInitPromise) {
      return iapInitPromise;
    }
    iapInitPromise = callH5MetaApi("init", [LEYUAN_APP_KEY, LEYUAN_CP_ID], SDK_TIMEOUT_MS, "派对币支付初始化超时")
      .then(function () {
        iapInitialized = true;
        iapInitPromise = null;
      }).catch(function (error) {
        iapInitialized = false;
        iapInitPromise = null;
        throw error;
      });
    return iapInitPromise;
  }

  function ensureLeyuanIapLoggedIn() {
    if (iapUserInfo) {
      return Promise.resolve(iapUserInfo);
    }
    if (iapLoginPromise) {
      return iapLoginPromise;
    }
    iapLoginPromise = ensureLeyuanIapInitialized().then(function () {
      return callH5MetaApi("login", [], SDK_TIMEOUT_MS, "派对币支付登录超时");
    }).then(function (rawData) {
      iapUserInfo = rawData && rawData.data ? rawData.data : rawData || {};
      iapLoginPromise = null;
      return iapUserInfo;
    }).catch(function (error) {
      iapLoginPromise = null;
      throw error;
    });
    return iapLoginPromise;
  }

  function generateIapOrderId() {
    return "revive_" + Date.now() + "_" + Math.random().toString(36).slice(2, 10);
  }

  function normalizePayResult(rawData) {
    if (typeof rawData === "number") {
      return { code: 200, msg: "", data: rawData };
    }
    return {
      code: rawData && rawData.code != null ? Number(rawData.code) : 0,
      msg: rawData && rawData.msg ? String(rawData.msg) : "",
      data: rawData && rawData.data != null ? Number(rawData.data) : PAY_RESULT_CODE_FAILED
    };
  }

  function requestIapRevivePayment() {
    if (!isRealLeyuanSdkEnabled()) {
      console.log("[IAP] 调试模式，跳过派对币真实支付。把 POLO_ENABLE_REAL_LEYUAN_SDK 改成 true 后才会拉起 233 乐园 IAP。");
      return Promise.resolve({ success: true, simulated: true });
    }
    return ensureLeyuanIapLoggedIn().then(function () {
      return callH5MetaApi("pay", [{
        cpOrderId: generateIapOrderId(),
        productCode: REVIVE_IAP_PRODUCT.productCode,
        productName: REVIVE_IAP_PRODUCT.productName,
        price: REVIVE_IAP_PRODUCT.price,
        cpExtra: REVIVE_IAP_PRODUCT.cpExtra
      }], 0, "");
    }).then(function (rawData) {
      var result = normalizePayResult(rawData);
      if (result.data === PAY_RESULT_CODE_SUCCESS) {
        return { success: true, result: result };
      }
      if (result.data === PAY_RESULT_CODE_CANCEL) {
        return { success: false, cancelled: true, message: "已取消派对币支付" };
      }
      return { success: false, message: result.msg ? "派对币支付失败：" + result.msg : "派对币支付失败，请重试" };
    });
  }

  function checkRewardAdSupport() {
    var adApi = getMetaH5AdApi();
    if (!adApi || typeof adApi.isAdSupport !== "function") {
      return Promise.resolve(false);
    }
    return new Promise(function (resolve) {
      var resolved = false;
      var timer = setTimeout(function () {
        if (!resolved) {
          resolved = true;
          resolve(false);
        }
      }, 3000);
      try {
        adApi.isAdSupport(REWARD_VIDEO_AD_TYPE, function (result) {
          if (resolved) {
            return;
          }
          resolved = true;
          clearTimeout(timer);
          resolve(!!(result && result.code === 0 && Number(result.data) === 1));
        });
      } catch (error) {
        if (!resolved) {
          resolved = true;
          clearTimeout(timer);
          resolve(false);
        }
      }
    });
  }

  function showRewardAd() {
    var adApi = getMetaH5AdApi();
    if (!adApi || typeof adApi.showAd !== "function") {
      return Promise.reject(new Error("当前环境不支持广告继续"));
    }
    return new Promise(function (resolve, reject) {
      try {
        adApi.showAd(REWARD_VIDEO_AD_TYPE, function (result) {
          if (!result || result.code !== 0) {
            resolve({ success: false, message: "广告播放失败，请稍后重试" });
            return;
          }
          var status = result.data && typeof result.data.status !== "undefined" ? Number(result.data.status) : -1;
          if (status === REWARD_VIDEO_STATUS_REWARDED) {
            resolve({ success: true, status: status });
            return;
          }
          resolve({ success: false, status: status, message: "看完广告才能继续游戏" });
        });
      } catch (error) {
        reject(error);
      }
    });
  }

  function requestAdReviveReward() {
    if (!isRealLeyuanSdkEnabled()) {
      console.log("[IAA] 调试模式，跳过激励视频真实播放。把 POLO_ENABLE_REAL_LEYUAN_SDK 改成 true 后才会拉起 233 乐园 IAA。");
      return Promise.resolve({ success: true, simulated: true });
    }
    return checkRewardAdSupport().then(function (supported) {
      if (!supported) {
        return { success: false, message: "当前环境不支持广告继续" };
      }
      return showRewardAd();
    });
  }

  function clearRevivePurchaseState() {
    revivePurchaseBusy = false;
    revivePurchaseType = "";
  }

  function failRevivePurchase(message) {
    clearRevivePurchaseState();
    reviveStatusText = message || "继续游戏失败，请稍后重试";
    playUiSound();
  }

  function grantReviveAccess() {
    clearRevivePurchaseState();
    reviveStatusText = "";
    if (mode === "gameOver") {
      showReviveCards();
    }
  }

  function startAdReviveFlow() {
    if (revivePurchaseBusy) {
      return;
    }
    revivePurchaseBusy = true;
    revivePurchaseType = "ad";
    reviveStatusText = isRealLeyuanSdkEnabled() ? "正在拉起广告..." : "调试模式：跳过广告继续";
    playUiSound();
    requestAdReviveReward().then(function (result) {
      if (mode !== "gameOver") {
        clearRevivePurchaseState();
        return;
      }
      if (result && result.success) {
        grantReviveAccess();
      } else {
        failRevivePurchase(result && result.message ? result.message : "看完广告才能继续游戏");
      }
    }).catch(function (error) {
      if (mode === "gameOver") {
        failRevivePurchase(error && error.message ? error.message : "广告播放失败，请稍后重试");
      } else {
        clearRevivePurchaseState();
      }
    });
  }

  function startIapReviveFlow() {
    if (revivePurchaseBusy) {
      return;
    }
    revivePurchaseBusy = true;
    revivePurchaseType = "iap";
    reviveStatusText = isRealLeyuanSdkEnabled() ? "正在拉起派对币支付..." : "调试模式：跳过支付继续";
    playUiSound();
    requestIapRevivePayment().then(function (result) {
      if (mode !== "gameOver") {
        clearRevivePurchaseState();
        return;
      }
      if (result && result.success) {
        grantReviveAccess();
      } else {
        failRevivePurchase(result && result.message ? result.message : "派对币支付失败，请重试");
      }
    }).catch(function (error) {
      if (mode === "gameOver") {
        failRevivePurchase(error && error.message ? error.message : "派对币支付异常，请稍后重试");
      } else {
        clearRevivePurchaseState();
      }
    });
  }

  function setPointer(stageX) {
    var radius = LEVELS[previewLevel].radius;
    pointerX = clamp(stageX, radius + 8, STAGE_WIDTH - radius - 8);
  }

  function pickSpawnLevel() {
    var total = 0;
    for (var i = 0; i < LEVELS.length; i += 1) {
      total += LEVELS[i].weight;
    }
    var cursor = Math.random() * total;
    for (var j = 0; j < LEVELS.length; j += 1) {
      cursor -= LEVELS[j].weight;
      if (cursor <= 0) {
        return j;
      }
    }
    return 0;
  }

  function hasCoinOfLevel(level) {
    for (var i = 0; i < coins.length; i += 1) {
      if (coins[i].level === level) {
        return true;
      }
    }
    return false;
  }

  function shouldTrackFirstSpawnPopup(level) {
    return level >= FIRST_SPAWN_POPUP_MIN_LEVEL && level <= FIRST_SPAWN_POPUP_MAX_LEVEL;
  }

  function showFirstSpawnPopup(level) {
    var def = LEVELS[level];
    if (!def || !shouldTrackFirstSpawnPopup(level)) {
      return;
    }
    firstSpawnPopup = {
      level: level,
      name: def.name,
      ageMs: 0,
      durationMs: FIRST_SPAWN_POPUP_DURATION_MS
    };
  }

  function updateFirstSpawnPopup(dtMs) {
    if (!firstSpawnPopup) {
      return;
    }
    firstSpawnPopup.ageMs += dtMs;
    if (firstSpawnPopup.ageMs >= firstSpawnPopup.durationMs) {
      firstSpawnPopup = null;
    }
  }

  function createCoin(level, x, y, vx, vy) {
    var def = LEVELS[level];
    var isFirstCoinOfLevelInScene = !hasCoinOfLevel(level);
    var shouldShowFirstSpawnPopup = shouldTrackFirstSpawnPopup(level) && isFirstCoinOfLevelInScene && mode === "playing";
    var shouldPlayGenerationSound = isFirstCoinOfLevelInScene && mode === "playing";
    var coin = {
      id: nextId++,
      level: level,
      x: clamp(x, def.radius + 2, STAGE_WIDTH - def.radius - 2),
      y: y,
      vx: vx || 0,
      vy: vy || 0,
      radius: def.radius,
      angle: 0,
      spin: (vx || 0) / Math.max(def.radius, 1) + (Math.random() - 0.5) * 0.35,
      createdAt: Date.now(),
      overLineMs: 0,
      merging: false
    };
    coins.push(coin);
    if (shouldShowFirstSpawnPopup) {
      showFirstSpawnPopup(level);
    }
    if (shouldPlayGenerationSound) {
      playGenerationSound(level);
    }
    return coin;
  }

  function dropCoin() {
    if (mode !== "playing" || cooldownMs > 0) {
      return;
    }
    createCoin(previewLevel, pointerX, DROP_Y, (Math.random() - 0.5) * 28, 0);
    playDropSound();
    previewLevel = nextLevel;
    nextLevel = pickSpawnLevel();
    cooldownMs = 480;
  }

  function resetGame() {
    coins = [];
    flashes = [];
    nextId = 1;
    score = 0;
    mode = "playing";
    cooldownMs = 0;
    dangerMs = 0;
    comboCount = 0;
    comboWindowMs = 0;
    physicsAccumulator = 0;
    gameOverSoundPlayed = false;
    screenShakeMs = 0;
    screenShakeMagnitude = 0;
    screenFlashMs = 0;
    lastComboVoiceAt = 0;
    lastComboVoiceName = "";
    lastGenerationSoundAtByLevel = {};
    firstSpawnPopup = null;
    runStartedAt = Date.now();
    runHighScoreAtStart = highScore;
    gameOverAt = 0;
    mergeCount = 0;
    maxComboCount = 0;
    highestLevelReached = 0;
    reviveCount = 0;
    selectedCards = [];
    selectedPowerCard = null;
    lastPowerupMessage = "";
    lastPowerupMessageMs = 0;
    clearRevivePurchaseState();
    reviveStatusText = "";
    pointerX = STAGE_WIDTH / 2;
    previewLevel = pickSpawnLevel();
    nextLevel = pickSpawnLevel();
  }

  function addScore(value) {
    var bonus = comboCount > 1 ? Math.floor(value * Math.min(comboCount, 8) * 0.12) : 0;
    score += value + bonus;
    if (score > highScore) {
      highScore = score;
      writeHighScore(highScore);
    }
  }

  function update(dt, dtMs) {
    if (mode !== "playing") {
      updateFlashes(dtMs);
      updateFirstSpawnPopup(dtMs);
      return;
    }

    cooldownMs = Math.max(0, cooldownMs - dtMs);
    updateFirstSpawnPopup(dtMs);
    comboWindowMs = Math.max(0, comboWindowMs - dtMs);
    if (comboWindowMs <= 0) {
      comboCount = 0;
    }

    physicsAccumulator += Math.min(dt, 0.1);
    var steps = 0;
    while (physicsAccumulator >= FIXED_TIMESTEP && steps < MAX_PHYSICS_STEPS) {
      stepPhysics(FIXED_TIMESTEP);
      physicsAccumulator -= FIXED_TIMESTEP;
      steps += 1;
    }
    if (steps >= MAX_PHYSICS_STEPS && physicsAccumulator >= FIXED_TIMESTEP) {
      physicsAccumulator = 0;
    }

    updateDanger(dtMs);
    updateFlashes(dtMs);
  }

  function stepPhysics(dt) {
    for (var i = 0; i < coins.length; i += 1) {
      integrateCoin(coins[i], dt);
    }

    for (var iteration = 0; iteration < SOLVER_ITERATIONS; iteration += 1) {
      resolveCoinCollisions(iteration === 0);
    }

    for (var j = 0; j < coins.length; j += 1) {
      stabilizeCoin(coins[j]);
    }
  }

  function integrateCoin(coin, dt) {
    coin.vy += GRAVITY * dt;
    coin.vx *= AIR_FRICTION;
    coin.vy *= AIR_FRICTION;
    clampCoinVelocity(coin);
    coin.x += coin.vx * dt;
    coin.y += coin.vy * dt;
    coin.spin = coin.spin * 0.9 + (coin.vx / Math.max(coin.radius, 1)) * 0.1;
    coin.angle += coin.spin * dt;

    resolveBounds(coin);
  }

  function clampCoinVelocity(coin) {
    var speed = Math.sqrt(coin.vx * coin.vx + coin.vy * coin.vy);
    if (speed <= MAX_COIN_SPEED) {
      return;
    }
    var scale = MAX_COIN_SPEED / speed;
    coin.vx *= scale;
    coin.vy *= scale;
  }

  function resolveBounds(coin) {
    if (coin.x - coin.radius < 0) {
      coin.x = coin.radius;
      coin.vx = Math.abs(coin.vx) * WALL_RESTITUTION;
      coin.spin *= 0.72;
    }
    if (coin.x + coin.radius > STAGE_WIDTH) {
      coin.x = STAGE_WIDTH - coin.radius;
      coin.vx = -Math.abs(coin.vx) * WALL_RESTITUTION;
      coin.spin *= 0.72;
    }
    if (coin.y + coin.radius > FLOOR_Y) {
      coin.y = FLOOR_Y - coin.radius;
      coin.vy = -Math.abs(coin.vy) * (LEVELS[coin.level].restitution * FLOOR_RESTITUTION_SCALE);
      coin.vx *= 0.86;
      coin.spin = coin.spin * 0.76 + (coin.vx / Math.max(coin.radius, 1)) * 0.24;
      if (Math.abs(coin.vy) < RESTING_SPEED) {
        coin.vy = 0;
      }
      if (Math.abs(coin.vx) < RESTING_HORIZONTAL_SPEED) {
        coin.vx = 0;
      }
    }
  }

  function stabilizeCoin(coin) {
    if (coin.x - coin.radius < 0 || coin.x + coin.radius > STAGE_WIDTH || coin.y + coin.radius > FLOOR_Y) {
      resolveBounds(coin);
    }
    if (coin.y + coin.radius >= FLOOR_Y - 0.5 && Math.abs(coin.vy) < RESTING_SPEED && Math.abs(coin.vx) < RESTING_HORIZONTAL_SPEED) {
      coin.vx = 0;
      coin.vy = 0;
      coin.spin *= 0.5;
    }
  }

  function resolveCoinCollisions(allowMerge) {
    var mergedIds = {};
    for (var i = 0; i < coins.length; i += 1) {
      for (var j = i + 1; j < coins.length; j += 1) {
        var a = coins[i];
        var b = coins[j];
        if (mergedIds[a.id] || mergedIds[b.id]) {
          continue;
        }
        var dx = b.x - a.x;
        var dy = b.y - a.y;
        var distSq = dx * dx + dy * dy;
        var minDist = a.radius + b.radius;
        if (distSq >= minDist * minDist) {
          continue;
        }
        var dist = Math.sqrt(distSq) || 0.001;
        var nx = dx / dist;
        var ny = dy / dist;

        if (allowMerge && a.level === b.level && a.level < LEVELS.length - 1) {
          mergedIds[a.id] = true;
          mergedIds[b.id] = true;
          mergeCoins(a, b);
          continue;
        }

        var overlap = Math.max(0, minDist - dist - 0.15);
        var totalMass = a.radius * a.radius + b.radius * b.radius;
        var aShare = (b.radius * b.radius) / totalMass;
        var bShare = (a.radius * a.radius) / totalMass;
        var correction = overlap * 0.86;
        a.x -= nx * correction * aShare;
        a.y -= ny * correction * aShare;
        b.x += nx * correction * bShare;
        b.y += ny * correction * bShare;

        var relativeVelocity = (b.vx - a.vx) * nx + (b.vy - a.vy) * ny;
        if (relativeVelocity < 0) {
          var restitution = Math.min(LEVELS[a.level].restitution, LEVELS[b.level].restitution);
          var impactStrength = -relativeVelocity;
          var impulse = -((1 + restitution) * relativeVelocity);
          a.vx -= impulse * nx * aShare;
          a.vy -= impulse * ny * aShare;
          b.vx += impulse * nx * bShare;
          b.vy += impulse * ny * bShare;

          var tx = -ny;
          var ty = nx;
          var tangentVelocity = (b.vx - a.vx) * tx + (b.vy - a.vy) * ty;
          var frictionImpulse = tangentVelocity * 0.08;
          a.vx += frictionImpulse * tx * aShare;
          a.vy += frictionImpulse * ty * aShare;
          b.vx -= frictionImpulse * tx * bShare;
          b.vy -= frictionImpulse * ty * bShare;
          a.spin = a.spin * 0.92 - frictionImpulse / Math.max(a.radius, 1) * 0.04;
          b.spin = b.spin * 0.92 + frictionImpulse / Math.max(b.radius, 1) * 0.04;
          playImpactSound(impactStrength);
        }
      }
    }
  }

  function mergeCoins(a, b) {
    var newLevel = a.level + 1;
    var x = (a.x + b.x) / 2;
    var y = (a.y + b.y) / 2;
    var vx = (a.vx + b.vx) * 0.24;
    var vy = (a.vy + b.vy) * 0.24 - 96;
    coins = coins.filter(function (coin) {
      return coin.id !== a.id && coin.id !== b.id;
    });
    createCoin(newLevel, x, y, vx, vy);
    comboCount = comboWindowMs > 0 ? comboCount + 1 : 1;
    comboWindowMs = COMBO_WINDOW_MS;
    mergeCount += 1;
    maxComboCount = Math.max(maxComboCount, comboCount);
    highestLevelReached = Math.max(highestLevelReached, newLevel);
    addScore(LEVELS[newLevel].score);
    flashes.push(createComboFlash(x, y, comboCount));
    triggerComboVisualEffects(comboCount);
    playMergeSound(newLevel, comboCount);
  }

  function updateDanger(dtMs) {
    var now = Date.now();
    var maxOverLineMs = 0;
    for (var i = 0; i < coins.length; i += 1) {
      var coin = coins[i];
      var top = coin.y - coin.radius;
      var isOverLine = !coin.merging && now - coin.createdAt > GAME_OVER_GRACE_MS && top < DANGER_LINE_Y - GAME_OVER_LINE_BUFFER;
      if (isOverLine) {
        coin.overLineMs += dtMs;
      } else {
        coin.overLineMs = Math.max(0, coin.overLineMs - dtMs * GAME_OVER_RECOVER_DECAY);
      }
      maxOverLineMs = Math.max(maxOverLineMs, coin.overLineMs);
    }
    dangerMs = maxOverLineMs;
    if (dangerMs > GAME_OVER_WARNING_MS) {
      playDangerSound();
    }
    if (dangerMs >= GAME_OVER_OVERLINE_MS && mode !== "gameOver") {
      enterGameOver();
    }
  }

  function updateFlashes(dtMs) {
    screenShakeMs = Math.max(0, screenShakeMs - dtMs);
    screenFlashMs = Math.max(0, screenFlashMs - dtMs);
    lastPowerupMessageMs = Math.max(0, lastPowerupMessageMs - dtMs);
    for (var i = 0; i < flashes.length; i += 1) {
      flashes[i].ageMs += dtMs;
    }
    flashes = flashes.filter(function (flash) {
      return flash.ageMs < flash.durationMs;
    });
  }

  function enterGameOver() {
    if (mode === "gameOver") {
      return;
    }
    mode = "gameOver";
    gameOverAt = Date.now();
    if (!gameOverSoundPlayed) {
      gameOverSoundPlayed = true;
      playGameOverSound();
    }
  }

  function getRunDurationMs() {
    var end = mode === "gameOver" && gameOverAt > 0 ? gameOverAt : Date.now();
    return Math.max(0, end - runStartedAt);
  }

  function formatDuration(ms) {
    var totalSeconds = Math.max(0, Math.floor(ms / 1000));
    var minutes = Math.floor(totalSeconds / 60);
    var seconds = totalSeconds % 60;
    return String(minutes).padStart(2, "0") + ":" + String(seconds).padStart(2, "0");
  }

  function getRunTitle() {
    if (maxComboCount >= 10) return "爽到飞起！";
    if (maxComboCount >= 8) return "逆天连击！";
    if (highestLevelReached >= 8) return "财神附体！";
    if (score >= runHighScoreAtStart && score > 0) return "刷新纪录！";
    if (mergeCount >= 20) return "根本停不下来！";
    return "本局战报";
  }

  function getRunComment() {
    if (maxComboCount >= 10) return "你这波连击已经不是操作，是玄学。";
    if (reviveCount >= 3) return "主打一个无限续命，继续爽就完事了。";
    if (highestLevelReached >= 8) return "大币一出，财运直接拉满。";
    if (mergeCount >= 20) return "合成节奏不错，下一把继续冲更高。";
    return "差一点就起飞，继续游戏还能反杀。";
  }

  function getOvertakePercent() {
    var raw = 18 + Math.floor(Math.min(76, Math.sqrt(Math.max(0, score)) * 0.58 + maxComboCount * 2.2 + highestLevelReached * 3));
    return clamp(raw, 18, 98);
  }

  function pickReviveCards() {
    // Figma 目标页固定展示三张续命神卡：炸弹 / 锤子 / 清屏。
    // 财神保佑保留为好运奖励氛围与备用卡牌逻辑，不在三卡布局里挤占点击位。
    selectedCards = [POWER_CARDS[0], POWER_CARDS[1], POWER_CARDS[2]];
  }

  function showReviveCards() {
    clearRevivePurchaseState();
    reviveStatusText = "";
    pickReviveCards();
    selectedPowerCard = selectedCards[0] || null;
    mode = "cardSelect";
    playUiSound();
  }

  function continueAfterPowerup(message) {
    mode = "playing";
    dangerMs = 0;
    cooldownMs = Math.min(cooldownMs, 220);
    comboWindowMs = 0;
    comboCount = 0;
    gameOverSoundPlayed = false;
    reviveCount += 1;
    lastPowerupMessage = message || "续命成功！";
    lastPowerupMessageMs = 1400;
    for (var i = 0; i < coins.length; i += 1) {
      coins[i].overLineMs = 0;
      coins[i].createdAt = Date.now();
      if (coins[i].y - coins[i].radius < DANGER_LINE_Y + 6) {
        coins[i].y += Math.min(44, DANGER_LINE_Y + 8 - (coins[i].y - coins[i].radius));
      }
    }
    screenShakeMs = Math.max(screenShakeMs, 120);
    screenShakeMagnitude = Math.max(screenShakeMagnitude, 5);
    screenFlashMs = Math.max(screenFlashMs, 120);
    playMergeSound(0, 4);
  }

  function removeCoinsByIds(ids) {
    if (!ids || ids.length === 0) return 0;
    var lookup = {};
    for (var i = 0; i < ids.length; i += 1) lookup[ids[i]] = true;
    var removed = 0;
    coins = coins.filter(function (coin) {
      if (lookup[coin.id]) {
        removed += 1;
        return false;
      }
      return true;
    });
    return removed;
  }

  function findCoinAtPoint(point) {
    for (var i = coins.length - 1; i >= 0; i -= 1) {
      var coin = coins[i];
      var dx = point.x - coin.x;
      var dy = point.y - coin.y;
      if (dx * dx + dy * dy <= coin.radius * coin.radius) {
        return coin;
      }
    }
    return null;
  }

  function applyPowerCard(card, target) {
    if (!card) return;
    var removed = 0;
    if (card.id === "hammer" && target) {
      removed = removeCoinsByIds([target.id]);
      flashes.push(createPowerupFlash(target.x, target.y, "砸碎了！"));
      continueAfterPowerup("锤子砸碎 " + removed + " 个金币");
      return;
    }
    if (card.id === "bomb" && target) {
      var radius = Math.max(86, target.radius * 2.25);
      var ids = [];
      for (var i = 0; i < coins.length; i += 1) {
        var coin = coins[i];
        var dx = coin.x - target.x;
        var dy = coin.y - target.y;
        if (Math.sqrt(dx * dx + dy * dy) <= radius + coin.radius * 0.35) {
          ids.push(coin.id);
        }
      }
      removed = removeCoinsByIds(ids);
      flashes.push(createPowerupFlash(target.x, target.y, "炸裂开爽！"));
      continueAfterPowerup("炸弹清掉 " + removed + " 个金币");
      return;
    }
    if (card.id === "clearLowest") {
      var minLevel = 99;
      for (var a = 0; a < coins.length; a += 1) minLevel = Math.min(minLevel, coins[a].level);
      var lowIds = [];
      for (var b = 0; b < coins.length; b += 1) if (coins[b].level === minLevel) lowIds.push(coins[b].id);
      removed = removeCoinsByIds(lowIds);
      flashes.push(createPowerupFlash(STAGE_WIDTH / 2, STAGE_HEIGHT / 2 - 20, "清屏一次！"));
      continueAfterPowerup("清掉最低等级金币 x" + removed);
      return;
    }
    if (card.id === "fortune") {
      var sorted = coins.slice().sort(function (a, b) { return (a.y - a.radius) - (b.y - b.radius); });
      var topIds = sorted.slice(0, 5).map(function (coin) { return coin.id; });
      removed = removeCoinsByIds(topIds);
      flashes.push(createPowerupFlash(STAGE_WIDTH / 2, DANGER_LINE_Y + 54, "财神保佑！"));
      continueAfterPowerup("财神清掉顶部危机 x" + removed);
    }
  }

  function createPowerupFlash(x, y, text) {
    return {
      x: x,
      y: y,
      combo: 8,
      ageMs: 0,
      text: text,
      isCenter: true,
      durationMs: COMBO_CENTER_DURATION_MS
    };
  }


  function createComboFlash(x, y, combo) {
    var isCenter = combo >= COMBO_CENTER_THRESHOLD;
    return {
      x: x,
      y: y,
      combo: combo,
      ageMs: 0,
      text: getComboText(combo),
      isCenter: isCenter,
      durationMs: isCenter ? COMBO_CENTER_DURATION_MS : COMBO_LOCAL_DURATION_MS
    };
  }

  function getComboText(combo) {
    if (combo >= 10) {
      return "爽到飞起！";
    }
    if (combo >= 8) {
      return "逆天连击！";
    }
    if (combo >= 6) {
      return "太离谱了！";
    }
    if (combo >= 5) {
      return "起飞！";
    }
    if (combo >= 4) {
      return "爽起来了！";
    }
    if (combo >= 3) {
      return "有点东西！";
    }
    if (combo >= 2) {
      return "连起来了！";
    }
    return "合成！";
  }

  function triggerComboVisualEffects(combo) {
    if (combo >= COMBO_CENTER_THRESHOLD) {
      screenShakeMs = Math.max(screenShakeMs, 180);
      screenShakeMagnitude = Math.max(screenShakeMagnitude, Math.min(12, 5 + combo * 0.55));
      screenFlashMs = Math.max(screenFlashMs, 160);
      return;
    }
    if (combo >= 4) {
      screenShakeMs = Math.max(screenShakeMs, 95);
      screenShakeMagnitude = Math.max(screenShakeMagnitude, Math.min(6, 2.5 + combo * 0.32));
    }
  }

  function draw() {
    context.save();
    context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
    context.clearRect(0, 0, viewWidth, viewHeight);
    context.fillStyle = "#4d3220";
    context.fillRect(0, 0, viewWidth, viewHeight);
    context.translate(stageOffsetX, stageOffsetY);
    context.scale(stageScale, stageScale);
    if (screenShakeMs > 0) {
      var intensity = screenShakeMagnitude * (screenShakeMs / Math.max(1, screenShakeMs + 80));
      context.translate((Math.random() - 0.5) * intensity, (Math.random() - 0.5) * intensity);
    }
    drawStage();
    context.restore();
  }

  function drawStage() {
    if (mode === "home") {
      drawHomeScreen();
      return;
    }
    var bg = context.createLinearGradient(0, 0, 0, STAGE_HEIGHT);
    bg.addColorStop(0, "#080620");
    bg.addColorStop(0.45, "#120a3b");
    bg.addColorStop(1, "#1d0742");
    context.fillStyle = bg;
    context.fillRect(0, 0, STAGE_WIDTH, STAGE_HEIGHT);

    drawRadialGlow(76, 108, 0, 175, "rgba(35,247,255,0.18)", "rgba(35,247,255,0)");
    drawRadialGlow(STAGE_WIDTH - 56, 116, 0, 170, "rgba(255,79,216,0.16)", "rgba(255,79,216,0)");
    drawRadialGlow(STAGE_WIDTH / 2, FLOOR_Y - 76, 0, 210, "rgba(255,229,0,0.08)", "rgba(255,229,0,0)");

    fillRoundRect(12, 134, STAGE_WIDTH - 24, FLOOR_Y - 128, 28, "rgba(5,5,26,0.42)");
    strokeOnlyRoundRect(12, 134, STAGE_WIDTH - 24, FLOOR_Y - 128, 28, "rgba(255,255,255,0.22)", 2);
    strokeOnlyRoundRect(14, 136, STAGE_WIDTH - 28, FLOOR_Y - 132, 26, "rgba(17,17,17,0.8)", 2);

    context.save();
    var floorGlow = context.createLinearGradient(0, FLOOR_Y - 20, 0, FLOOR_Y + 16);
    floorGlow.addColorStop(0, "rgba(255,229,0,0)");
    floorGlow.addColorStop(0.55, "rgba(255,229,0,0.35)");
    floorGlow.addColorStop(1, "rgba(255,159,0,0)");
    context.fillStyle = floorGlow;
    context.fillRect(0, FLOOR_Y - 34, STAGE_WIDTH, 58);
    fillRoundRect(12, FLOOR_Y - 8, STAGE_WIDTH - 24, 12, 6, "#f5cd33");
    fillRoundRect(12, FLOOR_Y + 2, STAGE_WIDTH - 24, 7, 4, "#c78000");
    context.restore();

    drawHud();
    drawDangerLine();
    drawPreview();
    for (var i = 0; i < coins.length; i += 1) {
      drawCoin(coins[i]);
    }
    drawFlashes();
    drawScreenFlash();

    if (lastPowerupMessageMs > 0) {
      drawPowerupMessage();
    }

    drawFirstSpawnPopup();

    if (mode === "gameOver") {
      drawSettlementOverlay();
    } else if (mode === "cardSelect") {
      drawCardSelectOverlay();
    } else if (mode === "targetingPowerup") {
      drawTargetingOverlay();
    } else if (mode === "paused") {
      drawOverlay("已暂停", "点击任意位置继续");
    }
  }

  function drawHomeScreen() {
    context.save();
    var bg = context.createLinearGradient(0, 0, 0, STAGE_HEIGHT);
    bg.addColorStop(0, "#7a19e8");
    bg.addColorStop(0.54, "#6b16ce");
    bg.addColorStop(1, "#821cff");
    context.fillStyle = bg;
    context.fillRect(0, 0, STAGE_WIDTH, STAGE_HEIGHT);

    drawRadialGlow(78, 90, 0, 160, "rgba(255,79,216,0.22)", "rgba(255,79,216,0)");
    drawRadialGlow(STAGE_WIDTH - 70, 520, 0, 170, "rgba(255,229,0,0.14)", "rgba(255,229,0,0)");
    drawRadialGlow(STAGE_WIDTH / 2, 350, 0, 240, "rgba(35,247,255,0.12)", "rgba(35,247,255,0)");

    drawPanel(30, 36, STAGE_WIDTH - 60, 92, 18, "rgba(83,20,168,0.86)", "rgba(255,255,255,0.16)", 0);
    drawTextStroke("合成唐佳琪", 52, 78, "900 34px sans-serif", "#ffffff", "#111111", 4, "left");
    context.textAlign = "left";
    context.font = "800 15px sans-serif";
    context.fillStyle = "#fff23b";
    context.fillText("合成越离谱，越停不下来", 54, 104);
    drawSticker(STAGE_WIDTH - 118, 51, 62, 32, 9, "#ff3d00", "HOT", 14, -7);

    drawPanel(30, 144, STAGE_WIDTH - 60, 360, 26, "rgba(94,31,184,0.7)", "rgba(255,255,255,0.18)", 0);
    fillRoundRect(44, 158, STAGE_WIDTH - 88, 292, 24, "rgba(255,255,255,0.06)");
    strokeOnlyRoundRect(44, 158, STAGE_WIDTH - 88, 292, 24, "rgba(255,255,255,0.16)", 1.5);

    drawRadialGlow(STAGE_WIDTH / 2, 327, 0, 92, "rgba(35,247,255,0.28)", "rgba(35,247,255,0)");
    context.save();
    context.globalAlpha = 0.58;
    context.strokeStyle = "rgba(35,247,255,0.75)";
    context.lineWidth = 3;
    context.beginPath();
    context.ellipse(STAGE_WIDTH / 2, 357, 72, 18, 0, 0, Math.PI * 2);
    context.stroke();
    context.strokeStyle = "rgba(255,79,216,0.55)";
    context.beginPath();
    context.ellipse(STAGE_WIDTH / 2, 358, 48, 11, 0, 0, Math.PI * 2);
    context.stroke();
    context.restore();

    drawCoinIcon(6, 132, 294, 40);
    drawCoinIcon(9, STAGE_WIDTH / 2, 322, 58);
    drawCoinIcon(7, 302, 288, 40);
    drawCoinIcon(2, 162, 376, 31);
    drawCoinIcon(8, 226, 390, 35);
    drawCoinIcon(4, 284, 374, 31);
    drawCoinIcon(5, 336, 360, 31);

    drawSparkShape(320, 220, 15, "#fff23b", -12);
    drawSparkShape(172, 420, 18, "#ff4fd8", 18);

    drawPanel(30, 528, STAGE_WIDTH - 60, 130, 24, "rgba(83,20,168,0.76)", "rgba(255,255,255,0.22)", 0);
    drawSticker(STAGE_WIDTH - 122, 546, 62, 32, 9, "#ccff00", "NEW", 14, -7);
    drawGameButton(homeStartButton, "开始整活", "#ff9f00", "#ffe500", 26);

    context.font = "800 13px sans-serif";
    context.fillStyle = "rgba(255,255,255,0.78)";
    context.textAlign = "center";
    context.fillText("点击开始，掉落合成离谱梗图", STAGE_WIDTH / 2, 690);
    context.restore();
  }

  function drawSparkShape(x, y, radius, color, angleDeg) {
    context.save();
    context.translate(x, y);
    context.rotate((angleDeg || 0) * Math.PI / 180);
    context.fillStyle = color || "#fff23b";
    context.strokeStyle = "#111111";
    context.lineWidth = 2;
    context.beginPath();
    for (var i = 0; i < 10; i += 1) {
      var r = i % 2 === 0 ? radius : radius * 0.34;
      var a = -Math.PI / 2 + i * Math.PI / 5;
      var px = Math.cos(a) * r;
      var py = Math.sin(a) * r;
      if (i === 0) context.moveTo(px, py);
      else context.lineTo(px, py);
    }
    context.closePath();
    context.fill();
    context.stroke();
    context.restore();
  }

  function drawHud() {
    context.save();
    drawTextStroke("合成唐佳琪", STAGE_WIDTH / 2, 18, "900 18px sans-serif", "#fff23b", "#111111", 4, "center");

    drawPanel(16, 30, 132, 58, 16, "#151522", "#111111", 6);
    context.textAlign = "left";
    context.fillStyle = "#d8d8ff";
    context.font = "800 14px sans-serif";
    context.fillText("分数", 30, 51);
    context.fillStyle = "#ffe500";
    context.font = String(score).length > 5 ? "900 22px sans-serif" : "900 26px sans-serif";
    context.fillText(String(score), 30, 78);

    drawPanel(162, 30, 112, 58, 16, "#10101d", "#111111", 6);
    context.fillStyle = "#d8d8ff";
    context.font = "800 14px sans-serif";
    context.fillText("最高分", 176, 51);
    context.fillStyle = "#ccff00";
    context.font = String(highScore).length > 5 ? "900 21px sans-serif" : "900 25px sans-serif";
    context.fillText(String(highScore), 176, 78);

    drawPanel(288, 30, 146, 58, 16, "#10101d", "#111111", 6);
    context.fillStyle = "#fff23b";
    context.font = "900 15px sans-serif";
    context.fillText("下一个", 302, 53);
    drawCoinIcon(nextLevel, 402, 59, 22);

    drawIconButton(pauseButton, "pause", "Ⅱ");
    drawIconButton(soundButton, soundEnabled ? "soundOn" : "soundOff", soundEnabled ? "♪" : "×");
    context.restore();
  }

  function drawDangerLine() {
    var progress = clamp(dangerMs / GAME_OVER_OVERLINE_MS, 0, 1);
    var alpha = 0.72 + progress * 0.26;
    context.save();
    context.shadowColor = "rgba(255,31,61," + (0.7 + progress * 0.3).toFixed(3) + ")";
    context.shadowBlur = 12 + progress * 20;
    context.strokeStyle = "rgba(255,31,61," + alpha.toFixed(3) + ")";
    context.lineWidth = 4 + progress * 3;
    context.lineCap = "round";
    context.beginPath();
    context.moveTo(16, DANGER_LINE_Y);
    context.lineTo(STAGE_WIDTH - 16, DANGER_LINE_Y);
    context.stroke();
    context.shadowBlur = 0;
    context.lineWidth = 1.5;
    context.strokeStyle = "rgba(255,255,255,0.42)";
    context.beginPath();
    context.moveTo(18, DANGER_LINE_Y - 3);
    context.lineTo(STAGE_WIDTH - 18, DANGER_LINE_Y - 3);
    context.stroke();
    drawSticker(24, DANGER_LINE_Y - 26, 78, 30, 11, "#ff1f3d", "危险", 17, -3);
    context.textAlign = "right";
    context.font = "800 15px sans-serif";
    drawTextStroke("别顶到红线！", STAGE_WIDTH - 24, DANGER_LINE_Y - 15, "800 15px sans-serif", "#ffffff", "#111111", 3, "right");
    if (progress > 0) {
      fillRoundRect(142, DANGER_LINE_Y - 32, 166, 26, 12, "rgba(255,31,61,0.96)");
      strokeOnlyRoundRect(142, DANGER_LINE_Y - 32, 166, 26, 12, "#111111", 3);
      var secondsLeft = Math.max(1, Math.ceil((GAME_OVER_OVERLINE_MS - dangerMs) / 1000));
      drawTextStroke("危险！" + secondsLeft + " 秒后结束", STAGE_WIDTH / 2, DANGER_LINE_Y - 13, "900 16px sans-serif", "#ffffff", null, 0, "center");
      fillRoundRect(18, DANGER_LINE_Y + 5, (STAGE_WIDTH - 36) * progress, 4, 2, "#fff23b");
    }
    context.restore();
  }

  function drawPreview() {
    if (mode !== "playing") {
      return;
    }
    var def = LEVELS[previewLevel];
    context.save();
    var readyAlpha = cooldownMs > 0 ? 0.36 : 0.88;
    context.globalAlpha = readyAlpha;
    context.strokeStyle = "rgba(255,245,178,0.64)";
    context.lineWidth = 2;
    context.lineCap = "round";
    context.setLineDash([5, 7]);
    context.beginPath();
    context.moveTo(pointerX, DROP_Y + def.radius + 8);
    context.lineTo(pointerX, DANGER_LINE_Y - 10);
    context.stroke();
    context.setLineDash([]);
    fillRoundRect(pointerX - 24, DANGER_LINE_Y - 5, 48, 4, 2, "rgba(255,245,59,0.95)");
    context.shadowColor = "rgba(255,245,59,0.7)";
    context.shadowBlur = 14;
    drawCoinIcon(previewLevel, pointerX, DROP_Y, def.radius);
    context.restore();
  }

  function drawCoin(coin) {
    context.save();
    context.translate(coin.x, coin.y);
    context.rotate(coin.angle);
    drawCoinIcon(coin.level, 0, 0, coin.radius);
    context.restore();
  }

  function drawCoinIcon(level, x, y, radius) {
    var image = images[level];
    var def = LEVELS[level];
    context.save();
    context.translate(x, y);
    if (image && image.loaded && !image.failed) {
      context.drawImage(image, -radius, -radius, radius * 2, radius * 2);
    } else {
      context.fillStyle = def.color;
      context.beginPath();
      context.arc(0, 0, radius, 0, Math.PI * 2);
      context.fill();
      context.strokeStyle = "#f9df91";
      context.lineWidth = Math.max(3, radius * 0.12);
      context.stroke();
      context.fillStyle = "rgba(255, 245, 205, 0.92)";
      context.beginPath();
      context.arc(0, 0, radius * 0.48, 0, Math.PI * 2);
      context.fill();
    }
    context.restore();
  }

  function drawFlashes() {
    for (var i = 0; i < flashes.length; i += 1) {
      var flash = flashes[i];
      var progress = clamp(flash.ageMs / flash.durationMs, 0, 1);
      var alpha = Math.max(0, 1 - progress);
      var ringStrength = flash.combo >= COMBO_CENTER_THRESHOLD ? 1.35 : flash.combo >= 4 ? 1.15 : 1;
      context.save();
      context.globalAlpha = Math.min(1, alpha * 1.08);
      context.strokeStyle = "rgba(255, 245, 122," + alpha + ")";
      context.lineWidth = 3 + Math.min(4, flash.combo * 0.35);
      context.beginPath();
      context.arc(flash.x, flash.y, 24 + progress * 46 * ringStrength, 0, Math.PI * 2);
      context.stroke();
      if (flash.combo >= 4) {
        context.strokeStyle = "rgba(255, 113, 45," + (alpha * 0.76) + ")";
        context.lineWidth = 2;
        context.beginPath();
        context.arc(flash.x, flash.y, 12 + progress * 30 * ringStrength, 0, Math.PI * 2);
        context.stroke();
      }
      context.restore();

      if (flash.combo < 2) {
        continue;
      }
      if (flash.isCenter) {
        drawCenterComboText(flash, progress, alpha);
      } else {
        drawLocalComboText(flash, progress, alpha);
      }
    }
  }

  function drawLocalComboText(flash, progress, alpha) {
    var scale = 1 + Math.sin(Math.min(1, progress * 2.6) * Math.PI) * 0.24 + Math.min(0.32, flash.combo * 0.025);
    var y = flash.y - 28 - progress * 22;
    context.save();
    context.globalAlpha = alpha;
    context.translate(flash.x, y);
    context.scale(scale, scale);
    context.textAlign = "center";
    context.lineJoin = "round";
    context.font = (flash.combo >= 5 ? "800 24px" : "700 20px") + " sans-serif";
    context.lineWidth = 5;
    context.strokeStyle = "rgba(86, 34, 8, 0.82)";
    context.strokeText(flash.text, 0, 0);
    context.fillStyle = "#fff064";
    context.fillText(flash.text, 0, 0);
    context.font = "700 14px sans-serif";
    context.lineWidth = 3;
    context.strokeText("x" + flash.combo, 0, 20);
    context.fillStyle = "#ffffff";
    context.fillText("x" + flash.combo, 0, 20);
    context.restore();
  }

  function drawCenterComboText(flash, progress, alpha) {
    var pop = Math.sin(Math.min(1, progress * 2.4) * Math.PI);
    var scale = 1.05 + pop * 0.22 + Math.min(0.24, (flash.combo - COMBO_CENTER_THRESHOLD) * 0.025);
    var y = 138 + Math.sin(progress * Math.PI) * 8;
    context.save();
    context.globalAlpha = Math.min(1, alpha * 1.18);
    context.translate(STAGE_WIDTH / 2, y);
    context.scale(scale, scale);
    context.textAlign = "center";
    context.lineJoin = "round";
    context.font = "900 36px sans-serif";
    context.lineWidth = 8;
    context.strokeStyle = "rgba(91, 31, 3, 0.9)";
    context.strokeText(flash.text, 0, 0);
    context.fillStyle = "#ffef58";
    context.fillText(flash.text, 0, 0);
    context.font = "800 18px sans-serif";
    context.lineWidth = 4;
    context.strokeText("连击 x" + flash.combo, 0, 30);
    context.fillStyle = "#ffffff";
    context.fillText("连击 x" + flash.combo, 0, 30);
    context.restore();
  }

  function drawScreenFlash() {
    if (screenFlashMs <= 0) {
      return;
    }
    var alpha = Math.min(0.22, screenFlashMs / 160 * 0.22);
    context.save();
    context.fillStyle = "rgba(255, 232, 92," + alpha + ")";
    context.fillRect(0, 0, STAGE_WIDTH, STAGE_HEIGHT);
    context.restore();
  }



  function drawFirstSpawnPopup() {
    if (!firstSpawnPopup || mode !== "playing") {
      return;
    }
    var level = firstSpawnPopup.level;
    var def = LEVELS[level];
    if (!def) {
      return;
    }
    var intro = clamp(firstSpawnPopup.ageMs / 180, 0, 1);
    var outro = clamp((firstSpawnPopup.durationMs - firstSpawnPopup.ageMs) / 380, 0, 1);
    var alpha = Math.min(1, outro) * (0.35 + intro * 0.65);
    var pop = Math.sin(intro * Math.PI);
    var scale = 0.82 + intro * 0.18 + pop * 0.06;
    var pulse = 0.55 + Math.sin(firstSpawnPopup.ageMs / 120) * 0.12;
    var x = STAGE_WIDTH / 2;
    var y = STAGE_HEIGHT / 2;
    var imageSize = 96;
    var image = images[level];
    var glowRadius = 54 + pulse * 16;

    context.save();
    context.globalAlpha = alpha;
    context.translate(x, y);
    context.scale(scale, scale);

    var glow = context.createRadialGradient(0, -10, 6, 0, -10, glowRadius);
    glow.addColorStop(0, "rgba(255, 245, 164, 0.88)");
    glow.addColorStop(0.42, "rgba(255, 224, 91, 0.4)");
    glow.addColorStop(1, "rgba(255, 213, 73, 0)");
    context.fillStyle = glow;
    context.beginPath();
    context.arc(0, -10, glowRadius, 0, Math.PI * 2);
    context.fill();

    context.save();
    context.globalAlpha = 0.35 + pulse * 0.18;
    context.strokeStyle = "rgba(255, 240, 140, 0.8)";
    context.lineWidth = 3;
    for (var i = 0; i < 6; i += 1) {
      var angle = -Math.PI / 2 + i * (Math.PI / 3) + firstSpawnPopup.ageMs / 680;
      var inner = glowRadius - 8;
      var outer = glowRadius + 12;
      context.beginPath();
      context.moveTo(Math.cos(angle) * inner, -10 + Math.sin(angle) * inner);
      context.lineTo(Math.cos(angle) * outer, -10 + Math.sin(angle) * outer);
      context.stroke();
    }
    context.restore();

    context.save();
    context.shadowColor = "rgba(255, 235, 102, 0.9)";
    context.shadowBlur = 18 + pulse * 12;
    if (image && image.loaded && !image.failed) {
      context.drawImage(image, -imageSize / 2, -imageSize / 2 - 10, imageSize, imageSize);
    } else {
      drawCoinIcon(level, 0, -10, imageSize / 2);
    }
    context.restore();

    context.textAlign = "center";
    context.lineJoin = "round";
    context.font = "900 22px sans-serif";
    context.lineWidth = 6;
    context.strokeStyle = "rgba(67, 24, 5, 0.78)";
    context.strokeText(def.name, 0, 72);
    context.fillStyle = "#fff6a2";
    context.fillText(def.name, 0, 72);
    context.restore();
  }

  function strokeRoundRect(x, y, width, height, radius) {
    context.beginPath();
    context.moveTo(x + radius, y);
    context.arcTo(x + width, y, x + width, y + height, radius);
    context.arcTo(x + width, y + height, x, y + height, radius);
    context.arcTo(x, y + height, x, y, radius);
    context.arcTo(x, y, x + width, y, radius);
    context.closePath();
    context.stroke();
  }


  function fillRoundRect(x, y, width, height, radius, fillStyle) {
    context.fillStyle = fillStyle;
    roundRect(x, y, width, height, radius);
  }

  function strokeOnlyRoundRect(x, y, width, height, radius, strokeStyle, lineWidth) {
    context.strokeStyle = strokeStyle;
    context.lineWidth = lineWidth;
    strokeRoundRect(x, y, width, height, radius);
  }

  function drawTextStroke(text, x, y, font, fillStyle, strokeStyle, lineWidth, align) {
    context.save();
    context.font = font;
    context.textAlign = align || "center";
    context.textBaseline = "alphabetic";
    context.lineJoin = "round";
    if (strokeStyle && lineWidth > 0) {
      context.lineWidth = lineWidth;
      context.strokeStyle = strokeStyle;
      context.strokeText(text, x, y);
    }
    context.fillStyle = fillStyle;
    context.fillText(text, x, y);
    context.restore();
  }

  function drawImageAsset(image, x, y, width, height, fallbackText) {
    if (image && image.loaded && !image.failed) {
      context.drawImage(image, x, y, width, height);
      return true;
    }
    if (fallbackText) {
      context.save();
      context.textAlign = "center";
      context.textBaseline = "middle";
      context.font = "900 " + Math.floor(Math.min(width, height) * 0.56) + "px sans-serif";
      context.fillStyle = "#ffffff";
      context.fillText(fallbackText, x + width / 2, y + height / 2 + 1);
      context.restore();
    }
    return false;
  }

  function drawRadialGlow(x, y, innerRadius, outerRadius, innerColor, outerColor) {
    var gradient = context.createRadialGradient(x, y, innerRadius, x, y, outerRadius);
    gradient.addColorStop(0, innerColor);
    gradient.addColorStop(1, outerColor);
    context.fillStyle = gradient;
    context.beginPath();
    context.arc(x, y, outerRadius, 0, Math.PI * 2);
    context.fill();
  }

  function drawPanel(x, y, width, height, radius, fillStyle, borderStyle, shadowOffset) {
    context.save();
    fillRoundRect(x, y + (shadowOffset || 8), width, height, radius, "#07070f");
    fillRoundRect(x, y, width, height, radius, fillStyle || "#151522");
    strokeOnlyRoundRect(x, y, width, height, radius, borderStyle || "#111111", 4);
    context.restore();
  }

  function drawSticker(x, y, width, height, radius, fillStyle, text, fontSize, angle) {
    context.save();
    context.translate(x + width / 2, y + height / 2);
    context.rotate((angle || 0) * Math.PI / 180);
    fillRoundRect(-width / 2, -height / 2 + 5, width, height, radius, "#07070f");
    fillRoundRect(-width / 2, -height / 2, width, height, radius, fillStyle);
    strokeOnlyRoundRect(-width / 2, -height / 2, width, height, radius, "#111111", 4);
    drawTextStroke(text, 0, fontSize * 0.38, "900 " + fontSize + "px sans-serif", "#111111", null, 0, "center");
    context.restore();
  }

  function drawIconButton(rect, imageKey, fallbackText) {
    context.save();
    fillRoundRect(rect.x, rect.y + 5, rect.w, rect.h, rect.w / 2, "#07070f");
    fillRoundRect(rect.x, rect.y, rect.w, rect.h, rect.w / 2, "#ff4fd8");
    strokeOnlyRoundRect(rect.x, rect.y, rect.w, rect.h, rect.w / 2, "#111111", 4);
    context.globalAlpha = 0.48;
    fillRoundRect(rect.x + 7, rect.y + 6, rect.w - 14, Math.max(6, rect.h * 0.18), 8, "#ffffff");
    context.globalAlpha = 1;
    var inset = Math.round(rect.w * 0.23);
    drawImageAsset(uiImages[imageKey], rect.x + inset, rect.y + inset, rect.w - inset * 2, rect.h - inset * 2, fallbackText);
    context.restore();
  }

  function drawGameButton(rect, text, fill, face, fontSize) {
    context.save();
    fillRoundRect(rect.x, rect.y + 12, rect.w, rect.h, rect.h / 2, "rgba(0,0,0,0.9)");
    fillRoundRect(rect.x, rect.y + 5, rect.w, rect.h, rect.h / 2, fill);
    strokeOnlyRoundRect(rect.x, rect.y + 5, rect.w, rect.h, rect.h / 2, "#111111", 5);
    fillRoundRect(rect.x + 4, rect.y, rect.w - 8, rect.h - 7, rect.h / 2, face || fill);
    strokeOnlyRoundRect(rect.x + 4, rect.y, rect.w - 8, rect.h - 7, rect.h / 2, "#111111", 4);
    context.globalAlpha = 0.42;
    fillRoundRect(rect.x + 20, rect.y + 9, rect.w - 40, Math.max(6, rect.h * 0.2), 8, "#ffffff");
    context.globalAlpha = 1;
    drawTextStroke(text, rect.x + rect.w / 2, rect.y + rect.h * 0.64, "900 " + (fontSize || 23) + "px sans-serif", "#ffffff", "rgba(0,0,0,0.45)", 3, "center");
    context.restore();
  }

  function drawSettlementContinueButtons() {
    var adText = revivePurchaseBusy && revivePurchaseType === "ad" ? "广告拉起中" : "看广告继续";
    var iapText = revivePurchaseBusy && revivePurchaseType === "iap" ? "支付拉起中" : "100派对币继续";
    var adDisabled = revivePurchaseBusy && revivePurchaseType !== "ad";
    var iapDisabled = revivePurchaseBusy && revivePurchaseType !== "iap";
    drawGameButton(
      settlementAdContinueButton,
      adText,
      adDisabled ? "#5c5c6f" : "#ff3d00",
      adDisabled ? "#8a8a9a" : "#ffe500",
      16
    );
    drawGameButton(
      settlementIapContinueButton,
      iapText,
      iapDisabled ? "#5c5c6f" : "#7a19e8",
      iapDisabled ? "#8a8a9a" : "#23f7ff",
      15
    );
  }

  function drawPowerupMessage() {
    if (!lastPowerupMessage || lastPowerupMessageMs <= 0) return;
    var alpha = Math.min(1, lastPowerupMessageMs / 280);
    context.save();
    context.globalAlpha = alpha;
    fillRoundRect(70, 108, STAGE_WIDTH - 140, 34, 14, "rgba(255,31,61,0.94)");
    strokeOnlyRoundRect(70, 108, STAGE_WIDTH - 140, 34, 14, "#111111", 3);
    drawTextStroke(lastPowerupMessage, STAGE_WIDTH / 2, 131, "900 18px sans-serif", "#fff23b", "rgba(0,0,0,0.5)", 3, "center");
    context.restore();
  }

  function drawSettlementOverlay() {
    context.save();
    context.fillStyle = "rgba(5, 3, 18, 0.84)";
    context.fillRect(0, 0, STAGE_WIDTH, STAGE_HEIGHT);
    drawRadialGlow(STAGE_WIDTH / 2, 620, 0, 185, "rgba(255,229,0,0.22)", "rgba(255,229,0,0)");

    var panelX = 36;
    var panelY = 116;
    var panelW = STAGE_WIDTH - 72;
    var panelH = 462;
    drawPanel(panelX, panelY, panelW, panelH, 24, "#151522", "#111111", 8);
    fillRoundRect(panelX + 24, panelY + 24, panelW - 48, 42, 16, "#ff3d00");
    strokeOnlyRoundRect(panelX + 24, panelY + 24, panelW - 48, 42, 16, "#111111", 4);

    var topLevel = Math.max(0, highestLevelReached);
    drawCoinIcon(topLevel, STAGE_WIDTH / 2, panelY + 18, 52);
    drawSticker(panelX + panelW - 104, panelY + 22, 58, 29, 10, "#ff3d00", "HOT", 15, -6);

    fillRoundRect(panelX + 24, panelY + 74, panelW - 48, 62, 13, "#0f0f1c");
    strokeOnlyRoundRect(panelX + 24, panelY + 74, panelW - 48, 62, 13, "#2c2c44", 2);
    drawTextStroke(getRunTitle(), STAGE_WIDTH / 2, panelY + 105, "900 31px sans-serif", "#ffffff", "#111111", 4, "center");
    context.fillStyle = "#fff23b";
    context.font = "700 14px sans-serif";
    context.textAlign = "center";
    var diff = runHighScoreAtStart - score;
    var recordText = diff > 0 ? "差点就破纪录了，再爽一把？" : "本局已经刷新历史最高！";
    context.fillText(recordText, STAGE_WIDTH / 2, panelY + 128);

    drawStatCard(panelX + 24, panelY + 154, 152, 64, "本局得分", String(score));
    drawStatCard(panelX + 202, panelY + 154, 152, 64, "历史最高", String(highScore));
    drawStatCard(panelX + 24, panelY + 238, 152, 64, "最大连击", "x" + Math.max(0, maxComboCount));
    drawStatCard(panelX + 202, panelY + 238, 152, 64, "最高合成", LEVELS[highestLevelReached].name);
    drawStatCard(panelX + 24, panelY + 322, 152, 64, "合成次数", mergeCount + " 次");
    drawStatCard(panelX + 202, panelY + 322, 152, 64, "坚持时间", formatDuration(getRunDurationMs()));

    drawTextStroke("已超越 " + getOvertakePercent() + "% 玩梗玩家", STAGE_WIDTH / 2, panelY + 426, "900 17px sans-serif", "#fff23b", "#111111", 3, "center");

    var statusText = reviveStatusText || "选择一种方式继续游戏";
    drawTextStroke(statusText, STAGE_WIDTH / 2, panelY + 454, "900 14px sans-serif", reviveStatusText ? "#23f7ff" : "#ffffff", "#111111", 3, "center");

    drawSettlementContinueButtons();
    drawGameButton(settlementRestartButton, "重新开始", "#0087ff", "#37f5ff", 18);
    context.restore();
  }

  function drawStatCard(x, y, w, h, label, value) {
    context.save();
    drawPanel(x, y, w, h, 13, "#0f0f1c", "#111111", 5);
    context.textAlign = "left";
    context.fillStyle = "#fff23b";
    context.font = "800 12px sans-serif";
    context.fillText(label, x + 14, y + 22);
    var text = String(value);
    var fontSize = text.length > 8 ? 19 : text.length > 5 ? 22 : 25;
    context.fillStyle = "#ffffff";
    context.font = "900 " + fontSize + "px sans-serif";
    context.fillText(text, x + 14, y + 50);
    context.restore();
  }

  function drawButton(rect, text, fill, color) {
    drawGameButton(rect, text, fill || "#ff9f00", color || fill || "#ffe500", 18);
  }

  function drawCardSelectOverlay() {
    context.save();
    context.fillStyle = "rgba(8, 2, 25, 0.92)";
    context.fillRect(0, 0, STAGE_WIDTH, STAGE_HEIGHT);
    drawRadialGlow(STAGE_WIDTH / 2, 468, 0, 210, "rgba(255,229,0,0.14)", "rgba(255,229,0,0)");
    drawRadialGlow(72, 255, 0, 150, "rgba(255,79,216,0.14)", "rgba(255,79,216,0)");

    drawTextStroke("选一张续命神卡", STAGE_WIDTH / 2, 148, "900 31px sans-serif", "#ffffff", "#111111", 5, "center");
    context.textAlign = "center";
    context.fillStyle = "#fff23b";
    context.font = "800 15px sans-serif";
    context.fillText("续命中，选完继续爽", STAGE_WIDTH / 2, 176);

    for (var i = 0; i < selectedCards.length; i += 1) {
      drawPowerCard(selectedCards[i], cardSlots[i]);
    }

    var selectedName = selectedPowerCard ? selectedPowerCard.title : "未选择";
    drawLuckyRewardBanner(64, 456, STAGE_WIDTH - 128, 42, selectedName);
    drawGameButton(reviveContinueButton, selectedPowerCard ? "继续爽一把" : "先选神卡", "#ff9f00", "#ffe500", 21);

    context.font = "800 12px sans-serif";
    context.fillStyle = "rgba(255,255,255,0.72)";
    context.textAlign = "center";
    context.fillText("炸弹 / 锤子确认后点选目标，清屏确认后立即生效", STAGE_WIDTH / 2, 610);
    context.restore();
  }

  function drawLuckyRewardBanner(x, y, w, h, selectedName) {
    context.save();
    fillRoundRect(x, y + 4, w, h, 16, "#07070f");
    fillRoundRect(x, y, w, h, 16, "rgba(38,30,8,0.96)");
    strokeOnlyRoundRect(x, y, w, h, 16, "#ffe500", 3);
    drawLuckyIconCanvas(x + 12, y + 4, 34, 34);
    drawTextStroke("已选：" + selectedName + "神卡 · 财神保佑好运加成", x + w / 2 + 12, y + 27, "900 14px sans-serif", "#fff23b", "#111111", 3, "center");
    context.restore();
  }

  function drawPowerCard(card, rect) {
    context.save();
    var selected = selectedPowerCard && selectedPowerCard.id === card.id;
    var border = selected ? "#ffe500" : "#111111";
    var back = selected ? "#261e08" : "#151522";
    fillRoundRect(rect.x, rect.y + 9, rect.w, rect.h, 17, "#07070f");
    fillRoundRect(rect.x, rect.y, rect.w, rect.h, 17, back);
    strokeOnlyRoundRect(rect.x, rect.y, rect.w, rect.h, 17, border, selected ? 5 : 4);
    if (selected) {
      context.save();
      context.shadowColor = "rgba(255,229,0,0.8)";
      context.shadowBlur = 18;
      strokeOnlyRoundRect(rect.x + 2, rect.y + 2, rect.w - 4, rect.h - 4, 15, "#ffe500", 2);
      context.restore();
    }
    fillRoundRect(rect.x + 31, rect.y + 22, 60, 60, 30, card.id === "bomb" ? "#ffe500" : "#23f7ff");
    strokeOnlyRoundRect(rect.x + 31, rect.y + 22, 60, 60, 30, "#111111", 3);
    if (card.imageKey) {
      drawImageAsset(uiImages[card.imageKey], rect.x + 40, rect.y + 30, 42, 42, card.icon);
    } else {
      drawLuckyIconCanvas(rect.x + 40, rect.y + 30, 42, 42);
    }
    drawTextStroke(card.title, rect.x + rect.w / 2, rect.y + 111, "900 21px sans-serif", "#ffffff", "#111111", 4, "center");
    context.fillStyle = "#fff23b";
    context.font = "700 12px sans-serif";
    context.textAlign = "center";
    wrapText(card.desc, rect.x + rect.w / 2, rect.y + 134, rect.w - 18, 15);
    fillRoundRect(rect.x + 22, rect.y + rect.h - 34, rect.w - 44, 20, 8, selected ? "#ccff00" : "#ff4fd8");
    strokeOnlyRoundRect(rect.x + 22, rect.y + rect.h - 34, rect.w - 44, 20, 8, "#111111", 2);
    context.fillStyle = "#111111";
    context.font = "900 10px sans-serif";
    context.fillText(selected ? "已选中" : (card.type === "target" ? "点选释放" : "立即生效"), rect.x + rect.w / 2, rect.y + rect.h - 20);
    context.restore();
  }

  function drawLuckyIconCanvas(x, y, width, height) {
    context.save();
    var cx = x + width / 2;
    var cy = y + height / 2;
    context.translate(cx, cy);

    context.shadowColor = "rgba(255,229,0,0.55)";
    context.shadowBlur = 12;
    context.fillStyle = "#ffe500";
    context.beginPath();
    context.arc(0, 4, Math.min(width, height) * 0.34, 0, Math.PI * 2);
    context.fill();
    context.shadowBlur = 0;
    context.lineWidth = 3;
    context.strokeStyle = "#111111";
    context.stroke();

    context.fillStyle = "#ff9f00";
    context.beginPath();
    context.arc(0, 4, Math.min(width, height) * 0.22, 0, Math.PI * 2);
    context.fill();
    context.strokeStyle = "rgba(17,17,17,0.55)";
    context.lineWidth = 1.5;
    context.stroke();

    context.fillStyle = "#ff4fd8";
    context.strokeStyle = "#111111";
    context.lineWidth = 2;
    context.beginPath();
    context.moveTo(-14, -10);
    context.lineTo(-7, -6);
    context.lineTo(-10, 2);
    context.lineTo(-17, -3);
    context.closePath();
    context.fill();
    context.stroke();

    context.fillStyle = "#ffffff";
    context.beginPath();
    context.moveTo(14, -15);
    context.lineTo(17, -6);
    context.lineTo(26, -3);
    context.lineTo(17, 0);
    context.lineTo(14, 9);
    context.lineTo(11, 0);
    context.lineTo(2, -3);
    context.lineTo(11, -6);
    context.closePath();
    context.fill();
    context.stroke();

    context.fillStyle = "#fff23b";
    context.beginPath();
    context.moveTo(0, -18);
    context.lineTo(4, -8);
    context.lineTo(15, -6);
    context.lineTo(6, 1);
    context.lineTo(8, 12);
    context.lineTo(0, 6);
    context.lineTo(-8, 12);
    context.lineTo(-6, 1);
    context.lineTo(-15, -6);
    context.lineTo(-4, -8);
    context.closePath();
    context.fill();
    context.stroke();
    context.restore();
  }

  function wrapText(text, x, y, maxWidth, lineHeight) {
    var line = "";
    for (var i = 0; i < text.length; i += 1) {
      var testLine = line + text[i];
      if (context.measureText(testLine).width > maxWidth && line) {
        context.fillText(line, x, y);
        line = text[i];
        y += lineHeight;
      } else {
        line = testLine;
      }
    }
    if (line) context.fillText(line, x, y);
  }

  function drawTargetingOverlay() {
    context.save();
    context.fillStyle = "rgba(0, 0, 0, 0.34)";
    context.fillRect(0, 0, STAGE_WIDTH, STAGE_HEIGHT);
    drawRadialGlow(STAGE_WIDTH / 2, DANGER_LINE_Y + 82, 0, 140, "rgba(255,79,216,0.18)", "rgba(255,79,216,0)");
    drawPanel(38, 96, STAGE_WIDTH - 76, 92, 20, "#151522", "#111111", 7);
    if (selectedPowerCard && selectedPowerCard.imageKey) {
      fillRoundRect(55, 113, 48, 48, 24, "#23f7ff");
      strokeOnlyRoundRect(55, 113, 48, 48, 24, "#111111", 3);
      drawImageAsset(uiImages[selectedPowerCard.imageKey], 64, 122, 30, 30, selectedPowerCard.icon);
    }
    drawTextStroke((selectedPowerCard ? selectedPowerCard.title : "续命卡") + "准备好了", STAGE_WIDTH / 2 + 24, 130, "900 23px sans-serif", "#ffffff", "#111111", 4, "center");
    context.font = "700 14px sans-serif";
    context.fillStyle = "#fff23b";
    context.textAlign = "center";
    context.fillText("点一个金币释放，别点空白处", STAGE_WIDTH / 2 + 24, 160);
    context.restore();
  }

  function drawOverlay(title, subtitle) {
    context.save();
    context.fillStyle = "rgba(5, 3, 18, 0.76)";
    context.fillRect(0, 0, STAGE_WIDTH, STAGE_HEIGHT);
    drawRadialGlow(STAGE_WIDTH / 2, STAGE_HEIGHT / 2, 0, 150, "rgba(35,247,255,0.16)", "rgba(35,247,255,0)");
    drawPanel(58, STAGE_HEIGHT / 2 - 88, STAGE_WIDTH - 116, 154, 24, "#151522", "#111111", 8);
    drawTextStroke(title, STAGE_WIDTH / 2, STAGE_HEIGHT / 2 - 28, "900 34px sans-serif", "#ffffff", "#111111", 5, "center");
    context.fillStyle = "#fff23b";
    context.font = "800 16px sans-serif";
    context.textAlign = "center";
    context.fillText(subtitle, STAGE_WIDTH / 2, STAGE_HEIGHT / 2 + 12);
    context.restore();
  }

  function roundRect(x, y, width, height, radius) {
    context.beginPath();
    context.moveTo(x + radius, y);
    context.arcTo(x + width, y, x + width, y + height, radius);
    context.arcTo(x + width, y + height, x, y + height, radius);
    context.arcTo(x, y + height, x, y, radius);
    context.arcTo(x, y, x + width, y, radius);
    context.closePath();
    context.fill();
  }

  function onTouchStart(x, y) {
    unlockAudio();
    var point = { x: stageXFromScreen(x), y: stageYFromScreen(y) };
    if (mode === "home") {
      if (hitRect(point, homeStartButton)) {
        resetGame();
        playUiSound();
      }
      return;
    }
    if (mode === "gameOver") {
      if (hitRect(point, settlementRestartButton)) {
        resetGame();
        playUiSound();
        return;
      }
      if (hitRect(point, settlementAdContinueButton)) {
        startAdReviveFlow();
        return;
      }
      if (hitRect(point, settlementIapContinueButton)) {
        startIapReviveFlow();
        return;
      }
      return;
    }
    if (mode === "cardSelect") {
      for (var i = 0; i < selectedCards.length; i += 1) {
        if (hitRect(point, cardSlots[i])) {
          selectedPowerCard = selectedCards[i];
          playUiSound();
          return;
        }
      }
      if (hitRect(point, reviveContinueButton)) {
        if (!selectedPowerCard) {
          selectedPowerCard = selectedCards[0] || null;
        }
        playUiSound();
        if (selectedPowerCard && selectedPowerCard.type === "target") {
          mode = "targetingPowerup";
        } else if (selectedPowerCard) {
          applyPowerCard(selectedPowerCard, null);
        }
        return;
      }
      return;
    }
    if (mode === "targetingPowerup") {
      var target = findCoinAtPoint(point);
      if (target && selectedPowerCard) {
        applyPowerCard(selectedPowerCard, target);
      } else {
        lastPowerupMessage = "点中金币才会释放哦";
        lastPowerupMessageMs = 900;
        playUiSound();
      }
      return;
    }
    if (mode === "paused") {
      mode = "playing";
      playUiSound();
      return;
    }
    if (mode === "playing") {
      if (hitRect(point, pauseButton)) {
        mode = "paused";
        playUiSound();
        return;
      }
      if (hitRect(point, soundButton)) {
        soundEnabled = !soundEnabled;
        if (soundEnabled) {
          playUiSound();
        }
        return;
      }
    }
    setPointer(point.x);
    dropCoin();
  }

  function onTouchMove(x) {
    if (mode === "playing") {
      setPointer(stageXFromScreen(x));
    }
  }

  if (ttApi) {
    ttApi.onTouchStart(function (event) {
      var touch = event.touches && event.touches[0];
      if (touch) {
        onTouchStart(touch.clientX, touch.clientY);
      }
    });
    ttApi.onTouchMove(function (event) {
      var touch = event.touches && event.touches[0];
      if (touch) {
        onTouchMove(touch.clientX);
      }
    });
  } else if (typeof document !== "undefined") {
    canvas.addEventListener("pointerdown", function (event) {
      if (event && typeof event.preventDefault === "function") {
        event.preventDefault();
      }
      if (canvas && typeof canvas.setPointerCapture === "function" && event.pointerId != null) {
        try {
          canvas.setPointerCapture(event.pointerId);
        } catch (error) {
          // 部分浏览器不允许在当前状态捕获指针，忽略即可。
        }
      }
      onTouchStart(event.clientX, event.clientY);
    });
    canvas.addEventListener("pointermove", function (event) {
      if (event && typeof event.preventDefault === "function") {
        event.preventDefault();
      }
      onTouchMove(event.clientX);
    });
    canvas.addEventListener("contextmenu", function (event) {
      if (event && typeof event.preventDefault === "function") {
        event.preventDefault();
      }
    });
    window.addEventListener("keydown", function (event) {
      unlockAudio();
      if ((event.code === "Enter" || event.code === "NumpadEnter") && mode === "home") {
        resetGame();
        playUiSound();
      } else if (event.code === "ArrowLeft" || event.code === "KeyA") {
        setPointer(pointerX - 20);
      } else if (event.code === "ArrowRight" || event.code === "KeyD") {
        setPointer(pointerX + 20);
      } else if (event.code === "Space") {
        dropCoin();
      } else if (event.code === "KeyR") {
        resetGame();
        playUiSound();
      } else if (event.code === "KeyC" && mode === "gameOver") {
        startAdReviveFlow();
      } else if (event.code === "KeyP" && mode !== "home") {
        mode = mode === "paused" ? "playing" : "paused";
        playUiSound();
      }
    });
    window.addEventListener("resize", resizeCanvas);
  }

  function tick(time) {
    if (!lastTime) {
      lastTime = time;
    }
    var dtMs = Math.min(34, Math.max(0, time - lastTime));
    lastTime = time;
    update(dtMs / 1000, dtMs);
    draw();
    if (!bootReadyReported) {
      bootReadyReported = true;
      if (globalScope.__gameBootScreen && typeof globalScope.__gameBootScreen.markGameReady === "function") {
        globalScope.__gameBootScreen.markGameReady();
      }
    }
    requestFrame(tick);
  }

  globalScope.render_game_to_text = function () {
    return JSON.stringify({
      runtime: ttApi ? "douyin-minigame" : "browser-fallback",
      leyuanSdkEnabled: isRealLeyuanSdkEnabled(),
      mode: mode,
      reviveContinue: {
        busy: revivePurchaseBusy,
        type: revivePurchaseType,
        statusText: reviveStatusText,
        adButton: settlementAdContinueButton,
        iapButton: settlementIapContinueButton,
        sdkSwitchName: "POLO_ENABLE_REAL_LEYUAN_SDK",
        iapProduct: REVIVE_IAP_PRODUCT
      },
      score: score,
      highScore: highScore,
      stats: {
        mergeCount: mergeCount,
        maxCombo: maxComboCount,
        highestLevel: highestLevelReached,
        highestLevelName: LEVELS[highestLevelReached].name,
        reviveCount: reviveCount,
        durationMs: getRunDurationMs()
      },
      dangerLineY: DANGER_LINE_Y,
      drop: {
        x: Math.round(pointerX),
        ready: cooldownMs <= 0,
        level: previewLevel,
        name: LEVELS[previewLevel].name
      },
      next: {
        level: nextLevel,
        name: LEVELS[nextLevel].name
      },
      firstSpawnPopup: firstSpawnPopup ? {
        level: firstSpawnPopup.level,
        name: firstSpawnPopup.name,
        remainingMs: Math.max(0, Math.round(firstSpawnPopup.durationMs - firstSpawnPopup.ageMs))
      } : null,
      coins: coins.map(function (coin) {
        return {
          id: coin.id,
          level: coin.level,
          name: LEVELS[coin.level].name,
          x: Math.round(coin.x * 10) / 10,
          y: Math.round(coin.y * 10) / 10,
          radius: coin.radius
        };
      })
    });
  };

  resizeCanvas();
  requestFrame(tick);
})();

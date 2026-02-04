var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
/**
 * 音频管理器 - 处理游戏中的所有音频播放
 */
var AudioManager = /** @class */ (function () {
    function AudioManager() {
        this.audioContext = null;
        this.soundBuffers = {};
        this.isInitialized = false;
        this.backgroundMusicSource = null;
        this.backgroundMusicGain = null;
        // 音频文件映射
        this.soundFiles = {
            'background-music': './assets/audios/audio.mp3',
            'card-play': './assets/audios/CardPlay.MP3',
            'turn-begin': './assets/audios/TurnBegin.MP3',
            'victory': './assets/audios/Victory.MP3',
            'defeat': './assets/audios/Defeat.MP3'
        };
    }
    AudioManager.getInstance = function () {
        if (!AudioManager.instance) {
            AudioManager.instance = new AudioManager();
        }
        return AudioManager.instance;
    };
    /**
     * 初始化音频系统（需要用户交互触发）
     */
    AudioManager.prototype.initialize = function () {
        return __awaiter(this, void 0, void 0, function () {
            var error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (this.isInitialized)
                            return [2 /*return*/];
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 5, , 6]);
                        // 创建音频上下文
                        this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
                        if (!(this.audioContext.state === 'suspended')) return [3 /*break*/, 3];
                        return [4 /*yield*/, this.audioContext.resume()];
                    case 2:
                        _a.sent();
                        _a.label = 3;
                    case 3:
                        // 创建背景音乐的增益节点
                        this.backgroundMusicGain = this.audioContext.createGain();
                        this.backgroundMusicGain.connect(this.audioContext.destination);
                        this.backgroundMusicGain.gain.value = 0.5; // 设置背景音乐音量
                        console.log('音频系统初始化成功');
                        this.isInitialized = true;
                        // 预加载所有音频文件
                        return [4 /*yield*/, this.preloadAllSounds()];
                    case 4:
                        // 预加载所有音频文件
                        _a.sent();
                        return [3 /*break*/, 6];
                    case 5:
                        error_1 = _a.sent();
                        console.error('音频系统初始化失败:', error_1);
                        return [3 /*break*/, 6];
                    case 6: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 预加载所有音频文件
     */
    AudioManager.prototype.preloadAllSounds = function () {
        return __awaiter(this, void 0, void 0, function () {
            var loadPromises;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        loadPromises = Object.entries(this.soundFiles).map(function (_a) { return __awaiter(_this, [_a], void 0, function (_b) {
                            var error_2;
                            var key = _b[0], path = _b[1];
                            return __generator(this, function (_c) {
                                switch (_c.label) {
                                    case 0:
                                        _c.trys.push([0, 2, , 3]);
                                        return [4 /*yield*/, this.loadSound(key, path)];
                                    case 1:
                                        _c.sent();
                                        console.log("\u97F3\u9891\u6587\u4EF6\u52A0\u8F7D\u6210\u529F: ".concat(key, " -> ").concat(path));
                                        return [3 /*break*/, 3];
                                    case 2:
                                        error_2 = _c.sent();
                                        console.error("\u97F3\u9891\u6587\u4EF6\u52A0\u8F7D\u5931\u8D25: ".concat(key, " -> ").concat(path), error_2);
                                        return [3 /*break*/, 3];
                                    case 3: return [2 /*return*/];
                                }
                            });
                        }); });
                        return [4 /*yield*/, Promise.all(loadPromises)];
                    case 1:
                        _a.sent();
                        console.log('所有音频文件预加载完成');
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 加载单个音频文件
     */
    AudioManager.prototype.loadSound = function (key, url) {
        return __awaiter(this, void 0, void 0, function () {
            var response, arrayBuffer, audioBuffer, error_3;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!this.audioContext)
                            throw new Error('音频上下文未初始化');
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 5, , 6]);
                        return [4 /*yield*/, fetch(url)];
                    case 2:
                        response = _a.sent();
                        if (!response.ok) {
                            throw new Error("HTTP ".concat(response.status, ": ").concat(response.statusText));
                        }
                        return [4 /*yield*/, response.arrayBuffer()];
                    case 3:
                        arrayBuffer = _a.sent();
                        return [4 /*yield*/, this.audioContext.decodeAudioData(arrayBuffer)];
                    case 4:
                        audioBuffer = _a.sent();
                        this.soundBuffers[key] = audioBuffer;
                        return [3 /*break*/, 6];
                    case 5:
                        error_3 = _a.sent();
                        console.error("\u52A0\u8F7D\u97F3\u9891\u5931\u8D25: ".concat(url), error_3);
                        throw error_3;
                    case 6: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 播放音效（一次性播放）
     */
    AudioManager.prototype.playSound = function (soundKey) {
        if (!this.isInitialized || !this.audioContext) {
            console.warn('音频系统未初始化，无法播放音效:', soundKey);
            return;
        }
        var buffer = this.soundBuffers[soundKey];
        if (!buffer) {
            console.warn('音频文件未找到:', soundKey);
            return;
        }
        try {
            var source = this.audioContext.createBufferSource();
            source.buffer = buffer;
            source.connect(this.audioContext.destination);
            source.start(0);
            console.log("\u64AD\u653E\u97F3\u6548: ".concat(soundKey));
        }
        catch (error) {
            console.error("\u64AD\u653E\u97F3\u6548\u5931\u8D25: ".concat(soundKey), error);
        }
    };
    /**
     * 播放背景音乐（循环播放）
     */
    AudioManager.prototype.playBackgroundMusic = function () {
        if (!this.isInitialized || !this.audioContext || !this.backgroundMusicGain) {
            console.warn('音频系统未初始化，无法播放背景音乐');
            return;
        }
        // 停止当前播放的背景音乐
        this.stopBackgroundMusic();
        var buffer = this.soundBuffers['background-music'];
        if (!buffer) {
            console.warn('背景音乐文件未找到');
            return;
        }
        try {
            this.backgroundMusicSource = this.audioContext.createBufferSource();
            this.backgroundMusicSource.buffer = buffer;
            this.backgroundMusicSource.loop = true; // 设置循环播放
            this.backgroundMusicSource.connect(this.backgroundMusicGain);
            this.backgroundMusicSource.start(0);
            console.log('开始播放背景音乐');
        }
        catch (error) {
            console.error('播放背景音乐失败:', error);
        }
    };
    /**
     * 停止背景音乐
     */
    AudioManager.prototype.stopBackgroundMusic = function () {
        if (this.backgroundMusicSource) {
            try {
                this.backgroundMusicSource.stop();
                this.backgroundMusicSource.disconnect();
            }
            catch (error) {
                // 忽略已经停止的音源
            }
            this.backgroundMusicSource = null;
            console.log('背景音乐已停止');
        }
    };
    /**
     * 设置背景音乐音量
     */
    AudioManager.prototype.setBackgroundMusicVolume = function (volume) {
        if (this.backgroundMusicGain) {
            this.backgroundMusicGain.gain.value = Math.max(0, Math.min(1, volume));
        }
    };
    /**
     * 获取初始化状态
     */
    AudioManager.prototype.isAudioInitialized = function () {
        return this.isInitialized;
    };
    return AudioManager;
}());
export { AudioManager };
//# sourceMappingURL=AudioManager.js.map

import React, { useState, useEffect } from 'react';
import { GameState, GameStage, AIResponse, Difficulty } from './types';
import { geminiService } from './services/geminiService';
import { INITIAL_HEALTH, WELCOME_TEXT, DIFFICULTY_SETTINGS } from './constants';
import Terminal from './components/Terminal';
import StatBar from './components/StatBar';

const App: React.FC = () => {
  const [stage, setStage] = useState<GameStage>(GameStage.START);
  const [state, setState] = useState<GameState>({
    history: [],
    currentScene: WELCOME_TEXT,
    statusUpdate: "System Initialized.",
    suggestedActions: [],
    currentImageBase64: null,
    inventory: ["Hacker's Deck", "Neural Link"],
    health: INITIAL_HEALTH,
    location: "Sector 7 - Sub-Level",
    turnCount: 0,
    score: 0,
    difficulty: 'MEDIUM'
  });
  const [isProcessing, setIsProcessing] = useState(false);
  const [customAction, setCustomAction] = useState("");

  const handleAction = async (action: string, initialDifficulty?: Difficulty) => {
    if (isProcessing) return;
    setIsProcessing(true);
    setStage(GameStage.PLAYING);

    const activeDifficulty = initialDifficulty || state.difficulty;

    try {
      const response: AIResponse = await geminiService.getNextStep(action, state.history, activeDifficulty);
      
      const imagePromise = response.imagePrompt 
        ? geminiService.generateSceneImage(response.imagePrompt) 
        : Promise.resolve(null);

      const nextImage = await imagePromise;

      setState(prev => {
        const difficultyMult = DIFFICULTY_SETTINGS[activeDifficulty].multiplier;
        const adjustedScoreChange = Math.floor((response.scoreChange || 0) * difficultyMult);
        
        // Hard difficulty might double damage
        const rawDamage = response.healthChange || 0;
        const adjustedHealthChange = activeDifficulty === 'HARD' && rawDamage < 0 ? rawDamage * 1.5 : rawDamage;
        
        const newHealth = Math.max(0, prev.health + adjustedHealthChange);
        const newScore = Math.max(0, prev.score + adjustedScoreChange);
        
        const newHistory = [
          ...prev.history,
          { role: 'user' as const, text: action },
          { role: 'model' as const, text: response.sceneDescription }
        ].slice(-10);

        if (newHealth <= 0) {
          setStage(GameStage.GAMEOVER);
        }

        return {
          ...prev,
          history: newHistory,
          currentScene: response.sceneDescription,
          statusUpdate: response.statusUpdate,
          suggestedActions: response.actions,
          currentImageBase64: nextImage || prev.currentImageBase64,
          inventory: [...prev.inventory, ...(response.newInventoryItems || [])],
          health: newHealth,
          score: newScore,
          location: response.locationName,
          turnCount: prev.turnCount + 1,
          difficulty: activeDifficulty
        };
      });
    } catch (error) {
      console.error("Game loop error", error);
      setState(prev => ({ ...prev, statusUpdate: "CRITICAL SYSTEM ERROR. RETRYING..." }));
    } finally {
      setIsProcessing(false);
      setCustomAction("");
    }
  };

  const startNewGame = (selectedDifficulty: Difficulty) => {
    setState({
      history: [],
      currentScene: WELCOME_TEXT,
      statusUpdate: "Connection Established.",
      suggestedActions: [],
      currentImageBase64: null,
      inventory: ["Hacker's Deck", "Neural Link"],
      health: INITIAL_HEALTH,
      location: "Sector 7 - Sub-Level",
      turnCount: 0,
      score: 0,
      difficulty: selectedDifficulty
    });
    handleAction("Starting the game. I am waking up in the under-levels. Describe my surroundings.", selectedDifficulty);
  };

  if (stage === GameStage.START) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-slate-900 via-black to-black relative">
        <div className="scanline"></div>
        <div className="relative z-10 text-center space-y-8 max-w-2xl">
          <h1 className="text-6xl md:text-8xl font-orbitron font-bold neon-glow text-violet-500 animate-pulse">NEON NEXUS</h1>
          <p className="text-slate-400 text-lg md:text-xl font-light tracking-wide uppercase">AI-Powered Cyberpunk Adventure</p>
          <div className="bg-black/50 border border-slate-800 p-8 rounded-2xl neon-border backdrop-blur-md">
            <p className="text-slate-300 mb-8 italic">"In the shadows of Aethelgard, choices aren't just paths—they're rewrites of reality."</p>
            <button 
              onClick={() => setStage(GameStage.DIFFICULTY_SELECT)}
              className="bg-violet-600 hover:bg-violet-500 text-white font-orbitron px-12 py-4 rounded-lg transition-all transform hover:scale-105 active:scale-95 shadow-[0_0_20px_rgba(139,92,246,0.5)]"
            >
              INITIALIZE CONNECTION
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (stage === GameStage.DIFFICULTY_SELECT) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-black relative">
        <div className="scanline"></div>
        <div className="relative z-10 w-full max-w-4xl space-y-12">
          <div className="text-center">
            <h2 className="text-4xl font-orbitron font-bold text-violet-400 mb-2">SELECT LINK PROTOCOL</h2>
            <p className="text-slate-500 font-mono text-sm tracking-widest uppercase">Encryption levels vary based on stability</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {(Object.keys(DIFFICULTY_SETTINGS) as Difficulty[]).map((diff) => (
              <button
                key={diff}
                onClick={() => startNewGame(diff)}
                className="group relative bg-slate-900/50 border border-slate-800 hover:border-violet-500/50 p-8 rounded-2xl transition-all hover:translate-y-[-4px] text-left"
              >
                <div className={`text-xs font-orbitron mb-2 tracking-widest ${
                  diff === 'EASY' ? 'text-cyan-400' : diff === 'MEDIUM' ? 'text-violet-400' : 'text-red-500'
                }`}>
                  {DIFFICULTY_SETTINGS[diff].label}
                </div>
                <h3 className="text-2xl font-orbitron font-bold text-white mb-4">{diff}</h3>
                <p className="text-slate-400 text-sm leading-relaxed mb-6 h-12">
                  {DIFFICULTY_SETTINGS[diff].description}
                </p>
                <div className="flex justify-between items-center text-[10px] font-mono text-slate-600">
                  <span>MULT: x{DIFFICULTY_SETTINGS[diff].multiplier.toFixed(1)}</span>
                  <span className="group-hover:text-violet-500 transition-colors">ESTABLISH_LINK →</span>
                </div>
              </button>
            ))}
          </div>

          <button 
            onClick={() => setStage(GameStage.START)}
            className="block mx-auto text-xs font-orbitron text-slate-600 hover:text-slate-400 transition-colors tracking-widest"
          >
            ← BACK TO MAIN_CORE
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-black overflow-hidden relative">
      <div className="scanline"></div>
      
      {/* Left Sidebar - Stats, Inventory & Score */}
      <aside className="w-full lg:w-72 bg-slate-900/40 border-b lg:border-r border-slate-800 p-6 flex flex-col gap-6 z-10 overflow-y-auto">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-lg bg-violet-600 flex items-center justify-center shadow-[0_0_10px_rgba(139,92,246,0.5)]">
            <span className="font-orbitron font-bold text-white">X</span>
          </div>
          <div>
            <h2 className="font-orbitron text-sm font-bold text-slate-100 tracking-tighter">GLITCH-WALKER</h2>
            <p className={`text-[10px] font-mono uppercase tracking-widest ${
               state.difficulty === 'HARD' ? 'text-red-500' : 'text-violet-400'
            }`}>
              {DIFFICULTY_SETTINGS[state.difficulty].label}
            </p>
          </div>
        </div>

        {/* Score Display */}
        <div className="bg-black/40 border border-slate-800 p-4 rounded-lg">
          <div className="text-[10px] font-orbitron text-slate-500 uppercase tracking-widest mb-1">Nexus Score</div>
          <div className="text-3xl font-orbitron font-bold text-white tracking-tighter">
            {state.score.toLocaleString()}
          </div>
        </div>

        <div className="space-y-4">
          <StatBar label="System Integrity" value={state.health} max={100} colorClass="bg-gradient-to-r from-red-600 to-violet-600" />
          <StatBar label="Neural Charge" value={Math.max(0, 100 - state.turnCount)} max={100} colorClass="bg-cyan-500" />
        </div>

        <div className="mt-2 flex-1">
          <h3 className="text-xs font-orbitron text-slate-500 uppercase tracking-widest mb-4">Inventory</h3>
          <div className="space-y-2">
            {state.inventory.map((item, i) => (
              <div key={i} className="text-xs font-mono bg-slate-800/50 border border-slate-700/50 p-2 rounded text-slate-300 flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-violet-500"></span>
                {item}
              </div>
            ))}
            {state.inventory.length === 0 && <p className="text-xs text-slate-600 italic">Empty...</p>}
          </div>
        </div>

        <div className="text-[10px] font-mono text-slate-600 mt-auto pt-4 border-t border-slate-800">
          TURN_COUNT: {String(state.turnCount).padStart(4, '0')}
          <br />
          STATUS: {state.statusUpdate.toUpperCase()}
        </div>
      </aside>

      {/* Main Game Area */}
      <main className="flex-1 flex flex-col relative z-10 overflow-hidden">
        <header className="h-16 border-b border-slate-800 flex items-center justify-between px-8 bg-black/40 backdrop-blur-md">
          <div className="flex items-center gap-4">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse shadow-[0_0_10px_rgba(34,197,94,0.5)]"></div>
            <h2 className="font-orbitron text-xs tracking-[0.3em] text-slate-400 uppercase">{state.location}</h2>
          </div>
          <button 
            onClick={() => setStage(GameStage.START)}
            className="text-[10px] font-orbitron text-slate-500 hover:text-red-400 transition-colors tracking-widest"
          >
            DISCONNECT
          </button>
        </header>

        <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
          <div className="flex-1 relative group overflow-hidden border-b md:border-b-0 md:border-r border-slate-800 bg-slate-900/20">
            {state.currentImageBase64 ? (
              <img 
                src={state.currentImageBase64} 
                alt="Scene" 
                className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center text-slate-700">
                <div className="w-16 h-16 border-2 border-slate-800 border-t-violet-500 rounded-full animate-spin mb-4"></div>
                <p className="font-orbitron text-[10px] tracking-widest uppercase animate-pulse">Syncing visuals...</p>
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-60"></div>
          </div>

          <div className="flex-1 flex flex-col p-4 md:p-8 overflow-hidden bg-black/20">
            <Terminal text={state.currentScene} />
          </div>
        </div>

        <footer className="p-6 bg-slate-900/60 border-t border-slate-800 backdrop-blur-xl">
          <div className="max-w-4xl mx-auto space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {state.suggestedActions.map((action, idx) => (
                <button
                  key={idx}
                  disabled={isProcessing}
                  onClick={() => handleAction(action)}
                  className="px-4 py-3 text-left text-xs md:text-sm font-medium rounded-lg border border-slate-700 bg-slate-800/40 hover:bg-violet-900/40 hover:border-violet-500/50 text-slate-300 hover:text-white transition-all disabled:opacity-50 group flex justify-between items-center"
                >
                  <span className="truncate">{action}</span>
                  <span className="text-violet-500 opacity-0 group-hover:opacity-100 transition-opacity ml-2">→</span>
                </button>
              ))}
            </div>

            <form 
              onSubmit={(e) => { e.preventDefault(); if(customAction.trim()) handleAction(customAction); }}
              className="relative flex items-center"
            >
              <input 
                type="text"
                placeholder="TYPE MANUAL COMMAND..."
                value={customAction}
                onChange={(e) => setCustomAction(e.target.value)}
                disabled={isProcessing}
                className="w-full bg-black/40 border border-slate-700 rounded-lg px-6 py-4 text-violet-400 font-mono focus:outline-none focus:border-violet-500 placeholder-slate-800 transition-all text-sm md:text-base"
              />
              <button 
                type="submit"
                disabled={isProcessing || !customAction.trim()}
                className="absolute right-3 bg-violet-600 hover:bg-violet-500 text-white p-2 rounded transition-colors disabled:opacity-50"
              >
                {isProcessing ? (
                   <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                )}
              </button>
            </form>
          </div>
        </footer>
      </main>

      {stage === GameStage.GAMEOVER && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-md p-6">
          <div className="max-w-md w-full text-center space-y-6 animate-in fade-in zoom-in duration-300">
            <h2 className="text-6xl font-orbitron font-bold text-red-600 neon-glow">CONNECTION LOST</h2>
            <div className="bg-slate-900 border border-red-900/50 p-8 rounded-xl space-y-4">
              <div className="text-slate-500 font-mono uppercase tracking-widest text-xs">Final Transmission Summary</div>
              <div className="text-4xl font-orbitron text-white">SCORE: {state.score.toLocaleString()}</div>
              <p className="text-slate-400 text-sm">Vital signs flatlined in {state.location}. Memory core purged.</p>
              <button 
                onClick={() => setStage(GameStage.START)}
                className="w-full py-4 bg-red-600 hover:bg-red-500 text-white font-orbitron rounded transition-colors shadow-[0_0_15px_rgba(220,38,38,0.4)]"
              >
                REBOOT CONSCIOUSNESS
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;

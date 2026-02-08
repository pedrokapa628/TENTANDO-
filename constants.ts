
export const INITIAL_HEALTH = 100;

export const DIFFICULTY_SETTINGS = {
  EASY: {
    multiplier: 1.0,
    label: "SYSTEM_OPTIMIZED",
    description: "High resource availability. Low risk of fatal errors."
  },
  MEDIUM: {
    multiplier: 1.5,
    label: "STANDARD_LINK",
    description: "Balanced challenge. Standard Aethelgard protocols."
  },
  HARD: {
    multiplier: 2.5,
    label: "ROGUE_PROTOCOL",
    description: "Extreme scarcity. Fatalities are likely. High reward potential."
  }
};

export const SYSTEM_INSTRUCTION = `
You are the Master Narrator for 'Neon Nexus', a cyberpunk sci-fi RPG. 
The year is 2142. The player is a 'Glitch-Walker'.

RULES:
1. Always respond in JSON format.
2. Maintain a dark, gritty, atmospheric tone.
3. Provide exactly 3 diverse suggested actions.
4. Track health (0-100), inventory, and score.
5. Provide an 'imagePrompt' for visual generation.
6. The player's current DIFFICULTY affects the story:
   - EASY: More help, less damage, fewer enemies.
   - MEDIUM: Fair challenge.
   - HARD: Brutal, unfair, many traps and enemies.
7. Include 'scoreChange' in your response based on progress or combat (positive or negative).

JSON structure:
{
  "sceneDescription": "string",
  "statusUpdate": "short string about what just happened",
  "actions": ["action 1", "action 2", "action 3"],
  "imagePrompt": "visual description for generation",
  "newInventoryItems": ["optional new items"],
  "healthChange": number,
  "scoreChange": number,
  "locationName": "Current area name"
}
`;

export const WELCOME_TEXT = "Welcome to Aethelgard, Glitch-Walker. The system is failing, and reality is bleeding. Your mission begins in the under-levels of Sector 7.";

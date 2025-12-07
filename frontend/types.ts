export enum ViewState {
  AUTH = 'AUTH',
  MENU = 'MENU',
  GAME = 'GAME',
  SHOP = 'SHOP',
  LEADERBOARD = 'LEADERBOARD'
}

export enum CellType {
  SAFE = 1,
  ANOMALY = 3,
  GOLDEN_WORM = 4,
  REVEALED = 99
}

export enum CellStatus {
  HIDDEN = 'HIDDEN',
  REVEALED = 'REVEALED',
  EXPLODED = 'EXPLODED'
}

export interface GridCell {
  id: number;
  x: number;
  y: number;
  type: CellType;
  status: CellStatus;
}

export interface Skin {
  id: string;
  name: string;
  cost: number;
  color: string;
  desc: string;
}

export interface UserProfile {
  user_id?: number;
  username: string;
  credits: number;
  highScore: number;
  unlockedSkins: string[];
  equippedSkin: string;
}

export interface LeaderboardEntry {
  username: string;
  high_score_session: number;
  total_mb_collected: number;
  credits?: number; // Added credits for wealth ranking
}

export interface ChartDataPoint {
  name: string;
  value: number;
  mobile: number;
}
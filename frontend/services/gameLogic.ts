import { CellType, GridCell, CellStatus } from '../types';

export class GameLogic {
  rows = 6;
  cols = 6;
  grid: number[] = [];
  
  settings = { anomalyCount: 5, bet: 100 };
  
  currentMultiplier = 1.00;
  remainingCells = 36;
  remainingMines = 5;

  constructor(anomalyCount: number, bet: number) {
    this.settings.anomalyCount = anomalyCount;
    this.settings.bet = bet;
    this.remainingMines = anomalyCount;
    this.remainingCells = this.rows * this.cols;
    this.initGrid();
  }

  initGrid() {
    this.grid = [];
    // Populate grid
    for(let i=0; i < this.settings.anomalyCount; i++) this.grid.push(CellType.ANOMALY);
    // 1 Golden Worm mostly
    this.grid.push(CellType.GOLDEN_WORM);
    
    // Fill rest with safe
    while(this.grid.length < this.rows * this.cols) {
      this.grid.push(CellType.SAFE);
    }
    
    // Shuffle
    for (let j = this.grid.length - 1; j > 0; j--) {
      const r = Math.floor(Math.random() * (j + 1));
      [this.grid[j], this.grid[r]] = [this.grid[r], this.grid[j]];
    }
  }

  calculateNextMultiplier() {
    let safeCells = this.remainingCells - this.remainingMines;
    if(safeCells <= 0) return this.currentMultiplier;

    // Stake/Mines style math
    let probability = safeCells / this.remainingCells;
    let newMult = this.currentMultiplier * (1 / probability) * 0.99; // 1% house edge
    return parseFloat(newMult.toFixed(2));
  }

  getCellType(index: number): CellType {
    return this.grid[index];
  }
}
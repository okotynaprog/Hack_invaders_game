// Configuration for your local backend
const API_URL = 'http://localhost:4000/api';

export const api = {
  token: localStorage.getItem('echo_token'),
  user: JSON.parse(localStorage.getItem('echo_user') || 'null'),

  getHeaders() {
    return {
      'Content-Type': 'application/json',
      ...(this.token ? { 'Authorization': `Bearer ${this.token}` } : {})
    };
  },

  async login(username: string, password: string) {
    try {
      const res = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Logowanie nieudane');
      
      // MVP BONUS: If user has 0 credits, give them a starter pack of 500
      if (!data.user.credits || data.user.credits === 0) {
        data.user.credits = 500;
        this.syncData({ 
            totalMbCollected: 0, 
            highscoreSession: 0, 
            credits: 500 
        }).catch(console.warn);
      }

      this.setSession(data.token, data.user);
      return data.user;
    } catch (err) {
      throw err;
    }
  },

  async register(username: string, password: string, email?: string) {
    try {
      const res = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password, email })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Rejestracja nieudana');
      return data;
    } catch (err) {
      throw err;
    }
  },

  async syncData(stats: { totalMbCollected: number, highscoreSession: number, credits: number }) {
    if (!this.token) return null;
    try {
      const res = await fetch(`${API_URL}/data/sync`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(stats)
      });
      
      const data = await res.json();
      if (res.ok && data.user) {
         this.user = { ...this.user, ...data.user };
         localStorage.setItem('echo_user', JSON.stringify(this.user));
         return data;
      }
      return data;
    } catch (err) {
      console.error("Sync error:", err);
      // Fallback update local
      this.user.credits = stats.credits;
      localStorage.setItem('echo_user', JSON.stringify(this.user));
      return { data: { credits: stats.credits } };
    }
  },

  async buySkin(skinId: string, cost: number) {
    if (!this.token) throw new Error("Brak autoryzacji");
    
    try {
      const res = await fetch(`${API_URL}/shop/buy`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({ skinId, cost })
      });

      if (res.ok) {
        const data = await res.json();
        this.updateUserCache(data.user);
        return data.user;
      }
    } catch (e) {
      console.warn("Backend buy endpoint failed, using local fallback");
    }

    // Local Fallback
    if (this.user.credits >= cost) {
      const newCredits = this.user.credits - cost;
      const newSkins = [...(this.user.unlockedSkins || ['default']), skinId];
      
      const updatedUser = {
        ...this.user,
        credits: newCredits,
        unlockedSkins: newSkins
      };
      
      this.updateUserCache(updatedUser);
      await new Promise(r => setTimeout(r, 500)); 
      return updatedUser;
    } else {
      throw new Error("Niewystarczające środki");
    }
  },

  async equipSkin(skinId: string) {
    if (!this.token) throw new Error("Brak autoryzacji");

    try {
      const res = await fetch(`${API_URL}/shop/equip`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({ skinId })
      });

      if (res.ok) {
        const data = await res.json();
        this.updateUserCache(data.user);
        return data.user;
      }
    } catch (e) {
      console.warn("Backend equip endpoint failed, using local fallback");
    }

    const updatedUser = { ...this.user, equippedSkin: skinId };
    this.updateUserCache(updatedUser);
    return updatedUser;
  },

  async getLeaderboard() {
    let leaderboard = [];
    try {
      const res = await fetch(`${API_URL}/data/leaderboard`);
      if (res.ok) {
        const data = await res.json();
        leaderboard = data.leaderboard || [];
      }
    } catch (err) {
      console.error("Leaderboard error:", err);
    }

    // --- FORCE UPDATE CURRENT USER ---
    // Ensure the currently logged-in user is in the list with their REAL local credits
    if (this.user) {
        const userIndex = leaderboard.findIndex((u: any) => u.username === this.user.username);
        const myEntry = {
            username: this.user.username,
            credits: this.user.credits,
            high_score_session: this.user.highScore || 0,
            total_mb_collected: 0
        };

        if (userIndex !== -1) {
            leaderboard[userIndex] = myEntry;
        } else {
            leaderboard.push(myEntry);
        }
    }

    return leaderboard;
  },

  setSession(token: string, user: any) {
    this.token = token;
    if (!user.unlockedSkins) user.unlockedSkins = ['default'];
    if (!user.equippedSkin) user.equippedSkin = 'default';
    this.user = user;
    localStorage.setItem('echo_token', token);
    localStorage.setItem('echo_user', JSON.stringify(user));
  },

  updateUserCache(user: any) {
    this.user = { ...this.user, ...user };
    localStorage.setItem('echo_user', JSON.stringify(this.user));
  },

  logout() {
    this.token = null;
    this.user = null;
    localStorage.removeItem('echo_token');
    localStorage.removeItem('echo_user'); 
  },

  isAuthenticated() {
    return !!this.token;
  }
};
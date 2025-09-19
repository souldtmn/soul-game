/**
 * CombatantStats - Common stats system for both players and enemies
 * Handles HP, Power, Armor with damage application and events
 */

export interface StatEvents {
  onDamageTaken?: (damage: number, newHP: number, maxHP: number) => void;
  onHealed?: (amount: number, newHP: number, maxHP: number) => void;
  onDeath?: () => void;
}

export class CombatantStats {
  private _maxHP: number;
  private _hp: number;
  private _power: number;
  private _armor: number;
  private events: StatEvents;

  constructor(
    maxHP: number = 100,
    power: number = 0.2,  // 20% damage bonus
    armor: number = 0.1,  // 10% damage reduction
    events: StatEvents = {}
  ) {
    this._maxHP = maxHP;
    this._hp = maxHP;
    this._power = power;
    this._armor = armor;
    this.events = events;
  }

  // Getters
  get maxHP(): number { return this._maxHP; }
  get hp(): number { return this._hp; }
  get power(): number { return this._power; }
  get armor(): number { return this._armor; }
  get isAlive(): boolean { return this._hp > 0; }
  get isDead(): boolean { return this._hp <= 0; }
  get hpPercentage(): number { return this._hp / this._maxHP; }

  // Setters
  setMaxHP(value: number): void {
    this._maxHP = Math.max(1, value);
    this._hp = Math.min(this._hp, this._maxHP); // Cap current HP
  }

  setPower(value: number): void {
    this._power = Math.max(0, value);
  }

  setArmor(value: number): void {
    this._armor = Math.max(0, value);
  }

  // Damage and healing
  takeDamage(amount: number): number {
    const oldHP = this._hp;
    this._hp = Math.max(0, this._hp - amount);
    const actualDamage = oldHP - this._hp;

    // Trigger events
    if (actualDamage > 0) {
      this.events.onDamageTaken?.(actualDamage, this._hp, this._maxHP);
    }

    if (this.isDead && oldHP > 0) {
      this.events.onDeath?.();
    }

    return actualDamage;
  }

  heal(amount: number): number {
    const oldHP = this._hp;
    this._hp = Math.min(this._maxHP, this._hp + amount);
    const actualHealing = this._hp - oldHP;

    if (actualHealing > 0) {
      this.events.onHealed?.(actualHealing, this._hp, this._maxHP);
    }

    return actualHealing;
  }

  // Full heal
  fullHeal(): void {
    this.heal(this._maxHP - this._hp);
  }

  // Reset to full health and stats
  reset(maxHP?: number, power?: number, armor?: number): void {
    if (maxHP !== undefined) this._maxHP = maxHP;
    if (power !== undefined) this._power = power;
    if (armor !== undefined) this._armor = armor;
    this._hp = this._maxHP;
  }

  // Get current stats as object (for damage resolver)
  getStats() {
    return {
      maxHP: this._maxHP,
      hp: this._hp,
      power: this._power,
      armor: this._armor,
      isAlive: this.isAlive,
      hpPercentage: this.hpPercentage
    };
  }

  // Create a copy with modified stats (for temporary effects)
  withModifiers(powerMod: number = 0, armorMod: number = 0): { power: number; armor: number } {
    return {
      power: Math.max(0, this._power + powerMod),
      armor: Math.max(0, this._armor + armorMod)
    };
  }

  // Serialize for save/load
  serialize() {
    return {
      maxHP: this._maxHP,
      hp: this._hp,
      power: this._power,
      armor: this._armor
    };
  }

  // Deserialize from save data
  static deserialize(data: ReturnType<CombatantStats['serialize']>, events?: StatEvents): CombatantStats {
    const stats = new CombatantStats(data.maxHP, data.power, data.armor, events);
    stats._hp = data.hp;
    return stats;
  }
}
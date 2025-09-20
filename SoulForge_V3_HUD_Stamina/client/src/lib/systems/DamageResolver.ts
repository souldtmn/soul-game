/**
 * Central Damage Resolver - Single source of truth for all damage calculations
 * Handles enemy→player, player→enemy with context for blocks, dodges, corruption, crits
 */

export interface DamageContext {
  baseDamage: number;
  attackerPower: number;    // from stats (0.2 = +20% damage)
  defenderArmor: number;    // from stats (0.1 = mild damage soak)
  isCounter: boolean;       // bonus damage after perfect block/dodge
  isPerfectDodge: boolean;  // usually 0 damage
  isBlock: boolean;         // reduce damage
  blockReduction: number;   // 0.5 = 50% reduction, 0.85 = 85% perfect block
  corruptionScale: number;  // 1.0 = none, >1 = more damage as corruption rises
  critChance: number;       // 0.2 = 20% chance
  critMultiplier: number;   // 1.5 = +50% damage
  hitVariance: number;      // ±10% damage variance (0.1)
  attackerType?: 'player' | 'basic' | 'strong'; // for logging
  defenderType?: 'player' | 'basic' | 'strong';
}

export interface DamageResult {
  finalDamage: number;
  wasCritical: boolean;
  wasBlocked: boolean;
  wasEvaded: boolean;
  wasCounter: boolean;
  reductionType: 'none' | 'block' | 'perfect_block' | 'evade' | 'armor';
}

export class DamageResolver {
  static compute(context: DamageContext): DamageResult {
    const {
      baseDamage,
      attackerPower,
      defenderArmor,
      isCounter,
      isPerfectDodge,
      isBlock,
      blockReduction,
      corruptionScale,
      critChance,
      critMultiplier,
      hitVariance,
      attackerType = 'unknown',
      defenderType = 'unknown'
    } = context;

    // Perfect dodge = 0 damage, no further calculation needed
    if (isPerfectDodge) {
      return {
        finalDamage: 0,
        wasCritical: false,
        wasBlocked: false,
        wasEvaded: true,
        wasCounter: false,
        reductionType: 'evade'
      };
    }

    // Start with base damage modified by attacker power and corruption
    let damage = baseDamage * (1 + attackerPower) * corruptionScale;

    // Apply armor reduction: damage *= 1 / (1 + armor)
    // Example: 0.1 armor = 9% damage reduction, 0.5 armor = 33% reduction
    const armorReduction = 1 / (1 + Math.max(0, defenderArmor));
    damage *= armorReduction;

    // Counter attack bonus (after perfect block/dodge)
    let wasCounter = false;
    if (isCounter) {
      damage *= 1.25; // +25% damage
      wasCounter = true;
    }

    // Critical hit calculation
    let wasCritical = false;
    if (critChance > 0 && Math.random() < critChance) {
      damage *= critMultiplier;
      wasCritical = true;
    }

    // Hit variance (±variation for more dynamic combat)
    if (hitVariance > 0) {
      const variance = (Math.random() - 0.5) * 2 * hitVariance; // -hitVariance to +hitVariance
      damage *= (1 + variance);
    }

    // Block reduction (applied after all other calculations)
    let wasBlocked = false;
    let reductionType: DamageResult['reductionType'] = defenderArmor > 0 ? 'armor' : 'none';
    
    if (isBlock) {
      damage *= Math.max(0, 1 - blockReduction);
      wasBlocked = true;
      reductionType = blockReduction >= 0.8 ? 'perfect_block' : 'block';
    }

    // Final damage (rounded, minimum 0)
    const finalDamage = Math.max(0, Math.round(damage));

    // Log detailed damage calculation for debugging
    const logPrefix = `💢 ${attackerType}→${defenderType}:`;
    console.log(`${logPrefix} ${baseDamage} base → ${finalDamage} final ${wasCritical ? '(CRIT!)' : ''} ${wasBlocked ? `(blocked ${Math.round(blockReduction * 100)}%)` : ''} ${wasCounter ? '(COUNTER!)' : ''}`);

    return {
      finalDamage,
      wasCritical,
      wasBlocked,
      wasEvaded: false,
      wasCounter,
      reductionType
    };
  }

  // Convenience methods for common damage scenarios
  static playerAttacksEnemy(
    baseDamage: number, 
    playerPower: number = 0.2, 
    defenderArmor: number = 0, 
    isBlocked: boolean = false, 
    blockReduction: number = 0, 
    isPerfectDodge: boolean = false, 
    corruption: number = 0,
    defenderType: 'basic' | 'strong' = 'basic',
    isCounter: boolean = false
  ): DamageResult {
    return this.compute({
      baseDamage,
      attackerPower: playerPower,
      defenderArmor,
      isCounter,
      isPerfectDodge,
      isBlock: isBlocked,
      blockReduction,
      corruptionScale: 1 + corruption * 0.1, // +10% damage per corruption level
      critChance: 0.2, // 20% crit chance for player
      critMultiplier: 1.5,
      hitVariance: 0.05, // ±5% variance
      attackerType: 'player',
      defenderType
    });
  }

  static enemyAttacksPlayer(
    baseDamage: number, 
    enemyType: 'basic' | 'strong' = 'basic',
    playerArmor: number = 0,
    isBlocked: boolean = false,
    blockReduction: number = 0.5,
    isPerfectDodge: boolean = false,
    corruption: number = 0
  ): DamageResult {
    const enemyPower = enemyType === 'strong' ? 0.3 : 0.15; // Strong enemies hit harder
    
    return this.compute({
      baseDamage,
      attackerPower: enemyPower,
      defenderArmor: playerArmor,
      isCounter: false, // Enemies don't counter (yet)
      isPerfectDodge,
      isBlock: isBlocked,
      blockReduction,
      corruptionScale: 1 + corruption * 0.15, // Corruption makes enemies deadlier
      critChance: 0.1, // 10% crit chance for enemies
      critMultiplier: 1.3,
      hitVariance: 0.08, // ±8% variance for enemies
      attackerType: enemyType,
      defenderType: 'player'
    });
  }
}
// lib/hud.ts — Canvas HUD for 480x270
export type HUDState = {
  hp: number; hpMax: number;
  embersMax: number;
  embers: number;
  emberRegenDelay: number;
  emberTimer: number;
  lv: number;
  exp: number;    // 0..1
  busy: boolean;
  dmgFlash: number;
};

type Colors = {
  frame: string;
  fillDim: string;
  emberOn: string;
  emberOff: string;
  exp: string;
  text: string;
};

class SoulHUD {
  public externalStamina = false;
  private ctx!: CanvasRenderingContext2D;
  private w = 480;
  private h = 270;
  private colors: Colors = {
    frame: "white",
    fillDim: "dimgray",
    emberOn: "orange",
    emberOff: "dimgray",
    exp: "red",
    text: "white",
  };
  public state: HUDState = {
    hp: 48, hpMax: 72,
    embersMax: 5,
    embers: 5,
    emberRegenDelay: 0.6,
    emberTimer: 0,
    lv: 1,
    exp: 0,
    busy: false,
    dmgFlash: 0,
  };

  private hp = { x: 20, y: this.h-36, width: 140, height: 16 };
  private embers = { x: Math.floor(this.w/2) - 40, y: this.h-36, spacing: 16, r: 6 };
  private lv = { x: this.w-160, y: this.h-36, expW: 80, expH: 8 };

  init(ctx: CanvasRenderingContext2D) {
    this.ctx = ctx;
    this.ctx.imageSmoothingEnabled = false;
    // @ts-ignore vendor
    this.ctx.mozImageSmoothingEnabled = false;
    // @ts-ignore vendor
    this.ctx.webkitImageSmoothingEnabled = false;
  }

  private clamp(v:number, min:number, max:number){ return Math.max(min, Math.min(max, v)); }

  private hpColor(ratio:number){
    if (ratio >= 0.5) {
      const t = (ratio-0.5)/0.5;
      const r = Math.floor(255*(1-t));
      const g = 255;
      return `rgb(${r},${g},0)`;
    } else {
      const t = ratio/0.5;
      const g = Math.floor(255*t);
      return `rgb(255,${g},0)`;
    }
  }

  private drawBorderRect(x:number,y:number,w:number,h:number,color=this.colors.frame){
    this.ctx.fillStyle = this.colors.fillDim;
    this.ctx.fillRect(x,y,w,h);
    this.ctx.strokeStyle = color;
    this.ctx.lineWidth = 1;
    this.ctx.strokeRect(x+0.5,y+0.5,w-1,h-1);
  }

  private drawHP(){
    const ratio = this.clamp(this.state.hp/this.state.hpMax, 0, 1);
    this.drawBorderRect(this.hp.x, this.hp.y, this.hp.width, this.hp.height, this.colors.frame);
    this.ctx.fillStyle = this.hpColor(ratio);
    this.ctx.fillRect(this.hp.x, this.hp.y, Math.floor(this.hp.width*ratio), this.hp.height);

    if (this.state.dmgFlash > 0){
      this.ctx.fillStyle = `rgba(255,0,0,${this.state.dmgFlash*0.4})`;
      this.ctx.fillRect(this.hp.x, this.hp.y, this.hp.width, this.hp.height);
    }

    this.ctx.fillStyle = this.colors.text;
    this.ctx.font = "8px monospace";
    this.ctx.textAlign = "center";
    this.ctx.textBaseline = "middle";
    this.ctx.fillText(`${this.state.hp}/${this.state.hpMax}`, this.hp.x + Math.floor(this.hp.width/2), this.hp.y + Math.floor(this.hp.height/2));
  }

  private drawEmbers(){
    for (let i=0;i<this.state.embersMax;i++){
      const cx = this.embers.x + i*this.embers.spacing;
      const cy = this.embers.y + this.embers.r + 2;
      this.ctx.fillStyle = (i < this.state.embers) ? this.colors.emberOn : this.colors.emberOff;
      this.ctx.beginPath();
      this.ctx.arc(cx, cy, this.embers.r, 0, Math.PI*2);
      this.ctx.fill();
      this.ctx.strokeStyle = this.colors.frame;
      this.ctx.lineWidth = 1;
      this.ctx.stroke();
    }
  }

  private drawLV(){
    this.ctx.fillStyle = this.colors.text;
    this.ctx.font = "10px monospace";
    this.ctx.textAlign = "left";
    this.ctx.textBaseline = "alphabetic";
    this.ctx.fillText(`LV: ${this.state.lv}`, this.lv.x, this.lv.y + 12);

    this.drawBorderRect(this.lv.x+40, this.lv.y+5, this.lv.expW, this.lv.expH, this.colors.frame);
    this.ctx.fillStyle = this.colors.exp;
    this.ctx.fillRect(this.lv.x+40, this.lv.y+5, Math.floor(this.lv.expW*this.clamp(this.state.exp,0,1)), this.lv.expH);
  }

  setHP(current:number, max:number|null=null){
    if (max!==null) this.state.hpMax = max;
    current = this.clamp(current, 0, this.state.hpMax);
    if (current < this.state.hp) this.state.dmgFlash = 1;
    this.state.hp = current;
  }
  damage = (amount:number)=> this.setHP(this.state.hp-amount);
  heal = (amount:number)=> this.setHP(this.state.hp+amount);

  setEmbersMax(max:number){
    this.state.embersMax = Math.max(0, Math.floor(max));
    this.state.embers = this.clamp(this.state.embers, 0, this.state.embersMax);
  }
  spendEmber = (pips=1)=> this.state.embers = this.clamp(this.state.embers - pips, 0, this.state.embersMax);
  giveEmber = (pips=1)=> this.state.embers = this.clamp(this.state.embers + pips, 0, this.state.embersMax);

  giveEXP(amount:number){
    let e = this.state.exp + amount;
    while (e >= 1) { e -= 1; this.state.lv += 1; }
    this.state.exp = e;
  }

  setBusy(b:boolean){ this.state.busy = !!b; }
  setColors(partial:Partial<Colors>){ Object.assign(this.colors, partial || {}); }

  setExternalStamina(v:boolean){ this.externalStamina = !!v; }
  setEmbers(v:number){ this.state.embers = this.clamp(v, 0, this.state.embersMax); }

  update(dt:number){
    if (!this.externalStamina && !this.state.busy && this.state.embers < this.state.embersMax){
      this.state.emberTimer += dt;
      if (this.state.emberTimer >= this.state.emberRegenDelay){
        this.giveEmber(1);
        this.state.emberTimer = 0;
      }
    } else {
      this.state.emberTimer = Math.max(0, this.state.emberTimer - dt*0.5);
    }
    if (this.state.dmgFlash > 0) this.state.dmgFlash = Math.max(0, this.state.dmgFlash - dt*6);
  }

  draw(){
    this.drawHP();
    this.drawEmbers();
    this.drawLV();
  }
}

export const HUD = new SoulHUD();

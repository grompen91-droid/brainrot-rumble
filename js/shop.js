'use strict';
// ============ GEAR: SHOP + INVENTORY ============
// Loaded after game.js so it shares the global `gold`, `P`, sprite helpers, sfx, $.
// Items boost STARTING DAMAGE only (for now). 4 typed slots, 5 rarities.

const GEAR_CATS = ['helmet','chest','pants','shoes'];
const CAT_LABEL = { helmet:'Helmet', chest:'Chestplate', pants:'Pants', shoes:'Shoes' };
// rarity order low->high; color matches the level-up card borders; dmg = starting-damage bonus
const RAR = {
  common:    { name:'COMMON',    color:'#9aa3af', dmg:0.06, price:80   },
  uncommon:  { name:'UNCOMMON',  color:'#5fbf52', dmg:0.12, price:250  },
  rare:      { name:'RARE',      color:'#4aa3df', dmg:0.20, price:700  },
  epic:      { name:'EPIC',      color:'#b06ff0', dmg:0.32, price:1800 },
  legendary: { name:'LEGENDARY', color:'#e0a92e', dmg:0.50, price:4000 },
};
const RAR_ORDER = ['common','uncommon','rare','epic','legendary'];
// per-category display names, indexed by rarity order
const GEAR_NAMES = {
  helmet: ['Cloth Cap','Leather Helm','Iron Helm','Knight Helm','Dragon Helm'],
  chest:  ['Cloth Tunic','Leather Vest','Iron Cuirass','Knight Plate','Dragon Mail'],
  pants:  ['Cloth Pants','Leather Greaves','Iron Legguards','Knight Legplates','Dragon Greaves'],
  shoes:  ['Cloth Shoes','Leather Boots','Iron Boots','Knight Sabatons','Dragon Treads'],
};
// id = "<cat>_<rarity>" e.g. "helmet_rare"
function itemCat(id){ return id.split('_')[0]; }
function itemRar(id){ return id.split('_')[1]; }
function itemName(id){ return GEAR_NAMES[itemCat(id)][RAR_ORDER.indexOf(itemRar(id))]; }
const GEAR_CATALOG = [];
for(const c of GEAR_CATS) for(const r of RAR_ORDER) GEAR_CATALOG.push(c+'_'+r);

// ---- persistent state ----
let gearOwned = new Set(JSON.parse(localStorage.getItem('br_items_owned')||'[]'));
let gearEquip = Object.assign({helmet:null,chest:null,pants:null,shoes:null},
                              JSON.parse(localStorage.getItem('br_gear_equipped')||'{}'));
function saveOwned(){ localStorage.setItem('br_items_owned', JSON.stringify([...gearOwned])); }
function saveEquip(){ localStorage.setItem('br_gear_equipped', JSON.stringify(gearEquip)); }

// starting-damage multiplier from the 4 equipped pieces (summed bonuses)
function equippedDmgMult(){
  let b = 0;
  for(const c of GEAR_CATS){ const id=gearEquip[c]; if(id) b += RAR[itemRar(id)].dmg; }
  return 1 + b;
}

// ---- daily shop: deterministic by UTC date, so it's the same for everyone ----
function dayKey(){ const d=new Date(); return d.getUTCFullYear()+'-'+(d.getUTCMonth()+1)+'-'+d.getUTCDate(); }
function hashStr(s){ let h=2166136261>>>0; for(let i=0;i<s.length;i++){ h^=s.charCodeAt(i); h=Math.imul(h,16777619); } return h>>>0; }
function mulberry32(a){ return function(){ a|=0; a=a+0x6D2B79F5|0; let t=Math.imul(a^a>>>15,1|a); t=t+Math.imul(t^t>>>7,61|t)^t; return ((t^t>>>14)>>>0)/4294967296; }; }
function dailyShop(n=4){
  const rng = mulberry32(hashStr(dayKey()));
  const pool = GEAR_CATALOG.slice();
  for(let i=pool.length-1;i>0;i--){ const j=Math.floor(rng()*(i+1)); [pool[i],pool[j]]=[pool[j],pool[i]]; }
  return pool.slice(0,n);
}

// ---- gear icon (tinted silhouette on transparent bg) ----
const GEAR_ICON = {};
function gearIconURL(id){
  if(GEAR_ICON[id]) return GEAR_ICON[id];
  const spr = (typeof tintedSprite==='function' && tintedSprite('gear_'+itemCat(id), RAR[itemRar(id)].color)) || SP['gear_'+itemCat(id)];
  const url = spr ? spr.toDataURL() : '';
  GEAR_ICON[id]=url; return url;
}

// ---- draw equipped gear over the in-game player (called from game.js draw loop) ----
function drawPlayerGear(x,y,size,rot,flip){
  for(const c of GEAR_CATS){ const id=gearEquip[c]; if(id) drawSprite('gear_'+c, x,y,size,rot,0,0,flip, RAR[itemRar(id)].color); }
}

// ---- recomposite the menu character image with equipped gear ----
function refreshMenuChar(){
  const base = SP['player']; if(!base) return;
  const c = document.createElement('canvas'); c.width=base.width; c.height=base.height;
  const g = c.getContext('2d'); g.drawImage(base,0,0);
  for(const cat of GEAR_CATS){ const id=gearEquip[cat]; if(!id) continue;
    const spr = (typeof tintedSprite==='function' && tintedSprite('gear_'+cat, RAR[itemRar(id)].color)) || SP['gear_'+cat];
    if(spr) g.drawImage(spr,0,0);
  }
  const img=$('charimg'); if(img) img.src=c.toDataURL();
}

// ---- gold display helper ----
function refreshGoldUI(){ const t=$('goldtxt'); if(t) t.textContent=gold; }

// coin icon chip (matches the menu gold pill) for prices
let _coinURL='';
function coinTag(){ if(!_coinURL && SP['coin']) _coinURL=SP['coin'].toDataURL(); return '<img class="coinico" src="'+_coinURL+'" alt="">'; }

// ============ RENDERING ============
function rtagHTML(rar){ return '<span class="rtag r-'+rar+'">'+RAR[rar].name+'</span>'; }

function renderShop(){
  const grid=$('shopgrid'); if(!grid) return;
  grid.innerHTML='';
  for(const id of dailyShop()){
    const rar=itemRar(id), price=RAR[rar].price, owned=gearOwned.has(id);
    const card=document.createElement('div');
    card.className='gcard r-'+rar+(owned?' owned':'');
    card.innerHTML =
      '<img class="gicon" src="'+gearIconURL(id)+'" alt="">'+
      '<div class="gmeta">'+
        '<div class="gname">'+itemName(id)+'</div>'+
        rtagHTML(rar)+
        '<div class="gbonus">+'+Math.round(RAR[rar].dmg*100)+'% starting damage</div>'+
      '</div>'+
      (owned
        ? '<div class="gbuy ownedtag">OWNED</div>'
        : '<button class="gbuy'+(gold<price?' poor':'')+'" data-id="'+id+'">'+coinTag()+price+'</button>');
    grid.appendChild(card);
  }
  grid.querySelectorAll('button.gbuy').forEach(b=>b.addEventListener('click',()=>buyItem(b.dataset.id)));
}

function buyItem(id){
  const price=RAR[itemRar(id)].price;
  if(gearOwned.has(id) || gold<price) return;
  gold-=price; localStorage.setItem('br_gold',gold);
  gearOwned.add(id); saveOwned();
  if(typeof sfx!=='undefined') sfx.coin();
  refreshGoldUI(); renderShop(); renderInventory();
}

function renderInventory(){
  const slots=$('invslots'); const owned=$('invowned'); if(!slots||!owned) return;
  // typed slots
  slots.innerHTML='';
  for(const cat of GEAR_CATS){
    const id=gearEquip[cat];
    const slot=document.createElement('div');
    slot.className='slot'+(id?(' filled r-'+itemRar(id)):'');
    slot.innerHTML='<div class="slotlabel">'+CAT_LABEL[cat]+'</div>'+
      (id ? '<img class="gicon" src="'+gearIconURL(id)+'" alt=""><div class="sname">'+itemName(id)+'</div>'
          : '<div class="empty">—</div>');
    if(id) slot.addEventListener('click',()=>{ gearEquip[cat]=null; saveEquip(); afterEquipChange(); });
    slots.appendChild(slot);
  }
  // owned items
  owned.innerHTML='';
  const list=GEAR_CATALOG.filter(id=>gearOwned.has(id));
  if(!list.length){ owned.innerHTML='<div class="invhint">Buy gear in the Shop to fill your slots.</div>'; return; }
  for(const id of list){
    const cat=itemCat(id), rar=itemRar(id), equipped=gearEquip[cat]===id;
    const card=document.createElement('div');
    card.className='gcard r-'+rar+(equipped?' equipped':'');
    card.innerHTML=
      '<img class="gicon" src="'+gearIconURL(id)+'" alt="">'+
      '<div class="gmeta"><div class="gname">'+itemName(id)+'</div>'+rtagHTML(rar)+
        '<div class="gbonus">+'+Math.round(RAR[rar].dmg*100)+'% dmg · '+CAT_LABEL[cat]+'</div></div>'+
      '<div class="gbuy '+(equipped?'equiptag':'equipbtn')+'">'+(equipped?'EQUIPPED':'Equip')+'</div>';
    card.addEventListener('click',()=>{ gearEquip[cat]=(equipped?null:id); saveEquip(); afterEquipChange(); });
    owned.appendChild(card);
  }
}

function afterEquipChange(){ if(typeof sfx!=='undefined') sfx.pick(); refreshMenuChar(); renderInventory(); }

// ---- tab switching ----
function showTab(name){
  for(const t of ['battle','shop','inventory']){
    const p=$('tab-'+t); if(p) p.classList.toggle('hidden', t!==name);
  }
  document.querySelectorAll('#tabbar .tabbtn').forEach(b=>b.classList.toggle('active', b.dataset.tab===name));
  if(name==='shop') renderShop();
  if(name==='inventory') renderInventory();
}
document.querySelectorAll('#tabbar .tabbtn').forEach(b=>b.addEventListener('click',()=>{ showTab(b.dataset.tab); if(typeof sfx!=='undefined') sfx.pick(); }));

// ---- init ----
refreshMenuChar();
renderShop();
renderInventory();
const _initTab = (location.hash||'').slice(1);
showTab(['battle','shop','inventory'].indexOf(_initTab)>=0 ? _initTab : 'battle');

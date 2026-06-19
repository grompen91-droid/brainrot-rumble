'use strict';

(function(){
  const VARIANTS = [
    { key:'B', name:'World Card' },
  ];
  const DEFAULT_VARIANT = 0;

  function normalizeVariant(value){
    const n = Math.floor(Number(value));
    return n>=0 && n<VARIANTS.length ? n : 0;
  }

  function initialVariant(value){
    return value === null || value === undefined ? DEFAULT_VARIANT : normalizeVariant(value);
  }

  function buildMinimapView({ gameMode, world, player, size }){
    const challenger = gameMode === 'challenger';
    const span = challenger ? 2400 : null;
    const w = challenger ? span : Math.max(1, world && world.w || 1);
    const h = challenger ? span : Math.max(1, world && world.h || 1);
    const ox = challenger ? (player.x - span/2) : 0;
    const oy = challenger ? (player.y - span/2) : 0;
    // uniform scale so minimap rectangle matches world aspect ratio (capped at 4:1 each way)
    const aspect = Math.min(4, Math.max(0.25, w / h));
    const scale = aspect >= 1 ? size / w : size / h;
    const mw = Math.round(w * scale);
    const mh = Math.round(h * scale);
    return {
      challenger,
      span,
      ox,
      oy,
      w,
      h,
      size,
      mw,
      mh,
      sx: scale,
      sy: scale,
    };
  }

  function projectPoint(view, x, y){
    const px = (x - view.ox) * view.sx;
    const py = (y - view.oy) * view.sy;
    const visible = px>=0 && py>=0 && px<=view.mw && py<=view.mh;
    const dx = px - view.mw/2, dy = py - view.mh/2;
    return { x:px, y:py, visible, dist:Math.hypot(dx,dy) };
  }

  window.MINIMAP_HELPERS = { VARIANTS, DEFAULT_VARIANT, normalizeVariant, initialVariant, buildMinimapView, projectPoint };
})();

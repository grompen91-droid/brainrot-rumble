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
    return {
      challenger,
      span,
      ox,
      oy,
      w,
      h,
      size,
      sx: size / w,
      sy: size / h,
    };
  }

  function projectPoint(view, x, y){
    const px = (x - view.ox) * view.sx;
    const py = (y - view.oy) * view.sy;
    const visible = px>=0 && py>=0 && px<=view.size && py<=view.size;
    const dx = px - view.size/2, dy = py - view.size/2;
    return { x:px, y:py, visible, dist:Math.hypot(dx,dy) };
  }

  window.MINIMAP_HELPERS = { VARIANTS, DEFAULT_VARIANT, normalizeVariant, initialVariant, buildMinimapView, projectPoint };
})();

'use strict';
const HOOKS = {};
function onHook(name, fn)        { (HOOKS[name] = HOOKS[name]||[]).push(fn); }
function fireHook(name, ...args) { const h=HOOKS[name]; if(h) h.forEach(fn=>fn(...args)); }
function clearHooks()            { for(const k in HOOKS) delete HOOKS[k]; }

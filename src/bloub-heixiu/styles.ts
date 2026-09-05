export const HEIXIU_BLOUB_CSS = `
#root [data-composer-card] > button.xiaohei-bloub {
  all: unset;
  --heixiu-ink: #111214;
  --heixiu-outline: rgba(245,243,215,.16);
  position: absolute;
  box-sizing: border-box;
  display: block;
  width: 96px;
  height: 96px;
  min-width: 44px;
  min-height: 44px;
  right: calc(100% + 18px);
  top: calc(50% - 48px);
  margin: 0 !important;
  padding: 0 !important;
  border: 0 !important;
  border-radius: 50%;
  background: none !important;
  box-shadow: none !important;
  color: inherit;
  cursor: pointer;
  touch-action: manipulation;
  user-select: none;
  -webkit-tap-highlight-color: transparent;
  /* Flight owns this transform. A CSS transition would replay cancelled
     WAAPI transforms and corrupt the next target measurement. */
  transition: none;
  z-index: 3;
}
#root [data-composer-card] > button.xiaohei-bloub:focus-visible {
  outline: 2px solid var(--dsw-alias-label-secondary);
  outline-offset: -7px;
}
#root [data-composer-card] > button.xiaohei-bloub > .xiaohei-bloub-drift {
  display: block;
  width: 100%; height: 100%;
  pointer-events: none;
  --heixiu-drift-x: 7px;
  --heixiu-drift-y: 10px;
  animation: xiaohei-bloub-float 14s cubic-bezier(.45,0,.55,1) infinite;
  animation-play-state: paused;
}
#root [data-composer-card] > button.xiaohei-bloub[data-floating='true'] > .xiaohei-bloub-drift {
  animation-play-state: running;
}
@keyframes xiaohei-bloub-float {
  0%, 100% { transform: translate(calc(-1 * var(--heixiu-drift-x)), var(--heixiu-drift-y)); }
  50% { transform: translate(var(--heixiu-drift-x), calc(-1 * var(--heixiu-drift-y))); }
}
#root [data-composer-card] > button.xiaohei-bloub > .xiaohei-bloub-drift > svg {
  display: block;
  width: 100%; height: 100%;
  overflow: hidden;
  pointer-events: none;
  transform: translate(var(--heixiu-follow-x, 0px), var(--heixiu-follow-y, 0px));
  transition: transform 480ms cubic-bezier(.2,.75,.25,1);
}
#root [data-composer-card] > button.xiaohei-bloub:active > .xiaohei-bloub-drift > svg {
  transform: translate(var(--heixiu-follow-x, 0px), var(--heixiu-follow-y, 0px)) scale(.98);
}
#root [data-composer-card][data-heixiu-dock='compact'] {
  padding-inline-start: 64px !important;
}
#root [data-composer-card][data-heixiu-dock='compact'] > button.xiaohei-bloub {
  width: 52px; height: 52px;
  right: auto; left: 4px; top: 6px;
}
#root [data-composer-card][data-heixiu-dock='compact'] .xiaohei-bloub-drift {
  --heixiu-drift-x: 2px;
  --heixiu-drift-y: 3px;
}
#root [data-composer-card][data-heixiu-dock='welcome'] > button.xiaohei-bloub {
  right: auto;
  left: var(--heixiu-welcome-left);
  top: var(--heixiu-welcome-top);
  width: var(--heixiu-welcome-size);
  height: var(--heixiu-welcome-size);
}
@media (max-width: 760px) {
  #root [data-heixiu-hero-row] { box-sizing: border-box; padding-inline-start: 64px; max-width: 100%; }
  #root [data-composer-card][data-heixiu-dock='welcome'] .xiaohei-bloub-drift {
    --heixiu-drift-x: 2px;
    --heixiu-drift-y: 4px;
  }
}
#root [data-composer-card] > button.xiaohei-bloub[hidden] { display: none; }
@media (prefers-reduced-motion: reduce) {
  #root [data-composer-card] > button.xiaohei-bloub { transition: none; transform: none; }
  #root [data-composer-card] > button.xiaohei-bloub > .xiaohei-bloub-drift { animation: none; transform: none; }
  #root [data-composer-card] > button.xiaohei-bloub > .xiaohei-bloub-drift > svg { transition: none; transform: none; }
}
@media print {
  #root [data-composer-card] > button.xiaohei-bloub { display: none; }
  #root [data-composer-card][data-heixiu-dock='compact'] { padding-inline-start: 12px !important; }
}
`

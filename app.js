document.addEventListener('DOMContentLoaded', () => {
  Store.load();
  console.log('Store loaded. isEmpty:', Store.isEmpty());
  console.log('State:', Store.getState());
});

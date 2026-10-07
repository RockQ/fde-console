document.addEventListener('DOMContentLoaded', () => {
  loadDemoDataIfEmpty();
  const state = Store.getState();
  console.log('Projects:', state.projects.length);
  console.log('Demo project:', state.projects[0]?.name);
});

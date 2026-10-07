const App = (() => {
  function render() {
    const state = Store.getState();
    ProjectList.render();

    if (state.activeView === 'kb') {
      // KnowledgeBase.render() — implemented in Task 8
      document.getElementById('main-panel').innerHTML = '<div style="padding:24px;color:#9e9e9e">知识库视图（Task 8 实现）</div>';
      document.getElementById('exec-panel').innerHTML = '';
    } else {
      PhaseView.render();
    }
  }
  return { render };
})();

document.addEventListener('DOMContentLoaded', () => {
  loadDemoDataIfEmpty();
  Store.load();

  // Set active project to first project if none set
  const state = Store.getState();
  if (!state.activeProjectId && state.projects.length > 0) {
    Store.setActiveProject(state.projects[0].id);
  }

  App.render();
});

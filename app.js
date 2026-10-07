const App = (() => {
  function render() {
    const state = Store.getState();
    ProjectList.render();

    if (state.activeView === 'kb') {
      KnowledgeBase.render();
    } else {
      KnowledgeBase.destroy();
      PhaseView.render();
      ExecPanel.renderEmpty();
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

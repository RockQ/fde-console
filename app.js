const App = (() => {
  function render() {
    const { activeView } = Store.getState();
    const project = Store.getActiveProject();

    // Update topbar context (KB view sets its own context via KnowledgeBase.render())
    const ctx = document.getElementById('topbar-context');
    if (activeView !== 'kb' && ctx) {
      ctx.textContent = project ? project.name : '';
    }

    // Project list always visible
    ProjectList.render();

    if (activeView === 'kb') {
      KnowledgeBase.render();
    } else {
      KnowledgeBase.destroy();
      if (project) {
        PhaseView.render();
        ExecPanel.renderEmpty();
      } else {
        const mainPanel = document.getElementById('main-panel');
        const execPanel = document.getElementById('exec-panel');
        if (mainPanel) mainPanel.innerHTML =
          '<div style="display:flex;align-items:center;justify-content:center;height:100%;color:var(--color-text-muted);font-size:13px">选择左侧项目或新建项目</div>';
        if (execPanel) execPanel.innerHTML = '';
      }
    }
  }

  function init() {
    loadDemoDataIfEmpty();
    Store.load();
    const { projects, activeProjectId } = Store.getState();
    if (!activeProjectId && projects.length > 0) {
      Store.setActiveProject(projects[0].id);
    }
    render();
  }

  return { render, init };
})();

document.addEventListener('DOMContentLoaded', () => App.init());

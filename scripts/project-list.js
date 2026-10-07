const ProjectList = (() => {
  function getStageLabel(project) {
    const stage = project.stages.find(s => s.id === project.currentStageId);
    return stage ? stage.name : '未知';
  }

  function isProjectDone(project) {
    return project.stages.every(s => s.status === 'done');
  }

  function render() {
    const panel = document.getElementById('project-list-panel');
    const { projects, activeProjectId } = Store.getState();

    panel.innerHTML = `
      <div class="sidebar-section-label">我的项目</div>
      ${projects.map(p => `
        <div class="project-item ${p.id === activeProjectId ? 'active' : ''}"
             data-id="${p.id}">
          <div class="proj-name">${p.name}</div>
          <div class="proj-sub">${p.industry}</div>
          <div class="proj-status ${isProjectDone(p) ? 'status-done' : 'status-active'}">
            <span class="material-icons">
              ${isProjectDone(p) ? 'check_circle' : 'radio_button_checked'}
            </span>
            ${isProjectDone(p) ? '已交付' : getStageLabel(p) + ' 进行中'}
          </div>
        </div>
      `).join('')}
      <button class="add-project-btn" id="add-project-btn">
        <span class="material-icons">add</span>新建项目
      </button>
    `;

    panel.querySelectorAll('.project-item[data-id]').forEach(el => {
      el.addEventListener('click', () => {
        Store.setActiveProject(el.dataset.id);
        App.render();
      });
    });

    document.getElementById('add-project-btn').addEventListener('click', () => {
      NewProjectModal.open();
    });
  }

  return { render };
})();

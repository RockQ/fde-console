const PhaseView = (() => {
  function escHtml(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function daysFromEntry(project) {
    const entry = new Date(project.entryDate);
    const today = new Date();
    return Math.floor((today - entry) / (1000 * 60 * 60 * 24));
  }

  function renderTimeline(project) {
    const d = daysFromEntry(project);
    const milestonesForStage = (stageId) =>
      (project.milestones || []).filter(m => m.stageId === stageId);

    return `
      <div class="phase-track-wrapper">
        <div class="phase-track">
          ${project.stages.map(stage => {
            const ms = milestonesForStage(stage.id);
            const msHtml = ms.map(m =>
              `<div class="milestone-marker">${escHtml(m.label)}</div>`
            ).join('');
            return `
              <div class="phase-card phase-${stage.status}" data-stage="${escHtml(stage.id)}">
                <div class="phase-tag">${stage.status === 'active' ? '当前' : ''}</div>
                <div class="phase-name">${escHtml(stage.name)}</div>
                ${stage.status === 'active'
                  ? `<div class="phase-progress">${(stage.tasks || []).filter(t=>t.status==='archived').length} / ${(stage.tasks || []).length} 项完成</div>`
                  : `<span class="material-icons">${stage.status === 'done' ? 'check_circle' : 'lock'}</span>`
                }
                ${msHtml}
              </div>
            `;
          }).join('')}
        </div>
        <div style="display:flex;justify-content:space-between;align-items:center;margin-top:4px">
          <span style="font-size:9px;color:var(--color-text-muted)">进场 D0 &nbsp;·&nbsp; 当前 D+${d}</span>
          <button class="add-milestone-btn" id="add-milestone-btn">
            <span class="material-icons">add</span>添加里程碑
          </button>
        </div>
      </div>
    `;
  }

  function render() {
    const project = Store.getActiveProject();
    if (!project) return;
    const panel = document.getElementById('main-panel');
    panel.innerHTML = `
      <div class="proj-header">
        <div>
          <div class="proj-title">${escHtml(project.name)}</div>
          <div class="proj-meta">${escHtml(project.industry)} &nbsp;·&nbsp; 进场 ${escHtml(project.entryDate)}</div>
        </div>
        <div class="header-actions">
          <button class="action-btn primary" id="kb-btn">
            <span class="material-icons">library_books</span>知识库
          </button>
          <button class="action-btn">
            <span class="material-icons">pending_actions</span>待跟进事项
          </button>
        </div>
      </div>
      ${renderTimeline(project)}
      <div id="task-list-container"></div>
    `;

    document.getElementById('kb-btn').addEventListener('click', () => {
      Store.setActiveView('kb');
      App.render();
    });

    document.getElementById('add-milestone-btn').addEventListener('click', () => {
      MilestoneModal.open(project);
    });

    TaskList.render(project);
  }

  return { render, renderTimeline };
})();

// TaskList stub — replaced in Task 6
const TaskList = (() => {
  function render(project) {
    const container = document.getElementById('task-list-container');
    if (container) container.innerHTML = '<div style="padding:16px;color:#9e9e9e;font-size:12px;">工作清单加载中…</div>';
  }
  return { render };
})();

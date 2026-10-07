// Module-level HTML escaping utility
function escHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

const PhaseView = (() => {

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

const TaskList = (() => {
  function render(project) {
    const activeStage = project.stages.find(s => s.id === project.currentStageId);
    if (!activeStage) return;

    const container = document.getElementById('task-list-container');
    if (!container) return;

    container.innerHTML = `
      <div class="task-panel">
        <div class="task-panel-title">
          <span class="material-icons">assignment</span>
          ${escHtml(activeStage.name)} — 工作清单
        </div>
        ${(activeStage.tasks || []).map(task => `
          <div class="task-item task-${task.status}" data-task="${task.id}">
            <div class="task-info">
              <div class="task-title">${escHtml(task.title)}</div>
              <div class="task-desc">${escHtml(task.description)}</div>
            </div>
            <div class="task-action">
              ${task.status === 'archived'
                ? `<span class="material-icons">check_circle</span>已归档`
                : task.status === 'active'
                  ? `<button class="run-btn" data-task="${task.id}">
                      <span class="material-icons">play_arrow</span>开始
                     </button>`
                  : `<span class="material-icons">lock</span>`
              }
            </div>
          </div>
        `).join('')}
      </div>
    `;

    // Active task row click opens exec panel
    container.querySelectorAll('.task-item.task-active').forEach(el => {
      el.addEventListener('click', () => {
        const task = activeStage.tasks.find(t => t.id === el.dataset.task);
        if (typeof ExecPanel !== 'undefined') {
          ExecPanel.open(project, activeStage, task);
        }
      });
    });

    container.querySelectorAll('.run-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const task = activeStage.tasks.find(t => t.id === btn.dataset.task);
        if (typeof ExecPanel !== 'undefined') {
          ExecPanel.open(project, activeStage, task);
        }
      });
    });
  }

  return { render };
})();

const KnowledgeBase = (() => {
  let _selectedTask = null;
  let _selectedStageId = null;

  function escHtml(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function getArchivedTasks(project) {
    const result = [];
    project.stages.forEach(stage => {
      (stage.tasks || []).forEach(task => {
        if (task.status === 'archived' && task.output) {
          result.push({ stage, task });
        }
      });
    });
    return result;
  }

  function getArchivedInStage(project, stageId) {
    const stage = project.stages.find(s => s.id === stageId);
    if (!stage) return [];
    return (stage.tasks || []).filter(t => t.status === 'archived' && t.output).map(task => ({ stage, task }));
  }

  function renderTree(project) {
    return project.stages.map(stage => {
      const count = (stage.tasks || []).filter(t => t.status === 'archived' && t.output).length;
      const isActive = stage.id === _selectedStageId;
      const icon = stage.status === 'done' ? 'check_circle' : stage.status === 'active' ? 'radio_button_checked' : 'lock';
      return `
        <div class="tree-phase">
          <div class="tree-phase-header ${isActive ? 'active' : ''}" data-stage="${escHtml(stage.id)}">
            <span class="material-icons" style="font-size:14px">${icon}</span>
            ${escHtml(stage.name)}
            <span class="count">${count}</span>
          </div>
        </div>
      `;
    }).join('');
  }

  function renderList(project) {
    const items = _selectedStageId
      ? getArchivedInStage(project, _selectedStageId)
      : getArchivedTasks(project);

    if (items.length === 0) {
      return '<div style="color:var(--color-text-muted);font-size:12px;padding:20px 0">暂无归档内容</div>';
    }

    return items.map(({ stage, task }) => `
      <div class="kb-card ${_selectedTask && _selectedTask.id === task.id ? 'selected' : ''}" data-task="${task.id}" data-stage="${escHtml(stage.id)}">
        <div class="kb-card-header">
          <div class="kb-card-title">${escHtml(task.title)}</div>
          <div class="kb-card-meta">
            <span class="material-icons">schedule</span>
            ${escHtml(task.archivedAt || '')}
          </div>
        </div>
        <div class="kb-tags">
          <span class="tag tag-phase">${escHtml(stage.name)}</span>
          <span class="tag ${task.source === 'manual' ? 'tag-manual' : 'tag-ai'}">${task.source === 'manual' ? '人工撰写' : 'AI 辅助'}</span>
        </div>
        <div class="kb-card-preview">${escHtml((task.output || '').replace(/##[^\n]*/g, '').replace(/\n/g, ' ').trim().slice(0, 100))}...</div>
      </div>
    `).join('');
  }

  function renderPreview() {
    if (!_selectedTask) {
      return `<div style="color:var(--color-text-muted);font-size:12px;display:flex;align-items:center;justify-content:center;height:100%">选择文件预览内容</div>`;
    }
    const stageName = _selectedTask.stageName || '';
    return `
      <div class="kb-preview-title">${escHtml(_selectedTask.title)}</div>
      <div class="kb-preview-meta">
        <div class="meta-row"><span class="material-icons">folder</span>${escHtml(stageName)}</div>
        <div class="meta-row"><span class="material-icons">schedule</span>${escHtml(_selectedTask.archivedAt || '')} 归档</div>
        <div class="meta-row"><span class="material-icons">smart_toy</span>${_selectedTask.source === 'manual' ? '人工撰写' : 'AI 辅助 + 人工确认'}</div>
      </div>
      <div class="kb-preview-content">${escHtml(_selectedTask.output || '')}</div>
      <div class="kb-preview-actions">
        <button class="prev-btn primary" id="kb-export-btn">
          <span class="material-icons">file_download</span>导出
        </button>
        <button class="prev-btn">
          <span class="material-icons">edit</span>修改
        </button>
      </div>
    `;
  }

  function render() {
    const project = Store.getActiveProject();
    if (!project) return;

    const mainPanel = document.getElementById('main-panel');
    const execPanel = document.getElementById('exec-panel');

    // KB replaces both center and right panels
    mainPanel.style.display = 'none';
    execPanel.style.display = 'none';

    // Insert kb layout after project-list-panel
    let kbEl = document.getElementById('kb-view');
    if (!kbEl) {
      kbEl = document.createElement('div');
      kbEl.id = 'kb-view';
      kbEl.className = 'panel-kb';
      document.querySelector('.main-layout').appendChild(kbEl);
    }

    kbEl.style.display = 'flex';
    kbEl.innerHTML = `
      <div class="kb-tree">
        <div class="tree-label"><span class="material-icons">account_tree</span>按阶段浏览</div>
        <div class="tree-phase">
          <div class="tree-phase-header ${!_selectedStageId ? 'active' : ''}" data-stage="all">
            <span class="material-icons" style="font-size:14px">layers</span>
            全部
            <span class="count">${getArchivedTasks(project).length}</span>
          </div>
        </div>
        ${renderTree(project)}
      </div>
      <div class="kb-list">
        <div class="kb-list-header">
          <div class="kb-list-title">${_selectedStageId ? escHtml(project.stages.find(s => s.id === _selectedStageId)?.name || '') : '全部归档'}</div>
        </div>
        ${renderList(project)}
      </div>
      <div class="kb-preview">
        ${renderPreview()}
      </div>
    `;

    // Back button in topbar
    document.getElementById('topbar-context').innerHTML = `
      <button style="background:none;border:none;color:var(--color-accent);cursor:pointer;font-size:11px;display:flex;align-items:center;gap:3px;font-family:var(--font-main)" id="kb-back-btn">
        <span class="material-icons" style="font-size:13px">arrow_back</span>返回项目
      </button>
    `;
    document.getElementById('kb-back-btn').addEventListener('click', () => {
      Store.setActiveView('project');
      App.render();
    });

    // Tree nav
    kbEl.querySelectorAll('.tree-phase-header').forEach(el => {
      el.addEventListener('click', () => {
        _selectedStageId = el.dataset.stage === 'all' ? null : el.dataset.stage;
        _selectedTask = null;
        render();
      });
    });

    // Card selection
    kbEl.querySelectorAll('.kb-card').forEach(el => {
      el.addEventListener('click', () => {
        const stageId = el.dataset.stage;
        const stage = project.stages.find(s => s.id === stageId);
        if (!stage) return;
        const task = (stage.tasks || []).find(t => t.id === el.dataset.task);
        if (!task) return;
        _selectedTask = { ...task, stageName: stage.name };
        render();
      });
    });

    // Export
    const exportBtn = document.getElementById('kb-export-btn');
    if (exportBtn && _selectedTask) {
      exportBtn.addEventListener('click', () => {
        const blob = new Blob([_selectedTask.output || ''], { type: 'text/markdown' });
        const a = document.createElement('a');
        const url = URL.createObjectURL(blob);
        a.href = url;
        a.download = `${_selectedTask.title}.md`;
        a.click();
        URL.revokeObjectURL(url);
      });
    }
  }

  function destroy() {
    const kbEl = document.getElementById('kb-view');
    if (kbEl) kbEl.style.display = 'none';
    const mainPanel = document.getElementById('main-panel');
    const execPanel = document.getElementById('exec-panel');
    if (mainPanel) mainPanel.style.display = '';
    if (execPanel) execPanel.style.display = '';
    const ctx = document.getElementById('topbar-context');
    if (ctx) ctx.innerHTML = '';
  }

  return { render, destroy };
})();

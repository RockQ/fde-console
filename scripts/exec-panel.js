const ExecPanel = (() => {
  let _project = null;
  let _stage = null;
  let _task = null;
  let _draftContent = '';

  function escHtml(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  // Pre-baked example outputs keyed by skill
  const EXAMPLES = {
    'test-assumptions': `## 关键假设验证清单\n\n**假设 1：** AI 生成内容质量可达人工水准的 80%\n▲ 存疑 — 需在客户真实数据上实测验证，建议安排 2 周测试期\n\n**假设 2：** 审批流程可压缩至 1 天\n✗ 已证伪 — 法务 + 品牌两个部门串行必经，最短 3 个工作日\n\n**假设 3：** 数据接口可直接从 CMS 调用\n✗ 已证伪 — 数据权限未申请，需走集团 IT 审批流程（预计 2–4 周）\n\n---\n**方案规划建议：**\n1. 优先启动数据权限申请，避免 M3 卡点\n2. 调整方案设计，不依赖审批流压缩\n3. 将 AI 质量测试作为 M3 前置验收项`,
    'score-use-cases': `## 用例优先级排序\n\n| 用例 | 业务价值 | 技术可行性 | 优先级 |\n|---|---|---|---|\n| 图文内容 AI 辅助生成 | 高 | 中（权限待解决） | P1 |\n| 多平台格式自动转换 | 中 | 高 | P2 |\n| 历史内容资产检索 | 中 | 中 | P3 |\n| 短视频脚本 AI 生成 | 低 | 低 | P4（暂不做）|\n\n**推荐：** 先做 P2（无权限依赖，快速出成果），并行推进 P1 的权限申请。`,
    'options': `## 多方案对比分析\n\n**方案 A（推荐）：分阶段渐进接入**\n先跑通图文格式转换（无 AI，纯工具），建立信任后再引入 AI 生成能力。\n优：风险最低，可快速出第一个里程碑；劣：见效慢。\n\n**方案 B：AI 全流程**\n直接接入大模型做端到端内容生成 + 审核辅助。\n优：潜力最大；劣：依赖数据权限，当前有卡点。\n\n**方案 C：购买 SaaS 工具**\n引入第三方 AI 内容平台，减少自研投入。\n优：速度快；劣：数据安全问题，难通过集团 IT 审批。\n\n**推荐方案 A**，D+70 可交付第一个可用功能。`,
  };

  function getContextFromKB(project, stage) {
    const archivedTasks = (stage.tasks || []).filter(t => t.status === 'archived' && t.output);
    if (archivedTasks.length === 0) return '（暂无已归档内容）';
    const last = archivedTasks[archivedTasks.length - 1];
    const lines = last.output.split('\n').filter(l => l.trim()).slice(0, 3);
    return `来自「${last.title}」：\n${lines.join('\n')}`;
  }

  function _buildContext() {
    const parts = [];
    parts.push(`项目：${_project.name}（${_project.industry}）`);
    parts.push(`进场日期：${_project.entryDate}，当前阶段：${_stage.name}`);
    // Include all archived outputs from this project
    _project.stages.forEach(s => {
      (s.tasks || []).forEach(t => {
        if (t.status === 'archived' && t.output) {
          parts.push(`\n## 已归档：${s.name} / ${t.title}\n${t.output}`);
        }
      });
    });
    return parts.join('\n');
  }

  function _showKeyPrompt(errorMsg) {
    const panel = document.getElementById('exec-panel');
    if (!panel) return;
    const current = FDEApi.getKey();
    panel.innerHTML = `
      <div style="display:flex;flex-direction:column;gap:12px;padding:4px 0">
        <div style="font-weight:700;font-size:13px;color:var(--color-text-primary)">输入 Anthropic API Key</div>
        ${errorMsg ? `<div style="font-size:11px;color:var(--color-fail)">${escHtml(errorMsg)}</div>` : ''}
        <div style="font-size:11px;color:var(--color-text-secondary)">Key 仅保存在本地，不会上传。</div>
        <input id="api-key-input" type="password" value="${escHtml(current)}" placeholder="sk-ant-..."
          style="width:100%;padding:8px 10px;border:1px solid var(--color-border);border-radius:var(--radius-sm);font-size:12px;font-family:var(--font-main)">
        <div style="display:flex;gap:8px">
          <button id="api-key-save" style="flex:1;padding:7px;font-size:12px;background:var(--color-sidebar-bg);color:var(--color-white);border:none;border-radius:var(--radius-sm);cursor:pointer;font-family:var(--font-main)">保存</button>
          <button id="api-key-cancel" style="flex:1;padding:7px;font-size:12px;background:var(--color-panel-bg);color:var(--color-text-primary);border:1px solid var(--color-border);border-radius:var(--radius-sm);cursor:pointer;font-family:var(--font-main)">取消</button>
        </div>
      </div>
    `;
    document.getElementById('api-key-save').addEventListener('click', () => {
      const val = document.getElementById('api-key-input').value.trim();
      if (val) { FDEApi.saveKey(val); renderPanel(); }
    });
    document.getElementById('api-key-cancel').addEventListener('click', () => renderPanel());
  }

  function renderEmpty() {
    const panel = document.getElementById('exec-panel');
    if (!panel) return;
    panel.innerHTML = `
      <div class="exec-empty">
        <span class="material-icons">touch_app</span>
        <span>点击工作清单中的任务<br>开始执行</span>
      </div>
    `;
  }

  function renderPanel() {
    const panel = document.getElementById('exec-panel');
    if (!panel || !_task) return;
    const context = getContextFromKB(_project, _stage);

    panel.innerHTML = `
      <div>
        <div class="exec-title">${escHtml(_task.title)}</div>
        <div class="exec-desc">${escHtml(_task.description)}</div>
      </div>
      <div>
        <div class="context-label">
          <span class="material-icons">link</span>引用上下文
        </div>
        <div class="context-box">${escHtml(context).replace(/\n/g, '<br>')}</div>
      </div>
      <div class="exec-actions">
        <button class="exec-btn ai" id="exec-ai-btn">
          <span class="material-icons">smart_toy</span>AI 辅助
        </button>
        <button class="exec-btn" id="exec-example-btn">
          <span class="material-icons">description</span>用示例
        </button>
      </div>
      <div class="draft-box" id="draft-box">${_draftContent
        ? escHtml(_draftContent).replace(/\n/g, '<br>')
        : '<span style="color:var(--color-text-muted)">点击「AI 辅助」或「用示例」生成草稿</span>'
      }</div>
      <div class="archive-section">
        <div class="archive-actions">
          <button class="arch-btn confirm" id="archive-confirm-btn" ${!_draftContent ? 'disabled style="opacity:0.4"' : ''}>
            <span class="material-icons">archive</span>确认归档
          </button>
          <button class="arch-btn" id="archive-edit-btn">
            <span class="material-icons">edit</span>修改
          </button>
        </div>
        <div class="arch-path">
          <span class="material-icons">folder</span>
          ${escHtml(_stage.name)} / ${escHtml(_task.title)}
        </div>
      </div>
    `;

    document.getElementById('exec-example-btn').addEventListener('click', () => {
      _draftContent = EXAMPLES[_task.skill] ||
        `## ${_task.title}\n\n（此处为 ${_task.title} 的示例输出内容）\n\n根据项目上下文，FDE 会在此记录关键发现与行动建议。`;
      renderPanel();
    });

    document.getElementById('exec-ai-btn').addEventListener('click', () => {
      if (!FDEApi.hasKey()) {
        _showKeyPrompt();
        return;
      }
      const draft = document.getElementById('draft-box');
      if (!draft) return;
      draft.innerHTML = '<span style="color:var(--color-text-muted)">AI 生成中<span id="ai-dots">...</span></span>';

      // Animate dots while streaming
      let dots = 0;
      const dotsEl = () => document.getElementById('ai-dots');
      const dotTimer = setInterval(() => {
        const el = dotsEl();
        if (el) { dots = (dots + 1) % 4; el.textContent = '.'.repeat(dots + 1); }
      }, 400);

      let accumulated = '';
      const projectContext = _buildContext();

      FDEApi.callSkill(
        _task.skill,
        _task.title,
        projectContext,
        (chunk) => {
          accumulated += chunk;
          const d = document.getElementById('draft-box');
          if (d) d.innerHTML = escHtml(accumulated).replace(/\n/g, '<br>');
        },
        () => {
          clearInterval(dotTimer);
          _draftContent = accumulated;
          renderPanel();
        },
        (errType) => {
          clearInterval(dotTimer);
          if (errType === 'NO_KEY' || errType === 'INVALID_KEY') {
            _showKeyPrompt(errType === 'INVALID_KEY' ? 'API Key 无效，请重新输入' : '');
          } else {
            const d = document.getElementById('draft-box');
            if (d) d.innerHTML = `<span style="color:var(--color-fail)">调用失败：${escHtml(errType)}</span>`;
          }
        }
      );
    });

    document.getElementById('archive-edit-btn').addEventListener('click', () => {
      const draft = document.getElementById('draft-box');
      draft.contentEditable = 'true';
      draft.focus();
      draft.addEventListener('blur', () => {
        _draftContent = draft.innerText;
        draft.contentEditable = 'false';
        renderPanel();
      }, { once: true });
    });

    if (_draftContent) {
      document.getElementById('archive-confirm-btn').addEventListener('click', () => {
        Store.updateTask(_project.id, _stage.id, _task.id, {
          status: 'archived',
          output: _draftContent,
          source: 'ai',
          archivedAt: new Date().toISOString().slice(0, 10)
        });
        _task = null;
        _draftContent = '';
        App.render();
      });
    }
  }

  function open(project, stage, task) {
    if (!task) return;
    _project = project;
    _stage = stage;
    _task = task;
    _draftContent = task.output || '';
    renderPanel();
  }

  function clear() { renderEmpty(); }

  return { open, clear, renderEmpty };
})();

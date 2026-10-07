// ── New Project Modal ──
const NewProjectModal = (() => {
  const INDUSTRIES = ['汽车', '零售', '金融', '制造', '互联网', '医疗', '其他'];

  function open() {
    const overlay = document.getElementById('modal-overlay');
    overlay.classList.remove('hidden');
    overlay.innerHTML = `
      <div class="modal">
        <div style="font-weight:700;font-size:15px;margin-bottom:16px;color:var(--color-text-primary)">新建项目</div>
        <div style="display:flex;flex-direction:column;gap:12px">
          <div>
            <label style="font-size:10px;color:var(--color-text-muted);display:block;margin-bottom:4px">项目名称</label>
            <input id="modal-name" type="text" placeholder="如：某大型车企 · AI 平台接入"
              style="width:100%;padding:8px 10px;border:1px solid var(--color-border);border-radius:var(--radius-sm);font-size:12px;font-family:var(--font-main)">
          </div>
          <div>
            <label style="font-size:10px;color:var(--color-text-muted);display:block;margin-bottom:4px">客户行业</label>
            <select id="modal-industry"
              style="width:100%;padding:8px 10px;border:1px solid var(--color-border);border-radius:var(--radius-sm);font-size:12px;font-family:var(--font-main)">
              ${INDUSTRIES.map(i => `<option>${i}</option>`).join('')}
            </select>
          </div>
          <div>
            <label style="font-size:10px;color:var(--color-text-muted);display:block;margin-bottom:4px">进场日期（D0）</label>
            <input id="modal-date" type="date" value="${new Date().toISOString().slice(0,10)}"
              style="width:100%;padding:8px 10px;border:1px solid var(--color-border);border-radius:var(--radius-sm);font-size:12px;font-family:var(--font-main)">
          </div>
        </div>
        <div style="display:flex;gap:8px;margin-top:20px;justify-content:flex-end">
          <button id="modal-cancel"
            style="padding:7px 16px;border:1px solid var(--color-border);border-radius:var(--radius-sm);background:var(--color-panel-bg);cursor:pointer;font-family:var(--font-main);font-size:12px">
            取消
          </button>
          <button id="modal-confirm"
            style="padding:7px 16px;border:none;border-radius:var(--radius-sm);background:var(--color-sidebar-bg);color:var(--color-white);cursor:pointer;font-family:var(--font-main);font-size:12px">
            创建项目
          </button>
        </div>
      </div>
    `;

    document.getElementById('modal-cancel').addEventListener('click', close);
    overlay.addEventListener('click', (e) => { if (e.target === overlay) close(); });

    document.getElementById('modal-confirm').addEventListener('click', () => {
      const nameEl = document.getElementById('modal-name');
      const name = nameEl.value.trim();
      const industry = document.getElementById('modal-industry').value;
      const entryDate = document.getElementById('modal-date').value;
      if (!name) {
        nameEl.style.borderColor = '#c62828';
        nameEl.focus();
        return;
      }
      const project = buildNewProject(name, industry, entryDate);
      Store.addProject(project);
      Store.setActiveProject(project.id);
      close();
      App.render();
    });
  }

  function close() {
    const overlay = document.getElementById('modal-overlay');
    overlay.classList.add('hidden');
    overlay.innerHTML = '';
  }

  function buildNewProject(name, industry, entryDate) {
    const STAGE_TEMPLATES = [
      { id: 'start', name: '项目启动', taskDefs: [
        { title: '需求澄清备忘录', description: '厘清客户真实目标、约束条件与证据缺口', skill: 'brief' },
        { title: '决策链路梳理', description: '识别关键决策者与影响力路径', skill: 'who-decides' },
        { title: '信任建立行动计划', description: '制定获取资源与建立可信度的初始行动', skill: 'earn-trust' },
      ]},
      { id: 'discover', name: '现状调研', taskDefs: [
        { title: '系统现状摸底报告', description: '梳理现有架构、数据流与核心痛点', skill: 'discover' },
        { title: '利益相关者访谈纪要', description: '记录核心访谈发现与关键人诉求', skill: 'discover' },
        { title: '关键假设验证清单', description: '逐条评估方案依赖的前提是否成立', skill: 'test-assumptions' },
        { title: '用例优先级排序', description: '按价值与可行性对候选方向排序', skill: 'score-use-cases' },
        { title: 'M 里程碑汇报材料', description: '向客户高管汇报调研阶段发现', skill: 'readout' },
      ]},
      { id: 'plan', name: '方案规划', taskDefs: [
        { title: '多方案对比分析', description: '生成 2–3 个可行路径，附推荐理由', skill: 'options' },
        { title: '方案风险压测', description: '系统性挑战选定方案的潜在失败点', skill: 'red-team' },
        { title: '交付切片计划', description: '将方案拆解为可独立验收的交付单元', skill: 'plan' },
      ]},
      { id: 'build', name: '落地开发', taskDefs: [
        { title: '功能开发', description: '实现核心功能模块', skill: 'build' },
        { title: '系统集成', description: '对接客户现有系统与数据源', skill: 'integrate' },
        { title: '故障排查', description: '定位并修复集成过程中的问题', skill: 'debug' },
        { title: '代码评审', description: '审查变更，确保质量与安全', skill: 'review' },
        { title: '质量验证', description: '测试真实用户任务场景', skill: 'qa' },
        { title: '潜在崩点排查', description: '列出变更可能导致问题的地方', skill: 'what-breaks' },
        { title: '回滚预案', description: '准备上线失败时的回退方案', skill: 'rollback' },
        { title: '上线发布', description: '执行生产环境部署', skill: 'ship' },
      ]},
      { id: 'operate', name: '交付运维', taskDefs: [
        { title: '里程碑汇报材料', description: '向客户高管汇报交付成果', skill: 'readout' },
        { title: '项目复盘', description: '回顾整个项目的决策与经验', skill: 'debrief' },
        { title: '操作手册', description: '编写客户团队独立运营所需的操作文档', skill: 'runbook' },
        { title: '工程师交接文档', description: '移交系统知识，确保客户团队能接手', skill: 'handoff' },
      ]},
    ];

    const stages = STAGE_TEMPLATES.map((tmpl, stageIdx) => ({
      id: tmpl.id,
      name: tmpl.name,
      status: stageIdx === 0 ? 'active' : 'locked',
      tasks: tmpl.taskDefs.map((def, taskIdx) => ({
        id: generateId(),
        title: def.title,
        description: def.description,
        status: stageIdx === 0 && taskIdx === 0 ? 'active' : 'locked',
        skill: def.skill,
        output: null,
        source: null,
        archivedAt: null,
      }))
    }));

    return {
      id: generateId(),
      name,
      industry,
      entryDate,
      currentStageId: 'start',
      milestones: [],
      stages
    };
  }

  return { open, close };
})();

// ── Milestone Modal ──
const MilestoneModal = (() => {
  function open(project) {
    const overlay = document.getElementById('modal-overlay');
    overlay.classList.remove('hidden');
    overlay.innerHTML = `
      <div class="modal">
        <div style="font-weight:700;font-size:15px;margin-bottom:16px;color:var(--color-text-primary)">添加里程碑</div>
        <div style="display:flex;flex-direction:column;gap:12px">
          <div>
            <label style="font-size:10px;color:var(--color-text-muted);display:block;margin-bottom:4px">里程碑名称</label>
            <input id="ms-label" type="text" placeholder="如：M3"
              style="width:100%;padding:8px 10px;border:1px solid var(--color-border);border-radius:var(--radius-sm);font-size:12px;font-family:var(--font-main)">
          </div>
          <div>
            <label style="font-size:10px;color:var(--color-text-muted);display:block;margin-bottom:4px">挂在哪个阶段</label>
            <select id="ms-stage"
              style="width:100%;padding:8px 10px;border:1px solid var(--color-border);border-radius:var(--radius-sm);font-size:12px;font-family:var(--font-main)">
              ${project.stages.map(s => `<option value="${s.id}">${s.name}</option>`).join('')}
            </select>
          </div>
          <div>
            <label style="font-size:10px;color:var(--color-text-muted);display:block;margin-bottom:4px">距进场天数（D+）</label>
            <input id="ms-days" type="number" min="1" placeholder="如：45"
              style="width:100%;padding:8px 10px;border:1px solid var(--color-border);border-radius:var(--radius-sm);font-size:12px;font-family:var(--font-main)">
          </div>
        </div>
        <div style="display:flex;gap:8px;margin-top:20px;justify-content:flex-end">
          <button id="ms-cancel"
            style="padding:7px 16px;border:1px solid var(--color-border);border-radius:var(--radius-sm);background:var(--color-panel-bg);cursor:pointer;font-family:var(--font-main);font-size:12px">
            取消
          </button>
          <button id="ms-confirm"
            style="padding:7px 16px;border:none;border-radius:var(--radius-sm);background:var(--color-sidebar-bg);color:var(--color-white);cursor:pointer;font-family:var(--font-main);font-size:12px">
            添加
          </button>
        </div>
      </div>
    `;

    document.getElementById('ms-cancel').addEventListener('click', close);
    overlay.addEventListener('click', (e) => { if (e.target === overlay) close(); });

    document.getElementById('ms-confirm').addEventListener('click', () => {
      const label = document.getElementById('ms-label').value.trim();
      const stageId = document.getElementById('ms-stage').value;
      const daysVal = document.getElementById('ms-days').value;
      const days = parseInt(daysVal, 10);
      if (!label || !days || days < 1) return;
      Store.addMilestone(project.id, { id: generateId(), label, stageId, daysFromD0: days });
      close();
      App.render();
    });
  }

  function close() {
    const overlay = document.getElementById('modal-overlay');
    overlay.classList.add('hidden');
    overlay.innerHTML = '';
  }

  return { open, close };
})();

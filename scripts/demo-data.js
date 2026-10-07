function generateId() {
  return Math.random().toString(36).slice(2, 10);
}

function buildDemoProject() {
  const stages = [
    {
      id: 'start', name: '项目启动', status: 'done',
      tasks: [
        { id: generateId(), title: '需求澄清备忘录', description: '厘清客户真实目标、约束条件与证据缺口', status: 'archived', skill: 'brief', source: 'ai', output: '## 需求澄清备忘录\n\n**客户目标：** 将广宣内容生产周期从 5–7 天压缩至 1–2 天，借助 AI 辅助生成能力降低人工成本。\n\n**核心约束：**\n- 所有内容须经法务与品牌部门审批\n- 数据不出集团内网\n- 6 个月内上线首版\n\n**待明确事项：**\n- 内容类型范围（图文 / 视频 / 社交媒体？）\n- AI 生成内容的最终发布审批权归属', archivedAt: '2026-06-28' },
        { id: generateId(), title: '决策链路梳理', description: '识别关键决策者与影响力路径', status: 'archived', skill: 'who-decides', source: 'example', output: '## 决策链路分析\n\n**最终决策者：** 品牌部门总监（预算审批权）\n\n**技术决策者：** IT 架构组负责人\n\n**日常对接：** 广宣运营团队 PM\n\n**影响力路径：** 运营 PM → IT 负责人 → 品牌总监\n\n**推进建议：** 先取得运营 PM 信任，通过他向 IT 负责人展示技术可行性，最终由品牌总监拍板。', archivedAt: '2026-06-29' },
        { id: generateId(), title: '信任建立行动计划', description: '制定获取资源与建立可信度的初始行动', status: 'archived', skill: 'earn-trust', source: 'ai', output: '## 信任建立行动计划\n\n**第 1 周：**\n1. 安排与运营 PM 的深度访谈（1 小时），聚焦当前痛点而非解决方案\n2. 整理现有系统架构图，展示对客户环境的了解\n3. 提交第一份书面调研纪要，建立文档习惯\n\n**第 2 周：**\n1. 向 IT 负责人演示一个轻量 POC（不承诺功能范围）\n2. 主动识别并解决一个运营团队的小痛点', archivedAt: '2026-07-02' },
      ]
    },
    {
      id: 'discover', name: '现状调研', status: 'active',
      tasks: [
        { id: generateId(), title: '系统现状摸底报告', description: '梳理现有架构、数据流与核心痛点', status: 'archived', skill: 'discover', source: 'ai', output: '## 系统现状摸底报告\n\n**现有系统：** 自研 CMS + 人工审批流 + 多渠道发布平台\n\n**数据流：** 内容创作（Word/飞书）→ 初审（运营）→ 法务审核 → 品牌审核 → 格式化 → 多平台发布\n\n**核心痛点：**\n1. 串行审批导致内容生产周期 5–7 天（业界标杆 1–2 天）\n2. 多平台格式转换全部人工操作，占用 30% 运营时间\n3. 历史内容资产分散，无法复用\n\n**数据量级：** 每月产出约 200 篇图文内容、30 条短视频脚本', archivedAt: '2026-07-10' },
        { id: generateId(), title: '利益相关者访谈纪要', description: '记录核心访谈发现与关键人诉求', status: 'archived', skill: 'discover', source: 'manual', output: '## 利益相关者访谈纪要\n\n**访谈对象：** 品牌总监、IT 架构负责人、运营 PM、内容编辑（×3）\n\n**核心发现：**\n- 品牌总监：最关注「合规风险」，对 AI 持谨慎态度，要求人工终审\n- IT 负责人：担忧数据安全，要求私有化部署\n- 运营 PM：强烈支持，希望先跑通 1 个内容品类\n- 内容编辑：对 AI 辅助持开放态度，担心影响自身职位\n\n**决策影响：** AI 生成内容必须保留人工终审环节，不能全自动发布。', archivedAt: '2026-07-15' },
        { id: generateId(), title: '关键假设验证清单', description: '逐条评估方案依赖的前提是否成立', status: 'active', skill: 'test-assumptions', source: null, output: null, archivedAt: null },
        { id: generateId(), title: '用例优先级排序', description: '按价值与可行性对候选方向排序', status: 'locked', skill: 'score-use-cases', source: null, output: null, archivedAt: null },
        { id: generateId(), title: 'M2 里程碑汇报材料', description: '向客户高管汇报调研阶段发现与建议', status: 'locked', skill: 'readout', source: null, output: null, archivedAt: null },
      ]
    },
    {
      id: 'plan', name: '方案规划', status: 'locked',
      tasks: [
        { id: generateId(), title: '多方案对比分析', description: '生成 2–3 个可行路径，附推荐理由', status: 'locked', skill: 'options', source: null, output: null, archivedAt: null },
        { id: generateId(), title: '方案风险压测', description: '系统性挑战选定方案的潜在失败点', status: 'locked', skill: 'red-team', source: null, output: null, archivedAt: null },
        { id: generateId(), title: '交付切片计划', description: '将方案拆解为可独立验收的交付单元', status: 'locked', skill: 'plan', source: null, output: null, archivedAt: null },
      ]
    },
    {
      id: 'build', name: '落地开发', status: 'locked',
      tasks: [
        { id: generateId(), title: '功能开发', description: '实现核心功能模块', status: 'locked', skill: 'build', source: null, output: null, archivedAt: null },
        { id: generateId(), title: '系统集成', description: '对接客户现有系统与数据源', status: 'locked', skill: 'integrate', source: null, output: null, archivedAt: null },
        { id: generateId(), title: '故障排查', description: '定位并修复集成过程中的问题', status: 'locked', skill: 'debug', source: null, output: null, archivedAt: null },
        { id: generateId(), title: '代码评审', description: '审查变更，确保质量与安全', status: 'locked', skill: 'review', source: null, output: null, archivedAt: null },
        { id: generateId(), title: '质量验证', description: '测试真实用户任务场景', status: 'locked', skill: 'qa', source: null, output: null, archivedAt: null },
        { id: generateId(), title: '潜在崩点排查', description: '列出变更可能导致问题的地方', status: 'locked', skill: 'what-breaks', source: null, output: null, archivedAt: null },
        { id: generateId(), title: '回滚预案', description: '准备上线失败时的回退方案', status: 'locked', skill: 'rollback', source: null, output: null, archivedAt: null },
        { id: generateId(), title: '上线发布', description: '执行生产环境部署', status: 'locked', skill: 'ship', source: null, output: null, archivedAt: null },
      ]
    },
    {
      id: 'operate', name: '交付运维', status: 'locked',
      tasks: [
        { id: generateId(), title: '里程碑汇报材料', description: '向客户高管汇报交付成果', status: 'locked', skill: 'readout', source: null, output: null, archivedAt: null },
        { id: generateId(), title: '项目复盘', description: '回顾整个项目的决策与经验', status: 'locked', skill: 'debrief', source: null, output: null, archivedAt: null },
        { id: generateId(), title: '操作手册', description: '编写客户团队独立运营所需的操作文档', status: 'locked', skill: 'runbook', source: null, output: null, archivedAt: null },
        { id: generateId(), title: '工程师交接文档', description: '移交系统知识，确保客户团队能接手', status: 'locked', skill: 'handoff', source: null, output: null, archivedAt: null },
      ]
    }
  ];

  return {
    id: generateId(),
    name: '某大型车企 · 广宣 AI 平台',
    industry: '汽车',
    entryDate: '2026-06-22',
    currentStageId: 'discover',
    milestones: [
      { id: generateId(), label: 'M1', stageId: 'start', daysFromD0: 6 },
      { id: generateId(), label: 'M2', stageId: 'discover', daysFromD0: 27 },
    ],
    stages
  };
}

function loadDemoDataIfEmpty() {
  Store.load();
  if (Store.isEmpty()) {
    Store.addProject(buildDemoProject());
  }
}

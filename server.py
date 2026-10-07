#!/usr/bin/env python3
"""FDE Workbench local server — serves static files + proxies Ark (DeepSeek 4.1) API."""
import json
import os
import sys

from openai import OpenAI
from flask import Flask, Response, jsonify, request, send_from_directory

ARK_BASE_URL = "https://ark.cn-beijing.volces.com/api/v3"

app = Flask(__name__, static_folder=".", static_url_path="")

SKILL_PROMPTS = {
    "brief": """你是一名 FDE（Forward Deployed Engineer），正在帮助整理客户初次沟通后的需求澄清备忘录。
根据提供的项目背景，生成一份结构化备忘录，包含：
1. 客户真实目标（区分表面需求与深层目标）
2. 已知约束条件（时间、预算、技术、组织）
3. 当前最大不确定项（需要进一步澄清的问题）
4. 建议的下一步行动

输出格式为 Markdown，简洁专业，不超过 500 字。""",

    "who-decides": """你是一名 FDE，正在帮助梳理客户的决策链路。
根据项目背景，生成一份决策链路分析，包含：
1. 关键决策者（谁有权说"是"，谁有权说"不"）
2. 影响者与执行者的区别
3. 决策流程中的潜在卡点
4. 建立关系的优先级建议

输出格式为 Markdown，简洁实用。""",

    "earn-trust": """你是一名 FDE，正在制定信任建立行动计划。
根据项目背景，生成一份初期行动计划，包含：
1. 快速建立可信度的 3 个具体行动（D0–D14）
2. 需要主动对齐的关键干系人
3. 应该避免的常见错误
4. 第一个"小赢"的机会点

输出格式为 Markdown，操作性强。""",

    "discover": """你是一名 FDE，正在帮助整理系统现状摸底报告。
根据项目背景，生成一份现状分析，包含：
1. 现有系统架构概览
2. 核心业务流程与痛点
3. 数据流与集成现状
4. 识别出的主要卡点和机会

输出格式为 Markdown，结构清晰。""",

    "test-assumptions": """你是一名 FDE，正在帮助验证方案依赖的关键假设。
根据项目背景和已归档内容，生成一份假设验证清单，对每条假设标注：
- ✓ 已验证（证据）
- ✗ 已证伪（原因 + 影响）
- ▲ 存疑（需要进一步验证的方法）

最后给出方案规划阶段的关键建议。输出格式为 Markdown。""",

    "score-use-cases": """你是一名 FDE，正在帮助对候选用例进行优先级排序。
根据项目背景，生成一份用例优先级分析，包含：
1. 用表格按业务价值和技术可行性评分
2. 推荐的执行顺序及理由
3. 需要先解决的前置依赖

输出格式为 Markdown，表格清晰。""",

    "options": """你是一名 FDE，正在帮助生成多方案对比分析。
根据项目背景，生成 2–3 个可行方案，每个方案包含：
- 核心思路
- 主要优势
- 主要风险/劣势
- 适用条件

最后给出推荐方案及理由。输出格式为 Markdown。""",

    "red-team": """你是一名 FDE，正在帮助压测方案的潜在风险。
根据项目背景和选定方案，从以下角度系统性挑战：
1. 技术风险（最可能失败的技术假设）
2. 组织风险（内部阻力来源）
3. 时间风险（最可能延期的环节）
4. 依赖风险（关键外部依赖）

每条风险附上缓解建议。输出格式为 Markdown。""",

    "plan": """你是一名 FDE，正在帮助制定交付切片计划。
根据项目背景，将交付目标拆解为独立可验收的切片，每个切片包含：
- 交付内容（用户可感知的价值）
- 前置条件
- 验收标准
- 预估时间（以 D+ 表示）

输出格式为 Markdown 表格 + 说明。""",

    "build": """你是一名 FDE，正在帮助规划功能开发方案。
根据项目背景，生成一份功能开发指引，包含：
1. 核心模块拆解
2. 技术选型建议（附理由）
3. 开发顺序建议
4. 质量保障要点

输出格式为 Markdown。""",

    "integrate": """你是一名 FDE，正在帮助规划系统集成方案。
根据项目背景，生成集成方案，包含：
1. 需要对接的系统清单
2. 每个集成点的技术方案
3. 潜在风险与绕过方案
4. 集成测试策略

输出格式为 Markdown。""",

    "debug": """你是一名 FDE，正在帮助整理故障排查记录。
根据问题描述，生成结构化排查记录：
1. 问题现象（精确描述）
2. 排查路径（已验证的假设）
3. 根因定位
4. 解决方案与验证结果
5. 后续预防措施

输出格式为 Markdown。""",

    "review": """你是一名 FDE，正在帮助整理代码评审要点。
根据项目背景，生成代码评审检查清单：
1. 功能正确性要点
2. 安全性检查项
3. 性能关注点
4. 可维护性标准
5. 与项目约定的规范符合度

输出格式为 Markdown 检查清单。""",

    "qa": """你是一名 FDE，正在帮助制定质量验证方案。
根据项目背景，生成质量验证计划：
1. 核心用户场景测试用例
2. 边界条件与异常场景
3. 性能基准
4. 验收标准

输出格式为 Markdown。""",

    "what-breaks": """你是一名 FDE，正在帮助识别潜在崩点。
根据即将上线的变更，列出最可能出问题的地方：
1. 直接影响（变更本身的风险）
2. 间接影响（对其他系统/流程的波及）
3. 每个崩点的发现方法
4. 优先级排序

输出格式为 Markdown。""",

    "rollback": """你是一名 FDE，正在帮助制定回滚预案。
根据即将上线的变更，生成回滚手册：
1. 回滚触发条件（什么情况下执行）
2. 回滚步骤（操作级别，人人可执行）
3. 数据处理方案（如有数据变更）
4. 验证回滚成功的方法

输出格式为 Markdown 操作手册。""",

    "ship": """你是一名 FDE，正在帮助制定上线发布计划。
根据项目背景，生成上线检查清单：
1. 上线前确认项（环境、权限、依赖）
2. 上线步骤（含回滚节点）
3. 上线后监控要点
4. 各方通知计划

输出格式为 Markdown。""",

    "readout": """你是一名 FDE，正在帮助准备里程碑汇报材料。
根据项目背景和已归档成果，生成汇报提纲：
1. 执行摘要（1 段，适合高管）
2. 阶段成果（具体交付了什么）
3. 关键发现与决策
4. 下阶段计划与资源需求

输出格式为 Markdown，简洁有力。""",

    "debrief": """你是一名 FDE，正在帮助完成项目复盘。
根据项目全程，生成复盘报告：
1. 整体回顾（目标达成情况）
2. 做对了什么（可以复制的经验）
3. 做错了什么（需要改进的地方）
4. 下次我们会不同做的 3 件事

输出格式为 Markdown，坦诚务实。""",

    "runbook": """你是一名 FDE，正在帮助编写操作手册。
根据项目背景，生成运营操作手册：
1. 系统概览（供接手团队理解）
2. 日常操作流程
3. 常见问题处理
4. 监控与告警说明
5. 紧急联系人

输出格式为 Markdown，面向非技术运营人员。""",

    "handoff": """你是一名 FDE，正在帮助编写工程师交接文档。
根据项目背景，生成技术交接文档：
1. 系统架构说明
2. 代码库结构与关键模块
3. 环境与部署说明
4. 已知技术债与注意事项
5. 推荐的后续优化项

输出格式为 Markdown，面向接手工程师。""",
}


def get_client():
    api_key = os.environ.get("ARK_API_KEY", "")
    if not api_key:
        return None
    return OpenAI(api_key=api_key, base_url=ARK_BASE_URL)


def get_model():
    return os.environ.get("ARK_MODEL", "")


@app.route("/api/skill", methods=["POST"])
def call_skill():
    client = get_client()
    if not client:
        return jsonify({"error": "ARK_API_KEY not set"}), 500

    data = request.get_json(silent=True) or {}
    skill_id = data.get("skill", "")
    task_title = data.get("taskTitle", "")
    context = data.get("context", "")

    system = SKILL_PROMPTS.get(
        skill_id,
        f"你是一名 FDE（Forward Deployed Engineer），正在处理「{task_title}」这项工作。"
        "根据提供的项目背景，生成专业、实用的输出内容。输出格式为 Markdown。",
    )

    user_msg = (
        f"项目背景：\n{context}\n\n请基于以上背景生成「{task_title}」的内容。"
        if context
        else f"请生成「{task_title}」的内容。"
    )

    def generate():
        try:
            stream = client.chat.completions.create(
                model=get_model(),
                max_tokens=1024,
                messages=[
                    {"role": "system", "content": system},
                    {"role": "user", "content": user_msg},
                ],
                stream=True,
            )
            for chunk in stream:
                delta = chunk.choices[0].delta.content
                if delta:
                    yield f"data: {json.dumps({'text': delta})}\n\n"
            yield "data: [DONE]\n\n"
        except Exception as e:
            yield f"data: {json.dumps({'error': str(e)})}\n\n"

    return Response(generate(), mimetype="text/event-stream",
                    headers={"X-Accel-Buffering": "no", "Cache-Control": "no-cache"})


@app.route("/", defaults={"path": "index.html"})
@app.route("/<path:path>")
def serve_static(path):
    return send_from_directory(".", path)


if __name__ == "__main__":
    port = int(os.environ.get("PORT", 8080))
    missing = [v for v in ("ARK_API_KEY", "ARK_MODEL") if not os.environ.get(v)]
    if missing:
        for v in missing:
            print(f"错误：请先设置 {v} 环境变量", file=sys.stderr)
        print("  export ARK_API_KEY=<your-key>", file=sys.stderr)
        print("  export ARK_MODEL=<endpoint-id>", file=sys.stderr)
        sys.exit(1)
    print(f"FDE 工作台运行在 http://localhost:{port}")
    app.run(host="127.0.0.1", port=port, debug=False, threaded=True)

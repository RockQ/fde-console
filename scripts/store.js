const STORAGE_KEY = 'fde_workbench_v1';

const Store = (() => {
  let state = { projects: [], activeProjectId: null, activeView: 'project' };

  function load() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) state = JSON.parse(raw);
    } catch (e) { /* ignore corrupt data */ }
  }

  function save() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }

  function getState() { return state; }

  function getActiveProject() {
    return state.projects.find(p => p.id === state.activeProjectId) || null;
  }

  function setActiveProject(id) {
    state.activeProjectId = id;
    state.activeView = 'project';
    save();
  }

  function setActiveView(view) {
    // view: 'project' | 'kb'
    state.activeView = view;
    save();
  }

  function addProject(project) {
    state.projects.push(project);
    state.activeProjectId = project.id;
    save();
  }

  function updateProject(id, updates) {
    const idx = state.projects.findIndex(p => p.id === id);
    if (idx === -1) return false;
    state.projects[idx] = { ...state.projects[idx], ...updates };
    save();
    return true;
  }

  function updateTask(projectId, stageId, taskId, updates) {
    const project = state.projects.find(p => p.id === projectId);
    if (!project) return false;
    const stage = project.stages.find(s => s.id === stageId);
    if (!stage) return false;
    const task = stage.tasks.find(t => t.id === taskId);
    if (!task) return false;
    Object.assign(task, updates);
    // After archiving a task, unlock the next one
    if (updates.status === 'archived') {
      const taskIdx = stage.tasks.indexOf(task);
      const next = stage.tasks[taskIdx + 1];
      if (next && next.status === 'locked') next.status = 'active';
      // Check if all tasks done → unlock next stage
      const allDone = stage.tasks.every(t => t.status === 'archived');
      if (allDone) {
        const stageIdx = project.stages.indexOf(stage);
        const nextStage = project.stages[stageIdx + 1];
        if (nextStage && nextStage.status === 'locked') {
          nextStage.status = 'active';
          if (nextStage.tasks && nextStage.tasks.length > 0) {
            nextStage.tasks[0].status = 'active';
          }
          project.currentStageId = nextStage.id;
        }
        stage.status = 'done';
      }
    }
    save();
    return true;
  }

  function addMilestone(projectId, milestone) {
    const project = state.projects.find(p => p.id === projectId);
    if (!project) return false;
    if (!project.milestones) project.milestones = [];
    project.milestones.push(milestone);
    save();
    return true;
  }

  function isEmpty() {
    return state.projects.length === 0;
  }

  return { load, save, getState, getActiveProject, setActiveProject, setActiveView,
           addProject, updateProject, updateTask, addMilestone, isEmpty };
})();

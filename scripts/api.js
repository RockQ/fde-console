const FDEApi = (() => {
  async function callSkill(skillId, taskTitle, context, onChunk, onDone, onError) {
    try {
      const response = await fetch('/api/skill', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ skill: skillId, taskTitle, context }),
      });

      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        onError(err.error || `HTTP ${response.status}`);
        return;
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop();
        for (const line of lines) {
          if (!line.startsWith('data: ')) continue;
          const data = line.slice(6).trim();
          if (data === '[DONE]') continue;
          try {
            const evt = JSON.parse(data);
            if (evt.error) { onError(evt.error); return; }
            if (evt.text) onChunk(evt.text);
          } catch (_) {}
        }
      }
      onDone();
    } catch (err) {
      onError(err.message || '网络错误');
    }
  }

  return { callSkill };
})();

document.addEventListener('DOMContentLoaded', function() {
  // 加载保存的设置
  chrome.storage.sync.get(
    {
      apiKey: '',
      systemPrompt: 'You are a helpful assistant.',
      model: 'deepseek-ai/DeepSeek-V3',
      temperature: 0.7,
      maxTokens: 1024
    }, 
    function(items) {
      document.getElementById('apiKey').value = items.apiKey;
      document.getElementById('systemPrompt').value = items.systemPrompt;
      document.getElementById('model').value = items.model;
      document.getElementById('temperature').value = items.temperature;
      document.getElementById('temperatureValue').textContent = items.temperature;
      document.getElementById('maxTokens').value = items.maxTokens;
    }
  );

  // 保存 API Key
  document.getElementById('saveApiKey').addEventListener('click', function() {
    const apiKey = document.getElementById('apiKey').value;
    chrome.storage.sync.set({ apiKey: apiKey }, function() {
      alert('API Key 已保存！');
    });
  });

  // 更新温度值显示
  document.getElementById('temperature').addEventListener('input', function() {
    document.getElementById('temperatureValue').textContent = this.value;
  });

  // 保存所有设置
  document.getElementById('saveSettings').addEventListener('click', function() {
    const settings = {
      apiKey: document.getElementById('apiKey').value,
      systemPrompt: document.getElementById('systemPrompt').value,
      model: document.getElementById('model').value,
      temperature: parseFloat(document.getElementById('temperature').value),
      maxTokens: parseInt(document.getElementById('maxTokens').value)
    };

    chrome.storage.sync.set(settings, function() {
      alert('设置已保存！');
    });
  });
});
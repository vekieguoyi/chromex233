// 创建右键菜单
chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "analyzeSiliconFlow",
    title: "使用硅基流动分析选中内容",
    contexts: ["selection"]
  });
});

// 处理右键菜单点击
chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === "analyzeSiliconFlow") {
    chrome.tabs.sendMessage(tab.id, { action: "getSelection" });
  }
});

// 监听来自内容脚本的消息
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "analyzeText") {
    analyzeWithSiliconFlow(request.text, sender.tab.id);
  }
  return true;
});

// 使用硅基流动 API 分析文本
async function analyzeWithSiliconFlow(text, tabId) {
  try {
    // 获取保存的设置
    const settings = await chrome.storage.sync.get({
      apiKey: '',
      systemPrompt: 'You are a helpful assistant.',
      model: 'deepseek-ai/DeepSeek-V3',
      temperature: 0.7,
      maxTokens: 1024
    });

    if (!settings.apiKey) {
      chrome.tabs.sendMessage(tabId, { 
        action: "showResult", 
        success: false, 
        message: "请先在扩展设置中配置 API Key" 
      });
      return;
    }

    // 发送请求到硅基流动 API
    const response = await fetch("https://api.siliconflow.cn/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${settings.apiKey}`
      },
      body: JSON.stringify({
        model: settings.model,
        messages: [
          { role: "system", content: settings.systemPrompt },
          { role: "user", content: text }
        ],
        temperature: settings.temperature,
        max_tokens: settings.maxTokens
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`API 错误: ${errorData.error?.message || response.statusText}`);
    }

    const data = await response.json();
    const result = data.choices[0].message.content;

    // 将结果发送回内容脚本
    chrome.tabs.sendMessage(tabId, { 
      action: "showResult", 
      success: true, 
      result: result 
    });
  } catch (error) {
    console.error("分析错误:", error);
    chrome.tabs.sendMessage(tabId, { 
      action: "showResult", 
      success: false, 
      message: `错误: ${error.message}` 
    });
  }
}
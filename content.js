// 监听来自后台脚本的消息
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "getSelection") {
    const selectedText = window.getSelection().toString().trim();
    if (selectedText) {
      chrome.runtime.sendMessage({
        action: "analyzeText",
        text: selectedText
      });
    }
  } else if (request.action === "showResult") {
    showResultModal(request);
  }
  return true;
});

// 创建并显示结果模态框
function showResultModal(data) {
  // 移除已存在的模态框
  const existingModal = document.getElementById('silicon-flow-result-modal');
  if (existingModal) {
    existingModal.remove();
  }

  // 创建模态框
  const modal = document.createElement('div');
  modal.id = 'silicon-flow-result-modal';
  modal.style.cssText = `
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 80%;
    max-width: 800px;
    max-height: 80vh;
    background-color: white;
    border-radius: 8px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
    z-index: 10000;
    display: flex;
    flex-direction: column;
    overflow: hidden;
  `;

  // 创建标题栏
  const header = document.createElement('div');
  header.style.cssText = `
    padding: 15px;
    background-color: #4285f4;
    color: white;
    font-weight: bold;
    display: flex;
    justify-content: space-between;
    align-items: center;
  `;
  header.textContent = '硅基流动分析结果';

  // 创建关闭按钮
  const closeButton = document.createElement('button');
  closeButton.textContent = '×';
  closeButton.style.cssText = `
    background: none;
    border: none;
    color: white;
    font-size: 24px;
    cursor: pointer;
    padding: 0;
    line-height: 1;
  `;
  closeButton.onclick = () => modal.remove();
  header.appendChild(closeButton);

  // 创建内容区域
  const content = document.createElement('div');
  content.style.cssText = `
    padding: 20px;
    overflow-y: auto;
    flex-grow: 1;
    line-height: 1.5;
  `;

  if (data.success) {
    // 将结果文本转换为 HTML（支持简单的 Markdown 格式）
    const resultText = data.result
      .replace(/\n\n/g, '<br><br>')
      .replace(/\n/g, '<br>')
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>');
    
    content.innerHTML = resultText;
  } else {
    content.innerHTML = `<div style="color: red;">${data.message}</div>`;
  }

  // 创建底部按钮区域
  const footer = document.createElement('div');
  footer.style.cssText = `
    padding: 15px;
    border-top: 1px solid #eee;
    display: flex;
    justify-content: flex-end;
  `;

  // 创建复制按钮
  const copyButton = document.createElement('button');
  copyButton.textContent = '复制结果';
  copyButton.style.cssText = `
    background-color: #4285f4;
    color: white;
    border: none;
    padding: 8px 15px;
    border-radius: 4px;
    cursor: pointer;
  `;
  copyButton.onclick = () => {
    if (data.success) {
      navigator.clipboard.writeText(data.result)
        .then(() => {
          copyButton.textContent = '已复制';
          setTimeout(() => {
            copyButton.textContent = '复制结果';
          }, 2000);
        })
        .catch(err => {
          console.error('复制失败:', err);
        });
    }
  };
  
  if (data.success) {
    footer.appendChild(copyButton);
  }

  // 组装模态框
  modal.appendChild(header);
  modal.appendChild(content);
  modal.appendChild(footer);

  // 添加遮罩层
  const overlay = document.createElement('div');
  overlay.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.5);
    z-index: 9999;
  `;
  overlay.onclick = () => {
    modal.remove();
    overlay.remove();
  };

  // 添加到页面
  document.body.appendChild(overlay);
  document.body.appendChild(modal);

  // 添加键盘事件监听器，按 ESC 关闭模态框
  const escHandler = (e) => {
    if (e.key === 'Escape') {
      modal.remove();
      overlay.remove();
      document.removeEventListener('keydown', escHandler);
    }
  };
  document.addEventListener('keydown', escHandler);
}

// 添加快捷键支持 (Ctrl+Shift+S)
document.addEventListener('keydown', (e) => {
  if (e.ctrlKey && e.shiftKey && e.key === 'S') {
    e.preventDefault();
    const selectedText = window.getSelection().toString().trim();
    if (selectedText) {
      chrome.runtime.sendMessage({
        action: "analyzeText",
        text: selectedText
      });
    }
  }
});
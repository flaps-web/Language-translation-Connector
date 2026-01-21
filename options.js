const DEFAULTS = {
    fetchAddress: "http://localhost:1234/v1/chat/completions",
    apiKey: "",
    modelName: "gemma-transrate@q8_0",
    temperature: 0.0,
    maxTokens: 512,
    selectMinTextLength: 5
};

// 設定の読み込み
function restoreOptions() {
    chrome.storage.sync.get(DEFAULTS, (items) => {
        document.getElementById('fetchAddress').value = items.fetchAddress;
        document.getElementById('apiKey').value = items.apiKey;
        document.getElementById('modelName').value = items.modelName;
        document.getElementById('temperature').value = items.temperature;
        document.getElementById('maxTokens').value = items.maxTokens;
        document.getElementById('selectMinTextLength').value = items.selectMinTextLength;
    });
}

// 設定の保存
function saveOptions() {
    const settings = {
        fetchAddress: document.getElementById('fetchAddress').value,
        apiKey: document.getElementById('apiKey').value,
        modelName: document.getElementById('modelName').value,
        temperature: parseFloat(document.getElementById('temperature').value),
        maxTokens: parseInt(document.getElementById('maxTokens').value),
        selectMinTextLength: parseInt(document.getElementById('selectMinTextLength').value)
    };

    chrome.storage.sync.set(settings, () => {
        showStatus("Settings Saved!");
    });
}

// デフォルトに戻す
function resetToDefaults() {
    if (confirm("すべての設定をデフォルトに戻しますか？")) {
        chrome.storage.sync.set(DEFAULTS, () => {
            restoreOptions();
            showStatus("Reset to Defaults!");
        });
    }
}

// ステータスメッセージの表示
function showStatus(message) {
    const status = document.getElementById('status');
    status.textContent = message;
    status.classList.add('show');
    setTimeout(() => {
        status.classList.remove('show');
    }, 2500);
}

document.addEventListener('DOMContentLoaded', restoreOptions);
document.getElementById('save').addEventListener('click', saveOptions);
document.getElementById('reset').addEventListener('click', resetToDefaults);

// LED 控制函數
async function controlLED(action) {
    try {
        const response = await fetch(`/api/led/${action}`, {
            method: 'POST'
        });
        
        const data = await response.json();
        
        if (data.status === 'success') {
            updateLEDStatus(data.led_state);
            showNotification(data.message, 'success');
            updateSystemStatus();
        } else {
            showNotification('操作失敗', 'error');
        }
    } catch (error) {
        console.error('Error:', error);
        showNotification('網路錯誤', 'error');
    }
}

// 更新 LED 狀態顯示
function updateLEDStatus(state) {
    const ledStateElement = document.getElementById('ledState');
    const ledStatusElement = document.querySelector('.led-status');
    
    if (state) {
        ledStateElement.textContent = '開啟';
        ledStatusElement.textContent = 'LED 狀態: 開啟';
        ledStatusElement.className = 'led-status green';
    } else {
        ledStateElement.textContent = '關閉';
        ledStatusElement.textContent = 'LED 狀態: 關閉';
        ledStatusElement.className = 'led-status red';
    }
}

// 更新系統狀態
async function updateSystemStatus() {
    try {
        const response = await fetch('/api/status');
        const data = await response.json();
        
        if (data.status === 'success') {
            document.getElementById('systemStatus').innerHTML = `
                <p>LED 狀態: ${data.led_state ? '開啟' : '關閉'}</p>
                <p>可用記憶體: ${data.free_heap} bytes</p>
                <p>Wi-Fi 訊號: ${data.wifi_rssi} dBm</p>
            `;
        }
    } catch (error) {
        console.error('Error updating system status:', error);
    }
}

// 顯示通知
function showNotification(message, type) {
    // 這裡可以加入 toast 通知的實作
    console.log(`${type}: ${message}`);
}

// 定期更新系統狀態
setInterval(updateSystemStatus, 5000);

// 頁面載入完成後初始化
document.addEventListener('DOMContentLoaded', function() {
    updateSystemStatus();
});
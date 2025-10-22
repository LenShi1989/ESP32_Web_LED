// LED 控制函數
async function controlLED(action) {
    try {
        const response = await fetch(`/api/led/${action}`, {
            method: 'POST'
        });
        
        const data = await response.json();
        
        if (data.status === 'success') {
            updateLEDStatus(data.led_state);
            updateBulbStatus(); // 更新燈泡顯示
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

// 更新燈泡狀態顯示
async function updateBulbStatus() {
    try {
        const response = await fetch('/api/bulb/status');
        const data = await response.json();
        
        if (data.status === 'success') {
            const bulb = document.getElementById('bulb');
            const filament = document.getElementById('filament');
            const bulbStatus = document.getElementById('bulbStatus');
            
            // 更新燈泡類別
            bulb.className = `bulb ${data.bulb_glow}`;
            filament.className = `filament ${data.bulb_glow}`;
            
            // 更新狀態文字
            bulbStatus.textContent = data.status_text;
            
            // 添加過渡效果
            bulb.style.transition = 'all 0.5s ease';
            filament.style.transition = 'all 0.5s ease';
        }
    } catch (error) {
        console.error('Error updating bulb status:', error);
    }
}

// 更新 LED 狀態顯示
function updateLEDStatus(state) {
    const ledStateElement = document.getElementById('ledState');
    const ledStatusElement = document.querySelector('.led-status');
    
    if (state) {
        ledStateElement.textContent = '開啟';
        ledStatusElement.textContent = 'GPIO 2 狀態: 開啟';
        ledStatusElement.className = 'led-status green';
    } else {
        ledStateElement.textContent = '關閉';
        ledStatusElement.textContent = 'GPIO 2 狀態: 關閉';
        ledStatusElement.className = 'led-status red';
    }
}

// 顯示通知
function showNotification(message, type) {
    // 創建通知元素
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <span class="notification-icon">${type === 'success' ? '✅' : '❌'}</span>
        <span class="notification-text">${message}</span>
    `;
    
    // 添加到頁面
    document.body.appendChild(notification);
    
    // 顯示動畫
    setTimeout(() => {
        notification.classList.add('show');
    }, 100);
    
    // 自動移除
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, 3000);
}

// 定期更新系統狀態和燈泡狀態
setInterval(() => {
    updateSystemStatus();
    updateBulbStatus();
}, 5000);

// 頁面載入完成後初始化
document.addEventListener('DOMContentLoaded', function() {
    updateSystemStatus();
    updateBulbStatus();
    
    // 添加燈泡點擊切換功能
    const bulb = document.getElementById('bulb');
    bulb.addEventListener('click', function() {
        controlLED('toggle');
    });
});





//-----------------------------------------

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

/*
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
*/
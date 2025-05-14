import Taro from '@tarojs/taro'

// 请求频率控制
const requestQueue = new Map();
const RATE_LIMIT = 1000; // 1秒内最多请求次数
const RATE_WINDOW = 60000; // 时间窗口（毫秒）

// 清理过期的请求记录
const cleanupQueue = () => {
    const now = Date.now();
    for (const [key, value] of requestQueue.entries()) {
        if (now - value.timestamp > RATE_WINDOW) {
            requestQueue.delete(key);
        }
    }
};

// 检查请求频率
const checkRateLimit = (url) => {
    cleanupQueue();
    const now = Date.now();
    const key = `${url}_${now}`;

    if (!requestQueue.has(key)) {
        requestQueue.set(key, {
            count: 1,
            timestamp: now
        });
        return true;
    }

    const record = requestQueue.get(key);
    if (now - record.timestamp > RATE_WINDOW) {
        requestQueue.set(key, {
            count: 1,
            timestamp: now
        });
        return true;
    }

    if (record.count >= RATE_LIMIT) {
        return false;
    }

    record.count++;
    return true;
};

// 封装请求方法
export const request = async (options) => {
    const { url, method = 'GET', data, header = {} } = options;

    // 检查请求频率
    if (!checkRateLimit(url)) {
        Taro.showToast({
            title: '请求过于频繁，请稍后再试',
            icon: 'none'
        });
        throw new Error('请求频率超限');
    }

    // 添加防爬虫请求头
    const headers = {
        ...header,
        'X-Client-Version': '1.0.0',
        'X-Platform': 'h5',
        'X-Request-Time': Date.now().toString(),
        'X-Client-Type': 'browser'
    };

    try {
        const response = await Taro.request({
            url,
            method,
            data,
            header: headers
        });

        return response;
    } catch (error) {
        console.error('请求失败:', error);
        throw error;
    }
}; 
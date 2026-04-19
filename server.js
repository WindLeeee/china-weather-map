/**
 * weather-map-server.js
 * 
 * 功能：
 * 1. 静态文件服务（index.html）
 * 2. 天气数据聚合 API（代理 Open-Meteo，避免 CORS）
 * 3. 服务端缓存（30分钟有效期，减少 API 调用 + 提升响应速度）
 * 
 * 启动：node server.js
 * 访问：http://localhost:3000
 */

const http = require('http');
const fs = require('fs');
const path = require('path');

// ============================================================
// 配置
// ============================================================
const PORT = process.env.PORT || 3000;
const CACHE_TTL = 30 * 60 * 1000; // 30分钟缓存
const OPEN_METEO_BASE = 'https://api.open-meteo.com/v1/forecast';
const BATCH_SIZE = 20;             // 每批并发请求数
const MAX_RETRIES = 2;             // 失败重试次数

// ============================================================
// 城市列表（和前端保持一致）
// ============================================================
const CITIES = [
    { name: '北京', lat: 39.9042, lon: 116.4074 },
    { name: '天津', lat: 39.3434, lon: 117.3616 },
    { name: '石家庄', lat: 38.0428, lon: 114.5149 },
    { name: '太原', lat: 37.8706, lon: 112.5489 },
    { name: '呼和浩特', lat: 40.8424, lon: 111.7492 },
    { name: '大同', lat: 40.0765, lon: 113.2991 },
    { name: '承德', lat: 40.9513, lon: 117.9630 },
    { name: '沈阳', lat: 41.8057, lon: 123.4328 },
    { name: '大连', lat: 38.9140, lon: 121.6147 },
    { name: '丹东', lat: 40.1290, lon: 124.3944 },
    { name: '长春', lat: 43.8171, lon: 125.3235 },
    { name: '吉林', lat: 43.8377, lon: 126.5494 },
    { name: '哈尔滨', lat: 45.8038, lon: 126.5340 },
    { name: '齐齐哈尔', lat: 47.3543, lon: 123.9180 },
    { name: '牡丹江', lat: 44.5512, lon: 129.6329 },
    { name: '漠河', lat: 52.9727, lon: 122.5386 },
    { name: '绥芬河', lat: 44.4116, lon: 131.1593 },
    { name: '上海', lat: 31.2304, lon: 121.4737 },
    { name: '南京', lat: 32.0603, lon: 118.7969 },
    { name: '苏州', lat: 31.2989, lon: 120.5853 },
    { name: '扬州', lat: 32.3932, lon: 119.4126 },
    { name: '无锡', lat: 31.4912, lon: 120.3119 },
    { name: '常州', lat: 31.7728, lon: 119.9461 },
    { name: '徐州', lat: 34.2044, lon: 117.2857 },
    { name: '南通', lat: 31.9807, lon: 120.8942 },
    { name: '连云港', lat: 34.5967, lon: 119.2216 },
    { name: '盐城', lat: 33.3477, lon: 120.1630 },
    { name: '杭州', lat: 30.2741, lon: 120.1551 },
    { name: '宁波', lat: 29.8683, lon: 121.5440 },
    { name: '温州', lat: 28.0006, lon: 120.6994 },
    { name: '绍兴', lat: 30.0302, lon: 120.5801 },
    { name: '嘉兴', lat: 30.7522, lon: 120.7551 },
    { name: '金华', lat: 29.0789, lon: 119.6478 },
    { name: '台州', lat: 28.6565, lon: 121.4209 },
    { name: '舟山', lat: 29.9853, lon: 122.1071 },
    { name: '千岛湖', lat: 29.6087, lon: 119.0266 },
    { name: '黄山', lat: 29.7147, lon: 118.3376 },
    { name: '合肥', lat: 31.8206, lon: 117.2272 },
    { name: '芜湖', lat: 31.3529, lon: 118.4339 },
    { name: '安庆', lat: 30.5439, lon: 117.0631 },
    { name: '蚌埠', lat: 32.9169, lon: 117.3888 },
    { name: '福州', lat: 26.0745, lon: 119.2965 },
    { name: '厦门', lat: 24.4798, lon: 118.0894 },
    { name: '泉州', lat: 24.8741, lon: 118.6758 },
    { name: '漳州', lat: 24.5093, lon: 117.6470 },
    { name: '平潭', lat: 25.4977, lon: 119.7893 },
    { name: '武夷山', lat: 27.7541, lon: 117.9419 },
    { name: '南昌', lat: 28.6829, lon: 115.8579 },
    { name: '赣州', lat: 25.8289, lon: 114.9332 },
    { name: '九江', lat: 29.7050, lon: 116.0018 },
    { name: '景德镇', lat: 29.2688, lon: 117.1786 },
    { name: '庐山', lat: 29.5296, lon: 115.9629 },
    { name: '济南', lat: 36.6512, lon: 117.1205 },
    { name: '青岛', lat: 36.0671, lon: 120.3826 },
    { name: '烟台', lat: 37.4639, lon: 121.4479 },
    { name: '威海', lat: 37.5133, lon: 122.1205 },
    { name: '潍坊', lat: 36.7068, lon: 119.1619 },
    { name: '淄博', lat: 36.8132, lon: 118.0548 },
    { name: '临沂', lat: 35.1041, lon: 118.3566 },
    { name: '济宁', lat: 35.4147, lon: 116.5871 },
    { name: '泰安', lat: 36.1949, lon: 117.0892 },
    { name: '武汉', lat: 30.5928, lon: 114.3055 },
    { name: '襄阳', lat: 32.0091, lon: 112.1226 },
    { name: '宜昌', lat: 30.6918, lon: 111.2868 },
    { name: '恩施', lat: 30.2722, lon: 109.4881 },
    { name: '神农架', lat: 31.7446, lon: 110.6758 },
    { name: '长沙', lat: 28.2282, lon: 112.9388 },
    { name: '张家界', lat: 29.1170, lon: 110.4792 },
    { name: '岳阳', lat: 29.3570, lon: 113.1286 },
    { name: '衡阳', lat: 26.8930, lon: 112.5719 },
    { name: '株洲', lat: 27.8407, lon: 113.1340 },
    { name: '凤凰古城', lat: 27.9476, lon: 109.5997 },
    { name: '郑州', lat: 34.7466, lon: 113.6253 },
    { name: '洛阳', lat: 34.6197, lon: 112.4540 },
    { name: '开封', lat: 34.7971, lon: 114.3074 },
    { name: '南阳', lat: 33.0004, lon: 112.5283 },
    { name: '安阳', lat: 36.0976, lon: 114.3932 },
    { name: '广州', lat: 23.1291, lon: 113.2644 },
    { name: '深圳', lat: 22.5431, lon: 114.0579 },
    { name: '东莞', lat: 23.0430, lon: 113.7633 },
    { name: '佛山', lat: 23.0218, lon: 113.1220 },
    { name: '珠海', lat: 22.2711, lon: 113.5767 },
    { name: '中山', lat: 22.5176, lon: 113.3926 },
    { name: '汕头', lat: 23.3541, lon: 116.6820 },
    { name: '湛江', lat: 21.2707, lon: 110.3594 },
    { name: '惠州', lat: 23.1115, lon: 114.4152 },
    { name: '江门', lat: 22.5789, lon: 113.0815 },
    { name: '潮州', lat: 23.6567, lon: 116.6223 },
    { name: '清远', lat: 23.6820, lon: 113.0510 },
    { name: '韶关', lat: 24.8108, lon: 113.5974 },
    { name: '肇庆', lat: 23.0469, lon: 112.4654 },
    { name: '阳江', lat: 21.8579, lon: 111.9825 },
    { name: '南宁', lat: 22.8170, lon: 108.3665 },
    { name: '桂林', lat: 25.2736, lon: 110.2900 },
    { name: '柳州', lat: 24.3263, lon: 109.4286 },
    { name: '北海', lat: 21.4734, lon: 109.1192 },
    { name: '防城港', lat: 21.6175, lon: 108.3540 },
    { name: '百色', lat: 23.9027, lon: 106.6181 },
    { name: '梧州', lat: 23.4769, lon: 111.2791 },
    { name: '崇左', lat: 22.4040, lon: 107.3646 },
    { name: '贺州', lat: 24.4034, lon: 111.5669 },
    { name: '河池', lat: 24.6928, lon: 108.0853 },
    { name: '海口', lat: 20.0174, lon: 110.3492 },
    { name: '三亚', lat: 18.2528, lon: 109.5119 },
    { name: '三沙', lat: 16.8331, lon: 112.3333 },
    { name: '文昌', lat: 19.5431, lon: 110.7542 },
    { name: '万宁', lat: 18.7959, lon: 110.3890 },
    { name: '儋州', lat: 19.5174, lon: 109.5809 },
    { name: '陵水', lat: 18.5076, lon: 110.0343 },
    { name: '乐东', lat: 18.7499, lon: 109.1739 },
    { name: '重庆', lat: 29.4316, lon: 106.9123 },
    { name: '成都', lat: 30.5728, lon: 104.0668 },
    { name: '绵阳', lat: 31.4675, lon: 104.6796 },
    { name: '宜宾', lat: 28.7518, lon: 104.6417 },
    { name: '泸州', lat: 28.8717, lon: 105.4423 },
    { name: '乐山', lat: 29.5521, lon: 103.7657 },
    { name: '眉山', lat: 30.0493, lon: 103.8484 },
    { name: '九寨沟', lat: 33.2549, lon: 103.9125 },
    { name: '稻城', lat: 28.9068, lon: 100.2971 },
    { name: '康定', lat: 30.0489, lon: 101.9649 },
    { name: '西昌', lat: 27.8817, lon: 102.2637 },
    { name: '贵阳', lat: 26.6470, lon: 106.6302 },
    { name: '遵义', lat: 27.7256, lon: 106.9272 },
    { name: '安顺', lat: 26.2456, lon: 105.9475 },
    { name: '黔东南', lat: 26.5835, lon: 107.9827 },
    { name: '昆明', lat: 25.0406, lon: 102.7129 },
    { name: '大理', lat: 25.6065, lon: 100.2676 },
    { name: '丽江', lat: 26.8721, lon: 100.2288 },
    { name: '西双版纳', lat: 22.0076, lon: 100.7975 },
    { name: '香格里拉', lat: 27.8190, lon: 99.7063 },
    { name: '腾冲', lat: 25.0217, lon: 98.4887 },
    { name: '红河', lat: 23.3639, lon: 103.3745 },
    { name: '昭通', lat: 27.3431, lon: 103.7172 },
    { name: '拉萨', lat: 29.6500, lon: 91.1000 },
    { name: '林芝', lat: 29.6486, lon: 94.3624 },
    { name: '日喀则', lat: 29.2678, lon: 88.8848 },
    { name: '昌都', lat: 31.1369, lon: 97.1785 },
    { name: '那曲', lat: 31.4766, lon: 92.0517 },
    { name: '阿里', lat: 32.5000, lon: 80.1000 },
    { name: '西安', lat: 34.3416, lon: 108.9398 },
    { name: '宝鸡', lat: 34.3618, lon: 107.2372 },
    { name: '延安', lat: 36.5853, lon: 109.4897 },
    { name: '榆林', lat: 38.2852, lon: 109.7348 },
    { name: '汉中', lat: 33.0671, lon: 107.0230 },
    { name: '华山', lat: 34.4838, lon: 110.0925 },
    { name: '兰州', lat: 36.0611, lon: 103.8343 },
    { name: '天水', lat: 34.5809, lon: 105.7244 },
    { name: '张掖', lat: 38.9259, lon: 100.4491 },
    { name: '嘉峪关', lat: 39.7726, lon: 98.2891 },
    { name: '敦煌', lat: 40.1420, lon: 94.6618 },
    { name: '酒泉', lat: 39.7326, lon: 98.4943 },
    { name: '金昌', lat: 38.5205, lon: 102.1882 },
    { name: '甘南', lat: 34.9833, lon: 102.9110 },
    { name: '西宁', lat: 36.6171, lon: 101.7782 },
    { name: '青海湖', lat: 36.9569, lon: 100.1766 },
    { name: '格尔木', lat: 36.4064, lon: 94.9043 },
    { name: '银川', lat: 38.4872, lon: 106.2309 },
    { name: '中卫', lat: 37.5003, lon: 105.1896 },
    { name: '石嘴山', lat: 38.9841, lon: 106.3839 },
    { name: '乌鲁木齐', lat: 43.8256, lon: 87.6168 },
    { name: '克拉玛依', lat: 45.5798, lon: 84.8892 },
    { name: '库尔勒', lat: 41.7259, lon: 86.1746 },
    { name: '喀什', lat: 39.4677, lon: 75.9894 },
    { name: '哈密', lat: 42.8181, lon: 93.5153 },
    { name: '伊犁', lat: 43.9219, lon: 81.3240 },
    { name: '布尔津', lat: 47.6986, lon: 86.8694 },
    { name: '阿勒泰', lat: 47.8447, lon: 88.1396 },
    { name: '赛里木湖', lat: 44.5487, lon: 81.1195 },
    { name: '吐鲁番', lat: 42.9513, lon: 89.1895 },
    { name: '和田', lat: 37.1105, lon: 79.9250 },
    { name: '阿克苏', lat: 41.1673, lon: 80.2601 }
];

// ============================================================
// 服务端缓存
// ============================================================
const cache = {
    data: null,
    timestamp: 0
};

function isCacheValid() {
    return cache.data && (Date.now() - cache.timestamp) < CACHE_TTL;
}

// ============================================================
// HTTP 请求封装（带重试）
// ============================================================
function fetchWithRetry(url, retries = MAX_RETRIES) {
    return new Promise((resolve, reject) => {
        http.get(url, { headers: { 'User-Agent': 'weather-map-server/1.0' } }, (res) => {
            if (res.statusCode === 429) {
                // Rate limited - wait and retry
                if (retries > 0) {
                    setTimeout(() => {
                        fetchWithRetry(url, retries - 1).then(resolve).catch(reject);
                    }, 1000);
                } else {
                    reject(new Error('Rate limited'));
                }
                return;
            }
            if (res.statusCode !== 200) {
                reject(new Error(`HTTP ${res.statusCode}`));
                return;
            }
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                try { resolve(JSON.parse(data)); }
                catch (e) { reject(e); }
            });
        }).on('error', (e) => {
            if (retries > 0) {
                setTimeout(() => {
                    fetchWithRetry(url, retries - 1).then(resolve).catch(reject);
                }, 500);
            } else {
                reject(e);
            }
        });
    });
}

// ============================================================
// 分批并发请求
// ============================================================
async function fetchBatch(items, fn) {
    const results = [];
    for (let i = 0; i < items.length; i += BATCH_SIZE) {
        const batch = items.slice(i, i + BATCH_SIZE);
        const batchResults = await Promise.allSettled(batch.map(fn));
        results.push(...batchResults);
        process.stdout.write(`\r  [${'#'.repeat(Math.ceil((i + batch.length) / items.length * 30))}${' '.repeat(30 - Math.ceil((i + batch.length) / items.length * 30))}] ${i + batch.length}/${items.length}`);
    }
    console.log('');
    return results;
}

// ============================================================
// 获取单个城市天气
// ============================================================
async function fetchCityWeather(city) {
    const params = [
        'daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum,wind_speed_10m_max',
        'current=temperature_2m,weather_code,wind_speed_10m,relative_humidity_2m',
        'timezone=Asia%2FShanghai',
        'forecast_days=16'
    ].join('&');
    const url = `${OPEN_METEO_BASE}?latitude=${city.lat}&longitude=${city.lon}&${params}`;
    const data = await fetchWithRetry(url);
    return { name: city.name, lat: city.lat, lon: city.lon, ...data };
}

// ============================================================
// 获取全部城市天气（带缓存）
// ============================================================
async function fetchAllWeather() {
    if (isCacheValid()) {
        console.log('  [Cache hit] 返回缓存数据');
        return cache.data;
    }

    console.log(`  正在从 Open-Meteo 获取 ${CITIES.length} 个城市数据…`);
    const results = await fetchBatch(CITIES, fetchCityWeather);

    const data = {};
    results.forEach((result, i) => {
        if (result.status === 'fulfilled') {
            const city = CITIES[i];
            data[city.name] = result.value;
        } else {
            console.error(`  ✗ ${CITIES[i].name} 失败:`, result.reason.message);
        }
    });

    cache.data = data;
    cache.timestamp = Date.now();
    console.log(`  完成！成功 ${Object.keys(data).length}/${CITIES.length} 个城市`);
    return data;
}

// ============================================================
// 静态文件服务
// ============================================================
function serveStatic(res, filePath, contentType) {
    fs.readFile(filePath, (err, data) => {
        if (err) {
            res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
            res.end('文件未找到');
            return;
        }
        res.writeHead(200, {
            'Content-Type': contentType,
            'Cache-Control': 'public, max-age=300'
        });
        res.end(data);
    });
}

// ============================================================
// 主服务器
// ============================================================
const server = http.createServer(async (req, res) => {
    const url = req.url.split('?')[0];

    // CORS 头
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    if (req.method === 'OPTIONS') { res.writeHead(204); res.end(); return; }

    try {
        // API: 获取所有城市天气数据
        if (url === '/api/weather' || url === '/weather.json') {
            console.log(`[${new Date().toLocaleTimeString()}] /api/weather 请求`);
            const data = await fetchAllWeather();
            res.writeHead(200, {
                'Content-Type': 'application/json; charset=utf-8',
                'Cache-Control': 'public, max-age=60'
            });
            res.end(JSON.stringify(data));
            return;
        }

        // 主页
        if (url === '/' || url === '/index.html' || url === '/index.htm') {
            serveStatic(res, path.join(__dirname, 'index.html'), 'text/html; charset=utf-8');
            return;
        }

        // 其他静态资源
        const staticExts = {
            '.html': 'text/html; charset=utf-8',
            '.js': 'application/javascript',
            '.css': 'text/css',
            '.json': 'application/json',
            '.png': 'image/png',
            '.ico': 'image/x-icon'
        };
        const ext = path.extname(url).toLowerCase();
        if (staticExts[ext]) {
            serveStatic(res, path.join(__dirname, url), staticExts[ext]);
            return;
        }

        // 404
        res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
        res.end('404 Not Found');
    } catch (e) {
        console.error('服务器错误:', e);
        res.writeHead(500, { 'Content-Type': 'application/json; charset=utf-8' });
        res.end(JSON.stringify({ error: e.message }));
    }
});

server.listen(PORT, () => {
    console.log('='.repeat(50));
    console.log('  全国天气地图服务器');
    console.log('='.repeat(50));
    console.log(`  访问地址：http://localhost:${PORT}`);
    console.log(`  数据接口：http://localhost:${PORT}/api/weather`);
    console.log('');
    console.log('  提示：');
    console.log('  - 首次加载约需 30-60 秒（155 个城市并发请求）');
    console.log('  - 之后数据缓存 30 分钟，再次访问秒开');
    console.log('  - 若要局域网/外网访问，使用 IP:PORT 形式');
    console.log('');
    console.log('  如需部署到云服务器（让其他人也能用）：');
    console.log('  1. npm install');
    console.log('  2. npm start');
    console.log('  3. 配合 nginx 反向代理或部署到 Vercel/Railway 等');
    console.log('='.repeat(50));
});

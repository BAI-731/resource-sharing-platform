import React, { useState } from 'react';
import { Button } from '@/components/ui/Button';

export function TestLocation() {
  const [result, setResult] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const testAPI = async () => {
    setLoading(true);
    setResult('');

    const AMAP_KEY = import.meta.env.VITE_AMAP_KEY || 'af1a9391257bf08e0e650f5c5870d338';
    const AMAP_REVERSE_GEOCODING_URL = 'https://restapi.amap.com/v3/geocode/regeo';

    // 测试海南大学的坐标
    const lat = 20.0440;
    const lng = 110.3190;

    try {
      const url = `${AMAP_REVERSE_GEOCODING_URL}?key=${AMAP_KEY}&location=${lng},${lat}&extensions=base`;

      console.log('请求URL:', url);

      const response = await fetch(url);
      const data = await response.json();

      console.log('API响应:', data);

      setResult(JSON.stringify(data, null, 2));
    } catch (error) {
      console.error('API调用失败:', error);
      setResult(`错误: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">高德地图API测试</h1>

        <div className="bg-white rounded-lg p-6 shadow-sm">
          <Button onClick={testAPI} disabled={loading} className="mb-4">
            {loading ? '测试中...' : '测试高德地图API'}
          </Button>

          <div className="mt-4">
            <h2 className="text-lg font-semibold mb-2">测试结果:</h2>
            <pre className="bg-gray-100 p-4 rounded-lg overflow-auto max-h-96 text-xs">
              {result || '点击按钮开始测试'}
            </pre>
          </div>
        </div>

        <div className="mt-6 bg-blue-50 rounded-lg p-4">
          <h3 className="font-semibold mb-2">测试说明:</h3>
          <ul className="text-sm space-y-1">
            <li>• 测试坐标: 海南大学 (20.0440, 110.3190)</li>
            <li>• API密钥: {import.meta.env.VITE_AMAP_KEY || 'af1a9391257bf08e0e650f5c5870d338'}</li>
            <li>• API类型: Web服务</li>
            <li>• 期望结果: 返回海南大学的详细地址信息</li>
          </ul>
        </div>

        <div className="mt-4">
          <a
            href="https://restapi.amap.com/v3/geocode/regeo?key=af1a9391257bf08e0e650f5c5870d338&location=110.3190,20.0440&extensions=base"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:underline"
          >
            点击直接测试高德地图API (在新窗口打开)
          </a>
        </div>
      </div>
    </div>
  );
}

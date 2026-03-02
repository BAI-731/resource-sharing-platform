import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

export function TestClick() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <h1 className="text-2xl font-bold">点击测试页面</h1>

        {/* 测试 1: 原生 Link */}
        <div className="bg-white rounded-lg p-6 shadow-sm">
          <h2 className="text-lg font-semibold mb-4">测试 1: React Router Link</h2>
          <Link to="/" className="block p-4 bg-blue-50 rounded hover:bg-blue-100 mb-2">
            首页 (Link)
          </Link>
          <Link to="/items" className="block p-4 bg-green-50 rounded hover:bg-green-100 mb-2">
            闲置物品 (Link)
          </Link>
          <Link to="/skills" className="block p-4 bg-purple-50 rounded hover:bg-purple-100">
            技能服务 (Link)
          </Link>
        </div>

        {/* 测试 2: navigate 函数 */}
        <div className="bg-white rounded-lg p-6 shadow-sm">
          <h2 className="text-lg font-semibold mb-4">测试 2: navigate() 函数</h2>
          <div className="space-x-4">
            <button
              onClick={() => {
                console.log('Navigating to /items...');
                navigate('/items');
              }}
              className="px-6 py-3 bg-primary text-white rounded hover:bg-primary-dark"
            >
              导航到闲置物品
            </button>
            <button
              onClick={() => {
                console.log('Navigating to /skills...');
                navigate('/skills');
              }}
              className="px-6 py-3 bg-primary text-white rounded hover:bg-primary-dark"
            >
              导航到技能服务
            </button>
          </div>
        </div>

        {/* 测试 3: 原生链接 */}
        <div className="bg-white rounded-lg p-6 shadow-sm">
          <h2 className="text-lg font-semibold mb-4">测试 3: 原生 &lt;a&gt; 标签</h2>
          <a href="/" className="block p-4 bg-orange-50 rounded hover:bg-orange-100 mb-2">
            首页 (原生)
          </a>
          <a href="/items" className="block p-4 bg-yellow-50 rounded hover:bg-yellow-100 mb-2">
            闲置物品 (原生)
          </a>
          <a href="/skills" className="block p-4 bg-pink-50 rounded hover:bg-pink-100">
            技能服务 (原生)
          </a>
        </div>

        {/* 测试 4: window.location */}
        <div className="bg-white rounded-lg p-6 shadow-sm">
          <h2 className="text-lg font-semibold mb-4">测试 4: window.location.href</h2>
          <div className="space-x-4">
            <button
              onClick={() => {
                console.log('Using window.location.href to /items');
                window.location.href = '/items';
              }}
              className="px-6 py-3 bg-red-500 text-white rounded hover:bg-red-600"
            >
              window.location.href - 闲置物品
            </button>
            <button
              onClick={() => {
                console.log('Using window.location.href to /skills');
                window.location.href = '/skills';
              }}
              className="px-6 py-3 bg-red-500 text-white rounded hover:bg-red-600"
            >
              window.location.href - 技能服务
            </button>
          </div>
        </div>

        {/* 测试 5: 检查点击事件 */}
        <div className="bg-white rounded-lg p-6 shadow-sm">
          <h2 className="text-lg font-semibold mb-4">测试 5: 点击事件检查</h2>
          <button
            onClick={(e) => {
              console.log('Click event:', e);
              console.log('Target:', e.target);
              console.log('Current target:', e.currentTarget);
              console.log('Event phase:', e.eventPhase);
              alert('点击事件被触发！查看控制台获取详细信息');
            }}
            className="px-6 py-3 bg-indigo-500 text-white rounded hover:bg-indigo-600"
          >
            检查点击事件
          </button>
        </div>

        {/* 测试说明 */}
        <div className="bg-gray-50 rounded-lg p-6">
          <h2 className="text-lg font-semibold mb-4">测试说明</h2>
          <ul className="list-disc list-inside space-y-2 text-sm">
            <li>请依次测试上面的5种导航方式</li>
            <li>观察哪些方式需要点击两次才能跳转</li>
            <li>打开浏览器控制台(F12)查看是否有错误信息</li>
            <li>如果所有方式都需要点击两次，说明是更底层的路由问题</li>
            <li>如果只有某些方式有问题，说明是特定组件的问题</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

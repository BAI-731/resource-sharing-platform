import React from 'react';

export function SimpleTest() {
  return (
    <div style={{ padding: '20px' }}>
      <h1>最简单的测试页面</h1>
      <a href="/" style={{ display: 'block', padding: '20px', background: 'blue', color: 'white', marginBottom: '10px' }}>
        原生链接 - 首页
      </a>
      <button
        onClick={() => {
          alert('点击被触发！');
        }}
        style={{ padding: '20px', background: 'green', color: 'white' }}
      >
        测试按钮
      </button>
    </div>
  );
}

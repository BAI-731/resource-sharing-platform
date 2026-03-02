import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, Plus, Heart, Home, Package, Sparkles, ArrowRightLeft, Menu, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from './ui/Button';
import { useApp } from '@/context/AppContext';

export function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchValue, setSearchValue] = useState('');
  const navigate = useNavigate();
  const { state, dispatch } = useApp();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    dispatch({ type: 'SET_SEARCH_QUERY', payload: searchValue });
    navigate('/items');
  };

  const navLinks = [
    { to: '/', icon: Home, label: '首页' },
    { to: '/items', icon: Package, label: '闲置物品' },
    { to: '/exchange', icon: ArrowRightLeft, label: '以物易物' },
    { to: '/skills', icon: Sparkles, label: '技能服务' },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-to-br from-primary to-primary-light rounded-xl flex items-center justify-center shadow-lg">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold text-text-primary hidden sm:block">
              校园易物
            </span>
          </Link>

          {/* 搜索框 - 桌面端 */}
          <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-xl mx-8">
            <div className="relative w-full">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted" />
              <input
                type="text"
                placeholder="搜索闲置物品或技能服务..."
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-gray-50 rounded-full border-0 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
              />
            </div>
          </form>

          {/* 右侧操作 - 桌面端 */}
          <div className="hidden md:flex items-center gap-4">
            <Button
              variant="primary"
              onClick={() => navigate('/publish')}
              className="gap-2"
            >
              <Plus className="w-5 h-5" />
              发布闲置
            </Button>
            <button
              onClick={() => navigate('/favorites')}
              className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-primary/5 text-text-secondary hover:text-primary transition-colors"
            >
              <Heart className="w-5 h-5" />
              收藏
              {state.favorites.itemIds.length + state.favorites.skillIds.length > 0 && (
                <span className="ml-1 bg-primary text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {state.favorites.itemIds.length + state.favorites.skillIds.length}
                </span>
              )}
            </button>
          </div>

          {/* 移动端菜单按钮 */}
          <button
            className="md:hidden p-2 rounded-lg hover:bg-gray-100"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* 移动端菜单 */}
      <div
        className={cn(
          'md:hidden bg-white border-t absolute w-full shadow-lg transition-all duration-300',
          mobileMenuOpen ? 'opacity-100 visible' : 'opacity-0 invisible'
        )}
      >
        <div className="p-4 space-y-4">
          <form onSubmit={handleSearch}>
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted" />
              <input
                type="text"
                placeholder="搜索..."
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-gray-50 rounded-full border-0 focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
          </form>
          <div className="grid grid-cols-3 gap-2">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                onClick={() => setMobileMenuOpen(false)}
                className="flex flex-col items-center gap-1 p-3 rounded-xl hover:bg-primary/5 text-text-secondary hover:text-primary transition-colors"
              >
                <link.icon className="w-6 h-6" />
                <span className="text-xs">{link.label}</span>
              </Link>
            ))}
            <Link
              to="/publish"
              onClick={() => setMobileMenuOpen(false)}
              className="flex flex-col items-center gap-1 p-3 rounded-xl hover:bg-primary/5 text-primary"
            >
              <Plus className="w-6 h-6" />
              <span className="text-xs">发布</span>
            </Link>
            <Link
              to="/favorites"
              onClick={() => setMobileMenuOpen(false)}
              className="flex flex-col items-center gap-1 p-3 rounded-xl hover:bg-primary/5 text-text-secondary hover:text-primary transition-colors"
            >
              <Heart className="w-6 h-6" />
              <span className="text-xs">收藏</span>
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}

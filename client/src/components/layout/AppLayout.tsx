import React, { useState, useEffect, useRef } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { Search } from 'lucide-react';
import { fetchExceptions } from '../../services/api';
import type { GlobalExceptionItem } from '../../types';

export const AppLayout: React.FC = () => {
  const navigate = useNavigate();
  const searchInputRef = useRef<HTMLInputElement>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [openExceptionsCount, setOpenExceptionsCount] = useState<number>(0);

  // Fetch unread/open exception count for the nav badge
  const loadBadgeCount = async () => {
    try {
      const items: GlobalExceptionItem[] = await fetchExceptions();
      const unresolvedCount = items.filter(ex => ex.status !== 'RESOLVED').length;
      setOpenExceptionsCount(unresolvedCount);
    } catch {
      // ignore silently on nav badge poll
    }
  };

  useEffect(() => {
    loadBadgeCount();
    const interval = setInterval(loadBadgeCount, 15000);
    return () => clearInterval(interval);
  }, []);

  // Keyboard shortcut Ctrl+K / Cmd+K focus search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/samples?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <div className="app-shell">
      {/* Top Header Navigation */}
      <header className="top-nav">
        <div className="top-nav-left">
          <NavLink to="/dashboard" className="brand-mark">
            <div className="brand-icon-box">L</div>
            <span>LabFlow</span>
          </NavLink>

          <nav className="nav-links">
            <NavLink
              to="/dashboard"
              className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
            >
              Dashboard
            </NavLink>
            <NavLink
              to="/samples"
              className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
            >
              Samples
            </NavLink>
            <NavLink
              to="/exceptions"
              className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
            >
              <span>Exceptions</span>
              {openExceptionsCount > 0 && (
                <span className="nav-badge-count">{openExceptionsCount}</span>
              )}
            </NavLink>
          </nav>
        </div>

        <div className="top-nav-right">
          <form onSubmit={handleSearchSubmit} className="global-search-bar">
            <Search className="search-icon-svg" size={15} />
            <input
              ref={searchInputRef}
              type="text"
              className="global-search-input"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <span className="shortcut-hint">⌘K</span>
          </form>

          <div className="user-avatar" title="Tavish Modi">
            TM
          </div>
        </div>
      </header>

      {/* Main Page Area */}
      <main>
        <Outlet />
      </main>
    </div>
  );
};

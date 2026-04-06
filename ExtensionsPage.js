import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../context/AuthContext';
import { useAuth } from '../context/AuthContext';
import { PlusCircle, Download, Puzzle, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

const CATEGORY_ICONS = {
  snippet: '✂️', theme: '🎨', language: '🔤', debugger: '🐛',
  formatter: '🧹', linter: '🔍', keybinding: '⌨️', other: '🧩'
};

export default function DashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [recent, setRecent] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const [statsRes, extRes] = await Promise.all([
          api.get('/extensions/stats'),
          api.get('/extensions?limit=6')
        ]);
        setStats(statsRes.data.stats);
        setRecent(extRes.data.data);
      } catch {
        toast.error('Failed to load dashboard');
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh' }}>
      <div className="spinner" style={{ width: 36, height: 36 }} />
    </div>
  );

  return (
    <div>
      <div className="page-header flex justify-between items-center">
        <div>
          <h1 className="page-title">Hey, {user?.name?.split(' ')[0]} 👋</h1>
          <p className="page-sub">Here's an overview of your extension workspace</p>
        </div>
        <Link to="/extensions/new" className="btn btn-primary">
          <PlusCircle size={16} /> New Extension
        </Link>
      </div>

      {/* Stats */}
      <div className="stat-grid">
        <div className="stat-card">
          <div className="stat-label">Total Extensions</div>
          <div className="stat-value" style={{ color: 'var(--accent)' }}>{stats?.total ?? 0}</div>
          <div className="stat-sub">All time</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Ready</div>
          <div className="stat-value" style={{ color: 'var(--green)' }}>{stats?.ready ?? 0}</div>
          <div className="stat-sub">Available for download</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Total Downloads</div>
          <div className="stat-value" style={{ color: 'var(--purple)' }}>{stats?.totalDownloads ?? 0}</div>
          <div className="stat-sub">Across all extensions</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Failed</div>
          <div className="stat-value" style={{ color: stats?.failed > 0 ? 'var(--red)' : 'var(--text3)' }}>{stats?.failed ?? 0}</div>
          <div className="stat-sub">Generation errors</div>
        </div>
      </div>

      {/* Category breakdown */}
      {stats?.byCategory && Object.keys(stats.byCategory).length > 0 && (
        <div className="card mb-4" style={{ marginBottom: 20 }}>
          <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 14, color: 'var(--text2)' }}>BY CATEGORY</h3>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
            {Object.entries(stats.byCategory).map(([cat, count]) => (
              <div key={cat} style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: 8, padding: '8px 14px' }}>
                <span>{CATEGORY_ICONS[cat] || '🧩'}</span>
                <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)' }}>{cat}</span>
                <span style={{ fontSize: 12, fontFamily: 'var(--mono)', color: 'var(--accent)', background: 'var(--accent-glow)', padding: '1px 7px', borderRadius: 10 }}>{count}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent Extensions */}
      <div className="flex justify-between items-center mb-4" style={{ marginBottom: 14 }}>
        <h2 style={{ fontSize: 17, fontWeight: 800 }}>Recent Extensions</h2>
        <Link to="/extensions" className="btn btn-ghost btn-sm">View all →</Link>
      </div>

      {recent.length === 0 ? (
        <div className="empty-state card">
          <div className="empty-state-icon">🧩</div>
          <h3>No extensions yet</h3>
          <p>Generate your first VS Code extension from a text description in seconds.</p>
          <Link to="/extensions/new" className="btn btn-primary">
            <PlusCircle size={15} /> Create Extension
          </Link>
        </div>
      ) : (
        <div className="ext-grid">
          {recent.map(ext => (
            <Link to={`/extensions/${ext._id}`} key={ext._id} className="ext-card" style={{ textDecoration: 'none' }}>
              <div className="ext-card-header">
                <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start', flex: 1 }}>
                  <div className="ext-icon">{CATEGORY_ICONS[ext.category] || '🧩'}</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div className="ext-name">{ext.displayName}</div>
                    <span className="badge badge-category">{ext.category}</span>
                  </div>
                </div>
                <span className={`badge badge-${ext.status}`}>
                  {ext.status === 'ready' && <CheckCircle size={10} />}
                  {ext.status === 'failed' && <XCircle size={10} />}
                  {ext.status === 'generating' && <Loader2 size={10} />}
                  {ext.status}
                </span>
              </div>
              <div className="ext-desc">{ext.description}</div>
              <div className="ext-footer">
                <span className="ext-date">{new Date(ext.createdAt).toLocaleDateString()}</span>
                <div style={{ display: 'flex', gap: 6, alignItems: 'center', fontSize: 12, color: 'var(--text3)', fontFamily: 'var(--mono)' }}>
                  <Download size={12} /> {ext.downloadCount}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

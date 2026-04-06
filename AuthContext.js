import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { api } from '../context/AuthContext';
import { ArrowLeft, Download, Trash2, CheckCircle, XCircle, Loader2, Calendar, Tag, User } from 'lucide-react';
import toast from 'react-hot-toast';

const FILE_TABS = [
  { key: 'packageJson', label: 'package.json' },
  { key: 'extensionJs', label: 'extension.js' },
  { key: 'readmeMd', label: 'README.md' },
  { key: 'changelogMd', label: 'CHANGELOG.md' },
  { key: 'vscodeLaunchJson', label: '.vscode/launch.json' },
  { key: 'vscodeTasksJson', label: '.vscode/tasks.json' },
];

export default function ExtensionDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [ext, setExt] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('packageJson');
  const [deleting, setDeleting] = useState(false);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    const fetch = async () => {
      try {
        const { data } = await api.get(`/extensions/${id}`);
        setExt(data.data);
      } catch {
        toast.error('Extension not found');
        navigate('/extensions');
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [id, navigate]);

  const handleDownload = async () => {
    setDownloading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/extensions/${id}/download`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error();
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${ext.name}-vscode-extension.zip`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success('Download started!');
      setExt(e => ({ ...e, downloadCount: e.downloadCount + 1 }));
    } catch {
      toast.error('Download failed');
    } finally {
      setDownloading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Delete this extension permanently?')) return;
    setDeleting(true);
    try {
      await api.delete(`/extensions/${id}`);
      toast.success('Extension deleted');
      navigate('/extensions');
    } catch {
      toast.error('Delete failed');
      setDeleting(false);
    }
  };

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh' }}>
      <div className="spinner" style={{ width: 36, height: 36 }} />
    </div>
  );

  if (!ext) return null;

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: 8 }}>
        <Link to="/extensions" className="btn btn-ghost btn-sm" style={{ marginBottom: 12 }}>
          <ArrowLeft size={14} /> Back to Extensions
        </Link>
      </div>

      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16, marginBottom: 24, flexWrap: 'wrap' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
            <h1 style={{ fontSize: 28, fontWeight: 800 }}>{ext.displayName}</h1>
            <span className={`badge badge-${ext.status}`} style={{ fontSize: 12 }}>
              {ext.status === 'ready' && <CheckCircle size={11} />}
              {ext.status === 'failed' && <XCircle size={11} />}
              {ext.status === 'generating' && <Loader2 size={11} />}
              {ext.status}
            </span>
          </div>
          <p style={{ color: 'var(--text2)', fontSize: 14, maxWidth: 600 }}>{ext.description}</p>
        </div>
        <div style={{ display: 'flex', gap: 10, flexShrink: 0 }}>
          {ext.status === 'ready' && (
            <button className="btn btn-primary" onClick={handleDownload} disabled={downloading}>
              {downloading ? <span className="spinner" style={{ borderTopColor: 'white' }} /> : <Download size={16} />}
              {downloading ? 'Downloading...' : 'Download ZIP'}
            </button>
          )}
          <button className="btn btn-danger" onClick={handleDelete} disabled={deleting}>
            <Trash2 size={15} /> Delete
          </button>
        </div>
      </div>

      {/* Meta info */}
      <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', marginBottom: 24 }}>
        {[
          { icon: <User size={13} />, label: ext.publisher },
          { icon: <Tag size={13} />, label: `v${ext.version}` },
          { icon: <Calendar size={13} />, label: new Date(ext.createdAt).toLocaleDateString() },
          { icon: <Download size={13} />, label: `${ext.downloadCount} downloads` },
        ].map((m, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'var(--text3)', fontFamily: 'var(--mono)' }}>
            {m.icon} {m.label}
          </div>
        ))}
        <span className="badge badge-category">{ext.category}</span>
        {ext.tags?.map(t => <span key={t} className="tag">{t}</span>)}
      </div>

      {/* Prompt */}
      <div className="card" style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 11, fontFamily: 'var(--mono)', color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 }}>ORIGINAL PROMPT</div>
        <p style={{ fontSize: 14, color: 'var(--text2)', fontStyle: 'italic', lineHeight: 1.6 }}>"{ext.prompt}"</p>
      </div>

      {/* File Preview */}
      {ext.status === 'ready' && ext.files && (
        <div className="card">
          <h3 style={{ fontSize: 15, fontWeight: 800, marginBottom: 16 }}>Generated Files</h3>
          <div className="tabs">
            {FILE_TABS.map(tab => (
              <button
                key={tab.key}
                className={`tab-btn ${activeTab === tab.key ? 'active' : ''}`}
                onClick={() => setActiveTab(tab.key)}
              >
                {tab.label}
              </button>
            ))}
          </div>
          <div className="code-preview">
            {ext.files[activeTab] || '// No content generated for this file'}
          </div>
          <div style={{ marginTop: 12, fontSize: 12, color: 'var(--text3)', fontFamily: 'var(--mono)' }}>
            {FILE_TABS.find(t => t.key === activeTab)?.label} • {(ext.files[activeTab] || '').length.toLocaleString()} chars
          </div>
        </div>
      )}

      {ext.status === 'failed' && (
        <div className="card" style={{ borderColor: 'rgba(248,113,113,0.2)', background: 'rgba(248,113,113,0.05)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: 'var(--red)' }}>
            <XCircle size={20} />
            <div>
              <div style={{ fontWeight: 700, fontSize: 15 }}>Generation Failed</div>
              <div style={{ fontSize: 13, color: 'var(--text2)', marginTop: 4 }}>
                The extension could not be generated. Please try creating a new one.
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

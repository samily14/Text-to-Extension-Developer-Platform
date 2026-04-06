import { useState } from 'react';
import { useAuth, api } from '../context/AuthContext';
import { User, Calendar, Puzzle, Save } from 'lucide-react';
import toast from 'react-hot-toast';

export default function ProfilePage() {
  const { user, updateUser } = useAuth();
  const [name, setName] = useState(user?.name || '');
  const [loading, setLoading] = useState(false);

  const initials = user?.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || '?';

  const handleSave = async (e) => {
    e.preventDefault();
    if (!name.trim()) { toast.error('Name cannot be empty'); return; }
    setLoading(true);
    try {
      const { data } = await api.put('/auth/profile', { name });
      updateUser({ name: data.user.name });
      toast.success('Profile updated!');
    } catch {
      toast.error('Update failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 600 }}>
      <div className="page-header">
        <h1 className="page-title">Profile</h1>
        <p className="page-sub">Manage your account settings</p>
      </div>

      {/* Avatar */}
      <div className="card" style={{ marginBottom: 16, display: 'flex', alignItems: 'center', gap: 20 }}>
        <div style={{
          width: 72, height: 72,
          background: 'linear-gradient(135deg, var(--accent), var(--purple))',
          borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 26, fontWeight: 800, color: 'white', flexShrink: 0,
          boxShadow: '0 0 30px rgba(91,141,238,0.3)'
        }}>
          {initials}
        </div>
        <div>
          <div style={{ fontSize: 20, fontWeight: 800 }}>{user?.name}</div>
          <div style={{ fontSize: 13, color: 'var(--text3)', fontFamily: 'var(--mono)' }}>{user?.email}</div>
          <div style={{ display: 'flex', gap: 14, marginTop: 8 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, color: 'var(--text3)' }}>
              <Puzzle size={12} /> {user?.extensionCount ?? 0} extensions
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, color: 'var(--text3)' }}>
              <Calendar size={12} /> Joined {new Date(user?.createdAt).toLocaleDateString()}
            </div>
          </div>
        </div>
      </div>

      {/* Edit form */}
      <div className="card">
        <h3 style={{ fontSize: 15, fontWeight: 800, marginBottom: 20 }}>Edit Profile</h3>
        <form onSubmit={handleSave}>
          <div className="form-group">
            <label className="form-label">Full Name</label>
            <input
              className="form-input"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Your full name"
            />
          </div>
          <div className="form-group">
            <label className="form-label">Email</label>
            <input className="form-input" value={user?.email || ''} disabled style={{ opacity: 0.5, cursor: 'not-allowed' }} />
            <div className="form-hint">Email cannot be changed</div>
          </div>
          <div className="form-group">
            <label className="form-label">Role</label>
            <input className="form-input" value={user?.role || 'user'} disabled style={{ opacity: 0.5, cursor: 'not-allowed' }} />
          </div>
          <button className="btn btn-primary" type="submit" disabled={loading}>
            {loading ? <><span className="spinner" style={{ borderTopColor: 'white' }} /> Saving...</> : <><Save size={15} /> Save Changes</>}
          </button>
        </form>
      </div>

      {/* Stats */}
      <div className="card" style={{ marginTop: 16 }}>
        <h3 style={{ fontSize: 15, fontWeight: 800, marginBottom: 16 }}>Account Stats</h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
          {[
            { icon: <Puzzle size={18} color="var(--accent)" />, label: 'Extensions Created', value: user?.extensionCount ?? 0 },
            { icon: <User size={18} color="var(--green)" />, label: 'Account Type', value: user?.role || 'user' },
          ].map((s, i) => (
            <div key={i} style={{ background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: 10, padding: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>{s.icon}</div>
              <div style={{ fontSize: 22, fontWeight: 800, marginBottom: 2 }}>{s.value}</div>
              <div style={{ fontSize: 12, color: 'var(--text3)', fontFamily: 'var(--mono)' }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

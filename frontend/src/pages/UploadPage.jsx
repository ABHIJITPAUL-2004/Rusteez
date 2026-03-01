import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../utils/api.js';

export default function UploadPage({ onAnalysisComplete }) {
  const [dragging, setDragging] = useState(false);
  const [preview, setPreview] = useState(null);
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleFile = (f) => {
    if (!f || !f.type.startsWith('image/')) {
      setError('Please upload an image file (JPG, PNG, WEBP).');
      return;
    }
    setFile(f);
    setError(null);
    setPreview(URL.createObjectURL(f));
  };

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setDragging(false);
    handleFile(e.dataTransfer.files[0]);
  }, []);

  const handleSubmit = async () => {
    if (!file) return;
    setLoading(true);
    setError(null);
    try {
      const data = await api.analyzeBoth(file);
      onAnalysisComplete({ ...data, previewUrl: preview, filename: file.name, timestamp: new Date().toISOString() });
      navigate('/detail');
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 680, margin: '0 auto', padding: '48px 24px', display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Header */}
      <div className="fade-in">
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 8 }}>
          <div style={{ width: 44, height: 44, background: 'linear-gradient(135deg, #f97316, #ef4444)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, flexShrink: 0 }}>🛤</div>
          <div>
            <h1 style={{ margin: 0, fontSize: 24, fontWeight: 900, background: 'linear-gradient(90deg, #f97316, #ef4444)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', letterSpacing: '-0.02em' }}>
              RAILWAY RUST DETECTOR
            </h1>
            <p style={{ margin: 0, color: '#475569', fontSize: 12, letterSpacing: '0.1em' }}>HSV ANALYSIS · CLAUDE VISION AI · LIVE COMPARISON</p>
          </div>
        </div>
      </div>

      {/* Drop Zone */}
      <div
        className="fade-in"
        onDrop={handleDrop}
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onClick={() => !loading && document.getElementById('fileInput').click()}
        style={{
          border: `2px dashed ${dragging ? '#f97316' : preview ? '#1e293b' : '#1e293b'}`,
          borderRadius: 14, overflow: 'hidden',
          background: dragging ? '#1a0f00' : '#070d1a',
          cursor: loading ? 'wait' : 'pointer',
          transition: 'all 0.2s', minHeight: 280,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}
      >
        <input id="fileInput" type="file" accept="image/*" style={{ display: 'none' }}
          onChange={(e) => handleFile(e.target.files[0])} />

        {preview ? (
          <div style={{ position: 'relative', width: '100%' }}>
            <img src={preview} alt="Preview" style={{ width: '100%', maxHeight: 360, objectFit: 'cover', display: 'block' }} />
            <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'linear-gradient(transparent, rgba(2,8,23,0.95))', padding: '40px 20px 16px' }}>
              <p style={{ margin: 0, color: '#64748b', fontSize: 12 }}>📎 {file?.name} · Click to change</p>
            </div>
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: 40 }}>
            <div style={{ fontSize: 52, marginBottom: 16 }}>🖼</div>
            <p style={{ color: '#334155', margin: '0 0 8px', fontSize: 15, fontWeight: 600 }}>Drop railway image here</p>
            <p style={{ color: '#1e293b', margin: 0, fontSize: 12 }}>or click to browse · JPG, PNG, WEBP</p>
          </div>
        )}
      </div>

      {/* Error */}
      {error && (
        <div style={{ background: '#2d0000', border: '1px solid #ef4444', borderRadius: 8, padding: '12px 16px', color: '#f87171', fontSize: 13 }}>
          ⚠ {error}
        </div>
      )}

      {/* Analyze Button */}
      <button
        onClick={handleSubmit}
        disabled={!file || loading}
        style={{
          background: file && !loading ? 'linear-gradient(135deg, #f97316, #ef4444)' : '#1e293b',
          color: file && !loading ? '#fff' : '#475569',
          border: 'none', borderRadius: 10, padding: '16px 24px',
          fontSize: 14, fontWeight: 800, cursor: file && !loading ? 'pointer' : 'not-allowed',
          letterSpacing: '0.08em', transition: 'all 0.2s', display: 'flex',
          alignItems: 'center', justifyContent: 'center', gap: 10,
        }}
      >
        {loading ? (
          <>
            <div style={{ width: 16, height: 16, border: '2px solid #ffffff44', borderTop: '2px solid #fff', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
            ANALYZING WITH HSV + CLAUDE AI...
          </>
        ) : '▶  RUN DUAL ANALYSIS'}
      </button>

      {/* Info cards */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        {[
          { icon: '🎨', title: 'HSV Detection', desc: 'Pixel-level rust color analysis using Hue-Saturation-Value color space' },
          { icon: '🤖', title: 'Claude Vision AI', desc: 'Context-aware AI analysis identifying rust, affected areas & severity' },
        ].map(({ icon, title, desc }) => (
          <div key={title} style={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: 10, padding: 16 }}>
            <div style={{ fontSize: 22, marginBottom: 8 }}>{icon}</div>
            <div style={{ fontSize: 12, fontWeight: 700, color: '#94a3b8', marginBottom: 4, letterSpacing: '0.06em' }}>{title}</div>
            <p style={{ margin: 0, fontSize: 11, color: '#475569', lineHeight: 1.6 }}>{desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

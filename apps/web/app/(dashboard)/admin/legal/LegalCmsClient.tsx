'use client';

import { useState } from 'react';
import { LegalPage, upsertLegalPage, createLegalPage } from '@/lib/api';

interface LegalCmsClientProps {
  pages: LegalPage[];
  token: string;
}

export function LegalCmsClient({ pages: initialPages, token }: LegalCmsClientProps) {
  const [pages, setPages] = useState(initialPages);
  const [selected, setSelected] = useState<LegalPage | null>(null);
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [content, setContent] = useState('');
  const [saving, setSaving] = useState(false);
  const [mode, setMode] = useState<'edit' | 'new'>('edit');

  function selectPage(p: LegalPage) {
    setSelected(p);
    setTitle(p.title);
    setSlug(p.slug);
    setContent(p.content);
    setMode('edit');
  }

  function startNew() {
    setSelected(null);
    setTitle('');
    setSlug('');
    setContent('');
    setMode('new');
  }

  async function save() {
    if (!title || !content) return;
    setSaving(true);
    try {
      let updated: LegalPage;
      if (mode === 'edit' && selected) {
        const res = await upsertLegalPage(selected.slug, title, content, token);
        updated = res as unknown as LegalPage;
        setPages((prev) => prev.map((p) => (p.slug === selected.slug ? updated : p)));
        setSelected(updated);
      } else {
        const s = slug || title.toLowerCase().replace(/[^a-z0-9]+/g, '-');
        const res = await createLegalPage(s, title, content, token);
        updated = res as unknown as LegalPage;
        setPages((prev) => [...prev, updated]);
        selectPage(updated);
      }
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="flex gap-6 h-full">
      {/* Sidebar */}
      <div className="w-56 shrink-0 space-y-1">
        <button
          onClick={startNew}
          className="w-full text-left px-3 py-2 text-sm font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
        >
          + New Page
        </button>
        {pages.map((p) => (
          <button
            key={p.slug}
            onClick={() => selectPage(p)}
            className={`w-full text-left px-3 py-2 text-sm rounded-lg transition-colors ${
              selected?.slug === p.slug
                ? 'bg-gray-200 font-medium text-gray-900'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            {p.title}
          </button>
        ))}
        {pages.length === 0 && mode !== 'new' && (
          <p className="text-xs text-gray-400 px-3 pt-2">No pages yet. Create one.</p>
        )}
      </div>

      {/* Editor */}
      {(selected || mode === 'new') && (
        <div className="flex-1 min-w-0 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-gray-500 uppercase tracking-wide mb-1 block">
                Title
              </label>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                placeholder="Terms of Service"
              />
            </div>
            {mode === 'new' && (
              <div>
                <label className="text-xs text-gray-500 uppercase tracking-wide mb-1 block">
                  Slug (URL path)
                </label>
                <input
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                  placeholder="terms-of-service"
                />
              </div>
            )}
          </div>

          <div>
            <label className="text-xs text-gray-500 uppercase tracking-wide mb-1 block">
              Content (plain text or HTML)
            </label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={20}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-400 resize-y"
              placeholder="Write your legal content here..."
            />
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={save}
              disabled={saving || !title || !content}
              className="px-5 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              {saving ? 'Saving…' : mode === 'edit' ? 'Save Changes' : 'Create Page'}
            </button>
            {mode === 'edit' && selected && (
              <a
                href={`/legal/${selected.slug}`}
                target="_blank"
                rel="noreferrer"
                className="text-sm text-blue-500 hover:underline"
              >
                Preview
              </a>
            )}
          </div>
        </div>
      )}

      {!selected && mode !== 'new' && (
        <div className="flex-1 flex items-center justify-center text-gray-400 text-sm">
          Select a page to edit or create a new one.
        </div>
      )}
    </div>
  );
}

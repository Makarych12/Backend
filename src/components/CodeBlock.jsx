import { useEffect, useRef, useState } from 'react';
import Prism from 'prismjs';
import 'prismjs/components/prism-python';
import 'prismjs/components/prism-bash';
import 'prismjs/components/prism-json';
import 'prismjs/components/prism-sql';
import 'prismjs/components/prism-docker';

export default function CodeBlock({ code, lang = 'python', title }) {
  const ref = useRef(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (ref.current) Prism.highlightElement(ref.current);
  }, [code, lang]);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // clipboard API unavailable — ignore, user can still select text manually
    }
  }

  return (
    <div className="overflow-hidden rounded-xl border" style={{ borderColor: 'var(--border)', background: 'var(--code-bg)' }}>
      <div className="flex items-center justify-between border-b px-4 py-2" style={{ borderColor: 'var(--border)' }}>
        <span className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>
          {title || lang}
        </span>
        <button
          onClick={handleCopy}
          className="rounded-md px-2 py-1 text-xs font-medium transition hover:bg-[var(--bg-hover)]"
          style={{ color: 'var(--text-muted)' }}
        >
          {copied ? '✓ Скопировано' : 'Копировать'}
        </button>
      </div>
      <div className="overflow-x-auto">
        <pre className={`language-${lang}`}>
          <code ref={ref} className={`language-${lang}`}>
            {code}
          </code>
        </pre>
      </div>
    </div>
  );
}

'use client';

import { useState } from 'react';
import { bePresentStory } from '../lib/be-present-story';

export function BePresentStorybook() {
  const [page, setPage] = useState(0);
  const chapter = bePresentStory[page];
  return <div className="be-present-book" role="region" aria-label="Be Present illustrated story" onKeyDown={event => {
    if (event.key === 'ArrowRight') { event.preventDefault(); setPage(value => Math.min(bePresentStory.length - 1, value + 1)); }
    if (event.key === 'ArrowLeft') { event.preventDefault(); setPage(value => Math.max(0, value - 1)); }
  }}>
    <div className="be-present-book-picture">
      <img src={chapter.image} width={659} height={815} alt={chapter.alt} />
      <div className="be-present-book-left-controls"><button type="button" onClick={() => setPage(value => Math.max(0, value - 1))} disabled={page === 0} className={page === 0 ? 'invisible' : ''}>‹ Previous page</button><span aria-hidden="true">{page + 1} / {bePresentStory.length}</span></div>
    </div>
    <div className={`be-present-book-page ${page === 4 ? 'be-present-book-last' : ''}`} onClick={event => {
      if ((event.target as HTMLElement).closest('button') || window.getSelection()?.toString()) return;
      setPage(value => value === bePresentStory.length - 1 ? 0 : value + 1);
    }}>
      {page === 0 && <img className="be-present-book-intro" src="/images/figma/be-present-book-title.webp" alt="The world of Imagination story telling" />}
      <article className={page === 0 ? 'be-present-book-first-copy' : 'be-present-book-copy'}>
        <h3>{chapter.title}</h3>
        <div>{chapter.paragraphs.map((paragraph, index) => <p key={index}>{paragraph}</p>)}</div>
      </article>
      <button type="button" className="be-present-book-next" onClick={() => setPage(value => value === bePresentStory.length - 1 ? 0 : value + 1)}>{page === bePresentStory.length - 1 ? 'Read again ↻' : 'Turn the page ›'}<span className="be-present-book-corner" aria-hidden="true" /></button>
    </div>
    <p className="sr-only" aria-live="polite" aria-atomic="true">Page {page + 1} of {bePresentStory.length}: {chapter.title}</p>
  </div>;
}

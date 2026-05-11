/**
 * Lightweight markdown renderer for chat bubbles.
 * Shared by UnifiedChatbot + JourneyChatbot so both render formatted model
 * output consistently. NOT a full markdown parser — covers the subset that
 * LLM chat output actually uses.
 *
 * Strips em-dashes (Oasara/ecosystem brand rule: em-dash is an AI tell).
 */
export function renderChatMarkdown(text: string): string {
  let html = text || '';

  // Strip em-dashes (replace with comma). Collapse surrounding whitespace
  // so " — " doesn't become " ,  ". Catches both U+2014 and U+2013.
  html = html.replace(/\s*[—–]\s*/g, ', ');

  // Escape any raw HTML the model emits, so dangerouslySetInnerHTML doesn't
  // execute it. We re-inject our own tags below.
  html = html
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

  // Headings (### / ## / #) - render as bold block lines, not real h2/h3
  html = html.replace(/^#{1,6}\s+(.+)$/gm, '<strong class="block mt-2 mb-1">$1</strong>');

  // Inline code: `foo` -> <code>
  html = html.replace(/`([^`]+)`/g, '<code class="bg-ocean-50 text-ocean-800 px-1 py-0.5 rounded text-xs">$1</code>');

  // Bold: **foo** -> <strong>
  html = html.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');

  // Links: [text](url) -> <a> (after escape, so brackets are literal)
  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="text-ocean-600 underline hover:text-ocean-800" target="_blank" rel="noopener noreferrer">$1</a>');

  // Numbered list items: "1. foo" -> <li>
  html = html.replace(/^\s*\d+\.\s+(.+)$/gm, '<li data-list="ol">$1</li>');

  // Bullet list items: "- foo" or "* foo" -> <li>
  html = html.replace(/^\s*[-*]\s+(.+)$/gm, '<li data-list="ul">$1</li>');

  // Wrap consecutive <li data-list="ol"> in <ol> (no /s flag — use [\s\S])
  html = html.replace(/(<li data-list="ol">[\s\S]*?<\/li>\s*)+/g, (match) => {
    return '<ol class="list-decimal list-inside my-2 space-y-1">' + match.replace(/ data-list="ol"/g, '') + '</ol>';
  });

  // Wrap consecutive <li data-list="ul"> in <ul>
  html = html.replace(/(<li data-list="ul">[\s\S]*?<\/li>\s*)+/g, (match) => {
    return '<ul class="list-disc list-inside my-2 space-y-1">' + match.replace(/ data-list="ul"/g, '') + '</ul>';
  });

  // Newlines -> <br/>, but NOT inside lists (lists already block-formatted)
  // Simple approach: collapse triple+ newlines, then convert remaining \n
  html = html.replace(/\n{2,}/g, '\n\n');
  html = html.replace(/\n/g, '<br/>');

  // Tidy up: <br/> immediately before/after block elements is redundant
  html = html.replace(/<br\/>(<(?:ul|ol|strong class="block))/g, '$1');
  html = html.replace(/(<\/(?:ul|ol|strong)>)<br\/>/g, '$1');

  return html;
}

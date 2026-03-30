/**
 * Converts a user-supplied streaming URL to an embeddable iframe src.
 * Returns null if the URL cannot be converted to an embed (e.g. Bandcamp).
 */
export function toEmbedUrl(url: string, platform: 'YouTube' | 'Spotify' | 'Bandcamp'): string | null {
  if (!url) return null;

  if (platform === 'YouTube') {
    try {
      const u = new URL(url);
      if (u.pathname.startsWith('/embed/')) return url;
      const v = u.searchParams.get('v');
      const list = u.searchParams.get('list');
      // Video + playlist: embed with playlist panel visible
      if (v && list) return `https://www.youtube.com/embed/${v}?list=${list}&listType=playlist`;
      // Playlist only
      if (list) return `https://www.youtube.com/embed/videoseries?list=${list}`;
      // Single video
      if (v) return `https://www.youtube.com/embed/${v}`;
      // youtu.be/VIDEO_ID
      if (u.hostname === 'youtu.be') return `https://www.youtube.com/embed${u.pathname}`;
    } catch {
      return null;
    }
    return null;
  }

  if (platform === 'Spotify') {
    // https://open.spotify.com/album/ID  →  https://open.spotify.com/embed/album/ID
    // https://open.spotify.com/embed/album/ID  (already embed)
    try {
      const u = new URL(url);
      if (u.pathname.startsWith('/embed/')) return url.includes('theme=0') ? url : `${url}&theme=0`;
      return `https://open.spotify.com/embed${u.pathname}?theme=0`;
    } catch {
      return null;
    }
  }

  if (platform === 'Bandcamp') {
    // User pasted a full <iframe ...> embed code — extract the src
    const iframeSrcMatch = url.match(/src="(https:\/\/bandcamp\.com\/EmbeddedPlayer\/[^"]+)"/);
    if (iframeSrcMatch) return iframeSrcMatch[1];
    // User pasted the EmbeddedPlayer src directly
    if (url.includes('bandcamp.com/EmbeddedPlayer/')) return url;
    // Public URL — cannot extract numeric album ID, not embeddable
    return null;
  }

  return null;
}

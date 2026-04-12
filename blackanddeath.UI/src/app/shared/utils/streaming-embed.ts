/**
 * Converts a user-supplied streaming URL to an embeddable iframe src.
 * Returns null if the URL cannot be converted to an embed (e.g. Bandcamp).
 */
export function toEmbedUrl(url: string, platform: 'YouTube' | 'Spotify' | 'Bandcamp' | 'AppleMusic' | 'Deezer'): string | null {
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

  if (platform === 'Deezer') {
    // https://www.deezer.com/album/ID  →  https://widget.deezer.com/widget/dark/album/ID
    try {
      const u = new URL(url);
      if (u.hostname === 'widget.deezer.com') return url;
      const match = u.pathname.match(/(?:\/[a-z]{2})?\/(album|playlist|track)\/(\d+)/);
      if (match) return `https://widget.deezer.com/widget/dark/${match[1]}/${match[2]}`;
    } catch {
      return null;
    }
    return null;
  }

  if (platform === 'AppleMusic') {
    // https://music.apple.com/us/album/name/id  →  https://embed.music.apple.com/us/album/name/id
    try {
      const u = new URL(url);
      if (u.hostname === 'embed.music.apple.com') return url;
      if (u.hostname === 'music.apple.com') {
        return `https://embed.music.apple.com${u.pathname}`;
      }
    } catch {
      return null;
    }
    return null;
  }

  if (platform === 'Bandcamp') {
    // User pasted a full <iframe ...> embed code — extract the src
    const iframeSrcMatch = url.match(/src="(https:\/\/bandcamp\.com\/EmbeddedPlayer\/[^"]+)"/);
    const src = iframeSrcMatch ? iframeSrcMatch[1] : url.includes('bandcamp.com/EmbeddedPlayer/') ? url : null;
    if (!src) return null;
    // Normalize: replace size=large with size=small (large locks to fixed px width)
    // Set width to max (700px) so player scales as wide as possible
    return src.replace(/\/size=large/, '/size=large/width=700');
  }

  return null;
}

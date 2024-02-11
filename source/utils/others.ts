// const parseChannelName = (url: string) => {
//     const match = url?.match(/.*twitch.tv\/(\w+)[\/|\?]?/i);
//     return match ? match[1].toLowerCase() : "nomatch";
//   };

//   resp => {
//     let match = resp[0].url?.match(/.*twitch.tv\/(\w+)[\/|\?]?/i)
//     this.state.channel = match ? match[1].toLowerCase() : 'nomatch'

/**
 * TODO: ...
 * @param {string} url - ...
 * @return {string|null} ...
 */
export function urlToChannel(url: string): string | null {
  if (url === null || typeof url === 'undefined') return null;
  const regex = /(.*)twitch.tv\/(\w+)[\/|\?]?/i;
  const match = url.match(regex);

  // Exclude the dashboard
  if (match && match[1].endsWith('dashboard.')) return null;

  const channel = match ? match[2].trim().toLowerCase() : '';

  // Exclude subdirectories
  const exclude = ['directory', 'friends', 'subscriptions', 'inventory', 'wallet', 'settings'];
  if (exclude.includes(channel)) return null;

  // Exclude Dashboard

  return channel ? channel : null;
}

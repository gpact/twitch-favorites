import {getLogger} from '../utils/logging';
import {
  Stream,
  getChannelsFromStorage,
  getElementByXpath,
  XPATH_FOLLOWED_LIST,
} from '../utils';
import {getColorTheme} from '../Background/settings';
import {arrayToRGBA} from './colors';

const logger = getLogger('ContentScript');


// // eslint-disable-next-line require-jsdoc
// function timer(func: Function) {
//   return function(...args) {
//     const startTime = new Date();
//     func(...args);
//     const endTime = new Date();
//     const milliseconds = endTime.getTime() - startTime.getTime();
//     console.log(`${func} took ${milliseconds / 1000} secs.`);
//   }
// }

/**
 * Channel sorter
 */
export default class ChannelSorter {
  lastExecution: Date | null; // Last time the function was called (interval)
  lastUpdated: Date | null; // Last time the page was modified
  updateInterval: number;
  processInterval: number; // The main thread, this will be used as a timeout
  container?: HTMLElement;
  lastSortedLists: {favorites: Stream[]; others: Stream[]};
  isInitialized: boolean;
  intervalId: any;
  favoritesSet: Set<string>;

  /**
   * Creates an instance of channel sorter.
   * @param {number} updateInterval - ...
   * @param {number} processInterval - ...
   */
  constructor(updateInterval: number = 0, processInterval: number = 100) {
    this.updateInterval = updateInterval;
    this.lastSortedLists = {favorites: [], others: []};
    this.lastExecution = null;
    this.lastUpdated = null;
    this.intervalId = null;
    this.processInterval = processInterval;
    this.isInitialized = false;
    this.favoritesSet = new Set();
  }

  /**
   * Initialize the sorter process.
   * @return {number} The interval ID.
   */
  public initialize(): number {
    if (!this.isInitialized) {
      logger.info(`Creating main process using setInterval.`);
      logger.info(this);
      this.isInitialized = true;
      this.intervalId = setInterval(() => this.update(), this.processInterval);
      logger.info(`Channel sorter initialized. IntervalID: ${this.intervalId}`);
    }
    return this.intervalId;
  }

  /**
   * Stop the sorter process.
   */
  public stop(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
      this.updateInterval = Number.MAX_SAFE_INTEGER;
      this.isInitialized = false;
    }
  }

  /**
   * Update the list of followed channels in the sidebar.
   */
  private update(): void {
    // If update is called, but it hasnt been initialized, initialize it.
    if (!this.isInitialized) this.initialize();

    if (!this.container) {
      this.container = getElementByXpath(XPATH_FOLLOWED_LIST) as HTMLElement;
    }

    if (this.container) {
      this.sortElements().then((resp) => {
        if (resp) {
          logger.debug('List has been refreshed');
          logger.debug(this);
        }
      });
    }
  }

  /**
   * Get the Favorite channels from storage.
   * @return {Promise<Set<string>>} Channels the user has marked as favorite.
   */
  private async getFavorites(): Promise<Set<string>> {
    const mapping: Set<string> = new Set();
    const channels = await getChannelsFromStorage();
    for (const item of channels) {
      mapping.add(item);
    }
    return mapping;
  }

  /**
   * Sort the channels.
   * @return {Promise<boolean>} True if the list was sorted, false when skipped.
   */
  private async sortElements(): Promise<boolean> {
    if (this.timeSinceLast() < this.updateInterval) return false;

    this.lastExecution = new Date();

    // Check if there is enough information to sort the list

    const liveChannels = this.getSortableChannels();

    if (liveChannels.length === 0) {
      // There is no live channels to sort. Skipping.
      return false;
    }

    // Separate into groups for favorites channels and the rest
    const favoriteChannels: Stream[] = [];
    const otherChannels: Stream[] = [];

    const favorites = await this.getFavorites();
    liveChannels.forEach((element: HTMLElement, idx: number) => {
      const info: Stream = {div: element, viewers: Number.NaN};

      // TODO: If the sidebar is collapsed, viewers will be NaN and we wont be able to sort.
      // Maybe refactor this to make 2 groups first, and then consider the numbers.
      // <div data-test-selector="side-nav-card-collapsed"> gives an indication of the sidebar status.

      info.viewers = this.parseViewers(
          element.getElementsByTagName('span')[0]?.textContent);
      info.url = element.getElementsByTagName('a')[0]?.href;

      const p = element.getElementsByTagName('p');
      info.channel = p[0]?.textContent?.trim().toLowerCase();

      // FIXME: Exception has occurred: TypeError: Cannot read property 'textContent' of undefined (After minimizing the sidebar)
      // if (p[1].textContent) info.game = p[1].textContent
      info.game = p[1]?.textContent?.trim();

      if (!info.channel && info.url) {
        // Most likely the sidebar is collapsed; so we can use the url to extract the channel name.
        const chunks = info.url.split('/');
        if (chunks) info.channel = chunks[chunks.length - 1];
      }

      info.isFavorite = !!info.channel && favorites.has(info.channel);
      info.currentPosition = idx;

      if (info.isFavorite) {
        favoriteChannels.push(info);
      } else {
        otherChannels.push(info);
      }
    });

    // TODO: Pre-check the sizes of the previous and current favorite list to quickly determine if needs sorted.

    // Sort the favorites
    this.sortByViewerCount(favoriteChannels);
    this.sortByViewerCount(otherChannels);

    // TODO: Improve this comparisons
    // Check if already sorted on the page
    let alreadySorted = true;

    if (favoriteChannels.length !== this.lastSortedLists.favorites.length) {
      alreadySorted = false;
    }

    if (alreadySorted) {
      for (let idx = 0; idx < favoriteChannels.length; idx++) {
        const element = favoriteChannels[idx];
        if (element.currentPosition !== idx) {
          alreadySorted = false;
          break;
        }
      }
    }

    if (alreadySorted) {
      for (let idx = 0; idx < otherChannels.length; idx++) {
        const element = otherChannels[idx];
        if (element.currentPosition !== favoriteChannels.length + idx) {
          alreadySorted = false;
          break;
        }
      }
    }

    // If the list is already sorted, there is no need to refresh.
    if (alreadySorted) {
      return false;
    }

    // Recreate the list or modify in place (decide this one)
    await this.updateFollowedListElements(favoriteChannels, otherChannels);

    // Keep a copy of the current lists
    this.lastSortedLists.favorites = favoriteChannels;
    this.lastSortedLists.others = otherChannels;
    this.lastUpdated = new Date();

    return true;
  }

  /**
   * Updates followed list elements
   * @param {Stream[]} favorites - ...
   * @param {Stream[]} others - ...
   */
  private async updateFollowedListElements(favorites: Stream[], others: Stream[]): Promise<void> {
    // TODO: Optimize this to avoid swaping nodes which are already in the right place
    const theme = await getColorTheme();
    // FIXME: Quick hack to have the old code working
    const liveStreams: Stream[] = [];
    favorites.forEach((element) => {
      liveStreams.push(element);
    });
    others.forEach((element) => {
      liveStreams.push(element);
    });

    let sortedFavorites = 0;
    for (let idx = liveStreams.length - 1; idx >= 0; idx--) {
      const row = liveStreams[idx];
      const parentNode = row.div.parentNode;
      if (row.isFavorite && parentNode) {
        parentNode.removeChild(row.div);
        this.container?.insertBefore(row.div, this.container?.childNodes[0]);
        row.div.style.backgroundColor = arrayToRGBA(theme.sidebar);
        sortedFavorites += 1;
      } else {
        parentNode?.removeChild(row.div);
        this.container?.insertBefore(
            row.div, this.container?.childNodes[sortedFavorites]);
        // FIXME: Workaround to fix the issue of deleted favorites for now.
        row.div.style.backgroundColor = 'rgba(0, 0, 0, 0.0)';
      }
    }
  }

  /**
   * Sort in-place by viewer count.
   * @param {Stream[]} streams - List of streams to be sorted.
   */
  private sortByViewerCount(streams: Stream[]): void {
    streams.sort((a, b) => b.viewers - a.viewers);
  }

  /**
   * Returns the time in milliseconds since the last sorting process was ran.
   * @return {number} Milliseconds since last execution.
   */
  private timeSinceLast(): number {
    if (this.lastExecution === null) return this.updateInterval;
    return new Date().getTime() - this.lastExecution.getTime();
  }

  /**
   * Expand the list of followed channels on the sidebar.
   * @param {number} iterations - Max number of times to expand the list.
   */
  private expandChannelList(iterations: number = 10): void {
    for (let i = 0; i < iterations; i++) {
      if (!this.canExpandFurther()) return;
      this.showMore();
    }
  }

  /**
   * TODO: Document this.
   * @return {HTMLElement|null} ...
   */
  private getShowMoreElement(): HTMLElement | null {
    return document.querySelector('[data-test-selector="ShowMore"]');
  }

  /**
   * TODO: Document this.
   * @return {boolean} True if there are still more hidden online channels.
   */
  private canExpandFurther(): boolean {
    // TODO: Use the class name instead of the offline text to determine if it can be expanded.
    const showMore = this.getShowMoreElement();

    // Handle the cases when the sidebar is collapsed or user is not logged in.
    // if (showMore === null || typeof showMore === "undefined") return false;   // XXX: Can be written in a better way
    if (!showMore) return false;

    // return getElementByXpath('//*[@data-a-target="side-nav-live-status"]//span[text()="Offline"]') !== null
    if (!this.container) return false;
    const viewCounts = Array.from(this.container.getElementsByTagName('span')).map((e) => e.textContent);
    return !viewCounts.some((v) => v?.trim().toLowerCase() === 'offline');
  }

  /**
   * Click on the `Show More` element to expand the list of followed channels.
   */
  private showMore(): void {
    const element = this.getShowMoreElement();
    if (element) element.click();
  }

  /**
   * Get the list of all live followed channels
   * @return {HTMLElement[]} ...
   */
  private getSortableChannels(): HTMLElement[] {
    this.expandChannelList();

    const container = this.container as HTMLElement;
    const children = container.children ? Array.from(container.children) : [];

    const onlineChannels: HTMLElement[] = [];
    children.forEach((element) => {
      if (!element.querySelector('.side-nav-card__avatar--offline')) {
        onlineChannels.push(element as HTMLElement);
      }
    });
    return onlineChannels;
  }

  /**
   * Parse the total number of viewers from the string on the sidebar row.
   * If the channel is offline, or the value is null, as in the case when the
   * sidebar is collapsed, then NaN is returned.
   * @param {string|null} viewerCount - The view count string.
   * @return {number} Channel's view count, or NaN if unable to parse or offline.
   */
  private parseViewers(viewerCount: string | null): number {
    if (viewerCount === null || typeof viewerCount === 'undefined') {
      return Number.NaN;
    }

    const viewers = viewerCount.trim().toUpperCase();
    if (viewers === 'OFFLINE' || viewers === '') {
      return Number.NaN;
    }
    if (viewers.endsWith('K')) {
      return 1000 * Number.parseFloat(viewers.substr(0, viewers.length - 1));
    }
    if (viewers.endsWith('M')) {
      return 1000000 * Number.parseFloat(viewers.substr(0, viewers.length - 1));
    }
    return Number.parseInt(viewers);
  }
}

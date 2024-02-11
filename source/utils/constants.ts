import {Color} from './color';

export const STORAGE_KEY = 'twitchFavoriteChannels';
export const FAVORITE_BUTTON_ID = 'twitch-favorite-channels-extension';

// Element containing the list of followed channels.
export const XPATH_FOLLOWED_LIST =
  '//*[@id="side-nav"]//div[contains(@class, "tw-transition-group")]';

// Place where the Favorite button will be placed.
export const XPATH_TARGET_BUTTON_LOCATION =
  '//*[@class="metadata-layout__secondary-button-spacing"]';

// Notification button, only present if the user if following the channel.
export const XPATH_NOTIFICATIONS = '//button[@data-a-target="notifications-toggle"]';

// `Show More` element which loads additional records in the followed channels list.
export const XPATH_SHOW_MORE = '//*[@data-test-selector="ShowMore"]';

// How often, in milliseconds, should the script be executed on the setInterval.
export const REFRESH_INTERVAL = 100; // milliseconds

export const favoriteChannelColor = new Color(30, 165, 20, 0.3); // (20, 165, 162, 0.25)
export const buttonMainColor = new Color(0, 75, 0);

import * as React from 'react';
import ReactDOM from 'react-dom';
import {browser} from 'webextension-polyfill-ts';
import {FAVORITE_BUTTON_ID} from '../utils';
import {getLogger, levels} from '../utils/logging';
import FavoriteButton from './button';
import ChannelSorter from './channelSorter';

const logger = getLogger('ContentScript');
logger.setLevel(levels.DEBUG);

let initialized = false;

/**
 * Check the user's login status.
 * @return {boolean} True if the user is logged in.
 */
function checkUserLoggedIn(): boolean {
  return (
    !!document.querySelector('.onsite-notifications') ||
    document.querySelector('body')!.classList.contains('logged-in')
  );
}

/**
 * Insert favorite button into the channel's page.
 * @param {string} divId - ...
 * @return {boolean} True if the button was added to the DOM successfully.
 */
function renderFavoriteButton(divId: string): boolean {
  logger.info('Creating Favorite button...');

  const element = document.querySelector(
      'div[data-target="channel-header-right"]');
  if (!element) {
    logger.info('Unable to find target position for the button.');
    return false;
  }

  const div = document.createElement('div');
  div.id = divId;
  div.style.marginRight = '1rem';
  ReactDOM.render(<FavoriteButton />, div);
  element.insertBefore(div, element.childNodes[2]);
  logger.debug('Favorite button created.');
  return true;
}

/**
 * Remove the Favorite button from the channel's page.
 * @param {string} divId - ...
 * @return {boolean} True if the button was removed successfully.
 */
function removeFavoriteButton(divId: string): boolean {
  logger.info('Removing Favorite button...');
  const element = document.getElementById(divId);
  if (element && element.parentNode) {
    element.parentNode.removeChild(element);
    logger.info('Favorite button removed.');
    return true;
  }
  logger.info('Unable to remove Favorite button.');
  return false;
}

/**
 * Check if the user is following the channel.
 * @return {boolean} True if the user follows the channel, false otherwise.
 */
function checkFollowing(): boolean {
  // Check if the Follow button is in the page.
  // This button is only present when the user is not following the channel.
  if (document.querySelector('button[data-a-target="follow-button"]')) {
    return false;
  }

  // Check if the notifications button is available.
  // This button is always in the DOM, but only enable on a followed channel.
  const q = 'button[data-a-target="notifications-toggle"]';
  const notificationBtn: HTMLButtonElement | null = document.querySelector(q);
  return !!notificationBtn && notificationBtn.disabled === false;
}

/**
 * Check if the Favorite button is rendered in the page.
 * @return {boolean} true if button exists in the DOM.
 */
function checkfavoriteButton(): boolean {
  return document.querySelector(`#${FAVORITE_BUTTON_ID}`) !== null;
}

/**
 * TODO: Document this.
 */
function addRemoveBtn(): void {
  const isFollowing = checkFollowing();
  const isButtonDisplayed = checkfavoriteButton();

  if (isFollowing && !isButtonDisplayed) {
    renderFavoriteButton(FAVORITE_BUTTON_ID);
  }

  // Check if the channel was just now unfollowed.
  if (!isFollowing && isButtonDisplayed) {
    removeFavoriteButton(FAVORITE_BUTTON_ID);
  }
}

const sorter = new ChannelSorter(1000, 250);

browser.runtime.onMessage.addListener((message): void => {
  logger.debug(message);

  const isPageLoaded = message.tab.status === 'complete';
  const isPageLoadedNotification = message.changeInfo.status === 'complete';

  // Do nothing until page is fully loaded.
  if (!(isPageLoaded || isPageLoadedNotification)) {
    // Attempt to remove the button when the page loads to solve issue with the nature of SPA.
    removeFavoriteButton(FAVORITE_BUTTON_ID);
    logger.debug(
        `Page still loading (Loaded: ${isPageLoaded} Loaded Notification ${isPageLoadedNotification})...`);
    return;
  }

  // Only run if the user is logged in the site
  if (!checkUserLoggedIn()) return;

  // Initialize the sorting process
  if (!initialized && (isPageLoaded || isPageLoadedNotification)) {
    logger.info('Initializing...');
    initialized = true;

    // XXX: Maybe use a global or local variable to check if running already
    const intervalId = sorter.initialize();
    console.log(intervalId);
    // setInterval(() => sorter.update(), REFRESH_INTERVAL)
    // setInterval(() => sortFollowed(), REFRESH_INTERVAL)
    setInterval(addRemoveBtn, 1000);
  }
});

export {};

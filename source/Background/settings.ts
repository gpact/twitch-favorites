import {browser} from 'webextension-polyfill-ts';

export interface Theme {
  name: string;
  button: {
    enabled: number[],
    disabled: number[],
  };
  sidebar: number[];
}

interface Settings {
  favorites: string[];
  themes: {
    [key: string]: Theme;
  };
  activeTheme: string;
}

const sample = {
  favorites: ['c1', 'c2', 'c3', 'c4'],
  themes: {
    dark: {
      name: 'dark',
      button: {
        enabled: [35, 80, 35, 1.0],
        disabled: [255, 255, 255, 0.15],
      },
      sidebar: [35, 80, 35, 0.6],
    },
    light: {
      name: 'light',
      button: {
        enabled: [35, 80, 35, 1.0],
        disabled: [255, 255, 255, 0.15],
      },
      sidebar: [35, 80, 35, 0.6],
    },
    theme_name_1: {
      name: 'theme_name_1',
      button: {
        enabled: [35, 80, 35, 1.0],
        disabled: [255, 255, 255, 0.15],
      },
      sidebar: [35, 80, 35, 0.6],
    },
    theme_name_2: {
      name: 'theme_name_2',
      button: {
        enabled: [35, 80, 35, 1.0],
        disabled: [255, 255, 255, 0.15],
      },
      sidebar: [35, 80, 35, 0.6],
    },
  },
  activeTheme: 'dark',
};

// eslint-disable-next-line require-jsdoc
export function setSettings(settings: Settings = sample) {
  browser.storage.sync.get('twitchFavoriteChannels')
      .then((resp) => {
        if (resp) {
          settings['favorites'] = resp['twitchFavoriteChannels'];
        }
      })
      .finally(
          () => {
            browser.storage.sync.set({'newkey': settings})
                .then((resp) => {
                  console.log(resp);
                })
                .catch((err) => console.log(err));
          },
      );
}

// eslint-disable-next-line require-jsdoc
export async function getSettings(): Promise<Settings> {
  const resp = await browser.storage.sync.get('newkey');
  console.log(resp);
  return resp['newkey'];
}

// eslint-disable-next-line require-jsdoc
export async function getColorTheme(): Promise<Theme> {
  const theme = await getSettings();
  return theme.themes[theme.activeTheme];
}

// eslint-disable-next-line require-jsdoc
export async function getActiveThemeName(): Promise<string> {
  const theme = await getSettings();
  return theme.activeTheme;
}

// eslint-disable-next-line require-jsdoc
export async function setColorTheme(name: string, theme: any, activate: boolean = false) {
  const settings = await getSettings();
  console.log('HERE');
  console.log(settings);
  settings.themes[name] = theme;
  if (activate) {
    settings.activeTheme = name;
  }
  console.log(settings);
  return theme.activeTheme;
}

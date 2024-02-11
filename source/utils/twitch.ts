import { getLogger } from "./logging"

const logger = getLogger('ContentScript')


export const themes = { 'DARK': 0, 'LIGHT': 1 }


// export const getTwitchTheme = (): number => {
export function getTwitchTheme(): number {
    const darkElements = document.getElementsByClassName('tw-root--theme-dark')
    for (let index = 0; index < darkElements.length; index++) {
        if (darkElements[index].tagName === 'HTML') { return themes.DARK }
    }

    const lightElements = document.getElementsByClassName('tw-root--theme-light')
    for (let index = 0; index < lightElements.length; index++) {
        if (lightElements[index].tagName === 'HTML') { return themes.LIGHT }
    }

    logger.warn('Unable to find the current theme. Defaulting to Dark.')
    return themes.DARK

}

// export const usesDarkTheme = (): boolean => {
export function usesDarkTheme(): boolean {
    return getTwitchTheme() === themes.DARK
}
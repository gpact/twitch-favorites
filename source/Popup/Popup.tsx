import React from 'react';
import {SketchPicker, ColorResult} from 'react-color';
import './styles.scss';
import {getColorTheme, setSettings, getSettings, Theme} from '../Background/settings';

/**
 * Components to hex
 * @param {number} component - ...
 * @return {string}
 */
function componentToHex(component: number): string {
  const hex = component.toString(16);
  return hex.length == 1 ? '0' + hex : hex;
}

/**
 * Rgbs to hex
 * @param {number[]} arr -
 * @return {string}
 */
function rgbComponentsToHex(arr: number[]): string {
  // FIXME: This will not handle alpha.
  return '#' + componentToHex(arr[0]) + componentToHex(arr[1]) + componentToHex(arr[2]);
}

/**
 * Hexs to rgb
 * @param {string} hex
 * @return {number[]|null} ...
 */
// function hexToRgbComponents(hex: string): number[] | null {
//   // Expand shorthand form (e.g. `03F`) to full form (e.g. `0033FF`).
//   const shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
//   hex = hex.replace(shorthandRegex, (_, r, g, b) => r + r + g + g + b + b);

//   const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
//   if (!result) {
//     return null;
//   }
//   return [parseInt(result[1], 16), parseInt(result[2], 16), parseInt(result[3], 16)];
// }

/**
 * Popup
 */
class Popup extends React.Component {
  state = {
    background: '#fff',
  };

  /**
   * Creates an instance of popup.
   * @param props
   */
  constructor(props: any) {
    super(props);
    this.handleChangeComplete = this.handleChangeComplete.bind(this);
  }

  /**
   * Components did mount
   */
  public componentDidMount(): void {
    getColorTheme()
        .then((theme: Theme) => {
          const hex = rgbComponentsToHex(theme.button.enabled);
          this.setState({background: hex});
        });
  }

  /**
   * Handle change complete of popup
   * @param {ColorResult} color
   */
  handleChangeComplete(color: ColorResult) {
    console.log(color);
    // const components = hexToRgbComponents(color.hex);
    const components = [color.rgb.r, color.rgb.g, color.rgb.b, color.rgb.a || 1];
    this.setState({background: color.hex});
    if (components) {
      this.updateStorageSettings(components);
    }
  }

  /**
   * Updates storage settings
   * @param {number[]} components - ...
   */
  public updateStorageSettings(components: number[]): void {
    // Make sure we have the alpha component.
    if (components.length === 3) components.push(1.0);
    console.log('HERE');
    getSettings()
        .then((settings) => {
          settings.themes[settings.activeTheme].button.enabled = components;
          settings.themes[settings.activeTheme].sidebar = components;
          setSettings(settings);
          console.log('DONE');
        })
        .catch((err) => console.error(err));
  }

  /**
   * Renders popup
   * @return {JSX.Element}
   */
  render(): JSX.Element {
    return (
      <>
        <SketchPicker
          color={ this.state.background }
          onChangeComplete={ this.handleChangeComplete }
        />
      </>
    );
  }
}

export default Popup;

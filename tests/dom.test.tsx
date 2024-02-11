// const x = '<html><body><div>ABC</div></body></html>'
import { getElementByXpath } from '../source/utils/dom'

describe('getElementByXpath', () => {
  let container: HTMLElement

  beforeAll(() => {
    let block = `
    <div>
      <span id='firstSpan'></span>
      <span id='secondSpan'></span>
      <button id='button'>
        <span id='thirdSpan'>
        <span></span>
        </span>
      </button>
    </div>
    `
    container = document.createElement("div")
    container.innerHTML = block
    document.body.appendChild(container)
  })

  afterAll(() => {
    container.parentElement?.removeChild(container)
    console.log(document.body.outerHTML)
  })

  it('should return an existing element for a valid xpath', () => {
    expect(getElementByXpath('//span')).not.toBeNull()
    expect(getElementByXpath('//button')).not.toBeNull()
  })

  it('should only return the first element in the DOM', () => {
    expect(getElementByXpath('//span')?.id).toBe('firstSpan')
    expect(getElementByXpath('//span[span]')?.id).toBe('thirdSpan')
  })
  
  it('should return null if there is no elements for the given path', () => {
    expect(getElementByXpath('//h1')).toBeNull()
    expect(getElementByXpath('//p')).toBeNull()
  })

  it('should return null if no XPATH is provided', () => {
    expect(getElementByXpath('')).toBeNull()
  })
})

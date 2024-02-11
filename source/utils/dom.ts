export function getElementByXpath(path: string): HTMLElement | null {
    if (!path) return null
    const result = document.evaluate(path, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null)
    return (result && result.singleNodeValue) ? result.singleNodeValue as HTMLElement : null
}
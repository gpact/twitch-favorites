export class Color {
    r: number
    g: number
    b: number
    alpha: number

    constructor(r: number, g: number, b: number, a: number = 1.0) {
        this.r = r
        this.g = g
        this.b = b
        this.alpha = a
    }

    toHtml(alphaOverride: number | null = null) {
        const alpha = alphaOverride !== null ? alphaOverride : this.alpha
        if (alpha === 1.0) return `rgb(${this.r}, ${this.g}, ${this.b})`
        return `rgba(${this.r}, ${this.g}, ${this.b}, ${alpha})`
    }

}

export default Color

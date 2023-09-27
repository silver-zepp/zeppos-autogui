// console.log(multiplyHexColor(0xFF0000, 1.3)); // prints 0xFF3333 (30% mult)
// can also divide eg (0xFF0000, 0.7) for 30% division
export function multiplyHexColor(hexColor, multiplier) {
    hexColor = Math.floor(hexColor).toString(16); 

    let r = parseInt(hexColor.substring(0,2), 16);
    let g = parseInt(hexColor.substring(2,4), 16);
    let b = parseInt(hexColor.substring(4,6), 16);
    
    r = Math.min(Math.round(r * multiplier), 255);
    g = Math.min(Math.round(g * multiplier), 255);
    b = Math.min(Math.round(b * multiplier), 255);

    return '0x' + ((r << 16) | (g << 8) | b).toString(16).padStart(6, '0');
}
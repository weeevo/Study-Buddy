export function formatTime(ms) {
    let totalSeconds = Math.floor(ms / 1000);
    let hours = Math.floor(totalSeconds / 3600);
    let minutes = Math.floor((totalSeconds % 3600) / 60);
    let seconds = totalSeconds % 60;

    if (hours > 0) {
        return `${hours}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
    } else {
        return `${minutes}:${String(seconds).padStart(2, "0")}`;
    }
}

export function formatTimeMinutes(ms) {
  let totalSeconds = Math.floor(ms / 1000);
  let minutes = totalSeconds / 60;
  return minutes;
}

export function applyCustomColors({ color1, color2, color3, color4 }) {
    const root = document.documentElement;

    const color1shades = generateShades(color1);
    root.style.setProperty('--yellow-text', color1shades.text)
    root.style.setProperty('--yellow-highlight', color1shades.highlight);
    root.style.setProperty('--yellow-lowlight', color1shades.lowlight);
    root.style.setProperty('--yellow-shadow', color1shades.shadow);
    root.style.setProperty('--yellow-inset', color1shades.inset);

    const color2shades = generateShades(color2);
    root.style.setProperty('--blue-text', color2shades.text)
    root.style.setProperty('--blue-highlight', color2shades.highlight);
    root.style.setProperty('--blue-lowlight', color2shades.lowlight);
    root.style.setProperty('--blue-shadow', color2shades.shadow);
    root.style.setProperty('--blue-inset', color2shades.inset);

    const color3shades = generateShades(color3);
    root.style.setProperty('--green-text', color3shades.text)
    root.style.setProperty('--green-highlight', color3shades.highlight);
    root.style.setProperty('--green-lowlight', color3shades.lowlight);
    root.style.setProperty('--green-shadow', color3shades.shadow);
    root.style.setProperty('--green-inset', color3shades.inset);

    const color4shades = generateShades(color4);
    root.style.setProperty('--red-text', color4shades.text)
    root.style.setProperty('--red-highlight', color4shades.highlight);
    root.style.setProperty('--red-lowlight', color4shades.lowlight);
    root.style.setProperty('--red-shadow', color4shades.shadow);
    root.style.setProperty('--red-inset', color4shades.inset);
}

export function generateShades(hex) {
    return {
        text: getTextColor(hex),
        highlight: hex,
        lowlight: darken(hex, 10),
        shadow: darken(hex, 20),
        inset: darken(hex, 15)
    };
}

function darken(hex, percent) {
    const amt = Math.round(2.55 * percent);
    const num = parseInt(hex.replace("#", ""), 16);
    const R = Math.max((num >> 16) - amt, 0);
    const G = Math.max(((num >> 8) & 0x00FF) - amt, 0);
    const B = Math.max((num & 0x0000FF) - amt, 0);
    return `#${(1 << 24 | R << 16 | G << 8 | B).toString(16).slice(1)}`;
}

function lighten(hex, percent) {
    const amt = Math.round(2.55 * percent);
    const num = parseInt(hex.replace("#", ""), 16);
    const R = Math.min((num >> 16) + amt, 255);
    const G = Math.min(((num >> 8) & 0x00FF) + amt, 255);
    const B = Math.min((num & 0x0000FF) + amt, 255);
    return `#${(1 << 24 | R << 16 | G << 8 | B).toString(16).slice(1)}`;
}

function rgbToHsl(r, g, b){
    r /= 255, g /= 255, b /= 255;
    var max = Math.max(r, g, b), min = Math.min(r, g, b);
    var h, s, l = (max + min) / 2;

    if(max == min){
        h = s = 0; // achromatic
    }else{
        var d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        switch(max){
            case r: h = (g - b) / d + (g < b ? 6 : 0); break;
            case g: h = (b - r) / d + 2; break;
            case b: h = (r - g) / d + 4; break;
        }
        h /= 6;
    }

    return [h, s, l];
}

function getTextColor(hex){
    //convert to rgb
    var r = parseInt(hex.substr(1,2), 16);
    var g = parseInt(hex.substr(3,2), 16);
    var b = parseInt(hex.substr(5,2), 16);

    //convert to hsl
    r /= 255;
    g /= 255; 
    b /= 255;
    var max = Math.max(r, g, b), min = Math.min(r, g, b);
    var h, s, l = (max + min) / 2;

    if(max == min){
        h = s = 0; // achromatic
    }else{
        var d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        switch(max){
            case r: h = (g - b) / d + (g < b ? 6 : 0); break;
            case g: h = (b - r) / d + 2; break;
            case b: h = (r - g) / d + 4; break;
        }
        h /= 6;
    }

    if(l > .7){
        return "#000000"
    }
    else{
        return "#ffffff"
    }
}
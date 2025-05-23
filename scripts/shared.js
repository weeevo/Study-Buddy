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
    root.style.setProperty('--yellow-highlight', color1shades.highlight);
    root.style.setProperty('--yellow-lowlight', color1shades.lowlight);
    root.style.setProperty('--yellow-shadow', color1shades.shadow);
    root.style.setProperty('--yellow-inset', color1shades.inset);

    const color2shades = generateShades(color2);
    root.style.setProperty('--blue-highlight', color2shades.highlight);
    root.style.setProperty('--blue-lowlight', color2shades.lowlight);
    root.style.setProperty('--blue-shadow', color2shades.shadow);
    root.style.setProperty('--blue-inset', color2shades.inset);

    const color3shades = generateShades(color3);
    root.style.setProperty('--green-highlight', color3shades.highlight);
    root.style.setProperty('--green-lowlight', color3shades.lowlight);
    root.style.setProperty('--green-shadow', color3shades.shadow);
    root.style.setProperty('--green-inset', color3shades.inset);

    const color4shades = generateShades(color4);
    root.style.setProperty('--red-highlight', color4shades.highlight);
    root.style.setProperty('--red-lowlight', color4shades.lowlight);
    root.style.setProperty('--red-shadow', color4shades.shadow);
    root.style.setProperty('--red-inset', color4shades.inset);
}

export function generateShades(hex) {
    return {
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

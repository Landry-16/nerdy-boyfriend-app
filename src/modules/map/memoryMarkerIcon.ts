import { divIcon } from 'leaflet'

// A small rounded pin in the app's palette instead of Leaflet's default
// blue marker (whose image assets do not resolve correctly with Vite
// anyway), matching the "cute" visual language used across the app.
export function createMemoryMarkerIcon() {
  return divIcon({
    className: '',
    html: `
      <div style="
        width: 34px; height: 34px;
        display: flex; align-items: center; justify-content: center;
        background: #F5D5D8;
        border: 2px solid #FAF8F3;
        border-radius: 9999px 9999px 9999px 4px;
        transform: rotate(45deg);
        box-shadow: 0 2px 6px rgba(74, 69, 63, 0.25);
      ">
        <span style="transform: rotate(-45deg); font-size: 16px; line-height: 1;">💛</span>
      </div>
    `,
    iconSize: [34, 34],
    iconAnchor: [17, 32],
    popupAnchor: [0, -30],
  })
}

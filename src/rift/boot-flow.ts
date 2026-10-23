/** A static light-trail texture; CSS moves two bounded planes, never a face or logo. */
const paths = [
 'M8 32C126 30 156 126 310 130',
 'M22 72C126 60 194 142 310 130',
 'M0 129C114 106 217 143 310 130',
 'M36 175C146 202 214 118 310 130',
 'M52 220C166 208 206 122 310 130',
]
export const RIFT_FLOW_IMAGE = 'data:image/svg+xml,'+encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 260" fill="none"><defs><linearGradient id="trail"><stop stop-color="#80bdff" stop-opacity="0"/><stop offset=".55" stop-color="#8bcbff" stop-opacity=".55"/><stop offset="1" stop-color="#e6f6ff"/></linearGradient></defs><g stroke="url(#trail)" stroke-linecap="round">${paths.map((d,i)=>`<path d="${d}" stroke-width="${i===2?2:1}"/><path d="${d}" stroke-width="${i===2?6:3}" opacity=".12"/>`).join('')}</g><g fill="#c3e7ff"><circle cx="124" cy="53" r="1.8"/><circle cx="192" cy="114" r="2"/><circle cx="226" cy="139" r="1.5"/><circle cx="101" cy="194" r="1.6"/><circle cx="252" cy="136" r="2.2"/><circle cx="64" cy="121" r="1.2"/></g></svg>`)

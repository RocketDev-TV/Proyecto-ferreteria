// Si estás programando en tu compu (localhost), usa la ruta local.
// Si alguien entra desde la URL pública, usa la ruta segura (HTTPS) en el puerto 8443
export const API_URL = window.location.hostname === 'localhost' 
    ? 'http://localhost:8080' 
    : `https://${window.location.hostname}:8443`;
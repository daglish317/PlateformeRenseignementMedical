export const MAP = {
  /**
   * Position par défaut (Centre du Cameroun).
   * Utilisée avant d'obtenir la géolocalisation.
   */
  defaultCenter: {
    lat: 7.3697,
    lng: 12.3547,
  },

  /**
   * Zoom initial.
   */
  defaultZoom: 6,

  /**
   * Zoom lorsque l'utilisateur est localisé.
   */
  userZoom: 16,

  /**
   * Zoom lors de la sélection d'une structure.
   */
  structureZoom: 17,

  /**
   * Limites du zoom.
   */
  minZoom: 5,
  maxZoom: 19,

  /**
   * Animation de déplacement.
   */
  flyTo: {
    duration: 1.5,
  },

  /**
   * Recherche des structures.
   */
  search: {
    defaultRadius: 5000,   // 5 km
    maxRadius: 50000,      // 50 km
  },

  /**
   * Rafraîchissement de la position GPS.
   */
  geolocation: {
    enableHighAccuracy: true,
    timeout: 10000,
    maximumAge: 30000,
  },

  /**
   * Taille des marqueurs.
   */
  marker: {
    iconSize: [42, 42] as const,
    iconAnchor: [21, 42] as const,
    popupAnchor: [0, -36] as const,
  },

  /**
   * Style de l'itinéraire.
   */
  route: {
    weight: 6,
    opacity: 0.9,
  },
} as const;
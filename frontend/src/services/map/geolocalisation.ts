export type UserLocation = {
  latitude: number;
  longitude: number;
};


export function getCurrentLocation(): Promise<UserLocation> {
  return new Promise((resolve, reject) => {

    if (!navigator.geolocation) {
      reject(
        new Error(
          "La géolocalisation n'est pas supportée par ce navigateur."
        )
      );

      return;
    }


    navigator.geolocation.getCurrentPosition(
      (position) => {

        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });

      },

      (error) => {

        reject(error);

      },

      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 30000,
      }
    );

  });
}

/**
 * Suivi continu de la position (spec moteurRecherche.md §21-26).
 *
 * Le suivi est contrôlé côté appelant : le callback n'est déclenché que
 * lorsque la position évolue de manière significative, afin de limiter
 * les requêtes, la consommation réseau et la charge serveur.
 *
 * Retourne une fonction de nettoyage (arrêt du suivi).
 */
export function watchPosition(
  onPosition: (location: UserLocation) => void,
  onError?: (error: string) => void
): () => void {
  if (!navigator.geolocation) {
    onError?.("La géolocalisation n'est pas supportée par ce navigateur.");
    return () => {};
  }

  const watchId = navigator.geolocation.watchPosition(
    (position) => {
      onPosition({
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
      });
    },
    (error) => {
      onError?.(error.message);
    },
    {
      enableHighAccuracy: true,
      timeout: 15000,
      maximumAge: 10000,
    }
  );

  return () => navigator.geolocation.clearWatch(watchId);
}
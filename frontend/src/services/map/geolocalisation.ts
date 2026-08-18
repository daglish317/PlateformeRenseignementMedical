export type UserLocation = {
  latitude: number;
  longitude: number;
  accuracy?: number;
};

const TARGET_ACCURACY_METERS = 50;
const MAX_LOCATION_WAIT_MS = 8000;

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

    let settled = false;
    let bestPosition: GeolocationPosition | null = null;

    const finish = (position: GeolocationPosition) => {
      if (settled) return;
      settled = true;
      navigator.geolocation.clearWatch(watchId);
      clearTimeout(timeoutId);
      resolve({
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        accuracy: position.coords.accuracy,
      });
    };

    const timeoutId = window.setTimeout(() => {
      if (settled) return;
      if (bestPosition) {
        finish(bestPosition);
        return;
      }
      settled = true;
      navigator.geolocation.clearWatch(watchId);
      reject(new Error("Impossible d'obtenir une position GPS fiable."));
    }, MAX_LOCATION_WAIT_MS);

    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        if (
          !bestPosition ||
          position.coords.accuracy < bestPosition.coords.accuracy
        ) {
          bestPosition = position;
        }

        if (position.coords.accuracy <= TARGET_ACCURACY_METERS) {
          finish(position);
        }

      },

      (error) => {
        if (bestPosition) {
          finish(bestPosition);
          return;
        }
        if (settled) return;
        settled = true;
        navigator.geolocation.clearWatch(watchId);
        clearTimeout(timeoutId);
        reject(error);

      },

      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
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
        accuracy: position.coords.accuracy,
      });
    },
    (error) => {
      onError?.(error.message);
    },
    {
      enableHighAccuracy: true,
      timeout: 15000,
      maximumAge: 0,
    }
  );

  return () => navigator.geolocation.clearWatch(watchId);
}

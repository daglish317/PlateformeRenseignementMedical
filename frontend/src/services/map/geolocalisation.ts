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
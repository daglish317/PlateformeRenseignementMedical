"use client";

import { useCallback, useState } from "react";

import {
  getCurrentLocation,
  type UserLocation,
} from "@/services/map/geolocalisation";


export function useCurrentLocation() {

  const [location, setLocation] =
    useState<UserLocation | null>(null);


  const [loading, setLoading] =
    useState(false);


  const [error, setError] =
    useState<string | null>(null);



  const locateUser = useCallback(async () => {

    try {

      setLoading(true);
      setError(null);


      const position =
        await getCurrentLocation();


      setLocation(position);


      return position;


    } catch (err) {

      const message =
        err instanceof Error
          ? err.message
          : "Impossible d'obtenir votre position.";


      setError(message);

      return null;


    } finally {

      setLoading(false);

    }

  }, []);



  return {
    location,
    loading,
    error,
    locateUser,
  };

}
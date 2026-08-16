"use client";

import { Marker, Popup } from "react-leaflet";
import L from "leaflet";
import { Phone, MapPin, Navigation, Info } from "lucide-react";
import { useRouter } from "@/i18n/navigation";

import { useStructureSelectionStore } from "@/features/structure-selection/store/structure-selection-store";
import type { MapStructure } from "./MedicalMap";

type StructureMarkerProps = {
  structure: MapStructure;
};

const HOPITAL_COLOR = "#2563eb";
const PHARMACIE_COLOR = "#059669";

const PIN_WIDTH = 34;
const PIN_HEIGHT = 44;

function pinSvg(color: string, glyph: string) {
  return `
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="${PIN_WIDTH}"
      height="${PIN_HEIGHT}"
      viewBox="0 0 34 44"
    >
      <path
        d="M17 0C7.6 0 0 7.6 0 17c0 12.8 17 27 17 27s17-14.2 17-27C34 7.6 26.4 0 17 0Z"
        fill="${color}"
        stroke="#ffffff"
        stroke-width="1.5"
      />
      ${glyph}
    </svg>
  `;
}

const CROSS_GLYPH = `
  <rect x="14" y="8" width="6" height="16" rx="1.5" fill="#ffffff" />
  <rect x="9" y="13" width="16" height="6" rx="1.5" fill="#ffffff" />
`;

const CAPSULE_GLYPH = `
  <g transform="rotate(45 17 17)">
    <rect x="12.5" y="9" width="9" height="16" rx="4.5" fill="#ffffff" />
    <rect x="15.5" y="9" width="3" height="16" fill="${PHARMACIE_COLOR}" opacity="0.35" />
  </g>
`;

function buildIcon(type: string, selected: boolean) {
  const isHopital = type === "HOPITAL";
  const color = isHopital ? HOPITAL_COLOR : PHARMACIE_COLOR;
  const glyph = isHopital ? CROSS_GLYPH : CAPSULE_GLYPH;
  const scale = selected ? 1.22 : 1;

  return L.divIcon({
    className: "",
    html: `
      <div
        style="
          transform: scale(${scale});
          transform-origin: 50% 100%;
          transition: transform 0.2s ease;
          filter: drop-shadow(0 3px 4px rgba(0, 0, 0, 0.35));
          width: ${PIN_WIDTH}px;
          height: ${PIN_HEIGHT}px;
        "
      >
        ${pinSvg(color, glyph)}
      </div>
    `,
    iconSize: [PIN_WIDTH, PIN_HEIGHT],
    iconAnchor: [PIN_WIDTH / 2, PIN_HEIGHT],
    popupAnchor: [0, -PIN_HEIGHT + 6],
  });
}

export default function StructureMarker({
  structure,
}: StructureMarkerProps) {
  const router = useRouter();
  const setSelectedStructure = useStructureSelectionStore((state) => state.setSelectedStructure);
  const selectedStructure = useStructureSelectionStore((state) => state.selectedStructure);
  // Ne pas afficher le marqueur si pas de coordonnées
  if (structure.latitude === null || structure.longitude === null) {
    return null;
  }

  const selected = selectedStructure?.id === structure.id;
  const icon = buildIcon(structure.type, selected);

  // Calculer le temps de marche estimé (5 km/h en moyenne)
  const walkingTimeMinutes = structure.distance_km 
    ? Math.round((structure.distance_km / 5) * 60) 
    : null;

  // Calculer le temps en voiture estimé (40 km/h en moyenne urbaine)
  const drivingTimeMinutes = structure.distance_km 
    ? Math.round((structure.distance_km / 40) * 60) 
    : null;

  const handleViewDetails = () => {
    router.push(`/structure/${structure.id}`);
  };

  const handleGetDirections = () => {
    setSelectedStructure(structure);
    // La logique de routing sera gérée par le composant RouteLayer
    // qui écoute les changements de selectedStructure
  };

  return (
    <Marker
      position={[
        structure.latitude,
        structure.longitude,
      ]}
      icon={icon}
      eventHandlers={{
        click: () => {
          setSelectedStructure(structure);
        },
      }}
    >
      <Popup maxWidth={300} className="structure-popup">
        <div className="space-y-3 p-1">
          {/* En-tête */}
          <div className="border-b pb-2">
            <h3 className="font-semibold text-base text-gray-900 dark:text-white">
              {structure.nom}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
              {structure.type === "HOPITAL" ? "Hôpital" : "Pharmacie"}
            </p>
          </div>

          {/* Adresse */}
          <div className="flex items-start gap-2">
            <MapPin className="w-4 h-4 text-gray-500 dark:text-gray-400 mt-0.5 flex-shrink-0" />
            <p className="text-sm text-gray-700 dark:text-gray-300">
              {structure.adresse}
            </p>
          </div>

          {/* Distance et temps */}
          {structure.distance_km !== null && structure.distance_km !== undefined && (
            <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
              <span className="font-medium">
                📍 {structure.distance_km.toFixed(1)} km
              </span>
              {walkingTimeMinutes !== null && walkingTimeMinutes > 0 && (
                <span>🚶 ~{walkingTimeMinutes} min</span>
              )}
              {drivingTimeMinutes !== null && drivingTimeMinutes > 0 && (
                <span>🚗 ~{drivingTimeMinutes} min</span>
              )}
            </div>
          )}

          {/* Téléphone */}
          {structure.telephone && (
            <div className="flex items-center gap-2">
              <Phone className="w-4 h-4 text-gray-500 dark:text-gray-400 flex-shrink-0" />
              <a 
                href={`tel:${structure.telephone}`}
                className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
              >
                {structure.telephone}
              </a>
            </div>
          )}

          {/* TODO: Horaires - À implémenter quand disponible depuis l'API */}
          {/* <div className="text-sm text-gray-600 dark:text-gray-400">
            <p className="font-medium">Horaires:</p>
            <p>Ouvert • Ferme à 18h00</p>
          </div> */}

          {/* Boutons d'action */}
          <div className="flex gap-2 pt-2 border-t">
            <button
              onClick={handleViewDetails}
              className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
            >
              <Info className="w-4 h-4" />
              Voir la fiche
            </button>
            <button
              onClick={handleGetDirections}
              className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 hover:bg-green-100 dark:hover:bg-green-900/30 rounded-lg transition-colors"
            >
              <Navigation className="w-4 h-4" />
              Itinéraire
            </button>
          </div>
        </div>
      </Popup>
    </Marker>
  );
}

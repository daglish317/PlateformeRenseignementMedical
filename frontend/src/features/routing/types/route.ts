export type RouteCoordinate = [number, number];

export type Route = {
  coordinates: RouteCoordinate[];
  distance: number;
  duration: number;
};

export type RouteResponse = {
  route: Route;
};

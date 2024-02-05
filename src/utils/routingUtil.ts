
import L from "leaflet";

/**
 * 
 * @param L 
 * @param waypoints 
 * @param mapRef 
 * @returns L.Routing.Control
 * 
 * routing util which uses routing to generates paths
 */
export const routingUtilExported = (L:any ,waypoints: any[], mapRef:L.Map) => {
    let routeControl: L.Routing.Control = L.Routing.control({
      waypoints: waypoints,
      // routeWhileDragging: true,
      // showAlternatives: false,
      addWaypoints: false,
  
      //@ts-ignore
      draggableWaypoints: false,
      //@ts-ignore
      geocoder: L.Control.Geocoder.nominatim(),
    }).addTo(mapRef);
    console.log(`oof ${waypoints.length}`);

    return routeControl 
  };
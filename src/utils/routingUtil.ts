
export const routingUtilExported = (L:any,routeControl2:any,waypoints: any, mapRef: any) => {
    routeControl2 = L.Routing.control({
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
  };
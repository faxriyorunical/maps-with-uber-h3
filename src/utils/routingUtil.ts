
export const routingUtilExported = (L:any,waypoints: any, mapRef: any) => {
    let routeControl = L.Routing.control({
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
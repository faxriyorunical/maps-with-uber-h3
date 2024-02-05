import React, { useEffect, useState } from "react";

import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Tooltip,
  ZoomControl,
  ScaleControl,
  LayersControl,
  useMap,
  useMapEvents,
} from "react-leaflet";
import L, { ControlPosition, LatLngExpression } from "leaflet";
import "leaflet-routing-machine";
import "leaflet-control-geocoder";

import "leaflet-routing-machine/dist/leaflet-routing-machine.css";
import markerIconPng from "leaflet/dist/images/marker-icon.png";
import { Icon } from "leaflet";
import "leaflet/dist/leaflet.css";
import { leafletConfig, markerPath } from "@/utils/leafletConfig";
import { routingUtilExported } from "@/utils/routingUtil";

// const markerPath = "/marker-icon.png";

let renderCount = 0;
let routeControl: any = null;

/**
 * routeControl2 with current setup is working
 */
let routeControl2: any = null;
let reRoute = false;

const RoutingMachine = (props: any) => {
  const map = useMap();

  useEffect(() => {
    if (renderCount === 0) {
      routeControl = L.Routing.control({
        waypoints: props.waypoints,
        // routeWhileDragging: true,
        // showAlternatives: false,
        addWaypoints: false,
      }).addTo(map);
      console.log(`oof ${props?.waypoints.length}`);
      renderCount++;
    }
  }, []);
  return null;
};

const geocodingUtil = (
  mapRef: any,
  latLng: any,
  reverseCodedWaypoints: any,
  setReverseCodedWaypoints: any
) => {
  // trying geocoding -- this works
  //@ts-ignore
  let geocoder = new L.Control.Geocoder.nominatim();

  // let scalingAccuracy = mapRef.options.crs.scale(mapRef.getZoom())
  let scalingAccuracy = mapRef?.options.crs.scale(20);
  console.log(scalingAccuracy, "scalingAccuracy");

  let reverseCodedValue = "";

  geocoder.reverse(latLng, scalingAccuracy, function (results: any) {
    let address = "";
    if (results?.length > 0) {
      let reverseCoded = results[0];
      console.log(reverseCoded, "reverseCoded");
      address = reverseCoded.name;
    }

    if (address != "") {
      reverseCodedValue = address;
      setReverseCodedWaypoints([...reverseCodedWaypoints, reverseCodedValue]);
    }

    if (address == "") {
      // latlng address fallback - if returns empty string set lat lng template string
      reverseCodedValue = `Lat: ${latLng.lat} , Lng: ${latLng.lng}`;
      setReverseCodedWaypoints([...reverseCodedWaypoints, reverseCodedValue]);
    }

    if (address != "") {
      /**
       * geocoding string address to coordinates
       */
      geocoder.geocode(address, function (results: any) {
        console.log(results);
        if (results?.length > 0) {
          let latLngoof = new L.LatLng(
            results[0].center.lat,
            results[0].center.lng
          );
          console.log(results);
          console.log(latLngoof, "latLngoof");
        }
      });
    }
  });
};

const RoutingMachineController = (props: any) => {
  const [waypoints, setWaypoints] = useState<L.LatLng[] | [] | any>([]);
  const [reverseCodedWaypoints, setReverseCodedWaypoints] = useState<[] | any>(
    []
  );
  const [search, setSearch] = useState(false);
  const [showMenu, setShowMenu] = useState(true);

  const showMenuHandler = () => {
    setShowMenu((prev) => !prev);
  };

  const mapRef = useMap();

  const routingUtil = () => {
    routeControl2 = routingUtilExported(L, waypoints, mapRef);
  };

  const clearUtil = () => {
    mapRef.removeControl(routeControl2);
  };

  const map = useMapEvents({
    click: (e) => {
      console.log(e);
    },
    dblclick: (e) => {
      let latLng = e.latlng;

      setWaypoints([...waypoints, L.latLng(latLng.lat, latLng.lng)]);

      if (!showMenu) {
        showMenuHandler();
      }

      geocodingUtil(
        mapRef,
        latLng,
        reverseCodedWaypoints,
        setReverseCodedWaypoints
      );
    },
  });

  useEffect(() => {
    console.log(waypoints, "useeffect waypoints");
  }, [waypoints]);

  useEffect(() => {
    console.log(reverseCodedWaypoints, "useeffect reverseCodedWaypoints");
  }, [reverseCodedWaypoints]);

  return (
    <>
      <button
        onClick={showMenuHandler}
        className="w-20 h-auto"
        style={{
          position: "absolute",
          background: "#452568",
          zIndex: 600,
          color: "white",
        }}
      >
        <p className="text-4xl align-middle text-center text-lg font-thin ">
          {showMenu
            ? "X"
            : !showMenu && waypoints.length == 0
            ? "R"
            : !showMenu && waypoints.length > 0 && "~R~"}
        </p>
      </button>

      {showMenu && (
        <div
          className="min-h-12 w-screen md:w-1/2"
          style={{
            position: "absolute",
            background: "#fff",
            zIndex: 500,
          }}
        >
          <div className={`p-3 align-middle text-center text-lg font-thin`}>
            {waypoints.length == 0
              ? "Double Click To Mark"
              : waypoints.length == 1
              ? "Need One More Location"
              : "Click Route Button"}
            <hr />
          </div>

          {waypoints.length >= 1 && (
            <div className={`font-thin text-sm md:text-base`}>
              Selected Cordinates:
            </div>
          )}

          {waypoints.map((waypoint: any, idx: any) => (
            <div
              key={`waypoints-${idx}`}
              className="p-2 align-middle text-start text-xs md:text-sm font-thin"
            >
              {/* {`${idx} Lat: ${waypoint.lat} , Lng: ${waypoint.lng}`} */}
              {`${
                reverseCodedWaypoints?.[idx] == undefined
                  ? "~Geocoding Please Wait~"
                  : reverseCodedWaypoints?.[idx]
              }`}
            </div>
          ))}

          {waypoints.length >= 2 && (
            <div className="text-center">
              <button
                className="bg-emerald-500 pt-2 pb-2 pr-4 pl-4 mt-2 mb-4 w-52"
                onClick={async () => {
                  if (routeControl !== null) {
                    mapRef.removeControl(routeControl);

                    // routeControl2 = routingUtilExported(L, waypoints, mapRef);
                    routingUtil();
                  }

                  if (routeControl2 !== null) {
                    // mapRef.removeControl(routeControl2);
                    clearUtil();
                  }

                  // routeControl2 = routingUtilExported(L, waypoints, mapRef);
                  routingUtil();

                  setSearch(true);
                  showMenuHandler();
                  renderCount = 0;
                }}
              >
                <p className="font-thin text-base md:text-xl text-white">
                  Route
                </p>
              </button>
            </div>
          )}

          {waypoints.length >= 1 && (
            <div className="text-center">
              <button
                className="bg-red-300 pt-2 pb-2 pr-4 pl-4 mb-4 w-52"
                onClick={() => {
                  if (routeControl !== null) mapRef.removeControl(routeControl);

                  if (routeControl2 !== null)
                    // mapRef.removeControl(routeControl2);
                    clearUtil();

                  setWaypoints([]);
                  setReverseCodedWaypoints([]);
                  setSearch(false);

                  //   window?.location.reload();
                }}
              >
                <p className="font-thin text-base md:text-xl text-white">
                  Clear
                </p>
              </button>
            </div>
          )}
        </div>
      )}

      {showMenu &&
        waypoints.map((latLng: any, idx: any) => (
          <Marker
            key={`maker-${idx}`}
            position={[latLng.lat, latLng.lng]}
            icon={
              new Icon({
                iconUrl: markerPath,
                iconSize: [25, 41],
                iconAnchor: [12, 41],
                className: "hue-rotate-90",
              })
            }
          >
            <Tooltip>
              {idx === 0
                ? `Starting Point ${idx}`
                : idx == waypoints?.length - 1
                ? `Final Point ${idx}`
                : `Point ${idx}`}
            </Tooltip>
            <Popup>{`${
              reverseCodedWaypoints?.[idx] == undefined
                ? "~Geocoding Please Wait~"
                : reverseCodedWaypoints?.[idx]
            }`}</Popup>
          </Marker>
        ))}
    </>
  );
};

/**
 *
 * @returns JSX.Element
 *
 * map component
 */
const MapComponent: () => JSX.Element = () => {
  return (
    <div className="">
      <MapContainer
        center={leafletConfig.center as LatLngExpression}
        zoom={leafletConfig.zoom}
        minZoom={leafletConfig.minZoom}
        maxZoom={leafletConfig.maxZoom}
        zoomControl={leafletConfig.zoomControl}
        doubleClickZoom={leafletConfig.doubleClickZoom}
        scrollWheelZoom={leafletConfig.scrollWheelZoom}
      >
        <TileLayer
          //   attribution='&copy; <a href="">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <ScaleControl
          position={leafletConfig.scaleControlPos as ControlPosition}
        />

        <ZoomControl
          position={leafletConfig.zoomControlPos as ControlPosition}
        />

        <Marker
          position={[51.505, -0.09]}
          icon={
            new Icon({
              iconUrl: markerPath,
              iconSize: [25, 41],
              iconAnchor: [12, 25],
            })
          }
        >
          <Tooltip>Tooltip</Tooltip>
          <Popup>
            A pretty CSS3 popup. <br /> Easily customizable.
          </Popup>
        </Marker>
        <RoutingMachineController />
      </MapContainer>
    </div>
  );
};

export default MapComponent;

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
import { geocodingUtilExported } from "@/utils/geocodingUtil";

// const markerPath = "/marker-icon.png";

/**
 * routeControl2 with current setup is working
 *
 * run operations on this variable to remove waypoints markers, routing points
 *
 */
let routeControl2: L.Routing.Control | null = null;

/**
 *
 * @param props
 * @returns jsx
 *
 * Routing machine
 *
 * holds waypoints & reverseCodedWaypoints states -- currently --might alter later
 *
 * has menu component - trigger routing , clear markers
 *
 * controls map events - double click to place markers ,reverse geocode and then use it routing path
 *
 */
const RoutingMachineController = (props: any) => {
  /**
   * waypoints on double click stored here
   *
   * later used for reverse geocoidng and routing machine
   */
  const [waypoints, setWaypoints] = useState<L.LatLng[] | [] | any[]>([]);

  /**
   * reverse geocoded strings are stored here
   */
  const [reverseCodedWaypoints, setReverseCodedWaypoints] = useState<
    [] | any[] | string[]
  >([]);
  const [search, setSearch] = useState<boolean>(false);

  /**
   * routing menu visiblity state
   */
  const [showMenu, setShowMenu] = useState<boolean>(true);

  /**
   * menu visibility handler
   */
  const showMenuHandler = () => {
    setShowMenu((prev) => !prev);
  };

  /**
   * leaflet mapref used for various operations
   */
  const mapRef: L.Map = useMap();

  /**
   * routing util to trigger routing machine path geneartions
   */
  const routingUtil = () => {
    routeControl2 = routingUtilExported(L, waypoints, mapRef);
  };

  /**
   *
   * @param latLng
   *
   * triggers geocodingUtilExported
   *
   * tries to reverse geocode from latlng and then stores the string value to state
   */
  const geocodingUtil = (latLng: any) => {
    geocodingUtilExported(
      L,
      mapRef,
      latLng,
      reverseCodedWaypoints,
      setReverseCodedWaypoints
    );
  };

  /**
   * clear markers , paths from the map
   */
  const clearUtil = () => {
    mapRef.removeControl(routeControl2 as L.Routing.Control);
  };

  /**
   * reset the waypoint states
   */
  const resetWaypointStates = () => {
    setWaypoints([]);
    setReverseCodedWaypoints([]);
  };

  /**
   *
   * @param e
   *
   * uses latlng from event object and adds it to waypoints state
   *
   * if menu state is false -> sets the menu visibility to true
   *
   * triggers the geocoding util for reverse geocoding latng to stringed address
   */
  const doubleClickEventUtil = (e: L.LeafletMouseEvent | any) => {
    let latLng: L.LatLng = e.latlng;

    setWaypoints([...waypoints, L.latLng(latLng.lat, latLng.lng)]);

    if (!showMenu) {
      showMenuHandler();
    }

    geocodingUtil(latLng);
  };

  /**
   * holds the mapevents
   *
   * double click map event is configured here
   */
  const map: L.Map = useMapEvents({
    click: (e) => {
      console.log(e);
    },
    dblclick: (e) => {
      doubleClickEventUtil(e);
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
                  ? `~Geocoding Please Wait~ Lat:${waypoint.lat} , Lng:${waypoint.lng}`
                  : reverseCodedWaypoints?.[idx]
              }`}
            </div>
          ))}

          {waypoints.length >= 2 && (
            <div className="text-center">
              <button
                className="bg-emerald-500 pt-2 pb-2 pr-4 pl-4 mt-2 mb-4 w-52"
                onClick={async () => {
                  if (routeControl2 !== null) {
                    clearUtil();
                  }

                  routingUtil();

                  setSearch(true);
                  showMenuHandler();
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
                  if (routeControl2 !== null) clearUtil();

                  resetWaypointStates();
                  setSearch(false);
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
                ? `Starting Point`
                : idx == waypoints?.length - 1
                ? `Final Point`
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

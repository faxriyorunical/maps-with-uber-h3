import React, { useEffect, useState } from "react";

import {
  Marker,
  Popup,
  Tooltip,
  useMap,
  useMapEvents,
  Polygon,
} from "react-leaflet";
import L from "leaflet";
import "leaflet-routing-machine";
import "leaflet-control-geocoder";

import "leaflet-routing-machine/dist/leaflet-routing-machine.css";

import { Icon } from "leaflet";
import "leaflet/dist/leaflet.css";
import { markerPath } from "@/utils/leafletConfig";
import { routingUtilExported } from "@/utils/routingUtil";
import { geocodingUtilExported } from "@/utils/geocodingUtil";
import * as h3 from "h3-js";
import {
  h3indexUtil,
  hexBoundaryUtil,
  hexCenterCoordinatesUtil,
} from "@/utils/hexUtils";
import "@geoman-io/leaflet-geoman-free";
import "@geoman-io/leaflet-geoman-free/dist/leaflet-geoman.css";
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

  /**
   * routing menu visiblity state
   */
  const [showMenu, setShowMenu] = useState<boolean>(true);

  /**
   * h3index gets stored here
   */
  const [h3IndexList, setH3IndexList] = useState<[] | any[] | string[]>([]);

  /**
   * hexCenterCoordinates gets stored here
   * list of [lat,lng]
   */
  const [hexCenterCoordinatesList, setHexCenterCoordinatesList] = useState<
    [] | any[] | L.LatLng[]
  >([]);

  /**
   * hexBoundary gets stored here
   * list of latlng boundary data
   *  [[lat,lng]]
   */
  const [hexBoundaryList, setHexBoundaryList] = useState<
    [] | any[] | [L.LatLng[]]
  >([]);

  /**
   * polygon boundary gets stored here
   * list of latlng boundary data
   *  [[lat,lng]]
   */
  const [polygonBoundaryList, setPolygonBoundaryList] = useState<
    [] | any[] | [L.LatLng[]]
  >([]);

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
    routeControl2 = routingUtilExported(waypoints, mapRef);

    console.log(routeControl2.getWaypoints(), "getWaypoints");
    console.log(routeControl2.getContainer(), "getPlgetContaineran");
    console.log(routeControl2.getRouter(), "getRouter");
    console.log(routeControl2.getPlan(), "getPgetPlanlan");
    console.log(routeControl2.getPosition(), "getPosition");
    console.log(routeControl2, "routeControl2");
    console.log(Object.keys(routeControl2), "routeControl2");
    // console.log(routeControl2._container,"_container")
    // console.log(routeControl2._plan,"_plan")
    // console.log(routeControl2._itineraryBuilder,"_itineraryBuilder")
    console.log(routeControl2.route, "instructions");
    console.log(mapRef, "mapRef");
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
   *
   * empty out - waypoints , reversecodedwaypoints , indexlist , hexcenters , hexboundarylist
   */
  const resetWaypointStates = () => {
    setWaypoints([]);
    setReverseCodedWaypoints([]);
    setH3IndexList([]);
    setHexCenterCoordinatesList([]);
    setHexBoundaryList([]);
  };

  /**
   * clearbuttonhandler
   *
   * triggered using clear button from menu
   *
   * on trigger- checks if routeControl2 is not null -> then clears the map using clearutil
   *
   * always resets the waypoints and reverseCodedWaypoints
   */
  const clearButtonHandler = () => {
    if (routeControl2 !== null) clearUtil();

    resetWaypointStates();
  };

  /**
   *
   * @param latLng
   *
   * h3combo util
   *
   * generate h3index from latlng and store to state
   *
   * generate hex center coordiantes and store to state
   *
   * generate hex boundary [[lat,lng]] using h3index string and store to state.
   */
  const h3ComboUtil = (latLng: L.LatLng) => {
    const h3Index: string = h3indexUtil(latLng, setH3IndexList, 11);

    const hexCenterCoordinates: h3.CoordPair = hexCenterCoordinatesUtil(
      h3Index,
      setHexCenterCoordinatesList
    );

    hexBoundaryUtil(h3Index, setHexBoundaryList);
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

    h3ComboUtil(latLng);
  };

  /**
   * holds the mapevents
   *
   * double click map event is configured here
   */
  const mapEvents: L.Map = useMapEvents({
    click: (e) => {
      console.log(e);
      console.log(e.layerPoint);
    },
    dblclick: (e) => {
      doubleClickEventUtil(e);
    },
  });

  // add Leaflet-Geoman controls with some options to the map
  mapRef.pm.addControls({
    position: "bottomleft",
    drawCircleMarker: false,
    rotateMode: false,
    // drawMarker: waypoints.length > 0 ? false : true,
    drawMarker: false,
    drawPolyline: false,
    drawCircle: false,
    cutPolygon: false,
    drawText: false,

    //conditionally show toolbar options based on polygonBoundaryList state
    drawRectangle:polygonBoundaryList.length==0 && true,
    drawPolygon:polygonBoundaryList.length==0 && true,
    editMode:polygonBoundaryList.length==1 && true,
    dragMode:polygonBoundaryList.length==1 && true,
    removalMode:polygonBoundaryList.length==1 && true,
  });

  //Called when a shape is drawn/finished. Payload includes shape type and the drawn layer.
  // re write polygon state triggered by various events
  mapRef.on("pm:create", (e) => {
    let layer = e.layer;
    console.log(layer, "pm:create -- created layer");
    console.log(Object.keys(layer), "pm:create --keys created layer");
    //@ts-ignore
    console.log(layer?._latlngs?.[0], "pm:create --getlatlngs created layer");

    //@ts-ignore
    let latLngs = layer?._latlngs?.[0];

    setPolygonBoundaryList(() => [latLngs]);

    //Fired when Edit Mode is disabled and a layer is edited and its coordinates have changed.
    layer.on("pm:update", function (e) {
      console.log(layer, "pm:update -- updated layer");
      //@ts-ignore
      latLngs = layer?._latlngs?.[0];

      setPolygonBoundaryList(() => [latLngs]);
    });

    // //Fired when Drag Mode on a layer is disabled.
    // layer.on("pm:dragdisable", function (e) {
    //   console.log(layer, "pm:dragdisable -- dragdisable layer");
    // });

    //Fired when Drag Mode on a layer is disabled.
    layer.on("pm:remove", function (e) {
      console.log(layer, "pm:remove -- remove layer");
      setPolygonBoundaryList(() => []);
    });
  });

  useEffect(() => {
    console.log(waypoints, "useeffect waypoints");
    // function oof() {
    //   var allLayers = L.featureGroup();
    //   mapRef.eachLayer(function (layer) {
    //     console.log(typeof layer);
    //     console.log(layer instanceof L.Polygon);
    //     // if (layer instanceof L.Path || layer instanceof L.Marker) {
    //     if (layer instanceof L.Polygon) {
    //       allLayers.addLayer(layer);
    //     }
    //   });
    //   console.log(allLayers, "allLayers");
    // }

    // oof();

    let geomanLayers = mapRef.pm.getGeomanLayers();
    console.log(geomanLayers, "geomanLayers");

    // var layers = L.PM.Utils.findLayers(mapRef);
    // console.log(layers, " L.PM.Utils.findLayers(mapRef)");
    // var group = L.featureGroup();
    // layers.forEach((layer) => {
    //   group.addLayer(layer);
    // });
    // console.log(group, "group");

    // console.log(geomanLayers.length>=2 && geomanLayers?.[1]?.getLatLngs(),"geomanLayers")
  }, [waypoints]);

  // useEffect(() => {
  //   console.log(reverseCodedWaypoints, "useeffect reverseCodedWaypoints");
  // }, [reverseCodedWaypoints]);

  // useEffect(() => {
  //   console.log(hexBoundaryList, "useeffect hexBoundaryList");
  // }, [hexBoundaryList]);

  // useEffect(() => {
  //   console.log(hexCenterCoordinatesList, "useeffect hexCenterCoordinatesList");
  // }, [hexCenterCoordinatesList]);

  // useEffect(() => {
  //   console.log(h3IndexList, "useeffect h3IndexList");
  // }, [h3IndexList]);

  useEffect(() => {
    console.log(polygonBoundaryList, "useeffect polygonBoundaryList");
  }, [polygonBoundaryList]);

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
                onClick={clearButtonHandler}
              >
                <p className="font-thin text-base md:text-xl text-white">
                  Clear
                </p>
              </button>
            </div>
          )}
        </div>
      )}

      {
        // showMenu &&

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
            <Tooltip permanent={true}>
              {idx === 0
                ? `Starting Point`
                : idx == waypoints?.length - 1
                ? `Final Point`
                : `Point ${idx}`}
            </Tooltip>
            <Popup>
              {`${
                reverseCodedWaypoints?.[idx] == undefined
                  ? "~Geocoding Please Wait~"
                  : reverseCodedWaypoints?.[idx]
              }`}
              <br />
              <hr />
              {`Marker latlng:`}
              <br />
              {`Lat:${latLng?.lat} , Lng:${latLng?.lng}`}
              <br />
              <hr />
              {`H3 index: ${h3IndexList?.[idx]}`}
              <br />
              {`H3 center latlng: ${hexCenterCoordinatesList?.[idx]}`}
            </Popup>
          </Marker>
        ))
      }

      {hexBoundaryList?.length > 0 &&
        hexBoundaryList?.map((singileHexCoordinates, idx) => (
          <Polygon
            key={`hex-${idx}`}
            pathOptions={{ color: "red" }}
            positions={
              singileHexCoordinates as
                | L.LatLngExpression[]
                | L.LatLngExpression[][]
                | L.LatLngExpression[][][]
            }
          />
        ))}
    </>
  );
};

export default RoutingMachineController;

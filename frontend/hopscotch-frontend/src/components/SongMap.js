import firebase from "firebase/app";
import "firebase/auth";
import axios from "axios";
import "firebase/firestore";
import { useState, useEffect, Fragment } from "react";
import ReactMapboxGl, { Layer, Feature, Marker, Popup } from "react-mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import currentLocationIcon from "../assets/you_are_here.png";
import songMarkerIcon from "../assets/marker.png";
import { useAuth } from "../auth/authContext";
import SongWidget from "./SongWidget";
import {
  Button,
  Text,
  Spacer,
  Row,
  Col,
  Input,
  Card,
  Image,
  Divider,
  Modal,
} from "@geist-ui/react";

const Map = ReactMapboxGl({
  accessToken:
    "pk.eyJ1IjoibWljaGFlbHcxIiwiYSI6ImNrb29xYXkzZDAxOXMydWxrNm5mdTh2cjUifQ.BUPHP_fptDzgtWTc4mIhIA",
});

const SongMap = () => {
  const BASE_URL = process.env.REACT_APP_API_BASE_URL;
  const [userLocation, setUserLocation] = useState(null);
  const [center, setCenter] = useState(null);
  const [selectedSong, setSelectedSong] = useState(null);
  const [nearbySongs, setNearbySongs] = useState([]);
  const [viewport, setViewport] = useState({});
  const { getTokens } = useAuth();

  function refreshMap() {
    navigator.geolocation.getCurrentPosition(async ({ coords }) => {
      reCenter(coords);
      setUserLocation([coords.longitude, coords.latitude]);
      const tokens = await getTokens();
      axios
        .get(
          `${BASE_URL}/api/songs/nearby?lat=${coords.latitude}&lng=${coords.longitude}`,
          { headers: tokens }
        )
        .then((res) => {
          if (res.status === 200) {
            setNearbySongs(res.data);
          }
        });
    });
  }
  useEffect(() => {
    refreshMap();
  }, []);

  const reCenter = (location, zoom) => {
    setViewport((prev) => {
      let newViewport = {
        ...prev,
        center: [location.longitude, location.latitude],
        zoom: zoom,
        transitionDuration: 600,
        //transitionEasing: d3.easeCubic
      };
      return newViewport;
    });
  };

  return (
    <div>
      {userLocation == null ? (
        <div>Loading...</div>
      ) : (
        <Fragment>
          <Button size="mini" onClick={refreshMap}>
            Refresh Map
          </Button>
          <Map
            {...viewport}
            style="mapbox://styles/mapbox/streets-v9"
            containerStyle={{
              height: "600px",
              width: "800px",
            }}
          >
            <Marker coordinates={userLocation} anchor="bottom">
              <img width="50" height="50" src={currentLocationIcon} />
            </Marker>
            {nearbySongs.map((song) => (
              <Marker
                coordinates={[song.lng, song.lat]}
                anchor="bottom"
                onClick={() => {
                  setSelectedSong(song);
                  setCenter([song.lng, song.lat]);
                }}
              >
                <img width="25" height="25" src={songMarkerIcon} />
              </Marker>
            ))}
            {selectedSong && (
              <Popup
                key={selectedSong.locationHash}
                coordinates={[selectedSong.lng, selectedSong.lat]}
              >
                <div>
                  <SongWidget
                    songId={selectedSong.songData.id}
                    height="80px"
                    width="100%"
                  />
                  <div>
                    <button
                      onClick={() => {
                        setSelectedSong(null);
                        setCenter(userLocation);
                      }}
                    >
                      Close
                    </button>
                  </div>
                </div>
              </Popup>
            )}
          </Map>
        </Fragment>
      )}
    </div>
  );
};

export default SongMap;

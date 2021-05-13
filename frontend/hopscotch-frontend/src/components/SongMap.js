import firebase from "firebase/app";
import "firebase/auth";
import axios from "axios";
import "firebase/firestore";
import { useState, useEffect } from "react";
import ReactMapboxGl, { Layer, Feature, Marker, Popup } from "react-mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import currentLocationIcon from "../assets/you_are_here.png";
import songMarkerIcon from "../assets/marker.png";
import { useAuth } from "../auth/authContext";

const Map = ReactMapboxGl({
  accessToken:
    "pk.eyJ1IjoibWljaGFlbHcxIiwiYSI6ImNqdHdjdG9pNzI2eTY0NG80bGVsYmpremsifQ.r4_utQlXzN8ev_Dn7TtWxg",
});

const SongMap = () => {
  const BASE_URL = process.env.REACT_APP_API_BASE_URL;
  const [userLocation, setUserLocation] = useState(null);
  const [center, setCenter] = useState(null);
  const [selectedSong, setSelectedSong] = useState(null);
  const [nearbySongs, setNearbySongs] = useState([]);
  const [viewport, setViewport] = useState({});
  const { getTokens } = useAuth();

  useEffect(() => {
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
            console.log(res.data);
          }
        });
    });
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
                <div>{selectedSong.songData.name}</div>
                <div>{selectedSong.songData.album.name}</div>
                <div>
                  <button
                    onClick={() => {
                      window.open(selectedSong.songData.external_urls.spotify);
                      // console.log("Opened spotify");
                    }}
                  >
                    Open in Spotify
                  </button>
                </div>
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
      )}
    </div>
  );
};

export default SongMap;

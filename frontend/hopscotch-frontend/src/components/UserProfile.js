import firebase from "firebase/app";
import "firebase/auth";
import axios from "axios";
import "firebase/firestore";
import { useState, useEffect } from "react";
import { useAuth } from "../auth/authContext";

const BASE_URL = process.env.REACT_APP_API_BASE_URL;

const UserProfile = () => {
  const [userData, setUserData] = useState(null);
  const [userEntries, setUserEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const { getTokens } = useAuth();

  useEffect(() => {
    async function fetchUserMetadata() {
      try {
        const tokens = await getTokens();
        return axios.get(
          `${BASE_URL}/api/users/me`,
          { headers: tokens }
        )
        .then((res) => {
          console.log(res.data.userData)
          console.log(res.data.userEntries)
          if (res.status === 200) {
            setUserData(res.data.userData);
            setUserEntries(res.data.userEntries);
            setLoading(false);
          }
        });
      } catch (e) {
        console.error(e);
      }
    }
    fetchUserMetadata();
  }, []);

  return (
    <div>
      {loading ? <div></div> :
      <div>
        Your profile
        <div>
          Phone number:{" "}
          {userData.phone}
        </div>
        Spotify
        <div>
            {userData.spotify_profile && userData.spotify_refresh_token ?
            <div>
              <div>
                <a href={userData.spotify_profile.external_urls.spotify}>{userData.spotify_profile.display_name}</a><br />
                <img src={userData.spotify_profile.images[0].url} width="128" height="128" />
              </div>
              Your song entries:
              <div>
                {userEntries.map(entry => (
                  <div>
                    <img src={entry.songData.album.images[1].url} /><br />
                    {entry.songData.name}<br />
                    {entry.songData.artists
                      .map((artist) => artist.name)
                      .join(", ")}
                  </div>
                ))}
              </div>
            </div>
            :
            <button onClick={() => {
              async function linkSpotify() {
                const tokens = await getTokens();
                return axios.get(
                  `${BASE_URL}/api/spotify/link?redirectHost=${encodeURIComponent(
                    BASE_URL
                  )}`, { headers: tokens }
                )
                .then((res) => {
                  if (res.status === 200) {
                    window.open(res.data.authorizeURL, "_blank");
                  }
                });
              }
              linkSpotify();
            }}
            >
              Link Spotify
            </button>}
        </div>
      </div>}
    </div>
  )
}

export default UserProfile;
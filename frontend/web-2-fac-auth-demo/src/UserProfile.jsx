import firebase from "firebase/app";
import "firebase/auth";
import axios from "axios";
import "firebase/firestore";
import { useState, useEffect } from "react";

const BASE_URL = process.env.REACT_APP_API_BASE_URL;

const UserProfile = () => {
  const [userData, setUserData] = useState(null);
  const [userEntries, setUserEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const db = firebase.firestore();

  useEffect(() => {
    firebase
      .auth()
      .currentUser.getIdToken(true)
      .then((loginToken) => {
        return axios.get(
          `${BASE_URL}/api/users/me`,
          {
            headers: {
              login_token: loginToken,
              two_fac_token: localStorage.getItem("twoFacToken")
            }
          }
        )
      })
      .then((res) => {
        console.log(res.data.userData)
        console.log(res.data.userEntries)
        if (res.status === 200) {
          setUserData(res.data.userData);
          setUserEntries(res.data.userEntries);
          setLoading(false);
        }
      });
  }, [])

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
              Your Spotify profile:
              <div>
                Name:{" "}{userData.spotify_profile.display_name}<br />
                Profile:{" "}{userData.spotify_profile.external_urls.spotify}<br />
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
              firebase
                  .auth()
                  .currentUser.getIdToken(true)
                  .then((loginToken) => {
                    return axios.get(
                      `${BASE_URL}/api/spotify/link?redirectHost=${encodeURIComponent(
                        BASE_URL
                      )}`,
                      {
                        headers: {
                          login_token: loginToken,
                          two_fac_token: localStorage.getItem("twoFacToken"),
                        },
                      }
                    );
                  })
                  .then((res) => {
                    if (res.status === 200) {
                      window.open(res.data.authorizeURL, "_blank");
                    }
                  });
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
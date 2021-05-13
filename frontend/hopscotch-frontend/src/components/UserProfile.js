import firebase from "firebase/app";
import "firebase/auth";
import axios from "axios";
import "firebase/firestore";
import { useState, useEffect } from "react";
import { useAuth } from "../auth/authContext";
import { Button, Card, Collapse, Image, Spacer, Text, User } from "@geist-ui/react";

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
        <div>
          {userData.spotify_profile && userData.spotify_refresh_token ?
            <Card width="100%">
              <User src={userData.spotify_profile.images[0].url} name={userData.spotify_profile.display_name}>
                {userData.phone}
                <User.Link href={userData.spotify_profile.external_urls.spotify}>{userData.spotify_profile.uri}</User.Link>
              </User>
              <Spacer />
              <Collapse title="Your song entries">
                {userEntries.map(entry => (
                  <div style={{display:"flex", flexWrap:"wrap"}}>
                    <div style={{flex:"50%"}}><Image src={entry.songData.album.images[1].url} width={70} height={70} /></div>
                    <div style={{flex:"50%"}}><Text small>
                      <p>{entry.songData.name}<br/>
                      {entry.songData.artists
                      .map((artist) => artist.name)
                      .join(", ")}</p>
                    </Text></div>
                  </div>
                ))}
              </Collapse>
            </Card>
            :
            <Card width="100%">
              <Button onClick={() => {
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
              </Button>
            </Card>}
        </div>
      </div>}
    </div>
  )
}

export default UserProfile;
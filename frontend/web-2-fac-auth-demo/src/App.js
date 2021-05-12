import "./App.css";
import firebase from "firebase/app";
import "firebase/auth";
import axios from "axios";
import "firebase/firestore";
import { useState, useEffect } from "react";

const firebaseConfig = {
  apiKey: process.env.REACT_APP_DEMO_FIREBASE_API_KEY,
  authDomain: "hopscotch-ddd21.firebaseapp.com",
  projectId: "hopscotch-ddd21",
  storageBucket: "hopscotch-ddd21.appspot.com",
  messagingSenderId: "611116265466",
  appId: "1:611116265466:web:15ad2e7e463293a8b67e43",
  measurementId: "G-X0KLXFSKM8",
};

firebase.initializeApp(firebaseConfig);

const auth_states = {
  UNAUTHENTICATED: "unauthenticated",
  TWOFACTOR: "twofactor",
  AUTHENTICATED: "authenticated",
};

const BASE_URL = process.env.REACT_APP_API_BASE_URL;

function App() {
  const [authState, setAuthState] = useState(auth_states.UNAUTHENTICATED);

  // for unauthenticated state
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");

  // for two factor state
  const [sessionId, setSessionId] = useState(null);
  const [code, setCode] = useState("");

  // for authenticated state
  const [twoFacToken, setTwoFacToken] = useState(
    localStorage.getItem("twoFacToken")
  );

  const [songs, setSongs] = useState("");
  const [currentlyPlaying, setCurrentlyPlaying] = useState(null);

  useEffect(() => {
    const currentUser = firebase.auth().currentUser;
    if (currentUser != null) {
      firebase
        .auth()
        .currentUser.getIdToken(true)
        .then((loginToken) => {
          if (twoFacToken && loginToken) {
            setAuthState(auth_states.AUTHENTICATED);
          }
        });
    }
  }, []);

  function register() {
    firebase
      .auth()
      .createUserWithEmailAndPassword(email, password)
      .then(async () => {
        return firebase.auth().currentUser.getIdToken(true);
      })
      .then((loginToken) => {
        return axios
          .post(
            `${BASE_URL}/api/auth/register`,
            {
              phone,
            },
            {
              headers: {
                login_token: loginToken,
              },
            }
          )
          .then(() => loginToken);
      })
      .then((loginToken) => {
        return axios.get(`${BASE_URL}/api/auth/init2facSession`, {
          headers: {
            login_token: loginToken,
          },
        });
      })
      .then((res) => {
        if (res.status == 200) {
          // change to 2-fac screen
          console.log("main login success! Now on to 2-factor auth.");
          setSessionId(res.data.sessionId);
          setAuthState(auth_states.TWOFACTOR);
        }
      });
  }

  function login() {
    firebase
      .auth()
      .signInWithEmailAndPassword(email, password)
      .then((userCredential) => {
        var user = userCredential.user;
        console.log("Logged in", user);
        return firebase.auth().currentUser.getIdToken(true);
      })
      .then((loginToken) => {
        return axios.get(`${BASE_URL}/api/auth/init2facSession`, {
          headers: {
            login_token: loginToken,
          },
        });
      })
      .then((res) => {
        if (res.status == 200) {
          // change to 2-fac screen
          console.log("main login success! Now on to 2-factor auth.");
          console.log(res);
          setSessionId(res.data.sessionId);
          setAuthState(auth_states.TWOFACTOR);
        }
      });
  }

  function twofactor() {
    console.log(sessionId, code);
    firebase
      .auth()
      .currentUser.getIdToken(true)
      .then((loginToken) => {
        return axios.post(
          `${BASE_URL}/api/auth/complete2fac`,
          {
            sessionId,
            code,
          },
          {
            headers: {
              login_token: loginToken,
            },
          }
        );
      })
      .then((res) => {
        const { token, error } = res.data;
        if (res.status === 200) {
          setTwoFacToken(token);
          localStorage.setItem("twoFacToken", token);
          setAuthState(auth_states.AUTHENTICATED);
        } else {
          console.log(error);
          setAuthState(auth_states.UNAUTHENTICATED);
        }
      });
  }

  const Authenticated = () => {
    return (
      <div>
        Welcome!
        <div>
          <button
            onClick={() => {
              firebase
                .auth()
                .currentUser.getIdToken(true)
                .then((loginToken) => {
                  return axios.get(
                    `${BASE_URL}/api/songs/nearby?lat=34.06892&lng=-118.445183`,
                    {
                      headers: {
                        login_token: loginToken,
                        two_fac_token: twoFacToken,
                      },
                    }
                  );
                })
                .then((res) => {
                  if (res.status === 200) {
                    setSongs(res.data);
                  }
                });
            }}
          >
            get songs
          </button>
          <button
            onClick={() => {
              // eslint-disable-next-line no-restricted-globals
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
                        two_fac_token: twoFacToken,
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
            link spotify
          </button>
          <button
            onClick={() => {
              // eslint-disable-next-line no-restricted-globals
              firebase
                .auth()
                .currentUser.getIdToken(true)
                .then((loginToken) => {
                  return axios.get(
                    `${BASE_URL}/api/spotify/currently-playing`,
                    {
                      headers: {
                        login_token: loginToken,
                        two_fac_token: twoFacToken,
                      },
                    }
                  );
                })
                .then((res) => {
                  if (res.status === 200) {
                    setCurrentlyPlaying(res.data.song);
                  }
                });
            }}
          >
            get currently playing
          </button>
          <div>{JSON.stringify(songs)}</div>
          <div>
            Currently Playing:{" "}
            {!currentlyPlaying
              ? "nothing atm"
              : `${currentlyPlaying.name} by ${currentlyPlaying.artists
                  .map((artist) => artist.name)
                  .join(", ")}`}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="App">
      {authState === auth_states.UNAUTHENTICATED ? (
        <div>
          <div>Email</div>
          <input
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
            }}
          />
          <div>Password</div>
          <input
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
            }}
          />
          <div>Phone</div>
          <input
            value={phone}
            onChange={(e) => {
              setPhone(e.target.value);
            }}
          />
          <div>
            <button onClick={register}>Register</button>
            <button onClick={login}>Login</button>
          </div>
        </div>
      ) : authState === auth_states.TWOFACTOR ? (
        <div>
          <div>Code</div>
          <input
            value={code}
            onChange={(e) => {
              setCode(e.target.value);
            }}
          />
          <div>
            <button onClick={twofactor}>Submit</button>
          </div>
        </div>
      ) : (
        <Authenticated />
      )}
    </div>
  );
}

export default App;

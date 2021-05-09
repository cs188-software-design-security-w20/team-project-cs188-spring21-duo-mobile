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
  const [twoFacToken, setTwoFacToken] = useState(localStorage.getItem('twoFacToken'));
  const [loginToken, setLoginToken] = useState(localStorage.getItem('loginToken'));

  const [songs, setSongs] = useState("");
  const [currentlyPlaying, setCurrentlyPlaying] = useState(null);

  useEffect(() => {
    if (twoFacToken && loginToken) {
      setAuthState(auth_states.AUTHENTICATED);
    }
  }, []);

  function register() {
    firebase
      .auth()
      .createUserWithEmailAndPassword(email, password)
      .then(async (_) => {
        await axios.post("http://localhost:5000/api/auth/register", {
          email,
          password,
          phone,
        });
        return firebase.auth().currentUser.getIdToken(true);
      })
      .then((idToken) => {
        setLoginToken(idToken);
        localStorage.setItem('loginToken', idToken);
        return axios.post("http://localhost:5000/api/auth/login", {
          idToken,
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
        return user.getIdToken(true);
      })
      .then((idToken) => {
        setLoginToken(idToken);
        localStorage.setItem('loginToken', idToken);
        return axios.post("http://localhost:5000/api/auth/login", {
          idToken,
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
    axios
      .post("http://localhost:5000/api/auth/2fac", {
        email,
        sessionId,
        code,
      })
      .then((res) => {
        const { token, error } = res.data;
        if (res.status === 200) {
          setTwoFacToken(token);
          localStorage.setItem('twoFacToken', token)
          setAuthState(auth_states.AUTHENTICATED);
        } else {
          console.log(error);
          setAuthState(auth_states.UNAUTHENTICATED);
        }
      });
  }

  const Authenticated = () => {
    return <div>Welcome!
      <div>
        <button onClick={() => {
          axios.get("http://localhost:5000/api/songs/nearby?lat=34.06892&lng=-118.445183", {
            headers: {
              login_token: loginToken,
              two_fac_token: twoFacToken
            }
          })
            .then((res) => {
              if (res.status === 200) {
                setSongs(res.data);
              }
            });
        }}>get songs</button>
        <button onClick={() => {
          // eslint-disable-next-line no-restricted-globals
          axios.get(`http://localhost:5000/api/spotify/link?redirectHost=${encodeURIComponent("http://localhost:5000")}`, {
            headers: {
              login_token: loginToken,
              two_fac_token: twoFacToken
            }
          })
            .then((res) => {
              if (res.status === 200) {
                window.open(res.data.authorizeURL, '_blank');
              }
            });
        }}>link spotify</button>
        <button onClick={() => {
          // eslint-disable-next-line no-restricted-globals
          axios.get(`http://localhost:5000/api/spotify/currently-playing`, {
            headers: {
              login_token: loginToken,
              two_fac_token: twoFacToken
            }
          })
            .then((res) => {
              if (res.status === 200) {
                setCurrentlyPlaying(res.data.song);
              }
            });
        }}>get currently playing</button>

        <button onClick={() => setPhone("")}>refresh phone #</button>
        <div>{JSON.stringify(songs)}</div>
        <div>Currently Playing: {(!currentlyPlaying) ? "nothing atm" : `${currentlyPlaying.name} by ${currentlyPlaying.artists.map((artist) => artist.name).join(", ")}`}</div>
      </div>
    </div>;
  };

  return <div className="App">
    {authState === auth_states.UNAUTHENTICATED ?
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
    </div> :
      authState === auth_states.TWOFACTOR ?
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
      </div> :
      <Authenticated />
    }
  </div>
}

export default App;

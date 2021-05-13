import { createContext, Context, useContext, useState, useEffect } from "react";
import firebase from "../firebase";

function useProvideAuth() {
  const [auth, setAuth] = useState(null);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  const signInWithGoogle = () => {
    setLoading(true);
    return firebase
      .auth()
      .signInWithPopup(new firebase.auth.GoogleAuthProvider());
  };

  const signOut = () => {
    return firebase
      .auth()
      .signOut()
      .then(() => {
        setAuth(null);
        setLoading(true);
      });
  };

  useEffect(() => {
    const unsubscribe = firebase.auth().onAuthStateChanged(async (user) => {
      setUser(user);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  return {
    auth,
    user,
    loading,
    signInWithGoogle,
    signOut,
  };
}

const authContext = createContext({
  auth: null,
  user: null,
  loading: true,
  signInWithGoogle: async () => {},
  signOut: async () => {},
});

export function AuthProvider({ children }) {
  const auth = useProvideAuth();
  return <authContext.Provider value={auth}>{children}</authContext.Provider>;
}

export const useAuth = () => useContext(authContext);

import styled from "@emotion/styled";
import firebase from "../firebase";
import { useEffect, useState, Fragment } from "react";
import { AuthProvider, useAuth } from "../auth/authContext";
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
import axios from "axios";
import _, { initial } from "lodash";

const db = firebase.firestore();

export default function Homepage() {
  const { user, loading, signInWithGoogle, signOut, getTokens } = useAuth();

  useEffect(() => {
    const init = async () => {
      const tokens = await getTokens();
      console.log(tokens);
    };
    init();

    return () => {};
  }, []);
  return (
    <Row gap={1} style={{ margin: "15px 0", width: "800px", height: "100vh" }}>
      <Col span={10}>
        <Card>
          <Text h1>Hoem</Text>
          <Button
            size="mini"
            onClick={() => {
              signOut();
            }}
          >
            Sign out
          </Button>
        </Card>
      </Col>
    </Row>
  );
}

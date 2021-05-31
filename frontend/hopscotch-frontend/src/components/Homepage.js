import { Fragment } from "react";
import {
  Row,
  Col,
} from "@geist-ui/react";
import SongMap from "./SongMap";
import CurrentlyPlaying from "./CurrentlyPlaying";
import UserProfile from "./UserProfile";


export default function Homepage() {
  return (
    <Fragment>
      <Row gap={.8} style={{ height: "100vh" }}>
        <Col span={8}>
          <UserProfile />
          <CurrentlyPlaying width={"100%"}/>
        </Col>
        <Col span={16}>
          <SongMap />
        </Col>
      </Row>
    </Fragment>
  );
}

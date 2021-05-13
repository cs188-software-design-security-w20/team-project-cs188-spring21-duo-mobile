import { useEffect, useState } from "react";
import { Button, ButtonGroup, Row, Card } from "@geist-ui/react";
import { useAuth } from "../auth/authContext";
import axios from "axios";
import SongWidget from "./SongWidget"


const CurrentlyPlaying = () => {
    const BASE_URL = process.env.REACT_APP_API_BASE_URL;
    const { getTokens } = useAuth();

    const [currentSong, setCurrentSong] = useState(null);

    const fetchCurrentSong = async() => {
        getTokens().then((tokens) => {
            axios.get(`${BASE_URL}/api/spotify/currently-playing`, { headers: tokens }).then((res) => {
                setCurrentSong(res.data?.song);
            })
        });
    }

    const shareCurrentSong = async () => {
        navigator.geolocation.getCurrentPosition(async ({ coords }) => {
            const tokens = await getTokens();
            axios.post(
                `${BASE_URL}/api/songs`,
                {
                    lat: coords.latitude,
                    lng: coords.longitude,
                    songData: currentSong,
                },
                {
                    headers: tokens
                }).then((res) => {
                    window.alert(`Posted song ${res.data}`);
                });
        });
        getTokens().then((tokens) => {
            axios.get(`${BASE_URL}/api/spotify/currently-playing`, { headers: tokens }).then((res) => {
                setCurrentSong(res.data?.song);
            })
        });
    }

    useEffect(() => {
        fetchCurrentSong();
    }, []);

    return (
        <Card width="100%">
            <h4>Now Playing</h4>
            {currentSong != null ? (
                <Row style={{ marginBottom: '15px' }}>
                    <SongWidget songId={currentSong.id} width="100%" />
                </Row>
            ) : <p>Nothing playing at the moment.</p>}
            
            <Card.Footer>
                <Row justify="center">
                    <ButtonGroup>
                        <Button onClick={fetchCurrentSong}>Refresh</Button>
                        <Button onClick={shareCurrentSong} disabled={currentSong == null}>Share</Button>
                    </ButtonGroup>
                   
                    {/* <Col>
                        <Button onClick={fetchCurrentSong}>
                            <Text>Share</Text>
                        </Button>
                    </Col>
                    <Col>
                        
                    </Col> */}
                </Row>
            </Card.Footer>
        </Card>
    );
}

export default CurrentlyPlaying;
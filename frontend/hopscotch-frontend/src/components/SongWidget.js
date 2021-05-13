const SongWidget = ({ songId, width = 300, height = 380 }) => {
    return (
        <iframe
            title={songId} src={`https://open.spotify.com/embed/track/${songId}`}
            width={width}
            height={height}
            frameborder="0"
            allowtransparency="true"
            allow="encrypted-media">    
        </iframe>
    );
}

export default SongWidget;
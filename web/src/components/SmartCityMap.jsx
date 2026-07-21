import { CircleMarker, MapContainer, TileLayer, Tooltip } from "react-leaflet";

export default function SmartCityMap({
  center,
  zoom,
  suburbs,
  filter,
  filters,
  colorFor,
  onSelect,
}) {
  return (
    <MapContainer
      center={center}
      zoom={zoom}
      scrollWheelZoom={false}
      style={{ height: "100%", width: "100%", background: "#0B1220" }}
    >
      <TileLayer
        url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        attribution="&copy; OpenStreetMap &copy; CARTO"
      />
      {suburbs.map((suburb, index) => {
        const value = suburb[filter];
        const color = colorFor(filter, value);

        return (
          <CircleMarker
            key={suburb.name}
            center={[suburb.lat, suburb.lng]}
            radius={7 + value * 18}
            pathOptions={{
              color,
              fillColor: color,
              fillOpacity: 0.72,
              weight: 2,
            }}
            eventHandlers={{ click: () => onSelect(index) }}
          >
            <Tooltip direction="top" offset={[0, -6]} opacity={1}>
              <span style={{ fontFamily: "Inter, sans-serif", fontWeight: 600 }}>
                {suburb.name}
              </span>
              <br />
              <span style={{ fontFamily: "monospace", fontSize: 11 }}>
                {filters.find((item) => item.id === filter)?.label}:{" "}
                {Math.round(value * 100)}%
              </span>
            </Tooltip>
          </CircleMarker>
        );
      })}
    </MapContainer>
  );
}

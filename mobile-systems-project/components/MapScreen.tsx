import { Modal, TouchableOpacity, View, Text } from "react-native";
import MapView, { Circle, Marker, PROVIDER_DEFAULT } from "react-native-maps";
import * as Location from "expo-location";
import React, { useEffect, useRef, useState } from "react";
import { POINTS, type RewardPoint, REWARD_RADIUS_M } from "../data/location";
import { distanceMeters } from "../utils/distance";

export default function MapScreen() {
  const [userPos, setUserPos] = useState<Location.LocationObjectCoords | null>(
    null,
  );
  const [nearPoint, setNearPoint] = useState<RewardPoint | null>(null);
  const [permissionDenied, setPermissionDenied] = useState(false);
  const notifiedIds = useRef<Set<string>>(new Set());

  useEffect(() => {
    let subscription: Location.LocationSubscription | undefined;

    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();

      if (status !== "granted") {
        setPermissionDenied(true);
        return;
      }

      subscription = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.High,
          distanceInterval: 5,
          timeInterval: 500,
        },
        (loc) => {
          setUserPos(loc.coords);

          const close = POINTS.find(
            (p) =>
              !notifiedIds.current.has(p.id) &&
              distanceMeters(loc.coords, p) <= REWARD_RADIUS_M,
          );

          if (close) {
            notifiedIds.current.add(close.id);
            setNearPoint(close);
          }
        },
      );
    })();

    return () => subscription?.remove();
  }, []);

  const simulateNearby = () => {
    const point = POINTS.find((p) => !notifiedIds.current.has(p.id));

    if (!point) {
      notifiedIds.current.clear();
      return;
    }

    const simulatedPosition = {
      latitude: point.latitude + 0.00005,
      longitude: point.longitude,
      altitude: null,
      accuracy: 5,
      altitudeAccuracy: null,
      heading: null,
      speed: null,
    };

    setUserPos(simulatedPosition);

    const close = POINTS.find(
      (p) =>
        !notifiedIds.current.has(p.id) &&
        distanceMeters(simulatedPosition, p) <= REWARD_RADIUS_M,
    );

    if (close) {
      notifiedIds.current.add(close.id);
      setNearPoint(close);
    }
  };

  if (permissionDenied) {
    return (
      <View
        style={{
          flex: 1,
          alignItems: "center",
          justifyContent: "center",
          padding: 24,
        }}
      >
        <Text>
          Brak zgody na lokalizację. Włącz ją w ustawieniach telefonu.
        </Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      <MapView
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
        }}
        provider={PROVIDER_DEFAULT}
        showsUserLocation
        showsMyLocationButton={false}
        initialRegion={{
          latitude: 50.0617,
          longitude: 19.9373,
          latitudeDelta: 0.02,
          longitudeDelta: 0.02,
        }}
      >
        {POINTS.map((p) => (
          <React.Fragment key={p.id}>
            <Marker
              coordinate={{
                latitude: p.latitude,
                longitude: p.longitude,
              }}
              title={p.name}
              description={`Nagroda: ${p.reward}`}
            />

            <Circle
              center={{
                latitude: p.latitude,
                longitude: p.longitude,
              }}
              radius={REWARD_RADIUS_M}
              strokeColor="rgba(0,122,255,0.8)"
              fillColor="rgba(0,122,255,0.15)"
            />
          </React.Fragment>
        ))}
      </MapView>

      <TouchableOpacity
        style={{
          position: "absolute",
          bottom: 40,
          alignSelf: "center",
          backgroundColor: "#007AFF",
          borderRadius: 10,
          paddingVertical: 14,
          paddingHorizontal: 20,
          elevation: 5,
        }}
        onPress={simulateNearby}
      >
        <Text
          style={{
            color: "#fff",
            fontWeight: "600",
            fontSize: 16,
          }}
        >
          Symuluj bliskość punktu
        </Text>
      </TouchableOpacity>

      <Modal transparent animationType="fade" visible={!!nearPoint}>
        <View
          style={{
            flex: 1,
            backgroundColor: "rgba(0,0,0,0.4)",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <View
            style={{
              backgroundColor: "#fff",
              borderRadius: 16,
              padding: 24,
              width: "80%",
            }}
          >
            <Text
              style={{
                fontSize: 20,
                fontWeight: "700",
                marginBottom: 8,
              }}
            >
              Jesteś blisko!
            </Text>

            <Text
              style={{
                fontSize: 16,
                marginBottom: 16,
              }}
            >
              {nearPoint?.name} – możesz odebrać nagrodę: {nearPoint?.reward}
            </Text>

            <TouchableOpacity
              style={{
                backgroundColor: "#007AFF",
                borderRadius: 8,
                padding: 12,
                alignItems: "center",
              }}
              onPress={() => setNearPoint(null)}
            >
              <Text
                style={{
                  color: "#fff",
                  fontWeight: "600",
                }}
              >
                OK
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

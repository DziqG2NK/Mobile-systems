export type RewardPoint = {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  reward: number;
};

export const REWARD_RADIUS_M = 50;

export const POINTS: RewardPoint[] = [
  {
    id: "1",
    name: "Rynek Główny",
    latitude: 50.0617,
    longitude: 19.9373,
    reward: 10,
  },
  {
    id: "2",
    name: "Wawel",
    latitude: 50.054,
    longitude: 19.9354,
    reward: 20,
  },
  {
    id: "3",
    name: "Barbakan",
    latitude: 50.0654,
    longitude: 19.9411,
    reward: 15,
  },
  {
    id: "4",
    name: "D17",
    latitude: 50.06801106017552,
    longitude: 19.912614290434217,
    reward: 100,
  },
];

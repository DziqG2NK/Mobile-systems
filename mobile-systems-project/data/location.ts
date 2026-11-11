export type RewardPoint = {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  reward: string;
};

export const REWARD_RADIUS_M = 50;

export const POINTS: RewardPoint[] = [
  {
    id: "1",
    name: "Rynek Główny",
    latitude: 50.0617,
    longitude: 19.9373,
    reward: "10 monet",
  },
  {
    id: "2",
    name: "Wawel",
    latitude: 50.054,
    longitude: 19.9354,
    reward: "20 monet",
  },
  {
    id: "3",
    name: "Barbakan",
    latitude: 50.0654,
    longitude: 19.9411,
    reward: "15 monet",
  },
  {
    id: "4",
    name: "D17",
    latitude: 50.06801106017552,
    longitude: 19.912614290434217,
    reward: "100 monet",
  },
];

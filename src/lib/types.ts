export type Transaction = {
  id: string;
  type: "in" | "out";
  amount: number;
  description: string;
  date: Date;
};

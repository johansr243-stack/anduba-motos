export interface MotorcycleItem {
  _id: string;
  licensePlate: string;
  brand: string;
  modelName: string;
  color: string;
}

export interface ResponseMotorcycles {
  msg: string;
  data: MotorcycleItem[];
}

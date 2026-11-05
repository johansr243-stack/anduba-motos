export interface ServiceRecordItem {
  _id: string;
  appointment: {
    _id: string;
    client?: { username: string; phoneNumber: string };
    motorcycle?: { brand: string; modelName: string; licensePlate: string };
    service?: { name: string; price: number };
  };
  mechanic?: { username: string };
  description?: string;
  observations?: string;
  finalCost: number;
  createdAt: string;
}

export interface ResponseServiceRecords {
  msg: string;
  data: ServiceRecordItem[];
}

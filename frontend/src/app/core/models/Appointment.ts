export interface Appointments {
  _id: string;
  client: {
    _id: string;
    username: string;
    phoneNumber: string;
  };
  schedule: string;
  service: {
    _id: string;
    name: string;
    price: number;
  };
  motorcycle: {
    _id: string;
    licensePlate: string;
    brand: string;
  };
  registeringUserId: {
    _id: string;
    username: string;
    phoneNumber: string;
  };
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface ResponseAppointments {
  msg: string;
  data: Appointments[];
}

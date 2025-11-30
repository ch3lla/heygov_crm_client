export interface IUser {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber?: string | null;
}

export interface IContact {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  company: string;
  notes?: string;
  inTrash?: boolean;
  createdAt: Date | string;
  updatedAt: Date | string;
}

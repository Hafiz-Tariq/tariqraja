export interface Order {
  id: number;
  client: string;
  desc: string;
  length: number;
  width?: number;
  fileSize?: string;
  sell: number;
  printRate?: number;
  services: {
    fabric: boolean;
    design: boolean;
    print: boolean;
  };
  status: 'Pending' | 'In Progress' | 'Completed';
  createdAt: string;
  invoiceNumber: string;
}

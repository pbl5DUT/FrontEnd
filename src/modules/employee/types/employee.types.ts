export interface Employee {
    user_id: number;
    full_name: string;
    email: string;
    role: string;
    department: string;
    gender: string;
    birth_date: string;
    phone: string;
    province: string;
    district: string;
    address: string;
    position: string;
    avatar: string | null;
    created_at: string;
    enterprise: Enterprise;
  }

  interface Enterprise {
    EnterpriseID: number;
    Name: string;
    Address: string;
    PhoneNumber: string;
    Email: string;
    Industry: string;
  }
export interface CreateUserInput {
  email: string;
  encrypted_password: string; 
  profile: {
    full_name: string;
    phone?: string;
    is_active: boolean;
  };
}

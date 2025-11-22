import { CompanyResponseDto } from "src/companies/dto/company-response.dto";

export class UserResponseDto {
  id: string;
  email: string
  companyId: string | null;
  company: CompanyResponseDto | null;
  createdAt: Date;
  updatedAt: Date;
  profile: {
    id: string;
    full_name: string;
    phone?: string;
    is_active: boolean;
    created_at: Date;
    updated_at: Date;
  };
}
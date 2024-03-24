import { IsNotEmpty, IsOptional, IsString } from "class-validator";

export class ValidatePinDto {
  @IsString()
  @IsNotEmpty()
  pinCode: string;
}

export class SetPinDto {
  @IsString()
  @IsOptional()
  pinCode: string;

  @IsString()
  @IsOptional()
  newPinCode: string;
}

export class RemovePinByPasswordDto {
  @IsString()
  @IsNotEmpty()
  password: string;
}

export class ResetPasswordDto {
  @IsString()
  @IsNotEmpty()
  password: string;

  @IsString()
  @IsNotEmpty()
  newPassword: string;
}

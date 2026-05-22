import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class GoogleLoginDto {
  @ApiProperty({ example: 'eyJhbGciOiJSUzI1NiIsImtpZCI6IjFlOWYzM...' })
  @IsString()
  @IsNotEmpty({ message: 'idToken không được để trống' })
  idToken: string;
}

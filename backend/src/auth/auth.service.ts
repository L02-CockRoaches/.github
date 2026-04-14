import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import * as bcrypt from 'bcrypt';
import { SignupDto } from './dto/signup.dto';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  // 1. Đăng ký tài khoản mới
  async signup(signupDto: SignupDto) {
    const { email, password, name } = signupDto;

    // Kiểm tra email đã tồn tại chưa
    const existingUser = await this.usersService.findOne(email);
    if (existingUser) {
      throw new ConflictException('Email đã được sử dụng!');
    }

    // Mã hóa mật khẩu
    const hashedPassword = await bcrypt.hash(password, 10);

    // Lưu vào database
    const user = await this.usersService.create({
      email,
      password: hashedPassword,
      name,
    });

    return {
      message: 'Đăng ký thành công!',
      userId: user.id,
    };
  }

  // 2. Đăng nhập
  async login(loginDto: LoginDto) {
    const { email, password } = loginDto;
    const user = await this.usersService.findOne(email);

    if (user && (await bcrypt.compare(password, user.password))) {
      const payload = { sub: user.id, email: user.email };
      return {
        access_token: this.jwtService.sign(payload),
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
        },
      };
    }

    throw new UnauthorizedException('Email hoặc mật khẩu không đúng!');
  }
}

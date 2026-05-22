import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import * as bcrypt from 'bcrypt';
import { SignupDto } from './dto/signup.dto';
import { LoginDto } from './dto/login.dto';
import { GoogleLoginDto } from './dto/google-login.dto';
import { OAuth2Client } from 'google-auth-library';

@Injectable()
export class AuthService {
  private googleClient = new OAuth2Client();

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

  // 2. Đăng nhập bằng tài khoản mật khẩu
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

  // 3. Đăng nhập bằng Google
  async googleLogin(googleLoginDto: GoogleLoginDto) {
    const { idToken } = googleLoginDto;
    const clientId = process.env.GOOGLE_CLIENT_ID;

    if (!clientId) {
      throw new ConflictException('GOOGLE_CLIENT_ID chưa được cấu hình trên máy chủ!');
    }

    try {
      const ticket = await this.googleClient.verifyIdToken({
        idToken,
        audience: clientId,
      });

      const payload = ticket.getPayload();
      if (!payload) {
        throw new UnauthorizedException('Token Google không hợp lệ!');
      }

      const { email, name } = payload;
      if (!email) {
        throw new UnauthorizedException('Không lấy được thông tin email từ tài khoản Google!');
      }

      let user = await this.usersService.findOne(email);
      if (!user) {
        // Tạo tài khoản mới nếu chưa tồn tại
        user = await this.usersService.create({
          email,
          name: name || 'Google User',
          password: 'GOOGLE_OAUTH_ACCOUNT',
        });
      }

      const jwtPayload = { sub: user.id, email: user.email };
      return {
        access_token: this.jwtService.sign(jwtPayload),
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
        },
      };
    } catch (error) {
      throw new UnauthorizedException('Xác thực tài khoản Google thất bại: ' + error.message);
    }
  }
}

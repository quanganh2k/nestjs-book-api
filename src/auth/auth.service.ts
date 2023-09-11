import {
  BadRequestException,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';
import { SignupDto } from './dto/signup.dto';
import * as bcrypt from 'bcrypt';
import { SigninDto } from './dto/signin.dto';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
  ) {}

  async signup(signupDto: SignupDto) {
    const { email, password, firstName, lastName } = signupDto;

    const foundUser = await this.prisma.users.findUnique({
      where: { email },
    });

    if (foundUser) {
      throw new BadRequestException('Email already exists');
    }

    const hashedPassword = await this.hashPassword(password);

    await this.prisma.users.create({
      data: {
        email,
        password: hashedPassword,
        firstName,
        lastName,
      },
    });

    return { message: 'Sign up successfully' };
  }

  async signin(signinDto: SigninDto) {
    const { email, password } = signinDto;

    const foundUser = await this.prisma.users.findUnique({
      where: { email },
    });

    if (!foundUser) {
      throw new BadRequestException('User does not exist');
    }

    const isMatchedPassword = await this.comparePassword({
      password,
      hash: foundUser.password,
    });

    if (!isMatchedPassword) {
      throw new BadRequestException('Invalid email or password');
    }

    const accessToken = await this.signAccessToken(foundUser.id);

    if (!accessToken) {
      throw new ForbiddenException('Missing access token');
    }

    delete foundUser.password;

    return {
      message: 'Login successfully',
      accessToken,
      user: foundUser,
    };
  }

  async hashPassword(password: string) {
    const saltOrRounds = 10;

    return await bcrypt.hash(password, saltOrRounds);
  }

  async comparePassword(args: { hash: string; password: string }) {
    return await bcrypt.compare(args.password, args.hash);
  }

  async signAccessToken(userId: number) {
    const payload = { id: userId };

    const accessToken = await this.jwt.signAsync(payload);

    return accessToken;
  }
}

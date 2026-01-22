import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from 'src/users/users.service';
import * as bcrypt from 'bcrypt';
import { access } from 'fs';

@Injectable()
export class AuthService {
    constructor(
        private userService: UsersService,
        private jwtService: JwtService
    ) {}

    async signIn(email: string, pass: string) {
        const user = await this.userService.findByEmailForAuth(email);

        if (!user || !(await bcrypt.compare(pass, user.password))) {
            throw new UnauthorizedException('Email ou senha incorretos');
        }

        const payload = {sub: user.id, email: user.email, role: user.role};

        return {
            access_token: await this.jwtService.signAsync(payload),
            user: {
                name: user.name,
                role: user.role
            }
        };
    }
}

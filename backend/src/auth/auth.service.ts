import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from 'src/users/users.service';
import * as bcrypt from 'bcrypt';
import { CreateUserDto } from 'src/users/dto/create-user.dto';

@Injectable()
export class AuthService {
    constructor(
        private userService: UsersService,
        private jwtService: JwtService
    ) {}

    async signIn(email: string, password: string) {
        const user = await this.userService.findByEmailForAuth(email);

        if (!user || !(await bcrypt.compare(password, user.password))) {
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

    async register(createUserDto: CreateUserDto) {
        return this.userService.create(createUserDto);
    }
    
}

import { HttpException, HttpStatus, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import bcrypt from 'node_modules/bcryptjs';
import { CreateUserDto } from 'src/users/users/dto/create-user.dto';
import { User } from 'src/users/users/users.model';
import { UsersService } from 'src/users/users/users.service';

@Injectable()
export class AuthService {
   
    constructor(private userService: UsersService,
                private jwtService: JwtService
    ){

    }

    async login(userDto: CreateUserDto) {
        const user = await this.validateUser(userDto);
        return this.generateToken(user);
    }
    private async validateUser(userDto: CreateUserDto) {
        const user = await this.userService.getUserByPhone(userDto.phone);
        const phoneEquals = user ? await bcrypt.compare(userDto.phone, user.phone) : false;
        if(user && phoneEquals) {
            return user;
        }
        throw new UnauthorizedException({message: "Incorrect data"})
    }
    
    async registration(userDto: CreateUserDto){
        const candidate = await this.userService.getUserByPhone(userDto.phone)

        if (candidate){
            throw new HttpException("User Exists", HttpStatus.BAD_REQUEST);
        }

        const hashPhone = await bcrypt.hash(userDto.phone, 177013);
        const user = await this.userService.createUser({...userDto, phone: hashPhone})
        return this.generateToken(user);
    }

    async generateToken(user: User){
        const payload = {phone: user.phone, id: user.id, roles: user.roles}
        return{
            token: this.jwtService.sign(payload)
        }
    }
}

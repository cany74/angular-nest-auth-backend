import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import * as bcryptjs from 'bcryptjs';


import { User } from './entities/user.entity';
import { Model } from 'mongoose';

import { LoginResponse } from './interfaces/login-response';
import { JwtService } from '@nestjs/jwt';
import { JwtPayload } from './interfaces/jwt-payload';

import { CreateUserDto, LoginDto, RegisterUserDto, UpdateAuthDto } from './dto';

// import { CreateUserDto } from './dto/create-user.dto';
// import { UpdateAuthDto } from './dto/update-auth.dto';
// import { LoginDto } from './dto/login.dto';
// import { RegisterUserDto } from './dto/register-user.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name)
    private userModel: Model<User>,
    private jwtService: JwtService,
  ) {}

  async create(createUserhDto: CreateUserDto): Promise<User> {
    try {
      // console.log(createUserhDto);

      // 1- sin encriptar la pwd
      // const newUser = new this.userModel(createUserhDto);
      //return await newUser.save();

      // 2- con la pwd encriptada
      const { password, ...userData } = createUserhDto;
      const newUser = new this.userModel({
        password: bcryptjs.hashSync(password, 10),
        ...userData,
      });
      await newUser.save();
      const { password:_, ...user } = newUser.toJSON();
      return user;
    } catch ({ code }) {
      if (code === 11000) {
        throw new BadRequestException(`${createUserhDto.email} already exists`);
      }
      throw new InternalServerErrorException('Unrecognized error!!');
    }
  }

  findAll(): Promise<User[]> {
    return this.userModel.find();
  }

  async findUserById(id: string) {
    const user = await this.userModel.findById(id);
    const { password, ...rest } = user.toJSON();
    return rest;
  }

  findOne(id: number) {
    return `This action returns a #${id} auth`;
  }

  update(id: number, updateAuthDto: UpdateAuthDto) {
    return `This action updates a #${id} auth`;
  }

  remove(id: number) {
    return `This action removes a #${id} auth`;
  }

  // private makeUserJwtToken(user: any): LoginResponse {
  //   return {
  //     user: user,
  //     token: this.getJwtToken({ id: user.id }),
  //   };
  // }

  async login(loginDto: LoginDto):Promise<LoginResponse> {
    // console.log(loginDto);
    const { email, password } = loginDto;
    const user = await this.userModel.findOne({ email });
    if (!user) throw new UnauthorizedException('Not valid credentials - email');
    if (!bcryptjs.compareSync(password, user.password)) throw new UnauthorizedException('Not valid credentials - pwd');
    const { password:_, ...rest } = user.toJSON();
    return {
      user: rest,
      token: this.getJwtToken({ id: user.id }),
    };
   // return this.makeUserJwtToken(rest);
  }

  async register(registerUserDto: RegisterUserDto):Promise<LoginResponse> {
    // console.log(registerUserDto);
    const user = await this.create(registerUserDto);
    // return this.makeUserJwtToken(user);
    return {
      user: user,
      token: this.getJwtToken({ id: user._id }),
    };
  }

  getJwtToken(payload: JwtPayload) {
    const access_token = this.jwtService.sign(payload);
    // console.log(access_token);
    return access_token;
  }
}

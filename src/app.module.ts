import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
// import { MongooseModule } from '@nestjs/mongoose/dist/mongoose.module';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';

const rootModule = ConfigModule.forRoot();
const mongooseModule = MongooseModule.forRoot(process.env.MONGO_URI, {
  dbName: process.env.MONGO_DB_NAME,
});
const jwtModule = JwtModule.register({
  global: true,
  secret: process.env.JWT_SEED,
  signOptions: { expiresIn: '6h' },
});

@Module({
  imports: [rootModule, mongooseModule, AuthModule, jwtModule],
  controllers: [],
  providers: [],
})
export class AppModule {
  constructor() {
    // console.log(process.env);
  }
}

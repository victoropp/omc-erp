import { Controller, Get, Post, Body } from '@nestjs/common';

@Controller('test')
export class TestController {
  @Get()
  test() {
    return { message: 'Test endpoint works!' };
  }

  @Post('login')
  login(@Body() body: any) {
    return { message: 'Login endpoint works!', body };
  }
}
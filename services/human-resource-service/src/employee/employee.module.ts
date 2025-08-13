import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EmployeeService } from './employee.service';
import { EmployeeController } from './employee.controller';

// Employee Entities
import { Employee } from './entities/employee.entity';
import { EmployeeContract } from './entities/employee-contract.entity';
import { EmployeeLeave } from './entities/employee-leave.entity';
import { EmployeePerformance } from './entities/employee-performance.entity';
import { EmployeeTraining } from './entities/employee-training.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Employee,
      EmployeeContract,
      EmployeeLeave,
      EmployeePerformance,
      EmployeeTraining,
    ]),
  ],
  controllers: [EmployeeController],
  providers: [EmployeeService],
  exports: [EmployeeService],
})
export class EmployeeModule {}
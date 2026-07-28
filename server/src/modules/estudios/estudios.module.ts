import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EstudiosService } from './estudios.service';
import { EstudiosController } from './estudios.controller';
import { Estudio } from './entities/estudio.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Estudio])],
  controllers: [EstudiosController],
  providers: [EstudiosService],
  exports: [EstudiosService],
})
export class EstudiosModule {}

import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './modules/auth/auth.module';
import { PacientesModule } from './modules/pacientes/pacientes.module';
import { CatalogosModule } from './modules/catalogos/catalogos.module';
import { CitasModule } from './modules/citas/citas.module';
import { ConsultasModule } from './modules/consultas/consultas.module';
import { RecetasModule } from './modules/recetas/recetas.module';
import { EstudiosModule } from './modules/estudios/estudios.module';
import { DocumentosModule } from './modules/documentos/documentos.module';






@Module({
  imports: [
    // Environment Configuration
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    
    // Database Configuration
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get<string>('DB_HOST', 'localhost'),
        port: configService.get<number>('DB_PORT', 5432),
        username: configService.get<string>('DB_USERNAME', 'admin'),
        password: configService.get<string>('DB_PASSWORD', 'password123'),
        database: configService.get<string>('DB_NAME', 'consulta_medica'),
        entities: [__dirname + '/**/*.entity{.ts,.js}'],
        synchronize: true, // Auto-create tables in dev (Change to false in prod)
      }),
      inject: [ConfigService],
    }),
    
    // Feature Modules
    AuthModule,
    PacientesModule,
    CatalogosModule,
    CitasModule,
    ConsultasModule,
    RecetasModule,
    EstudiosModule,
    DocumentosModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}

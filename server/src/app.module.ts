import { Module } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './modules/auth/auth.module';
import { PacientesModule } from './modules/pacientes/pacientes.module';
import { MedicosModule } from './modules/medicos/medicos.module';
import { CatalogosModule } from './modules/catalogos/catalogos.module';
import { CitasModule } from './modules/citas/citas.module';
import { ConsultasModule } from './modules/consultas/consultas.module';
import { RecetasModule } from './modules/recetas/recetas.module';
import { EstudiosModule } from './modules/estudios/estudios.module';
import { DocumentosModule } from './modules/documentos/documentos.module';
import { HealthModule } from './modules/health/health.module';
import { AuthorizationModule } from './modules/auth/authorization.module';
import { AuditInterceptor } from './common/interceptors/audit.interceptor';
import { AuditService } from './modules/auth/audit.service';
import { UsuariosModule } from './modules/usuarios/usuarios.module';
import { IndicadoresModule } from './modules/indicadores/indicadores.module';






@Module({
  imports: [
    // Environment Configuration
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    
    // Database Configuration
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.getOrThrow<string>('DB_HOST'),
        port: Number(configService.getOrThrow<string>('DB_PORT')),
        username: configService.getOrThrow<string>('DB_USERNAME'),
        password: configService.getOrThrow<string>('DB_PASSWORD'),
        database: configService.getOrThrow<string>('DB_NAME'),
        entities: [__dirname + '/**/*.entity{.ts,.js}'],
        migrations: [__dirname + '/database/migrations/*{.ts,.js}'],
        migrationsTableName: 'typeorm_migrations',
        synchronize: false,
      }),
      inject: [ConfigService],
    }),
    
    // Feature Modules
    AuthModule,
    AuthorizationModule,
    PacientesModule,
    MedicosModule,
    CatalogosModule,
    CitasModule,
    ConsultasModule,
    RecetasModule,
    EstudiosModule,
    DocumentosModule,
    HealthModule,
    UsuariosModule,
    IndicadoresModule,
  ],
  controllers: [],
  providers: [
    {
      provide: APP_INTERCEPTOR,
      useFactory: (auditService: AuditService) => new AuditInterceptor(auditService),
      inject: [AuditService],
    },
  ],
})
export class AppModule {}

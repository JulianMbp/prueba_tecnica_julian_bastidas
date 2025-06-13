import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import * as readline from 'readline';

const prisma = new PrismaClient();

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function askQuestion(question: string): Promise<string> {
  return new Promise((resolve) => {
    rl.question(question, resolve);
  });
}

async function createAdmin() {
  console.log('🛡️ Configuración de Usuario Administrador\n');

  try {
    // Solicitar datos del administrador
    const name = await askQuestion('Nombre del administrador: ');
    const email = await askQuestion('Email del administrador: ');
    const password = await askQuestion('Contraseña (mínimo 6 caracteres): ');

    // Validaciones básicas
    if (!name || name.trim().length < 2) {
      throw new Error('El nombre debe tener al menos 2 caracteres');
    }

    if (!email || !email.includes('@')) {
      throw new Error('Debe proporcionar un email válido');
    }

    if (!password || password.length < 6) {
      throw new Error('La contraseña debe tener al menos 6 caracteres');
    }

    console.log('\n⏳ Creando administrador...\n');

    // Verificar si el usuario ya existe
    const existingUser = await prisma.user.findUnique({
      where: { email: email.trim() },
    });

    if (existingUser) {
      // Actualizar usuario existente a ADMIN
      const updatedUser = await prisma.user.update({
        where: { email: email.trim() },
        data: { role: 'ADMIN' },
      });

      console.log('✅ Usuario existente actualizado a administrador');
      console.log(`👤 ID: ${updatedUser.id}`);
      console.log(`📧 Email: ${updatedUser.email}`);
      console.log(`🏷️ Rol: ${updatedUser.role}`);
    } else {
      // Crear nuevo usuario administrador
      const saltRounds = 12;
      const hashedPassword = await bcrypt.hash(password, saltRounds);

      const newAdmin = await prisma.user.create({
        data: {
          name: name.trim(),
          email: email.trim(),
          password: hashedPassword,
          role: 'ADMIN',
        },
      });

      console.log('✅ Usuario administrador creado exitosamente');
      console.log(`👤 ID: ${newAdmin.id}`);
      console.log(`📧 Email: ${newAdmin.email}`);
      console.log(`🏷️ Rol: ${newAdmin.role}`);
    }

    console.log('\n🔐 Credenciales de acceso:');
    console.log(`📧 Email: ${email.trim()}`);
    console.log(`🔑 Contraseña: ${password}`);

    console.log('\n📋 Pasos siguientes:');
    console.log('1. Guarda estas credenciales de forma segura');
    console.log('2. Prueba el login en: http://localhost:3001/api/docs');
    console.log('3. Usa el token JWT para acceder a endpoints de administrador');

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    process.exit(1);
  } finally {
    rl.close();
    await prisma.$disconnect();
  }
}

async function main() {
  console.log('🚀 Script de Creación de Administrador - User Service\n');
  
  // Verificar conexión a la base de datos
  try {
    await prisma.$connect();
    console.log('✅ Conexión a base de datos establecida\n');
  } catch (error) {
    console.error('❌ Error conectando a la base de datos:', error.message);
    console.log('\n🔧 Posibles soluciones:');
    console.log('1. Verificar que Docker esté ejecutándose');
    console.log('2. Ejecutar: docker-compose up -d postgres');
    console.log('3. Verificar la variable DATABASE_URL');
    process.exit(1);
  }

  await createAdmin();
}

// Manejar Ctrl+C
process.on('SIGINT', async () => {
  console.log('\n\n👋 Proceso cancelado por el usuario');
  rl.close();
  await prisma.$disconnect();
  process.exit(0);
});

// Ejecutar script principal
main().catch(async (error) => {
  console.error('❌ Error inesperado:', error);
  await prisma.$disconnect();
  process.exit(1);
}); 
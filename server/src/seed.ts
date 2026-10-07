import { db } from './services/dbService';
import { getSeedData } from './data/seedData';

async function runSeed() {
  console.log('🌱 Starting MediCare HMS database seeding...');
  try {
    const seedData = await getSeedData();
    db.replaceAll(seedData);
    console.log('✅ Database seeded successfully!');
    console.log(`- Users: ${seedData.users.length}`);
    console.log(`- Doctors: ${seedData.doctors.length}`);
    console.log(`- Patients: ${seedData.patients.length}`);
    console.log(`- Departments: ${seedData.departments.length}`);
    console.log(`- Medicines: ${seedData.medicines.length}`);
    console.log(`- Lab Tests: ${seedData.labTests.length}`);
    console.log(`- Rooms & Beds: ${seedData.rooms.length} rooms, ${seedData.beds.length} beds`);
    console.log(`- Appointments: ${seedData.appointments.length}`);
    console.log(`- Invoices: ${seedData.invoices.length}`);
    console.log('Default Password for all seeded accounts: Medicare@123');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error during seeding:', error);
    process.exit(1);
  }
}

runSeed();

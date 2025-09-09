const mongoose = require('mongoose');
const User = require('../models/user.model');
const Patient = require('../models/patient.model');
const Department = require('../models/department.model');
const Medication = require('../models/medication.model');
require('dotenv').config();

const seedData = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/hygeia-nexus');
    console.log('Connected to MongoDB');

    // Clear existing data
    await User.deleteMany({});
    await Patient.deleteMany({});
    await Department.deleteMany({});
    await Medication.deleteMany({});
    console.log('Cleared existing data');

    // Create Departments
    const departments = await Department.insertMany([
      {
        name: 'Cardiology',
        code: 'CARD',
        description: 'Heart and cardiovascular system care',
        location: {
          building: 'Main Hospital',
          floor: '3rd Floor',
          wing: 'East Wing',
          roomNumbers: ['301', '302', '303', '304']
        },
        contactInfo: {
          phone: '+1-555-0101',
          email: 'cardiology@hygeia-nexus.com',
          extension: '3001'
        },
        operatingHours: {
          monday: { isOpen: true, openTime: '08:00', closeTime: '18:00' },
          tuesday: { isOpen: true, openTime: '08:00', closeTime: '18:00' },
          wednesday: { isOpen: true, openTime: '08:00', closeTime: '18:00' },
          thursday: { isOpen: true, openTime: '08:00', closeTime: '18:00' },
          friday: { isOpen: true, openTime: '08:00', closeTime: '18:00' },
          saturday: { isOpen: true, openTime: '09:00', closeTime: '14:00' },
          sunday: { isOpen: false }
        },
        services: ['ECG', 'Echocardiography', 'Cardiac Catheterization', 'Pacemaker Implantation']
      },
      {
        name: 'Emergency Medicine',
        code: 'ER',
        description: '24/7 emergency medical care',
        location: {
          building: 'Main Hospital',
          floor: 'Ground Floor',
          wing: 'North Wing',
          roomNumbers: ['001', '002', '003', '004', '005']
        },
        contactInfo: {
          phone: '+1-555-0911',
          email: 'emergency@hygeia-nexus.com',
          extension: '911'
        },
        operatingHours: {
          monday: { isOpen: true, openTime: '00:00', closeTime: '23:59' },
          tuesday: { isOpen: true, openTime: '00:00', closeTime: '23:59' },
          wednesday: { isOpen: true, openTime: '00:00', closeTime: '23:59' },
          thursday: { isOpen: true, openTime: '00:00', closeTime: '23:59' },
          friday: { isOpen: true, openTime: '00:00', closeTime: '23:59' },
          saturday: { isOpen: true, openTime: '00:00', closeTime: '23:59' },
          sunday: { isOpen: true, openTime: '00:00', closeTime: '23:59' }
        },
        services: ['Trauma Care', 'Critical Care', 'Emergency Surgery', 'Poison Control']
      },
      {
        name: 'Pediatrics',
        code: 'PEDS',
        description: 'Medical care for infants, children, and adolescents',
        location: {
          building: 'Children\'s Wing',
          floor: '2nd Floor',
          wing: 'West Wing',
          roomNumbers: ['201', '202', '203', '204', '205']
        },
        contactInfo: {
          phone: '+1-555-0202',
          email: 'pediatrics@hygeia-nexus.com',
          extension: '2001'
        },
        services: ['Well-child visits', 'Immunizations', 'Developmental assessments', 'Pediatric surgery']
      },
      {
        name: 'Orthopedics',
        code: 'ORTHO',
        description: 'Bone, joint, and musculoskeletal system care',
        location: {
          building: 'Surgical Center',
          floor: '1st Floor',
          wing: 'South Wing',
          roomNumbers: ['101', '102', '103']
        },
        contactInfo: {
          phone: '+1-555-0303',
          email: 'orthopedics@hygeia-nexus.com',
          extension: '1001'
        },
        services: ['Joint replacement', 'Sports medicine', 'Fracture care', 'Spine surgery']
      },
      {
        name: 'Laboratory',
        code: 'LAB',
        description: 'Clinical laboratory services and diagnostics',
        location: {
          building: 'Diagnostic Center',
          floor: 'Basement',
          wing: 'Central',
          roomNumbers: ['B01', 'B02', 'B03', 'B04']
        },
        contactInfo: {
          phone: '+1-555-0404',
          email: 'lab@hygeia-nexus.com',
          extension: '4001'
        },
        services: ['Blood tests', 'Urine analysis', 'Microbiology', 'Pathology']
      }
    ]);

    console.log('Created departments');

    // Create Users
    // Note: We pass plain text passwords and let the User model's pre-save hook handle hashing
    const plainPassword = 'password123';

    // Admin User
    const adminUser = await User.create({
      firstName: 'System',
      lastName: 'Administrator',
      email: 'admin@example.com',
      password: plainPassword,
      role: 'admin',
      phone: '+1-555-0001',
      isActive: true,
      employeeId: 'ADM001'
    });

    // Doctors - create individually to trigger pre-save hooks
    const doctor1 = await User.create({
      firstName: 'Dr. Sarah',
      lastName: 'Johnson',
      email: 'doctor@example.com',
      password: plainPassword,
      role: 'doctor',
      phone: '+1-555-1001',
      specialization: 'Cardiology',
      licenseNumber: 'MD123456',
      department: departments[0]._id, // Cardiology
      employeeId: 'DOC001',
      isActive: true
    });

    const doctor2 = await User.create({
      firstName: 'Dr. Michael',
      lastName: 'Chen',
      email: 'michael.chen@example.com',
      password: plainPassword,
      role: 'doctor',
      phone: '+1-555-1002',
      specialization: 'Emergency Medicine',
      licenseNumber: 'MD123457',
      department: departments[1]._id, // Emergency
      employeeId: 'DOC002',
      isActive: true
    });

    const doctor3 = await User.create({
      firstName: 'Dr. Emily',
      lastName: 'Rodriguez',
      email: 'emily.rodriguez@example.com',
      password: plainPassword,
      role: 'doctor',
      phone: '+1-555-1003',
      specialization: 'Pediatrics',
      licenseNumber: 'MD123458',
      department: departments[2]._id, // Pediatrics
      employeeId: 'DOC003',
      isActive: true
    });

    const doctor4 = await User.create({
      firstName: 'Dr. James',
      lastName: 'Wilson',
      email: 'james.wilson@example.com',
      password: plainPassword,
      role: 'doctor',
      phone: '+1-555-1004',
      specialization: 'Orthopedic Surgery',
      licenseNumber: 'MD123459',
      department: departments[3]._id, // Orthopedics
      employeeId: 'DOC004',
      isActive: true
    });

    const doctors = [doctor1, doctor2, doctor3, doctor4];

    // Update department heads
    await Department.findByIdAndUpdate(departments[0]._id, { head: doctors[0]._id });
    await Department.findByIdAndUpdate(departments[1]._id, { head: doctors[1]._id });
    await Department.findByIdAndUpdate(departments[2]._id, { head: doctors[2]._id });
    await Department.findByIdAndUpdate(departments[3]._id, { head: doctors[3]._id });

    // Nurses - create individually to trigger pre-save hooks
    const nurse1 = await User.create({
      firstName: 'Lisa',
      lastName: 'Thompson',
      email: 'lisa.thompson@example.com',
      password: plainPassword,
      role: 'nurse',
      phone: '+1-555-2001',
      department: departments[0]._id, // Cardiology
      employeeId: 'NUR001',
      isActive: true
    });

    const nurse2 = await User.create({
      firstName: 'Robert',
      lastName: 'Davis',
      email: 'robert.davis@example.com',
      password: plainPassword,
      role: 'nurse',
      phone: '+1-555-2002',
      department: departments[1]._id, // Emergency
      employeeId: 'NUR002',
      isActive: true
    });

    const nurses = [nurse1, nurse2];

    // Lab Technician
    const labTech = await User.create({
      firstName: 'Maria',
      lastName: 'Garcia',
      email: 'lab@example.com',
      password: plainPassword,
      role: 'lab_technician',
      phone: '+1-555-3001',
      department: departments[4]._id, // Laboratory
      employeeId: 'LAB001',
      isActive: true
    });

    // Patient Users - create individually to trigger pre-save hooks
    const patient1 = await User.create({
      firstName: 'John',
      lastName: 'Smith',
      email: 'patient@example.com',
      password: plainPassword,
      role: 'patient',
      phone: '+1-555-4001',
      dateOfBirth: new Date('1985-06-15'),
      gender: 'male',
      bloodGroup: 'O+',
      address: {
        street: '123 Main St',
        city: 'Springfield',
        state: 'IL',
        zipCode: '62701',
        country: 'USA'
      },
      emergencyContact: {
        name: 'Jane Smith',
        relationship: 'spouse',
        phone: '+1-555-4002',
        email: 'jane.smith@example.com'
      },
      allergies: ['Penicillin', 'Shellfish'],
      chronicConditions: ['Hypertension'],
      currentMedications: ['Lisinopril 10mg'],
      isActive: true
    });

    const patient2 = await User.create({
      firstName: 'Alice',
      lastName: 'Brown',
      email: 'alice.brown@example.com',
      password: plainPassword,
      role: 'patient',
      phone: '+1-555-4003',
      dateOfBirth: new Date('1992-03-22'),
      gender: 'female',
      bloodGroup: 'A+',
      address: {
        street: '456 Oak Ave',
        city: 'Springfield',
        state: 'IL',
        zipCode: '62702',
        country: 'USA'
      },
      emergencyContact: {
        name: 'Bob Brown',
        relationship: 'father',
        phone: '+1-555-4004',
        email: 'bob.brown@example.com'
      },
      allergies: ['Latex'],
      chronicConditions: [],
      currentMedications: [],
      isActive: true
    });

    const patient3 = await User.create({
      firstName: 'David',
      lastName: 'Johnson',
      email: 'david.johnson@example.com',
      password: plainPassword,
      role: 'patient',
      phone: '+1-555-4005',
      dateOfBirth: new Date('1978-11-08'),
      gender: 'male',
      bloodGroup: 'B-',
      address: {
        street: '789 Pine St',
        city: 'Springfield',
        state: 'IL',
        zipCode: '62703',
        country: 'USA'
      },
      emergencyContact: {
        name: 'Mary Johnson',
        relationship: 'wife',
        phone: '+1-555-4006',
        email: 'mary.johnson@example.com'
      },
      allergies: [],
      chronicConditions: ['Diabetes Type 2'],
      currentMedications: ['Metformin 500mg'],
      isActive: true
    });

    const patients = [patient1, patient2, patient3];

    console.log('Created users');

    // Create Patient records one by one to trigger pre-save hooks
    const patientRecords = [];
    
    // Patient Record 1
    const patientRecord1 = new Patient({
        user: patients[0]._id,
        insurance: {
          provider: 'Blue Cross Blue Shield',
          policyNumber: 'BC123456789',
          groupNumber: 'GRP001',
          subscriberName: 'John Smith',
          relationship: 'self',
          effectiveDate: new Date('2024-01-01'),
          expirationDate: new Date('2024-12-31'),
          copay: 25,
          deductible: 1000
        },
        primaryPhysician: doctors[0]._id,
        preferences: {
          preferredLanguage: 'English',
          communicationMethod: 'email',
          appointmentReminders: true,
          marketingCommunications: false
        }
    });
    await patientRecord1.save();
    patientRecords.push(patientRecord1);

    // Patient Record 2
    const patientRecord2 = new Patient({
        user: patients[1]._id,
        insurance: {
          provider: 'Aetna',
          policyNumber: 'AET987654321',
          groupNumber: 'GRP002',
          subscriberName: 'Alice Brown',
          relationship: 'self',
          effectiveDate: new Date('2024-01-01'),
          expirationDate: new Date('2024-12-31'),
          copay: 30,
          deductible: 1500
        },
        primaryPhysician: doctors[2]._id,
        preferences: {
          preferredLanguage: 'English',
          communicationMethod: 'phone',
          appointmentReminders: true,
          marketingCommunications: true
        }
    });
    await patientRecord2.save();
    patientRecords.push(patientRecord2);

    // Patient Record 3
    const patientRecord3 = new Patient({
        user: patients[2]._id,
        insurance: {
          provider: 'United Healthcare',
          policyNumber: 'UHC456789123',
          groupNumber: 'GRP003',
          subscriberName: 'David Johnson',
          relationship: 'self',
          effectiveDate: new Date('2024-01-01'),
          expirationDate: new Date('2024-12-31'),
          copay: 20,
          deductible: 500
        },
        primaryPhysician: doctors[0]._id,
        preferences: {
          preferredLanguage: 'English',
          communicationMethod: 'email',
          appointmentReminders: true,
          marketingCommunications: false
        }
    });
    await patientRecord3.save();
    patientRecords.push(patientRecord3);

    console.log('Created patient records');

    // Create sample medications one by one to trigger pre-save hooks
    const medications = [];
    
    // Medication 1
    const medication1 = new Medication({
        name: 'Lisinopril',
        genericName: 'Lisinopril',
        brandName: 'Prinivil',
        category: 'antihypertensive',
        dosageForm: 'tablet',
        strength: { value: 10, unit: 'mg' },
        manufacturer: {
          name: 'Generic Pharma',
          batchNumber: 'LP2024001',
          manufacturingDate: new Date('2024-01-15'),
          expiryDate: new Date('2026-01-15')
        },
        inventory: {
          currentStock: 500,
          minimumStock: 50,
          maximumStock: 1000,
          reorderLevel: 100,
          unitPrice: 0.25,
          sellingPrice: 0.50
        },
        prescriptionInfo: {
          isPrescriptionRequired: true,
          controlledSubstance: false
        },
        sideEffects: ['Dizziness', 'Dry cough', 'Headache'],
        contraindications: ['Pregnancy', 'Angioedema history'],
        dosageInstructions: {
          adult: '10mg once daily',
          elderly: '5mg once daily',
          special: 'Adjust dose in renal impairment'
        },
        createdBy: adminUser._id
    });
    await medication1.save();
    medications.push(medication1);

    // Medication 2
    const medication2 = new Medication({
        name: 'Metformin',
        genericName: 'Metformin Hydrochloride',
        brandName: 'Glucophage',
        category: 'antidiabetic',
        dosageForm: 'tablet',
        strength: { value: 500, unit: 'mg' },
        manufacturer: {
          name: 'Diabetes Care Inc',
          batchNumber: 'MF2024001',
          manufacturingDate: new Date('2024-02-01'),
          expiryDate: new Date('2026-02-01')
        },
        inventory: {
          currentStock: 750,
          minimumStock: 100,
          maximumStock: 1500,
          reorderLevel: 200,
          unitPrice: 0.15,
          sellingPrice: 0.30
        },
        prescriptionInfo: {
          isPrescriptionRequired: true,
          controlledSubstance: false
        },
        sideEffects: ['Nausea', 'Diarrhea', 'Metallic taste'],
        contraindications: ['Severe kidney disease', 'Metabolic acidosis'],
        dosageInstructions: {
          adult: '500mg twice daily with meals',
          elderly: '500mg once daily initially',
          special: 'Contraindicated in severe renal impairment'
        },
        createdBy: adminUser._id
    });
    await medication2.save();
    medications.push(medication2);

    // Medication 3
    const medication3 = new Medication({
        name: 'Amoxicillin',
        genericName: 'Amoxicillin',
        brandName: 'Amoxil',
        category: 'antibiotic',
        dosageForm: 'capsule',
        strength: { value: 250, unit: 'mg' },
        manufacturer: {
          name: 'Antibiotic Solutions',
          batchNumber: 'AM2024001',
          manufacturingDate: new Date('2024-03-01'),
          expiryDate: new Date('2026-03-01')
        },
        inventory: {
          currentStock: 300,
          minimumStock: 75,
          maximumStock: 800,
          reorderLevel: 150,
          unitPrice: 0.35,
          sellingPrice: 0.70
        },
        prescriptionInfo: {
          isPrescriptionRequired: true,
          controlledSubstance: false
        },
        sideEffects: ['Nausea', 'Diarrhea', 'Skin rash'],
        contraindications: ['Penicillin allergy', 'Mononucleosis'],
        dosageInstructions: {
          adult: '250-500mg three times daily',
          pediatric: '20-40mg/kg/day divided into 3 doses',
          special: 'Complete full course even if symptoms improve'
        },
        createdBy: adminUser._id
    });
    await medication3.save();
    medications.push(medication3);

    // Medication 4
    const medication4 = new Medication({
        name: 'Ibuprofen',
        genericName: 'Ibuprofen',
        brandName: 'Advil',
        category: 'analgesic',
        dosageForm: 'tablet',
        strength: { value: 200, unit: 'mg' },
        manufacturer: {
          name: 'Pain Relief Corp',
          batchNumber: 'IB2024001',
          manufacturingDate: new Date('2024-01-20'),
          expiryDate: new Date('2026-01-20')
        },
        inventory: {
          currentStock: 1000,
          minimumStock: 200,
          maximumStock: 2000,
          reorderLevel: 400,
          unitPrice: 0.10,
          sellingPrice: 0.20
        },
        prescriptionInfo: {
          isPrescriptionRequired: false,
          controlledSubstance: false
        },
        sideEffects: ['Stomach upset', 'Dizziness', 'Headache'],
        contraindications: ['Peptic ulcer', 'Severe heart failure', 'Aspirin allergy'],
        dosageInstructions: {
          adult: '200-400mg every 4-6 hours as needed',
          pediatric: '5-10mg/kg every 6-8 hours',
          special: 'Take with food to reduce stomach upset'
        },
        createdBy: adminUser._id
    });
    await medication4.save();
    medications.push(medication4);

    console.log('Created medications');

    console.log('\n=== SEED DATA CREATED SUCCESSFULLY ===');
    console.log('\nLogin Credentials:');
    console.log('Admin: admin@example.com / password123');
    console.log('Doctor: doctor@example.com / password123');
    console.log('Patient: patient@example.com / password123');
    console.log('Lab Tech: lab@example.com / password123');
    console.log('\nDepartments created:', departments.length);
    console.log('Users created:', 1 + doctors.length + nurses.length + 1 + patients.length);
    console.log('Patient records created:', patientRecords.length);
    console.log('Medications created:', medications.length);

  } catch (error) {
    console.error('Error seeding data:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\nDisconnected from MongoDB');
  }
};

// Run the seed function
if (require.main === module) {
  seedData();
}

module.exports = seedData;
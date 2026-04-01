/**
 * Run: node utils/seed.js
 * Seeds all dummy data: users, institution, campus, departments, programs, quotas, applicants
 */
require('dotenv').config({ path: '../.env' });
const mongoose = require('mongoose');

const User = require('../models/User');
const Institution = require('../models/Institution');
const Campus = require('../models/Campus');
const Department = require('../models/Department');
const AcademicYear = require('../models/AcademicYear');
const Program = require('../models/Program');
const Quota = require('../models/Quota');
const Applicant = require('../models/Applicant');

async function seed() {
  await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/admission_management');
  console.log('Connected to MongoDB');

  // ── Clear existing data ──────────────────────────────────────────────────
  await Promise.all([
    User.deleteMany({}),
    Institution.deleteMany({}),
    Campus.deleteMany({}),
    Department.deleteMany({}),
    AcademicYear.deleteMany({}),
    Program.deleteMany({}),
    Quota.deleteMany({}),
    Applicant.deleteMany({}),
  ]);
  console.log('Cleared existing data');

  // ── Users ────────────────────────────────────────────────────────────────
  const users = await Promise.all([
    User.create({ name: 'Super Admin',     email: 'admin@example.com',      password: 'Admin@123',   role: 'admin' }),
    User.create({ name: 'John Officer',    email: 'officer@example.com',    password: 'Officer@123', role: 'admission_officer' }),
    User.create({ name: 'Jane Management', email: 'management@example.com', password: 'Mgmt@123',    role: 'management' }),
  ]);
  const adminUser = users[0];
  console.log('✅ Users seeded');

  // ── Institution ──────────────────────────────────────────────────────────
  const institution = await Institution.create({
    name: 'RV Institute of Technology',
    code: 'RVIT',
    address: '123 Tech Park, Bangalore, Karnataka',
    phone: '080-12345678',
    email: 'info@rvit.edu.in',
  });
  console.log('✅ Institution seeded');

  // ── Campus ───────────────────────────────────────────────────────────────
  const campus = await Campus.create({
    name: 'Main Campus',
    code: 'RVIT-MAIN',
    institution: institution._id,
    address: '123 Tech Park, Bangalore',
  });
  console.log('✅ Campus seeded');

  // ── Academic Year ────────────────────────────────────────────────────────
  const academicYear = await AcademicYear.create({
    year: '2025-26',
    startDate: new Date('2025-08-01'),
    endDate: new Date('2026-05-31'),
    isCurrent: true,
  });
  console.log('✅ Academic Year seeded');

  // ── Departments ──────────────────────────────────────────────────────────
  const [csDept, ecDept, meDept, cvDept] = await Department.insertMany([
    { name: 'Computer Science & Engineering', code: 'CSE', campus: campus._id },
    { name: 'Electronics & Communication',    code: 'ECE', campus: campus._id },
    { name: 'Mechanical Engineering',         code: 'ME',  campus: campus._id },
    { name: 'Civil Engineering',              code: 'CE',  campus: campus._id },
  ]);
  console.log('✅ Departments seeded');

  // ── Programs ─────────────────────────────────────────────────────────────
  const [cseProgram, eceProgram, meProgram, ceProgram, mcsProgram] = await Program.insertMany([
    {
      name: 'B.E. Computer Science',
      code: 'BE-CSE',
      department: csDept._id,
      courseType: 'UG',
      entryType: 'Regular',
      admissionMode: 'Government',
      academicYear: academicYear._id,
      totalIntake: 120,
    },
    {
      name: 'B.E. Electronics & Communication',
      code: 'BE-ECE',
      department: ecDept._id,
      courseType: 'UG',
      entryType: 'Regular',
      admissionMode: 'Government',
      academicYear: academicYear._id,
      totalIntake: 60,
    },
    {
      name: 'B.E. Mechanical Engineering',
      code: 'BE-ME',
      department: meDept._id,
      courseType: 'UG',
      entryType: 'Regular',
      admissionMode: 'Government',
      academicYear: academicYear._id,
      totalIntake: 60,
    },
    {
      name: 'B.E. Civil Engineering',
      code: 'BE-CE',
      department: cvDept._id,
      courseType: 'UG',
      entryType: 'Regular',
      admissionMode: 'Government',
      academicYear: academicYear._id,
      totalIntake: 60,
    },
    {
      name: 'M.Tech Computer Science',
      code: 'MT-CSE',
      department: csDept._id,
      courseType: 'PG',
      entryType: 'Regular',
      admissionMode: 'Management',
      academicYear: academicYear._id,
      totalIntake: 30,
    },
  ]);
  console.log('✅ Programs seeded');

  // ── Quotas ───────────────────────────────────────────────────────────────
  // CSE: 120 seats → KCET=60, COMEDK=30, Management=30
  const cseKcet = await Quota.create({ program: cseProgram._id, quotaType: 'KCET',       totalSeats: 60,  allocatedSeats: 42 });
  const cseComedk = await Quota.create({ program: cseProgram._id, quotaType: 'COMEDK',   totalSeats: 30,  allocatedSeats: 18 });
  const cseMgmt = await Quota.create({ program: cseProgram._id, quotaType: 'Management', totalSeats: 30,  allocatedSeats: 10 });

  // ECE: 60 seats → KCET=30, COMEDK=15, Management=15
  await Quota.create({ program: eceProgram._id, quotaType: 'KCET',       totalSeats: 30, allocatedSeats: 20 });
  await Quota.create({ program: eceProgram._id, quotaType: 'COMEDK',     totalSeats: 15, allocatedSeats: 8  });
  await Quota.create({ program: eceProgram._id, quotaType: 'Management', totalSeats: 15, allocatedSeats: 5  });

  // ME: 60 seats
  await Quota.create({ program: meProgram._id, quotaType: 'KCET',       totalSeats: 30, allocatedSeats: 15 });
  await Quota.create({ program: meProgram._id, quotaType: 'COMEDK',     totalSeats: 15, allocatedSeats: 6  });
  await Quota.create({ program: meProgram._id, quotaType: 'Management', totalSeats: 15, allocatedSeats: 4  });

  // CE: 60 seats
  await Quota.create({ program: ceProgram._id, quotaType: 'KCET',       totalSeats: 30, allocatedSeats: 10 });
  await Quota.create({ program: ceProgram._id, quotaType: 'COMEDK',     totalSeats: 15, allocatedSeats: 4  });
  await Quota.create({ program: ceProgram._id, quotaType: 'Management', totalSeats: 15, allocatedSeats: 3  });

  // MCS: 30 seats
  await Quota.create({ program: mcsProgram._id, quotaType: 'Management', totalSeats: 30, allocatedSeats: 12 });

  console.log('✅ Quotas seeded');

  // ── Applicants ───────────────────────────────────────────────────────────
  const applicantsData = [
    // CSE KCET - confirmed
    { fullName: 'Arjun Sharma',    fatherName: 'Ramesh Sharma',   email: 'arjun.sharma@gmail.com',    mobile: '9876543210', dob: new Date('2005-03-15'), gender: 'Male',   address: '12 MG Road, Bangalore',       category: 'General', entryType: 'Regular', quotaType: 'KCET',       marks: 145, qualifyingExam: 'KCET 2025', programApplied: cseProgram._id, allotmentNumber: 'KCET25001', documentStatus: 'Verified', feeStatus: 'Paid',    seatAllocated: true,  admissionConfirmed: true  },
    { fullName: 'Priya Nair',      fatherName: 'Suresh Nair',     email: 'priya.nair@gmail.com',      mobile: '9876543211', dob: new Date('2005-06-22'), gender: 'Female', address: '45 Koramangala, Bangalore',   category: 'OBC',     entryType: 'Regular', quotaType: 'KCET',       marks: 152, qualifyingExam: 'KCET 2025', programApplied: cseProgram._id, allotmentNumber: 'KCET25002', documentStatus: 'Verified', feeStatus: 'Paid',    seatAllocated: true,  admissionConfirmed: true  },
    { fullName: 'Rahul Verma',     fatherName: 'Anil Verma',      email: 'rahul.verma@gmail.com',     mobile: '9876543212', dob: new Date('2005-01-10'), gender: 'Male',   address: '78 Indiranagar, Bangalore',   category: 'SC',      entryType: 'Regular', quotaType: 'KCET',       marks: 138, qualifyingExam: 'KCET 2025', programApplied: cseProgram._id, allotmentNumber: 'KCET25003', documentStatus: 'Verified', feeStatus: 'Paid',    seatAllocated: true,  admissionConfirmed: true  },
    { fullName: 'Sneha Reddy',     fatherName: 'Krishna Reddy',   email: 'sneha.reddy@gmail.com',     mobile: '9876543213', dob: new Date('2005-09-05'), gender: 'Female', address: '23 HSR Layout, Bangalore',    category: 'General', entryType: 'Regular', quotaType: 'KCET',       marks: 160, qualifyingExam: 'KCET 2025', programApplied: cseProgram._id, allotmentNumber: 'KCET25004', documentStatus: 'Verified', feeStatus: 'Paid',    seatAllocated: true,  admissionConfirmed: true  },
    // CSE KCET - seat allocated, fee pending
    { fullName: 'Kiran Patil',     fatherName: 'Sunil Patil',     email: 'kiran.patil@gmail.com',     mobile: '9876543214', dob: new Date('2005-11-20'), gender: 'Male',   address: '56 Whitefield, Bangalore',    category: 'OBC',     entryType: 'Regular', quotaType: 'KCET',       marks: 130, qualifyingExam: 'KCET 2025', programApplied: cseProgram._id, allotmentNumber: 'KCET25005', documentStatus: 'Submitted', feeStatus: 'Pending', seatAllocated: true,  admissionConfirmed: false },
    { fullName: 'Divya Menon',     fatherName: 'Rajan Menon',     email: 'divya.menon@gmail.com',     mobile: '9876543215', dob: new Date('2005-04-18'), gender: 'Female', address: '90 Jayanagar, Bangalore',     category: 'General', entryType: 'Regular', quotaType: 'KCET',       marks: 148, qualifyingExam: 'KCET 2025', programApplied: cseProgram._id, allotmentNumber: 'KCET25006', documentStatus: 'Verified', feeStatus: 'Pending', seatAllocated: true,  admissionConfirmed: false },
    // CSE COMEDK
    { fullName: 'Aditya Kumar',    fatherName: 'Vijay Kumar',     email: 'aditya.kumar@gmail.com',    mobile: '9876543216', dob: new Date('2005-07-30'), gender: 'Male',   address: '34 BTM Layout, Bangalore',    category: 'General', entryType: 'Regular', quotaType: 'COMEDK',     marks: 155, qualifyingExam: 'COMEDK 2025', programApplied: cseProgram._id, documentStatus: 'Verified', feeStatus: 'Paid',    seatAllocated: true,  admissionConfirmed: true  },
    { fullName: 'Meera Iyer',      fatherName: 'Venkat Iyer',     email: 'meera.iyer@gmail.com',      mobile: '9876543217', dob: new Date('2005-02-14'), gender: 'Female', address: '67 Rajajinagar, Bangalore',   category: 'General', entryType: 'Regular', quotaType: 'COMEDK',     marks: 162, qualifyingExam: 'COMEDK 2025', programApplied: cseProgram._id, documentStatus: 'Submitted', feeStatus: 'Pending', seatAllocated: true,  admissionConfirmed: false },
    // CSE Management
    { fullName: 'Rohan Gupta',     fatherName: 'Deepak Gupta',    email: 'rohan.gupta@gmail.com',     mobile: '9876543218', dob: new Date('2005-08-25'), gender: 'Male',   address: '11 Sadashivanagar, Bangalore',category: 'General', entryType: 'Regular', quotaType: 'Management', marks: 120, qualifyingExam: 'PUC 2025',    programApplied: cseProgram._id, documentStatus: 'Verified', feeStatus: 'Paid',    seatAllocated: true,  admissionConfirmed: true  },
    { fullName: 'Ananya Singh',    fatherName: 'Rajiv Singh',     email: 'ananya.singh@gmail.com',    mobile: '9876543219', dob: new Date('2005-05-12'), gender: 'Female', address: '88 Malleshwaram, Bangalore',  category: 'EWS',     entryType: 'Regular', quotaType: 'Management', marks: 115, qualifyingExam: 'PUC 2025',    programApplied: cseProgram._id, documentStatus: 'Pending',   feeStatus: 'Pending', seatAllocated: false, admissionConfirmed: false },
    // ECE applicants
    { fullName: 'Vikram Rao',      fatherName: 'Srinivas Rao',    email: 'vikram.rao@gmail.com',      mobile: '9876543220', dob: new Date('2005-10-08'), gender: 'Male',   address: '22 Electronic City, Bangalore',category: 'General',entryType: 'Regular', quotaType: 'KCET',       marks: 140, qualifyingExam: 'KCET 2025', programApplied: eceProgram._id, allotmentNumber: 'KCET25010', documentStatus: 'Verified', feeStatus: 'Paid',    seatAllocated: true,  admissionConfirmed: true  },
    { fullName: 'Pooja Desai',     fatherName: 'Mahesh Desai',    email: 'pooja.desai@gmail.com',     mobile: '9876543221', dob: new Date('2005-12-01'), gender: 'Female', address: '55 Yelahanka, Bangalore',     category: 'OBC',     entryType: 'Regular', quotaType: 'KCET',       marks: 135, qualifyingExam: 'KCET 2025', programApplied: eceProgram._id, allotmentNumber: 'KCET25011', documentStatus: 'Submitted', feeStatus: 'Pending', seatAllocated: true,  admissionConfirmed: false },
    { fullName: 'Suresh Babu',     fatherName: 'Narayana Babu',   email: 'suresh.babu@gmail.com',     mobile: '9876543222', dob: new Date('2005-03-28'), gender: 'Male',   address: '77 Hebbal, Bangalore',        category: 'SC',      entryType: 'Regular', quotaType: 'COMEDK',     marks: 148, qualifyingExam: 'COMEDK 2025', programApplied: eceProgram._id, documentStatus: 'Verified', feeStatus: 'Paid',    seatAllocated: true,  admissionConfirmed: true  },
    // ME applicants
    { fullName: 'Harish Gowda',    fatherName: 'Basavaiah Gowda', email: 'harish.gowda@gmail.com',    mobile: '9876543223', dob: new Date('2005-06-15'), gender: 'Male',   address: '33 Mysore Road, Bangalore',   category: 'ST',      entryType: 'Regular', quotaType: 'KCET',       marks: 125, qualifyingExam: 'KCET 2025', programApplied: meProgram._id,  allotmentNumber: 'KCET25020', documentStatus: 'Verified', feeStatus: 'Paid',    seatAllocated: true,  admissionConfirmed: true  },
    { fullName: 'Lakshmi Prasad',  fatherName: 'Venkatesh Prasad',email: 'lakshmi.prasad@gmail.com',  mobile: '9876543224', dob: new Date('2005-09-19'), gender: 'Female', address: '44 Tumkur Road, Bangalore',   category: 'General', entryType: 'Regular', quotaType: 'KCET',       marks: 132, qualifyingExam: 'KCET 2025', programApplied: meProgram._id,  allotmentNumber: 'KCET25021', documentStatus: 'Pending',   feeStatus: 'Pending', seatAllocated: false, admissionConfirmed: false },
    // CE applicants
    { fullName: 'Naveen Kumar',    fatherName: 'Prakash Kumar',   email: 'naveen.kumar@gmail.com',    mobile: '9876543225', dob: new Date('2005-01-25'), gender: 'Male',   address: '66 Kengeri, Bangalore',       category: 'OBC',     entryType: 'Regular', quotaType: 'KCET',       marks: 118, qualifyingExam: 'KCET 2025', programApplied: ceProgram._id,  allotmentNumber: 'KCET25030', documentStatus: 'Verified', feeStatus: 'Paid',    seatAllocated: true,  admissionConfirmed: true  },
    { fullName: 'Rekha Joshi',     fatherName: 'Mohan Joshi',     email: 'rekha.joshi@gmail.com',     mobile: '9876543226', dob: new Date('2005-07-07'), gender: 'Female', address: '99 Bannerghatta, Bangalore',  category: 'General', entryType: 'Regular', quotaType: 'Management', marks: 110, qualifyingExam: 'PUC 2025',    programApplied: ceProgram._id,  documentStatus: 'Submitted', feeStatus: 'Pending', seatAllocated: true,  admissionConfirmed: false },
    // M.Tech applicants
    { fullName: 'Dr. Amit Jain',   fatherName: 'Suresh Jain',     email: 'amit.jain@gmail.com',       mobile: '9876543227', dob: new Date('2000-04-10'), gender: 'Male',   address: '15 Cunningham Road, Bangalore',category: 'General',entryType: 'Regular', quotaType: 'Management', marks: 78,  qualifyingExam: 'GATE 2025',   programApplied: mcsProgram._id, documentStatus: 'Verified', feeStatus: 'Paid',    seatAllocated: true,  admissionConfirmed: true  },
    { fullName: 'Kavitha Reddy',   fatherName: 'Naresh Reddy',    email: 'kavitha.reddy@gmail.com',   mobile: '9876543228', dob: new Date('2001-11-30'), gender: 'Female', address: '28 Richmond Road, Bangalore', category: 'OBC',     entryType: 'Regular', quotaType: 'Management', marks: 72,  qualifyingExam: 'GATE 2025',   programApplied: mcsProgram._id, documentStatus: 'Submitted', feeStatus: 'Pending', seatAllocated: true,  admissionConfirmed: false },
    // Lateral entry
    { fullName: 'Sanjay Kulkarni', fatherName: 'Dilip Kulkarni',  email: 'sanjay.kulkarni@gmail.com', mobile: '9876543229', dob: new Date('2003-08-14'), gender: 'Male',   address: '50 Shivajinagar, Bangalore',  category: 'General', entryType: 'Lateral', quotaType: 'Management', marks: 68,  qualifyingExam: 'Diploma 2023', programApplied: cseProgram._id, documentStatus: 'Pending',   feeStatus: 'Pending', seatAllocated: false, admissionConfirmed: false },
  ];

  await Applicant.insertMany(applicantsData.map((a) => ({ ...a, createdBy: adminUser._id })));
  console.log(`✅ ${applicantsData.length} Applicants seeded`);

  console.log('\n─────────────────────────────────────────');
  console.log('Seed complete! Login credentials:');
  console.log('  Admin      → admin@example.com      / Admin@123');
  console.log('  Officer    → officer@example.com    / Officer@123');
  console.log('  Management → management@example.com / Mgmt@123');
  console.log('─────────────────────────────────────────\n');

  process.exit(0);
}

seed().catch((err) => { console.error(err); process.exit(1); });

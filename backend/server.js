const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const morgan = require('morgan');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors({
  origin: process.env.NODE_ENV === 'production'
    ? process.env.CLIENT_URL
    : ['http://localhost:3000'],
  credentials: true
}));
app.use(express.json());
app.use(morgan('dev'));

// Routes
app.use('/api/auth', require('./routes/auth.routes'));
app.use('/api/institutions', require('./routes/institution.routes'));
app.use('/api/campuses', require('./routes/campus.routes'));
app.use('/api/departments', require('./routes/department.routes'));
app.use('/api/programs', require('./routes/program.routes'));
app.use('/api/academic-years', require('./routes/academicYear.routes'));
app.use('/api/quotas', require('./routes/quota.routes'));
app.use('/api/applicants', require('./routes/applicant.routes'));
app.use('/api/allocate-seat', require('./routes/allocation.routes'));
app.use('/api/confirm-admission', require('./routes/admission.routes'));
app.use('/api/dashboard', require('./routes/dashboard.routes'));
app.use('/api/users', require('./routes/user.routes'));

// Health check
app.get('/api/health', (req, res) => res.json({ status: 'OK' }));

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({ message: err.message || 'Internal Server Error' });
});

// DB + Server
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log('MongoDB connected');
    app.listen(process.env.PORT || 5000, () =>
      console.log(`Server running on port ${process.env.PORT || 5000}`)
    );
  })
  .catch((err) => {
    console.error('DB connection failed:', err.message);
    process.exit(1);
  });

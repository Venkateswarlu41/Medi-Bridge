const User = require('../models/user.model');
const Appointment = require('../models/appointment.model');
const MedicalRecord = require('../models/medicalRecord.model');
const { validationResult } = require('express-validator');

// Get all doctors
const getAllDoctors = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search,
      specialization,
      departmentId,
      isActive
    } = req.query;

    const skip = (page - 1) * limit;

    // Build query
    let query = {
      role: 'doctor'
    };

    // Only filter by isActive if explicitly provided
    if (isActive !== undefined) {
      query.isActive = isActive === 'true';
    }

    if (search) {
      query.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { specialization: { $regex: search, $options: 'i' } },
        { licenseNumber: { $regex: search, $options: 'i' } }
      ];
    }

    if (specialization) {
      query.specialization = { $regex: specialization, $options: 'i' };
    }

    if (departmentId) {
      query.department = departmentId;
    }

    console.log('Doctor query:', query); // Debug log

    const doctors = await User.find(query)
      .populate('department', 'name code location')
      .select('-password')
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ firstName: 1, lastName: 1 });

    console.log('Found doctors:', doctors.length); // Debug log

    const total = await User.countDocuments(query);

    // Get additional stats for each doctor
    const doctorsWithStats = await Promise.all(
      doctors.map(async (doctor) => {
        const today = new Date();
        const startOfDay = new Date(today.setHours(0, 0, 0, 0));
        const endOfDay = new Date(today.setHours(23, 59, 59, 999));

        const [todayAppointments, totalPatients, totalRecords] = await Promise.all([
          Appointment.countDocuments({
            doctor: doctor._id,
            appointmentDate: { $gte: startOfDay, $lte: endOfDay },
            status: { $in: ['scheduled', 'confirmed', 'in-progress'] }
          }),
          Appointment.distinct('patient', { doctor: doctor._id }).then(patients => patients.length),
          MedicalRecord.countDocuments({ doctor: doctor._id })
        ]);

        return {
          ...doctor.toObject(),
          stats: {
            todayAppointments,
            totalPatients,
            totalRecords
          }
        };
      })
    );

    res.json({
      success: true,
      data: {
        doctors: doctorsWithStats,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / limit),
          totalItems: total,
          itemsPerPage: parseInt(limit)
        }
      }
    });
  } catch (error) {
    console.error('Get doctors error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch doctors',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// Get doctor by ID
const getDoctorById = async (req, res) => {
  try {
    const { id } = req.params;

    const doctor = await User.findById(id)
      .populate('department', 'name code location contactInfo')
      .select('-password');

    if (!doctor || doctor.role !== 'doctor') {
      return res.status(404).json({
        success: false,
        message: 'Doctor not found'
      });
    }

    // Get doctor statistics
    const [
      totalAppointments,
      completedAppointments,
      totalPatients,
      totalRecords,
      recentAppointments
    ] = await Promise.all([
      Appointment.countDocuments({ doctor: id }),
      Appointment.countDocuments({ doctor: id, status: 'completed' }),
      Appointment.distinct('patient', { doctor: id }).then(patients => patients.length),
      MedicalRecord.countDocuments({ doctor: id }),
      Appointment.find({ doctor: id })
        .populate('patient', 'firstName lastName')
        .sort({ appointmentDate: -1 })
        .limit(5)
    ]);

    const stats = {
      totalAppointments,
      completedAppointments,
      totalPatients,
      totalRecords,
      completionRate: totalAppointments > 0 ? ((completedAppointments / totalAppointments) * 100).toFixed(1) : 0
    };

    res.json({
      success: true,
      data: {
        doctor: {
          ...doctor.toObject(),
          stats
        },
        recentAppointments
      }
    });
  } catch (error) {
    console.error('Get doctor error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch doctor',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// Get doctor's schedule
const getDoctorSchedule = async (req, res) => {
  try {
    const { id } = req.params;
    const { date, week, month } = req.query;

    // Check if user can access this doctor's schedule
    if (req.user.role === 'doctor' && req.user._id.toString() !== id) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    let startDate, endDate;

    if (date) {
      // Single day
      startDate = new Date(date);
      endDate = new Date(date);
      endDate.setDate(endDate.getDate() + 1);
    } else if (week) {
      // Week view
      startDate = new Date(week);
      endDate = new Date(week);
      endDate.setDate(endDate.getDate() + 7);
    } else if (month) {
      // Month view
      const [year, monthNum] = month.split('-');
      startDate = new Date(year, monthNum - 1, 1);
      endDate = new Date(year, monthNum, 0);
    } else {
      // Default to today
      startDate = new Date();
      startDate.setHours(0, 0, 0, 0);
      endDate = new Date();
      endDate.setHours(23, 59, 59, 999);
    }

    const appointments = await Appointment.find({
      doctor: id,
      appointmentDate: { $gte: startDate, $lte: endDate }
    })
      .populate('patient', 'firstName lastName phone')
      .populate('department', 'name code')
      .sort({ appointmentDate: 1, appointmentTime: 1 });

    // Group appointments by date
    const schedule = appointments.reduce((acc, appointment) => {
      const dateKey = appointment.appointmentDate.toISOString().split('T')[0];
      if (!acc[dateKey]) {
        acc[dateKey] = [];
      }
      acc[dateKey].push(appointment);
      return acc;
    }, {});

    res.json({
      success: true,
      data: {
        schedule,
        period: { startDate, endDate },
        totalAppointments: appointments.length
      }
    });
  } catch (error) {
    console.error('Get doctor schedule error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch doctor schedule',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// Get doctor's patients
const getDoctorPatients = async (req, res) => {
  try {
    const { id } = req.params;
    const { page = 1, limit = 10, search } = req.query;

    // Check permissions
    if (req.user.role === 'doctor' && req.user._id.toString() !== id) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    const skip = (page - 1) * limit;

    // Get unique patients who have appointments with this doctor
    let patientIds = await Appointment.distinct('patient', { doctor: id });

    // Build patient query
    let patientQuery = {
      _id: { $in: patientIds },
      role: 'patient'
    };

    if (search) {
      patientQuery.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    const patients = await User.find(patientQuery)
      .select('-password')
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ firstName: 1, lastName: 1 });

    const total = await User.countDocuments(patientQuery);

    // Get additional info for each patient
    const patientsWithInfo = await Promise.all(
      patients.map(async (patient) => {
        const [lastAppointment, totalAppointments, lastRecord] = await Promise.all([
          Appointment.findOne({
            patient: patient._id,
            doctor: id
          }).sort({ appointmentDate: -1 }),
          Appointment.countDocuments({
            patient: patient._id,
            doctor: id
          }),
          MedicalRecord.findOne({
            patient: patient._id,
            doctor: id
          }).sort({ recordDate: -1 })
        ]);

        return {
          ...patient.toObject(),
          doctorRelation: {
            lastAppointment: lastAppointment?.appointmentDate || null,
            totalAppointments,
            lastRecord: lastRecord?.recordDate || null
          }
        };
      })
    );

    res.json({
      success: true,
      data: {
        patients: patientsWithInfo,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / limit),
          totalItems: total,
          itemsPerPage: parseInt(limit)
        }
      }
    });
  } catch (error) {
    console.error('Get doctor patients error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch doctor patients',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// Get doctor dashboard data
const getDoctorDashboard = async (req, res) => {
  try {
    const doctorId = req.user._id;

    const today = new Date();
    const startOfDay = new Date(today.setHours(0, 0, 0, 0));
    const endOfDay = new Date(today.setHours(23, 59, 59, 999));

    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay());
    startOfWeek.setHours(0, 0, 0, 0);

    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);
    endOfWeek.setHours(23, 59, 59, 999);

    const [
      todayAppointments,
      weekAppointments,
      pendingRecords,
      totalPatients,
      todaySchedule,
      recentRecords
    ] = await Promise.all([
      Appointment.find({
        doctor: doctorId,
        appointmentDate: { $gte: startOfDay, $lte: endOfDay }
      }).populate('patient', 'firstName lastName'),

      Appointment.countDocuments({
        doctor: doctorId,
        appointmentDate: { $gte: startOfWeek, $lte: endOfWeek }
      }),

      MedicalRecord.countDocuments({
        doctor: doctorId,
        status: { $in: ['draft', 'pending'] }
      }),

      Appointment.distinct('patient', { doctor: doctorId }).then(patients => patients.length),

      Appointment.find({
        doctor: doctorId,
        appointmentDate: { $gte: startOfDay, $lte: endOfDay }
      })
        .populate('patient', 'firstName lastName phone')
        .sort({ appointmentTime: 1 }),

      MedicalRecord.find({ doctor: doctorId })
        .populate('patient', 'firstName lastName')
        .sort({ recordDate: -1 })
        .limit(5)
    ]);

    const stats = {
      totalPatients: totalPatients || 0,
      todayAppointments: todayAppointments.length || 0,
      weekAppointments: weekAppointments || 0,
      pendingReports: pendingRecords || 0,
      completedToday: todayAppointments.filter(apt => apt.status === 'completed').length || 0,
      upcomingToday: todayAppointments.filter(apt => ['scheduled', 'confirmed'].includes(apt.status)).length || 0
    };

    res.json({
      success: true,
      data: {
        stats,
        todaySchedule,
        recentRecords
      }
    });
  } catch (error) {
    console.error('Get doctor dashboard error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch dashboard data',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

module.exports = {
  getAllDoctors,
  getDoctorById,
  getDoctorSchedule,
  getDoctorPatients,
  getDoctorDashboard
};
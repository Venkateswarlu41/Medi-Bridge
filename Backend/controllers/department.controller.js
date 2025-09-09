const Department = require('../models/department.model');
const User = require('../models/user.model');
const { validationResult } = require('express-validator');

// Get all departments
const getAllDepartments = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      search, 
      isActive = true 
    } = req.query;
    
    const skip = (page - 1) * limit;
    
    // Build query
    let query = { isActive: isActive === 'true' };
    
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { code: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }
    
    const departments = await Department.find(query)
      .populate('head', 'firstName lastName specialization')
      .populate('staffCount')
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ name: 1 });
    
    const total = await Department.countDocuments(query);
    
    // Get additional stats for each department
    const departmentsWithStats = await Promise.all(
      departments.map(async (department) => {
        const staffCount = await User.countDocuments({ 
          department: department._id, 
          isActive: true 
        });
        
        const doctorCount = await User.countDocuments({ 
          department: department._id, 
          role: 'doctor',
          isActive: true 
        });
        
        const nurseCount = await User.countDocuments({ 
          department: department._id, 
          role: 'nurse',
          isActive: true 
        });
        
        return {
          ...department.toObject(),
          stats: {
            totalStaff: staffCount,
            doctors: doctorCount,
            nurses: nurseCount,
            others: staffCount - doctorCount - nurseCount
          }
        };
      })
    );
    
    res.json({
      success: true,
      data: {
        departments: departmentsWithStats,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / limit),
          totalItems: total,
          itemsPerPage: parseInt(limit)
        }
      }
    });
  } catch (error) {
    console.error('Get departments error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch departments',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// Get department by ID
const getDepartmentById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const department = await Department.findById(id)
      .populate('head', 'firstName lastName specialization email phone');
    
    if (!department) {
      return res.status(404).json({
        success: false,
        message: 'Department not found'
      });
    }
    
    // Get department staff
    const staff = await User.find({ 
      department: id, 
      isActive: true 
    })
    .select('firstName lastName role specialization email phone employeeId')
    .sort({ role: 1, firstName: 1 });
    
    // Group staff by role
    const staffByRole = staff.reduce((acc, member) => {
      if (!acc[member.role]) {
        acc[member.role] = [];
      }
      acc[member.role].push(member);
      return acc;
    }, {});
    
    // Get department statistics
    const stats = {
      totalStaff: staff.length,
      staffByRole: Object.keys(staffByRole).map(role => ({
        role,
        count: staffByRole[role].length
      })),
      operationalEquipment: department.equipment?.filter(eq => eq.status === 'operational').length || 0,
      totalEquipment: department.equipment?.length || 0
    };
    
    res.json({
      success: true,
      data: {
        department: {
          ...department.toObject(),
          stats
        },
        staff: staffByRole
      }
    });
  } catch (error) {
    console.error('Get department error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch department',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// Create new department
const createDepartment = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }
    
    const { name, code } = req.body;
    
    // Check if department with same name or code exists
    const existingDepartment = await Department.findOne({
      $or: [
        { name: { $regex: new RegExp(`^${name}$`, 'i') } },
        { code: code.toUpperCase() }
      ]
    });
    
    if (existingDepartment) {
      return res.status(400).json({
        success: false,
        message: 'Department with this name or code already exists'
      });
    }
    
    const department = new Department({
      ...req.body,
      code: code.toUpperCase()
    });
    
    await department.save();
    
    await department.populate('head', 'firstName lastName specialization');
    
    res.status(201).json({
      success: true,
      message: 'Department created successfully',
      data: { department }
    });
  } catch (error) {
    console.error('Create department error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create department',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// Update department
const updateDepartment = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }
    
    const { id } = req.params;
    const updateData = { ...req.body };
    
    if (updateData.code) {
      updateData.code = updateData.code.toUpperCase();
    }
    
    const department = await Department.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    ).populate('head', 'firstName lastName specialization');
    
    if (!department) {
      return res.status(404).json({
        success: false,
        message: 'Department not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Department updated successfully',
      data: { department }
    });
  } catch (error) {
    console.error('Update department error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update department',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// Delete department (soft delete)
const deleteDepartment = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if department has active staff
    const activeStaff = await User.countDocuments({ 
      department: id, 
      isActive: true 
    });
    
    if (activeStaff > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete department with ${activeStaff} active staff members. Please reassign staff first.`
      });
    }
    
    const department = await Department.findByIdAndUpdate(
      id,
      { isActive: false },
      { new: true }
    );
    
    if (!department) {
      return res.status(404).json({
        success: false,
        message: 'Department not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Department deleted successfully'
    });
  } catch (error) {
    console.error('Delete department error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete department',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// Get department staff
const getDepartmentStaff = async (req, res) => {
  try {
    const { id } = req.params;
    const { page = 1, limit = 10, role, search } = req.query;
    
    const skip = (page - 1) * limit;
    
    // Build query
    let query = { 
      department: id, 
      isActive: true 
    };
    
    if (role) {
      query.role = role;
    }
    
    if (search) {
      query.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { employeeId: { $regex: search, $options: 'i' } }
      ];
    }
    
    const staff = await User.find(query)
      .select('-password')
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ role: 1, firstName: 1 });
    
    const total = await User.countDocuments(query);
    
    res.json({
      success: true,
      data: {
        staff,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / limit),
          totalItems: total,
          itemsPerPage: parseInt(limit)
        }
      }
    });
  } catch (error) {
    console.error('Get department staff error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch department staff',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// Update department equipment
const updateDepartmentEquipment = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }
    
    const { id } = req.params;
    const { equipment } = req.body;
    
    const department = await Department.findByIdAndUpdate(
      id,
      { equipment },
      { new: true, runValidators: true }
    );
    
    if (!department) {
      return res.status(404).json({
        success: false,
        message: 'Department not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Department equipment updated successfully',
      data: { 
        equipment: department.equipment,
        stats: {
          total: department.equipment.length,
          operational: department.equipment.filter(eq => eq.status === 'operational').length,
          maintenance: department.equipment.filter(eq => eq.status === 'maintenance').length,
          outOfOrder: department.equipment.filter(eq => eq.status === 'out-of-order').length
        }
      }
    });
  } catch (error) {
    console.error('Update department equipment error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update department equipment',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

module.exports = {
  getAllDepartments,
  getDepartmentById,
  createDepartment,
  updateDepartment,
  deleteDepartment,
  getDepartmentStaff,
  updateDepartmentEquipment
};
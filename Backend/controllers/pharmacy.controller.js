const Medication = require('../models/medication.model');
const { validationResult } = require('express-validator');

// Get all medications
const getAllMedications = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      search, 
      category, 
      stockStatus,
      expiryStatus,
      isActive = true 
    } = req.query;
    
    const skip = (page - 1) * limit;
    
    // Build query
    let query = { isActive };
    
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { genericName: { $regex: search, $options: 'i' } },
        { brandName: { $regex: search, $options: 'i' } },
        { medicationId: { $regex: search, $options: 'i' } }
      ];
    }
    
    if (category) {
      query.category = category;
    }
    
    // Stock status filter
    if (stockStatus) {
      switch (stockStatus) {
        case 'out-of-stock':
          query['inventory.currentStock'] = 0;
          break;
        case 'low-stock':
          query['inventory.currentStock'] = { $lte: query['inventory.reorderLevel'] };
          break;
        case 'in-stock':
          query['inventory.currentStock'] = { $gt: 0 };
          break;
      }
    }
    
    const medications = await Medication.find(query)
      .populate('createdBy', 'firstName lastName')
      .populate('lastUpdatedBy', 'firstName lastName')
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ name: 1 });
    
    const total = await Medication.countDocuments(query);
    
    res.json({
      success: true,
      data: {
        medications,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / limit),
          totalItems: total,
          itemsPerPage: parseInt(limit)
        }
      }
    });
  } catch (error) {
    console.error('Get medications error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch medications',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// Get medication by ID
const getMedicationById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const medication = await Medication.findById(id)
      .populate('createdBy', 'firstName lastName')
      .populate('lastUpdatedBy', 'firstName lastName');
    
    if (!medication) {
      return res.status(404).json({
        success: false,
        message: 'Medication not found'
      });
    }
    
    res.json({
      success: true,
      data: { medication }
    });
  } catch (error) {
    console.error('Get medication error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch medication',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// Create new medication
const createMedication = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }
    
    const medicationData = {
      ...req.body,
      createdBy: req.user._id
    };
    
    const medication = new Medication(medicationData);
    await medication.save();
    
    await medication.populate('createdBy', 'firstName lastName');
    
    res.status(201).json({
      success: true,
      message: 'Medication created successfully',
      data: { medication }
    });
  } catch (error) {
    console.error('Create medication error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create medication',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// Update medication
const updateMedication = async (req, res) => {
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
    const updateData = {
      ...req.body,
      lastUpdatedBy: req.user._id
    };
    
    const medication = await Medication.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    ).populate([
      { path: 'createdBy', select: 'firstName lastName' },
      { path: 'lastUpdatedBy', select: 'firstName lastName' }
    ]);
    
    if (!medication) {
      return res.status(404).json({
        success: false,
        message: 'Medication not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Medication updated successfully',
      data: { medication }
    });
  } catch (error) {
    console.error('Update medication error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update medication',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// Delete medication (soft delete)
const deleteMedication = async (req, res) => {
  try {
    const { id } = req.params;
    
    const medication = await Medication.findByIdAndUpdate(
      id,
      { 
        isActive: false,
        lastUpdatedBy: req.user._id
      },
      { new: true }
    );
    
    if (!medication) {
      return res.status(404).json({
        success: false,
        message: 'Medication not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Medication deleted successfully'
    });
  } catch (error) {
    console.error('Delete medication error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete medication',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// Update medication stock
const updateMedicationStock = async (req, res) => {
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
    const { quantity, type, reason } = req.body;
    
    const medication = await Medication.findById(id);
    if (!medication) {
      return res.status(404).json({
        success: false,
        message: 'Medication not found'
      });
    }
    
    const oldStock = medication.inventory.currentStock;
    await medication.updateStock(quantity, type);
    
    // Log stock movement (you might want to create a separate StockMovement model)
    console.log(`Stock updated for ${medication.name}: ${oldStock} -> ${medication.inventory.currentStock} (${type} ${quantity}). Reason: ${reason || 'Not specified'}`);
    
    res.json({
      success: true,
      message: 'Stock updated successfully',
      data: {
        medication: {
          _id: medication._id,
          name: medication.name,
          previousStock: oldStock,
          currentStock: medication.inventory.currentStock,
          stockStatus: medication.stockStatus
        }
      }
    });
  } catch (error) {
    console.error('Update stock error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update stock',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// Get inventory report
const getInventoryReport = async (req, res) => {
  try {
    const { status } = req.query;
    
    let matchStage = { isActive: true };
    
    const pipeline = [
      { $match: matchStage },
      {
        $addFields: {
          stockStatus: {
            $cond: {
              if: { $eq: ['$inventory.currentStock', 0] },
              then: 'out-of-stock',
              else: {
                $cond: {
                  if: { $lte: ['$inventory.currentStock', '$inventory.reorderLevel'] },
                  then: 'low-stock',
                  else: {
                    $cond: {
                      if: { $lte: ['$inventory.currentStock', '$inventory.minimumStock'] },
                      then: 'minimum-stock',
                      else: 'in-stock'
                    }
                  }
                }
              }
            }
          }
        }
      }
    ];
    
    if (status) {
      pipeline.push({ $match: { stockStatus: status } });
    }
    
    pipeline.push(
      {
        $group: {
          _id: '$stockStatus',
          count: { $sum: 1 },
          totalValue: { $sum: { $multiply: ['$inventory.currentStock', '$inventory.unitPrice'] } },
          medications: { $push: '$$ROOT' }
        }
      },
      { $sort: { _id: 1 } }
    );
    
    const report = await Medication.aggregate(pipeline);
    
    // Get overall statistics
    const totalMedications = await Medication.countDocuments({ isActive: true });
    const totalValue = await Medication.aggregate([
      { $match: { isActive: true } },
      {
        $group: {
          _id: null,
          totalValue: { $sum: { $multiply: ['$inventory.currentStock', '$inventory.unitPrice'] } }
        }
      }
    ]);
    
    res.json({
      success: true,
      data: {
        summary: {
          totalMedications,
          totalInventoryValue: totalValue[0]?.totalValue || 0
        },
        stockReport: report
      }
    });
  } catch (error) {
    console.error('Get inventory report error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate inventory report',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// Get low stock medications
const getLowStockMedications = async (req, res) => {
  try {
    const lowStockMedications = await Medication.find({
      isActive: true,
      $expr: { $lte: ['$inventory.currentStock', '$inventory.reorderLevel'] }
    }).populate('createdBy', 'firstName lastName');
    
    res.json({
      success: true,
      data: {
        count: lowStockMedications.length,
        medications: lowStockMedications
      }
    });
  } catch (error) {
    console.error('Get low stock medications error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch low stock medications',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// Get expiring medications
const getExpiringMedications = async (req, res) => {
  try {
    const { days = 30 } = req.query;
    
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + parseInt(days));
    
    const expiringMedications = await Medication.find({
      isActive: true,
      'manufacturer.expiryDate': {
        $lte: expiryDate,
        $gte: new Date()
      }
    }).populate('createdBy', 'firstName lastName');
    
    res.json({
      success: true,
      data: {
        count: expiringMedications.length,
        medications: expiringMedications,
        expiryThreshold: `${days} days`
      }
    });
  } catch (error) {
    console.error('Get expiring medications error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch expiring medications',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

module.exports = {
  getAllMedications,
  getMedicationById,
  createMedication,
  updateMedication,
  deleteMedication,
  updateMedicationStock,
  getInventoryReport,
  getLowStockMedications,
  getExpiringMedications
};
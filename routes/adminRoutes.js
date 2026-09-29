const express = require('express');
const router = express.Router();
const verifyToken = require('../middleware/verifyToken');
const {
    getOrgStructure,
    getOrgUnitById,
    createOrgUnit,
    updateOrgUnit,
    deleteOrgUnit,
    mapOrgUnitParent,
    batchMapOrgUnits,
    getOrgHierarchy,
    getOrgTypes,
    createOrgType,
    updateOrgType,
    deleteOrgType,
    bulkImportOrgUnits,
    bulkImportOrgTypes
} = require('../controllers/organizationStructureController');

const {
    getRoles,
    getRoleHierarchy,
    getAvailableSupervisors,
    createRole,
    updateRole,
    deleteRole
} = require('../controllers/roleController');

// Organization Structure Routes
router.get('/org-structure', verifyToken, getOrgStructure);
router.get('/org-structure/hierarchy', verifyToken, getOrgHierarchy);
router.get('/org-structure/types', verifyToken, getOrgTypes);
router.post('/org-structure/bulk-import', verifyToken, bulkImportOrgUnits);
router.post('/org-structure/types/bulk-import', verifyToken, bulkImportOrgTypes);
router.get('/org-structure/:id', verifyToken, getOrgUnitById);
router.post('/org-structure', verifyToken, createOrgUnit);
router.put('/org-structure/:id', verifyToken, updateOrgUnit);
router.put('/org-structure/:id/map-parent', verifyToken, mapOrgUnitParent);
router.post('/org-structure/batch-map', verifyToken, batchMapOrgUnits);
router.delete('/org-structure/:id', verifyToken, deleteOrgUnit);

// Organization Types Routes
router.post('/org-structure/types', verifyToken, createOrgType);
router.put('/org-structure/types/:id', verifyToken, updateOrgType);
router.delete('/org-structure/types/:id', verifyToken, deleteOrgType);

// Role Management Routes
router.get('/roles', getRoles);
router.get('/roles/hierarchy', getRoleHierarchy);
router.get('/roles/available-supervisors', getAvailableSupervisors);
router.post('/roles', verifyToken, createRole);
router.put('/roles/:role_id', verifyToken, updateRole);
router.delete('/roles/:role_id', verifyToken, deleteRole);

module.exports = router;
